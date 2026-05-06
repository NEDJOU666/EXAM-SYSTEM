import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export const metadata = { title: "Proctoring Reports" };

const eventLabel: Record<string, string> = {
  FACE_MISSING:     "Face missing",
  MULTIPLE_FACES:   "Multiple faces",
  GAZE_AWAY:        "Gaze away",
  TAB_BLUR:         "Tab switched",
  FULLSCREEN_EXIT:  "Left fullscreen",
  COPY_ATTEMPT:     "Copy/paste",
};

export default async function ProctoringPage() {
  const session = await auth();
  if (!session || session.user.role !== "UNIV_ADMIN") redirect("/login");

  const univAdmin = await prisma.univAdmin.findUnique({
    where:   { userId: session.user.id },
    include: { univ: true },
  });
  if (!univAdmin) redirect("/login");

  const univId = univAdmin.univId;

  // Find submissions for this university's exams that have proctoring events
  const submissions = await prisma.examSubmission.findMany({
    where: {
      exam: { univId, proctoringEnabled: true },
      proctoringEvents: { some: {} },
    },
    include: {
      exam:    { select: { title: true, id: true } },
      student: { include: { user: { select: { name: true, email: true } } } },
      proctoringEvents: {
        orderBy: { timestamp: "asc" },
      },
    },
    orderBy: { submittedAt: "desc" },
    take: 50,
  });

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">Proctoring Reports</h1>
      <p className="text-sm text-gray-500">
        Showing flagged submissions for proctored exams.
      </p>

      {submissions.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-gray-400">
            No proctoring events recorded yet.
          </CardContent>
        </Card>
      )}

      {submissions.map((sub) => {
        const flags = sub.proctoringEvents.filter(
          (e) => !["EXAM_STARTED", "EXAM_SUBMITTED"].includes(e.type)
        );
        const riskLevel = flags.length === 0 ? "clean" : flags.length < 3 ? "low" : "high";

        return (
          <Card key={sub.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">{sub.student.user.name}</CardTitle>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {sub.student.user.email} · {sub.exam.title}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    variant={
                      riskLevel === "high" ? "destructive" :
                      riskLevel === "low"  ? "warning" : "success"
                    }
                  >
                    {riskLevel === "high" ? `${flags.length} flags` :
                     riskLevel === "low"  ? `${flags.length} flag${flags.length !== 1 ? "s" : ""}` :
                     "Clean"}
                  </Badge>
                  <span className="text-xs text-gray-400">
                    {sub.score !== null ? `${Math.round(((sub.score ?? 0) / (sub.maxScore ?? 1)) * 100)}%` : "—"}
                  </span>
                </div>
              </div>
            </CardHeader>

            {flags.length > 0 && (
              <CardContent className="pt-0">
                <div className="border border-gray-100 rounded-lg overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="px-4 py-2 text-left text-gray-500 font-medium">Event</th>
                        <th className="px-4 py-2 text-left text-gray-500 font-medium">Time</th>
                        <th className="px-4 py-2 text-left text-gray-500 font-medium">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {flags.map((e) => (
                        <tr key={e.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2 font-medium text-red-600">
                            {eventLabel[e.type] ?? e.type}
                          </td>
                          <td className="px-4 py-2 text-gray-500">
                            {format(new Date(e.timestamp), "p")}
                          </td>
                          <td className="px-4 py-2 text-gray-400">
                            {e.metadata
                              ? JSON.stringify(e.metadata)
                              : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
