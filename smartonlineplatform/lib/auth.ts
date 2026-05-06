import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { z } from "zod";
import prisma from "./prisma";
import type { Role } from "@prisma/client";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) return null;

        // Resolve tenant slug for non-super-admin users
        let tenantSlug: string | null = null;
        if (user.role !== "SUPER_ADMIN") {
          const student   = await prisma.student.findUnique({ where: { userId: user.id }, include: { univ: true } });
          const teacher   = await prisma.teacher.findUnique({ where: { userId: user.id }, include: { univ: true } });
          const univAdmin = await prisma.univAdmin.findUnique({ where: { userId: user.id }, include: { univ: true } });
          tenantSlug = student?.univ.slug ?? teacher?.univ.slug ?? univAdmin?.univ.slug ?? null;
        }

        return {
          id:          user.id,
          email:       user.email,
          name:        user.name,
          role:        user.role,
          tenantSlug,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id         = user.id;
        token.role       = (user as { role: Role }).role;
        token.tenantSlug = (user as { tenantSlug?: string | null }).tenantSlug ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id         = token.id as string;
        session.user.role       = token.role as Role;
        session.user.tenantSlug = token.tenantSlug as string | null;
      }
      return session;
    },
  },
});
