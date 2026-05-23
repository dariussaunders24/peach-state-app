"use client";

import Link from "next/link";


export default function PastEventCard({
  event,
  isAdmin,
  updateEvent,
  deleteEvent,
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
    </div>
  );
}