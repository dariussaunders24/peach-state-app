"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import CanIRunThis from "../components/CanIRunThis";
import DownloadGalleryButton from "../components/DownloadGalleryButton";
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

const terrainOptions = [
  "Gravel",
  "Ruts",
  "Rocks",
  "Technical",
  "Mud / Clay",
  "Sand",
  "Water Crossings",
];

const defaultDisclaimer =
  "By RSVP’ing to this event, you accept any and all risk for vehicle damage, personal injury, recovery needs, or liability. Peach State Off-Road and Overlanding and its organizers are not liable. No-shows without canceling your RSVP at least 24 hours before the event will result in a (1) ride ban. This is so we can ensure maximum enjoyment and available spots for all members who want to attend.";

const defaultTrailFields = {
  trail_difficulty: "moderate",
  min_tire_diameter: "31",
  recommended_lift_level: "1",
  stock_friendly: false,
  skid_plates_requirement: "recommended",
  rock_sliders_requirement: "not_needed",
  recovery_points_required: true,
  recovery_gear_required: true,
  winch_requirement: "recommended",
  traction_requirement: "factory_ok",
  water_crossings: "moderate",
  pinstriping_risk: "medium",
  trail_terrain: ["Ruts", "Mud / Clay", "Water Crossings"] as string[],
};

function formatDateForInput(dateValue: string) {
  if (!dateValue) return "";

  const date = new Date(dateValue);
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60000);

  return localDate.toISOString().slice(0, 16);
}

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
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
    ...defaultTrailFields,
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
    ...defaultTrailFields,
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

  function toggleTrailTerrain(item: string) {
    setNewEvent((prev) => {
      const exists = prev.trail_terrain.includes(item);

      return {
        ...prev,
        trail_terrain: exists
          ? prev.trail_terrain.filter((i) => i !== item)
          : [...prev.trail_terrain, item],
      };
    });
  }

  function toggleEditTrailTerrain(item: string) {
    setEditForm((prev) => {
      const exists = prev.trail_terrain.includes(item);

      return {
        ...prev,
        trail_terrain: exists
          ? prev.trail_terrain.filter((i) => i !== item)
          : [...prev.trail_terrain, item],
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
      trail_difficulty: event.trail_difficulty || "moderate",
      min_tire_diameter: event.min_tire_diameter
        ? String(event.min_tire_diameter)
        : "31",
      recommended_lift_level:
        event.recommended_lift_level !== null &&
        event.recommended_lift_level !== undefined
          ? String(event.recommended_lift_level)
          : "1",
      stock_friendly: event.stock_friendly || false,
      skid_plates_requirement: event.skid_plates_requirement || "recommended",
      rock_sliders_requirement: event.rock_sliders_requirement || "not_needed",
      recovery_points_required: event.recovery_points_required ?? true,
      recovery_gear_required: event.recovery_gear_required ?? true,
      winch_requirement: event.winch_requirement || "recommended",
      traction_requirement: event.traction_requirement || "factory_ok",
      water_crossings: event.water_crossings || "moderate",
      pinstriping_risk: event.pinstriping_risk || "medium",
      trail_terrain: event.trail_terrain || [
        "Ruts",
        "Mud / Clay",
        "Water Crossings",
      ],
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
        trail_difficulty: editForm.trail_difficulty,
        min_tire_diameter: Number(editForm.min_tire_diameter),
        recommended_lift_level: Number(editForm.recommended_lift_level),
        stock_friendly: editForm.stock_friendly,
        skid_plates_requirement: editForm.skid_plates_requirement,
        rock_sliders_requirement: editForm.rock_sliders_requirement,
        recovery_points_required: editForm.recovery_points_required,
        recovery_gear_required: editForm.recovery_gear_required,
        winch_requirement: editForm.winch_requirement,
        traction_requirement: editForm.traction_requirement,
        water_crossings: editForm.water_crossings,
        pinstriping_risk: editForm.pinstriping_risk,
        trail_terrain: editForm.trail_terrain,
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
      trail_difficulty: newEvent.trail_difficulty,
      min_tire_diameter: Number(newEvent.min_tire_diameter),
      recommended_lift_level: Number(newEvent.recommended_lift_level),
      stock_friendly: newEvent.stock_friendly,
      skid_plates_requirement: newEvent.skid_plates_requirement,
      rock_sliders_requirement: newEvent.rock_sliders_requirement,
      recovery_points_required: newEvent.recovery_points_required,
      recovery_gear_required: newEvent.recovery_gear_required,
      winch_requirement: newEvent.winch_requirement,
      traction_requirement: newEvent.traction_requirement,
      water_crossings: newEvent.water_crossings,
      pinstriping_risk: newEvent.pinstriping_risk,
      trail_terrain: newEvent.trail_terrain,
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
      ...defaultTrailFields,
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

    
    async function attachCounts(eventsList: any[]) {
      return Promise.all(
        (eventsList || []).map(async (event) => {
          const { data: rsvpData, error: rsvpError } = await supabase
            .from("rsvps")
            .select("id, user_id, event_id, status, created_at, checked_in")
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
    

    setEvents(upcomingWithRoutes);
    
  }

  async function promoteRsvpToGoing(rsvp: any, event: any) {
    const { error: promoteError } = await supabase
      .from("rsvps")
      .update({ status: "going" })
      .eq("id", rsvp.id);

    if (promoteError) {
      alert(promoteError.message);
      return false;
    }

    const { error: notificationError } = await supabase
      .from("notifications")
      .insert({
        user_id: rsvp.user_id,
        title: "You're In!",
        message: `A spot opened up for ${event.title}. You've been moved from the waitlist to Going.`,
      });

    if (notificationError) {
      alert(notificationError.message);
      return false;
    }

    return true;
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
      const promotedUser = nextWaitlist[0];

      const { error: promoteError } = await supabase
        .from("rsvps")
        .update({ status: "going" })
        .eq("id", promotedUser.id);

      if (promoteError) {
        alert(promoteError.message);
        return;
      }

  const { error: notificationError } = await supabase
  .from("notifications")
  .insert({
    user_id: promotedUser.user_id,
    title: "You're In!",
    message: `A spot opened up for ${event.title}. You've been moved from the waitlist to Going.`,
  });

if (notificationError) {
  alert(notificationError.message);
  return;
}
    }
  }

  await loadEvents();
  showConfirmation("Your RSVP has been canceled.");
}

async function adminUpdateRsvpStatus(
  rsvpId: string,
  status: "going" | "waitlist",
  userId: string,
  event: any
) {
  if (status === "going") {
    const promoted = await promoteRsvpToGoing(
      { id: rsvpId, user_id: userId },
      event
    );

    if (!promoted) return;
  } else {
    const { error } = await supabase
      .from("rsvps")
      .update({ status })
      .eq("id", rsvpId);

    if (error) return alert(error.message);
  }

  await loadEvents();
}

async function adminRemoveRsvp(
  rsvpId: string,
  event: any,
  currentStatus: string
) {
  if (!confirm("Remove this member from the RSVP list?")) return;

  const { error } = await supabase
    .from("rsvps")
    .delete()
    .eq("id", rsvpId);

  if (error) return alert(error.message);

  if (currentStatus === "going") {
    const { data: nextWaitlist } = await supabase
      .from("rsvps")
      .select("*")
      .eq("event_id", event.id)
      .eq("status", "waitlist")
      .order("created_at", { ascending: true })
      .limit(1);

    if (nextWaitlist && nextWaitlist.length > 0) {
      const promoted = await promoteRsvpToGoing(
        nextWaitlist[0],
        event
      );

      if (!promoted) return;
    }
  }


  await loadEvents();
}
async function copyEventEmails(
  eventId: string,
  status: "going" | "waitlist" | "all"
) {
  const { data } = await supabase.auth.getSession();

  const token = data.session?.access_token;

  if (!token) {
    alert("You must be logged in.");
    return;
  }

  const response = await fetch("/api/admin/event-emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      eventId,
      status,
    }),
  });

  const result = await response.json();

 if (!response.ok) {
  alert(JSON.stringify(result, null, 2));
  return;
}

  await navigator.clipboard.writeText(result.emailText);

  alert(`Copied ${result.count} email(s).`);
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
          <div className="h-fit rounded-2xl border border-white/10 bg-neutral-900 p-4">
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
                placeholder="Difficulty Label, example: Easy / Moderate"
                value={editForm.difficulty}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    difficulty: e.target.value,
                  }))
                }
                className="w-full rounded-lg border border-white/20 bg-white px-3 py-2 text-black placeholder-gray-500"
              />

<label className="text-sm font-semibold text-white">
  Date / Time
</label>

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

              <TrailRequirementsFields
                form={editForm}
                setForm={setEditForm}
                toggleTerrain={toggleEditTrailTerrain}
              />

              <BringItemsBlock
                selectedItems={editForm.bring_items}
                toggleItem={toggleEditBringItem}
              />

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
            placeholder="Difficulty Label, example: Easy / Moderate"
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

          <TrailRequirementsFields
            form={newEvent}
            setForm={setNewEvent}
            toggleTerrain={toggleTrailTerrain}
          />

          <BringItemsBlock
            selectedItems={newEvent.bring_items}
            toggleItem={toggleBringItem}
          />

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
  <div className="grid gap-5 lg:grid-cols-2">
    {events.map((event) => (
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
        adminUpdateRsvpStatus={adminUpdateRsvpStatus}
        adminRemoveRsvp={adminRemoveRsvp}
        copyEventEmails={copyEventEmails}
        loadEvents={loadEvents}
      />
    ))}
  </div>
)}
      </section>

     
    </div>
  );
}

function TrailRequirementsFields({
  form,
  setForm,
  toggleTerrain,
}: {
  form: any;
  setForm: any;
  toggleTerrain: (item: string) => void;
}) {
  return (
    <div className="rounded-xl border border-[#F28C52]/30 bg-black/30 p-4">
      <h3 className="font-semibold text-[#F28C52]">Trail Requirements</h3>
      <p className="mt-1 text-sm text-gray-400">
        These settings power the Can I Run This trail checker.
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <SelectField
          label="Trail Difficulty"
          value={form.trail_difficulty}
          onChange={(value) =>
            setForm((prev: any) => ({ ...prev, trail_difficulty: value }))
          }
          options={[
            ["easy", "Easy"],
            ["moderate", "Moderate"],
            ["difficult", "Difficult"],
            ["advanced", "Advanced"],
          ]}
        />

        <SelectField
          label="Minimum Tire Diameter"
          value={form.min_tire_diameter}
          onChange={(value) =>
            setForm((prev: any) => ({ ...prev, min_tire_diameter: value }))
          }
          options={[
            ["29", '29" or smaller'],
            ["30", '30"'],
            ["31", '31"'],
            ["32", '32"'],
            ["33", '33"'],
            ["34", '34"'],
            ["35", '35"'],
            ["36", '36"'],
            ["37", '37"+'],
          ]}
        />

        <SelectField
          label="Recommended Lift"
          value={form.recommended_lift_level}
          onChange={(value) =>
            setForm((prev: any) => ({
              ...prev,
              recommended_lift_level: value,
            }))
          }
          options={[
            ["0", "Stock"],
            ["1", "1 to 2 in"],
            ["2", "2 to 3 in"],
            ["3", "3 in+"],
          ]}
        />

        <SelectField
          label="Skid Plates"
          value={form.skid_plates_requirement}
          onChange={(value) =>
            setForm((prev: any) => ({
              ...prev,
              skid_plates_requirement: value,
            }))
          }
          options={[
            ["not_needed", "Not needed"],
            ["recommended", "Recommended"],
            ["required", "Required"],
          ]}
        />

        <SelectField
          label="Rock Sliders"
          value={form.rock_sliders_requirement}
          onChange={(value) =>
            setForm((prev: any) => ({
              ...prev,
              rock_sliders_requirement: value,
            }))
          }
          options={[
            ["not_needed", "Not needed"],
            ["recommended", "Recommended"],
            ["required", "Required"],
          ]}
        />

        <SelectField
          label="Winch"
          value={form.winch_requirement}
          onChange={(value) =>
            setForm((prev: any) => ({ ...prev, winch_requirement: value }))
          }
          options={[
            ["not_needed", "Not needed"],
            ["recommended", "Recommended"],
            ["required", "Required"],
          ]}
        />

        <SelectField
          label="Traction / Lockers"
          value={form.traction_requirement}
          onChange={(value) =>
            setForm((prev: any) => ({
              ...prev,
              traction_requirement: value,
            }))
          }
          options={[
            ["not_needed", "Not needed"],
            ["factory_ok", "Factory traction okay"],
            ["locker_recommended", "Locker recommended"],
            ["locker_required", "Locker required"],
          ]}
        />

        <SelectField
          label="Water Crossings"
          value={form.water_crossings}
          onChange={(value) =>
            setForm((prev: any) => ({ ...prev, water_crossings: value }))
          }
          options={[
            ["none", "None"],
            ["light", "Light"],
            ["moderate", "Moderate"],
            ["deep", "Deep"],
          ]}
        />

        <SelectField
          label="Pinstriping Risk"
          value={form.pinstriping_risk}
          onChange={(value) =>
            setForm((prev: any) => ({ ...prev, pinstriping_risk: value }))
          }
          options={[
            ["low", "Low"],
            ["medium", "Medium"],
            ["high", "High"],
          ]}
        />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <BooleanButton
          label="Stock Friendly"
          value={form.stock_friendly}
          onChange={(value) =>
            setForm((prev: any) => ({ ...prev, stock_friendly: value }))
          }
        />

        <BooleanButton
          label="Recovery Points Required"
          value={form.recovery_points_required}
          onChange={(value) =>
            setForm((prev: any) => ({
              ...prev,
              recovery_points_required: value,
            }))
          }
        />

        <BooleanButton
          label="Recovery Gear Required"
          value={form.recovery_gear_required}
          onChange={(value) =>
            setForm((prev: any) => ({
              ...prev,
              recovery_gear_required: value,
            }))
          }
        />
      </div>

      <div className="mt-4">
        <p className="font-semibold text-white">Trail Conditions</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {terrainOptions.map((item) => {
            const selected = form.trail_terrain.includes(item);

            return (
              <button
                key={item}
                type="button"
                onClick={() => toggleTerrain(item)}
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
    </div>
  );
}

function BringItemsBlock({
  selectedItems,
  toggleItem,
}: {
  selectedItems: string[];
  toggleItem: (item: string) => void;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/30 p-4">
      <h3 className="font-semibold text-white">What to Bring</h3>
      <p className="mt-1 text-sm text-gray-400">
        Tap items to include them on this event.
      </p>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {bringOptions.map((item) => {
          const selected = selectedItems.includes(item);

          return (
            <button
              key={item}
              type="button"
              onClick={() => toggleItem(item)}
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
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[][];
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-white">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-lg border border-white/20 bg-white px-3 py-2 text-black"
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}

function BooleanButton({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/30 p-3">
      <p className="text-sm font-semibold text-white">{label}</p>
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold ${
            value
              ? "bg-[#F28C52] text-black"
              : "bg-white/10 text-white hover:bg-white/20"
          }`}
        >
          Yes
        </button>

        <button
          type="button"
          onClick={() => onChange(false)}
          className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold ${
            !value
              ? "bg-[#F28C52] text-black"
              : "bg-white/10 text-white hover:bg-white/20"
          }`}
        >
          No
        </button>
      </div>
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
  const legacyRouteLink = event.route_link || "";

  if (routes.length === 0 && !legacyRouteLink) {
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

      {legacyRouteLink && (
        <div className="mt-4 rounded-lg border border-white/10 bg-black/20 p-3">
          <p className="font-semibold text-white">Event Route</p>

          <div className="mt-3">
            <a
              href={legacyRouteLink}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-[#F28C52] px-3 py-2 text-sm font-semibold text-[#F28C52] hover:bg-[#F28C52] hover:text-black"
            >
              Open Route Link
            </a>
          </div>
        </div>
      )}

      {routes.length > 0 && (
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
      )}
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
  adminUpdateRsvpStatus,
  adminRemoveRsvp,
  copyEventEmails,
  loadEvents,
}: any) {
  const [userStatus, setUserStatus] = useState("");
  const [showDetails, setShowDetails] = useState(false);
const [comments, setComments] = useState<any[]>([]);
const [newComment, setNewComment] = useState("");
const [replyingTo, setReplyingTo] = useState("");
const [replyText, setReplyText] = useState("");
const [editingCommentId, setEditingCommentId] = useState("");
const [editText, setEditText] = useState("");

useEffect(() => {
  loadComments();
}, []);

async function loadComments() {
  const { data, error } = await supabase
    .from("event_comments")
    .select("*")
    .eq("event_id", event.id)
    .order("created_at", { ascending: true });

  if (error) {
    console.error(error.message);
    return;
  }

  const commentsWithNames = await Promise.all(
    (data || []).map(async (comment) => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("name")
        .eq("user_id", comment.user_id)
        .maybeSingle();

      return {
        ...comment,
        name: profile?.name || "Member",
      };
    })
  );

  setComments(commentsWithNames);
}

async function addComment(parentId: string | null = null) {
  const text = parentId ? replyText.trim() : newComment.trim();

  if (!text || !currentUserId) return;

  const { data: insertedComment, error } = await supabase
    .from("event_comments")
    .insert({
      event_id: event.id,
      user_id: currentUserId,
      parent_id: parentId,
      comment: text,
    })
    .select("id")
    .single();

  if (error) {
    alert(error.message);
    return;
  }

  if (insertedComment?.id) {
    fetch("/api/event-comment-notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        eventId: event.id,
        commentId: insertedComment.id,
      }),
    });
  }

  setNewComment("");
  setReplyText("");
  setReplyingTo("");

  await loadComments();
}

async function updateComment(commentId: string) {
  if (!editText.trim()) return;

  const { error } = await supabase
    .from("event_comments")
    .update({
      comment: editText.trim(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", commentId);

  if (error) {
    alert(error.message);
    return;
  }

  setEditingCommentId("");
  setEditText("");

  await loadComments();
}

async function deleteComment(commentId: string) {
  if (!confirm("Delete this comment?")) return;

  const { error } = await supabase
    .from("event_comments")
    .delete()
    .eq("id", commentId);

  if (error) {
    alert(error.message);
    return;
  }

  await loadComments();
}
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
  <div className="flex justify-center border-b border-[#F28C52]/20 bg-black/40 p-3 sm:p-4">
    <img
      src={event.cover_photo_url}
      alt={event.title}
      className="max-h-[105vh] w-full max-w-lg rounded-xl object-contain"
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

      {showDetails && bringItems.length > 0 && (
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

        {showDetails && (
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
                  Exact meetup location, Route Hub links, and event instructions
                  are visible after RSVP to help manage space, safety, and group
                  size.
                </p>
              </div>
            </div>
          )}
        </div>
        )}

      {showDetails && (
  <div className="mt-4 rounded-lg border border-white/10 bg-black/30 p-4">
    <h4 className="font-semibold text-white">Attendees</h4>

  {goingAttendees.length === 0 && waitlistAttendees.length === 0 ? (
    <p className="mt-2 text-sm text-gray-400">No RSVPs yet.</p>
  ) : (
    <div className="mt-3 space-y-4">
      {goingAttendees.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-green-300">Going</p>

          <div className="mt-2 flex flex-col gap-2">
            {goingAttendees.map((attendee: any) => (
              <div
                key={`${event.id}-${attendee.user_id}`}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-green-400/20 bg-green-500/10 px-3 py-2"
              >
                <a
                  href={`/members/${attendee.user_id}`}
                  className="text-sm text-green-200 hover:text-green-100"
                >
                  {attendee.profiles?.name || "Member"}
                </a>

                {isAdmin && (
                  <div className="flex flex-wrap gap-2">
                    <label className="flex items-center gap-2 rounded border border-[#F28C52]/40 px-2 py-1 text-xs text-[#F28C52]">
  <input
    type="checkbox"
    checked={attendee.checked_in ?? false}
    onChange={async () => {
      const { error } = await supabase
        .from("rsvps")
        .update({ checked_in: !(attendee.checked_in ?? false) })
        .eq("id", attendee.id);

      if (error) {
        alert(error.message);
        return;
      }

      await loadEvents();
    }}
    className="h-4 w-4 accent-[#F28C52]"
  />
  Attended
</label>
                    <button
                     onClick={() =>
  adminUpdateRsvpStatus(
    attendee.id,
    "waitlist",
    attendee.user_id,
    event
  )
}

                      className="rounded border border-yellow-300/40 px-2 py-1 text-xs text-yellow-200"
                    >
                      
                      Move to Waitlist
                    </button>

                    <button
                      onClick={() => adminRemoveRsvp(attendee.id, event, attendee.status)}
                      className="rounded border border-red-400/40 px-2 py-1 text-xs text-red-300"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {waitlistAttendees.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-yellow-300">
            Waitlist
          </p>

          <div className="mt-2 flex flex-col gap-2">
            {waitlistAttendees.map((attendee: any) => (
              <div
                key={`${event.id}-${attendee.user_id}`}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-yellow-300/20 bg-yellow-300/10 px-3 py-2"
              >
                <a
                  href={`/members/${attendee.user_id}`}
                  className="text-sm text-yellow-200 hover:text-yellow-100"
                >
                  {attendee.profiles?.name || "Member"}
                </a>

                {isAdmin && (
                  <div className="flex flex-wrap gap-2">
                    <button
                     onClick={() =>
  adminUpdateRsvpStatus(
    attendee.id,
    "going",
    attendee.user_id,
    event
  )
}
                      className="rounded border border-green-400/40 px-2 py-1 text-xs text-green-300"
                    >
                      Move to Going
                    </button>

                    <button
                      onClick={() => adminRemoveRsvp(attendee.id, event, attendee.status)}
                      className="rounded border border-red-400/40 px-2 py-1 text-xs text-red-300"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )}
</div>
)}
<button
  onClick={() => setShowDetails((prev) => !prev)}
  className="mt-4 w-full rounded-xl border-2 border-[#F28C52]/70 bg-[#F28C52]/10 px-4 py-3 text-sm font-bold uppercase tracking-wide text-[#F28C52] transition hover:bg-[#F28C52] hover:text-black"
>
  {showDetails ? "Hide Event Details" : "View Event Details"}
</button>

        <div className="mt-4 flex flex-col gap-3">
      <CanIRunThis
  eventTitle={event.title}
  requirements={{
    difficulty: event.trail_difficulty || "moderate",
    minTireDiameter: event.min_tire_diameter || 31,
    recommendedLiftLevel: event.recommended_lift_level ?? 1,
    stockFriendly: event.stock_friendly || false,
    skidPlates: event.skid_plates_requirement || "recommended",
    rockSliders: event.rock_sliders_requirement || "not_needed",
    recoveryPointsRequired: event.recovery_points_required ?? true,
    recoveryGearRequired: event.recovery_gear_required ?? true,
    winch: event.winch_requirement || "recommended",
    traction: event.traction_requirement || "factory_ok",
    waterCrossings: event.water_crossings || "moderate",
    pinstripingRisk: event.pinstriping_risk || "medium",
    terrain: event.trail_terrain || ["Ruts", "Mud / Clay", "Water Crossings"],
  }}
/>


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
  <div className="flex flex-wrap gap-2">
    
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

    <button
      onClick={() => copyEventEmails(event.id, "going")}
      className="rounded bg-blue-500 px-3 py-1 text-white"
    >
      Copy Going Emails
    </button>

    <button
      onClick={() => copyEventEmails(event.id, "waitlist")}
      className="rounded bg-purple-500 px-3 py-1 text-white"
    >
      Copy Waitlist Emails
    </button>

    <button
      onClick={() => copyEventEmails(event.id, "all")}
      className="rounded bg-[#F28C52] px-3 py-1 text-black"
    >
      Copy All Emails
    </button>
  </div>
)}
<EventDiscussion
  comments={comments}
  currentUserId={currentUserId}
  isAdmin={isAdmin}
  newComment={newComment}
  setNewComment={setNewComment}
  addComment={addComment}
  replyingTo={replyingTo}
  setReplyingTo={setReplyingTo}
  replyText={replyText}
  setReplyText={setReplyText}
  editingCommentId={editingCommentId}
  setEditingCommentId={setEditingCommentId}
  editText={editText}
  setEditText={setEditText}
  updateComment={updateComment}
  deleteComment={deleteComment}
  />
        </div>
      </div>
    </div>
  );
}
function EventDiscussion({
  comments,
  currentUserId,
  isAdmin,
  newComment,
  setNewComment,
  addComment,
  replyingTo,
  setReplyingTo,
  replyText,
  setReplyText,
  editingCommentId,
  setEditingCommentId,
  editText,
  setEditText,
  updateComment,
  deleteComment,
}: any) {
  const [expandedThreads, setExpandedThreads] = useState<string[]>([]);

  const topLevelComments = comments.filter(
    (comment: any) => !comment.parent_id
  );

  function isThreadExpanded(commentId: string) {
    return expandedThreads.includes(commentId);
  }

  function toggleThread(commentId: string) {
    setExpandedThreads((prev) =>
      prev.includes(commentId)
        ? prev.filter((id) => id !== commentId)
        : [...prev, commentId]
    );
  }

  function formatCommentDate(dateValue: string) {
    return new Date(dateValue).toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  function getAllThreadReplies(parentId: string): any[] {
    const directReplies = comments.filter(
      (reply: any) => reply.parent_id === parentId
    );

    return directReplies.flatMap((reply: any) => [
      reply,
      ...getAllThreadReplies(reply.id),
    ]);
  }

  function renderComment(comment: any, depth = 0) {
    const replies = comments.filter(
      (reply: any) => reply.parent_id === comment.id
    );

    const canManage = comment.user_id === currentUserId || isAdmin;

    return (
      <div
        key={comment.id}
        className={`rounded-xl border ${
          depth === 0
            ? "border-[#F28C52]/25 bg-black/45 p-4 shadow-lg shadow-black/20"
            : "border-white/10 bg-white/[0.04] p-3"
        }`}
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="font-semibold text-white">{comment.name}</p>

          <p className="text-xs text-gray-500">
            {formatCommentDate(comment.created_at)}
            {comment.updated_at !== comment.created_at ? " • Edited" : ""}
          </p>
        </div>

        {editingCommentId === comment.id ? (
          <div className="mt-3">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="min-h-[90px] w-full rounded-xl border border-white/10 bg-black/50 p-3 text-white outline-none focus:border-[#F28C52]"
            />

            <div className="mt-2 flex flex-wrap gap-2">
              <button
                onClick={() => updateComment(comment.id)}
                className="rounded-lg bg-[#F28C52] px-3 py-2 text-sm font-semibold text-black hover:bg-[#C96A2C]"
              >
                Save
              </button>

              <button
                onClick={() => {
                  setEditingCommentId("");
                  setEditText("");
                }}
                className="rounded-lg border border-white/15 px-3 py-2 text-sm font-semibold text-white/80 hover:border-[#F28C52] hover:text-[#F28C52]"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-gray-300">
            {comment.comment}
          </p>
        )}

        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          {currentUserId && (
            <button
              onClick={() => {
                setReplyingTo(comment.id);
                setReplyText("");
              }}
              className="rounded-full border border-[#F28C52]/30 px-3 py-1 text-xs font-bold text-[#F28C52] hover:bg-[#F28C52] hover:text-black"
            >
              Reply
            </button>
          )}

          {canManage && (
            <>
              <button
                onClick={() => {
                  setEditingCommentId(comment.id);
                  setEditText(comment.comment);
                }}
                className="rounded-full border border-white/15 px-3 py-1 text-xs font-bold text-white/60 hover:border-white/40 hover:text-white"
              >
                Edit
              </button>

              <button
                onClick={() => deleteComment(comment.id)}
                className="rounded-full border border-red-400/25 px-3 py-1 text-xs font-bold text-red-300 hover:bg-red-500/10"
              >
                Delete
              </button>
            </>
          )}
        </div>

        {replyingTo === comment.id && (
          <div className="mt-4 rounded-xl border border-[#F28C52]/20 bg-black/35 p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#F28C52]/80">
              Replying to {comment.name}
            </p>

            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write a reply..."
              className="min-h-[75px] w-full rounded-lg border border-white/10 bg-black/45 p-3 text-white outline-none focus:border-[#F28C52]"
            />

            <div className="mt-2 flex flex-wrap gap-2">
              <button
                onClick={() => addComment(comment.id)}
                className="rounded-lg bg-[#F28C52] px-3 py-2 text-sm font-semibold text-black hover:bg-[#C96A2C]"
              >
                Post Reply
              </button>

              <button
                onClick={() => {
                  setReplyingTo("");
                  setReplyText("");
                }}
                className="rounded-lg border border-white/15 px-3 py-2 text-sm font-semibold text-white/80 hover:border-[#F28C52] hover:text-[#F28C52]"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

     {depth > 0 && replies.length > 0 && (
  <div className="mt-4 space-y-3">
    {replies.map((reply: any) =>
      renderComment(reply, 1)
    )}
  </div>
)}
      </div>
    );
  }

  function renderTopLevelComment(comment: any) {
    const allReplies = getAllThreadReplies(comment.id);
    const expanded = isThreadExpanded(comment.id);
    const visibleReplyIds = expanded
      ? allReplies.map((reply: any) => reply.id)
      : allReplies.slice(0, 2).map((reply: any) => reply.id);

    function renderCommentWithCollapse(commentToRender: any, depth = 0) {
      const replies = comments.filter(
        (reply: any) => reply.parent_id === commentToRender.id
      );

      const filteredReplies =
        depth === 0
          ? replies.filter((reply: any) => visibleReplyIds.includes(reply.id))
          : replies.filter((reply: any) => visibleReplyIds.includes(reply.id));

      const originalComments = comments;
      const scopedComments = [
        ...comments.filter((c: any) => c.id !== commentToRender.id),
      ];

      return (
        <div key={commentToRender.id}>
          {renderComment({
            ...commentToRender,
          }, depth)}

          {filteredReplies.length > 0 && false && (
            <div>{scopedComments.length}</div>
          )}
        </div>
      );
    }

    const directReplies = comments.filter(
      (reply: any) => reply.parent_id === comment.id
    );

    const repliesToShow = expanded ? directReplies : [];
const hiddenReplyCount = allReplies.length;

    return (
      <div key={comment.id}>
        <div
          className={`rounded-xl border border-[#F28C52]/25 bg-black/45 p-4 shadow-lg shadow-black/20`}
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="font-semibold text-white">{comment.name}</p>

            <p className="text-xs text-gray-500">
              {formatCommentDate(comment.created_at)}
              {comment.updated_at !== comment.created_at ? " • Edited" : ""}
            </p>
          </div>

          {editingCommentId === comment.id ? (
            <div className="mt-3">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="min-h-[90px] w-full rounded-xl border border-white/10 bg-black/50 p-3 text-white outline-none focus:border-[#F28C52]"
              />

              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  onClick={() => updateComment(comment.id)}
                  className="rounded-lg bg-[#F28C52] px-3 py-2 text-sm font-semibold text-black hover:bg-[#C96A2C]"
                >
                  Save
                </button>

                <button
                  onClick={() => {
                    setEditingCommentId("");
                    setEditText("");
                  }}
                  className="rounded-lg border border-white/15 px-3 py-2 text-sm font-semibold text-white/80 hover:border-[#F28C52] hover:text-[#F28C52]"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-gray-300">
              {comment.comment}
            </p>
          )}

          <div className="mt-3 flex flex-wrap gap-2 text-sm">
            {currentUserId && (
              <button
                onClick={() => {
                  setReplyingTo(comment.id);
                  setReplyText("");
                }}
                className="rounded-full border border-[#F28C52]/30 px-3 py-1 text-xs font-bold text-[#F28C52] hover:bg-[#F28C52] hover:text-black"
              >
                Reply
              </button>
            )}

            {(comment.user_id === currentUserId || isAdmin) && (
              <>
                <button
                  onClick={() => {
                    setEditingCommentId(comment.id);
                    setEditText(comment.comment);
                  }}
                  className="rounded-full border border-white/15 px-3 py-1 text-xs font-bold text-white/60 hover:border-white/40 hover:text-white"
                >
                  Edit
                </button>

                <button
                  onClick={() => deleteComment(comment.id)}
                  className="rounded-full border border-red-400/25 px-3 py-1 text-xs font-bold text-red-300 hover:bg-red-500/10"
                >
                  Delete
                </button>
              </>
            )}
          </div>

          {replyingTo === comment.id && (
            <div className="mt-4 rounded-xl border border-[#F28C52]/20 bg-black/35 p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#F28C52]/80">
                Replying to {comment.name}
              </p>

              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                className="min-h-[75px] w-full rounded-lg border border-white/10 bg-black/45 p-3 text-white outline-none focus:border-[#F28C52]"
              />

              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  onClick={() => addComment(comment.id)}
                  className="rounded-lg bg-[#F28C52] px-3 py-2 text-sm font-semibold text-black hover:bg-[#C96A2C]"
                >
                  Post Reply
                </button>

                <button
                  onClick={() => {
                    setReplyingTo("");
                    setReplyText("");
                  }}
                  className="rounded-lg border border-white/15 px-3 py-2 text-sm font-semibold text-white/80 hover:border-[#F28C52] hover:text-[#F28C52]"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {directReplies.length > 0 && (
            <div className="mt-5 space-y-3 border-l border-[#F28C52]/35 pl-4">
              {repliesToShow.map((reply: any) => {
  const nestedReplies = getAllThreadReplies(reply.id);

  return (
    <div key={reply.id}>
      {renderComment(reply, 1)}

      {expanded &&
        nestedReplies.map((nestedReply: any) =>
          renderComment(nestedReply, 1)
        )}
    </div>
  );
})}

              {hiddenReplyCount > 0 && (
                <button
                  onClick={() => toggleThread(comment.id)}
                  className="rounded-full border border-white/15 px-3 py-1 text-xs font-bold text-white/70 hover:border-[#F28C52]/50 hover:text-[#F28C52]"
                >
                 {expanded
  ? "Hide replies"
  : `View ${hiddenReplyCount} ${
      hiddenReplyCount === 1 ? "reply" : "replies"
    }`}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-2xl border border-[#F28C52]/20 bg-black/35 p-4 shadow-xl shadow-black/20">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h4 className="text-lg font-bold text-[#F28C52]">
            Event Discussion
          </h4>

          <p className="mt-1 text-sm text-gray-400">
            Coordinate meetup details, ask questions, and discuss the ride.
          </p>
        </div>

        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-white/60">
          {comments.length} {comments.length === 1 ? "Comment" : "Comments"}
        </span>
      </div>

      <div className="mt-5 rounded-xl border border-white/10 bg-black/30 p-3">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className="min-h-[95px] w-full rounded-xl border border-white/10 bg-black/45 p-3 text-white outline-none placeholder:text-white/30 focus:border-[#F28C52]"
        />

        <button
          onClick={() => addComment(null)}
          className="mt-3 rounded-lg bg-[#F28C52] px-4 py-2 font-semibold text-black hover:bg-[#C96A2C]"
        >
          Post Comment
        </button>
      </div>

      <div className="mt-6 space-y-4">
        {topLevelComments.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-sm text-gray-400">
              No comments yet. Start the discussion.
            </p>
          </div>
        ) : (
          topLevelComments.map((comment: any) =>
            renderTopLevelComment(comment)
          )
        )}
      </div>
    </div>
  );
}