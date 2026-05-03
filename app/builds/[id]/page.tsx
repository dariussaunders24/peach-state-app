"use client";

import { useEffect, useState } from "react";
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

export default function BuildDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [vehicle, setVehicle] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [showMaintenanceForm, setShowMaintenanceForm] = useState(false);

  const [maintenanceForm, setMaintenanceForm] = useState({
    maintenance_type: "Oil Change",
    service_date: "",
    mileage: "",
    notes: "",
  });

  useEffect(() => {
    loadBuild();
  }, []);

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
      .eq("id", params.id)
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

    const { data: logData, error: logError } = await supabase
      .from("maintenance_logs")
      .select("*")
      .eq("vehicle_id", params.id)
      .order("service_date", { ascending: false })
      .order("created_at", { ascending: false });

    if (logError) {
      alert(logError.message);
      setLoading(false);
      return;
    }

    setLogs(logData || []);
    setLoading(false);
  }

  function updateMaintenanceField(field: string, value: string) {
    setMaintenanceForm((prev) => ({ ...prev, [field]: value }));
  }

  async function addMaintenanceLog() {
    if (!vehicle) return;

    if (!maintenanceForm.maintenance_type) {
      return alert("Maintenance type required");
    }

    if (!maintenanceForm.service_date) {
      return alert("Date required");
    }

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

  if (loading) {
    return <p className="text-gray-300">Loading build...</p>;
  }

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
        {vehicle.image_url && (
          <img
            src={vehicle.image_url}
            alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
            className="h-72 w-full object-cover"
          />
        )}

        <div className="p-6">
          {vehicle.is_primary && (
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-[#F28C52]">
              Primary Build
            </p>
          )}

          <h1 className="text-3xl font-bold text-[#F28C52]">
            {vehicle.year} {vehicle.make} {vehicle.model}
          </h1>

          {vehicle.nickname && (
            <p className="mt-2 text-gray-300">{vehicle.nickname}</p>
          )}
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
          <h2 className="text-xl font-bold text-[#F28C52]">
            Mods / Upgrades
          </h2>

          {vehicle.mods ? (
            <p className="mt-3 whitespace-pre-line text-sm leading-6 text-gray-300">
              {vehicle.mods}
            </p>
          ) : (
            <p className="mt-3 text-sm text-gray-400">
              No mods listed yet.
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
          <h2 className="text-xl font-bold text-[#F28C52]">
            Other Build Notes
          </h2>

          {vehicle.other_notes ? (
            <p className="mt-3 whitespace-pre-line text-sm leading-6 text-gray-300">
              {vehicle.other_notes}
            </p>
          ) : (
            <p className="mt-3 text-sm text-gray-400">
              No notes listed yet.
            </p>
          )}
        </div>
      </section>

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
              onChange={(e) =>
                updateMaintenanceField("notes", e.target.value)
              }
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