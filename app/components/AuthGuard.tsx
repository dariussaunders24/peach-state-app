"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAccess();
  }, []);

  async function checkAccess() {
    const currentPath = window.location.pathname;
    const publicPaths = ["/login", "/register", "/signup", "/banned"];

    if (publicPaths.includes(currentPath)) {
      setLoading(false);
      return;
    }

    const { data } = await supabase.auth.getUser();

    if (!data.user) {
      window.location.href = "/login";
      return;
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("name, vehicle, is_banned")
      .eq("user_id", data.user.id)
      .maybeSingle();

    if (error) {
      console.error("Profile check error:", error.message);
    }

    if (profile?.is_banned) {
      window.location.href = "/banned";
      return;
    }

    const profileIncomplete =
      !profile || !profile.name?.trim() || !profile.vehicle?.trim();

    if (profileIncomplete && currentPath !== "/profiles/setup") {
      window.location.href = `/profiles/setup?redirect=${encodeURIComponent(
        currentPath
      )}`;
      return;
    }

    if (!profileIncomplete && currentPath === "/profiles/setup") {
      window.location.href = "/";
      return;
    }

    setLoading(false);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#100B08] text-white">
        <div className="rounded-2xl border border-[#F28C52]/30 bg-black/40 p-6 text-center shadow-xl">
          <p className="text-sm text-white/70">Checking access...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}