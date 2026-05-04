"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../lib/supabase";

const maintenanceTypes = [
  "Oil Change",
  "Tire Rotation",
  "Brake Service",
  "Alignment",
  "Transmission / CVT Service",
  "Differential Service",
  "Battery",
  "Suspension",
  "Tires",
  "Repair",
  "Upgrade Install",
  "Inspection",
  "Other",
];

const buildFields = [
  { key: "suspension", label: "Suspension" },
  { key: "tires_wheels", label: "Tires / Wheels" },
  { key: "armor_protection", label: "Armor / Protection" },
  { key: "recovery_gear", label: "Recovery Gear" },
  { key: "lighting", label: "Lighting" },
  { key: "comms", label: "Comms" },
  { key: "roof_camp_setup", label: "Roof / Camp Setup" },
  { key: "future_mods", label: "Future Mods" },
];

function getReminderStatus(reminder: any) {
  if (reminder.completed) return "completed";
  if (!reminder.due_date) return "normal";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueDate = new Date(reminder.due_date);
  dueDate.setHours(0, 0, 0, 0);

  const diffDays = Math.ceil(
    (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays < 0) return "overdue";
  if (diffDays <= 7) return "soon";

  return "normal";
}

function getReminderCardClass(status: string) {
  if (status === "completed") return "border-white/10 bg-black/20 opacity-60";
  if (status === "overdue") return "border-red-500/70 bg-red-950/30";
  if (status === "soon") return "border-yellow-400/70 bg-yellow-950/30";
  return "border-[#F28C52]/30 bg-black/30";
}

function getReminderBadge(status: string) {
  if (status === "completed") return "Completed";
  if (status === "overdue") return "Overdue";
  if (status === "soon") return "Due Soon";
  return "Open";
}

function getReminderBadgeClass(status: string) {
  if (status === "completed") return "text-white/40";
  if (status === "overdue") return "text-red-300";
  if (status === "soon") return "text-yellow-300";
  return "text-white/40";
}

export default function BuildDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [vehicle, setVehicle] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [reminders, setReminders] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [showMaintenanceForm, setShowMaintenanceForm] = useState(false);
  const [showReminderForm, setShowReminderForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

  const [editForm, setEditForm] = useState({
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
  });

  const [maintenanceForm, setMaintenanceForm] = useState({
    maintenance_type: "Oil Change",
    service_date: "",
    mileage: "",
    notes: "",
  });

  const [reminderForm, setReminderForm] = useState({
    reminder_type: "Oil Change",
    due_date: "",
    due_mileage: "",
    notes: "",
  });

  useEffect(() => {
    if (id) loadBuild();
  }, [id]);

  async function loadBuild() {
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      window.location.href = "/login";
      return;
    }

    setCurrentUserId(userData.user.id);

    const { data: vehicleData, error: vehicleError } = await supabase
      .from("vehicles")
      .select("*")
      .eq("id", id)
      .limit(1);

    if (vehicleError) {
      alert(vehicleError.message);
      setLoading(false);
      return;
    }

    const foundVehicle = vehicleData?.[0];

    if (!foundVehicle) {
      setVehicle(null);
      setLoading(false);
      return;
    }

    setVehicle(foundVehicle);

    setEditForm({
      nickname: foundVehicle.nickname || "",
      year: foundVehicle.year || "",
      make: foundVehicle.make || "",
      model: foundVehicle.model || "",
      image_url: foundVehicle.image_url || "",
      suspension: foundVehicle.suspension || "",
      tires_wheels: foundVehicle.tires_wheels || "",
      armor_protection: foundVehicle.armor_protection || "",
      recovery_gear: foundVehicle.recovery_gear || "",
      lighting: foundVehicle.lighting || "",
      comms: foundVehicle.comms || "",
      roof_camp_setup: foundVehicle.roof_camp_setup || "",
      future_mods: foundVehicle.future_mods || "",
      other_notes: foundVehicle.other_notes || "",
      is_primary: !!foundVehicle.is_primary,
    });

    const { data: logData, error: logError } = await supabase
      .from("maintenance_logs")
      .select("*")
      .eq("vehicle_id", id)
      .order("service_date", { ascending: false })
      .order("created_at", { ascending: false });

    if (logError) {
      alert(logError.message);
      setLoading(false);
      return;
    }

    const { data: reminderData, error: reminderError } = await supabase
      .from("maintenance_reminders")
      .select("*")
      .eq("vehicle_id", id)
      .order("completed", { ascending: true })
      .order("due_date", { ascending: true })
      .order("created_at", { ascending: false });

    if (reminderError) {
      alert(reminderError.message);
      setLoading(false);
      return;
    }

    setLogs(logData || []);
    setReminders(reminderData || []);
    setLoading(false);
  }

  function updateMaintenanceField(field: string, value: string) {
    setMaintenanceForm((prev) => ({ ...prev, [field]: value }));
  }

  function updateReminderField(field: string, value: string) {
    setReminderForm((prev) => ({ ...prev, [field]: value }));
  }

  function updateEditField(field: string, value: any) {
    setEditForm((prev) => ({ ...prev, [field]: value }));
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

    updateEditField("image_url", publicUrlData.publicUrl);
  }

  async function saveBuildEdits() {
    if (!vehicle) return;

    if (editForm.is_primary) {
      await supabase
        .from("vehicles")
        .update({ is_primary: false })
        .eq("user_id", currentUserId);
    }

    const { error } = await supabase
      .from("vehicles")
      .update({
        nickname: editForm.nickname.trim(),
        year: editForm.year.trim(),
        make: editForm.make.trim(),
        model: editForm.model.trim(),
        image_url: editForm.image_url.trim(),
        suspension: editForm.suspension.trim(),
        tires_wheels: editForm.tires_wheels.trim(),
        armor_protection: editForm.armor_protection.trim(),
        recovery_gear: editForm.recovery_gear.trim(),
        lighting: editForm.lighting.trim(),
        comms: editForm.comms.trim(),
        roof_camp_setup: editForm.roof_camp_setup.trim(),
        future_mods: editForm.future_mods.trim(),
        other_notes: editForm.other_notes.trim(),
        is_primary: editForm.is_primary,
      })
      .eq("id", vehicle.id)
      .eq("user_id", currentUserId);

    if (error) return alert(error.message);

    setShowEditForm(false);
    await loadBuild();
  }

  async function addMaintenanceLog() {
    if (!vehicle) return;
    if (!maintenanceForm.service_date) return alert("Date required");

    const { error } = await supabase.from("maintenance_logs").insert({
      vehicle_id: vehicle.id,
      user_id: currentUserId,
      maintenance_type: maintenanceForm.maintenance_type,
      service_date: maintenanceForm.service_date,
      mileage: maintenanceForm.mileage.trim(),
      notes: maintenanceForm.notes.trim(),
    });

    if (error) return alert(error.message);

    setMaintenanceForm({
      maintenance_type: "Oil Change",
      service_date: "",
      mileage: "",
      notes: "",
    });

    setShowMaintenanceForm(false);
    await loadBuild();
  }

  async function addMaintenanceReminder() {
    if (!vehicle) return;

    if (!reminderForm.due_date && !reminderForm.due_mileage.trim()) {
      return alert("Add a due date or due mileage.");
    }

    const { error } = await supabase.from("maintenance_reminders").insert({
      vehicle_id: vehicle.id,
      user_id: currentUserId,
      reminder_type: reminderForm.reminder_type,
      due_date: reminderForm.due_date || null,
      due_mileage: reminderForm.due_mileage.trim(),
      notes: reminderForm.notes.trim(),
      completed: false,
    });

    if (error) return alert(error.message);

    setReminderForm({
      reminder_type: "Oil Change",
      due_date: "",
      due_mileage: "",
      notes: "",
    });

    setShowReminderForm(false);
    await loadBuild();
  }

  async function toggleReminderComplete(reminderId: string, completed: boolean) {
    const { error } = await supabase
      .from("maintenance_reminders")
      .update({ completed: !completed })
      .eq("id", reminderId)
      .eq("user_id", currentUserId);

    if (error) return alert(error.message);

    await loadBuild();
  }

  async function deleteMaintenanceReminder(reminderId: string) {
    if (!confirm("Delete this maintenance reminder?")) return;

    const { error } = await supabase
      .from("maintenance_reminders")
      .delete()
      .eq("id", reminderId)
      .eq("user_id", currentUserId);

    if (error) return alert(error.message);

    await loadBuild();
  }

  async function deleteMaintenanceLog(logId: string) {
    if (!confirm("Delete this maintenance entry?")) return;

    const { error } = await supabase
      .from("maintenance_logs")
      .delete()
      .eq("id", logId)
      .eq("user_id", currentUserId);

    if (error) return alert(error.message);

    await loadBuild();
  }

  if (loading) return <p className="text-gray-300">Loading build...</p>;

  if (!vehicle) {
    return (
      <div className="rounded-2xl border border-white/10 bg-black/30 p-6">
        <p className="text-gray-400">Build not found.</p>
      </div>
    );
  }

  const isOwner = vehicle.user_id === currentUserId;

  return (
    <div className="space-y-8">
      <a
        href="/builds"
        className="inline-block rounded-lg border border-[#F28C52] px-4 py-2 font-semibold text-[#F28C52] hover:bg-[#F28C52] hover:text-black"
      >
        Back to My Builds
      </a>

      <section className="overflow-hidden rounded-2xl border border-[#F28C52]/30 bg-black/40">
        {vehicle.image_url ? (
          <img
            src={vehicle.image_url}
            alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
            className="h-72 w-full object-cover"
          />
        ) : (
          <div className="flex h-72 w-full items-center justify-center bg-black/30 text-white/50">
            No build image uploaded
          </div>
        )}

        <div className="p-6">
          {vehicle.is_primary && (
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-[#F28C52]">
              Primary Build
            </p>
          )}

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[#F28C52]">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </h1>

              {vehicle.nickname && (
                <p className="mt-2 text-gray-300">{vehicle.nickname}</p>
              )}
            </div>

            {isOwner && (
              <button
                onClick={() => setShowEditForm(!showEditForm)}
                className="rounded-lg border border-[#F28C52] px-4 py-2 font-semibold text-[#F28C52] hover:bg-[#F28C52] hover:text-black"
              >
                {showEditForm ? "Close Edit" : "Edit Build"}
              </button>
            )}
          </div>
        </div>
      </section>

      {showEditForm && isOwner && (
        <section className="space-y-5 rounded-2xl border border-[#F28C52]/30 bg-black/40 p-6">
          <h2 className="text-2xl font-bold text-white">Edit Build</h2>

          <input
            type="text"
            placeholder="Build nickname"
            value={editForm.nickname}
            onChange={(e) => updateEditField("nickname", e.target.value)}
            className="w-full rounded-lg border border-white/20 bg-white px-3 py-2 text-black placeholder-gray-500"
          />

          <div className="grid gap-3 md:grid-cols-3">
            <input
              type="text"
              placeholder="Year"
              value={editForm.year}
              onChange={(e) => updateEditField("year", e.target.value)}
              className="rounded-lg border border-white/20 bg-white px-3 py-2 text-black placeholder-gray-500"
            />

            <input
              type="text"
              placeholder="Make"
              value={editForm.make}
              onChange={(e) => updateEditField("make", e.target.value)}
              className="rounded-lg border border-white/20 bg-white px-3 py-2 text-black placeholder-gray-500"
            />

            <input
              type="text"
              placeholder="Model"
              value={editForm.model}
              onChange={(e) => updateEditField("model", e.target.value)}
              className="rounded-lg border border-white/20 bg-white px-3 py-2 text-black placeholder-gray-500"
            />
          </div>

          {editForm.image_url && (
            <img
              src={editForm.image_url}
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

          <BuildFormFields form={editForm} updateField={updateEditField} />

          <label className="flex items-center gap-3 text-sm text-gray-300">
            <input
              type="checkbox"
              checked={editForm.is_primary}
              onChange={(e) => updateEditField("is_primary", e.target.checked)}
            />
            Set as primary build
          </label>

          <button
            onClick={saveBuildEdits}
            className="rounded-lg bg-[#F28C52] px-5 py-3 font-semibold text-black hover:bg-[#C96A2C]"
          >
            Save Build Changes
          </button>
        </section>
      )}

      <section className="grid gap-5 md:grid-cols-2">
        {buildFields.map((field) => (
          <InfoBlock
            key={field.key}
            label={field.label}
            value={vehicle[field.key]}
          />
        ))}
      </section>

      <section className="rounded-2xl border border-white/10 bg-black/30 p-5">
        <h2 className="text-xl font-bold text-[#F28C52]">
          Other Build Notes
        </h2>

        <p className="mt-3 whitespace-pre-line text-sm leading-6 text-gray-300">
          {vehicle.other_notes || "No notes listed yet."}
        </p>
      </section>

      {isOwner && (
        <section className="space-y-4 rounded-2xl border border-[#F28C52]/30 bg-black/40 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-white">
                Maintenance Reminders
              </h2>
              <p className="mt-1 text-sm text-gray-400">
                Set upcoming reminders by date, mileage, or both.
              </p>
            </div>

            <button
              onClick={() => setShowReminderForm(!showReminderForm)}
              className="rounded-lg bg-[#F28C52] px-5 py-3 font-semibold text-black hover:bg-[#C96A2C]"
            >
              {showReminderForm ? "Close Form" : "Add Reminder"}
            </button>
          </div>

          {showReminderForm && (
            <div className="space-y-4 rounded-xl border border-white/10 bg-black/30 p-4">
              <select
                value={reminderForm.reminder_type}
                onChange={(e) =>
                  updateReminderField("reminder_type", e.target.value)
                }
                className="w-full rounded-lg border border-white/20 bg-white px-3 py-2 text-black"
              >
                {maintenanceTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>

              <input
                type="date"
                value={reminderForm.due_date}
                onChange={(e) =>
                  updateReminderField("due_date", e.target.value)
                }
                className="w-full rounded-lg border border-white/20 bg-white px-3 py-2 text-black"
              />

              <input
                type="text"
                placeholder="Due mileage"
                value={reminderForm.due_mileage}
                onChange={(e) =>
                  updateReminderField("due_mileage", e.target.value)
                }
                className="w-full rounded-lg border border-white/20 bg-white px-3 py-2 text-black placeholder-gray-500"
              />

              <textarea
                placeholder="Reminder notes"
                value={reminderForm.notes}
                onChange={(e) => updateReminderField("notes", e.target.value)}
                className="min-h-24 w-full rounded-lg border border-white/20 bg-white px-3 py-2 text-black placeholder-gray-500"
              />

              <button
                onClick={addMaintenanceReminder}
                className="rounded-lg bg-[#F28C52] px-5 py-3 font-semibold text-black hover:bg-[#C96A2C]"
              >
                Save Reminder
              </button>
            </div>
          )}

          {reminders.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-black/30 p-5">
              <p className="text-gray-400">No maintenance reminders yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reminders.map((reminder) => {
                const status = getReminderStatus(reminder);

                return (
                  <div
                    key={reminder.id}
                    className={`rounded-xl border p-4 ${getReminderCardClass(
                      status
                    )}`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-white">
                          {reminder.reminder_type}
                        </h3>

                        <p className="mt-1 text-sm text-gray-400">
                          {reminder.due_date
                            ? `Due ${new Date(
                                reminder.due_date
                              ).toLocaleDateString()}`
                            : "No due date"}
                          {reminder.due_mileage
                            ? ` • ${reminder.due_mileage} miles`
                            : ""}
                        </p>

                        <p
                          className={`mt-1 text-xs font-semibold uppercase tracking-[0.2em] ${getReminderBadgeClass(
                            status
                          )}`}
                        >
                          {getReminderBadge(status)}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() =>
                            toggleReminderComplete(
                              reminder.id,
                              reminder.completed
                            )
                          }
                          className="rounded-lg border border-[#F28C52] px-3 py-1 text-sm font-semibold text-[#F28C52] hover:bg-[#F28C52] hover:text-black"
                        >
                          {reminder.completed ? "Reopen" : "Complete"}
                        </button>

                        <button
                          onClick={() =>
                            deleteMaintenanceReminder(reminder.id)
                          }
                          className="rounded-lg border border-red-400 px-3 py-1 text-sm font-semibold text-red-300 hover:bg-red-500 hover:text-white"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {reminder.notes && (
                      <p className="mt-3 whitespace-pre-line text-sm leading-6 text-gray-300">
                        {reminder.notes}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      <section className="space-y-4 rounded-2xl border border-[#F28C52]/30 bg-black/40 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-white">Maintenance Log</h2>
            <p className="mt-1 text-sm text-gray-400">
              Track service, repairs, mileage, installs, and maintenance notes.
            </p>
          </div>

          {isOwner && (
            <button
              onClick={() => setShowMaintenanceForm(!showMaintenanceForm)}
              className="rounded-lg bg-[#F28C52] px-5 py-3 font-semibold text-black hover:bg-[#C96A2C]"
            >
              {showMaintenanceForm ? "Close Form" : "Add Maintenance"}
            </button>
          )}
        </div>

        {showMaintenanceForm && isOwner && (
          <div className="space-y-4 rounded-xl border border-white/10 bg-black/30 p-4">
            <select
              value={maintenanceForm.maintenance_type}
              onChange={(e) =>
                updateMaintenanceField("maintenance_type", e.target.value)
              }
              className="w-full rounded-lg border border-white/20 bg-white px-3 py-2 text-black"
            >
              {maintenanceTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={maintenanceForm.service_date}
              onChange={(e) =>
                updateMaintenanceField("service_date", e.target.value)
              }
              className="w-full rounded-lg border border-white/20 bg-white px-3 py-2 text-black"
            />

            <input
              type="text"
              placeholder="Mileage"
              value={maintenanceForm.mileage}
              onChange={(e) =>
                updateMaintenanceField("mileage", e.target.value)
              }
              className="w-full rounded-lg border border-white/20 bg-white px-3 py-2 text-black placeholder-gray-500"
            />

            <textarea
              placeholder="Notes"
              value={maintenanceForm.notes}
              onChange={(e) => updateMaintenanceField("notes", e.target.value)}
              className="min-h-24 w-full rounded-lg border border-white/20 bg-white px-3 py-2 text-black placeholder-gray-500"
            />

            <button
              onClick={addMaintenanceLog}
              className="rounded-lg bg-[#F28C52] px-5 py-3 font-semibold text-black hover:bg-[#C96A2C]"
            >
              Save Maintenance Entry
            </button>
          </div>
        )}

        {logs.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-black/30 p-5">
            <p className="text-gray-400">No maintenance records yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <div
                key={log.id}
                className="rounded-xl border border-white/10 bg-black/30 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-white">
                      {log.maintenance_type}
                    </h3>

                    <p className="mt-1 text-sm text-gray-400">
                      {new Date(log.service_date).toLocaleDateString()}
                      {log.mileage ? ` • ${log.mileage} miles` : ""}
                    </p>
                  </div>

                  {isOwner && (
                    <button
                      onClick={() => deleteMaintenanceLog(log.id)}
                      className="rounded-lg border border-red-400 px-3 py-1 text-sm font-semibold text-red-300 hover:bg-red-500 hover:text-white"
                    >
                      Delete
                    </button>
                  )}
                </div>

                {log.notes && (
                  <p className="mt-3 whitespace-pre-line text-sm leading-6 text-gray-300">
                    {log.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function BuildFormFields({ form, updateField }: any) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {buildFields.map((field) => (
        <TextArea
          key={field.key}
          label={field.label}
          value={form[field.key]}
          onChange={(value: string) => updateField(field.key, value)}
          placeholder={`Enter ${field.label.toLowerCase()} details.`}
        />
      ))}

      <div className="md:col-span-2">
        <TextArea
          label="Other Build Notes"
          value={form.other_notes}
          onChange={(value: string) => updateField("other_notes", value)}
          placeholder="Anything else members should know about this build."
        />
      </div>
    </div>
  );
}

function InfoBlock({ label, value }: any) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
      <p className="text-xs uppercase tracking-wide text-white/50">{label}</p>

      <p className="mt-2 whitespace-pre-line text-sm leading-6 text-white">
        {value && value.trim() ? value : "Not listed"}
      </p>
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