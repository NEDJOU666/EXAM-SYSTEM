import prisma from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { format } from "date-fns";

export const dynamic = "force-dynamic";
export const metadata = { title: "Super Admin Dashboard — SmartExam" };

export default async function SuperAdminDashboard() {
  const [
    univCount,
    pendingCount,
    userCount,
    examCount,
    recentRegistrations,
  ] = await Promise.all([
    prisma.university.count({ where: { status: "ACTIVE" } }),
    prisma.universityRegistration.count({ where: { status: "PENDING" } }),
    prisma.user.count(),
    prisma.exam.count(),
    prisma.universityRegistration.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Platform Overview</h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Active Universities", value: univCount, color: "text-sky-600" },
          { label: "Pending Registrations", value: pendingCount, color: "text-amber-600" },
          { label: "Total Users", value: userCount, color: "text-green-600" },
          { label: "Total Exams", value: examCount, color: "text-purple-600" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-4 text-center">
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-sm text-gray-500 mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {recentRegistrations.length > 0 && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-700">Pending Registrations</h2>
              <Link href="/superadmin/registrations" className="text-xs text-sky-600 hover:underline">
                View all →
              </Link>
            </div>
            <ul className="divide-y divide-gray-100">
              {recentRegistrations.map((r) => (
                <li key={r.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{r.name}</p>
                    <p className="text-xs text-gray-400">{r.email} · {r.country ?? "—"}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">{format(new Date(r.createdAt), "PP")}</span>
                    <Link
                      href={`/superadmin/registrations/${r.id}`}
                      className="text-xs text-sky-600 hover:underline"
                    >
                      Review
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
