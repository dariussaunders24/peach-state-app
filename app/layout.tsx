"use client";

import AuthGuard from "./components/AuthGuard";
import "./globals.css";
import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import MobileNav from "./components/MobileNav";
import LogoutButton from "./components/LogoutButton";

const adminEmails = ["dariussaunders24@gmail.com"];

const facebookUrl =
  "https://www.facebook.com/groups/peachstateoffroad";

const instagramUrl =
  "https://www.instagram.com/peachstate_offroad_overlanding/";

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
      adminEmails.includes(
        (data.user.email || "").toLowerCase().trim()
      )
    ) {
      setIsAdmin(true);
    }
  }

  const links = [
    { href: "/", label: "Home" },
    ...(isAdmin ? [{ href: "/admin", label: "Admin" }] : []),
    { href: "/profiles", label: "My Profile" },
    { href: "/events", label: "Events" },
    { href: "/past-events", label: "Past Events" },
    { href: "/gallery", label: "Gallery" },
    { href: "/resources", label: "Resources" },
    { href: "/members", label: "Members" },
    { href: "/vendors", label: "Vendors" },
    { href: "/store", label: "Store" },
  ];

  return (
    <html lang="en">
      <body className="bg-[#100B08] text-white">
        <AuthGuard>
          <div className="min-h-screen bg-[radial-gradient(circle_at_top,#5C2D18_0%,#100B08_45%,#050505_100%)]">
            <header className="sticky top-0 z-50 border-b border-[#F28C52]/30 bg-black/40 backdrop-blur">
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
                  <div className="hidden items-center gap-3 md:flex">
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
                        <rect
                          width="20"
                          height="20"
                          x="2"
                          y="2"
                          rx="5"
                          ry="5"
                        />
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                        <line
                          x1="17.5"
                          x2="17.51"
                          y1="6.5"
                          y2="6.5"
                        />
                      </svg>
                    </a>
                  </div>

                  <div className="hidden md:block">
                    <LogoutButton />
                  </div>

                  <MobileNav />
                </div>
              </div>

              <StewardshipTracker />
            </header>

            <main className="mx-auto max-w-6xl px-4 py-6">
              {children}
            </main>
          </div>
        </AuthGuard>
      </body>
    </html>
  );
}

const STEWARDSHIP_CHANGED_EVENT = "pso:stewardship-updated";
const STEWARDSHIP_STORAGE_KEY = "pso:stewardship-updated";

type StewardshipTotals = {
  trash_lbs: number | null;
  tires_removed: number | null;
  volunteer_hours: number | null;
  miles_cleaned: number | null;
};

function readTotal(
  value: unknown,
  wholeNumber = false
): number | null {
  if (value === null) return null;

  if (
    (typeof value !== "number" && typeof value !== "string") ||
    (typeof value === "string" && value.trim() === "")
  ) {
    throw new Error("The stewardship totals could not be read.");
  }

  const number = Number(value);

  if (
    !Number.isFinite(number) ||
    number < 0 ||
    (wholeNumber && !Number.isInteger(number))
  ) {
    throw new Error("The stewardship totals could not be read.");
  }

  return number;
}

function parseStewardshipTotals(data: unknown): StewardshipTotals {
  const row = Array.isArray(data) ? data[0] : data;

  if (!row || typeof row !== "object") {
    throw new Error("The stewardship totals could not be read.");
  }

  const values = row as Record<string, unknown>;

  return {
    trash_lbs: readTotal(values.trash_lbs),
    tires_removed: readTotal(values.tires_removed, true),
    volunteer_hours: readTotal(values.volunteer_hours),
    miles_cleaned: readTotal(values.miles_cleaned),
  };
}

function formatStewardshipNumber(
  value: number | null | undefined
) {
  if (
    value === null ||
    value === undefined ||
    !Number.isFinite(value)
  ) {
    return "—";
  }

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(value);
}

function StewardshipTracker() {
  const [totals, setTotals] =
    useState<StewardshipTotals | null>(null);

  const [status, setStatus] = useState(
    "Loading stewardship totals."
  );

  useEffect(() => {
    let mounted = true;
    let inFlight = false;
    let refreshAgain = false;
    let controller: AbortController | null = null;

    async function refresh() {
      if (inFlight) {
        refreshAgain = true;
        return;
      }

      inFlight = true;
      controller = new AbortController();

      const timeout = window.setTimeout(
        () => controller?.abort(),
        20000
      );

      try {
        const { data, error } = await supabase
          .rpc("get_stewardship_totals")
          .abortSignal(controller.signal);

        if (error) throw error;

        const updated = parseStewardshipTotals(data);

        if (mounted) {
          setTotals(updated);
          setStatus("");
        }
      } catch {
        if (mounted) {
          setStatus(
            "Stewardship totals are temporarily unavailable."
          );
        }
      } finally {
        window.clearTimeout(timeout);
        inFlight = false;
        controller = null;

        if (mounted && refreshAgain) {
          refreshAgain = false;
          void refresh();
        }
      }
    }

    const whenVisible = () => {
      if (document.visibilityState === "visible") {
        void refresh();
      }
    };

    const onStorage = (event: StorageEvent) => {
      if (event.key === STEWARDSHIP_STORAGE_KEY) {
        void refresh();
      }
    };

    void refresh();

    const timer = window.setInterval(whenVisible, 60000);

    window.addEventListener("focus", whenVisible);
    document.addEventListener("visibilitychange", whenVisible);
    window.addEventListener(
      STEWARDSHIP_CHANGED_EVENT,
      whenVisible
    );
    window.addEventListener("storage", onStorage);

    return () => {
      mounted = false;
      controller?.abort();

      window.clearInterval(timer);
      window.removeEventListener("focus", whenVisible);
      document.removeEventListener(
        "visibilitychange",
        whenVisible
      );
      window.removeEventListener(
        STEWARDSHIP_CHANGED_EVENT,
        whenVisible
      );
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const metrics = [
    {
      key: "trash_lbs",
      label: "of trash removed",
      unit: "LBS",
    },
    {
      key: "tires_removed",
      label: "Tires removed",
      unit: "",
    },
    {
      key: "volunteer_hours",
      label: "Hours volunteered",
      unit: "",
    },
    {
      key: "miles_cleaned",
      label: "Miles cleaned",
      unit: "",
    },
  ] as const;

  return (
    <section
      className="pso-stewardship-tracker"
      aria-label="Stewardship impact"
    >
      <div className="pso-stewardship-inner">
        <h2 className="pso-stewardship-title">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M11 20a7 7 0 0 1-1.2-13.9C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10Z" />
            <path d="M2 21c0-3 1.9-5.4 5.1-6C9.5 14.5 12 13 13 12" />
          </svg>

          Stewardship Impact
        </h2>

        <div
          className="pso-stewardship-stats"
          aria-live="polite"
          aria-atomic="true"
        >
          {metrics.map((metric) => (
            <div
              className="pso-stewardship-stat"
              key={metric.key}
            >
              <div className="pso-stewardship-value">
                {formatStewardshipNumber(totals?.[metric.key])}

                {metric.unit && (
                  <span className="pso-stewardship-unit">
                    {" "}
                    {metric.unit}
                  </span>
                )}
              </div>

              <div className="pso-stewardship-label">
                {metric.label}
              </div>
            </div>
          ))}
        </div>

        <p className="pso-stewardship-partnership">
          <span>In partnership with</span>

          <span className="pso-stewardship-partnerName">
            <img
              src="/vuf-logo.png"
              width={48}
              height={31}
              alt=""
              aria-hidden="true"
              className="pso-stewardship-partnerLogo"
            />

            <span>Venture Unknown Foundation.</span>
          </span>
        </p>

        <span
          className="pso-stewardship-srOnly"
          role="status"
        >
          {status}
        </span>
      </div>

      <style>{`
        .pso-stewardship-tracker {
          width: 100%;
          font-family: Arial, Helvetica, sans-serif;
          color: #d3c5ba;
        }

        .pso-stewardship-inner {
          max-width: 72rem;
          margin: 0 auto;
          padding: 0 1rem;
        }

        .pso-stewardship-title {
          display: flex;
          align-items: center;
          gap: 5px;
          margin: 0 0 2px;
          color: #e1c7b7;
          font-size: 11px;
          font-weight: 600;
          line-height: 1;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .pso-stewardship-title svg {
          flex: 0 0 12px;
          width: 12px;
          height: 12px;
          color: #f28c52;
        }

        .pso-stewardship-stats {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }

        .pso-stewardship-stat {
          min-width: 0;
          text-align: center;
        }

        .pso-stewardship-stat + .pso-stewardship-stat {
          border-left: 0.5px solid rgb(242 140 82 / 18%);
        }

        .pso-stewardship-value {
          color: #f28c52;
          font-size: 20px;
          font-weight: 700;
          font-variant-numeric: tabular-nums;
          line-height: 1.05;
          white-space: nowrap;
        }

        .pso-stewardship-unit {
          font-size: 12.5px;
          font-weight: 500;
        }

        .pso-stewardship-label {
          font-size: 13.75px;
          line-height: 1.1;
          text-wrap: balance;
        }

        .pso-stewardship-partnership {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 0 3px;
          margin: 3px 0 0;
          padding: 3px 0 0;
          border-top: 0.5px solid rgb(242 140 82 / 16%);
          color: #b9a69a;
          font-size: 12.5px;
          font-weight: 400;
          line-height: 1.2;
          text-align: center;
        }

        .pso-stewardship-partnerName {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          color: #F28C52;
          font-weight: 700;
          white-space: nowrap;
        }

        .pso-stewardship-partnerLogo {
          display: block;
          flex: 0 0 auto;
          width: 48px;
          height: 31px;
          object-fit: contain;
        }

        .pso-stewardship-srOnly {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }

        @media (max-width: 639px) {
          .pso-stewardship-inner {
            padding: 0 8px;
          }

          .pso-stewardship-value {
            font-size: 18px;
          }

          .pso-stewardship-unit {
            font-size: 11px;
          }

          .pso-stewardship-label {
            font-size: 11px;
          }

          .pso-stewardship-partnership {
            font-size: 11px;
          }
        }
      `}</style>
    </section>
  );
}