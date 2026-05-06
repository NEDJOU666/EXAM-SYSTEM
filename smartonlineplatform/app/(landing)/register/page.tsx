"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterUniversityPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "", domain: "", slug: "", contactName: "", email: "", phone: "", country: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function set(field: string, value: string) {
    setForm((f) => {
      const next = { ...f, [field]: value };
      // Auto-derive slug from name
      if (field === "name") {
        next.slug = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      }
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/registrations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setLoading(false);
    if (res.ok) {
      router.push("/register/pending");
    } else {
      const data = await res.json();
      setError(data.error ?? "Something went wrong.");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-xl mx-auto">
        <div className="mb-8 text-center">
          <Link href="/" className="text-sky-600 font-bold text-xl">SmartExam</Link>
          <h1 className="text-2xl font-bold text-gray-800 mt-4">Register your University</h1>
          <p className="text-sm text-gray-500 mt-1">
            Submit an application. Our team will review and activate your portal within 24 hours.
          </p>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4 text-center">
            {error}
          </p>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">University Name *</label>
                <input type="text" value={form.name} onChange={(e) => set("name", e.target.value)}
                  required placeholder="ICT University"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Portal Slug *
                  <span className="text-gray-400 font-normal ml-1">(subdomain)</span>
                </label>
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-sky-400">
                  <input type="text" value={form.slug}
                    onChange={(e) => set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                    required placeholder="ict"
                    className="flex-1 px-3 py-2 text-sm outline-none" />
                  <span className="px-3 py-2 text-xs text-gray-400 bg-gray-50 border-l border-gray-300">
                    .smartexam.app
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Official Domain *</label>
                <input type="text" value={form.domain} onChange={(e) => set("domain", e.target.value)}
                  required placeholder="ictuniversity.edu.cm"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person *</label>
                <input type="text" value={form.contactName} onChange={(e) => set("contactName", e.target.value)}
                  required placeholder="Full name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email *</label>
                <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)}
                  required placeholder="admin@ictuniversity.edu.cm"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)}
                  placeholder="+237 6XX XXX XXX"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <input type="text" value={form.country} onChange={(e) => set("country", e.target.value)}
                  placeholder="Cameroon"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors text-sm mt-2">
              {loading ? "Submitting…" : "Submit Application"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-400 mt-4">
          Already registered?{" "}
          <Link href="/login" className="text-sky-600 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
