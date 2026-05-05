import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export const metadata = { title: "My Results" };

export default async function StudentResultsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const student = await prisma.student.findUnique({
    where: { userId: session.user.id },
  });
  if (!student) redirect("/student/dashboard");

  const submissions = await prisma.examSubmission.findMany({
    where: { studentId: student.id },
    include: { exam: { select: { title: true, duration: true, scheduledAt: true } } },
    orderBy: { submittedAt: "desc" },
  });

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">My Results</h1>

      {submissions.length === 0 && (
        <p className="text-center text-gray-400 py-16">No results yet. Take an exam first!</p>
      )}

      {submissions.map((s) => {
        const pct = s.maxScore ? Math.round(((s.score ?? 0) / s.maxScore) * 100) : 0;
        const passed = pct >= 50;
        return (
          <Card key={s.id}>
            <CardContent className="flex items-center justify-between py-5">
              <div className="space-y-1">
                <p className="font-semibold text-gray-800">{s.exam.title}</p>
                <p className="text-sm text-gray-500">
                  Submitted {format(new Date(s.submittedAt), "PPP")}
                </p>
              </div>
              <div className="text-right space-y-1">
                <p className="text-2xl font-bold text-gray-800">{pct}%</p>
                <p className="text-xs text-gray-400">
                  {s.score ?? 0} / {s.maxScore ?? 0} pts
                </p>
                <Badge variant={passed ? "success" : "destructive"}>
                  {passed ? "Passed" : "Failed"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
