import Link from "next/link";
import { ReactNode } from "react";

const navItems = [
  { label: "Home", href: "/thetrailhead" },
  { label: "Event Info", href: "/thetrailhead/event" },
  { label: "Featured Rigs", href: "/thetrailhead/featured-rigs" },
  { label: "Little Explorers", href: "/thetrailhead/little-explorers" },
  { label: "Vendors", href: "/thetrailhead/vendors" },
  { label: "FAQ", href: "/thetrailhead/faq" },
];

export default function TrailheadLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen text-white">
      {/* TRAILHEAD HEADER */}
      <header className="border-b border-white/10 bg-black/60">
        <div className="mx-auto max-w-6xl px-4">
          {/* BRAND */}
          <div className="flex justify-center py-7">
            <Link
              href="/thetrailhead"
              aria-label="The Trailhead Home"
              className="block"
            >
              <div className="flex h-56 w-[30rem] max-w-[90vw] items-center justify-center rounded-2xl border border-[#F28C52]/30 bg-[#B85C2E] px-8 py-6 transition hover:border-[#F28C52]/70">
                <img
                  src="/trailhead-logo.png"
                  alt="The Trailhead - Off-Road Overland Community"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            </Link>
          </div>

          {/* NAVIGATION */}
          <nav
            aria-label="Trailhead navigation"
            className="border-t border-white/10 py-4"
          >
            <div className="flex flex-wrap justify-center gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-lg border border-[#F28C52]/60 bg-[#F28C52]/10 px-5 py-2.5 text-sm font-bold text-white transition hover:border-[#F28C52] hover:bg-[#F28C52] hover:text-black"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </header>

      {children}
    </div>
  );
}