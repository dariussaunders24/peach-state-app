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
          <div className="flex justify-center py-5">
            <Link
              href="/thetrailhead"
              className="flex items-center gap-4"
              aria-label="The Trailhead Home"
            >
              {/* Official Trailhead logo needs dark orange background */}
              <div className="flex h-24 w-44 items-center justify-center rounded-xl bg-[#B85C2E] p-3">
                <img
                  src="/trailhead-logo.png"
                  alt="The Trailhead"
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              <div className="hidden sm:block">
                <p className="font-cinzel text-2xl font-bold text-white">
                  The Trailhead
                </p>

                <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-[#F28C52]">
                  Off-Road & Overland Community
                </p>
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
                  className="rounded-lg border border-[#F28C52]/50 bg-[#F28C52]/10 px-5 py-2.5 text-sm font-bold text-white transition hover:border-[#F28C52] hover:bg-[#F28C52] hover:text-black"
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