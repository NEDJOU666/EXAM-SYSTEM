'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    setError('');
    setSuccess('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed');
      } else {
        setSuccess('Login successful!');
        console.log('Logged in user:', data.user);
        // Optional: redirect after login
        // window.location.href = '/dashboard';
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-200 flex items-center justify-center text-black">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm"
      >
        <h2 className="text-2xl font-semibold text-center mb-6">Login</h2>

        {error && <p className="text-red-600 text-center mb-3">{error}</p>}
        {success && <p className="text-green-600 text-center mb-3">{success}</p>}

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Email:</label>
          <input
            type="email"
            value={email}
            placeholder="you@example.com"
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 rounded border border-gray-400 text-black bg-white focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Password:</label>
          <input
            type="password"
            value={password}
            placeholder=""
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 rounded border border-gray-400 text-black bg-white focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-sky-400 text-white font-bold rounded hover:bg-sky-500 transition"
        >
          Log In
        </button>

        <div className="text-center mt-4 text-sm">
          <p>
            Don’t have an account?{' '}
            <Link href="/signup" className="text-blue-600 underline">
              Create one
            </Link>
          </p>
          <p>
            <Link href="/forgot-password" className="text-blue-600 underline">
              Forgot password?
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
