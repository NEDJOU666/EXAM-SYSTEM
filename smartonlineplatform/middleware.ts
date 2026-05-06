import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { NextResponse } from "next/server";
import type { Role } from "@prisma/client";

const { auth } = NextAuth({
  session: { strategy: "jwt" },
  providers: [CredentialsProvider({ credentials: {}, authorize: () => null })],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role: Role }).role;
        token.tenantSlug = (user as { tenantSlug?: string }).tenantSlug ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.tenantSlug = token.tenantSlug as string | null;
      }
      return session;
    },
  },
});

// Routes that require SUPER_ADMIN only
const SUPER_ADMIN_PREFIXES = ["/superadmin"];

// Routes scoped to a tenant
const ROLE_PREFIXES: Record<string, Role[]> = {
  "/student": ["STUDENT"],
  "/teacher": ["TEACHER"],
  "/admin":   ["UNIV_ADMIN"],
};

function extractSubdomain(host: string): string | null {
  // Remove port
  const hostname = host.split(":")[0];
  const parts = hostname.split(".");

  // localhost or single-part hostnames → no subdomain
  if (parts.length <= 1 || hostname === "localhost") return null;

  // *.localhost (e.g. ict.localhost) → "ict"
  if (parts[parts.length - 1] === "localhost") {
    return parts.length >= 2 ? parts[0] : null;
  }

  // Standard domain: e.g. ict.smartexam.app → ["ict","smartexam","app"]
  if (parts.length >= 3) {
    const sub = parts[0];
    if (sub === "www" || sub === "app") return null; // treat as root
    return sub;
  }

  return null;
}

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const pathname = nextUrl.pathname;
  const host = req.headers.get("host") ?? "";

  const subdomain = extractSubdomain(host);

  // Forward tenant slug to pages via request header
  const requestHeaders = new Headers(req.headers);
  if (subdomain) {
    requestHeaders.set("x-tenant-slug", subdomain);
  } else {
    requestHeaders.delete("x-tenant-slug");
  }

  const next = () =>
    NextResponse.next({ request: { headers: requestHeaders } });

  const isAuthPage =
    pathname.startsWith("/login") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password");

  // ── Super admin routes ─────────────────────────────────────────────────────
  for (const prefix of SUPER_ADMIN_PREFIXES) {
    if (pathname.startsWith(prefix)) {
      if (!session) return NextResponse.redirect(new URL("/login", nextUrl));
      if (session.user.role !== "SUPER_ADMIN") {
        return NextResponse.redirect(new URL("/", nextUrl));
      }
      return next();
    }
  }

  // ── Redirect logged-in SUPER_ADMIN away from auth pages ───────────────────
  if (isAuthPage && session?.user.role === "SUPER_ADMIN") {
    return NextResponse.redirect(new URL("/superadmin/dashboard", nextUrl));
  }

  // ── Redirect other logged-in users away from auth pages ───────────────────
  if (isAuthPage && session) {
    const role = session.user.role as Role;
    const dest =
      role === "UNIV_ADMIN" ? "/admin/dashboard" :
      role === "TEACHER"    ? "/teacher/dashboard" :
                              "/student/dashboard";
    return NextResponse.redirect(new URL(dest, nextUrl));
  }

  // ── Tenant-scoped dashboard routes ────────────────────────────────────────
  for (const [prefix, allowedRoles] of Object.entries(ROLE_PREFIXES)) {
    if (pathname.startsWith(prefix)) {
      if (!session) return NextResponse.redirect(new URL("/login", nextUrl));

      const userRole = session.user.role as Role;
      if (userRole === "SUPER_ADMIN") return next(); // super admin can see all

      if (!allowedRoles.includes(userRole)) {
        const dest =
          userRole === "UNIV_ADMIN" ? "/admin/dashboard" :
          userRole === "TEACHER"    ? "/teacher/dashboard" :
                                      "/student/dashboard";
        return NextResponse.redirect(new URL(dest, nextUrl));
      }

      return next();
    }
  }

  return next();
});

export const config = {
  matcher: [
    "/superadmin/:path*",
    "/student/:path*",
    "/teacher/:path*",
    "/admin/:path*",
    "/login",
    "/forgot-password",
    "/reset-password",
  ],
};
