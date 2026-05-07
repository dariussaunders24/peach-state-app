"use client";

import JSZip from "jszip";
import { supabase } from "../lib/supabase";

export default function DownloadGalleryButton({
  eventId,
  eventTitle,
  isAdmin,
}: {
  eventId: string;
  eventTitle: string;
  isAdmin: boolean;
}) {
  if (!isAdmin) return null;

  async function downloadGallery() {
    const { data, error } = await supabase
      .from("gallery_media")
      .select("media_url, media_type")
      .eq("event_id", eventId);

    if (error) {
      alert(error.message);
      return;
    }

    if (!data || data.length === 0) {
      alert("No gallery photos found.");
      return;
    }

    const zip = new JSZip();

    const safeEventTitle = eventTitle
      .replace(/[^a-z0-9]/gi, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .toLowerCase();

    let fileCount = 0;

    for (let i = 0; i < data.length; i++) {
      const item = data[i];

      if (!item.media_url) continue;

      try {
        const response = await fetch(item.media_url);

        if (!response.ok) continue;

        const blob = await response.blob();

        const extension =
          item.media_type === "video"
            ? "mp4"
            : blob.type === "image/png"
            ? "png"
            : blob.type === "image/webp"
            ? "webp"
            : blob.type === "image/gif"
            ? "gif"
            : "jpg";

        fileCount++;

        zip.file(`${safeEventTitle}-media-${fileCount}.${extension}`, blob);
      } catch (err) {
        console.error("Failed to download:", item.media_url, err);
      }
    }

    if (fileCount === 0) {
      alert("No downloadable gallery files found.");
      return;
    }

    const zipBlob = await zip.generateAsync({ type: "blob" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(zipBlob);
    link.download = `${safeEventTitle}-gallery.zip`;
    link.click();

    URL.revokeObjectURL(link.href);
  }

  return (
    <button
      onClick={downloadGallery}
      className="rounded bg-blue-500 px-3 py-1 text-xs font-semibold text-white"
    >
      Download Gallery
    </button>
  );
}