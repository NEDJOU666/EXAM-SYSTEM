"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { signIn } from "@/lib/auth";
import prisma from "@/lib/prisma";
import resend from "@/lib/resend";
import { AuthError } from "next-auth";
import crypto from "crypto";
import type { Role } from "@prisma/client";

// ─── Signup ───────────────────────────────────────────────────────────────────

const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["STUDENT", "TEACHER"]),
  univId: z.string().min(1),
});

export async function signupAction(data: z.infer<typeof signupSchema>) {
  const parsed = signupSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Invalid input." };
  }

  const { name, email, password, role, univId } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "Email already in use." };

  const hashed = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashed,
      role: role as Role,
    },
  });

  if (role === "STUDENT") {
    await prisma.student.create({
      data: { userId: user.id, univId },
    });
  } else {
    await prisma.teacher.create({
      data: { userId: user.id, univId },
    });
  }

  return { success: true };
}

// ─── Login ────────────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function loginAction(data: z.infer<typeof loginSchema>) {
  const parsed = loginSchema.safeParse(data);
  if (!parsed.success) return { error: "Invalid input." };

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
    return { success: true };
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: "Invalid email or password." };
    }
    throw err;
  }
}

// ─── Forgot Password ──────────────────────────────────────────────────────────

export async function forgotPasswordAction(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  // Always return success to avoid user enumeration
  if (!user) return { success: true };

  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.verificationToken.upsert({
    where: { token },
    create: { identifier: email, token, expires },
    update: { expires },
  });

  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

  await resend.emails.send({
    from: "noreply@smartexam.app",
    to: email,
    subject: "Reset your password",
    html: `
      <p>Hi ${user.name},</p>
      <p>Click the link below to reset your password. It expires in 1 hour.</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>If you didn't request this, you can safely ignore this email.</p>
    `,
  });

  return { success: true };
}

// ─── Reset Password ───────────────────────────────────────────────────────────

const resetSchema = z.object({
  token: z.string(),
  password: z.string().min(6),
});

export async function resetPasswordAction(data: z.infer<typeof resetSchema>) {
  const parsed = resetSchema.safeParse(data);
  if (!parsed.success) return { error: "Invalid input." };

  const { token, password } = parsed.data;

  const record = await prisma.verificationToken.findUnique({ where: { token } });
  if (!record || record.expires < new Date()) {
    return { error: "Token is invalid or expired." };
  }

  const hashed = await bcrypt.hash(password, 12);
  await prisma.user.update({
    where: { email: record.identifier },
    data: { password: hashed },
  });

  await prisma.verificationToken.delete({ where: { token } });

  return { success: true };
}
