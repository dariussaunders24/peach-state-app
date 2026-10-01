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

export default function TheTrailheadAdminPage() {
  const [settings, setSettings] = useState<TrailheadSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadSettings();
  }, []);

  async function getAccessToken() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    return session?.access_token || null;
  }

  async function loadSettings() {
    setLoading(true);
    setError("");

    try {
      const token = await getAccessToken();

      if (!token) {
        setError("You must be signed in as an administrator.");
        setLoading(false);
        return;
      }

      const response = await fetch("/api/admin/thetrailhead-settings", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data?.error || "Unable to load Trailhead settings.");
        setLoading(false);
        return;
      }

      setSettings(data.settings);
    } catch (loadError) {
      console.error("Trailhead settings load error:", loadError);
      setError("Unable to load Trailhead settings.");
    }

    setLoading(false);
  }

  function updateField(
    field: keyof TrailheadSettings,
    value: string
  ) {
    if (!settings) return;

    setSettings({
      ...settings,
      [field]: value,
    });
  }

  async function saveSettings() {
    if (!settings) return;

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const token = await getAccessToken();

      if (!token) {
        setError("Your session has expired. Please sign in again.");
        setSaving(false);
        return;
      }

      const response = await fetch("/api/admin/thetrailhead-settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: settings.id,
          event_date: settings.event_date,
          start_time: settings.start_time,
          end_time: settings.end_time,
          venue_name: settings.venue_name,
          address: settings.address,
          announcement: settings.announcement,
          special_feature: settings.special_feature,
          event_image: settings.event_image,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data?.error || "Unable to save Trailhead settings.");
        setSaving(false);
        return;
      }

      setSettings(data.settings);
      setMessage("Trailhead settings saved successfully.");
    } catch (saveError) {
      console.error("Trailhead settings save error:", saveError);
      setError("Unable to save Trailhead settings.");
    }

    setSaving(false);
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10 text-white">
        <p>Loading Trailhead settings...</p>
      </main>
    );
  }

  if (error && !settings) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10 text-white">
        <h1 className="font-cinzel text-3xl font-bold text-[#F28C52]">
          Trailhead Management
        </h1>

        <div className="mt-6 rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-red-200">
          {error}
        </div>
      </main>
    );
  }

  if (!settings) {
    return null;
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 text-white">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#F28C52]">
          Admin
        </p>

        <h1 className="mt-2 font-cinzel text-3xl font-bold">
          Trailhead Management
        </h1>

        <p className="mt-3 max-w-3xl text-white/60">
          Manage the information displayed on the public Trailhead website.
          Changes saved here will be used for the next Trailhead meet.
        </p>
      </div>

      {message && (
        <div className="mt-6 rounded-xl border border-green-400/30 bg-green-500/10 p-4 text-green-200">
          {message}
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-red-200">
          {error}
        </div>
      )}

      {/* NEXT MEET */}
      <section className="mt-8 rounded-2xl border border-white/10 bg-black/40 p-5 md:p-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#F28C52]">
            Event Details
          </p>

          <h2 className="mt-2 text-2xl font-bold text-white">
            Next Trailhead Meet
          </h2>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-3">
          <Field label="Date">
            <input
              type="date"
              value={settings.event_date || ""}
              onChange={(e) => updateField("event_date", e.target.value)}
              className="w-full rounded-lg border border-white/15 bg-white px-3 py-2.5 text-black"
            />
          </Field>

          <Field label="Start Time">
            <input
              type="time"
              value={settings.start_time?.slice(0, 5) || ""}
              onChange={(e) => updateField("start_time", e.target.value)}
              className="w-full rounded-lg border border-white/15 bg-white px-3 py-2.5 text-black"
            />
          </Field>

          <Field label="End Time">
            <input
              type="time"
              value={settings.end_time?.slice(0, 5) || ""}
              onChange={(e) => updateField("end_time", e.target.value)}
              className="w-full rounded-lg border border-white/15 bg-white px-3 py-2.5 text-black"
            />
          </Field>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <Field label="Venue Name">
            <input
              type="text"
              value={settings.venue_name || ""}
              onChange={(e) => updateField("venue_name", e.target.value)}
              placeholder="Revolution Auto Service"
              className="w-full rounded-lg border border-white/15 bg-white px-3 py-2.5 text-black"
            />
          </Field>

          <Field label="Address">
            <input
              type="text"
              value={settings.address || ""}
              onChange={(e) => updateField("address", e.target.value)}
              placeholder="Event address"
              className="w-full rounded-lg border border-white/15 bg-white px-3 py-2.5 text-black"
            />
          </Field>
        </div>
      </section>

      {/* MONTHLY CONTENT */}
      <section className="mt-6 rounded-2xl border border-white/10 bg-black/40 p-5 md:p-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#F28C52]">
            Monthly Content
          </p>

          <h2 className="mt-2 text-2xl font-bold text-white">
            Announcement & Features
          </h2>

          <p className="mt-2 text-sm text-white/50">
            Use these fields for information that changes from one Trailhead
            meet to the next.
          </p>
        </div>

        <div className="mt-6 space-y-5">
          <Field label="Announcement">
            <textarea
              value={settings.announcement || ""}
              onChange={(e) => updateField("announcement", e.target.value)}
              placeholder="Optional announcement for the next Trailhead..."
              rows={4}
              className="w-full rounded-lg border border-white/15 bg-white px-3 py-2.5 text-black"
            />
          </Field>

          <Field label="Special Feature">
            <textarea
              value={settings.special_feature || ""}
              onChange={(e) => updateField("special_feature", e.target.value)}
              placeholder="Example: Free campfire and s'mores sponsored by OnX Offroad"
              rows={3}
              className="w-full rounded-lg border border-white/15 bg-white px-3 py-2.5 text-black"
            />
          </Field>

          <Field label="Event Image">
            <input
              type="text"
              value={settings.event_image || ""}
              onChange={(e) => updateField("event_image", e.target.value)}
              placeholder="/trailhead-logo.png"
              className="w-full rounded-lg border border-white/15 bg-white px-3 py-2.5 text-black"
            />

            <p className="mt-2 text-xs text-white/40">
              Enter a public image path such as /trailhead-logo.png.
            </p>
          </Field>
        </div>
      </section>

      {/* SAVE */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={saveSettings}
          disabled={saving}
          className="rounded-xl bg-[#F28C52] px-6 py-3 font-bold text-black transition hover:bg-[#C96A2C] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Trailhead Settings"}
        </button>

        <a
          href="/thetrailhead"
          target="_blank"
          rel="noreferrer"
          className="rounded-xl border border-white/15 px-6 py-3 text-center font-bold text-white transition hover:border-[#F28C52]/50 hover:text-[#F28C52]"
        >
          View Public Trailhead
        </a>
      </div>
    </main>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-white">
        {label}
      </span>

      {children}
    </label>
  );
}