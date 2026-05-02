"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function ProfileSetupPage() {
  const [userId, setUserId] = useState("");
  const [name, setName] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [redirectTo, setRedirectTo] = useState("/");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get("redirect");

    if (redirect && redirect.startsWith("/")) {
      setRedirectTo(redirect);
    }

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
      window.location.href = redirect && redirect.startsWith("/") ? redirect : "/";
      return;
    }

    setName(profile?.name || "");
    setVehicle(profile?.vehicle || "");
    setLoading(false);
  }

  function validateForm() {
    const cleanName = name.trim();
    const cleanVehicle = vehicle.trim();

    if (cleanName.length < 2) {
      alert("Please enter your name.");
      return false;
    }

    if (cleanVehicle.length < 5 || cleanVehicle.split(" ").length < 2) {
      alert("Please enter your vehicle year, make, and model. Example: 2020 Subaru Ascent");
      return false;
    }

    return true;
  }

  async function saveProfile() {
    if (!userId) return alert("You must be logged in.");
    if (!validateForm()) return;

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

    window.location.href = redirectTo;
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
        <div className="mb-5 rounded-full border border-[#F28C52]/30 bg-[#F28C52]/10 px-4 py-2 text-center text-xs font-semibold uppercase tracking-[0.25em] text-[#F28C52]">
          Step 1 of 1
        </div>

        <p className="text-xs uppercase tracking-[0.3em] text-[#F28C52]/80">
          Required Setup
        </p>

        <h1 className="mt-2 font-cinzel text-3xl font-bold text-white">
          Complete Your Profile
        </h1>

        <p className="mt-3 text-sm leading-6 text-white/70">
          This takes about 10 seconds. Before entering the member app, add your name and vehicle so other members know who you are and what you drive.
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

            <p className="mt-2 text-xs text-white/45">
              This will be shown on your member profile.
            </p>
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

            <p className="mt-2 text-xs text-white/45">
              Include year, make, and model when possible.
            </p>
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