import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { format } from "date-fns";

export const metadata = { title: "Exam Instructions" };

export default async function ExamInstructionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const { id } = await params;

  const student = await prisma.student.findUnique({
    where: { userId: session.user.id },
  });

  const [exam, submission] = await Promise.all([
    prisma.exam.findUnique({
      where: { id },
      include: {
        teacher: { include: { user: { select: { name: true } } } },
        _count: { select: { questions: true } },
      },
    }),
    student
      ? prisma.examSubmission.findUnique({
          where: { studentId_examId: { studentId: student.id, examId: id } },
        })
      : null,
  ]);

  if (!exam) notFound();

  const alreadySubmitted = !!submission;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">{exam.title}</h1>
        <p className="text-sm text-gray-500 mt-1">
          By {exam.teacher.user.name} · {format(new Date(exam.scheduledAt), "PPP")}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Duration", value: `${exam.duration} min` },
          { label: "Questions", value: exam._count.questions },
          { label: "Status", value: exam.status },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="py-4 text-center">
              <p className="text-xl font-bold text-sky-600">{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {exam.description && (
        <Card>
          <CardHeader>
            <CardTitle>About this Exam</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 text-sm leading-relaxed">{exam.description}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-gray-600 list-disc list-inside">
            <li>Ensure you have a stable internet connection before starting.</li>
            <li>The timer starts as soon as you click &ldquo;Start Exam&rdquo;.</li>
            <li>Do not refresh or close the browser during the exam.</li>
            <li>Each question shows your selected answer — review before submitting.</li>
            <li>Once you submit, your answers are final.</li>
            {exam.rules && <li className="font-medium text-gray-800">{exam.rules}</li>}
          </ul>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Link href="/student/exams" className="text-sm text-gray-500 hover:underline">
          ← Back to exams
        </Link>

        {alreadySubmitted ? (
          <div className="flex items-center gap-3">
            <Badge variant="success">Submitted</Badge>
            <Link
              href="/student/results"
              className="text-sm text-sky-600 hover:underline"
            >
              View Results →
            </Link>
          </div>
        ) : (
          <Link
            href={`/student/exams/${id}/take`}
            className="px-6 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-lg text-sm transition-colors"
          >
            Start Exam →
          </Link>
        )}
      </div>
    </div>
  );
}
