"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function PastEventCard({
  event,
  isAdmin,
  canManageAttendance,
  updateEvent,
  deleteEvent,
  reloadEvents,
}: any) {
  const firstRoute = event.routes?.[0];

  const gpxLink =
    event.route_link ||
    event.gpx_url ||
    event.gpx_link ||
    event.gpx ||
    event.gpx_file ||
    event.gpx_file_url ||
    event.route_gpx_url ||
    event.route_url ||
    event.onx_url ||
    firstRoute?.gpx_url ||
    firstRoute?.route_link ||
    firstRoute?.onx_url ||
    "";

  const difficulty =
    event.difficulty || firstRoute?.difficulty || "Not listed";

  const goingAttendees =
    event.attendees?.filter((a: any) => a.status === "going") || [];

  const attendedCount = goingAttendees.filter(
    (a: any) => a.checked_in
  ).length;

  const [trailReport, setTrailReport] = useState<any | null>(null);
  const [loadingTrailReport, setLoadingTrailReport] = useState(true);
  const [editingTrailReport, setEditingTrailReport] = useState(false);
  const [savingTrailReport, setSavingTrailReport] = useState(false);

  const [trailReportForm, setTrailReportForm] = useState({
    conditions: "",
    experienced_difficulty: "",
    trail_status: "",
    report: "",
  });

  const isTrailRide =
    event.is_trail_ride === true ||
    event.is_trail_ride === "true";

  useEffect(() => {
    if (isTrailRide) {
      loadTrailReport();
    } else {
      setLoadingTrailReport(false);
    }
  }, [event.id, isTrailRide]);

  async function loadTrailReport() {
    setLoadingTrailReport(true);

    const { data, error } = await supabase
      .from("trail_reports")
      .select("*")
      .eq("event_id", event.id)
      .maybeSingle();

    if (error) {
      console.error("Error loading trail report:", error);
      setLoadingTrailReport(false);
      return;
    }

    setTrailReport(data || null);

    if (data) {
      setTrailReportForm({
        conditions: data.conditions || "",
        experienced_difficulty:
          data.experienced_difficulty || "",
        trail_status: data.trail_status || "",
        report: data.report || "",
      });
    }

    setLoadingTrailReport(false);
  }

  function openTrailReportForm() {
    if (trailReport) {
      setTrailReportForm({
        conditions: trailReport.conditions || "",
        experienced_difficulty:
          trailReport.experienced_difficulty || "",
        trail_status: trailReport.trail_status || "",
        report: trailReport.report || "",
      });
    } else {
      setTrailReportForm({
        conditions: "",
        experienced_difficulty: "",
        trail_status: "",
        report: "",
      });
    }

    setEditingTrailReport(true);
  }

  async function saveTrailReport() {
    if (!trailReportForm.report.trim()) {
      alert("Please enter trail report notes.");
      return;
    }

    setSavingTrailReport(true);

    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) {
      alert("You must be logged in.");
      setSavingTrailReport(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("name")
      .eq("user_id", authData.user.id)
      .maybeSingle();

    const reporterName =
      profile?.name ||
      authData.user.email ||
      "Ride Captain";

    if (trailReport) {
      const { error } = await supabase
        .from("trail_reports")
        .update({
          conditions: trailReportForm.conditions || null,
          experienced_difficulty:
            trailReportForm.experienced_difficulty || null,
          trail_status: trailReportForm.trail_status || null,
          report: trailReportForm.report.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", trailReport.id);

      if (error) {
        alert(error.message);
        setSavingTrailReport(false);
        return;
      }
    } else {
      const { error } = await supabase
        .from("trail_reports")
        .insert({
          event_id: event.id,
          conditions: trailReportForm.conditions || null,
          experienced_difficulty:
            trailReportForm.experienced_difficulty || null,
          trail_status: trailReportForm.trail_status || null,
          report: trailReportForm.report.trim(),
          reported_by: authData.user.id,
          reporter_name: reporterName,
        });

      if (error) {
        alert(error.message);
        setSavingTrailReport(false);
        return;
      }
    }

    await loadTrailReport();

    setEditingTrailReport(false);
    setSavingTrailReport(false);
  }

  async function deleteTrailReport() {
    if (!trailReport) return;

    if (!confirm("Delete this trail report?")) return;

    const { error } = await supabase
      .from("trail_reports")
      .delete()
      .eq("id", trailReport.id);

    if (error) {
      alert(error.message);
      return;
    }

    setTrailReport(null);

    setTrailReportForm({
      conditions: "",
      experienced_difficulty: "",
      trail_status: "",
      report: "",
    });

    setEditingTrailReport(false);
  }

  return (
    <div className="rounded-xl border border-[#F28C52]/20 bg-black/40 px-4 py-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <h3 className="font-bold text-white">{event.title}</h3>

          {event.event_date && (
            <p className="text-sm text-gray-400">
              {new Date(event.event_date).toLocaleDateString()}
            </p>
          )}

          <p className="text-sm font-semibold text-[#F28C52]">
            {difficulty}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <p className="text-xs font-semibold text-green-300">
            Attended: {attendedCount} / {goingAttendees.length}
          </p>

          {gpxLink ? (
            <a
              href={gpxLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-[#F28C52] underline underline-offset-4"
            >
              Route Link
            </a>
          ) : (
            <p className="text-sm text-gray-500">No GPX link</p>
          )}

          <Link
            href={`/gallery?eventId=${event.id}`}
            className="rounded bg-[#F28C52] px-3 py-1 text-xs font-semibold text-black"
          >
            Add Photos / Videos
          </Link>

          {isAdmin && (
            <>
              {updateEvent && (
                <button
                  onClick={() => updateEvent(event)}
                  className="rounded bg-yellow-400 px-3 py-1 text-xs font-semibold text-black"
                >
                  Edit
                </button>
              )}

              {deleteEvent && (
                <button
                  onClick={() => deleteEvent(event.id)}
                  className="rounded bg-red-500 px-3 py-1 text-xs font-semibold text-white"
                >
                  Delete
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {canManageAttendance && (
        <div className="mt-4 rounded-lg border border-white/10 bg-black/30 p-4">
          <p className="text-sm font-semibold text-green-300">
            Attendance Checklist
          </p>

          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {(!event.attendees || event.attendees.length === 0) && (
              <p className="mt-2 text-sm text-gray-400">
                No RSVP records found for this event.
              </p>
            )}

            {event.attendees?.map((attendee: any) => (
              <label
                key={attendee.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-green-400/20 bg-green-500/10 px-3 py-2 text-sm text-green-100"
              >
                <span>
                  {attendee.profiles?.name || "Member"}
                </span>

                <input
                  type="checkbox"
                  checked={attendee.checked_in ?? false}
                  onChange={async () => {
                    const { error } = await supabase
                      .from("rsvps")
                      .update({
                        checked_in:
                          !(attendee.checked_in ?? false),
                      })
                      .eq("id", attendee.id);

                    if (error) {
                      alert(error.message);
                      return;
                    }

                    await reloadEvents();
                  }}
                  className="h-5 w-5 accent-[#F28C52]"
                />
              </label>
            ))}
          </div>
        </div>
      )}

      {isTrailRide && !loadingTrailReport && (
        <div className="mt-4 rounded-lg border border-[#F28C52]/20 bg-black/30 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-semibold text-[#F28C52]">
              Trail Report
            </p>

            {canManageAttendance && !editingTrailReport && (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={openTrailReportForm}
                  className="rounded bg-[#F28C52] px-3 py-1 text-xs font-semibold text-black"
                >
                  {trailReport
                    ? "Edit Trail Report"
                    : "Add Trail Report"}
                </button>

                {trailReport && (
                  <button
                    onClick={deleteTrailReport}
                    className="rounded bg-red-500 px-3 py-1 text-xs font-semibold text-white"
                  >
                    Delete Trail Report
                  </button>
                )}
              </div>
            )}
          </div>

          {!trailReport && !editingTrailReport && (
            <p className="mt-3 text-sm text-gray-400">
              No trail report has been added for this ride yet.
            </p>
          )}

          {trailReport && !editingTrailReport && (
            <div className="mt-4 space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Conditions
                  </p>

                  <p className="mt-1 text-sm text-white">
                    {trailReport.conditions || "Not listed"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Difficulty Experienced
                  </p>

                  <p className="mt-1 text-sm text-white">
                    {trailReport.experienced_difficulty ||
                      "Not listed"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Trail Status
                  </p>

                  <p className="mt-1 text-sm text-white">
                    {trailReport.trail_status || "Not listed"}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Report
                </p>

                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-200">
                  {trailReport.report}
                </p>
              </div>

              <div className="border-t border-white/10 pt-3">
                <p className="text-xs text-gray-500">
                  Reported by{" "}
                  <span className="text-gray-300">
                    {trailReport.reporter_name || "Ride Captain"}
                  </span>

                  {trailReport.created_at && (
                    <>
                      {" "}
                      •{" "}
                      {new Date(
                        trailReport.created_at
                      ).toLocaleDateString()}
                    </>
                  )}
                </p>
              </div>
            </div>
          )}

          {editingTrailReport && canManageAttendance && (
            <div className="mt-4 space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-300">
                    Trail Conditions
                  </label>

                  <select
                    value={trailReportForm.conditions}
                    onChange={(e) =>
                      setTrailReportForm({
                        ...trailReportForm,
                        conditions: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-white/20 bg-black px-3 py-2 text-sm text-white"
                  >
                    <option value="">Select</option>
                    <option value="Dry">Dry</option>
                    <option value="Wet">Wet</option>
                    <option value="Muddy">Muddy</option>
                    <option value="Snow / Ice">
                      Snow / Ice
                    </option>
                    <option value="Mixed">Mixed</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-300">
                    Difficulty Experienced
                  </label>

                  <select
                    value={
                      trailReportForm.experienced_difficulty
                    }
                    onChange={(e) =>
                      setTrailReportForm({
                        ...trailReportForm,
                        experienced_difficulty:
                          e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-white/20 bg-black px-3 py-2 text-sm text-white"
                  >
                    <option value="">Select</option>
                    <option value="Easy">Easy</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Difficult">Difficult</option>
                    <option value="Very Difficult">
                      Very Difficult
                    </option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-300">
                    Trail Status
                  </label>

                  <select
                    value={trailReportForm.trail_status}
                    onChange={(e) =>
                      setTrailReportForm({
                        ...trailReportForm,
                        trail_status: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-white/20 bg-black px-3 py-2 text-sm text-white"
                  >
                    <option value="">Select</option>
                    <option value="Open">Open</option>
                    <option value="Partially Open">
                      Partially Open
                    </option>
                    <option value="Closed / Blocked">
                      Closed / Blocked
                    </option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-300">
                  Trail Report / Notes
                </label>

                <textarea
                  value={trailReportForm.report}
                  onChange={(e) =>
                    setTrailReportForm({
                      ...trailReportForm,
                      report: e.target.value,
                    })
                  }
                  placeholder="Describe trail conditions, washouts, ruts, water crossings, downed trees, obstacles, bypasses, closures, or anything members should know..."
                  className="min-h-32 w-full rounded-lg border border-white/20 bg-black px-4 py-3 text-sm text-white"
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={saveTrailReport}
                  disabled={savingTrailReport}
                  className="rounded bg-[#F28C52] px-4 py-2 text-sm font-semibold text-black disabled:opacity-50"
                >
                  {savingTrailReport
                    ? "Saving..."
                    : trailReport
                    ? "Save Changes"
                    : "Publish Trail Report"}
                </button>

                <button
                  onClick={() =>
                    setEditingTrailReport(false)
                  }
                  disabled={savingTrailReport}
                  className="rounded border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:border-[#F28C52] hover:text-[#F28C52]"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}