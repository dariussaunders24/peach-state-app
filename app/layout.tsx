import AuthGuard from "./components/AuthGuard";
import type { Metadata } from "next";
import "./globals.css";
import { Cinzel, Inter } from "next/font/google";
import MobileNav from "./components/MobileNav";
import LogoutButton from "./components/LogoutButton";

const cinzel = Cinzel({ subsets: ["latin"], weight: ["700"] });
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Peach State Off-Road and Overlanding",
  description: "Members-only off-road and overlanding community app.",
};

const links = [
  { href: "/", label: "Home" },
  { href: "/profiles", label: "My Profile" },
  { href: "/events", label: "Events" },
  { href: "/gallery", label: "Gallery" },
  { href: "/members", label: "Members" },
  { href: "/vendors", label: "Vendors" },
  { href: "/faq", label: "FAQ" },
  { href: "/store", label: "Store" },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#100B08] text-white`}>
        <AuthGuard>
          <div className="min-h-screen bg-[radial-gradient(circle_at_top,#5C2D18_0%,#100B08_45%,#050505_100%)]">
            <header className="relative z-50 border-b border-[#F28C52]/30 bg-black/40 backdrop-blur">
              <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
                <a href="/" className="flex shrink-0 items-center">
                  <img
                    src="/logo.png"
                    alt="Peach State Off-Road and Overlanding"
                    className="h-10 w-auto md:h-14"
                  />
                </a>

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

                <div className="flex shrink-0 items-center gap-3">
                  <div className="hidden md:block">
                    <LogoutButton />
                  </div>

                  <MobileNav />
                </div>
              </div>
            </header>

            <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
          </div>
        </AuthGuard>
      </body>
    </html>
  );
}