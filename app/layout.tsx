"use client";

import AuthGuard from "./components/AuthGuard";
import "./globals.css";
import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import MobileNav from "./components/MobileNav";
import LogoutButton from "./components/LogoutButton";

const adminEmails = ["dariussaunders24@gmail.com"];

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
                <nav className="hidden items-center gap-3 md:flex">
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