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
      <div className="border-b border-white/10 bg-black/50">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex items-center justify-between gap-6 py-5">
            <Link href="/thetrailhead" className="group">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#F28C52]">
                Peach State Off-Road & Overlanding
              </p>

              <p className="mt-1 font-cinzel text-2xl font-bold text-white transition group-hover:text-[#F28C52]">
                The Trailhead
              </p>
            </Link>

            <div className="hidden text-right md:block">
              <p className="text-sm font-semibold text-white/80">
                Monthly Off-Road & Overland Community Meet
              </p>
              <p className="mt-1 text-xs uppercase tracking-[0.15em] text-white/50">
                Free • Public • All Makes & Models
              </p>
            </div>
          </div>

          <nav
            aria-label="Trailhead navigation"
            className="overflow-x-auto"
          >
            <div className="flex min-w-max gap-1 pb-3">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-lg px-4 py-2 text-sm font-bold text-white/70 transition hover:bg-[#F28C52]/15 hover:text-[#F28C52]"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </div>

      {children}
    </div>
  );
}