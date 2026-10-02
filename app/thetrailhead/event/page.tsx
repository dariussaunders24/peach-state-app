"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

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

export default function TrailheadEventPage() {
  const [settings, setSettings] = useState<TrailheadSettings | null>(null);
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
    <main className="mx-auto max-w-6xl px-4 py-8 text-white">
      <PageHeader
        eyebrow="The Next Meet"
        title="Event Info"
        description="Everything you need to know before coming to The Trailhead."
      />

      {/* CURRENT EVENT */}
      <section className="mt-8 rounded-2xl border border-[#F28C52]/30 bg-[#F28C52]/10 p-6 md:p-8">
        <h2 className="font-cinzel text-3xl font-bold">
          The Trailhead
        </h2>

        {loading ? (
          <p className="mt-5 text-white/60">
            Loading event details...
          </p>
        ) : (
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {formattedDate && (
              <Info
                title="Date"
                text={formattedDate}
              />
            )}

            {formattedTime && (
              <Info
                title="Time"
                text={formattedTime}
              />
            )}

            {settings?.venue_name && (
              <Info
                title="Location"
                text={settings.venue_name}
              />
            )}

            {settings?.address && (
              <Info
                title="Address"
                text={settings.address}
              />
            )}

            <Info
              title="Admission"
              text="Free — No RSVP Required"
            />

            <Info
              title="Who Can Attend?"
              text="Everyone — Open to the Public"
            />
          </div>
        )}
      </section>

      {/* ANNOUNCEMENT */}
      {!loading && settings?.announcement && (
        <section className="mt-6 rounded-2xl border border-[#F28C52]/30 bg-black/30 p-6">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#F28C52]">
            Trailhead Update
          </p>

          <p className="mt-3 whitespace-pre-line text-lg leading-8 text-white/75">
            {settings.announcement}
          </p>
        </section>
      )}

      {/* SPECIAL FEATURE */}
      {!loading && settings?.special_feature && (
        <section className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-6">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#F28C52]">
            This Month at The Trailhead
          </p>

          <h2 className="mt-2 font-cinzel text-2xl font-bold">
            Special Feature
          </h2>

          <p className="mt-3 whitespace-pre-line leading-7 text-white/70">
            {settings.special_feature}
          </p>
        </section>
      )}

      {/* WHAT TO EXPECT */}
      <section className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-6">
        <h2 className="text-2xl font-bold">What to Expect</h2>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Info
            title="Off-Road & Overland Builds"
            text="Walk through vehicles from across the community and meet the people behind the builds."
          />

          <Info
            title="Featured Rigs"
            text="Select builds receive dedicated display spaces at each Trailhead."
          />

          <Info
            title="Food & Coffee"
            text="Food and drink vendors may be available during the meet."
          />

          <Info
            title="Little Explorers"
            text="Kid-focused activities, passports, challenges, and prizes."
          />

          <Info
            title="Community Vendors"
            text="Meet businesses and organizations connected to the off-road, overland, outdoor, and automotive communities."
          />

          <Info
            title="Buy / Sell / Trade"
            text="Bring off-road, overland, camping, recovery, and vehicle gear to buy, sell, or trade."
          />
        </div>
      </section>

      {/* VEHICLES */}
      <section className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-6">
        <h2 className="text-2xl font-bold">Vehicles</h2>

        <p className="mt-3 leading-7 text-white/70">
          All makes, models, and build levels are welcome. You do not need an
          off-road build or modified vehicle to attend. Stock vehicles, daily
          drivers, project vehicles, trail rigs, and full overland builds are
          all welcome.
        </p>
      </section>

      {/* FAMILIES */}
      <section className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-6">
        <h2 className="text-2xl font-bold">Families & Kids</h2>

        <p className="mt-3 leading-7 text-white/70">
          The Trailhead is family friendly. Kids are welcome, and Little
          Explorers gives younger attendees their own activities and
          experiences during the meet.
        </p>
      </section>
    </main>
  );
}

function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <header>
      <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#F28C52]">
        {eyebrow}
      </p>

      <h1 className="mt-2 font-cinzel text-4xl font-bold md:text-5xl">
        {title}
      </h1>

      <p className="mt-3 max-w-3xl text-lg text-white/65">
        {description}
      </p>
    </header>
  );
}

function Info({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-4">
      <h3 className="font-bold text-white">{title}</h3>

      <p className="mt-2 whitespace-pre-line leading-6 text-white/65">
        {text}
      </p>
    </div>
  );
}

function formatEventDate(date: string | null | undefined) {
  if (!date) return "";

  const [year, month, day] = date.split("-").map(Number);

  if (!year || !month || !day) return "";

  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
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

function formatSingleTime(time: string | null | undefined) {
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