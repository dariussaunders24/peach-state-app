"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const emptyForm = {
  nickname: "",
  year: "",
  make: "",
  model: "",
  image_url: "",
  suspension: "",
  tires_wheels: "",
  armor_protection: "",
  recovery_gear: "",
  lighting: "",
  comms: "",
  roof_camp_setup: "",
  future_mods: "",
  other_notes: "",
  is_primary: false,
};

export default function BuildsPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    loadBuilds();
  }, []);

  async function loadBuilds() {
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      window.location.href = "/login";
      return;
    }

    setCurrentUserId(userData.user.id);

    const { data, error } = await supabase
      .from("vehicles")
      .select("*")
      .eq("user_id", userData.user.id)
      .order("is_primary", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    setVehicles(data || []);
    setLoading(false);
  }

  function updateField(field: string, value: any) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function uploadBuildImage(file: File) {
    if (!currentUserId) return alert("You must be logged in.");

    const fileExt = file.name.split(".").pop();
    const fileName = `${currentUserId}-${Date.now()}.${fileExt}`;
    const filePath = `${currentUserId}/builds/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("vehicle-images")
      .upload(filePath, file, { upsert: true });

    if (uploadError) return alert(uploadError.message);

    const { data: publicUrlData } = supabase.storage
      .from("vehicle-images")
      .getPublicUrl(filePath);

    updateField("image_url", publicUrlData.publicUrl);
  }

  async function addVehicle() {
    if (!currentUserId) return;

    const year = form.year.trim();
    const make = form.make.trim();
    const model = form.model.trim();

    if (!year) return alert("Year required");
    if (!make) return alert("Make required");
    if (!model) return alert("Model required");

    if (form.is_primary) {
      await supabase
        .from("vehicles")
        .update({ is_primary: false })
        .eq("user_id", currentUserId);
    }

    const { error } = await supabase.from("vehicles").insert({
      user_id: currentUserId,
      nickname: form.nickname.trim(),
      year,
      make,
      model,
      image_url: form.image_url.trim(),
      suspension: form.suspension.trim(),
      tires_wheels: form.tires_wheels.trim(),
      armor_protection: form.armor_protection.trim(),
      recovery_gear: form.recovery_gear.trim(),
      lighting: form.lighting.trim(),
      comms: form.comms.trim(),
      roof_camp_setup: form.roof_camp_setup.trim(),
      future_mods: form.future_mods.trim(),
      other_notes: form.other_notes.trim(),
      is_primary: form.is_primary,
    });

    if (error) return alert(error.message);

    setForm(emptyForm);
    setShowForm(false);
    await loadBuilds();
  }

  async function setPrimary(vehicleId: string) {
    await supabase
      .from("vehicles")
      .update({ is_primary: false })
      .eq("user_id", currentUserId);

    const { error } = await supabase
      .from("vehicles")
      .update({ is_primary: true })
      .eq("id", vehicleId)
      .eq("user_id", currentUserId);

    if (error) return alert(error.message);

    await loadBuilds();
  }

  async function deleteVehicle(vehicleId: string) {
    if (!confirm("Delete this build and its maintenance records?")) return;

    const { error } = await supabase
      .from("vehicles")
      .delete()
      .eq("id", vehicleId)
      .eq("user_id", currentUserId);

    if (error) return alert(error.message);

    await loadBuilds();
  }

  if (loading) {
    return <p className="text-gray-300">Loading builds...</p>;
  }

  const primaryBuild = vehicles.find((vehicle) => vehicle.is_primary);
  const otherBuilds = vehicles.filter((vehicle) => !vehicle.is_primary);

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-[#F28C52]/30 bg-black/40 p-6">
        <h1 className="text-3xl font-bold text-[#F28C52]">My Builds</h1>

        <p className="mt-3 max-w-3xl text-gray-300">
          Track each rig, build sections, upgrades, notes, and maintenance history.
        </p>

        <button
          onClick={() => setShowForm(!showForm)}
          className="mt-5 rounded-lg bg-[#F28C52] px-5 py-3 font-semibold text-black hover:bg-[#C96A2C]"
        >
          {showForm ? "Close Form" : "Add Build"}
        </button>
      </section>

      {showForm && (
        <section className="space-y-5 rounded-2xl border border-[#F28C52]/30 bg-black/40 p-6">
          <h2 className="text-2xl font-bold text-white">Add Build</h2>

          <input
            type="text"
            placeholder="Build nickname, example: Trail Rig, Daily, Wife's Jeep"
            value={form.nickname}
            onChange={(e) => updateField("nickname", e.target.value)}
            className="w-full rounded-lg border border-white/20 bg-white px-3 py-2 text-black placeholder-gray-500"
          />

          <div className="grid gap-3 md:grid-cols-3">
            <input
              type="text"
              placeholder="Year"
              value={form.year}
              onChange={(e) => updateField("year", e.target.value)}
              className="rounded-lg border border-white/20 bg-white px-3 py-2 text-black placeholder-gray-500"
            />

            <input
              type="text"
              placeholder="Make"
              value={form.make}
              onChange={(e) => updateField("make", e.target.value)}
              className="rounded-lg border border-white/20 bg-white px-3 py-2 text-black placeholder-gray-500"
            />

            <input
              type="text"
              placeholder="Model"
              value={form.model}
              onChange={(e) => updateField("model", e.target.value)}
              className="rounded-lg border border-white/20 bg-white px-3 py-2 text-black placeholder-gray-500"
            />
          </div>

          {form.image_url && (
            <img
              src={form.image_url}
              alt="Build preview"
              className="h-56 w-full rounded-xl object-cover"
            />
          )}

          <label className="block cursor-pointer rounded-lg border border-[#F28C52] px-4 py-3 text-center text-sm font-semibold text-[#F28C52] hover:bg-[#F28C52] hover:text-black">
            Upload Build Image
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadBuildImage(file);
              }}
            />
          </label>

          <BuildFormFields form={form} updateField={updateField} />

          <label className="flex items-center gap-3 text-sm text-gray-300">
            <input
              type="checkbox"
              checked={form.is_primary}
              onChange={(e) => updateField("is_primary", e.target.checked)}
            />
            Set as primary build
          </label>

          <button
            onClick={addVehicle}
            className="rounded-lg bg-[#F28C52] px-5 py-3 font-semibold text-black hover:bg-[#C96A2C]"
          >
            Save Build
          </button>
        </section>
      )}

      {vehicles.length === 0 ? (
        <section className="rounded-2xl border border-white/10 bg-black/30 p-6">
          <p className="text-gray-400">
            No builds added yet. Add your first rig to get started.
          </p>
        </section>
      ) : (
        <div className="space-y-8">
          {primaryBuild && (
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-[#F28C52]">
                Primary Build
              </h2>

              <BuildCard
                vehicle={primaryBuild}
                onSetPrimary={setPrimary}
                onDelete={deleteVehicle}
              />
            </section>
          )}

          {otherBuilds.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white">Other Builds</h2>

              <div className="grid gap-5 md:grid-cols-2">
                {otherBuilds.map((vehicle) => (
                  <BuildCard
                    key={vehicle.id}
                    vehicle={vehicle}
                    onSetPrimary={setPrimary}
                    onDelete={deleteVehicle}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function BuildFormFields({ form, updateField }: any) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <TextArea
        label="Suspension"
        value={form.suspension}
        onChange={(value) => updateField("suspension", value)}
        placeholder="Lift, shocks, springs, control arms, sway bar setup, etc."
      />

      <TextArea
        label="Tires / Wheels"
        value={form.tires_wheels}
        onChange={(value) => updateField("tires_wheels", value)}
        placeholder="Tire size, wheels, spare setup, etc."
      />

      <TextArea
        label="Armor / Protection"
        value={form.armor_protection}
        onChange={(value) => updateField("armor_protection", value)}
        placeholder="Skid plates, sliders, bumpers, diff protection, etc."
      />

      <TextArea
        label="Recovery Gear"
        value={form.recovery_gear}
        onChange={(value) => updateField("recovery_gear", value)}
        placeholder="Winch, straps, soft shackles, traction boards, compressor, etc."
      />

      <TextArea
        label="Lighting"
        value={form.lighting}
        onChange={(value) => updateField("lighting", value)}
        placeholder="Ditch lights, light bars, fogs, rear lights, etc."
      />

      <TextArea
        label="Comms"
        value={form.comms}
        onChange={(value) => updateField("comms", value)}
        placeholder="GMRS radio, antenna, handhelds, mounts, etc."
      />

      <TextArea
        label="Roof / Camp Setup"
        value={form.roof_camp_setup}
        onChange={(value) => updateField("roof_camp_setup", value)}
        placeholder="Rack, awning, tent, storage, fridge, power, etc."
      />

      <TextArea
        label="Future Mods"
        value={form.future_mods}
        onChange={(value) => updateField("future_mods", value)}
        placeholder="Planned upgrades and future goals."
      />

      <div className="md:col-span-2">
        <TextArea
          label="Other Build Notes"
          value={form.other_notes}
          onChange={(value) => updateField("other_notes", value)}
          placeholder="Anything else members should know about this build."
        />
      </div>
    </div>
  );
}

function BuildCard({ vehicle, onSetPrimary, onDelete }: any) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#F28C52]/20 bg-black/40">
      {vehicle.image_url && (
        <img
          src={vehicle.image_url}
          alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
          className="h-56 w-full object-cover"
        />
      )}

      <div className="p-5">
        {vehicle.is_primary && (
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-[#F28C52]">
            Primary
          </p>
        )}

        <h3 className="text-2xl font-bold text-white">
          {vehicle.year} {vehicle.make} {vehicle.model}
        </h3>

        {vehicle.nickname && (
          <p className="mt-1 text-sm text-gray-400">{vehicle.nickname}</p>
        )}

        <div className="mt-5 flex flex-wrap gap-3">
          <a
            href={`/builds/${vehicle.id}`}
            className="rounded-lg border border-[#F28C52] px-4 py-2 font-semibold text-[#F28C52] hover:bg-[#F28C52] hover:text-black"
          >
            View Build
          </a>

          {!vehicle.is_primary && (
            <button
              onClick={() => onSetPrimary(vehicle.id)}
              className="rounded-lg border border-white/20 px-4 py-2 font-semibold text-white hover:border-[#F28C52] hover:text-[#F28C52]"
            >
              Set Primary
            </button>
          )}

          <button
            onClick={() => onDelete(vehicle.id)}
            className="rounded-lg border border-red-400 px-4 py-2 font-semibold text-red-300 hover:bg-red-500 hover:text-white"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
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
        rows={4}
        className="mt-2 w-full rounded-lg border border-white/20 bg-white px-3 py-3 text-black placeholder-gray-500"
      />
    </label>
  );
}