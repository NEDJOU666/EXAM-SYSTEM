import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { NextResponse } from "next/server";
import type { Role } from "@prisma/client";

// Lightweight middleware auth config — no Prisma, no DB calls.
// JWT is verified cryptographically using AUTH_SECRET.
const { auth } = NextAuth({
  session: { strategy: "jwt" },
  providers: [CredentialsProvider({ credentials: {}, authorize: () => null })],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role: Role }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
      }
      return session;
    },
  },
});

const ROLE_PREFIXES: Record<string, Role> = {
  "/student": "STUDENT",
  "/teacher": "TEACHER",
  "/admin": "ADMIN",
};

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const pathname = nextUrl.pathname;

  const isAuthPage =
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password");

  if (isAuthPage && session) {
    const role = session.user.role as Role;
    const dest =
      role === "ADMIN"
        ? "/admin/dashboard"
        : role === "TEACHER"
        ? "/teacher/dashboard"
        : "/student/dashboard";
    return NextResponse.redirect(new URL(dest, nextUrl));
  }

  for (const [prefix, requiredRole] of Object.entries(ROLE_PREFIXES)) {
    if (pathname.startsWith(prefix)) {
      if (!session) {
        return NextResponse.redirect(new URL("/login", nextUrl));
      }
      const userRole = session.user.role as Role;
      if (userRole !== requiredRole && userRole !== "ADMIN") {
        const dest =
          userRole === "TEACHER" ? "/teacher/dashboard" : "/student/dashboard";
        return NextResponse.redirect(new URL(dest, nextUrl));
      }
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/student/:path*",
    "/teacher/:path*",
    "/admin/:path*",
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
  ],
};
