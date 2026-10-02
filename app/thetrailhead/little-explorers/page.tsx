"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type TrailheadSettings = {
  little_explorer_title: string | null;
  little_explorer_details: string | null;
  little_explorer_bonus: string | null;
};

export default function LittleExplorersPage() {
  const [settings, setSettings] =
    useState<TrailheadSettings | null>(null);

  useEffect(() => {
    async function loadSettings() {
      const { data, error } = await supabase
        .from("trailhead_settings")
        .select(
          "little_explorer_title, little_explorer_details, little_explorer_bonus"
        )
        .order("id", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error(
          "Little Explorer settings load error:",
          error
        );
        return;
      }

      setSettings(data);
    }

    loadSettings();
  }, []);

  const hasMonthlyContent =
    settings?.little_explorer_title ||
    settings?.little_explorer_details ||
    settings?.little_explorer_bonus;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 text-white">
      <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#F28C52]">
        The Trailhead
      </p>

      <h1 className="mt-2 font-cinzel text-4xl font-bold md:text-5xl">
        Little Explorers
      </h1>

      <p className="mt-4 max-w-3xl text-lg leading-8 text-white/70">
        The Trailhead isn&apos;t just for the grown-ups. Little
        Explorers gives kids their own way to participate, explore,
        and have fun at the meet.
      </p>

      {/* PASSPORT PROGRAM */}
      <section className="mt-8 rounded-2xl border border-[#F28C52]/30 bg-[#F28C52]/10 p-6 md:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#F28C52]">
          Little Explorer Passport
        </p>

        <h2 className="mt-2 text-2xl font-bold">
          Explore. Complete. Collect.
        </h2>

        <p className="mt-3 max-w-3xl leading-7 text-white/70">
          Kids can participate in the Little Explorer Passport
          program, complete activities around The Trailhead,
          collect stamps, take part in monthly challenges, and
          reach Explorer milestones throughout the year.
        </p>
      </section>

      {/* HOW IT WORKS */}
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Card
          title="Get a Passport"
          text="Stop by Little Explorer HQ during The Trailhead to get started."
        />

        <Card
          title="Complete Activities"
          text="Each meet can include activities, challenges, and things to discover."
        />

        <Card
          title="Earn Prizes"
          text="Complete activities and visit Explorer HQ for available prizes and rewards."
        />
      </div>

      {/* THIS MONTH */}
      {hasMonthlyContent && (
        <section className="mt-10 overflow-hidden rounded-2xl border border-[#F28C52]/40 bg-black/40">
          <div className="border-b border-[#F28C52]/20 bg-[#F28C52]/10 px-6 py-5 md:px-8">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#F28C52]">
              This Month at Explorer HQ
            </p>

            {settings?.little_explorer_title && (
              <h2 className="mt-2 font-cinzel text-2xl font-bold md:text-3xl">
                {settings.little_explorer_title}
              </h2>
            )}
          </div>

          <div className="p-6 md:p-8">
            {settings?.little_explorer_details && (
              <p className="max-w-4xl whitespace-pre-line text-lg leading-8 text-white/70">
                {settings.little_explorer_details}
              </p>
            )}

            {settings?.little_explorer_bonus && (
              <div className="mt-6 rounded-xl border border-[#F28C52]/30 bg-[#F28C52]/10 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#F28C52]">
                  Prize / Bonus
                </p>

                <p className="mt-2 whitespace-pre-line leading-7 text-white/80">
                  {settings.little_explorer_bonus}
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* EXPLORER HQ */}
      <section className="mt-10 rounded-2xl border border-white/10 bg-black/30 p-6 md:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#F28C52]">
          During The Trailhead
        </p>

        <h2 className="mt-2 font-cinzel text-2xl font-bold">
          Visit Little Explorer HQ
        </h2>

        <p className="mt-3 max-w-4xl leading-7 text-white/65">
          Little Explorer HQ is the home base for the program
          during The Trailhead. Stop by to pick up a passport,
          learn about the month&apos;s activity, get your passport
          stamped, and check out available Little Explorer prizes.
        </p>
      </section>
    </main>
  );
}

function Card({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-5">
      <h2 className="text-xl font-bold">{title}</h2>
      <p className="mt-3 leading-6 text-white/65">{text}</p>
    </div>
  );
}