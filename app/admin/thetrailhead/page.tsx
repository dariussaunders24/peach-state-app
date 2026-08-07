"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function TheTrailheadPage() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [deletingId, setDeletingId] = useState("");

  useEffect(() => {
    loadRegistrations();
  }, []);

  async function loadRegistrations() {
    setLoading(true);

    const { data, error } = await supabase
      .from("the_trailhead_registrations")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Registration load error:", error.message);
    }

    setRegistrations(data || []);
    setLoading(false);
  }

  const goingRegistrations = useMemo(
    () => registrations.filter((r) => r.status === "going"),
    [registrations]
  );

  const waitlistRegistrations = useMemo(
    () => registrations.filter((r) => r.status === "waitlist"),
    [registrations]
  );

  const emails = goingRegistrations
    .map((r) => r.email)
    .filter(Boolean)
    .join(", ");

  async function copyEmails() {
    await navigator.clipboard.writeText(emails);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  }

  async function deleteRegistration(id: string, name: string, status: string) {
    const confirmed = window.confirm(
      `Remove ${name} from The Trailhead ${
        status === "waitlist" ? "waitlist" : "registration list"
      }?`
    );

    if (!confirmed) return;

    setDeletingId(id);

    try {
      const response = await fetch("/api/thetrailhead-cancel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          registrationId: id,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        alert(
          data?.error || "Unable to remove registration. Please try again."
        );
        setDeletingId("");
        return;
      }

      await loadRegistrations();

      if (data?.promoted) {
        alert(
          "Registration removed. The next waitlisted attendee was automatically promoted and emailed."
        );
      }
    } catch (deleteError) {
      console.error("Delete registration error:", deleteError);
      alert("Unable to remove registration. Please try again.");
    }

    setDeletingId("");
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10 text-white">
        <p>Loading registrations...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 text-white">
      <h1 className="font-cinzel text-3xl font-bold">
        The Trailhead Registrations
      </h1>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <StatCard label="Confirmed" value={goingRegistrations.length} />
        <StatCard label="Capacity" value={35} />
        <StatCard label="Waitlist" value={waitlistRegistrations.length} />
      </div>

      <section className="mt-6 rounded-xl border border-white/10 bg-black/40 p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-bold">Confirmed Email List</h2>
            <p className="mt-1 text-sm text-white/60">
              Includes confirmed attendees only, not the waitlist.
            </p>
          </div>

          <button
            type="button"
            onClick={copyEmails}
            disabled={!emails}
            className="rounded-lg bg-[#F28C52] px-4 py-2 text-sm font-semibold text-black hover:bg-[#C96A2C] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {copied ? "Copied!" : "Copy Emails"}
          </button>
        </div>

        <textarea
          readOnly
          value={emails}
          placeholder="No confirmed emails yet."
          className="mt-3 h-32 w-full rounded-lg border border-white/10 bg-black/50 p-3 text-sm text-white"
        />
      </section>

      <RegistrationTable
        title="Confirmed / Going"
        registrations={goingRegistrations}
        deletingId={deletingId}
        onDelete={deleteRegistration}
      />

      <RegistrationTable
        title="Waitlist"
        registrations={waitlistRegistrations}
        deletingId={deletingId}
        onDelete={deleteRegistration}
        showPosition
      />
    </main>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/40 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#F28C52]">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

function RegistrationTable({
  title,
  registrations,
  deletingId,
  onDelete,
  showPosition = false,
}: {
  title: string;
  registrations: any[];
  deletingId: string;
  onDelete: (id: string, name: string, status: string) => void;
  showPosition?: boolean;
}) {
  return (
    <section className="mt-8">
      <h2 className="text-2xl font-bold">{title}</h2>

      <div className="mt-3 overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full min-w-[900px] border-collapse bg-black/40 text-left text-sm">
          <thead className="bg-white/10 text-white">
            <tr>
              {showPosition && <th className="p-3">Position</th>}
              <th className="p-3">Name</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Email</th>
              <th className="p-3">Status</th>
              <th className="p-3">Waiver</th>
              <th className="p-3">Registered</th>
              <th className="p-3">Remove</th>
            </tr>
          </thead>

          <tbody>
            {registrations.map((registration, index) => {
              const name = `${registration.first_name} ${registration.last_name}`;

              return (
                <tr
                  key={registration.id}
                  className="border-t border-white/10 text-white/75"
                >
                  {showPosition && (
                    <td className="p-3 font-bold text-[#F28C52]">
                      #{index + 1}
                    </td>
                  )}
                  <td className="p-3">{name}</td>
                  <td className="p-3">{registration.phone}</td>
                  <td className="p-3">{registration.email}</td>
                  <td className="p-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${
                        registration.status === "going"
                          ? "bg-green-500/15 text-green-300"
                          : "bg-yellow-500/15 text-yellow-200"
                      }`}
                    >
                      {registration.status === "going" ? "Going" : "Waitlist"}
                    </span>
                  </td>
                  <td className="p-3">
                    {registration.waiver_accepted
                      ? "Accepted"
                      : "Not Accepted"}
                  </td>
                  <td className="p-3">
                    {new Date(registration.created_at).toLocaleString()}
                  </td>
                  <td className="p-3">
                    <button
                      type="button"
                      onClick={() =>
                        onDelete(
                          registration.id,
                          name,
                          registration.status
                        )
                      }
                      disabled={deletingId === registration.id}
                      className="rounded-lg border border-red-400/40 bg-red-500/10 px-3 py-1.5 text-sm font-semibold text-red-200 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deletingId === registration.id
                        ? "Removing..."
                        : "Remove"}
                    </button>
                  </td>
                </tr>
              );
            })}

            {registrations.length === 0 && (
              <tr>
                <td
                  className="p-4 text-white/60"
                  colSpan={showPosition ? 8 : 7}
                >
                  No registrations in this section.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}