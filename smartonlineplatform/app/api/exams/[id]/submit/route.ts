import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const submitSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string(),
      selectedOptionId: z.string().nullable(),
    })
  ),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "STUDENT") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id: examId } = await params;
  const body = await req.json();
  const parsed = submitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const student = await prisma.student.findUnique({ where: { userId: session.user.id } });
  if (!student) return NextResponse.json({ error: "Student not found" }, { status: 400 });

  // Check for already-scored submission (double-submit guard)
  const existing = await prisma.examSubmission.findUnique({
    where: { studentId_examId: { studentId: student.id, examId } },
  });
  if (existing?.score !== null && existing?.score !== undefined) {
    return NextResponse.json({ error: "Already submitted" }, { status: 409 });
  }

  // Fetch correct options for auto-grading
  const questions = await prisma.question.findMany({
    where: { examId },
    include: { options: { where: { isCorrect: true } } },
  });

  let score = 0;
  let maxScore = 0;

  for (const q of questions) {
    maxScore += q.points;
    const correctOptionId = q.options[0]?.id;
    const studentAnswer = parsed.data.answers.find((a) => a.questionId === q.id);
    if (correctOptionId && studentAnswer?.selectedOptionId === correctOptionId) {
      score += q.points;
    }
  }

  let submission;

  if (existing) {
    // Update the pre-created submission from /start
    submission = await prisma.examSubmission.update({
      where: { id: existing.id },
      data: {
        score,
        maxScore,
        answers: {
          create: parsed.data.answers.map((a) => ({
            questionId:      a.questionId,
            selectedOptionId: a.selectedOptionId,
          })),
        },
      },
    });
  } else {
    submission = await prisma.examSubmission.create({
      data: {
        studentId: student.id,
        examId,
        score,
        maxScore,
        answers: {
          create: parsed.data.answers.map((a) => ({
            questionId:      a.questionId,
            selectedOptionId: a.selectedOptionId,
          })),
        },
      },
    });
  }

  return NextResponse.json({
    score,
    maxScore,
    percentage:   maxScore > 0 ? Math.round((score / maxScore) * 100) : 0,
    submissionId: submission.id,
  });
}
