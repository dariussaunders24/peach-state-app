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
  mods?: string | null;
  instagram?: string | null;
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
  const [allBadges, setAllBadges] = useState<Badge[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, [id]);

  async function loadProfile() {
    setLoading(true);

    const { data: userData } = await supabase.auth.getUser();

    if (userData.user?.email === "dariussaunders24@gmail.com") {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }

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

    const { data: badgeList, error: badgeListError } = await supabase
      .from("badges")
      .select("id, name, description, image_url")
      .order("name", { ascending: true });

    if (badgeListError) {
      console.error("Error loading all badges:", badgeListError.message);
    }

    setProfile(profileData || null);
    setBadges(earnedBadges);
    setAllBadges(badgeList || []);
    setLoading(false);
  }

  async function assignBadge(badgeId: string) {
    const { error } = await supabase.from("member_badges").insert({
      user_id: id,
      badge_id: badgeId,
    });

    // 23505 means the badge is already assigned
    if (error && error.code !== "23505") {
      alert(error.message);
      return;
    }

    await loadProfile();
  }

  async function removeBadge(badgeId: string) {
    const { error } = await supabase
      .from("member_badges")
      .delete()
      .eq("user_id", id)
      .eq("badge_id", badgeId);

    if (error) {
      alert(error.message);
      return;
    }

    await loadProfile();
  }

  if (loading) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-10 text-white">
        <p className="text-white/70">Loading profile...</p>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-10 text-white">
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

  const earnedBadgeIds = badges.map((badge) => badge.id);

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 text-white">
      <Link href="/members" className="text-sm text-[#F28C52] hover:underline">
        ← Back to Members
      </Link>

      <div className="mt-6 rounded-2xl border border-[#F28C52]/20 bg-black/40 p-6 shadow-lg">
        <h1 className="text-3xl md:text-4xl font-bold text-[#F28C52]">
          {profile.name || "Member"}
        </h1>

        {profile.image_url ? (
          <img
            src={profile.image_url}
            alt="Vehicle"
            className="mt-6 h-64 w-full rounded-xl object-cover"
          />
        ) : (
          <div className="mt-6 flex h-64 w-full items-center justify-center rounded-xl border border-white/10 bg-black/30 text-white/50">
            No vehicle photo uploaded
          </div>
        )}

        <div className="mt-6 space-y-5">
          <div>
            <p className="text-sm uppercase tracking-wide text-white/50">
              Vehicle
            </p>
            <p className="text-xl font-semibold text-white">
              {profile.vehicle || "Not listed"}
            </p>
          </div>

          <div>
            <p className="text-sm uppercase tracking-wide text-white/50">
              Location
            </p>
            <p className="text-xl font-semibold text-white">
              {profile.location || "Not listed"}
            </p>
          </div>

          {profile.bio && (
            <div>
              <p className="text-sm uppercase tracking-wide text-white/50">
                About
              </p>
              <p className="mt-1 whitespace-pre-line text-white/90">
                {profile.bio}
              </p>
            </div>
          )}

          {profile.mods && (
            <div>
              <p className="text-sm uppercase tracking-wide text-white/50">
                Build / Mods
              </p>
              <p className="mt-1 whitespace-pre-line text-white/90">
                {profile.mods}
              </p>
            </div>
          )}

          {profile.instagram && (
            <div>
              <p className="text-sm uppercase tracking-wide text-white/50">
                Instagram
              </p>
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
            </div>
          )}
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold text-[#F28C52]">Badges</h2>

          {badges.length === 0 && (
            <p className="mt-2 text-white/60">No badges yet.</p>
          )}

          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className="rounded-xl border border-[#F28C52]/30 bg-black/30 p-3 text-center"
              >
                {badge.image_url ? (
                  <img
                    src={badge.image_url}
                    alt={badge.name}
                    className="mx-auto mb-2 h-16 w-16 object-contain"
                  />
                ) : (
                  <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full border border-[#F28C52]/40 text-xl font-bold text-[#F28C52]">
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

                {isAdmin && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeBadge(badge.id);
                    }}
                    className="relative z-50 mt-3 rounded-lg border border-red-400/40 px-3 py-1 text-xs text-red-300 transition hover:bg-red-500 hover:text-white"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {isAdmin && (
          <div className="relative z-50 mt-8 rounded-xl border border-[#F28C52]/20 bg-black/30 p-4">
            <h3 className="text-lg font-semibold text-[#F28C52]">
              Assign Badge
            </h3>

            <div className="relative z-50 mt-3 flex flex-wrap gap-2">
              {allBadges.map((badge) => {
                const alreadyEarned = earnedBadgeIds.includes(badge.id);

                return (
                  <button
                    key={badge.id}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      assignBadge(badge.id);
                    }}
                    className={`relative z-50 rounded-lg border px-3 py-2 text-sm transition ${
                      alreadyEarned
                        ? "border-[#F28C52]/20 bg-[#F28C52]/10 text-[#F28C52]"
                        : "border-[#F28C52]/40 text-white hover:bg-[#F28C52] hover:text-black"
                    }`}
                  >
                    {alreadyEarned ? `${badge.name} ✓` : badge.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}