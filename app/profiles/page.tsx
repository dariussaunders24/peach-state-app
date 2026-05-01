"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function ProfilesPage() {
  const [name, setName] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [mods, setMods] = useState("");
  const [instagram, setInstagram] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      window.location.href = "/login";
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userData.user.id)
      .maybeSingle();

    if (error) {
      console.error("Error loading profile:", error.message);
    }

    if (data) {
      setHasProfile(true);
      setIsEditing(false);
      setName(data.name || "");
      setVehicle(data.vehicle || "");
      setLocation(data.location || "");
      setBio(data.bio || "");
      setMods(data.mods || "");
      setInstagram(data.instagram || "");
      setImageUrl(data.image_url || "");
    } else {
      setHasProfile(false);
      setIsEditing(true);
    }

    setLoading(false);
  }

  async function saveProfile() {
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      window.location.href = "/login";
      return;
    }

    if (!name.trim()) {
      alert("Name is required.");
      return;
    }

    if (!vehicle.trim()) {
      alert("Vehicle is required.");
      return;
    }

    setSaving(true);

    let uploadedUrl = imageUrl;

    if (image) {
      const fileName = `${userData.user.id}-${Date.now()}-${image.name}`;

      const { error: uploadError } = await supabase.storage
        .from("vehicle-images")
        .upload(fileName, image);

      if (uploadError) {
        setSaving(false);
        alert(uploadError.message);
        return;
      }

      const { data } = supabase.storage
        .from("vehicle-images")
        .getPublicUrl(fileName);

      uploadedUrl = data.publicUrl;
      setImageUrl(uploadedUrl);
    }

    const cleanInstagram = instagram.trim().replace("@", "");

    const { error } = await supabase.from("profiles").upsert({
      user_id: userData.user.id,
      name: name.trim(),
      vehicle: vehicle.trim(),
      location: location.trim(),
      bio: bio.trim(),
      mods: mods.trim(),
      instagram: cleanInstagram,
      image_url: uploadedUrl,
    });

    if (error) {
      setSaving(false);
      alert(error.message);
      return;
    }

    setHasProfile(true);
    setIsEditing(false);
    setImage(null);
    setSaving(false);
    await loadProfile();
  }

  if (loading) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-10 text-white">
        <p className="text-white/70">Loading profile...</p>
      </main>
    );
  }

  if (hasProfile && !isEditing) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-10 text-white">
        <div className="rounded-2xl border border-[#F28C52]/30 bg-black/40 p-6 shadow-lg">
          <h1 className="text-3xl md:text-4xl font-bold text-[#F28C52]">
            My Profile
          </h1>

          {imageUrl ? (
            <img
              src={imageUrl}
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
                Name
              </p>
              <p className="text-xl font-semibold text-white">{name}</p>
            </div>

            <div>
              <p className="text-sm uppercase tracking-wide text-white/50">
                Vehicle
              </p>
              <p className="text-xl font-semibold text-white">{vehicle}</p>
            </div>

            <div>
              <p className="text-sm uppercase tracking-wide text-white/50">
                Location
              </p>
              <p className="text-xl font-semibold text-white">
                {location || "Not listed"}
              </p>
            </div>

            {bio && (
              <div>
                <p className="text-sm uppercase tracking-wide text-white/50">
                  About
                </p>
                <p className="mt-1 text-white/90 whitespace-pre-line">{bio}</p>
              </div>
            )}

            {mods && (
              <div>
                <p className="text-sm uppercase tracking-wide text-white/50">
                  Build / Mods
                </p>
                <p className="mt-1 text-white/90 whitespace-pre-line">{mods}</p>
              </div>
            )}

            {instagram && (
              <div>
                <p className="text-sm uppercase tracking-wide text-white/50">
                  Instagram
                </p>
                <a
                  href={`https://instagram.com/${instagram.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#F28C52] hover:underline"
                >
                  @{instagram.replace("@", "")}
                </a>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsEditing(true)}
            className="mt-8 w-full rounded-lg bg-[#F28C52] px-4 py-3 font-semibold text-black transition hover:bg-[#C96A2C]"
          >
            Edit Profile
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 text-white">
      <div className="rounded-2xl border border-[#F28C52]/30 bg-black/40 p-6 shadow-lg">
        <h1 className="text-3xl md:text-4xl font-bold text-[#F28C52]">
          {hasProfile ? "Edit Profile" : "Create Profile"}
        </h1>

        {!hasProfile && (
          <p className="mt-3 rounded-lg border border-[#F28C52]/30 bg-black/30 p-3 text-sm text-white/70">
            Create your profile so other Peach State members can see your ride.
          </p>
        )}

        <div className="mt-6 space-y-5">
          <div>
            <label className="mb-2 block text-sm text-white/80">
              Name <span className="text-[#F28C52]">*</span>
            </label>
            <input
              className="w-full rounded-lg bg-white p-3 text-black"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-white/80">
              Vehicle <span className="text-[#F28C52]">*</span>
            </label>
            <input
              className="w-full rounded-lg bg-white p-3 text-black"
              value={vehicle}
              onChange={(e) => setVehicle(e.target.value)}
              placeholder="2020 Subaru Ascent, Tacoma, Wrangler, etc."
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-white/80">
              Location
            </label>
            <input
              className="w-full rounded-lg bg-white p-3 text-black"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, State"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-white/80">
              Bio / About
            </label>
            <textarea
              className="min-h-28 w-full rounded-lg bg-white p-3 text-black"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell members a little about you, your off-road experience, or what kind of rides you enjoy."
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-white/80">
              Build / Mods
            </label>
            <textarea
              className="min-h-32 w-full rounded-lg bg-white p-3 text-black"
              value={mods}
              onChange={(e) => setMods(e.target.value)}
              placeholder="Lift, tires, recovery gear, lighting, armor, comms, etc."
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-white/80">
              Instagram
            </label>
            <input
              className="w-full rounded-lg bg-white p-3 text-black"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              placeholder="@username"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-white/80">
              Vehicle Photo
            </label>
            <input
              type="file"
              accept="image/*"
              className="w-full rounded-lg border border-[#F28C52]/30 bg-black/30 p-3 text-white/80"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
            />
          </div>

          {imageUrl && (
            <img
              src={imageUrl}
              alt="Vehicle"
              className="h-52 w-full rounded-lg object-cover"
            />
          )}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={saveProfile}
              disabled={saving}
              className="flex-1 rounded-lg bg-[#F28C52] px-4 py-3 font-semibold text-black transition hover:bg-[#C96A2C] disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Profile"}
            </button>

            {hasProfile && (
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 rounded-lg border border-white/20 px-4 py-3 font-semibold text-white transition hover:border-[#F28C52] hover:text-[#F28C52]"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}