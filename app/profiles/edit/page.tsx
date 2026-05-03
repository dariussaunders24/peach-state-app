"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type ProfileForm = {
  name: string;
  location: string;
  bio: string;
  instagram: string;
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
    bio: "",
    instagram: "",
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
        bio: data.bio || "",
        instagram: data.instagram || "",
        image_url: data.image_url || "",
      });
    }

    setLoading(false);
  }

  async function uploadProfileImage(file: File) {
    if (!userId) return alert("You must be logged in.");

    setUploading(true);

    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `${userId}/profile/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("vehicle-images")
      .upload(filePath, file, { upsert: true });

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
        bio: form.bio.trim(),
        instagram: form.instagram.trim(),
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
          Member Profile
        </p>

        <h1 className="mt-2 font-cinzel text-3xl font-bold text-white md:text-4xl">
          Edit My Profile
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">
          Update your personal info shown to other members.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <section className="overflow-hidden rounded-2xl border border-white/10 bg-black/45">
          {form.image_url ? (
            <img
              src={form.image_url}
              alt="Profile"
              className="h-72 w-full object-cover md:h-96"
            />
          ) : (
            <div className="flex h-72 w-full items-center justify-center bg-white/5">
              <p className="text-sm text-white/40">No profile image uploaded</p>
            </div>
          )}

          <div className="p-5">
            <label className="block cursor-pointer rounded-lg border border-[#F28C52] px-4 py-3 text-center text-sm font-semibold text-[#F28C52] hover:bg-[#F28C52] hover:text-black">
              {uploading ? "Uploading..." : "Upload Profile Image"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadProfileImage(file);
                }}
              />
            </label>
          </div>
        </section>

        <section className="space-y-6 rounded-2xl border border-white/10 bg-black/45 p-5">
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
            label="Instagram"
            value={form.instagram}
            onChange={(value) => updateField("instagram", value)}
            placeholder="@username"
          />

          <TextArea
            label="Bio"
            value={form.bio}
            onChange={(value) => updateField("bio", value)}
            placeholder="Tell the group about yourself..."
          />

          <button
            onClick={saveProfile}
            disabled={saving}
            className="w-full rounded-lg bg-[#F28C52] px-5 py-3 font-semibold text-black hover:bg-[#C96A2C]"
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </section>
      </div>
    </main>
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
    <label>
      <span className="text-xs uppercase text-white/50">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-lg bg-white px-3 py-3 text-black"
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
    <label>
      <span className="text-xs uppercase text-white/50">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        className="mt-2 w-full rounded-lg bg-white px-3 py-3 text-black"
      />
    </label>
  );
}