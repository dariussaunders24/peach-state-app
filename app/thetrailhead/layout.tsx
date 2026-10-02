import Link from "next/link";
import { ReactNode } from "react";

const navItems = [
  { label: "Home", href: "/thetrailhead" },
  { label: "Event Info", href: "/thetrailhead/event" },
  { label: "Featured Rigs", href: "/thetrailhead/featured-rigs" },
  { label: "Little Explorers", href: "/thetrailhead/little-explorers" },
  { label: "Vendors", href: "/thetrailhead/vendors" },
  { label: "Gallery", href: "/thetrailhead/gallery" },
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

          {/* SOCIAL LINKS */}
          <div className="flex justify-center gap-3 pb-5">
            <a
              href="https://www.instagram.com/thetrailhead_ga/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="The Trailhead on Instagram"
              className="flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-[#F28C52] hover:bg-[#F28C52]/10 hover:text-white"
            >
              {/* Instagram Icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>

              Instagram
            </a>

            <a
              href="https://www.facebook.com/thetrailhead.ga"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="The Trailhead on Facebook"
              className="flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-[#F28C52] hover:bg-[#F28C52]/10 hover:text-white"
            >
              {/* Facebook Icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.51 1.49-3.89 3.77-3.89 1.09 0 2.23.2 2.23.2v2.45h-1.25c-1.24 0-1.62.77-1.62 1.56V12h2.76l-.44 2.89h-2.32v6.99A10 10 0 0 0 22 12z" />
              </svg>

              Facebook
            </a>
          </div>
        </div>
      </header>

      {children}
    </div>
  );
}