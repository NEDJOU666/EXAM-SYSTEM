"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Role } from "@prisma/client";

interface Props {
  userId: string;
  currentRole: Role;
}

export default function AdminUserActions({ userId, currentRole }: Props) {
  const router = useRouter();
  const [role, setRole] = useState<Role>(currentRole);
  const [loading, setLoading] = useState(false);

  async function handleRoleChange(newRole: Role) {
    setLoading(true);
    const res = await fetch("/api/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: userId, role: newRole }),
    });
    setLoading(false);
    if (res.ok) {
      setRole(newRole);
      toast.success("Role updated.");
      router.refresh();
    } else {
      toast.error("Failed to update role.");
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this user permanently?")) return;
    setLoading(true);
    const res = await fetch("/api/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: userId }),
    });
    setLoading(false);
    if (res.ok) {
      toast.success("User deleted.");
      router.refresh();
    } else {
      toast.error("Failed to delete user.");
    }
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={role}
        onChange={(e) => handleRoleChange(e.target.value as Role)}
        disabled={loading}
        className="text-xs border border-gray-300 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-sky-400"
      >
        <option value="STUDENT">STUDENT</option>
        <option value="TEACHER">TEACHER</option>
      </select>
      <button
        onClick={handleDelete}
        disabled={loading}
        className="text-xs text-red-400 hover:text-red-600 hover:underline"
      >
        Delete
      </button>
    </div>
  );
}
