import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = { title: "Admin Dashboard" };

export default async function AdminDashboard() {
  const session = await auth();
  if (!session || session.user.role !== "UNIV_ADMIN") redirect("/login");

  const univAdmin = await prisma.univAdmin.findUnique({
    where:   { userId: session.user.id },
    include: { univ: true },
  });
  if (!univAdmin) redirect("/login");

  const univId = univAdmin.univId;

  const [studentCount, teacherCount, examCount, submissionCount] = await Promise.all([
    prisma.student.count({ where: { univId } }),
    prisma.teacher.count({ where: { univId } }),
    prisma.exam.count({ where: { univId } }),
    prisma.examSubmission.count({ where: { exam: { univId } } }),
  ]);

  const recentUsers = await prisma.user.findMany({
    where: {
      OR: [
        { student: { univId } },
        { teacher: { univId } },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">{univAdmin.univ.name}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Students", value: studentCount },
          { label: "Teachers", value: teacherCount },
          { label: "Exams", value: examCount },
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
        <CardContent className="pt-4">
          <h2 className="font-semibold text-gray-700 mb-3">Recent Users</h2>
          <ul className="divide-y divide-gray-100">
            {recentUsers.map((u) => (
              <li key={u.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-gray-800 text-sm">{u.name}</p>
                  <p className="text-xs text-gray-400">{u.email}</p>
                </div>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                  {u.role}
                </span>
              </li>
            ))}
            {recentUsers.length === 0 && (
              <li className="py-6 text-center text-gray-400 text-sm">No users yet.</li>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
