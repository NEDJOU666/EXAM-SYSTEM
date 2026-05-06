import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "SUPER_ADMIN") redirect("/");

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar userName={session.user.name ?? "Super Admin"} userRole="SUPER_ADMIN" />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar role="SUPER_ADMIN" />
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">{children}</main>
      </div>
    </div>
  );
}
