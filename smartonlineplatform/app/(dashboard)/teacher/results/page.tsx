import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export const metadata = { title: "Results" };

export default async function TeacherResultsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const teacher = await prisma.teacher.findUnique({
    where: { userId: session.user.id },
  });
  if (!teacher) redirect("/teacher/dashboard");

  const submissions = await prisma.examSubmission.findMany({
    where: { exam: { teacherId: teacher.id } },
    include: {
      exam: { select: { title: true } },
      student: { include: { user: { select: { name: true, email: true } } } },
    },
    orderBy: { submittedAt: "desc" },
  });

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">Exam Results</h1>

      {submissions.length === 0 && (
        <p className="text-center text-gray-400 py-16">No submissions yet.</p>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Submissions ({submissions.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-gray-500">
                  <th className="px-6 py-3 font-medium">Student</th>
                  <th className="px-6 py-3 font-medium">Exam</th>
                  <th className="px-6 py-3 font-medium">Score</th>
                  <th className="px-6 py-3 font-medium">%</th>
                  <th className="px-6 py-3 font-medium">Result</th>
                  <th className="px-6 py-3 font-medium">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {submissions.map((s) => {
                  const pct = s.maxScore
                    ? Math.round(((s.score ?? 0) / s.maxScore) * 100)
                    : 0;
                  const passed = pct >= 50;
                  return (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3">
                        <p className="font-medium text-gray-800">
                          {s.student.user.name}
                        </p>
                        <p className="text-xs text-gray-400">{s.student.user.email}</p>
                      </td>
                      <td className="px-6 py-3 text-gray-700">{s.exam.title}</td>
                      <td className="px-6 py-3 text-gray-700">
                        {s.score ?? 0} / {s.maxScore ?? 0}
                      </td>
                      <td className="px-6 py-3 font-semibold text-gray-800">{pct}%</td>
                      <td className="px-6 py-3">
                        <Badge variant={passed ? "success" : "destructive"}>
                          {passed ? "Passed" : "Failed"}
                        </Badge>
                      </td>
                      <td className="px-6 py-3 text-gray-500">
                        {format(new Date(s.submittedAt), "PP")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
