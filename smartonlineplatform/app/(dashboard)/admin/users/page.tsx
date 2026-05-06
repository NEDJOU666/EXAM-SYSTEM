import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import AdminUserActions from "./AdminUserActions";
import CreateUserForm from "./CreateUserForm";

export const metadata = { title: "User Management" };

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session || session.user.role !== "UNIV_ADMIN") redirect("/login");

  const univAdmin = await prisma.univAdmin.findUnique({
    where:   { userId: session.user.id },
    include: { univ: true },
  });
  if (!univAdmin) redirect("/login");

  const univId = univAdmin.univId;

  const users = await prisma.user.findMany({
    where: {
      OR: [
        { student: { univId } },
        { teacher: { univId } },
      ],
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      student: { select: { univ: { select: { name: true } } } },
      teacher: { select: { univ: { select: { name: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
        <p className="text-sm text-gray-500 mt-1">{univAdmin.univ.name}</p>
      </div>

      <CreateUserForm />

      <Card>
        <CardHeader>
          <CardTitle>Users ({users.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-gray-500">
                  <th className="px-6 py-3 font-medium">User</th>
                  <th className="px-6 py-3 font-medium">Role</th>
                  <th className="px-6 py-3 font-medium">Joined</th>
                  <th className="px-6 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3">
                      <p className="font-medium text-gray-800">{u.name}</p>
                      <p className="text-xs text-gray-400">{u.email}</p>
                    </td>
                    <td className="px-6 py-3">
                      <Badge
                        variant={
                          u.role === "TEACHER" ? "success" : "default"
                        }
                      >
                        {u.role}
                      </Badge>
                    </td>
                    <td className="px-6 py-3 text-gray-500">
                      {format(new Date(u.createdAt), "PP")}
                    </td>
                    <td className="px-6 py-3">
                      <AdminUserActions userId={u.id} currentRole={u.role} />
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-gray-400">
                      No users yet. Create one above.
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
