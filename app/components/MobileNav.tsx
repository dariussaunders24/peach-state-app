"use client";

import { useState } from "react";
import LogoutButton from "./LogoutButton";

export default function MobileNav() {
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/", label: "Home" },
    { href: "/profiles", label: "My Profile" },
    { href: "/events", label: "Events" },
    { href: "/gallery", label: "Gallery" },
    { href: "/store", label: "Store" },
    { href: "/vendors", label: "Vendors" },
    { href: "/faq", label: "FAQ" },
  ];

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="rounded-lg border border-[#F28C52]/40 px-3 py-2 text-sm font-semibold text-[#F28C52]"
      >
        Menu
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-[88px] z-50 border-b border-[#F28C52]/30 bg-black/95 px-4 py-4 shadow-xl">
          <nav className="flex flex-col gap-3 text-base font-medium text-gray-300">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg border border-white/10 bg-black/40 px-4 py-3 hover:border-[#F28C52] hover:text-[#F28C52]"
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