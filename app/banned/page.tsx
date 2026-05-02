"use client";

import { supabase } from "../lib/supabase";

export default function BannedPage() {
  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#100B08] px-4 text-white">
      <div className="max-w-lg rounded-2xl border border-red-400/30 bg-black/50 p-6 text-center shadow-xl">
        <p className="text-xs uppercase tracking-[0.3em] text-red-300">
          Access Restricted
        </p>

        <h1 className="mt-3 font-cinzel text-3xl font-bold text-white">
          Account Access Disabled
        </h1>

        <p className="mt-4 text-sm leading-6 text-white/70">
          Your access to the Peach State Off-Road and Overlanding member app has been restricted. Please contact an organizer if you believe this was a mistake.
        </p>

        <button
          onClick={handleLogout}
          className="mt-6 rounded-lg bg-[#F28C52] px-5 py-3 font-semibold text-black hover:bg-[#C96A2C]"
        >
          Log Out
        </button>
      </div>
    </main>
  );
}