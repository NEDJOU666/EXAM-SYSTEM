"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import type { Role } from "@prisma/client";

const roleBadge: Record<Role, { label: string; variant: "default" | "success" | "warning" }> = {
  STUDENT: { label: "Student", variant: "default" },
  TEACHER: { label: "Teacher", variant: "success" },
  ADMIN: { label: "Admin", variant: "warning" },
};

interface NavbarProps {
  userName: string;
  userRole: Role;
}

export default function Navbar({ userName, userRole }: NavbarProps) {
  const badge = roleBadge[userRole];

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
      <Link href="/" className="text-lg font-bold text-sky-600">
        SmartExam
      </Link>

      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600">{userName}</span>
        <Badge variant={badge.variant}>{badge.label}</Badge>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-sm text-gray-500 hover:text-red-500 transition-colors"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
