"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type University = { id: string; name: string; domain: string };

export default function AdminUniversitiesPage() {
  const [unis, setUnis] = useState<University[]>([]);
  const [form, setForm] = useState({ name: "", domain: "" });
  const [loading, setLoading] = useState(false);

  async function load() {
    const data = await fetch("/api/universities").then((r) => r.json());
    setUnis(data);
  }

  useEffect(() => { load(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/universities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (res.ok) {
      toast.success("University created.");
      setForm({ name: "", domain: "" });
      load();
    } else {
      const data = await res.json();
      toast.error(data.error ?? "Failed to create.");
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Universities</h1>

      <Card>
        <CardHeader>
          <CardTitle>Add University</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="flex gap-3">
            <input
              type="text"
              placeholder="University name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
            <input
              type="text"
              placeholder="Domain (e.g. ictuniversity.edu.cm)"
              value={form.domain}
              onChange={(e) => setForm((f) => ({ ...f, domain: e.target.value }))}
              required
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
            <Button type="submit" disabled={loading}>
              {loading ? "Adding…" : "Add"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Universities ({unis.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {unis.length === 0 ? (
            <p className="text-center text-gray-400 py-8 text-sm">No universities yet.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {unis.map((u) => (
                <li key={u.id} className="flex items-center justify-between px-6 py-4">
                  <div>
                    <p className="font-medium text-gray-800">{u.name}</p>
                    <p className="text-sm text-gray-400">{u.domain}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
