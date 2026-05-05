import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import type { Role } from "@prisma/client";

export default async function RootPage() {
  const session = await auth();

  if (!session) redirect("/login");

  const role = session.user.role as Role;
  if (role === "ADMIN") redirect("/admin/dashboard");
  if (role === "TEACHER") redirect("/teacher/dashboard");
  redirect("/student/dashboard");
}
