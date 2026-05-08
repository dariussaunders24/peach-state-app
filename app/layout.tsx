"use client";

import AuthGuard from "./components/AuthGuard";
import "./globals.css";
import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import MobileNav from "./components/MobileNav";
import LogoutButton from "./components/LogoutButton";

const adminEmails = ["dariussaunders24@gmail.com"];

const facebookUrl = "https://www.facebook.com/groups/peachstateoffroad";
const instagramUrl = "https://www.instagram.com/peachstate_offroad_overlanding/";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
    { href: "/gallery", label: "Gallery" },
    { href: "/members", label: "Members" },
    { href: "/vendors", label: "Vendors" },
    { href: "/faq", label: "FAQ" },
    { href: "/store", label: "Store" },
  ];

  return (
    <html lang="en">
      <body className="bg-[#100B08] text-white">
        <AuthGuard>
          <div className="min-h-screen bg-[radial-gradient(circle_at_top,#5C2D18_0%,#100B08_45%,#050505_100%)]">
            {/* HEADER */}
            <header className="relative z-50 border-b border-[#F28C52]/30 bg-black/40 backdrop-blur">
              <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
                {/* LOGO */}
                <a href="/" className="flex shrink-0 items-center">
                  <img
                    src="/logo.png"
                    alt="Peach State Off-Road and Overlanding"
                    className="h-10 w-auto md:h-14"
                  />
                </a>

                {/* DESKTOP NAV */}
                <nav className="flex items-center gap-2 md:gap-3">
                  {links.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      className="rounded-lg px-3 py-2 text-sm font-semibold text-gray-300 hover:bg-[#F28C52]/10 hover:text-[#F28C52]"
                    >
                      {link.label}
                    </a>
                  ))}
                </nav>

                {/* RIGHT SIDE */}
                <div className="flex shrink-0 items-center gap-3">
                 {/* SOCIAL ICONS */}
<div className="hidden items-center gap-3 md:flex">

  {/* FACEBOOK */}
  <a
    href={facebookUrl}
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Facebook"
    className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-3 text-blue-400 transition hover:scale-110 hover:bg-blue-500/20"
  >
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-6 w-6"
    >
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.84c0-2.52 1.49-3.91 3.77-3.91 1.09 0 2.23.2 2.23.2v2.47h-1.26c-1.24 0-1.63.78-1.63 1.57v1.89h2.78l-.44 2.91h-2.34V22C18.34 21.24 22 17.08 22 12.06z" />
    </svg>
  </a>

  {/* INSTAGRAM */}
  <a
    href={instagramUrl}
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Instagram"
    className="rounded-xl border border-pink-500/30 bg-gradient-to-br from-pink-500/10 via-orange-500/10 to-yellow-500/10 p-3 text-pink-400 transition hover:scale-110 hover:from-pink-500/20 hover:via-orange-500/20 hover:to-yellow-500/20"
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
  </a>

</div>

                  <div className="hidden md:block">
                    <LogoutButton />
                  </div>

                  <MobileNav />
                </div>
              </div>
            </header>

            {/* MAIN */}
            <main className="mx-auto max-w-6xl px-4 py-6">
              {children}
            </main>
          </div>
        </AuthGuard>
      </body>
    </html>
  );
}