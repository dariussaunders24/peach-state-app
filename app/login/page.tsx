"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function signUp() {
    const { error } = await supabase.auth.signUp({ email, password });
    alert(error ? error.message : "Check your email to confirm your account.");
  }

  async function signIn() {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
  alert(error.message);
} else {
  window.location.href = "/";
};
  }

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-[#F28C52]/30 bg-black/40 p-6">
      <h1 className="text-3xl font-bold text-[#F28C52]">Member Login</h1>
      <p className="mt-2 text-gray-300">
        Sign in or create an account to access Peach State member features.
      </p>

      <div className="mt-6 space-y-4">
        <input
          className="w-full rounded-lg border border-gray-700 bg-white p-3 text-black"
          placeholder="Email"
          type="email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full rounded-lg border border-gray-700 bg-white p-3 text-black"
          placeholder="Password"
          type="password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="flex gap-3">
          <button
            onClick={signIn}
            className="flex-1 rounded-lg bg-[#F28C52] px-4 py-3 font-semibold text-black"
          >
            Login
          </button>

          <button
            onClick={signUp}
            className="flex-1 rounded-lg border border-[#F28C52] px-4 py-3 font-semibold text-[#F28C52]"
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
}