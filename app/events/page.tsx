"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const adminEmails = ["dariussaunders24@gmail.com"];

const bringOptions = [
  "GMRS radio",
  "Recovery gear",
  "Tire deflator",
  "Air compressor",
  "Lunch / snacks",
  "Water / drinks",
  "Camp chair",
  "Weather-appropriate clothing",
  "Closed-toe shoes",
  "Full tank of gas",
  "Basic tools",
  "First aid kit",
  "Trash bag",
  "Bug spray / sunscreen",
  "Portable toilet supplies, if needed",
  "Cash for park fees",
  "OnX / GPX app downloaded",
  "Phone charger / battery pack",
  "Tow points required",
  "Skid plates recommended",
];

const defaultDisclaimer =
  "By RSVP’ing to this event, you accept any and all risk for vehicle damage, personal injury, recovery needs, or liability. Peach State Off-Road and Overlanding and its organizers are not liable. No-shows without canceling your RSVP at least 24 hours before the event will result in a (1) ride ban. This is so we can ensure maximum enjoyment and available spots for all members who want to attend.";

function formatDateForInput(dateValue: string) {
  if (!dateValue) return "";

  const date = new Date(dateValue);
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60000);

  return localDate.toISOString().slice(0, 16);
}

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [pastEvents, setPastEvents] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUserId, setCurrentUserId] = useState("");
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [editingEvent, setEditingEvent] = useState<any | null>(null);

  const [newEvent, setNewEvent] = useState({
    title: "",
    public_location: "",
    private_location: "",
    private_details: "",
    route_link: "",
    event_date: "",
    capacity: "",
    difficulty: "",
    bring_items: [] as string[],
    rsvp_disclaimer: defaultDisclaimer,
  });

  const [editForm, setEditForm] = useState({
    title: "",
    public_location: "",
    private_location: "",
    private_details: "",
    route_link: "",
    event_date: "",
    capacity: "",
    difficulty: "",
    bring_items: [] as string[],
    rsvp_disclaimer: defaultDisclaimer,
  });

  useEffect(() => {
    checkUser();
    loadEvents();
  }, []);

  function showConfirmation(message: string) {
    setConfirmationMessage(message);
  }

  async function checkUser() {
    const { data } = await supabase.auth.getUser();

    if (data.user) {
      setCurrentUserId(data.user.id);

      if (adminEmails.includes((data.user.email || "").toLowerCase().trim())) {
        setIsAdmin(true);
      }
    }
  }

  function toggleBringItem(item: string) {
    setNewEvent((prev) => {
      const exists = prev.bring_items.includes(item);

      return {
        ...prev,
        bring_items: exists
          ? prev.bring_items.filter((i) => i !== item)
          : [...prev.bring_items, item],
      };
    });
  }

  function toggleEditBringItem(item: string) {
    setEditForm((prev) => {
      const exists = prev.bring_items.includes(item);

      return {
        ...prev,
        bring_items: exists
          ? prev.bring_items.filter((i) => i !== item)
          : [...prev.bring_items, item],
      };
    });
  }

  function openEditEvent(event: any) {
    setEditingEvent(event);

    setEditForm({
      title: event.title || "",
      public_location: event.public_location || event.location || "",
      private_location: event.private_location || "",
      private_details: event.private_details || "",
      route_link: event.route_link || "",
      event_date: formatDateForInput(event.event_date),
      capacity: event.capacity ? String(event.capacity) : "",
      difficulty: event.difficulty || "",
      bring_items: event.bring_items || [],
      rsvp_disclaimer: event.rsvp_disclaimer || defaultDisclaimer,
    });
  }

  async function saveEditedEvent() {
    if (!editingEvent) return;

    const title = editForm.title.trim();
    const publicLocation = editForm.public_location.trim();
    const privateLocation = editForm.private_location.trim();
    const privateDetails = editForm.private_details.trim();
    const routeLink = editForm.route_link.trim();
    const eventDate = editForm.event_date.trim();
    const capacity = Number(editForm.capacity);
    const difficulty = editForm.difficulty.trim();

    if (!title) return alert("Title required");
    if (!eventDate) return alert("Date required");
    if (!capacity || capacity < 1) return alert("Capacity required");

    const { error } = await supabase
      .from("events")
      .update({
        title,
        location: publicLocation,
        public_location: publicLocation,
        private_location: privateLocation,
        private_details: privateDetails,
        route_link: routeLink,
        event_date: eventDate,
        capacity,
        difficulty,
        bring_items: editForm.bring_items,
        rsvp_disclaimer: editForm.rsvp_disclaimer.trim() || defaultDisclaimer,
      })
      .eq("id", editingEvent.id);

    if (error) return alert(error.message);

    setEditingEvent(null);
    await loadEvents();
  }

  async function createEvent() {
    const title = newEvent.title.trim();
    const publicLocation = newEvent.public_location.trim();
    const privateLocation = newEvent.private_location.trim();
    const privateDetails = newEvent.private_details.trim();
    const routeLink = newEvent.route_link.trim();
    const eventDate = newEvent.event_date.trim();
    const capacity = Number(newEvent.capacity);
    const difficulty = newEvent.difficulty.trim();

    if (!title) return alert("Title required");
    if (!eventDate) return alert("Date required");
    if (!capacity || capacity < 1) return alert("Capacity required");

    const { error } = await supabase.from("events").insert({
      title,
      location: publicLocation,
      public_location: publicLocation,
      private_location: privateLocation,
      private_details: privateDetails,
      route_link: routeLink,
      event_date: eventDate,
      capacity,
      difficulty,
      bring_items: newEvent.bring_items,
      rsvp_disclaimer: newEvent.rsvp_disclaimer.trim() || defaultDisclaimer,
    });

    if (error) return alert(error.message);

    setNewEvent({
      title: "",
      public_location: "",
      private_location: "",
      private_details: "",
      route_link: "",
      event_date: "",
      capacity: "",
      difficulty: "",
      bring_items: [],
      rsvp_disclaimer: defaultDisclaimer,
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
          const { data: rsvpData, error: rsvpError } = await supabase
            .from("rsvps")
            .select("id, user_id, event_id, status, created_at")
            .eq("event_id", event.id)
            .order("created_at", { ascending: true });

          if (rsvpError) {
            console.error("RSVP load error:", rsvpError);
          }

          const rsvps = rsvpData || [];
          const userIds = rsvps.map((rsvp) => rsvp.user_id);

          let profiles: any[] = [];

          if (userIds.length > 0) {
            const { data: profileData, error: profileError } = await supabase
              .from("profiles")
              .select("user_id, name, image_url")
              .in("user_id", userIds);

            if (profileError) {
              console.error("Profile load error:", profileError);
            }

            profiles = profileData || [];
          }

          const attendees = rsvps.map((rsvp) => {
            const profile = profiles.find(
              (profile) => profile.user_id === rsvp.user_id
            );

            return {
              ...rsvp,
              profiles: profile || null,
            };
          });

          const goingCount = attendees.filter(
            (attendee) => attendee.status === "going"
          ).length;

          const waitlistCount = attendees.filter(
            (attendee) => attendee.status === "waitlist"
          ).length;

          return {
            ...event,
            goingCount,
            waitlistCount,
            attendees,
          };
        })
      );
    }

    async function attachRoutes(eventsList: any[]) {
      return Promise.all(
        (eventsList || []).map(async (event) => {
          const { data: routeData, error } = await supabase
            .from("route_links")
            .select("*")
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

    const upcomingWithCounts = await attachCounts(upcomingData || []);
    const upcomingWithRoutes = await attachRoutes(upcomingWithCounts);
    const pastWithRoutes = await attachRoutes(pastData || []);

    setEvents(upcomingWithRoutes);
    setPastEvents(pastWithRoutes);
  }

  async function deleteEvent(eventId: string) {
    if (!confirm("Delete this event?")) return;

    await supabase.from("rsvps").delete().eq("event_id", eventId);
    await supabase.from("event_photos").delete().eq("event_id", eventId);
    await supabase.from("route_links").delete().eq("event_id", eventId);
    await supabase.from("events").delete().eq("id", eventId);

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
    const gpxUrl = route.gpx_url.trim();
    const googleMapsUrl = route.google_maps_url.trim();
    const notes = route.notes.trim();

    if (!title) return alert("Route name required");

    if (!onxUrl && !gpxUrl && !googleMapsUrl && !notes) {
      return alert("Add at least one route link or route note.");
    }

    const { error } = await supabase.from("route_links").insert({
      event_id: eventId,
      title,
      difficulty,
      onx_url: onxUrl,
      gpx_url: gpxUrl,
      google_maps_url: googleMapsUrl,
      notes,
      location: "",
    });

    if (error) return alert(error.message);

    await loadEvents();
  }

  async function deleteRoute(routeId: string) {
    if (!confirm("Delete this route?")) return;

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

    const accepted = confirm(event.rsvp_disclaimer || defaultDisclaimer);
    if (!accepted) return;

    const { data: existing } = await supabase
      .from("rsvps")
      .select("*")
      .eq("user_id", userData.user.id)
      .eq("event_id", event.id)
      .limit(1);

    if (existing && existing.length > 0) {
      showConfirmation("You are already RSVP’d for this event.");
      return;
    }

    const status = event.goingCount >= event.capacity ? "waitlist" : "going";

    const { error } = await supabase.from("rsvps").insert({
      user_id: userData.user.id,
      event_id: event.id,
      status,
    });

    if (error) {
      alert(error.message);
      return;
    }

    await loadEvents();

    if (status === "going") {
      showConfirmation(
        "RSVP confirmed. You’re on the Going list.\n\nReminder: No-shows without canceling your RSVP at least 24 hours before the event will result in a 1-ride ban. This helps us keep spots available for members who want to attend."
      );
    } else {
      showConfirmation(
        "This event is currently full. You’ve been added to the waitlist.\n\nReminder: If you are moved from the waitlist to Going and can no longer attend, please cancel at least 24 hours before the event."
      );
    }
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
    showConfirmation("Your RSVP has been canceled.");
  }

  return (
    <div className="space-y-8">
      {confirmationMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-2xl border border-[#F28C52]/40 bg-[#100B08] p-6 text-center shadow-2xl">
            <p className="text-xs uppercase tracking-[0.3em] text-[#F28C52]/80">
              Confirmation
            </p>

            <h2 className="mt-2 font-cinzel text-2xl font-bold text-white">
              Event Update
            </h2>

            <p className="mt-4 whitespace-pre-line text-sm leading-6 text-white/75">
              {confirmationMessage}
            </p>

            <button
              onClick={() => setConfirmationMessage("")}
              className="mt-6 rounded-lg bg-[#F28C52] px-6 py-3 font-semibold text-black transition hover:bg-[#C96A2C]"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {editingEvent && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 px-4 py-8">
          <div className="mx-auto max-w-3xl rounded-2xl border border-[#F28C52]/40 bg-[#100B08] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[#F28C52]/80">
                  Admin
                </p>
                <h2 className="mt-2 font-cinzel text-2xl font-bold text-white">
                  Edit Event
                </h2>
              </div>

              <button
                onClick={() => setEditingEvent(null)}
                className="rounded-lg border border-white/20 px-3 py-2 text-sm text-white hover:border-[#F28C52] hover:text-[#F28C52]"
              >
                Close
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <input
                type="text"
                placeholder="Title"
                value={editForm.title}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, title: e.target.value }))
                }
                className="w-full rounded-lg border border-white/20 bg-white px-3 py-2 text-black placeholder-gray-500"
              />

              <input
                type="text"
                placeholder="Public Location"
                value={editForm.public_location}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    public_location: e.target.value,
                  }))
                }
                className="w-full rounded-lg border border-white/20 bg-white px-3 py-2 text-black placeholder-gray-500"
              />

              <input
                type="text"
                placeholder="Private Exact Location"
                value={editForm.private_location}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    private_location: e.target.value,
                  }))
                }
                className="w-full rounded-lg border border-white/20 bg-white px-3 py-2 text-black placeholder-gray-500"
              />

              <textarea
                placeholder="Private Details"
                value={editForm.private_details}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    private_details: e.target.value,
                  }))
                }
                className="min-h-24 w-full rounded-lg border border-white/20 bg-white px-3 py-2 text-black placeholder-gray-500"
              />

              <input
                type="url"
                placeholder="Legacy Route Link"
                value={editForm.route_link}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    route_link: e.target.value,
                  }))
                }
                className="w-full rounded-lg border border-white/20 bg-white px-3 py-2 text-black placeholder-gray-500"
              />

              <input
                type="text"
                placeholder="Difficulty"
                value={editForm.difficulty}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    difficulty: e.target.value,
                  }))
                }
                className="w-full rounded-lg border border-white/20 bg-white px-3 py-2 text-black placeholder-gray-500"
              />

              <input
                type="datetime-local"
                value={editForm.event_date}
                onChange={(e) =>
                  setEditForm((prev) => ({
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
                value={editForm.capacity}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    capacity: e.target.value,
                  }))
                }
                className="w-full rounded-lg border border-white/20 bg-white px-3 py-2 text-black placeholder-gray-500"
              />

              <div className="rounded-lg border border-white/10 bg-black/30 p-4">
                <h3 className="font-semibold text-white">What to Bring</h3>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {bringOptions.map((item) => {
                    const selected = editForm.bring_items.includes(item);

                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleEditBringItem(item)}
                        className={`rounded-lg border px-3 py-2 text-left text-sm transition ${
                          selected
                            ? "border-[#F28C52] bg-[#F28C52] font-semibold text-black"
                            : "border-white/10 bg-black/30 text-white hover:border-[#F28C52] hover:text-[#F28C52]"
                        }`}
                      >
                        {selected ? "✓ " : "+ "}
                        {item}
                      </button>
                    );
                  })}
                </div>
              </div>

              <textarea
                placeholder="RSVP Disclaimer"
                value={editForm.rsvp_disclaimer}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    rsvp_disclaimer: e.target.value,
                  }))
                }
                className="min-h-24 w-full rounded-lg border border-white/20 bg-white px-3 py-2 text-black placeholder-gray-500"
              />

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={saveEditedEvent}
                  className="rounded-lg bg-[#F28C52] px-5 py-3 font-semibold text-black hover:bg-[#C96A2C]"
                >
                  Save Changes
                </button>

                <button
                  onClick={() => setEditingEvent(null)}
                  className="rounded-lg border border-white/20 px-5 py-3 font-semibold text-white hover:border-[#F28C52] hover:text-[#F28C52]"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <h1 className="text-3xl font-bold text-[#F28C52]">Events</h1>

      {isAdmin && (
        <div className="space-y-5 rounded-xl border border-[#F28C52]/30 bg-black/40 p-4">
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
            placeholder="Public Location, example: North Georgia area"
            value={newEvent.public_location}
            onChange={(e) =>
              setNewEvent((prev) => ({
                ...prev,
                public_location: e.target.value,
              }))
            }
            className="w-full rounded-lg border border-white/20 bg-white px-3 py-2 text-black placeholder-gray-500"
          />

          <input
            type="text"
            placeholder="Private Exact Location, visible after RSVP"
            value={newEvent.private_location}
            onChange={(e) =>
              setNewEvent((prev) => ({
                ...prev,
                private_location: e.target.value,
              }))
            }
            className="w-full rounded-lg border border-white/20 bg-white px-3 py-2 text-black placeholder-gray-500"
          />

          <textarea
            placeholder="Private Details, meetup notes, parking, gate codes, instructions"
            value={newEvent.private_details}
            onChange={(e) =>
              setNewEvent((prev) => ({
                ...prev,
                private_details: e.target.value,
              }))
            }
            className="min-h-24 w-full rounded-lg border border-white/20 bg-white px-3 py-2 text-black placeholder-gray-500"
          />

          <input
            type="url"
            placeholder="Private Route Link, OnX / GPX / Google Maps"
            value={newEvent.route_link}
            onChange={(e) =>
              setNewEvent((prev) => ({ ...prev, route_link: e.target.value }))
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

          <div className="rounded-lg border border-white/10 bg-black/30 p-4">
            <h3 className="font-semibold text-white">What to Bring</h3>
            <p className="mt-1 text-sm text-gray-400">
              Tap items to include them on this event.
            </p>

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {bringOptions.map((item) => {
                const selected = newEvent.bring_items.includes(item);

                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleBringItem(item)}
                    className={`rounded-lg border px-3 py-2 text-left text-sm transition ${
                      selected
                        ? "border-[#F28C52] bg-[#F28C52] font-semibold text-black"
                        : "border-white/10 bg-black/30 text-white hover:border-[#F28C52] hover:text-[#F28C52]"
                    }`}
                  >
                    {selected ? "✓ " : "+ "}
                    {item}
                  </button>
                );
              })}
            </div>
          </div>

          <textarea
            placeholder="RSVP Disclaimer"
            value={newEvent.rsvp_disclaimer}
            onChange={(e) =>
              setNewEvent((prev) => ({
                ...prev,
                rsvp_disclaimer: e.target.value,
              }))
            }
            className="min-h-24 w-full rounded-lg border border-white/20 bg-white px-3 py-2 text-black placeholder-gray-500"
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
              updateEvent={openEditEvent}
              deleteEvent={deleteEvent}
              uploadCoverPhoto={uploadCoverPhoto}
            />
          ))
        )}
      </section>

      <section className="space-y-4 border-t border-white/10 pt-8">
        <h2 className="text-2xl font-bold text-[#F28C52]">Past Events</h2>

        {pastEvents.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-black/30 p-5">
            <p className="text-gray-400">No past events yet.</p>
          </div>
        ) : (
          pastEvents.map((event) => (
            <PastEventCard
              key={event.id}
              event={event}
              isAdmin={isAdmin}
              updateEvent={openEditEvent}
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

function StatusBadge({ status }: { status: string }) {
  let styles = "border-white/20 bg-white/10 text-white/60";
  let label = "Not RSVP";

  if (status === "going") {
    styles = "border-green-400/30 bg-green-500/20 text-green-300";
    label = "Going";
  }

  if (status === "waitlist") {
    styles = "border-yellow-400/30 bg-yellow-500/20 text-yellow-300";
    label = "Waitlist";
  }

  return (
    <div
      className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${styles}`}
    >
      {label}
    </div>
  );
}

function RouteHub({ event }: any) {
  const routes = event.routes || [];

  if (routes.length === 0) {
    return (
      <div className="mt-4 rounded-lg border border-white/10 bg-black/30 p-4">
        <h4 className="font-semibold text-[#F28C52]">Route Hub</h4>
        <p className="mt-2 text-sm text-gray-400">
          No route links have been added yet.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-lg border border-[#F28C52]/20 bg-black/30 p-4">
      <h4 className="font-semibold text-[#F28C52]">Route Hub</h4>

      <p className="mt-1 text-sm text-gray-400">
        Route links, meetup pins, GPX files, and trail notes live here.
      </p>

      <div className="mt-4 space-y-4">
        {routes.map((route: any) => (
          <div
            key={route.id}
            className="rounded-lg border border-white/10 bg-black/20 p-3"
          >
            <p className="font-semibold text-white">{route.title}</p>

            {route.difficulty && (
              <p className="mt-1 text-sm text-[#F28C52]">
                Difficulty: {route.difficulty}
              </p>
            )}

            <div className="mt-3 flex flex-wrap gap-2">
              {route.onx_url && (
                <a
                  href={route.onx_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-[#F28C52] px-3 py-2 text-sm font-semibold text-[#F28C52] hover:bg-[#F28C52] hover:text-black"
                >
                  Open in onX
                </a>
              )}

              {route.gpx_url && (
                <a
                  href={route.gpx_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-white/20 px-3 py-2 text-sm font-semibold text-white hover:border-[#F28C52] hover:text-[#F28C52]"
                >
                  Download GPX
                </a>
              )}

              {route.google_maps_url && (
                <a
                  href={route.google_maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-white/20 px-3 py-2 text-sm font-semibold text-white hover:border-[#F28C52] hover:text-[#F28C52]"
                >
                  Open Meetup Pin
                </a>
              )}
            </div>

            {route.notes && (
              <p className="mt-3 whitespace-pre-line text-sm leading-6 text-gray-300">
                {route.notes}
              </p>
            )}
          </div>
        ))}
      </div>
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

  const canViewPrivateDetails =
    isAdmin || userStatus === "going" || userStatus === "waitlist";

  const publicLocation = event.public_location || event.location;
  const bringItems = event.bring_items || [];
  const goingAttendees =
    event.attendees?.filter((a: any) => a.status === "going") || [];
  const waitlistAttendees =
    event.attendees?.filter((a: any) => a.status === "waitlist") || [];

  return (
    <div className="overflow-hidden rounded-xl border border-[#F28C52]/20 bg-black/40">
{event.cover_photo_url && (
  <div className="w-full max-w-[380px] aspect-[4/5] bg-black mx-auto rounded-lg overflow-hidden border border-white/10 shadow-lg">
    <img
      src={event.cover_photo_url}
      alt={event.title || "Event cover"}
      className="h-full w-full object-contain"
    />
  </div>
)}

      <div className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold text-white">{event.title}</h3>

            {publicLocation && (
              <p className="text-gray-300">Area: {publicLocation}</p>
            )}
          </div>

          <StatusBadge status={userStatus} />
        </div>

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

        {bringItems.length > 0 && (
          <div className="mt-4 rounded-lg border border-white/10 bg-black/30 p-4">
            <h4 className="font-semibold text-white">What to Bring</h4>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {bringItems.map((item: string) => (
                <div key={item} className="text-sm text-gray-300">
                  ✓ {item}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 rounded-lg border border-white/10 bg-black/30 p-4">
          {canViewPrivateDetails ? (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-[#F28C52]">
                RSVP Details
              </p>

              {event.private_location ? (
                <p className="text-sm text-white">
                  <span className="text-gray-400">Exact location:</span>{" "}
                  {event.private_location}
                </p>
              ) : (
                <p className="text-sm text-gray-400">
                  Exact location has not been added yet.
                </p>
              )}

              {event.private_details && (
                <p className="whitespace-pre-line text-sm text-gray-300">
                  {event.private_details}
                </p>
              )}

              <RouteHub event={event} />
            </div>
          ) : (
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-lg">
                🔒
              </div>

              <div>
                <p className="text-sm font-semibold text-white">
                  Details unlock after RSVP
                </p>

                <p className="mt-1 text-sm leading-6 text-gray-400">
                  Exact meetup location, Route Hub links, and event instructions are visible after RSVP to help manage space, safety, and group size.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 rounded-lg border border-white/10 bg-black/30 p-4">
          <h4 className="font-semibold text-white">Attendees</h4>

          {goingAttendees.length === 0 && waitlistAttendees.length === 0 ? (
            <p className="mt-2 text-sm text-gray-400">No RSVPs yet.</p>
          ) : (
            <div className="mt-3 space-y-3">
              {goingAttendees.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-green-300">Going</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {goingAttendees.map((attendee: any) => (
                      <a
                        key={`${event.id}-${attendee.user_id}`}
                        href={`/members/${attendee.user_id}`}
                        className="rounded-full border border-green-400/20 bg-green-500/10 px-3 py-1 text-sm text-green-200 hover:border-green-300"
                      >
                        {attendee.profiles?.name || "Member"}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {waitlistAttendees.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-yellow-300">
                    Waitlist
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {waitlistAttendees.map((attendee: any) => (
                      <a
                        key={`${event.id}-${attendee.user_id}`}
                        href={`/members/${attendee.user_id}`}
                        className="rounded-full border border-yellow-300/20 bg-yellow-300/10 px-3 py-1 text-sm text-yellow-200 hover:border-yellow-300"
                      >
                        {attendee.profiles?.name || "Member"}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

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
                onClick={async () => {
                  await cancelRsvp(event);
                  await loadStatus();
                }}
                className="rounded-lg border border-red-400 px-4 py-2 text-red-300"
              >
                Cancel RSVP
              </button>
            ) : (
              <button
                onClick={async () => {
                  await rsvp(event);
                  await loadStatus();
                }}
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
    gpx_url: "",
    google_maps_url: "",
    notes: "",
  });

  async function handleAddRoute() {
    await addRouteToEvent(event.id, newRoute);

    setNewRoute({
      title: "",
      difficulty: "",
      onx_url: "",
      gpx_url: "",
      google_maps_url: "",
      notes: "",
    });
  }

  return (
    <div className="rounded-xl border border-[#F28C52]/20 bg-black/40 p-5">
      <h3 className="text-xl font-bold text-white">{event.title}</h3>

      <div className="mt-3 space-y-2">
        <p className="text-sm font-semibold text-[#F28C52]">
          Difficulty: {event.difficulty || "Not listed"}
        </p>

        {event.event_date && (
          <p className="text-sm text-gray-400">
            Date: {new Date(event.event_date).toLocaleString()}
          </p>
        )}

        <RouteHub event={event} />
      </div>

      {isAdmin && (
        <div className="mt-5 space-y-3 border-t border-white/10 pt-4">
          <h4 className="font-semibold text-white">Add Route Hub Link</h4>

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
              setNewRoute((prev) => ({
                ...prev,
                difficulty: e.target.value,
              }))
            }
            className="w-full rounded-lg border border-white/20 bg-white px-3 py-2 text-black placeholder-gray-500"
          />

          <input
            type="url"
            placeholder="onX Link"
            value={newRoute.onx_url}
            onChange={(e) =>
              setNewRoute((prev) => ({ ...prev, onx_url: e.target.value }))
            }
            className="w-full rounded-lg border border-white/20 bg-white px-3 py-2 text-black placeholder-gray-500"
          />

          <input
            type="url"
            placeholder="GPX File Link"
            value={newRoute.gpx_url}
            onChange={(e) =>
              setNewRoute((prev) => ({ ...prev, gpx_url: e.target.value }))
            }
            className="w-full rounded-lg border border-white/20 bg-white px-3 py-2 text-black placeholder-gray-500"
          />

          <input
            type="url"
            placeholder="Google Maps Meetup Pin"
            value={newRoute.google_maps_url}
            onChange={(e) =>
              setNewRoute((prev) => ({
                ...prev,
                google_maps_url: e.target.value,
              }))
            }
            className="w-full rounded-lg border border-white/20 bg-white px-3 py-2 text-black placeholder-gray-500"
          />

          <textarea
            placeholder="Route Notes"
            value={newRoute.notes}
            onChange={(e) =>
              setNewRoute((prev) => ({ ...prev, notes: e.target.value }))
            }
            className="min-h-24 w-full rounded-lg border border-white/20 bg-white px-3 py-2 text-black placeholder-gray-500"
          />

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleAddRoute}
              className="rounded bg-[#F28C52] px-4 py-2 font-semibold text-black hover:bg-[#C96A2C]"
            >
              Save Route
            </button>

            {event.routes?.map((route: any) => (
              <button
                key={route.id}
                onClick={() => deleteRoute(route.id)}
                className="rounded bg-red-500 px-4 py-2 font-semibold text-white hover:bg-red-600"
              >
                Delete {route.title}
              </button>
            ))}

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