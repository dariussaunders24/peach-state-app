"use client";

import Link from "next/link";
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

  const difficulty = event.difficulty || firstRoute?.difficulty || "Not listed";
  const goingAttendees = event.attendees?.filter((a: any) => a.status === "going") || [];
  const attendedCount = goingAttendees.filter((a: any) => a.checked_in).length;

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

          <p className="text-sm font-semibold text-[#F28C52]">{difficulty}</p>
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
                <span>{attendee.profiles?.name || "Member"}</span>

                <input
                  type="checkbox"
                  checked={attendee.checked_in ?? false}
                  onChange={async () => {
                    const { error } = await supabase
                      .from("rsvps")
                      .update({
                        checked_in: !(attendee.checked_in ?? false),
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
    </div>
  );
}