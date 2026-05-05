import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const createSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  duration: z.number().int().min(1),
  rules: z.string().optional(),
  scheduledAt: z.string().datetime(),
  questions: z
    .array(
      z.object({
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
      })
    )
    .optional(),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  let where = {};

  if (session.user.role === "STUDENT") {
    const student = await prisma.student.findUnique({
      where: { userId: session.user.id },
    });
    if (!student) return NextResponse.json([]);
    where = {
      univId: student.univId,
      status: "PUBLISHED",
    };
  } else if (session.user.role === "TEACHER") {
    const teacher = await prisma.teacher.findUnique({
      where: { userId: session.user.id },
    });
    if (!teacher) return NextResponse.json([]);
    where = {
      teacherId: teacher.id,
      ...(status ? { status } : {}),
    };
  }

  const exams = await prisma.exam.findMany({
    where,
    include: {
      teacher: { include: { user: { select: { name: true } } } },
      _count: { select: { questions: true, submissions: true } },
    },
    orderBy: { scheduledAt: "asc" },
  });

  return NextResponse.json(exams);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role === "STUDENT") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const teacher = await prisma.teacher.findUnique({
    where: { userId: session.user.id },
  });
  if (!teacher) return NextResponse.json({ error: "Teacher profile not found" }, { status: 400 });

  const { questions, ...examData } = parsed.data;

  const exam = await prisma.exam.create({
    data: {
      ...examData,
      scheduledAt: new Date(examData.scheduledAt),
      teacherId: teacher.id,
      univId: teacher.univId,
      questions: questions?.length
        ? {
            create: questions.map((q) => ({
              text: q.text,
              points: q.points,
              order: q.order,
              options: { create: q.options },
            })),
          }
        : undefined,
    },
    include: { questions: { include: { options: true } } },
  });

  return NextResponse.json(exam, { status: 201 });
}
