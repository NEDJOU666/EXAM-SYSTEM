"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Role } from "@prisma/client";

const studentLinks = [
  { href: "/student/dashboard", label: "Dashboard" },
  { href: "/student/exams", label: "Exams" },
  { href: "/student/results", label: "My Results" },
  { href: "/student/profile", label: "Profile" },
];

const teacherLinks = [
  { href: "/teacher/dashboard", label: "Dashboard" },
  { href: "/teacher/exams", label: "My Exams" },
  { href: "/teacher/results", label: "Results" },
];

const adminLinks = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/universities", label: "Universities" },
];

const linksByRole: Record<Role, typeof studentLinks> = {
  STUDENT: studentLinks,
  TEACHER: teacherLinks,
  ADMIN: adminLinks,
};

export default function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  const links = linksByRole[role] ?? studentLinks;

  return (
    <aside className="w-56 shrink-0 bg-gray-50 border-r border-gray-200 flex flex-col py-6">
      <nav className="flex flex-col gap-1 px-3">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              pathname === link.href || pathname.startsWith(link.href + "/")
                ? "bg-sky-50 text-sky-700"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
