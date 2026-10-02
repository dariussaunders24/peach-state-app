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
    <div className="flex min-h-screen flex-col text-white">
      {/* TRAILHEAD HEADER */}
      <header className="border-b border-white/10 bg-black/60">
        <div className="mx-auto max-w-6xl px-4">
          {/* BRAND */}
          <div className="flex flex-col items-center justify-between gap-5 py-5 md:flex-row">
            <Link
              href="/thetrailhead"
              className="flex items-center gap-4"
              aria-label="The Trailhead Home"
            >
              <div className="flex h-20 w-36 items-center justify-center">
                <img
                  src="/trailhead-logo.png"
                  alt="The Trailhead"
                  className="max-h-20 max-w-full object-contain"
                />
              </div>

              <div className="hidden sm:block">
                <p className="font-cinzel text-xl font-bold text-white">
                  The Trailhead
                </p>

                <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-[#F28C52]">
                  Off-Road & Overland Community
                </p>
              </div>
            </Link>

            <div className="text-center md:text-right">
              <p className="text-sm font-semibold text-white/70">
                Monthly Community Meet
              </p>

              <p className="mt-1 text-xs text-white/40">
                Bringing the off-road and overland community together.
              </p>
            </div>
          </div>

          {/* NAVIGATION */}
          <nav
            aria-label="Trailhead navigation"
            className="border-t border-white/10 py-4"
          >
            <div className="flex flex-wrap justify-center gap-2 md:justify-start">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-sm font-bold text-white transition hover:border-[#F28C52] hover:bg-[#F28C52] hover:text-black"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </header>

      {/* PAGE CONTENT */}
      <div className="flex-1">
        {children}
      </div>

      {/* TRAILHEAD FOOTER */}
      <footer className="mt-12 border-t border-white/10 bg-black/60">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="flex flex-col items-center justify-between gap-6 text-center md:flex-row md:text-left">
            <div>
              <p className="font-cinzel text-xl font-bold text-white">
                The Trailhead
              </p>

              <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-[#F28C52]">
                Off-Road & Overland Community
              </p>
            </div>

            <div className="md:text-right">
              <p className="font-cinzel text-lg font-bold text-white">
                More Than a Meet.
              </p>

              <p className="mt-1 font-cinzel text-lg font-bold text-[#F28C52]">
                It&apos;s a Starting Point.
              </p>
            </div>
          </div>

          <div className="mt-6 border-t border-white/10 pt-5 text-center text-xs text-white/40">
            Hosted by Peach State Off-Road & Overlanding
          </div>
        </div>
      </footer>
    </div>
  );
}