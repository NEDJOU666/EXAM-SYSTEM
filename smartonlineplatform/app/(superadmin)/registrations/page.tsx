import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { format } from "date-fns";
import type { RegistrationStatus } from "@prisma/client";

export const dynamic = "force-dynamic";
export const metadata = { title: "University Registrations — SmartExam" };

const statusVariant: Record<RegistrationStatus, "default" | "success" | "warning" | "destructive"> = {
  PENDING:  "warning",
  APPROVED: "success",
  REJECTED: "destructive",
};

export default async function RegistrationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const filter = (status as RegistrationStatus | undefined) ?? undefined;

  const registrations = await prisma.universityRegistration.findMany({
    where: filter ? { status: filter } : {},
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">University Registrations</h1>
        <div className="flex gap-2 text-sm">
          {["", "PENDING", "APPROVED", "REJECTED"].map((s) => (
            <Link
              key={s}
              href={s ? `?status=${s}` : "/superadmin/registrations"}
              className={`px-3 py-1 rounded-full border transition-colors ${
                (filter ?? "") === s
                  ? "bg-sky-500 text-white border-sky-500"
                  : "border-gray-300 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {s || "All"}
            </Link>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Applications ({registrations.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-gray-500">
                  <th className="px-6 py-3 font-medium">University</th>
                  <th className="px-6 py-3 font-medium">Contact</th>
                  <th className="px-6 py-3 font-medium">Slug</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Applied</th>
                  <th className="px-6 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {registrations.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3">
                      <p className="font-medium text-gray-800">{r.name}</p>
                      <p className="text-xs text-gray-400">{r.domain}</p>
                    </td>
                    <td className="px-6 py-3">
                      <p className="text-gray-700">{r.contactName}</p>
                      <p className="text-xs text-gray-400">{r.email}</p>
                    </td>
                    <td className="px-6 py-3 font-mono text-gray-600">{r.slug}.smartexam.app</td>
                    <td className="px-6 py-3">
                      <Badge variant={statusVariant[r.status]}>{r.status}</Badge>
                    </td>
                    <td className="px-6 py-3 text-gray-500">
                      {format(new Date(r.createdAt), "PP")}
                    </td>
                    <td className="px-6 py-3">
                      {r.status === "PENDING" && (
                        <Link
                          href={`/superadmin/registrations/${r.id}`}
                          className="text-sky-600 hover:underline text-xs"
                        >
                          Review →
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
                {registrations.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-gray-400">
                      No registrations found.
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
