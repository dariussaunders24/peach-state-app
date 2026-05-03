"use client";

import { useEffect, useState } from "react";
import LogoutButton from "./LogoutButton";
import { supabase } from "../lib/supabase";

const adminEmails = ["dariussaunders24@gmail.com"];

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdmin();
  }, []);

  async function checkAdmin() {
    const { data } = await supabase.auth.getUser();

    if (
      data.user &&
      adminEmails.includes((data.user.email || "").toLowerCase().trim())
    ) {
      setIsAdmin(true);
    }
  }

  const links = [
    { href: "/", label: "Home" },
    ...(isAdmin ? [{ href: "/admin", label: "Admin" }] : []),
    { href: "/profiles", label: "My Profile" },
    { href: "/events", label: "Events" },
    { href: "/gallery", label: "Gallery" },
    { href: "/members", label: "Members" },
    { href: "/vendors", label: "Vendors" },
    { href: "/faq", label: "FAQ" },
    { href: "/store", label: "Store" },
  ];

  return (
    <div className="relative z-[9999] md:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="rounded-lg border border-[#F28C52]/40 px-3 py-2 text-sm font-semibold text-[#F28C52]"
      >
        Menu
      </button>

      {open && (
        <div className="fixed left-0 right-0 top-[88px] z-[9999] border-b border-[#F28C52]/30 bg-black/95 px-4 py-4 shadow-2xl backdrop-blur">
          <nav className="flex flex-col gap-3 text-base font-medium text-gray-300">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg border border-white/10 bg-black/60 px-4 py-3 hover:border-[#F28C52] hover:text-[#F28C52]"
              >
                {link.label}
              </a>
            ))}

            <div className="pt-2">
              <LogoutButton />
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}