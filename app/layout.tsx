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
            
            {/* HEADER */}
            <header className="relative z-50 border-b border-[#F28C52]/30 bg-black/40 backdrop-blur">
              <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
                
                {/* LOGO */}
                <a href="/" className="flex items-center">
                  <img
                    src="/logo.png"
                    alt="Peach State Off-Road and Overlanding"
                    className="h-10 w-auto md:h-14"
                  />
                </a>

                {/* RIGHT SIDE */}
                <div className="flex items-center gap-3">
                  <div className="hidden md:block">
                    <LogoutButton />
                  </div>
                  <MobileNav />
                </div>

              </div>
            </header>

            {/* MAIN CONTENT */}
            <main className="mx-auto max-w-6xl px-4 py-6">
              {children}
            </main>
          </div>
        </AuthGuard>
      </body>
    </html>
  );
}