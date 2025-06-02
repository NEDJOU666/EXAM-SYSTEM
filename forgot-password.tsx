"use client";
import React, { useState } from "react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || "Check your email for a reset link.");
      } else {
        setError(data.error || "Something went wrong.");
      }
    } catch (err) {
      setError("Server error.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-24 p-8 border border-gray-200 rounded-lg shadow bg-white">
      <h2 className="text-2xl font-semibold text-center text-black mb-2">
        Forgot Your Password?
      </h2>
      <p className="text-sm text-center text-gray-600 mb-6">
        Enter your email to reset your password
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="p-3 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          type="submit"
          className="p-3 text-base bg-green-500 text-white rounded-md hover:bg-blue-600 transition"
        >
          Send Reset Link
        </button>
      </form>

      {message && <p className="text-green-600 text-center mt-4">{message}</p>}
      {error && <p className="text-red-500 text-center mt-4">{error}</p>}
    </div>
  );
};

export default ForgotPassword;
