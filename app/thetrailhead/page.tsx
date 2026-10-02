"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type TrailheadSettings = {
  id: number;
  event_date: string | null;
  start_time: string | null;
  end_time: string | null;
  venue_name: string | null;
  address: string | null;
  announcement: string | null;
  special_feature: string | null;
  event_image: string | null;
};

export default function TrailheadPage() {
  const [settings, setSettings] =
    useState<TrailheadSettings | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    const { data, error } = await supabase
      .from("trailhead_settings")
      .select("*")
      .order("id", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Trailhead settings load error:", error);
    } else {
      setSettings(data);
    }

    setLoading(false);
  }

  const formattedDate = formatEventDate(settings?.event_date);

  const formattedTime = formatEventTime(
    settings?.start_time,
    settings?.end_time
  );

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 md:py-12">
      {/* HERO */}
      <section className="rounded-2xl border border-white/10 bg-black/45 px-6 py-10 text-center shadow-xl backdrop-blur md:px-10 md:py-14">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#F28C52] md:text-sm">
          Peach State Off-Road & Overlanding Presents
        </p>

        <h1 className="mx-auto mt-4 max-w-4xl font-cinzel text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
          More Than a Meet.
          <span className="mt-1 block text-[#F28C52]">
            It&apos;s a Starting Point.
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-white/75 md:text-xl">
          A monthly off-road, overland, outdoor, and automotive
          community meet built around vehicles, adventure,
          families, and the people who bring the community
          together.
        </p>
      </section>

      {/* NEXT TRAILHEAD */}
      <section className="mt-8 rounded-2xl border border-[#F28C52]/30 bg-[#F28C52]/10 p-6 md:p-8">
        <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#F28C52]">
              Next Trailhead
            </p>

            <h2 className="mt-2 font-cinzel text-2xl font-bold text-white md:text-3xl">
              Monthly Community Meet
            </h2>

            {loading ? (
              <p className="mt-5 text-white/60">
                Loading event details...
              </p>
            ) : (
              <div className="mt-5 space-y-2 text-white/80">
                {formattedDate && (
                  <p>
                    <span className="font-bold text-white">
                      Date:
                    </span>{" "}
                    {formattedDate}
                  </p>
                )}

                {formattedTime && (
                  <p>
                    <span className="font-bold text-white">
                      Time:
                    </span>{" "}
                    {formattedTime}
                  </p>
                )}

                {settings?.venue_name && (
                  <p>
                    <span className="font-bold text-white">
                      Location:
                    </span>{" "}
                    {settings.venue_name}
                  </p>
                )}

                {settings?.address && (
                  <p>
                    <span className="font-bold text-white">
                      Address:
                    </span>{" "}
                    {settings.address}
                  </p>
                )}

                <p className="pt-2 font-bold text-[#F28C52]">
                  Free • No RSVP • Just Show Up
                </p>
              </div>
            )}
          </div>

          <Link
            href="/thetrailhead/event"
            className="inline-flex items-center justify-center rounded-xl bg-[#F28C52] px-6 py-3 font-bold text-black transition hover:bg-[#C96A2C]"
          >
            View Event Info
          </Link>
        </div>
      </section>

      {/* ANNOUNCEMENT */}
      {!loading && settings?.announcement && (
        <section className="mt-6 rounded-2xl border border-[#F28C52]/30 bg-black/45 p-6 md:p-8">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#F28C52]">
            Trailhead Update
          </p>

          <p className="mt-3 whitespace-pre-line text-lg leading-8 text-white/80">
            {settings.announcement}
          </p>
        </section>
      )}

      {/* SPECIAL FEATURE */}
      {!loading && settings?.special_feature && (
        <section className="mt-6 rounded-2xl border border-white/10 bg-black/45 p-6 md:p-8">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#F28C52]">
            This Month at The Trailhead
          </p>

          <h2 className="mt-2 font-cinzel text-2xl font-bold text-white">
            Special Feature
          </h2>

          <p className="mt-3 whitespace-pre-line text-lg leading-8 text-white/75">
            {settings.special_feature}
          </p>
        </section>
      )}

      {/* ABOUT */}
      <section className="mt-12">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#F28C52]">
            Built for the Community
          </p>

          <h2 className="mt-3 font-cinzel text-3xl font-bold text-white md:text-4xl">
            More Than a Car Meet
          </h2>

          <p className="mt-5 text-lg leading-8 text-white/70">
            The Trailhead brings together the off-road, overland,
            outdoor, and automotive communities in one place.
            Whether you drive a stock daily driver, a dedicated
            trail rig, an overland build, or simply enjoy the
            outdoors, you&apos;re welcome here.
          </p>

          <p className="mt-4 text-lg font-bold text-white">
            No membership. No RSVP. No special vehicle required.
          </p>
        </div>
      </section>

      {/* EXPLORE */}
      <section className="mt-12">
        <div className="mb-6">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#F28C52]">
            Explore The Trailhead
          </p>

          <h2 className="mt-2 font-cinzel text-3xl font-bold text-white">
            There&apos;s More to See
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <TrailheadCard
            title="Event Info"
            description="Everything you need to know before coming to the next Trailhead meet."
            href="/thetrailhead/event"
            linkText="Event Details"
          />

          <TrailheadCard
            title="Featured Rigs"
            description="See what the Featured Rig area is all about and learn how to submit your vehicle."
            href="/thetrailhead/featured-rigs"
            linkText="Featured Rigs"
          />

          <TrailheadCard
            title="Little Explorers"
            description="Activities, passports, challenges, and prizes created for our youngest adventurers."
            href="/thetrailhead/little-explorers"
            linkText="Little Explorers"
          />

          <TrailheadCard
            title="Vendors"
            description="Meet the local businesses, shops, makers, and community vendors joining us."
            href="/thetrailhead/vendors"
            linkText="Vendors"
          />

          <TrailheadCard
            title="Buy / Sell / Trade"
            description="Bring off-road, overland, camping, and automotive gear you want to sell or trade."
            href="/thetrailhead/event"
            linkText="Learn More"
          />

          <TrailheadCard
            title="FAQ"
            description="Answers to common questions about attending The Trailhead."
            href="/thetrailhead/faq"
            linkText="View FAQ"
          />
        </div>
      </section>

      {/* FEATURED RIG CTA */}
      <section className="mt-12 overflow-hidden rounded-2xl border border-white/10 bg-black/45 p-6 md:p-8">
        <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#F28C52]">
              Featured Rig
            </p>

            <h2 className="mt-2 font-cinzel text-2xl font-bold text-white md:text-3xl">
              Want Your Build in the Featured Rig Area?
            </h2>

            <p className="mt-3 max-w-2xl leading-7 text-white/70">
              The Featured Rig area highlights vehicles and the
              people behind them. Submissions are open to the public
              and are not limited to Peach State members.
            </p>
          </div>

          <Link
            href="/thetrailhead/featured-rigs"
            className="inline-flex items-center justify-center rounded-xl border border-[#F28C52] px-6 py-3 font-bold text-[#F28C52] transition hover:bg-[#F28C52] hover:text-black"
          >
            Learn About Featured Rigs
          </Link>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="mt-12 rounded-2xl border border-white/10 bg-black/45 px-6 py-10 text-center md:px-10 md:py-14">
        <h2 className="font-cinzel text-3xl font-bold text-white md:text-4xl">
          Start at The Trailhead.
        </h2>

        <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-white/70">
          Come meet the community, check out the builds, grab some
          food and coffee, bring the family, and see where your next
          adventure starts.
        </p>

        <p className="mt-6 font-bold text-[#F28C52]">
          Free • Public • All Makes & Models Welcome
        </p>
      </section>
    </main>
  );
}

function TrailheadCard({
  title,
  description,
  href,
  linkText,
}: {
  title: string;
  description: string;
  href: string;
  linkText: string;
}) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-white/10 bg-black/45 p-6 transition hover:border-[#F28C52]/40">
      <h3 className="font-cinzel text-xl font-bold text-white">
        {title}
      </h3>

      <p className="mt-3 flex-1 leading-7 text-white/65">
        {description}
      </p>

      <Link
        href={href}
        className="mt-5 inline-flex font-bold text-[#F28C52] transition hover:text-white"
      >
        {linkText} →
      </Link>
    </div>
  );
}

function formatEventDate(
  date: string | null | undefined
) {
  if (!date) return "";

  const [year, month, day] = date.split("-").map(Number);

  if (!year || !month || !day) return "";

  return new Date(year, month - 1, day).toLocaleDateString(
    "en-US",
    {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }
  );
}

function formatEventTime(
  startTime: string | null | undefined,
  endTime: string | null | undefined
) {
  const start = formatSingleTime(startTime);
  const end = formatSingleTime(endTime);

  if (start && end) {
    return `${start} – ${end}`;
  }

  return start || end || "";
}

function formatSingleTime(
  time: string | null | undefined
) {
  if (!time) return "";

  const [hourString, minuteString] = time.split(":");

  const hour = Number(hourString);
  const minute = Number(minuteString);

  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return "";
  }

  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  const displayMinute = minute.toString().padStart(2, "0");

  return `${displayHour}:${displayMinute} ${period}`;
}