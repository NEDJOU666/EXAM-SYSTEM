"use server";

import { z } from "zod";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import type { ExamStatus } from "@prisma/client";

const questionSchema = z.object({
  text: z.string().min(1),
  points: z.number().int().min(1).default(1),
  order: z.number().int().default(0),
  options: z
    .array(
      z.object({
        text: z.string().min(1),
        isCorrect: z.boolean(),
      })
    )
    .min(2),
});

const examSchema = z.object({
  title:             z.string().min(2),
  description:       z.string().optional(),
  duration:          z.number().int().min(1),
  rules:             z.string().optional(),
  scheduledAt:       z.string(),
  proctoringEnabled: z.boolean().optional(),
  questions:         z.array(questionSchema).min(1),
});

export async function createExamAction(data: z.infer<typeof examSchema>) {
  const session = await auth();
  if (!session || session.user.role === "STUDENT") return { error: "Forbidden" };

  const parsed = examSchema.safeParse(data);
  if (!parsed.success) return { error: "Invalid input." };

  const teacher = await prisma.teacher.findUnique({
    where: { userId: session.user.id },
  });
  if (!teacher) return { error: "Teacher profile not found." };

  const exam = await prisma.exam.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      duration: parsed.data.duration,
      rules: parsed.data.rules,
      scheduledAt:       new Date(parsed.data.scheduledAt),
      proctoringEnabled: parsed.data.proctoringEnabled ?? false,
      teacherId: teacher.id,
      univId:    teacher.univId,
      questions: {
        create: parsed.data.questions.map((q) => ({
          text: q.text,
          points: q.points,
          order: q.order,
          options: { create: q.options },
        })),
      },
    },
  });

  return { success: true, examId: exam.id };
}

export async function updateExamStatusAction(examId: string, status: ExamStatus) {
  const session = await auth();
  if (!session || session.user.role === "STUDENT") return { error: "Forbidden" };

  await prisma.exam.update({ where: { id: examId }, data: { status } });
  return { success: true };
}

export async function deleteExamAction(examId: string) {
  const session = await auth();
  if (!session || session.user.role === "STUDENT") return { error: "Forbidden" };

  await prisma.exam.update({ where: { id: examId }, data: { status: "ARCHIVED" } });
  return { success: true };
}

export async function getExamForEdit(examId: string) {
  const session = await auth();
  if (!session || session.user.role === "STUDENT") return null;

  return prisma.exam.findUnique({
    where: { id: examId },
    include: {
      questions: {
        orderBy: { order: "asc" },
        include: { options: true },
      },
    },
  });
}
