import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (session.user.role === "STUDENT") {
    const student = await prisma.student.findUnique({
      where: { userId: session.user.id },
    });
    if (!student) return NextResponse.json([]);

    const submissions = await prisma.examSubmission.findMany({
      where: { studentId: student.id },
      include: {
        exam: { select: { title: true, scheduledAt: true, duration: true } },
      },
      orderBy: { submittedAt: "desc" },
    });

    return NextResponse.json(submissions);
  }

  if (session.user.role === "TEACHER") {
    const teacher = await prisma.teacher.findUnique({
      where: { userId: session.user.id },
    });
    if (!teacher) return NextResponse.json([]);

    const submissions = await prisma.examSubmission.findMany({
      where: { exam: { teacherId: teacher.id } },
      include: {
        exam: { select: { title: true } },
        student: { include: { user: { select: { name: true, email: true } } } },
      },
      orderBy: { submittedAt: "desc" },
    });

    return NextResponse.json(submissions);
  }

  // Admin: all results
  const submissions = await prisma.examSubmission.findMany({
    include: {
      exam: { select: { title: true } },
      student: { include: { user: { select: { name: true } } } },
    },
    orderBy: { submittedAt: "desc" },
    take: 200,
  });

  return NextResponse.json(submissions);
}
