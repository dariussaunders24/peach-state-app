"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function EventDetailPage() {
  const params = useParams();
  const eventId = params.id as string;

  const [event, setEvent] = useState<any>(null);
  const [attendees, setAttendees] = useState<any[]>([]);
  const [waitlist, setWaitlist] = useState<any[]>([]);
  const [photos, setPhotos] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [userStatus, setUserStatus] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (eventId) {
      loadPage();
    }
  }, [eventId]);

  async function loadPage() {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id || "";
    setCurrentUserId(userId);

    const { data: eventData, error } = await supabase
      .from("events")
      .select("*")
      .eq("id", eventId)
      .single();

    if (error) {
      alert(error.message);
      return;
    }

    const { data: rsvps } = await supabase
      .from("rsvps")
      .select("user_id, status, created_at")
      .eq("event_id", eventId)
      .order("created_at", { ascending: true });

    const peopleWithNames = await Promise.all(
      (rsvps || []).map(async (rsvpItem) => {
        const { data: profile } = await supabase
          .from("profiles")
          .select("name")
          .eq("user_id", rsvpItem.user_id)
          .maybeSingle();

        return {
          user_id: rsvpItem.user_id,
          status: rsvpItem.status,
          name: profile?.name || "Member",
        };
      })
    );

    const going = peopleWithNames.filter((p) => p.status === "going");
    const waiting = peopleWithNames.filter((p) => p.status === "waitlist");

    setAttendees(going);
    setWaitlist(waiting);

    const me = peopleWithNames.find((p) => p.user_id === userId);
    setUserStatus(me?.status || "");

    setEvent({
      ...eventData,
      goingCount: going.length,
      waitlistCount: waiting.length,
    });

    const { data: photoData } = await supabase
      .from("event_photos")
      .select("*")
      .eq("event_id", eventId)
      .order("created_at", { ascending: false });

    setPhotos(photoData || []);
  }

  async function rsvp() {
    if (!event || !currentUserId) return;

    const status = event.goingCount >= event.capacity ? "waitlist" : "going";

    const { error } = await supabase.from("rsvps").insert({
      user_id: currentUserId,
      event_id: event.id,
      status,
    });

    if (error) {
      alert(error.message);
      return;
    }

    alert(
      status === "going"
        ? "RSVP confirmed."
        : "Event is full. You have been added to the waitlist."
    );

    await loadPage();
  }

  async function cancelRsvp() {
    if (!event || !currentUserId) return;

    const { data: existing } = await supabase
      .from("rsvps")
      .select("*")
      .eq("user_id", currentUserId)
      .eq("event_id", event.id)
      .limit(1);

    if (!existing || existing.length === 0) return;

    const currentRsvp = existing[0];

    const { error } = await supabase
      .from("rsvps")
      .delete()
      .eq("id", currentRsvp.id);

    if (error) {
      alert(error.message);
      return;
    }

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

    alert("Your RSVP has been canceled.");
    await loadPage();
  }

  async function uploadPhoto(e: any) {
    const file = e.target.files?.[0];

    if (!file || !currentUserId || !eventId) return;

    setUploading(true);

    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${fileExt}`;

    const filePath = `${eventId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("event-photos")
      .upload(filePath, file);

    if (uploadError) {
      alert(uploadError.message);
      setUploading(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("event-photos")
      .getPublicUrl(filePath);

    const { error: insertError } = await supabase.from("event_photos").insert({
      event_id: eventId,
      user_id: currentUserId,
      photo_url: publicUrlData.publicUrl,
      file_path: filePath,
    });

    if (insertError) {
      alert(insertError.message);
      setUploading(false);
      return;
    }

    setUploading(false);
    await loadPage();
  }

  async function deletePhoto(photo: any) {
    if (!confirm("Delete this photo?")) return;

    await supabase.storage.from("event-photos").remove([photo.file_path]);

    const { error } = await supabase
      .from("event_photos")
      .delete()
      .eq("id", photo.id);

    if (error) {
      alert(error.message);
      return;
    }

    await loadPage();
  }

  if (!event) {
    return <p className="text-gray-300">Loading event...</p>;
  }

  return (
    <div className="space-y-6">
      <a href="/events" className="text-sm text-[#F28C52] hover:underline">
        ← Back to Events
      </a>

      <div className="rounded-2xl border border-[#F28C52]/30 bg-black/40 p-6">
        <h1 className="text-4xl font-bold text-[#F28C52]">{event.title}</h1>

        <p className="mt-2 text-xl text-gray-200">{event.location}</p>

        {event.event_date && (
          <p className="mt-2 text-gray-400">
            {new Date(event.event_date).toLocaleString()}
          </p>
        )}

        {event.difficulty && (
          <p className="mt-4 text-sm font-semibold text-[#F28C52]">
            Difficulty: {event.difficulty}
          </p>
        )}

        {event.description && (
          <p className="mt-5 text-gray-300">{event.description}</p>
        )}

        {event.required_gear && (
          <div className="mt-5 rounded-xl border border-white/10 bg-black/30 p-4">
            <p className="font-semibold text-[#F28C52]">
              Required Gear / Notes
            </p>
            <p className="mt-2 text-gray-300">{event.required_gear}</p>
          </div>
        )}

        <div className="mt-6 rounded-xl border border-white/10 bg-black/30 p-4">
          <p className="text-gray-300">
            <span className="font-semibold text-white">
              {event.goingCount} / {event.capacity}
            </span>{" "}
            going
          </p>

          <p className="mt-1 text-sm text-yellow-300">
            Waitlist: {event.waitlistCount}
          </p>
        </div>

        {userStatus ? (
          <div className="mt-6">
            <p className="mb-3 text-gray-300">
              Your status:{" "}
              <span className="font-semibold text-[#F28C52]">
                {userStatus === "going" ? "Going" : "Waitlisted"}
              </span>
            </p>

            <button
              onClick={cancelRsvp}
              className="rounded-lg border border-red-400 px-4 py-2 font-semibold text-red-300 hover:bg-red-400 hover:text-black"
            >
              Cancel RSVP
            </button>
          </div>
        ) : (
          <button
            onClick={rsvp}
            className="mt-6 rounded-lg bg-[#F28C52] px-5 py-3 font-semibold text-black hover:bg-[#C96A2C]"
          >
            {event.goingCount >= event.capacity ? "Join Waitlist" : "RSVP"}
          </button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-black/30 p-4">
          <h2 className="text-xl font-bold text-[#F28C52]">Attendees</h2>

          {attendees.length === 0 ? (
            <p className="mt-2 text-gray-400">No one yet.</p>
          ) : (
            attendees.map((a, i) => (
              <p key={i} className="mt-2 text-gray-300">
                {a.name}
              </p>
            ))
          )}
        </div>

        <div className="rounded-xl border border-white/10 bg-black/30 p-4">
          <h2 className="text-xl font-bold text-yellow-300">Waitlist</h2>

          {waitlist.length === 0 ? (
            <p className="mt-2 text-gray-400">No one on waitlist.</p>
          ) : (
            waitlist.map((a, i) => (
              <p key={i} className="mt-2 text-gray-300">
                {i + 1}. {a.name}
              </p>
            ))
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-[#F28C52]/30 bg-black/40 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h2 className="text-2xl font-bold text-[#F28C52]">Event Photos</h2>

          {currentUserId ? (
            <label className="cursor-pointer rounded-lg bg-[#F28C52] px-5 py-3 text-center font-semibold text-black hover:bg-[#C96A2C]">
              {uploading ? "Uploading..." : "Upload Photo"}
              <input
                type="file"
                accept="image/*"
                onChange={uploadPhoto}
                disabled={uploading}
                className="hidden"
              />
            </label>
          ) : (
            <p className="text-sm text-gray-400">Log in to upload photos.</p>
          )}
        </div>

        {photos.length === 0 ? (
          <p className="mt-4 text-gray-400">No photos uploaded yet.</p>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="overflow-hidden rounded-xl border border-white/10 bg-black/30"
              >
                <img
                  src={photo.photo_url}
                  alt="Event photo"
                  className="h-56 w-full object-cover"
                />

                {photo.user_id === currentUserId && (
                  <button
                    onClick={() => deletePhoto(photo)}
                    className="w-full bg-red-500 px-3 py-2 text-sm font-semibold text-white hover:bg-red-600"
                  >
                    Delete Photo
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}