"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase";

type Profile = {
  user_id: string;
  name: string | null;
  vehicle: string | null;
  location: string | null;
  image_url: string | null;
  is_banned?: boolean | null;
};

export default function MembersPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfiles();
  }, []);

  async function loadProfiles() {
    setLoading(true);

    const { data, error } = await supabase
      .from("profiles")
      .select("user_id, name, vehicle, location, image_url, is_banned")
      .eq("is_banned", false) // 🔥 hide banned users
      .order("name", { ascending: true });

    if (error) {
      console.error("Error loading profiles:", error.message);
    } else {
      setProfiles(data || []);
    }

    setLoading(false);
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-10 text-white">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-[#F28C52]">
          Members
        </h1>
        <p className="mt-2 text-white/70">
          Connect with other Peach State Off-Road and Overlanding members.
        </p>
      </div>

      {/* Loading */}
      {loading && <p className="text-white/70">Loading members...</p>}

      {/* Empty */}
      {!loading && profiles.length === 0 && (
        <div className="rounded-2xl border border-[#F28C52]/20 bg-black/30 p-6">
          <p className="text-white/70">No active members found.</p>
        </div>
      )}

      {/* Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {profiles.map((profile) => (
          <Link
            key={profile.user_id}
            href={`/members/${profile.user_id}`}
            className="rounded-2xl border border-[#F28C52]/20 bg-black/35 p-5 shadow-lg transition hover:border-[#F28C52]/60 hover:bg-black/50"
          >
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 overflow-hidden rounded-full border border-[#F28C52]/40 bg-black/50">
                {profile.image_url ? (
                  <img
                    src={profile.image_url}
                    alt={profile.name || "Member"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xl font-bold text-[#F28C52]">
                    {(profile.name || "M").charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-lg font-semibold text-white">
                  {profile.name || "Unnamed Member"}
                </h2>
                <p className="text-sm text-white/60">
                  {profile.location || "Location not added"}
                </p>
              </div>
            </div>

            {/* Vehicle */}
            <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="text-xs uppercase tracking-wide text-[#F28C52]">
                Vehicle
              </p>
              <p className="mt-1 text-sm text-white/80">
                {profile.vehicle || "Vehicle not added"}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}