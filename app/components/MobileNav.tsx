"use client";

import { useEffect, useState } from "react";
import LogoutButton from "./LogoutButton";
import { supabase } from "../lib/supabase";

const adminEmails = ["dariussaunders24@gmail.com"];

const facebookUrl = "https://www.facebook.com/groups/peachstateoffroad";
const instagramUrl = "https://www.instagram.com/peachstate_offroad_overlanding/";

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
    { href: "/builds", label: "My Builds" },
    { href: "/events", label: "Events" },
    { href: "/past-events", label: "Past Events" },
    { href: "/gallery", label: "Gallery" },
     { href: "/resources", label: "Resources" },
    { href: "/members", label: "Members" },
    { href: "/vendors", label: "Vendors" },
    
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

            {/* SOCIAL ICONS */}
            <div className="mt-2 rounded-lg border border-white/10 bg-black/60 p-4">
              <p className="mb-3 text-xs uppercase tracking-[0.25em] text-[#F28C52]/80">
                Follow Us
              </p>

              <div className="flex items-center gap-3">
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-blue-400 transition hover:bg-blue-500/20"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                    <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.84c0-2.52 1.49-3.91 3.77-3.91 1.09 0 2.23.2 2.23.2v2.47h-1.26c-1.24 0-1.63.78-1.63 1.57v1.89h2.78l-.44 2.91h-2.34V22C18.34 21.24 22 17.08 22 12.06z" />
                  </svg>
                  <span className="text-sm font-semibold">Facebook</span>
                </a>

                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-pink-500/30 bg-gradient-to-br from-pink-500/10 via-orange-500/10 to-yellow-500/10 px-4 py-3 text-pink-400 transition hover:from-pink-500/20 hover:via-orange-500/20 hover:to-yellow-500/20"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                  >
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                  <span className="text-sm font-semibold">Instagram</span>
                </a>
              </div>
            </div>

            <div className="pt-2">
              <LogoutButton />
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}