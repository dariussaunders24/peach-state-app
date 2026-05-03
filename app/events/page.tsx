"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const adminEmails = ["dariussaunders24@gmail.com"];

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [pastEvents, setPastEvents] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    loadUser();
    loadEvents();
  }, []);

  async function loadUser() {
    const { data } = await supabase.auth.getUser();

    if (data.user) {
      setCurrentUserId(data.user.id);
      if (adminEmails.includes(data.user.email || "")) {
        setIsAdmin(true);
      }
    }
  }

  async function loadEvents() {
    const now = new Date().toISOString();

    const { data: upcoming } = await supabase
      .from("events")
      .select("*")
      .gte("event_date", now)
      .order("event_date");

    const { data: past } = await supabase
      .from("events")
      .select("*")
      .lt("event_date", now)
      .order("event_date", { ascending: false });

    async function attachData(eventsList: any[]) {
      return Promise.all(
        (eventsList || []).map(async (event) => {
          const { data: rsvps } = await supabase
            .from("rsvps")
            .select("*")
            .eq("event_id", event.id);

          const userIds = (rsvps || []).map((r: any) => r.user_id);

          let profiles: any[] = [];

          if (userIds.length > 0) {
            const { data } = await supabase
              .from("profiles")
              .select("user_id, name, image_url")
              .in("user_id", userIds);

            profiles = data || [];
          }

          const attendees = (rsvps || []).map((r: any) => ({
            ...r,
            profiles: profiles.find((p) => p.user_id === r.user_id),
          }));

          const goingCount = attendees.filter(
            (a: any) => a.status === "going"
          ).length;

          const waitlistCount = attendees.filter(
            (a: any) => a.status === "waitlist"
          ).length;

          const { data: routes } = await supabase
            .from("route_links")
            .select("*")
            .eq("event_id", event.id);

          return {
            ...event,
            attendees,
            goingCount,
            waitlistCount,
            routes: routes || [],
          };
        })
      );
    }

    setEvents(await attachData(upcoming || []));
    setPastEvents(await attachData(past || []));
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-[#F28C52]">Events</h1>

      <section>
        <h2 className="text-xl font-bold text-white">Upcoming</h2>
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </section>

      <section>
        <h2 className="text-xl font-bold text-[#F28C52]">Past Events</h2>
        {pastEvents.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </section>
    </div>
  );
}

function EventCard({ event }: any) {
  const going = event.attendees.filter((a: any) => a.status === "going");
  const waitlist = event.attendees.filter(
    (a: any) => a.status === "waitlist"
  );

  return (
    <div className="rounded-xl border border-[#F28C52]/20 bg-black/40 p-5">
      <h3 className="text-xl font-bold text-white">{event.title}</h3>

      <p className="text-[#F28C52]">Difficulty: {event.difficulty}</p>

      <p className="text-gray-400">
        Date: {new Date(event.event_date).toLocaleString()}
      </p>

      {/* ROUTE HUB */}
      <RouteHub event={event} />

      {/* ATTENDEES */}
      <div className="mt-4">
        <h4 className="text-white font-semibold">Attendees</h4>

        {going.length === 0 && waitlist.length === 0 && (
          <p className="text-gray-400">No attendees yet.</p>
        )}

        {going.length > 0 && (
          <>
            <p className="text-green-400 text-sm mt-2">Going</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {going.map((a: any) => (
                <span
                  key={a.user_id}
                  className="px-3 py-1 text-sm bg-green-500/10 border border-green-400/20 rounded-full"
                >
                  {a.profiles?.name || "Member"}
                </span>
              ))}
            </div>
          </>
        )}

        {waitlist.length > 0 && (
          <>
            <p className="text-yellow-400 text-sm mt-2">Waitlist</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {waitlist.map((a: any) => (
                <span
                  key={a.user_id}
                  className="px-3 py-1 text-sm bg-yellow-500/10 border border-yellow-400/20 rounded-full"
                >
                  {a.profiles?.name || "Member"}
                </span>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function RouteHub({ event }: any) {
  const routes = event.routes || [];

  if (routes.length === 0) {
    return (
      <div className="mt-4 border border-white/10 p-4 rounded-lg">
        <p className="text-gray-400 text-sm">
          No route links have been added yet.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-lg border border-[#F28C52]/20 bg-black/30 p-4">
      <h4 className="font-semibold text-[#F28C52]">Route Hub</h4>

      <div className="mt-3 space-y-3">
        {routes.map((route: any) => (
          <div key={route.id} className="border border-white/10 p-3 rounded-lg">
            <p className="text-white font-semibold">{route.title}</p>

            <div className="flex flex-wrap gap-2 mt-2">
              {route.onx_url && (
                <a
                  href={route.onx_url}
                  target="_blank"
                  className="border border-[#F28C52] px-3 py-1 rounded text-[#F28C52]"
                >
                  Open in onX
                </a>
              )}

              {route.gpx_url && (
                <a
                  href={route.gpx_url}
                  target="_blank"
                  className="border px-3 py-1 rounded"
                >
                  GPX
                </a>
              )}

              {route.google_maps_url && (
                <a
                  href={route.google_maps_url}
                  target="_blank"
                  className="border px-3 py-1 rounded"
                >
                  Maps
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}