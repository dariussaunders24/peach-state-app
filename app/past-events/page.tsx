"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import PastEventCard from "../components/PastEventCard";

const adminEmails = ["dariussaunders24@gmail.com"];

export default function PastEventsPage() {
  const [pastEvents, setPastEvents] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [canManageAttendance, setCanManageAttendance] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any | null>(null);

  const [editForm, setEditForm] = useState({
    title: "",
    public_location: "",
    private_location: "",
    private_details: "",
    route_link: "",
    event_date: "",
    capacity: "",
    difficulty: "",
  });

 useEffect(() => {
  checkUserPermissions();
  loadPastEvents();
}, []);

  async function checkUserPermissions() {
  const { data } = await supabase.auth.getUser();

  if (!data.user) return;

  const userIsAdmin = adminEmails.includes(
    (data.user.email || "").toLowerCase().trim()
  );

  setIsAdmin(userIsAdmin);

  const { data: profile } = await supabase
    .from("profiles")
    .select("public_role")
    .eq("user_id", data.user.id)
    .maybeSingle();

  const userIsRideCaptain = profile?.public_role === "Ride Captain";

  setCanManageAttendance(userIsAdmin || userIsRideCaptain);
}

  async function loadPastEvents() {
const cutoff = new Date();
cutoff.setHours(cutoff.getHours() - 24);

const { data: eventsData, error } = await supabase
  .from("events")
  .select("*")
  .lt("event_date", cutoff.toISOString())
  .order("event_date", { ascending: false });

  if (error) {
    console.error("Error loading past events:", error);
    return;
  }

  const eventsWithRsvps = await Promise.all(
    (eventsData || []).map(async (event) => {
      const { data: rsvpData } = await supabase
        .from("rsvps")
        .select("id, user_id, event_id, status, created_at, checked_in")
        .eq("event_id", event.id)
        .order("created_at", { ascending: true });

      const userIds = (rsvpData || []).map((rsvp) => rsvp.user_id);

      let profiles: any[] = [];

      if (userIds.length > 0) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("user_id, name, image_url")
          .in("user_id", userIds);

        profiles = profileData || [];
      }

      const attendees = (rsvpData || []).map((rsvp) => {
        const profile = profiles.find(
          (profile) => profile.user_id === rsvp.user_id
        );

        return {
          ...rsvp,
          checked_in: rsvp.checked_in ?? false,
          profiles: profile || null,
        };
      });

      return {
        ...event,
        attendees,
      };
    })
  );

  setPastEvents(eventsWithRsvps);
}

  function formatDateForInput(dateString: string) {
    if (!dateString) return "";

    const date = new Date(dateString);
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60000);

    return localDate.toISOString().slice(0, 16);
  }

  function openEditEvent(event: any) {
    setEditingEvent(event);

    setEditForm({
      title: event.title || "",
      public_location: event.public_location || "",
      private_location: event.private_location || "",
      private_details: event.private_details || "",
      route_link: event.route_link || "",
      event_date: formatDateForInput(event.event_date),
      capacity: event.capacity?.toString() || "",
      difficulty: event.difficulty || "",
    });
  }

  async function saveEditedEvent() {
    if (!editingEvent) return;

    const { error } = await supabase
      .from("events")
      .update({
        title: editForm.title,
        public_location: editForm.public_location,
        private_location: editForm.private_location,
        private_details: editForm.private_details,
        route_link: editForm.route_link,
        event_date: editForm.event_date,
        capacity: editForm.capacity ? Number(editForm.capacity) : null,
        difficulty: editForm.difficulty,
      })
      .eq("id", editingEvent.id);

    if (error) {
      alert(error.message);
      return;
    }

    setEditingEvent(null);
    await loadPastEvents();
  }

  async function deleteEvent(eventId: string) {
    if (!confirm("Delete this event?")) return;

    const { error } = await supabase.from("events").delete().eq("id", eventId);

    if (error) {
      alert(error.message);
      return;
    }

    await loadPastEvents();
  }

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-[#F28C52]/30 bg-black/40 p-6">
        <h1 className="text-3xl font-bold text-[#F28C52]">Past Events</h1>

        <p className="mt-3 max-w-3xl text-gray-300">
          Previous Peach State Off-Road and Overlanding rides, campouts, meetups,
          and route archives.
        </p>
      </section>

      <section className="space-y-4">
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
    canManageAttendance={canManageAttendance}
    updateEvent={openEditEvent}
    deleteEvent={deleteEvent}
    reloadEvents={loadPastEvents}
  />
))
        )}
      </section>

      {editingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#F28C52]/30 bg-[#100B08] p-6">
            <h2 className="text-2xl font-bold text-[#F28C52]">Edit Event</h2>

            <div className="mt-5 space-y-4">
              <input
                type="text"
                placeholder="Event Title"
                value={editForm.title}
                onChange={(e) =>
                  setEditForm({ ...editForm, title: e.target.value })
                }
                className="w-full rounded-lg border border-white/20 bg-black px-4 py-3 text-white"
              />

              <input
                type="text"
                placeholder="Public Location"
                value={editForm.public_location}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    public_location: e.target.value,
                  })
                }
                className="w-full rounded-lg border border-white/20 bg-black px-4 py-3 text-white"
              />

              <input
                type="text"
                placeholder="Private Location"
                value={editForm.private_location}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    private_location: e.target.value,
                  })
                }
                className="w-full rounded-lg border border-white/20 bg-black px-4 py-3 text-white"
              />

              <textarea
                placeholder="Private Details"
                value={editForm.private_details}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    private_details: e.target.value,
                  })
                }
                className="min-h-28 w-full rounded-lg border border-white/20 bg-black px-4 py-3 text-white"
              />

              <input
                type="text"
                placeholder="OnX / Route Link"
                value={editForm.route_link}
                onChange={(e) =>
                  setEditForm({ ...editForm, route_link: e.target.value })
                }
                className="w-full rounded-lg border border-white/20 bg-black px-4 py-3 text-white"
              />

              <input
                type="datetime-local"
                value={editForm.event_date}
                onChange={(e) =>
                  setEditForm({ ...editForm, event_date: e.target.value })
                }
                className="w-full rounded-lg border border-white/20 bg-black px-4 py-3 text-white"
              />

              <input
                type="number"
                placeholder="Capacity"
                value={editForm.capacity}
                onChange={(e) =>
                  setEditForm({ ...editForm, capacity: e.target.value })
                }
                className="w-full rounded-lg border border-white/20 bg-black px-4 py-3 text-white"
              />

              <input
                type="text"
                placeholder="Difficulty"
                value={editForm.difficulty}
                onChange={(e) =>
                  setEditForm({ ...editForm, difficulty: e.target.value })
                }
                className="w-full rounded-lg border border-white/20 bg-black px-4 py-3 text-white"
              />
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
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
      )}
    </div>
  );
}