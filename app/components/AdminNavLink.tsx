"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const adminEmails = ["dariussaunders24@gmail.com"];

export default function AdminNavLink({ className = "" }: { className?: string }) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function checkAdmin() {
      const { data } = await supabase.auth.getUser();

      if (
        data.user &&
        adminEmails.includes((data.user.email || "").toLowerCase().trim())
      ) {
        setIsAdmin(true);
      }
    }

    checkAdmin();
  }, []);

  if (!isAdmin) return null;

  return (
    <a href="/admin" className={className}>
      Admin
    </a>
  );
}