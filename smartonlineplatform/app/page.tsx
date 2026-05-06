import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import type { Role } from "@prisma/client";

export default async function RootPage() {
  const session = await auth();

  // Unauthenticated users see the marketing landing page
  if (!session) redirect("/register");

  const role = session.user.role as Role;
  if (role === "SUPER_ADMIN") redirect("/superadmin/dashboard");
  if (role === "UNIV_ADMIN")  redirect("/admin/dashboard");
  if (role === "TEACHER")     redirect("/teacher/dashboard");
  redirect("/student/dashboard");
}
