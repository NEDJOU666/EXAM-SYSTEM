import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import type { UniversityStatus } from "@prisma/client";

export const dynamic = "force-dynamic";
export const metadata = { title: "Universities — SmartExam" };

const statusVariant: Record<UniversityStatus, "default" | "success" | "destructive"> = {
  PENDING:   "default",
  ACTIVE:    "success",
  SUSPENDED: "destructive",
};

export default async function UniversitiesPage() {
  const universities = await prisma.university.findMany({
    include: {
      _count: {
        select: { students: true, teachers: true, exams: true },
      },
      univAdmin: {
        include: { user: { select: { name: true, email: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">Universities ({universities.length})</h1>

      <Card>
        <CardHeader>
          <CardTitle>All Tenants</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-gray-500">
                  <th className="px-6 py-3 font-medium">University</th>
                  <th className="px-6 py-3 font-medium">Portal</th>
                  <th className="px-6 py-3 font-medium">Admin</th>
                  <th className="px-6 py-3 font-medium">Stats</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {universities.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3">
                      <p className="font-medium text-gray-800">{u.name}</p>
                      <p className="text-xs text-gray-400">{u.domain}</p>
                    </td>
                    <td className="px-6 py-3 font-mono text-gray-600 text-xs">
                      {u.slug}.smartexam.app
                    </td>
                    <td className="px-6 py-3">
                      {u.univAdmin ? (
                        <>
                          <p className="text-gray-700">{u.univAdmin.user.name}</p>
                          <p className="text-xs text-gray-400">{u.univAdmin.user.email}</p>
                        </>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-gray-600">
                      <span className="mr-3">{u._count.students} students</span>
                      <span className="mr-3">{u._count.teachers} teachers</span>
                      <span>{u._count.exams} exams</span>
                    </td>
                    <td className="px-6 py-3">
                      <Badge variant={statusVariant[u.status]}>{u.status}</Badge>
                    </td>
                    <td className="px-6 py-3 text-gray-500">
                      {format(new Date(u.createdAt), "PP")}
                    </td>
                  </tr>
                ))}
                {universities.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-gray-400">
                      No universities yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
