"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function ProfileSetupPage() {
  const [userId, setUserId] = useState("");
  const [name, setName] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const { data } = await supabase.auth.getUser();

    if (!data.user) {
      window.location.href = "/login";
      return;
    }

    setUserId(data.user.id);

    const { data: profile } = await supabase
      .from("profiles")
      .select("name, vehicle")
      .eq("user_id", data.user.id)
      .maybeSingle();

    if (profile?.name && profile?.vehicle) {
      window.location.href = "/";
      return;
    }

    setName(profile?.name || "");
    setVehicle(profile?.vehicle || "");
    setLoading(false);
  }

  async function saveProfile() {
    if (!name.trim()) return alert("Name is required.");
    if (!vehicle.trim()) return alert("Vehicle make/model is required.");

    setSaving(true);

    const { error } = await supabase.from("profiles").upsert(
      {
        user_id: userId,
        name: name.trim(),
        vehicle: vehicle.trim(),
      },
      {
        onConflict: "user_id",
      }
    );

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    window.location.href = "/";
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-xl px-4 py-10 text-white">
        <p className="text-white/70">Loading profile setup...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-10 text-white">
      <div className="rounded-2xl border border-[#F28C52]/30 bg-black/45 p-6 shadow-xl">
        <p className="text-xs uppercase tracking-[0.3em] text-[#F28C52]/80">
          Required Setup
        </p>

        <h1 className="mt-2 font-cinzel text-3xl font-bold text-white">
          Complete Your Profile
        </h1>

        <p className="mt-3 text-sm leading-6 text-white/70">
          Before accessing the member app, please add your name and vehicle make/model. This helps other members know who you are and what you drive.
        </p>

        <div className="mt-6 space-y-5">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
              Name Required
            </span>

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="mt-2 w-full rounded-lg border border-white/20 bg-white px-3 py-3 text-black placeholder-gray-500"
            />
          </label>

          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
              Vehicle Make / Model Required
            </span>

            <input
              value={vehicle}
              onChange={(e) => setVehicle(e.target.value)}
              placeholder="Example: 2020 Subaru Ascent"
              className="mt-2 w-full rounded-lg border border-white/20 bg-white px-3 py-3 text-black placeholder-gray-500"
            />
          </label>

          <button
            onClick={saveProfile}
            disabled={saving}
            className="w-full rounded-lg bg-[#F28C52] px-5 py-3 font-semibold text-black transition hover:bg-[#C96A2C] disabled:opacity-60"
          >
            {saving ? "Saving..." : "Complete Registration"}
          </button>
        </div>
      </div>
    </main>
  );
}