"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function AdminRigsForRiggsPage() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [deletingId, setDeletingId] = useState("");

  useEffect(() => {
    loadRegistrations();
  }, []);

  async function loadRegistrations() {
    const { data, error } = await supabase
      .from("rigs_for_riggs_registrations")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Registration load error:", error.message);
    }

    setRegistrations(data || []);
    setLoading(false);
  }

  const emails = registrations
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

  async function deleteRegistration(id: string, name: string) {
    const confirmed = window.confirm(
      `Remove ${name} from the Rigs for Riggs registration list?`
    );

    if (!confirmed) return;

    setDeletingId(id);

    const { error } = await supabase
      .from("rigs_for_riggs_registrations")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Delete registration error:", error.message);
      alert("Unable to remove registration. Please try again.");
      setDeletingId("");
      return;
    }

    setRegistrations((current) =>
      current.filter((registration) => registration.id !== id)
    );

    setDeletingId("");
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10 text-white">
        Loading registrations...
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 text-white">
      <h1 className="text-3xl font-bold">Rigs for Riggs Registrations</h1>

      <p className="mt-2 text-white/70">
        Total Registered: {registrations.length}
      </p>

      <section className="mt-6 rounded-xl border border-white/10 bg-black/40 p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 className="text-xl font-bold">Email List</h2>

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
          placeholder="No registered emails yet."
          className="mt-3 h-32 w-full rounded-lg border border-white/10 bg-black/50 p-3 text-sm text-white"
        />
      </section>

      <div className="mt-8 overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full min-w-[800px] border-collapse bg-black/40 text-left text-sm">
          <thead className="bg-white/10 text-white">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Email</th>
              <th className="p-3">Waiver</th>
              <th className="p-3">Registered</th>
              <th className="p-3">Remove</th>
            </tr>
          </thead>

          <tbody>
            {registrations.map((registration) => {
              const name = `${registration.first_name} ${registration.last_name}`;

              return (
                <tr
                  key={registration.id}
                  className="border-t border-white/10 text-white/75"
                >
                  <td className="p-3">{name}</td>
                  <td className="p-3">{registration.phone}</td>
                  <td className="p-3">{registration.email}</td>
                  <td className="p-3">
                    {registration.waiver_accepted ? "Accepted" : "Not Accepted"}
                  </td>
                  <td className="p-3">
                    {new Date(registration.created_at).toLocaleString()}
                  </td>
                  <td className="p-3">
                    <button
                      type="button"
                      onClick={() => deleteRegistration(registration.id, name)}
                      disabled={deletingId === registration.id}
                      className="rounded-lg border border-red-400/40 bg-red-500/10 px-3 py-1.5 text-sm font-semibold text-red-200 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deletingId === registration.id ? "Removing..." : "Remove"}
                    </button>
                  </td>
                </tr>
              );
            })}

            {registrations.length === 0 && (
              <tr>
                <td className="p-4 text-white/60" colSpan={6}>
                  No registrations yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}