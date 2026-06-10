"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [successMessage, setSuccessMessage] = useState("");

  async function handleRegister() {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    setSuccessMessage(
  "SUCCESS! Sign up complete. You can now click Login using the same email and password you just entered."
);
  }

  async function signIn() {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      window.location.href = "/";
    }
  }

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-[#F28C52]/30 bg-black/40 p-6">
      <h1 className="text-3xl font-bold text-[#F28C52]">Member Login</h1>

     <p className="mt-2 text-md text-gray-300">
Sign in or create your free Peach State account to access member features, RSVP for rides, and connect with the community.
  <span className="mt-2 block font-bold text-md text-[#F28C52]">
First time here?
Enter the email address and password you want to use, then click “Sign Up” to create your account.  </span>
</p>

      <div className="mt-6 space-y-4">
        <input
          className="w-full rounded-lg border border-gray-700 bg-white p-3 text-black"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full rounded-lg border border-gray-700 bg-white p-3 text-black"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <p className="text-xs text-gray-400">
  
</p>

        <Link
          href="/forgot-password"
          className="block text-right text-sm text-[#F28C52] underline underline-offset-4"
        >
          Forgot your password?
        </Link>

        {successMessage && (
  <div className="rounded-lg border border-green-400/40 bg-green-500/10 p-3 text-sm text-green-200">
    {successMessage}
  </div>
)}

        <div className="flex gap-3">
          <button
            onClick={signIn}
            className="flex-1 rounded-lg bg-[#F28C52] px-4 py-3 font-semibold text-black"
          >
            Login
          </button>

          <button
            onClick={handleRegister}
            className="flex-1 rounded-lg border border-[#F28C52] px-4 py-3 font-semibold text-[#F28C52]"
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}