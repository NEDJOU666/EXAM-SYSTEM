import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const exam = await prisma.exam.findUnique({
    where: { id },
    include: {
      questions: {
        orderBy: { order: "asc" },
        include: {
          options: {
            // Hide isCorrect from students
            select: {
              id: true,
              text: true,
              isCorrect: session.user.role !== "STUDENT",
            },
          },
        },
      },
      teacher: { include: { user: { select: { name: true } } } },
      univ: { select: { name: true } },
    },
  });

  if (!exam) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(exam);
}

const updateSchema = z.object({
  title: z.string().min(2).optional(),
  description: z.string().optional(),
  duration: z.number().int().min(1).optional(),
  rules: z.string().optional(),
  scheduledAt: z.string().datetime().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role === "STUDENT") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const exam = await prisma.exam.findUnique({ where: { id } });
  if (!exam) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.exam.update({
    where: { id },
    data: {
      ...parsed.data,
      ...(parsed.data.scheduledAt
        ? { scheduledAt: new Date(parsed.data.scheduledAt) }
        : {}),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role === "STUDENT") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  await prisma.exam.update({
    where: { id },
    data: { status: "ARCHIVED" },
  });

  return NextResponse.json({ success: true });
}
