import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { format } from "date-fns";

export const metadata = { title: "Teacher Dashboard" };

export default async function TeacherDashboard() {
  const session = await auth();
  if (!session) redirect("/login");

  const teacher = await prisma.teacher.findUnique({
    where: { userId: session.user.id },
    include: { univ: true },
  });

  if (!teacher) {
    return (
      <div className="text-center text-gray-500 mt-20">
        Teacher profile not found. Please contact your administrator.
      </div>
    );
  }

  const [exams, submissionCount] = await Promise.all([
    prisma.exam.findMany({
      where: { teacherId: teacher.id },
      include: { _count: { select: { questions: true, submissions: true } } },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.examSubmission.count({
      where: { exam: { teacherId: teacher.id } },
    }),
  ]);

  const published = exams.filter((e) => e.status === "PUBLISHED").length;
  const drafts = exams.filter((e) => e.status === "DRAFT").length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Welcome, {session.user.name}
          </h1>
          <p className="text-sm text-gray-500 mt-1">{teacher.univ.name}</p>
        </div>
        <Link
          href="/teacher/exams/new"
          className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-lg text-sm transition-colors"
        >
          + New Exam
        </Link>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Exams", value: exams.length },
          { label: "Published", value: published },
          { label: "Drafts", value: drafts },
          { label: "Submissions", value: submissionCount },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-4 text-center">
              <p className="text-3xl font-bold text-sky-600">{s.value}</p>
              <p className="text-sm text-gray-500 mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Exams</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {exams.length === 0 ? (
            <p className="text-center text-gray-400 py-8 text-sm">
              No exams yet.{" "}
              <Link href="/teacher/exams/new" className="text-sky-600 hover:underline">
                Create one →
              </Link>
            </p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {exams.map((exam) => (
                <li key={exam.id} className="flex items-center justify-between px-6 py-4">
                  <div>
                    <p className="font-medium text-gray-800">{exam.title}</p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(exam.scheduledAt), "PPP")} ·{" "}
                      {exam._count.questions} questions ·{" "}
                      {exam._count.submissions} submissions
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
                      Edit →
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
