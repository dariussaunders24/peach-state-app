"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const adminEmails = ["dariussaunders24@gmail.com"];

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [pastEvents, setPastEvents] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUserId, setCurrentUserId] = useState("");

  const [newEvent, setNewEvent] = useState({
    title: "",
    location: "",
    event_date: "",
    capacity: "",
    difficulty: "",
  });

  useEffect(() => {
    checkUser();
    loadEvents();
  }, []);

  async function checkUser() {
    const { data } = await supabase.auth.getUser();

    if (data.user) {
      setCurrentUserId(data.user.id);

      if (adminEmails.includes((data.user.email || "").toLowerCase())) {
        setIsAdmin(true);
      }
    }
  }

  async function createEvent() {
    const title = newEvent.title.trim();
    const location = newEvent.location.trim();
    const eventDate = newEvent.event_date.trim();
    const capacity = Number(newEvent.capacity);
    const difficulty = newEvent.difficulty.trim();

    if (!title) return alert("Title required");
    if (!eventDate) return alert("Date required");
    if (!capacity || capacity < 1) return alert("Capacity required");

    const { error } = await supabase.from("events").insert({
      title,
      location,
      event_date: eventDate,
      capacity,
      difficulty,
    });

    if (error) return alert(error.message);

    setNewEvent({
      title: "",
      location: "",
      event_date: "",
      capacity: "",
      difficulty: "",
    });

    await loadEvents();
  }

  async function loadEvents() {
    const now = new Date().toISOString();

    const { data: upcomingData } = await supabase
      .from("events")
      .select("*")
      .gte("event_date", now)
      .order("event_date", { ascending: true });

    const { data: pastData } = await supabase
      .from("events")
      .select("*")
      .lt("event_date", now)
      .order("event_date", { ascending: false });

    async function attachCounts(eventsList: any[]) {
      return Promise.all(
        (eventsList || []).map(async (event) => {
          const { count: goingCount } = await supabase
            .from("rsvps")
            .select("*", { count: "exact", head: true })
            .eq("event_id", event.id)
            .eq("status", "going");

          const { count: waitlistCount } = await supabase
            .from("rsvps")
            .select("*", { count: "exact", head: true })
            .eq("event_id", event.id)
            .eq("status", "waitlist");

          return {
            ...event,
            goingCount: goingCount || 0,
            waitlistCount: waitlistCount || 0,
          };
        })
      );
    }

    async function attachRoutes(eventsList: any[]) {
      return Promise.all(
        (eventsList || []).map(async (event) => {
          const { data: routeData, error } = await supabase
            .from("route_links")
            .select("id, event_id, title, onx_url, difficulty, created_at")
            .eq("event_id", event.id)
            .order("created_at", { ascending: false });

          if (error) {
            console.error("Route load error:", error);
          }

          return {
            ...event,
            routes: routeData || [],
          };
        })
      );
    }

    setEvents(await attachCounts(upcomingData || []));
    setPastEvents(await attachRoutes(pastData || []));
  }

  async function deleteEvent(eventId: string) {
    if (!confirm("Delete this event?")) return;

    await supabase.from("rsvps").delete().eq("event_id", eventId);
    await supabase.from("event_photos").delete().eq("event_id", eventId);
    await supabase.from("route_links").delete().eq("event_id", eventId);
    await supabase.from("events").delete().eq("id", eventId);

    await loadEvents();
  }

  async function updateEvent(event: any) {
    const newTitle = prompt("Edit event name", event.title);
    if (!newTitle) return;

    await supabase.from("events").update({ title: newTitle }).eq("id", event.id);

    await loadEvents();
  }

  async function uploadCoverPhoto(event: any, file: File) {
    if (!file) return;

    const fileExt = file.name.split(".").pop();
    const fileName = `${event.id}-${Date.now()}.${fileExt}`;
    const filePath = `${event.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("event-covers")
      .upload(filePath, file);

    if (uploadError) return alert(uploadError.message);

    const { data: publicUrlData } = supabase.storage
      .from("event-covers")
      .getPublicUrl(filePath);

    const { error: updateError } = await supabase
      .from("events")
      .update({ cover_photo_url: publicUrlData.publicUrl })
      .eq("id", event.id);

    if (updateError) return alert(updateError.message);

    await loadEvents();
  }

  async function addRouteToEvent(eventId: string, route: any) {
    const title = route.title.trim();
    const difficulty = route.difficulty.trim();
    const onxUrl = route.onx_url.trim();

    if (!title) return alert("Route name required");
    if (!difficulty) return alert("Difficulty required");
    if (!onxUrl) return alert("GPX / OnX route link required");

    const { error } = await supabase.from("route_links").insert({
      event_id: eventId,
      title,
      difficulty,
      onx_url: onxUrl,
      location: "",
      notes: "",
    });

    if (error) return alert(error.message);

    await loadEvents();
  }

  async function deleteRoute(routeId: string) {
    if (!confirm("Delete this GPX / OnX route?")) return;

    const { error } = await supabase
      .from("route_links")
      .delete()
      .eq("id", routeId);

    if (error) return alert(error.message);

    await loadEvents();
  }

  async function rsvp(event: any) {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const { data: existing } = await supabase
      .from("rsvps")
      .select("*")
      .eq("user_id", userData.user.id)
      .eq("event_id", event.id)
      .limit(1);

    if (existing && existing.length > 0) {
      alert("Already RSVP'd");
      return;
    }

    const status = event.goingCount >= event.capacity ? "waitlist" : "going";

    await supabase.from("rsvps").insert({
      user_id: userData.user.id,
      event_id: event.id,
      status,
    });

    await loadEvents();
  }

  async function cancelRsvp(event: any) {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const { data: existing } = await supabase
      .from("rsvps")
      .select("*")
      .eq("user_id", userData.user.id)
      .eq("event_id", event.id)
      .limit(1);

    if (!existing || existing.length === 0) return;

    const currentRsvp = existing[0];

    await supabase.from("rsvps").delete().eq("id", currentRsvp.id);

    if (currentRsvp.status === "going") {
      const { data: nextWaitlist } = await supabase
        .from("rsvps")
        .select("*")
        .eq("event_id", event.id)
        .eq("status", "waitlist")
        .order("created_at", { ascending: true })
        .limit(1);

      if (nextWaitlist && nextWaitlist.length > 0) {
        await supabase
          .from("rsvps")
          .update({ status: "going" })
          .eq("id", nextWaitlist[0].id);
      }
    }

    await loadEvents();
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-[#F28C52]">Events</h1>

      {isAdmin && (
        <div className="space-y-3 rounded-xl border border-[#F28C52]/30 bg-black/40 p-4">
          <h2 className="text-xl font-bold text-white">Create Event</h2>

          <input
            type="text"
            placeholder="Title"
            value={newEvent.title}
            onChange={(e) =>
              setNewEvent((prev) => ({ ...prev, title: e.target.value }))
            }
            className="w-full rounded-lg border border-white/20 bg-white px-3 py-2 text-black placeholder-gray-500"
          />

          <input
            type="text"
            placeholder="Location"
            value={newEvent.location}
            onChange={(e) =>
              setNewEvent((prev) => ({ ...prev, location: e.target.value }))
            }
            className="w-full rounded-lg border border-white/20 bg-white px-3 py-2 text-black placeholder-gray-500"
          />

          <input
            type="text"
            placeholder="Difficulty"
            value={newEvent.difficulty}
            onChange={(e) =>
              setNewEvent((prev) => ({ ...prev, difficulty: e.target.value }))
            }
            className="w-full rounded-lg border border-white/20 bg-white px-3 py-2 text-black placeholder-gray-500"
          />

          <input
            type="datetime-local"
            value={newEvent.event_date}
            onChange={(e) =>
              setNewEvent((prev) => ({
                ...prev,
                event_date: e.target.value,
              }))
            }
            className="w-full rounded-lg border border-white/20 bg-white px-3 py-2 text-black"
          />

          <input
            type="number"
            min="1"
            placeholder="Capacity"
            value={newEvent.capacity}
            onChange={(e) =>
              setNewEvent((prev) => ({ ...prev, capacity: e.target.value }))
            }
            className="w-full rounded-lg border border-white/20 bg-white px-3 py-2 text-black placeholder-gray-500"
          />

          <button
            onClick={createEvent}
            className="rounded bg-[#F28C52] px-4 py-2 font-semibold text-black hover:bg-[#C96A2C]"
          >
            Create Event
          </button>
        </div>
      )}

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Upcoming Events</h2>

        {events.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-black/30 p-5">
            <p className="text-gray-400">No upcoming events yet.</p>
          </div>
        ) : (
          events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              rsvp={rsvp}
              cancelRsvp={cancelRsvp}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
              updateEvent={updateEvent}
              deleteEvent={deleteEvent}
              uploadCoverPhoto={uploadCoverPhoto}
            />
          ))
        )}
      </section>

      <section className="space-y-4 border-t border-white/10 pt-8">
        <h2 className="text-2xl font-bold text-[#F28C52]">Past Rides</h2>

        {pastEvents.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-black/30 p-5">
            <p className="text-gray-400">No past rides yet.</p>
          </div>
        ) : (
          pastEvents.map((event) => (
            <PastEventCard
              key={event.id}
              event={event}
              isAdmin={isAdmin}
              updateEvent={updateEvent}
              deleteEvent={deleteEvent}
              addRouteToEvent={addRouteToEvent}
              deleteRoute={deleteRoute}
            />
          ))
        )}
      </section>
    </div>
  );
}

function EventCard({
  event,
  rsvp,
  cancelRsvp,
  currentUserId,
  isAdmin,
  updateEvent,
  deleteEvent,
  uploadCoverPhoto,
}: any) {
  const [userStatus, setUserStatus] = useState("");

  useEffect(() => {
    if (currentUserId) {
      loadStatus();
    } else {
      setUserStatus("");
    }
  }, [currentUserId, event.id]);

  async function loadStatus() {
    const { data } = await supabase
      .from("rsvps")
      .select("*")
      .eq("event_id", event.id)
      .eq("user_id", currentUserId)
      .limit(1);

    if (data && data.length > 0) {
      setUserStatus(data[0].status);
    } else {
      setUserStatus("");
    }
  }

  return (
    <div className="overflow-hidden rounded-xl border border-[#F28C52]/20 bg-black/40">
      {event.cover_photo_url && (
        <img
          src={event.cover_photo_url}
          alt={event.title}
          className="h-56 w-full object-cover"
        />
      )}

      <div className="p-5">
        <h3 className="text-xl font-bold text-white">{event.title}</h3>

        {event.location && <p className="text-gray-300">{event.location}</p>}

        {event.difficulty && (
          <p className="mt-2 text-sm font-semibold text-[#F28C52]">
            Difficulty: {event.difficulty}
          </p>
        )}

        {event.event_date && (
          <p className="mt-2 text-sm text-gray-400">
            {new Date(event.event_date).toLocaleString()}
          </p>
        )}

        <p className="mt-2 text-sm text-gray-400">
          {event.goingCount} / {event.capacity} going
        </p>

        {event.waitlistCount > 0 && (
          <p className="text-sm text-yellow-300">
            Waitlist: {event.waitlistCount}
          </p>
        )}

        <div className="mt-4 flex flex-col gap-3">
          <a
            href={`/events/${event.id}`}
            className="rounded-lg border border-[#F28C52] px-4 py-2 text-center font-semibold text-[#F28C52]"
          >
            View Details
          </a>

          {currentUserId &&
            (userStatus ? (
              <button
                onClick={() => cancelRsvp(event)}
                className="rounded-lg border border-red-400 px-4 py-2 text-red-300"
              >
                Cancel RSVP
              </button>
            ) : (
              <button
                onClick={() => rsvp(event)}
                className="rounded-lg bg-white px-4 py-2 text-black"
              >
                {event.goingCount >= event.capacity ? "Join Waitlist" : "RSVP"}
              </button>
            ))}

          {isAdmin && (
            <label className="cursor-pointer rounded-lg border border-white/20 px-4 py-2 text-center font-semibold text-white hover:border-[#F28C52] hover:text-[#F28C52]">
              Upload Cover Photo
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadCoverPhoto(event, file);
                }}
              />
            </label>
          )}

          {isAdmin && (
            <div className="flex gap-2">
              <button
                onClick={() => updateEvent(event)}
                className="rounded bg-yellow-400 px-3 py-1 text-black"
              >
                Edit
              </button>

              <button
                onClick={() => deleteEvent(event.id)}
                className="rounded bg-red-500 px-3 py-1 text-white"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PastEventCard({
  event,
  isAdmin,
  updateEvent,
  deleteEvent,
  addRouteToEvent,
  deleteRoute,
}: any) {
  const [newRoute, setNewRoute] = useState({
    title: "",
    difficulty: "",
    onx_url: "",
  });

  const route = event.routes?.[0];

  async function handleAddRoute() {
    await addRouteToEvent(event.id, {
      title: newRoute.title,
      difficulty: newRoute.difficulty,
      onx_url: newRoute.onx_url,
    });

    setNewRoute({
      title: "",
      difficulty: "",
      onx_url: "",
    });
  }

  return (
    <div className="rounded-xl border border-[#F28C52]/20 bg-black/40 p-5">
      <h3 className="text-xl font-bold text-white">{event.title}</h3>

      <div className="mt-3 space-y-2">
        {route?.title && (
          <p className="text-sm text-gray-300">
            Route: <span className="font-semibold text-white">{route.title}</span>
          </p>
        )}

        <p className="text-sm font-semibold text-[#F28C52]">
          Difficulty: {route?.difficulty || event.difficulty || "Not listed"}
        </p>

        {event.event_date && (
          <p className="text-sm text-gray-400">
            Date: {new Date(event.event_date).toLocaleString()}
          </p>
        )}

        {route?.onx_url ? (
          <a
            href={route.onx_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-lg border border-[#F28C52] px-4 py-2 text-center font-semibold text-[#F28C52] hover:bg-[#F28C52] hover:text-black"
          >
            Open GPX / OnX Route
          </a>
        ) : (
          <p className="text-sm text-gray-400">No GPX / OnX route added.</p>
        )}
      </div>

      {isAdmin && (
        <div className="mt-5 space-y-3 border-t border-white/10 pt-4">
          <h4 className="font-semibold text-white">Add GPX / OnX Route</h4>

          <input
            type="text"
            placeholder="Route Name"
            value={newRoute.title}
            onChange={(e) =>
              setNewRoute((prev) => ({ ...prev, title: e.target.value }))
            }
            className="w-full rounded-lg border border-white/20 bg-white px-3 py-2 text-black placeholder-gray-500"
          />

          <input
            type="text"
            placeholder="Difficulty"
            value={newRoute.difficulty}
            onChange={(e) =>
              setNewRoute((prev) => ({ ...prev, difficulty: e.target.value }))
            }
            className="w-full rounded-lg border border-white/20 bg-white px-3 py-2 text-black placeholder-gray-500"
          />

          <input
            type="url"
            placeholder="GPX / OnX Route Link"
            value={newRoute.onx_url}
            onChange={(e) =>
              setNewRoute((prev) => ({ ...prev, onx_url: e.target.value }))
            }
            className="w-full rounded-lg border border-white/20 bg-white px-3 py-2 text-black placeholder-gray-500"
          />

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleAddRoute}
              className="rounded bg-[#F28C52] px-4 py-2 font-semibold text-black hover:bg-[#C96A2C]"
            >
              Save Route
            </button>

            {route && (
              <button
                onClick={() => deleteRoute(route.id)}
                className="rounded bg-red-500 px-4 py-2 font-semibold text-white hover:bg-red-600"
              >
                Delete Route
              </button>
            )}

            <button
              onClick={() => updateEvent(event)}
              className="rounded bg-yellow-400 px-4 py-2 font-semibold text-black"
            >
              Edit Event
            </button>

            <button
              onClick={() => deleteEvent(event.id)}
              className="rounded bg-red-500 px-4 py-2 font-semibold text-white"
            >
              Delete Event
            </button>
          </div>
        </div>
      )}
    </div>
  );
}