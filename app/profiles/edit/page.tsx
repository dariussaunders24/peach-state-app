"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type ProfileForm = {
  name: string;
  location: string;
  vehicle: string;
  rig_name: string;
  mods: string;
  recovery_gear: string;
  experience_level: string;
  image_url: string;
};

export default function EditProfilePage() {
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState<ProfileForm>({
    name: "",
    location: "",
    vehicle: "",
    rig_name: "",
    mods: "",
    recovery_gear: "",
    experience_level: "",
    image_url: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
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
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error loading profile:", error.message);
    }

    if (data) {
      setForm({
        name: data.name || "",
        location: data.location || "",
        vehicle: data.vehicle || "",
        rig_name: data.rig_name || "",
        mods: data.mods || "",
        recovery_gear: data.recovery_gear || "",
        experience_level: data.experience_level || "",
        image_url: data.image_url || "",
      });
    }

    setLoading(false);
  }

  async function uploadProfileImage(file: File) {
    if (!userId) return alert("You must be logged in.");
    if (!file) return;

    setUploading(true);

    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("vehicle-images")
      .upload(filePath, file, {
        upsert: true,
      });

    if (uploadError) {
      setUploading(false);
      alert(uploadError.message);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("vehicle-images")
      .getPublicUrl(filePath);

    setForm((prev) => ({
      ...prev,
      image_url: publicUrlData.publicUrl,
    }));

    setUploading(false);
  }

  async function saveProfile() {
    if (!userId) return alert("You must be logged in.");
    if (!form.name.trim()) return alert("Name is required.");

    setSaving(true);

    const { error } = await supabase.from("profiles").upsert(
      {
        user_id: userId,
        name: form.name.trim(),
        location: form.location.trim(),
        vehicle: form.vehicle.trim(),
        rig_name: form.rig_name.trim(),
        mods: form.mods.trim(),
        recovery_gear: form.recovery_gear.trim(),
        experience_level: form.experience_level.trim(),
        image_url: form.image_url.trim(),
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

    window.location.href = "/profiles";
  }

  function updateField(field: keyof ProfileForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-8 text-white">
        <div className="rounded-2xl border border-white/10 bg-black/40 p-6 text-white/70">
          Loading profile...
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 text-white">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.3em] text-[#F28C52]/80">
          Member Build Profile
        </p>

        <h1 className="mt-2 font-cinzel text-3xl font-bold text-white md:text-4xl">
          Edit My Profile
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">
          Update your member info, rig photo, build name, vehicle setup, and recovery gear.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        {/* IMAGE / PREVIEW CARD */}
        <section className="overflow-hidden rounded-2xl border border-white/10 bg-black/45 shadow-xl backdrop-blur">
          {form.image_url ? (
            <img
              src={form.image_url}
              alt={form.rig_name || form.vehicle || "Rig photo"}
              className="h-72 w-full object-cover md:h-96"
            />
          ) : (
            <div className="flex h-72 w-full items-center justify-center bg-white/5 md:h-96">
              <p className="text-sm text-white/40">No rig image uploaded yet</p>
            </div>
          )}

          <div className="space-y-4 p-5">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-white/50">
                Build Name
              </p>

              <p className="mt-1 text-2xl font-bold leading-tight text-[#F28C52]">
                {form.rig_name || "Unnamed Build"}
              </p>
            </div>

            <div className="border-t border-white/10 pt-4">
              <p className="text-xs uppercase tracking-[0.25em] text-white/50">
                Vehicle
              </p>

              <p className="mt-1 text-base text-white">
                {form.vehicle || "Vehicle not listed"}
              </p>
            </div>

            <label className="block cursor-pointer rounded-lg border border-[#F28C52] px-4 py-3 text-center text-sm font-semibold text-[#F28C52] transition hover:bg-[#F28C52] hover:text-black">
              {uploading ? "Uploading..." : "Upload Rig Image"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadProfileImage(file);
                }}
              />
            </label>

            <p className="text-xs leading-5 text-white/45">
              This image will appear on your member profile card.
            </p>
          </div>
        </section>

        {/* FORM CARD */}
        <section className="space-y-6 rounded-2xl border border-white/10 bg-black/45 p-5 shadow-xl backdrop-blur">
          <FormSection title="Member Info">
            <Field
              label="Name"
              value={form.name}
              onChange={(value) => updateField("name", value)}
              placeholder="Your name"
            />

            <Field
              label="Location"
              value={form.location}
              onChange={(value) => updateField("location", value)}
              placeholder="City / area"
            />

            <Field
              label="Experience Level"
              value={form.experience_level}
              onChange={(value) => updateField("experience_level", value)}
              placeholder="Beginner, Intermediate, Advanced"
            />
          </FormSection>

          <FormSection title="Rig Build">
            <Field
              label="Build Name"
              value={form.rig_name}
              onChange={(value) => updateField("rig_name", value)}
              placeholder="MtnRoo, Trail Pig, etc."
            />

            <Field
              label="Vehicle"
              value={form.vehicle}
              onChange={(value) => updateField("vehicle", value)}
              placeholder="2020 Subaru Ascent, Jeep Wrangler, Tacoma, etc."
            />

            <TextArea
              label="Mods / Setup"
              value={form.mods}
              onChange={(value) => updateField("mods", value)}
              placeholder="Lift, tires, armor, lights, suspension, comms, racks, storage, etc."
            />
          </FormSection>

          <FormSection title="Recovery Setup">
            <TextArea
              label="Recovery Gear"
              value={form.recovery_gear}
              onChange={(value) => updateField("recovery_gear", value)}
              placeholder="Winch, straps, soft shackles, traction boards, compressor, tire repair kit, tools, etc."
            />
          </FormSection>

          <div className="flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row">
            <button
              onClick={saveProfile}
              disabled={saving || uploading}
              className="rounded-lg bg-[#F28C52] px-5 py-3 font-semibold text-black transition hover:bg-[#C96A2C] disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Profile"}
            </button>

            <a
              href="/profiles"
              className="rounded-lg border border-white/20 px-5 py-3 text-center font-semibold text-white transition hover:border-[#F28C52] hover:text-[#F28C52]"
            >
              Cancel
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}

function FormSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4 border-b border-white/10 pb-6 last:border-b-0 last:pb-0">
      <h2 className="font-cinzel text-xl font-bold text-[#F28C52]">
        {title}
      </h2>

      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
        {label}
      </span>

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-lg border border-white/20 bg-white px-3 py-3 text-black placeholder-gray-500"
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
        {label}
      </span>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={5}
        className="mt-2 w-full rounded-lg border border-white/20 bg-white px-3 py-3 text-black placeholder-gray-500"
      />
    </label>
  );
}