import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// POST /api/exams/[id]/start — creates (or returns) an empty submission to anchor proctoring events
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "STUDENT") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id: examId } = await params;

  const student = await prisma.student.findUnique({ where: { userId: session.user.id } });
  if (!student) return NextResponse.json({ error: "Student not found" }, { status: 400 });

  const exam = await prisma.exam.findUnique({ where: { id: examId } });
  if (!exam || exam.status !== "PUBLISHED") {
    return NextResponse.json({ error: "Exam not available" }, { status: 404 });
  }

  // Upsert: if already started return existing submission ID
  const existing = await prisma.examSubmission.findUnique({
    where: { studentId_examId: { studentId: student.id, examId } },
  });

  if (existing) {
    return NextResponse.json({
      submissionId:      existing.id,
      proctoringEnabled: exam.proctoringEnabled,
    });
  }

  const submission = await prisma.examSubmission.create({
    data: { studentId: student.id, examId },
  });

  return NextResponse.json({
    submissionId:      submission.id,
    proctoringEnabled: exam.proctoringEnabled,
  });
}
