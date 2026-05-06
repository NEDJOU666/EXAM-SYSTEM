import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";
import type { ProctoringEventType, Prisma } from "@prisma/client";

const eventSchema = z.object({
  submissionId: z.string(),
  type:         z.enum([
    "EXAM_STARTED", "FACE_MISSING", "MULTIPLE_FACES",
    "GAZE_AWAY", "TAB_BLUR", "FULLSCREEN_EXIT",
    "COPY_ATTEMPT", "EXAM_SUBMITTED",
  ]),
  metadata: z.record(z.unknown()).optional(),
});

// POST /api/proctoring/events — student records a proctoring event
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "STUDENT") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = eventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { submissionId, type, metadata } = parsed.data;

  // Verify the submission belongs to this student
  const student = await prisma.student.findUnique({ where: { userId: session.user.id } });
  if (!student) return NextResponse.json({ error: "Student profile not found" }, { status: 404 });

  const submission = await prisma.examSubmission.findFirst({
    where: { id: submissionId, studentId: student.id },
  });
  if (!submission) return NextResponse.json({ error: "Submission not found" }, { status: 404 });

  const event = await prisma.proctoringEvent.create({
    data: {
      type: type as ProctoringEventType,
      submissionId,
      metadata: (metadata as Prisma.InputJsonValue) ?? undefined,
    },
  });

  return NextResponse.json(event, { status: 201 });
}
