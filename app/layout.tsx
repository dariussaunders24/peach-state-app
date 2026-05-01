import AuthGuard from "./components/AuthGuard";
import type { Metadata } from "next";
import "./globals.css";
import { Cinzel, Inter } from "next/font/google";
import LogoutButton from "./components/LogoutButton";

const cinzel = Cinzel({ subsets: ["latin"], weight: ["700"] });
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Peach State Off-Road and Overlanding",
  description: "Members-only off-road and overlanding community app.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#100B08] text-white`}>
        <div className="min-h-screen bg-[radial-gradient(circle_at_top,#5C2D18_0%,#100B08_45%,#050505_100%)]">
          <header className="border-b border-[#F28C52]/30 bg-black/40 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
              <div>
                <p className={`${cinzel.className} text-3xl tracking-wide text-[#F28C52]`}>
                  Peach State
                </p>
                <p className="text-sm uppercase tracking-[0.25em] text-gray-300">
                  Off-Road and Overlanding
                </p>
              </div>

              <div className="flex items-center gap-6">
                <nav className="hidden gap-6 text-base font-medium text-gray-300 md:flex">
                  <a href="/" className="hover:text-[#F28C52]">Home</a>
                  <a href="/profiles" className="hover:text-[#F28C52]">My Profile</a>
                  <a href="/events" className="hover:text-[#F28C52]">Events</a>
                   <a href="/gallery" className="hover:text-[#F28C52]">Gallery</a>
                  <a href="/store" className="hover:text-[#F28C52]">Store</a>
                  <a href="/vendors" className="hover:text-[#F28C52]">Vendors</a>
                  <a href="/faq" className="hover:text-[#F28C52]">FAQ</a>
                </nav>

                <LogoutButton />
              </div>
            </div>
          </header>

          <AuthGuard>
  <main className="mx-auto max-w-6xl px-4 py-8">
    {children}
  </main>
</AuthGuard>
        </div>
      </body>
    </html>
  );
}