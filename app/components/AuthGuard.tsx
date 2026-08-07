"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAccess();
  }, []);

  async function checkAccess() {
    const currentPath = window.location.pathname;

    const publicPaths = [
      "/login",
      "/register",
      "/signup",
      "/banned",
      "/thetrailhead",
      "/thetrailhead/cancel",
    ];

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
    return <p>Checking access...</p>;
  }

  return <>{children}</>;
}