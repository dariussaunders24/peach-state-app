"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function updatePassword(e: React.FormEvent) {
    e.preventDefault();

    setMessage("");

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Password updated successfully.");

    setTimeout(() => {
      window.location.href = "/login";
    }, 1500);
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#5C2D18_0%,#100B08_45%,#050505_100%)] px-4 py-10 text-white">
      <div className="mx-auto max-w-md rounded-2xl border border-white/10 bg-black/40 p-6 shadow-xl">
        <h1 className="text-2xl font-bold">Create New Password</h1>

        <p className="mt-2 text-sm text-gray-300">
          Enter your new password below.
        </p>

        <form onSubmit={updatePassword} className="mt-6 space-y-4">
          <input
            type="password"
            required
            placeholder="New password"
            className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-white placeholder:text-gray-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <input
            type="password"
            required
            placeholder="Confirm password"
            className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-white placeholder:text-gray-500"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#F28C52] px-4 py-3 font-semibold text-black disabled:opacity-60"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>

        {message && <p className="mt-4 text-sm text-gray-300">{message}</p>}
      </div>
    </main>
  );
}