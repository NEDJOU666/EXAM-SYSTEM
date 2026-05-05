import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export const metadata = { title: "Profile" };

export default async function StudentProfilePage() {
  const session = await auth();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      student: { include: { univ: true } },
    },
  });
  if (!user) redirect("/login");

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">Profile</h1>

      <Card>
        <CardHeader>
          <CardTitle>Account Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {[
            { label: "Name", value: user.name },
            { label: "Email", value: user.email },
            { label: "Role", value: <Badge>{user.role}</Badge> },
            {
              label: "University",
              value: user.student?.univ.name ?? "—",
            },
            {
              label: "Member since",
              value: format(new Date(user.createdAt), "PPP"),
            },
          ].map((row) => (
            <div key={row.label} className="flex justify-between border-b border-gray-100 pb-2">
              <span className="text-gray-500">{row.label}</span>
              <span className="font-medium text-gray-800">{row.value}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
