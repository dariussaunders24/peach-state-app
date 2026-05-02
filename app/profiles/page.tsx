"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase";

type Profile = {
  user_id?: string;
  name?: string | null;
  location?: string | null;
  vehicle?: string | null;
  rig_name?: string | null;
  image_url?: string | null;
  suspension?: string | null;
  tires_wheels?: string | null;
  armor_protection?: string | null;
  lighting?: string | null;
  recovery_gear?: string | null;
  comms?: string | null;
  roof_camp_setup?: string | null;
  future_mods?: string | null;
  build_notes?: string | null;
};

type Badge = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
};

export default function MyProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMyProfile();
  }, []);

  async function loadMyProfile() {
    setLoading(true);

    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      setLoading(false);
      return;
    }

    setUserId(userData.user.id);

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userData.user.id)
      .maybeSingle();

    if (error) {
      console.error("Error loading my profile:", error.message);
      setProfile(null);
      setLoading(false);
      return;
    }

    setProfile(data);

    const { data: memberBadgeData, error: memberBadgeError } = await supabase
      .from("member_badges")
      .select("badge_id")
      .eq("user_id", userData.user.id);

    if (memberBadgeError) {
      console.error("Error loading member badge IDs:", memberBadgeError.message);
      setBadges([]);
      setLoading(false);
      return;
    }

    const badgeIds = (memberBadgeData || []).map((item) => item.badge_id);

    if (badgeIds.length > 0) {
      const { data: earnedBadgeData, error: earnedBadgeError } = await supabase
        .from("badges")
        .select("id, name, description, image_url")
        .in("id", badgeIds);

      if (earnedBadgeError) {
        console.error("Error loading earned badges:", earnedBadgeError.message);
        setBadges([]);
      } else {
        setBadges(earnedBadgeData || []);
      }
    } else {
      setBadges([]);
    }

    setLoading(false);
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-8 text-white">
        <div className="rounded-2xl border border-white/10 bg-black/40 p-6 text-white/70">
          Loading your profile...
        </div>
      </main>
    );
  }

  if (!userId) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-8 text-white">
        <div className="rounded-2xl border border-white/10 bg-black/40 p-6">
          <h1 className="font-cinzel text-3xl font-bold text-[#F28C52]">
            My Profile
          </h1>
          <p className="mt-3 text-white/70">
            You need to be logged in to view your profile.
          </p>
        </div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-8 text-white">
        <div className="rounded-2xl border border-white/10 bg-black/40 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-[#F28C52]/80">
            Member Build Profile
          </p>

          <h1 className="mt-2 font-cinzel text-3xl font-bold text-white">
            My Profile
          </h1>

          <p className="mt-3 text-white/70">
            You have not created your profile yet.
          </p>

          <Link
            href="/profiles/edit"
            className="mt-5 inline-block rounded-lg bg-[#F28C52] px-5 py-3 font-semibold text-black hover:bg-[#C96A2C]"
          >
            Create My Profile
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 text-white">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[#F28C52]/80">
            Member Build Profile
          </p>

          <h1 className="mt-2 font-cinzel text-3xl font-bold text-white md:text-4xl">
            My Profile
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">
            This is your public member profile as other Peach State members will see it.
          </p>
        </div>

        <Link
          href="/profiles/edit"
          className="rounded-lg border border-[#F28C52] px-5 py-3 text-center text-sm font-semibold text-[#F28C52] transition hover:bg-[#F28C52] hover:text-black"
        >
          Edit My Profile
        </Link>
      </div>

      <section className="overflow-hidden rounded-2xl border border-[#F28C52]/20 bg-black/45 shadow-xl backdrop-blur">
        {profile.image_url ? (
          <img
            src={profile.image_url}
            alt={profile.vehicle || "Member vehicle"}
            className="h-72 w-full object-cover md:h-96"
          />
        ) : (
          <div className="flex h-72 w-full items-center justify-center bg-black/30 text-white/50 md:h-96">
            No vehicle photo uploaded
          </div>
        )}

        <div className="p-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="font-cinzel text-3xl font-bold text-[#F28C52] md:text-4xl">
                {profile.name || "Member"}
              </h2>

              {profile.rig_name && (
                <p className="mt-1 text-xl font-semibold text-white">
                  “{profile.rig_name}”
                </p>
              )}

              <p className="mt-1 text-white/70">
                {profile.vehicle || "Vehicle not listed"}
              </p>
            </div>

            {profile.location && (
              <p className="text-sm text-white/60">{profile.location}</p>
            )}
          </div>

          <Section title="Badges">
            {badges.length === 0 ? (
              <p className="text-white/60">No badges yet.</p>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {badges.map((badge) => (
                  <div
                    key={badge.id}
                    className="rounded-xl border border-[#F28C52]/30 bg-black/30 p-3 text-center"
                  >
                    {badge.image_url ? (
                      <img
                        src={badge.image_url}
                        alt={badge.name}
                        className="mx-auto mb-2 h-20 w-20 object-contain"
                      />
                    ) : (
                      <div className="mx-auto mb-2 flex h-20 w-20 items-center justify-center rounded-full border border-[#F28C52]/40 text-xl font-bold text-[#F28C52]">
                        ★
                      </div>
                    )}

                    <p className="text-sm font-semibold text-white">
                      {badge.name}
                    </p>

                    {badge.description && (
                      <p className="mt-1 text-xs text-white/60">
                        {badge.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Section>

          <Section title="Rig Build">
            <div className="grid gap-4 md:grid-cols-2">
              <InfoBlock label="Suspension" value={profile.suspension} />
              <InfoBlock label="Tires / Wheels" value={profile.tires_wheels} />
              <InfoBlock
                label="Armor / Protection"
                value={profile.armor_protection}
              />
              <InfoBlock label="Lighting" value={profile.lighting} />
              <InfoBlock label="Recovery Gear" value={profile.recovery_gear} />
              <InfoBlock label="Comms" value={profile.comms} />
              <InfoBlock
                label="Roof / Camp Setup"
                value={profile.roof_camp_setup}
              />
              <InfoBlock label="Future Mods" value={profile.future_mods} />
            </div>
          </Section>

          <Section title="Additional Build Notes">
            <p className="whitespace-pre-line text-white/90">
              {profile.build_notes || "No additional build notes listed."}
            </p>
          </Section>

          <div className="mt-6">
            <Link
              href={`/members/${profile.user_id}`}
              className="inline-block rounded-lg border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:border-[#F28C52] hover:text-[#F28C52]"
            >
              View Public Profile Page
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8 rounded-xl border border-white/10 bg-black/30 p-4">
      <h3 className="mb-4 font-cinzel text-xl font-bold text-[#F28C52]">
        {title}
      </h3>
      {children}
    </section>
  );
}

function InfoBlock({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/30 p-3">
      <p className="text-xs uppercase tracking-wide text-white/50">{label}</p>

      <p className="mt-1 whitespace-pre-line text-white">
        {value && value.trim() ? value : "Not listed"}
      </p>
    </div>
  );
}