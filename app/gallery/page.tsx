"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function GalleryPage() {
  const [pastEvents, setPastEvents] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [selectedEventId, setSelectedEventId] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadGallery();
  }, []);

  async function loadGallery() {
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      window.location.href = "/login";
      return;
    }

    setCurrentUserId(userData.user.id);

    const now = new Date().toISOString();

    const { data: eventsData, error } = await supabase
      .from("events")
      .select("*")
      .lt("event_date", now)
      .order("event_date", { ascending: false });

    if (error) {
      alert(error.message);
      return;
    }

    const eventsWithMedia = await Promise.all(
      (eventsData || []).map(async (event) => {
        const { data: mediaData } = await supabase
          .from("gallery_media")
          .select("*")
          .eq("event_id", event.id)
          .order("created_at", { ascending: false });

        return {
          ...event,
          media: mediaData || [],
        };
      })
    );

    setPastEvents(eventsWithMedia);

    if (eventsWithMedia.length > 0 && !selectedEventId) {
      setSelectedEventId(eventsWithMedia[0].id);
    }
  }

  async function uploadMedia(e: any) {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!selectedEventId) {
      alert("Choose a past ride first.");
      return;
    }

    if (!currentUserId) {
      alert("You must be logged in to upload.");
      return;
    }

    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (!isImage && !isVideo) {
      alert("Only photos and videos are allowed.");
      return;
    }

    setUploading(true);

    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${fileExt}`;

    const filePath = `${selectedEventId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("gallery-media")
      .upload(filePath, file);

    if (uploadError) {
      alert(uploadError.message);
      setUploading(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("gallery-media")
      .getPublicUrl(filePath);

    const { error: insertError } = await supabase.from("gallery_media").insert({
      event_id: selectedEventId,
      user_id: currentUserId,
      media_url: publicUrlData.publicUrl,
      file_path: filePath,
      media_type: isImage ? "image" : "video",
    });

    if (insertError) {
      alert(insertError.message);
      setUploading(false);
      return;
    }

    setUploading(false);
    await loadGallery();
  }

  async function deleteMedia(media: any) {
    if (!confirm("Delete this upload?")) return;

    await supabase.storage.from("gallery-media").remove([media.file_path]);

    const { error } = await supabase
      .from("gallery_media")
      .delete()
      .eq("id", media.id);

    if (error) {
      alert(error.message);
      return;
    }

    await loadGallery();
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#F28C52]">
          Event Gallery
        </h1>
        <p className="mt-3 text-gray-300">
          View and upload photos or videos from previous Peach State rides.
        </p>
      </div>

      <div className="rounded-2xl border border-[#F28C52]/30 bg-black/40 p-5">
        <h2 className="text-xl font-bold text-white">Upload to Gallery</h2>

        {pastEvents.length === 0 ? (
          <p className="mt-3 text-gray-400">
            No past rides available yet. Once an event date passes, it will show
            here.
          </p>
        ) : (
          <div className="mt-4 space-y-4">
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full rounded-lg border border-white/20 bg-white px-3 py-2 text-black"
            >
              {pastEvents.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.title}
                </option>
              ))}
            </select>

            <label className="inline-block cursor-pointer rounded-lg bg-[#F28C52] px-5 py-3 font-semibold text-black hover:bg-[#C96A2C]">
              {uploading ? "Uploading..." : "Upload Photo or Video"}
              <input
                type="file"
                accept="image/*,video/*"
                onChange={uploadMedia}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>
        )}
      </div>

      {pastEvents.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-black/30 p-5">
          <p className="text-gray-400">No past ride galleries yet.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {pastEvents.map((event) => (
            <section
              key={event.id}
              className="rounded-2xl border border-[#F28C52]/20 bg-black/40 p-5"
            >
              <div>
                <h2 className="text-2xl font-bold text-[#F28C52]">
                  {event.title}
                </h2>

                {event.event_date && (
                  <p className="mt-1 text-sm text-gray-400">
                    {new Date(event.event_date).toLocaleDateString()}
                  </p>
                )}
              </div>

              {event.media.length === 0 ? (
                <p className="mt-4 text-gray-400">
                  No photos or videos uploaded yet.
                </p>
              ) : (
                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {event.media.map((media: any) => (
                    <div
                      key={media.id}
                      className="overflow-hidden rounded-xl border border-white/10 bg-black/30"
                    >
                      {media.media_type === "video" ? (
                        <video
                          src={media.media_url}
                          controls
                          className="h-64 w-full bg-black object-cover"
                        />
                      ) : (
                        <img
                          src={media.media_url}
                          alt={event.title}
                          className="h-64 w-full object-cover"
                        />
                      )}

                      {media.user_id === currentUserId && (
                        <button
                          onClick={() => deleteMedia(media)}
                          className="w-full bg-red-500 px-3 py-2 text-sm font-semibold text-white hover:bg-red-600"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}