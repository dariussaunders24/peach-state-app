"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendResetEmail(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const redirectTo = `${window.location.origin}/reset-password`;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Password reset email sent. Check your inbox.");
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#5C2D18_0%,#100B08_45%,#050505_100%)] px-4 py-10 text-white">
      <div className="mx-auto max-w-md rounded-2xl border border-white/10 bg-black/40 p-6 shadow-xl">
        <h1 className="text-2xl font-bold">Reset Password</h1>

        <p className="mt-2 text-sm text-gray-300">
          Enter your account email and we’ll send you a reset link.
        </p>

        <form onSubmit={sendResetEmail} className="mt-6 space-y-4">
          <input
            type="email"
            required
            placeholder="Email address"
            className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-white placeholder:text-gray-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#F28C52] px-4 py-3 font-semibold text-black disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send Reset Email"}
          </button>
        </form>

        {message && <p className="mt-4 text-sm text-gray-300">{message}</p>}

        <Link href="/login" className="mt-6 block text-sm text-[#F28C52]">
          Back to login
        </Link>
      </div>
    </main>
  );
}