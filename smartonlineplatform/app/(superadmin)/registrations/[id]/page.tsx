"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import type { UniversityRegistration } from "@prisma/client";

export default function ReviewRegistrationPage() {
  const { id } = useParams<{ id: string }>();
  const router  = useRouter();

  const [reg,     setReg]     = useState<UniversityRegistration | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting,  setActing]  = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [result,  setResult]  = useState<{ tempPassword?: string; adminEmail?: string } | null>(null);
  const [error,   setError]   = useState("");

  useEffect(() => {
    fetch(`/api/registrations/${id}`)
      .then((r) => r.json())
      .then((data) => { setReg(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  async function act(action: "approve" | "reject") {
    setActing(true);
    setError("");
    const res = await fetch(`/api/registrations/${id}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({
        action,
        rejectionReason: action === "reject" ? rejectionReason : undefined,
      }),
    });
    setActing(false);
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      return;
    }
    if (action === "approve") {
      setResult({ tempPassword: data.tempPassword, adminEmail: data.adminEmail });
      setReg((r) => r ? { ...r, status: "APPROVED" } : r);
    } else {
      router.push("/superadmin/registrations");
    }
  }

  if (loading) return <div className="p-10 text-center text-gray-400">Loading…</div>;
  if (!reg)    return <div className="p-10 text-center text-red-500">Registration not found.</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-sm text-gray-400 hover:text-gray-600">
          ← Back
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Review Application</h1>
      </div>

      {result && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5">
          <p className="font-semibold text-green-800 mb-2">University approved!</p>
          <p className="text-sm text-green-700">
            Admin credentials for <strong>{result.adminEmail}</strong>:
          </p>
          <p className="font-mono text-sm bg-white border border-green-200 rounded px-3 py-2 mt-2">
            Temporary password: <strong>{result.tempPassword}</strong>
          </p>
          <p className="text-xs text-green-600 mt-2">
            Share these credentials with the contact person. They should change their password on first login.
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {reg.name}
            <Badge
              variant={
                reg.status === "PENDING"  ? "warning" :
                reg.status === "APPROVED" ? "success" : "destructive"
              }
            >
              {reg.status}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <Row label="Domain"      value={reg.domain} />
          <Row label="Portal Slug" value={`${reg.slug}.smartexam.app`} />
          <Row label="Contact"     value={reg.contactName} />
          <Row label="Email"       value={reg.email} />
          <Row label="Phone"       value={reg.phone ?? "—"} />
          <Row label="Country"     value={reg.country ?? "—"} />
          <Row label="Applied"     value={format(new Date(reg.createdAt), "PPpp")} />
          {reg.rejectionReason && (
            <Row label="Rejection reason" value={reg.rejectionReason} />
          )}
        </CardContent>
      </Card>

      {reg.status === "PENDING" && !result && (
        <Card>
          <CardContent className="pt-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rejection reason (required only when rejecting)
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                placeholder="e.g. Domain could not be verified."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => act("approve")}
                disabled={acting}
                className="flex-1 bg-green-500 hover:bg-green-600"
              >
                {acting ? "Processing…" : "Approve & Create Portal"}
              </Button>
              <Button
                onClick={() => act("reject")}
                disabled={acting || !rejectionReason.trim()}
                variant="destructive"
                className="flex-1"
              >
                Reject
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-4">
      <span className="w-36 text-gray-500 shrink-0">{label}</span>
      <span className="text-gray-800">{value}</span>
    </div>
  );
}
