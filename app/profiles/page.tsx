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

  const [rigName, setRigName] = useState("");
  const [suspension, setSuspension] = useState("");
  const [tires, setTires] = useState("");
  const [armor, setArmor] = useState("");
  const [lighting, setLighting] = useState("");
  const [recoveryGear, setRecoveryGear] = useState("");
  const [comms, setComms] = useState("");
  const [roofCampSetup, setRoofCampSetup] = useState("");
  const [futureMods, setFutureMods] = useState("");

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

      setRigName(data.rig_name || "");
      setSuspension(data.suspension || "");
      setTires(data.tires || "");
      setArmor(data.armor || "");
      setLighting(data.lighting || "");
      setRecoveryGear(data.recovery_gear || "");
      setComms(data.comms || "");
      setRoofCampSetup(data.roof_camp_setup || "");
      setFutureMods(data.future_mods || "");

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
      rig_name: rigName.trim(),
      suspension: suspension.trim(),
      tires: tires.trim(),
      armor: armor.trim(),
      lighting: lighting.trim(),
      recovery_gear: recoveryGear.trim(),
      comms: comms.trim(),
      roof_camp_setup: roofCampSetup.trim(),
      future_mods: futureMods.trim(),
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
      <main className="max-w-4xl mx-auto px-4 py-10 text-white">
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

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <InfoBlock label="Name" value={name} />
            <InfoBlock label="Vehicle" value={vehicle} />
            <InfoBlock label="Rig Name" value={rigName || "Not listed"} />
            <InfoBlock label="Location" value={location || "Not listed"} />
          </div>

          {bio && (
            <Section title="About">
              <p className="whitespace-pre-line text-white/90">{bio}</p>
            </Section>
          )}

          <Section title="Rig Build">
            <div className="grid gap-4 md:grid-cols-2">
              <InfoBlock label="Suspension" value={suspension || "Not listed"} />
              <InfoBlock label="Tires / Wheels" value={tires || "Not listed"} />
              <InfoBlock label="Armor / Protection" value={armor || "Not listed"} />
              <InfoBlock label="Lighting" value={lighting || "Not listed"} />
              <InfoBlock
                label="Recovery Gear"
                value={recoveryGear || "Not listed"}
              />
              <InfoBlock label="Comms" value={comms || "Not listed"} />
              <InfoBlock
                label="Roof / Camp Setup"
                value={roofCampSetup || "Not listed"}
              />
              <InfoBlock
                label="Future Mods"
                value={futureMods || "Not listed"}
              />
            </div>
          </Section>

          {mods && (
            <Section title="Additional Build Notes">
              <p className="whitespace-pre-line text-white/90">{mods}</p>
            </Section>
          )}

          {instagram && (
            <Section title="Instagram">
              <a
                href={`https://instagram.com/${instagram.replace("@", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#F28C52] hover:underline"
              >
                @{instagram.replace("@", "")}
              </a>
            </Section>
          )}

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
    <main className="max-w-4xl mx-auto px-4 py-10 text-white">
      <div className="rounded-2xl border border-[#F28C52]/30 bg-black/40 p-6 shadow-lg">
        <h1 className="text-3xl md:text-4xl font-bold text-[#F28C52]">
          {hasProfile ? "Edit Profile" : "Create Profile"}
        </h1>

        {!hasProfile && (
          <p className="mt-3 rounded-lg border border-[#F28C52]/30 bg-black/30 p-3 text-sm text-white/70">
            Create your profile so other Peach State members can see your ride.
          </p>
        )}

        <div className="mt-6 space-y-8">
          <Section title="Basic Info">
            <div className="space-y-5">
              <TextInput label="Name" required value={name} setValue={setName} />
              <TextInput
                label="Vehicle"
                required
                value={vehicle}
                setValue={setVehicle}
                placeholder="2020 Subaru Ascent, Tacoma, Wrangler, etc."
              />
              <TextInput
                label="Rig Name"
                value={rigName}
                setValue={setRigName}
                placeholder="Optional nickname for your rig"
              />
              <TextInput
                label="Location"
                value={location}
                setValue={setLocation}
                placeholder="City, State"
              />
              <TextInput
                label="Instagram"
                value={instagram}
                setValue={setInstagram}
                placeholder="@username"
              />
            </div>
          </Section>

          <Section title="About You">
            <textarea
              className="min-h-28 w-full rounded-lg bg-white p-3 text-black"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell members a little about you, your off-road experience, or what kind of rides you enjoy."
            />
          </Section>

          <Section title="Rig Build">
            <div className="space-y-5">
              <TextArea
                label="Suspension"
                value={suspension}
                setValue={setSuspension}
                placeholder="Lift, shocks, springs, control arms, sway bar setup, etc."
              />
              <TextArea
                label="Tires / Wheels"
                value={tires}
                setValue={setTires}
                placeholder="Tire size, brand, wheel setup, spare, etc."
              />
              <TextArea
                label="Armor / Protection"
                value={armor}
                setValue={setArmor}
                placeholder="Skid plates, sliders, bumpers, diff protection, etc."
              />
              <TextArea
                label="Lighting"
                value={lighting}
                setValue={setLighting}
                placeholder="Ditch lights, light bars, fogs, rear lighting, etc."
              />
              <TextArea
                label="Recovery Gear"
                value={recoveryGear}
                setValue={setRecoveryGear}
                placeholder="Winch, kinetic rope, shackles, traction boards, jack, etc."
              />
              <TextArea
                label="Comms"
                value={comms}
                setValue={setComms}
                placeholder="GMRS radio, antenna, handhelds, etc."
              />
              <TextArea
                label="Roof / Camp Setup"
                value={roofCampSetup}
                setValue={setRoofCampSetup}
                placeholder="Roof rack, awning, tent, storage, fridge, power setup, etc."
              />
              <TextArea
                label="Future Mods"
                value={futureMods}
                setValue={setFutureMods}
                placeholder="What is next for the build?"
              />
            </div>
          </Section>

          <Section title="Additional Build Notes">
            <textarea
              className="min-h-32 w-full rounded-lg bg-white p-3 text-black"
              value={mods}
              onChange={(e) => setMods(e.target.value)}
              placeholder="Anything else you want members to know about your build."
            />
          </Section>

          <Section title="Vehicle Photo">
            <input
              type="file"
              accept="image/*"
              className="w-full rounded-lg border border-[#F28C52]/30 bg-black/30 p-3 text-white/80"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
            />

            {imageUrl && (
              <img
                src={imageUrl}
                alt="Vehicle"
                className="mt-4 h-52 w-full rounded-lg object-cover"
              />
            )}
          </Section>

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

function Section({ title, children }: any) {
  return (
    <div className="mt-6 rounded-xl border border-white/10 bg-black/30 p-4">
      <h2 className="mb-4 text-lg font-bold text-[#F28C52]">{title}</h2>
      {children}
    </div>
  );
}

function InfoBlock({ label, value }: any) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/30 p-3">
      <p className="text-xs uppercase tracking-wide text-white/50">{label}</p>
      <p className="mt-1 whitespace-pre-line text-white">{value}</p>
    </div>
  );
}

function TextInput({
  label,
  value,
  setValue,
  placeholder = "",
  required = false,
}: any) {
  return (
    <div>
      <label className="mb-2 block text-sm text-white/80">
        {label} {required && <span className="text-[#F28C52]">*</span>}
      </label>
      <input
        className="w-full rounded-lg bg-white p-3 text-black"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

function TextArea({ label, value, setValue, placeholder = "" }: any) {
  return (
    <div>
      <label className="mb-2 block text-sm text-white/80">{label}</label>
      <textarea
        className="min-h-24 w-full rounded-lg bg-white p-3 text-black"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}