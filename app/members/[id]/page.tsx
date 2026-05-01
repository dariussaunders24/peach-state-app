"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

type Profile = {
  user_id: string;
  name: string | null;
  vehicle: string | null;
  location: string | null;
  image_url: string | null;
  bio?: string | null;
  instagram?: string | null;

  rig_name?: string | null;
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

export default function MemberProfilePage() {
  const params = useParams();
  const id = params.id as string;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, [id]);

  async function loadProfile() {
    setLoading(true);

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", id)
      .single();

    if (profileError) {
      console.error("Error loading profile:", profileError.message);
      setProfile(null);
      setLoading(false);
      return;
    }

    const { data: memberBadgeData, error: memberBadgeError } = await supabase
      .from("member_badges")
      .select("badge_id")
      .eq("user_id", id);

    if (memberBadgeError) {
      console.error("Error loading member badge IDs:", memberBadgeError.message);
    }

    const badgeIds = (memberBadgeData || []).map((item) => item.badge_id);

    let earnedBadges: Badge[] = [];

    if (badgeIds.length > 0) {
      const { data: earnedBadgeData, error: earnedBadgeError } = await supabase
        .from("badges")
        .select("id, name, description, image_url")
        .in("id", badgeIds);

      if (earnedBadgeError) {
        console.error("Error loading earned badges:", earnedBadgeError.message);
      }

      earnedBadges = earnedBadgeData || [];
    }

    setProfile(profileData || null);
    setBadges(earnedBadges);
    setLoading(false);
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10 text-white">
        <p className="text-white/70">Loading profile...</p>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10 text-white">
        <p>Profile not found.</p>

        <Link
          href="/members"
          className="mt-4 inline-block text-[#F28C52] hover:underline"
        >
          ← Back to Members
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 text-white">
      <Link href="/members" className="text-sm text-[#F28C52] hover:underline">
        ← Back to Members
      </Link>

      <div className="mt-6 overflow-hidden rounded-2xl border border-[#F28C52]/20 bg-black/40 shadow-lg">
        {profile.image_url ? (
          <img
            src={profile.image_url}
            alt={profile.vehicle || "Member vehicle"}
            className="h-72 w-full object-cover"
          />
        ) : (
          <div className="flex h-72 w-full items-center justify-center border-b border-white/10 bg-black/30 text-white/50">
            No vehicle photo uploaded
          </div>
        )}

        <div className="p-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#F28C52] md:text-4xl">
                {profile.name || "Member"}
              </h1>

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

          <section className="mt-6">
            <h2 className="text-xl font-semibold text-[#F28C52]">Badges</h2>

            {badges.length === 0 ? (
              <p className="mt-2 text-white/60">No badges yet.</p>
            ) : (
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
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
          </section>

          {profile.bio && (
            <Section title="About">
              <p className="whitespace-pre-line text-white/90">{profile.bio}</p>
            </Section>
          )}

          <Section title="Rig Build">
            <div className="grid gap-4 md:grid-cols-2">
              <InfoBlock
                label="Suspension"
                value={profile.suspension || "Not listed"}
              />

              <InfoBlock
                label="Tires / Wheels"
                value={profile.tires_wheels || "Not listed"}
              />

              <InfoBlock
                label="Armor / Protection"
                value={profile.armor_protection || "Not listed"}
              />

              <InfoBlock
                label="Lighting"
                value={profile.lighting || "Not listed"}
              />

              <InfoBlock
                label="Recovery Gear"
                value={profile.recovery_gear || "Not listed"}
              />

              <InfoBlock label="Comms" value={profile.comms || "Not listed"} />

              <InfoBlock
                label="Roof / Camp Setup"
                value={profile.roof_camp_setup || "Not listed"}
              />

              <InfoBlock
                label="Future Mods"
                value={profile.future_mods || "Not listed"}
              />
            </div>
          </Section>

          {profile.build_notes && (
            <Section title="Additional Build Notes">
              <p className="whitespace-pre-line text-white/90">
                {profile.build_notes}
              </p>
            </Section>
          )}

          {profile.instagram && (
            <Section title="Instagram">
              <a
                href={`https://instagram.com/${profile.instagram.replace(
                  "@",
                  ""
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#F28C52] hover:underline"
              >
                @{profile.instagram.replace("@", "")}
              </a>
            </Section>
          )}
        </div>
      </div>
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
      <h2 className="mb-4 text-xl font-semibold text-[#F28C52]">{title}</h2>
      {children}
    </section>
  );
}

function InfoBlock({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
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