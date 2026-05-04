"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

type Profile = {
  user_id: string;
  name: string | null;
  location: string | null;
  image_url: string | null;
  bio?: string | null;
  instagram?: string | null;
};

type Badge = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
};

const buildFields = [
  { key: "suspension", label: "Suspension" },
  { key: "tires_wheels", label: "Tires / Wheels" },
  { key: "armor_protection", label: "Armor / Protection" },
  { key: "recovery_gear", label: "Recovery Gear" },
  { key: "lighting", label: "Lighting" },
  { key: "comms", label: "Comms" },
  { key: "roof_camp_setup", label: "Roof / Camp Setup" },
  { key: "future_mods", label: "Future Mods" },
];

export default function MemberProfilePage() {
  const params = useParams();
  const id = params.id as string;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [builds, setBuilds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, [id]);

  async function loadProfile() {
    setLoading(true);

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("user_id, name, location, image_url, bio, instagram")
      .eq("user_id", id)
      .single();

    if (profileError) {
      console.error("Error loading profile:", profileError.message);
      setProfile(null);
      setLoading(false);
      return;
    }

    const { data: buildData, error: buildError } = await supabase
      .from("vehicles")
      .select("*")
      .eq("user_id", id)
      .order("is_primary", { ascending: false })
      .order("created_at", { ascending: false });

    if (buildError) {
      console.error("Error loading builds:", buildError.message);
      setBuilds([]);
    } else {
      setBuilds(buildData || []);
    }

    const { data: memberBadgeData } = await supabase
      .from("member_badges")
      .select("badge_id")
      .eq("user_id", id);

    const badgeIds = (memberBadgeData || []).map((item) => item.badge_id);

    let earnedBadges: Badge[] = [];

    if (badgeIds.length > 0) {
      const { data: earnedBadgeData } = await supabase
        .from("badges")
        .select("id, name, description, image_url")
        .in("id", badgeIds);

      earnedBadges = earnedBadgeData || [];
    }

    setProfile(profileData || null);
    setBadges(earnedBadges);
    setLoading(false);
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10 text-white">
        <p className="text-white/70">Loading profile...</p>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10 text-white">
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

  const primaryBuild = builds.find((build) => build.is_primary);
  const otherBuilds = builds.filter((build) => !build.is_primary);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 text-white">
      <Link href="/members" className="text-sm text-[#F28C52] hover:underline">
        ← Back to Members
      </Link>

      <div className="mt-6 overflow-hidden rounded-2xl border border-[#F28C52]/20 bg-black/40 shadow-lg">
        {profile.image_url ? (
          <img
            src={profile.image_url}
            alt={profile.name || "Member profile"}
            className="h-72 w-full object-cover"
          />
        ) : (
          <div className="flex h-72 w-full items-center justify-center bg-black/30 text-white/50">
            No profile photo uploaded
          </div>
        )}

        <div className="p-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#F28C52] md:text-4xl">
                {profile.name || "Member"}
              </h1>

              {profile.bio && (
                <p className="mt-3 max-w-2xl whitespace-pre-line text-sm leading-6 text-white/75">
                  {profile.bio}
                </p>
              )}

              {profile.instagram && (
                <a
                  href={`https://instagram.com/${profile.instagram.replace(
                    "@",
                    ""
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block text-sm font-semibold text-[#F28C52] hover:underline"
                >
                  @{profile.instagram.replace("@", "")}
                </a>
              )}
            </div>

            {profile.location && (
              <p className="text-sm text-white/60">{profile.location}</p>
            )}
          </div>

          {/* BADGES */}
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
                        className="mx-auto mb-2 h-28 w-28 object-contain"
                      />
                    ) : (
                      <div className="mx-auto mb-2 flex h-28 w-28 items-center justify-center rounded-full border border-[#F28C52]/40 text-3xl font-bold text-[#F28C52]">
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

          <Section title="Builds">
            {builds.length === 0 ? (
              <p className="text-white/60">No builds added yet.</p>
            ) : (
              <div className="space-y-6">
                {primaryBuild && <MemberBuildCard build={primaryBuild} />}

                {otherBuilds.length > 0 && (
                  <div className="grid gap-4 md:grid-cols-2">
                    {otherBuilds.map((build) => (
                      <MemberBuildCard key={build.id} build={build} compact />
                    ))}
                  </div>
                )}
              </div>
            )}
          </Section>
        </div>
      </div>
    </main>
  );
}

function MemberBuildCard({ build, compact = false }: any) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-black/40">
      {build.image_url && (
        <img
          src={build.image_url}
          alt={`${build.year} ${build.make} ${build.model}`}
          className={
            compact
              ? "h-40 w-full object-cover"
              : "h-64 w-full object-cover"
          }
        />
      )}

      <div className="p-4">
        {build.is_primary && (
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#F28C52]">
            Primary Build
          </p>
        )}

        <h3 className="text-xl font-bold text-white">
          {build.year} {build.make} {build.model}
        </h3>

        {build.nickname && (
          <p className="mt-1 text-sm text-white/60">{build.nickname}</p>
        )}

        {!compact && (
          <>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {buildFields.map((field) => (
                <InfoBlock
                  key={field.key}
                  label={field.label}
                  value={build[field.key]}
                />
              ))}
            </div>

            {build.other_notes && (
              <div className="mt-4 rounded-lg border border-white/10 bg-black/30 p-3">
                <p className="text-xs uppercase tracking-wide text-white/50">
                  Other Build Notes
                </p>
                <p className="mt-1 whitespace-pre-line text-sm leading-6 text-white">
                  {build.other_notes}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: any) {
  return (
    <section className="mt-8 rounded-xl border border-white/10 bg-black/30 p-4">
      <h2 className="mb-4 text-xl font-semibold text-[#F28C52]">{title}</h2>
      {children}
    </section>
  );
}

function InfoBlock({ label, value }: any) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/30 p-3">
      <p className="text-xs uppercase tracking-wide text-white/50">{label}</p>

      <p className="mt-1 whitespace-pre-line text-sm text-white">
        {value && value.trim() ? value : "Not listed"}
      </p>
    </div>
  );
}