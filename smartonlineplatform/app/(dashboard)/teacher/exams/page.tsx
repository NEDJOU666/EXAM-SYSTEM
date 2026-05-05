import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { format } from "date-fns";
import TeacherExamActions from "./TeacherExamActions";

export const metadata = { title: "My Exams" };

export default async function TeacherExamsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const teacher = await prisma.teacher.findUnique({
    where: { userId: session.user.id },
  });
  if (!teacher) redirect("/teacher/dashboard");

  const exams = await prisma.exam.findMany({
    where: { teacherId: teacher.id },
    include: { _count: { select: { questions: true, submissions: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">My Exams</h1>
        <Link
          href="/teacher/exams/new"
          className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-lg text-sm transition-colors"
        >
          + New Exam
        </Link>
      </div>

      {exams.length === 0 && (
        <p className="text-center text-gray-400 py-16">
          No exams yet.{" "}
          <Link href="/teacher/exams/new" className="text-sky-600 hover:underline">
            Create your first →
          </Link>
        </p>
      )}

      {exams.map((exam) => (
        <Card key={exam.id}>
          <CardContent className="flex items-center justify-between py-5">
            <div className="space-y-1">
              <p className="font-semibold text-gray-800">{exam.title}</p>
              <p className="text-sm text-gray-500">
                {format(new Date(exam.scheduledAt), "PPP")} · {exam.duration} min ·{" "}
                {exam._count.questions} questions · {exam._count.submissions} submissions
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge
                variant={
                  exam.status === "PUBLISHED"
                    ? "success"
                    : exam.status === "DRAFT"
                    ? "secondary"
                    : "outline"
                }
              >
                {exam.status}
              </Badge>
              <Link
                href={`/teacher/exams/${exam.id}/edit`}
                className="text-sm text-sky-600 hover:underline"
              >
                Edit
              </Link>
              <TeacherExamActions examId={exam.id} status={exam.status} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
