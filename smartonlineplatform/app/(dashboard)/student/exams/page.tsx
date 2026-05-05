import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { format } from "date-fns";

export const metadata = { title: "Exams" };

export default async function StudentExamsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const student = await prisma.student.findUnique({
    where: { userId: session.user.id },
  });
  if (!student) redirect("/student/dashboard");

  const [exams, submissions] = await Promise.all([
    prisma.exam.findMany({
      where: { univId: student.univId, status: "PUBLISHED" },
      orderBy: { scheduledAt: "asc" },
    }),
    prisma.examSubmission.findMany({
      where: { studentId: student.id },
      select: { examId: true, score: true, maxScore: true },
    }),
  ]);

  const submittedMap = new Map(submissions.map((s) => [s.examId, s]));

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">All Exams</h1>

      {exams.length === 0 && (
        <p className="text-center text-gray-400 py-16">No exams available yet.</p>
      )}

      {exams.map((exam) => {
        const submitted = submittedMap.get(exam.id);
        const now = new Date();
        const scheduled = new Date(exam.scheduledAt);
        const isUpcoming = scheduled > now;

        return (
          <Card key={exam.id}>
            <CardContent className="flex items-center justify-between py-5">
              <div className="space-y-1">
                <p className="font-semibold text-gray-800">{exam.title}</p>
                <p className="text-sm text-gray-500">
                  {format(scheduled, "PPP")} · {exam.duration} min
                </p>
                {exam.description && (
                  <p className="text-sm text-gray-400 line-clamp-1">{exam.description}</p>
                )}
              </div>

              <div className="flex items-center gap-3">
                {submitted ? (
                  <>
                    <Badge variant="success">
                      {submitted.maxScore
                        ? `${Math.round(((submitted.score ?? 0) / submitted.maxScore) * 100)}%`
                        : "Done"}
                    </Badge>
                    <span className="text-sm text-gray-400">Submitted</span>
                  </>
                ) : isUpcoming ? (
                  <>
                    <Badge variant="default">Upcoming</Badge>
                    <Link
                      href={`/student/exams/${exam.id}`}
                      className="text-sm text-sky-600 hover:underline font-medium"
                    >
                      View →
                    </Link>
                  </>
                ) : (
                  <>
                    <Badge variant="warning">Missed</Badge>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
