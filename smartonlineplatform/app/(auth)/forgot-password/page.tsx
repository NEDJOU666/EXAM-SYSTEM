"use client";

import { useState } from "react";
import Link from "next/link";
import { forgotPasswordAction } from "@/lib/actions/auth.actions";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await forgotPasswordAction(email);
    setLoading(false);
    setSent(true);
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
          Forgot Password?
        </h1>
        <p className="text-sm text-center text-gray-500 mb-6">
          Enter your email and we&apos;ll send a reset link.
        </p>

        {sent ? (
          <div className="text-center space-y-3">
            <p className="text-green-600 font-medium">Check your email!</p>
            <p className="text-sm text-gray-500">
              If an account exists for {email}, a reset link has been sent.
            </p>
            <Link href="/login" className="text-sky-600 hover:underline text-sm">
              Back to login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors text-sm"
            >
              {loading ? "Sending…" : "Send Reset Link"}
            </button>
            <p className="text-center text-sm">
              <Link href="/login" className="text-sky-600 hover:underline">
                Back to login
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
