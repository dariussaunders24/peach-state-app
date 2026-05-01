"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "../lib/supabase";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkAuth();
  }, [pathname]);

  async function checkAuth() {
    if (pathname === "/login") {
      setChecking(false);
      return;
    }

    const { data } = await supabase.auth.getUser();

    if (!data.user) {
      window.location.href = "/login";
      return;
    }

    setChecking(false);
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#100B08] text-gray-300">
        Loading...
      </div>
    );
  }

  return <>{children}</>;
}