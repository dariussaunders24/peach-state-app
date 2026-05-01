"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Profile = {
  id?: string;
  user_id?: string;
  name?: string;
  location?: string;
  vehicle?: string;
  rig_name?: string;
  image_url?: string;
  suspension?: string;
  tires_wheels?: string;
  armor_protection?: string;
  lighting?: string;
  recovery_gear?: string;
  comms?: string;
  roof_camp_setup?: string;
  future_mods?: string;
  build_notes?: string;
};

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState("");

  useEffect(() => {
    loadPage();
  }, []);

  async function loadPage() {
    setLoading(true);

    const { data: userData } = await supabase.auth.getUser();

    if (userData.user) {
      setCurrentUserId(userData.user.id);
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error("Error loading profiles:", error.message);
      setProfiles([]);
    } else {
      setProfiles(data || []);
    }

    setLoading(false);
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[#F28C52]/80">
            Peach State Members
          </p>

          <h1 className="mt-2 font-cinzel text-3xl font-bold text-white md:text-4xl">
            Member Profiles
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">
            Explore member rigs, builds, locations, and setups from the Peach State Off-Road and Overlanding community.
          </p>
        </div>

        {currentUserId && (
          <a
            href="/profiles/edit"
            className="rounded-lg border border-[#F28C52] px-5 py-3 text-center text-sm font-semibold text-[#F28C52] transition hover:bg-[#F28C52] hover:text-black"
          >
            Edit My Profile
          </a>
        )}
      </div>

      {loading ? (
        <div className="rounded-2xl border border-white/10 bg-black/40 p-6 text-white/70">
          Loading member profiles...
        </div>
      ) : profiles.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-black/40 p-6 text-white/70">
          No member profiles found yet.
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-2">
          {profiles.map((profile) => (
            <article
              key={profile.id || profile.user_id}
              className="overflow-hidden rounded-2xl border border-white/10 bg-black/45 shadow-xl backdrop-blur transition hover:border-[#F28C52]/40"
            >
              {profile.image_url ? (
                <img
                  src={profile.image_url}
                  alt={profile.rig_name || profile.vehicle || "Member rig"}
                  className="h-72 w-full object-cover md:h-96"
                />
              ) : (
                <div className="flex h-72 w-full items-center justify-center bg-white/5 md:h-96">
                  <p className="text-sm text-white/40">No rig image yet</p>
                </div>
              )}

              <div className="border-b border-white/10 px-5 py-5">
                <p className="text-xs uppercase tracking-[0.25em] text-white/50">
                  Member
                </p>

                <h2 className="mt-1 font-cinzel text-2xl font-bold leading-tight text-white">
                  {profile.name || "Unnamed Member"}
                </h2>

                <p className="mt-2 text-xl font-bold text-[#F28C52]">
                  {profile.rig_name || "Unnamed Build"}
                </p>

                <p className="mt-1 text-sm text-white/70">
                  {profile.vehicle || "Vehicle not listed"}
                </p>

                {profile.location && (
                  <p className="mt-1 text-sm text-white/50">
                    {profile.location}
                  </p>
                )}
              </div>

              <div className="space-y-6 p-5">
                <section className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <h3 className="font-cinzel text-xl font-bold text-[#F28C52]">
                    Rig Build
                  </h3>

                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <BuildBlock label="Suspension" value={profile.suspension} />
                    <BuildBlock label="Tires / Wheels" value={profile.tires_wheels} />
                    <BuildBlock label="Armor / Protection" value={profile.armor_protection} />
                    <BuildBlock label="Lighting" value={profile.lighting} />
                    <BuildBlock label="Recovery Gear" value={profile.recovery_gear} />
                    <BuildBlock label="Comms" value={profile.comms} />
                    <BuildBlock label="Roof / Camp Setup" value={profile.roof_camp_setup} />
                    <BuildBlock label="Future Mods" value={profile.future_mods} />
                  </div>
                </section>

                <section className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <h3 className="font-cinzel text-xl font-bold text-[#F28C52]">
                    Additional Build Notes
                  </h3>

                  <p className="mt-4 whitespace-pre-line text-sm leading-6 text-white/80">
                    {profile.build_notes || "No additional build notes listed."}
                  </p>
                </section>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}

function BuildBlock({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/40 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-white/50">
        {label}
      </p>

      <p className="mt-2 whitespace-pre-line text-sm font-semibold leading-6 text-white">
        {value && value.trim() ? value : "Not listed"}
      </p>
    </div>
  );
}