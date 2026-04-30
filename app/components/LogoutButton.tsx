"use client";

import { supabase } from "../lib/supabase";

export default function LogoutButton() {
  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <button
      onClick={handleLogout}
      className="rounded-lg border border-[#F28C52] px-3 py-1 text-sm text-[#F28C52] hover:bg-[#F28C52] hover:text-black transition"
    >
      Logout
    </button>
  );
}