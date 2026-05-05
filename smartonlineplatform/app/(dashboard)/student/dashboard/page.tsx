import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PerformanceChart from "@/components/charts/PerformanceChart";
import Link from "next/link";
import { format } from "date-fns";

export const metadata = { title: "Student Dashboard" };

function getStatus(scheduledAt: Date) {
  const now = new Date();
  const d = new Date(scheduledAt);
  if (d > now) return { label: "Upcoming", variant: "default" as const };
  return { label: "Past", variant: "secondary" as const };
}

export default async function StudentDashboard() {
  const session = await auth();
  if (!session) redirect("/login");

  const student = await prisma.student.findUnique({
    where: { userId: session.user.id },
    include: { univ: true },
  });

  if (!student) {
    return (
      <div className="text-center text-gray-500 mt-20">
        Student profile not found. Please contact your administrator.
      </div>
    );
  }

  const [submissions, upcomingExams] = await Promise.all([
    prisma.examSubmission.findMany({
      where: { studentId: student.id },
      include: { exam: { select: { title: true, scheduledAt: true } } },
      orderBy: { submittedAt: "desc" },
    }),
    prisma.exam.findMany({
      where: { univId: student.univId, status: "PUBLISHED" },
      orderBy: { scheduledAt: "asc" },
      take: 5,
    }),
  ]);

  const chartData = submissions.slice(0, 10).reverse().map((s) => ({
    name: s.exam.title.slice(0, 10),
    score: s.maxScore ? Math.round(((s.score ?? 0) / s.maxScore) * 100) : 0,
  }));

  const avgScore =
    submissions.length > 0
      ? Math.round(
          submissions.reduce(
            (acc, s) =>
              acc + (s.maxScore ? ((s.score ?? 0) / s.maxScore) * 100 : 0),
            0
          ) / submissions.length
        )
      : 0;

  const passed = submissions.filter(
    (s) => s.maxScore && (s.score ?? 0) / s.maxScore >= 0.5
  ).length;

  const nextExam = upcomingExams.find((e) => new Date(e.scheduledAt) >= new Date());

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">
        Welcome back, {session.user.name}
      </h1>
      <p className="text-sm text-gray-500">{student.univ.name}</p>

      {nextExam && (
        <div className="bg-sky-500 text-white rounded-xl p-5">
          <p className="text-sm font-medium opacity-80">Next Exam</p>
          <p className="text-xl font-bold mt-1">{nextExam.title}</p>
          <p className="text-sm mt-1 opacity-90">
            {format(new Date(nextExam.scheduledAt), "PPP")} · {nextExam.duration} min
          </p>
          <Link
            href={`/student/exams/${nextExam.id}`}
            className="mt-3 inline-block text-sm bg-white text-sky-600 font-semibold rounded-lg px-4 py-1.5 hover:bg-sky-50 transition-colors"
          >
            View Details →
          </Link>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Exams", value: upcomingExams.length },
          { label: "Average Score", value: `${avgScore}%` },
          { label: "Passed", value: `${passed} / ${submissions.length}` },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-4 text-center">
              <p className="text-3xl font-bold text-sky-600">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <PerformanceChart data={chartData} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Exams</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {upcomingExams.length === 0 ? (
            <p className="text-center text-gray-400 py-8 text-sm">No exams scheduled.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {upcomingExams.map((exam) => {
                const status = getStatus(exam.scheduledAt);
                return (
                  <li key={exam.id} className="flex items-center justify-between px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-800">{exam.title}</p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(exam.scheduledAt), "PPP")} · {exam.duration} min
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={status.variant}>{status.label}</Badge>
                      <Link
                        href={`/student/exams/${exam.id}`}
                        className="text-sm text-sky-600 hover:underline"
                      >
                        View →
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
