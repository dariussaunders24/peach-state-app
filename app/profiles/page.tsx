"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function ProfilesPage() {
  const [name, setName] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [location, setLocation] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(true);
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

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userData.user.id)
      .maybeSingle();

    if (data) {
      setHasProfile(true);
      setIsEditing(false);
      setName(data.name || "");
      setVehicle(data.vehicle || "");
      setLocation(data.location || "");
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

    let uploadedUrl = imageUrl;

    if (image) {
      const fileName = `${userData.user.id}-${Date.now()}-${image.name}`;

      const { error } = await supabase.storage
        .from("vehicle-images")
        .upload(fileName, image);

      if (error) {
        alert(error.message);
        return;
      }

      const { data } = supabase.storage
        .from("vehicle-images")
        .getPublicUrl(fileName);

      uploadedUrl = data.publicUrl;
      setImageUrl(uploadedUrl);
    }

    const { error } = await supabase.from("profiles").upsert({
      user_id: userData.user.id,
      name: name.trim(),
      vehicle: vehicle.trim(),
      location: location.trim(),
      image_url: uploadedUrl,
    });

    if (error) {
      alert(error.message);
      return;
    }

    setHasProfile(true);
    setIsEditing(false);
    setImage(null);
    await loadProfile();
  }

  if (loading) {
    return <p className="text-gray-300">Loading profile...</p>;
  }

  if (hasProfile && !isEditing) {
    return (
      <div className="max-w-xl rounded-2xl border border-[#F28C52]/30 bg-black/40 p-6">
        <h1 className="text-3xl font-bold text-[#F28C52]">My Profile</h1>

        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Vehicle"
            className="mt-6 h-56 w-full rounded-xl object-cover"
          />
        ) : (
          <div className="mt-6 flex h-56 w-full items-center justify-center rounded-xl border border-white/10 bg-black/30 text-gray-400">
            No vehicle photo uploaded
          </div>
        )}

        <div className="mt-6 space-y-3">
          <div>
            <p className="text-sm text-gray-400">Name</p>
            <p className="text-xl font-semibold text-white">{name}</p>
          </div>

          <div>
            <p className="text-sm text-gray-400">Vehicle</p>
            <p className="text-xl font-semibold text-white">{vehicle}</p>
          </div>

          <div>
            <p className="text-sm text-gray-400">Location</p>
            <p className="text-xl font-semibold text-white">
              {location || "Not listed"}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsEditing(true)}
          className="mt-6 w-full rounded-lg bg-[#F28C52] px-4 py-3 font-semibold text-black hover:bg-[#C96A2C]"
        >
          Edit Profile
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl rounded-2xl border border-[#F28C52]/30 bg-black/40 p-6">
      <h1 className="text-3xl font-bold text-[#F28C52]">
        {hasProfile ? "Edit Profile" : "Create Profile"}
      </h1>

      {!hasProfile && (
        <p className="mt-3 rounded-lg border border-[#F28C52]/30 bg-black/30 p-3 text-sm text-gray-300">
          Create your profile to get started.
        </p>
      )}

      <div className="mt-6 space-y-5">
        <div>
          <label className="mb-2 block text-sm text-gray-200">
            Name <span className="text-[#F28C52]">*</span>
          </label>
          <input
            className="w-full rounded-lg bg-white p-3 text-black"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-gray-200">
            Vehicle <span className="text-[#F28C52]">*</span>
          </label>
          <input
            className="w-full rounded-lg bg-white p-3 text-black"
            value={vehicle}
            onChange={(e) => setVehicle(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-gray-200">Location</label>
          <input
            className="w-full rounded-lg bg-white p-3 text-black"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-gray-200">
            Vehicle Photo
          </label>
          <input
            type="file"
            className="w-full rounded-lg border border-[#F28C52]/30 bg-black/30 p-3 text-gray-200"
            onChange={(e) => setImage(e.target.files?.[0] || null)}
          />
        </div>

        {imageUrl && (
          <img
            src={imageUrl}
            alt="Vehicle"
            className="h-48 w-full rounded-lg object-cover"
          />
        )}

        <div className="flex gap-3">
          <button
            onClick={saveProfile}
            className="flex-1 rounded-lg bg-[#F28C52] px-4 py-3 font-semibold text-black hover:bg-[#C96A2C]"
          >
            Save Profile
          </button>

          {hasProfile && (
            <button
              onClick={() => setIsEditing(false)}
              className="flex-1 rounded-lg border border-white/20 px-4 py-3 font-semibold text-white hover:border-[#F28C52] hover:text-[#F28C52]"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}