"use client";

import { ChangeEvent, useEffect, useState } from "react";
import heic2any from "heic2any";
import { supabase } from "../../lib/supabase";

type TrailheadSettings = {
  id: number;
  event_date: string | null;
  start_time: string | null;
  end_time: string | null;
  venue_name: string | null;
  address: string | null;
  announcement: string | null;
  special_feature: string | null;
  event_image: string | null;
  little_explorer_title: string | null;
  little_explorer_details: string | null;
  little_explorer_bonus: string | null;
};

type GalleryPhoto = {
  id: string;
  image_url: string;
  storage_path: string;
  caption: string | null;
  event_label: string | null;
  display_order: number;
  created_at: string;
};

export default function TheTrailheadAdminPage() {
  const [settings, setSettings] =
    useState<TrailheadSettings | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Gallery
  const [galleryPhotos, setGalleryPhotos] = useState<GalleryPhoto[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(true);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [galleryMessage, setGalleryMessage] = useState("");
  const [galleryError, setGalleryError] = useState("");

  const [galleryFile, setGalleryFile] = useState<File | null>(null);
  const [galleryCaption, setGalleryCaption] = useState("");
  const [galleryEventLabel, setGalleryEventLabel] = useState("");

  const [deletingPhotoId, setDeletingPhotoId] =
    useState<string | null>(null);

  useEffect(() => {
    loadSettings();
    loadGallery();
  }, []);

  async function getAccessToken() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    return session?.access_token || null;
  }

  async function loadSettings() {
    setLoading(true);
    setError("");

    try {
      const token = await getAccessToken();

      if (!token) {
        setError("You must be signed in as an administrator.");
        setLoading(false);
        return;
      }

      const response = await fetch(
        "/api/admin/thetrailhead-settings",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data?.error || "Unable to load Trailhead settings."
        );
        setLoading(false);
        return;
      }

      setSettings(data.settings);
    } catch (loadError) {
      console.error(
        "Trailhead settings load error:",
        loadError
      );

      setError("Unable to load Trailhead settings.");
    }

    setLoading(false);
  }

  async function loadGallery() {
    setGalleryLoading(true);
    setGalleryError("");

    try {
      const token = await getAccessToken();

      if (!token) {
        setGalleryError(
          "You must be signed in as an administrator."
        );
        setGalleryLoading(false);
        return;
      }

      const response = await fetch(
        "/api/admin/thetrailhead-gallery",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setGalleryError(
          data?.error || "Unable to load gallery photos."
        );
        setGalleryLoading(false);
        return;
      }

      setGalleryPhotos(data.photos || []);
    } catch (loadError) {
      console.error(
        "Trailhead gallery load error:",
        loadError
      );

      setGalleryError("Unable to load gallery photos.");
    }

    setGalleryLoading(false);
  }

  function updateField(
    field: keyof TrailheadSettings,
    value: string
  ) {
    if (!settings) return;

    setSettings({
      ...settings,
      [field]: value,
    });
  }

  async function saveSettings() {
    if (!settings) return;

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const token = await getAccessToken();

      if (!token) {
        setError(
          "Your session has expired. Please sign in again."
        );
        setSaving(false);
        return;
      }

      const response = await fetch(
        "/api/admin/thetrailhead-settings",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            id: settings.id,
            event_date: settings.event_date,
            start_time: settings.start_time,
            end_time: settings.end_time,
            venue_name: settings.venue_name,
            address: settings.address,
            announcement: settings.announcement,
            special_feature: settings.special_feature,
            event_image: settings.event_image,
            little_explorer_title:
              settings.little_explorer_title,
            little_explorer_details:
              settings.little_explorer_details,
            little_explorer_bonus:
              settings.little_explorer_bonus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data?.error || "Unable to save Trailhead settings."
        );
        setSaving(false);
        return;
      }

      setSettings(data.settings);
      setMessage(
        "Trailhead settings saved successfully."
      );
    } catch (saveError) {
      console.error(
        "Trailhead settings save error:",
        saveError
      );

      setError("Unable to save Trailhead settings.");
    }

    setSaving(false);
  }

  function handleGalleryFileChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    setGalleryError("");
    setGalleryMessage("");

    const file = event.target.files?.[0] || null;

    if (!file) {
      setGalleryFile(null);
      return;
    }

    const maxFileSize = 50 * 1024 * 1024;

    if (file.size > maxFileSize) {
      setGalleryFile(null);
      event.target.value = "";
      setGalleryError(
        "Photo must be 50 MB or smaller."
      );
      return;
    }

    setGalleryFile(file);
  }

  async function optimizeGalleryPhoto(
    file: File
  ): Promise<File> {
    const fileName = file.name.toLowerCase();

    const isHeic =
      file.type.toLowerCase() === "image/heic" ||
      file.type.toLowerCase() === "image/heif" ||
      fileName.endsWith(".heic") ||
      fileName.endsWith(".heif");

    let sourceBlob: Blob = file;

    /*
     * iPhone HEIC / HEIF photos are converted to JPEG
     * before being processed by the browser.
     */
    if (isHeic) {
      const converted = await heic2any({
        blob: file,
        toType: "image/jpeg",
        quality: 0.9,
      });

      sourceBlob = Array.isArray(converted)
        ? converted[0]
        : converted;
    }

    /*
     * Small JPEG / PNG / WEBP photos can continue
     * through the existing uploader unchanged.
     */
    if (!isHeic && file.size <= 3 * 1024 * 1024) {
      return file;
    }

    const imageUrl = URL.createObjectURL(sourceBlob);

    try {
      const image = await new Promise<HTMLImageElement>(
        (resolve, reject) => {
          const img = new Image();

          img.onload = () => resolve(img);

          img.onerror = () =>
            reject(
              new Error(
                "The selected photo could not be processed."
              )
            );

          img.src = imageUrl;
        }
      );

      /*
       * Keep the longest side at a maximum of 2400px.
       * This is plenty of resolution for the website gallery.
       */
      const maxDimension = 2400;

      let width = image.naturalWidth;
      let height = image.naturalHeight;

      if (
        width > maxDimension ||
        height > maxDimension
      ) {
        const scale = Math.min(
          maxDimension / width,
          maxDimension / height
        );

        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }

      const canvas = document.createElement("canvas");

      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error(
          "Your browser could not process the selected photo."
        );
      }

      /*
       * Add a white background so transparent PNG areas
       * don't turn black when converted to JPEG.
       */
      context.fillStyle = "#ffffff";
      context.fillRect(
        0,
        0,
        width,
        height
      );

      context.drawImage(
        image,
        0,
        0,
        width,
        height
      );

      const optimizedBlob =
        await new Promise<Blob>(
          (resolve, reject) => {
            canvas.toBlob(
              (blob) => {
                if (blob) {
                  resolve(blob);
                } else {
                  reject(
                    new Error(
                      "The photo could not be optimized."
                    )
                  );
                }
              },
              "image/jpeg",
              0.85
            );
          }
        );

      const originalName =
        file.name.replace(/\.[^/.]+$/, "") ||
        "trailhead-photo";

      return new File(
        [optimizedBlob],
        `${originalName}.jpg`,
        {
          type: "image/jpeg",
          lastModified: Date.now(),
        }
      );
    } finally {
      URL.revokeObjectURL(imageUrl);
    }
  }

  async function uploadGalleryPhoto() {
    if (!galleryFile) {
      setGalleryError(
        "Please choose a photo before uploading."
      );
      return;
    }

    setGalleryUploading(true);
    setGalleryMessage("");
    setGalleryError("");

    try {
      const token = await getAccessToken();

      if (!token) {
        setGalleryError(
          "Your session has expired. Please sign in again."
        );
        setGalleryUploading(false);
        return;
      }

      /*
       * Optimize the image before sending it through
       * the existing API.
       *
       * HEIC / HEIF -> JPEG
       * Large images -> resized/compressed JPEG
       * Small JPEG / PNG / WEBP -> unchanged
       */
      const uploadFile =
        await optimizeGalleryPhoto(galleryFile);

      const formData = new FormData();

      formData.append("photo", uploadFile);
      formData.append("caption", galleryCaption);
      formData.append(
        "event_label",
        galleryEventLabel
      );

      const response = await fetch(
        "/api/admin/thetrailhead-gallery",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setGalleryError(
          data?.error ||
            "Unable to upload gallery photo."
        );
        setGalleryUploading(false);
        return;
      }

      setGalleryFile(null);
      setGalleryCaption("");
      setGalleryEventLabel("");

      const fileInput = document.getElementById(
        "trailhead-gallery-photo"
      ) as HTMLInputElement | null;

      if (fileInput) {
        fileInput.value = "";
      }

      setGalleryMessage(
        "Gallery photo uploaded successfully."
      );

      await loadGallery();
    } catch (uploadError) {
      console.error(
        "Trailhead gallery upload error:",
        uploadError
      );

      const errorMessage =
        uploadError instanceof Error
          ? uploadError.message
          : "Unable to process the selected photo.";

      setGalleryError(
        `Unable to upload gallery photo: ${errorMessage}`
      );
    }

    setGalleryUploading(false);
  }

  async function deleteGalleryPhoto(photo: GalleryPhoto) {
    const confirmed = window.confirm(
      "Delete this photo from The Trailhead Gallery? This cannot be undone."
    );

    if (!confirmed) return;

    setDeletingPhotoId(photo.id);
    setGalleryMessage("");
    setGalleryError("");

    try {
      const token = await getAccessToken();

      if (!token) {
        setGalleryError(
          "Your session has expired. Please sign in again."
        );
        setDeletingPhotoId(null);
        return;
      }

      const response = await fetch(
        "/api/admin/thetrailhead-gallery",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            id: photo.id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setGalleryError(
          data?.error || "Unable to delete gallery photo."
        );
        setDeletingPhotoId(null);
        return;
      }

      setGalleryPhotos((current) =>
        current.filter((item) => item.id !== photo.id)
      );

      setGalleryMessage(
        "Gallery photo deleted successfully."
      );
    } catch (deleteError) {
      console.error(
        "Trailhead gallery delete error:",
        deleteError
      );

      setGalleryError(
        "Unable to delete gallery photo."
      );
    }

    setDeletingPhotoId(null);
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10 text-white">
        <p>Loading Trailhead settings...</p>
      </main>
    );
  }

  if (error && !settings) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10 text-white">
        <h1 className="font-cinzel text-3xl font-bold text-[#F28C52]">
          Trailhead Management
        </h1>

        <div className="mt-6 rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-red-200">
          {error}
        </div>
      </main>
    );
  }

  if (!settings) {
    return null;
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 text-white">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#F28C52]">
          Admin
        </p>

        <h1 className="mt-2 font-cinzel text-3xl font-bold">
          Trailhead Management
        </h1>

        <p className="mt-3 max-w-3xl text-white/60">
          Manage the information displayed on the public
          Trailhead website. Changes saved here will be used
          for the next Trailhead meet.
        </p>
      </div>

      {message && (
        <div className="mt-6 rounded-xl border border-green-400/30 bg-green-500/10 p-4 text-green-200">
          {message}
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-red-200">
          {error}
        </div>
      )}

      {/* NEXT MEET */}
      <section className="mt-8 rounded-2xl border border-white/10 bg-black/40 p-5 md:p-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#F28C52]">
            Event Details
          </p>

          <h2 className="mt-2 text-2xl font-bold text-white">
            Next Trailhead Meet
          </h2>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-3">
          <Field label="Date">
            <input
              type="date"
              value={settings.event_date || ""}
              onChange={(e) =>
                updateField("event_date", e.target.value)
              }
              className="w-full rounded-lg border border-white/15 bg-white px-3 py-2.5 text-black"
            />
          </Field>

          <Field label="Start Time">
            <input
              type="time"
              value={
                settings.start_time?.slice(0, 5) || ""
              }
              onChange={(e) =>
                updateField("start_time", e.target.value)
              }
              className="w-full rounded-lg border border-white/15 bg-white px-3 py-2.5 text-black"
            />
          </Field>

          <Field label="End Time">
            <input
              type="time"
              value={
                settings.end_time?.slice(0, 5) || ""
              }
              onChange={(e) =>
                updateField("end_time", e.target.value)
              }
              className="w-full rounded-lg border border-white/15 bg-white px-3 py-2.5 text-black"
            />
          </Field>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <Field label="Venue Name">
            <input
              type="text"
              value={settings.venue_name || ""}
              onChange={(e) =>
                updateField("venue_name", e.target.value)
              }
              placeholder="Revolution Auto Service"
              className="w-full rounded-lg border border-white/15 bg-white px-3 py-2.5 text-black"
            />
          </Field>

          <Field label="Address">
            <input
              type="text"
              value={settings.address || ""}
              onChange={(e) =>
                updateField("address", e.target.value)
              }
              placeholder="Event address"
              className="w-full rounded-lg border border-white/15 bg-white px-3 py-2.5 text-black"
            />
          </Field>
        </div>
      </section>

      {/* MONTHLY CONTENT */}
      <section className="mt-6 rounded-2xl border border-white/10 bg-black/40 p-5 md:p-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#F28C52]">
            Monthly Content
          </p>

          <h2 className="mt-2 text-2xl font-bold text-white">
            Announcement & Features
          </h2>

          <p className="mt-2 text-sm text-white/50">
            Use these fields for information that changes
            from one Trailhead meet to the next.
          </p>
        </div>

        <div className="mt-6 space-y-5">
          <Field label="Announcement">
            <textarea
              value={settings.announcement || ""}
              onChange={(e) =>
                updateField(
                  "announcement",
                  e.target.value
                )
              }
              placeholder="Optional announcement for the next Trailhead..."
              rows={4}
              className="w-full rounded-lg border border-white/15 bg-white px-3 py-2.5 text-black"
            />
          </Field>

          <Field label="Special Feature">
            <textarea
              value={settings.special_feature || ""}
              onChange={(e) =>
                updateField(
                  "special_feature",
                  e.target.value
                )
              }
              placeholder="Example: Free campfire and s'mores sponsored by onX Offroad"
              rows={3}
              className="w-full rounded-lg border border-white/15 bg-white px-3 py-2.5 text-black"
            />
          </Field>

          <Field label="Event Image">
            <input
              type="text"
              value={settings.event_image || ""}
              onChange={(e) =>
                updateField(
                  "event_image",
                  e.target.value
                )
              }
              placeholder="/trailhead-logo.png"
              className="w-full rounded-lg border border-white/15 bg-white px-3 py-2.5 text-black"
            />

            <p className="mt-2 text-xs text-white/40">
              Enter a public image path such as
              /trailhead-logo.png.
            </p>
          </Field>
        </div>
      </section>

      {/* LITTLE EXPLORERS */}
      <section className="mt-6 rounded-2xl border border-[#F28C52]/30 bg-[#F28C52]/5 p-5 md:p-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#F28C52]">
            Little Explorers
          </p>

          <h2 className="mt-2 text-2xl font-bold text-white">
            This Month at Explorer HQ
          </h2>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-white/50">
            Update the activity, challenge, or special
            experience being offered to Little Explorers at
            the next Trailhead meet.
          </p>
        </div>

        <div className="mt-6 space-y-5">
          <Field label="Activity / Theme">
            <input
              type="text"
              value={
                settings.little_explorer_title || ""
              }
              onChange={(e) =>
                updateField(
                  "little_explorer_title",
                  e.target.value
                )
              }
              placeholder="Example: Campfire & S'mores Night"
              className="w-full rounded-lg border border-white/15 bg-white px-3 py-2.5 text-black"
            />
          </Field>

          <Field label="Activity Details">
            <textarea
              value={
                settings.little_explorer_details || ""
              }
              onChange={(e) =>
                updateField(
                  "little_explorer_details",
                  e.target.value
                )
              }
              placeholder="Describe this month's Little Explorer activity, challenge, or experience..."
              rows={4}
              className="w-full rounded-lg border border-white/15 bg-white px-3 py-2.5 text-black"
            />
          </Field>

          <Field label="Prize / Bonus">
            <textarea
              value={
                settings.little_explorer_bonus || ""
              }
              onChange={(e) =>
                updateField(
                  "little_explorer_bonus",
                  e.target.value
                )
              }
              placeholder="Example: Free s'mores and a Little Explorer prize while supplies last."
              rows={3}
              className="w-full rounded-lg border border-white/15 bg-white px-3 py-2.5 text-black"
            />
          </Field>
        </div>
      </section>

      {/* SAVE SETTINGS */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={saveSettings}
          disabled={saving}
          className="rounded-xl bg-[#F28C52] px-6 py-3 font-bold text-black transition hover:bg-[#C96A2C] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving
            ? "Saving..."
            : "Save Trailhead Settings"}
        </button>

        <a
          href="/thetrailhead"
          target="_blank"
          rel="noreferrer"
          className="rounded-xl border border-white/15 px-6 py-3 text-center font-bold text-white transition hover:border-[#F28C52]/50 hover:text-[#F28C52]"
        >
          View Public Trailhead
        </a>
      </div>

      {/* GALLERY MANAGER */}
      <section className="mt-10 rounded-2xl border border-[#F28C52]/30 bg-black/40 p-5 md:p-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#F28C52]">
            Photo Gallery
          </p>

          <h2 className="mt-2 text-2xl font-bold text-white">
            Trailhead Gallery Manager
          </h2>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-white/50">
            Upload photos for the public Trailhead Gallery.
            Only administrators can add or remove photos.
          </p>
        </div>

        {galleryMessage && (
          <div className="mt-6 rounded-xl border border-green-400/30 bg-green-500/10 p-4 text-green-200">
            {galleryMessage}
          </div>
        )}

        {galleryError && (
          <div className="mt-6 rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-red-200">
            {galleryError}
          </div>
        )}

        {/* UPLOAD */}
        <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-4 md:p-5">
          <h3 className="text-lg font-bold text-white">
            Add Gallery Photo
          </h3>

          <div className="mt-5 space-y-5">
            <Field label="Photo">
              <input
                id="trailhead-gallery-photo"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.heic,.heif"
                onChange={handleGalleryFileChange}
                className="block w-full rounded-lg border border-white/15 bg-white px-3 py-2.5 text-sm text-black file:mr-4 file:rounded-md file:border-0 file:bg-[#F28C52] file:px-4 file:py-2 file:font-bold file:text-black"
              />

              <p className="mt-2 text-xs text-white/40">
                JPG, JPEG, PNG, WEBP, HEIC, or HEIF. Maximum 50 MB.
                Large photos are automatically optimized for the gallery.
              </p>
            </Field>

            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Event / Month">
                <input
                  type="text"
                  value={galleryEventLabel}
                  onChange={(e) =>
                    setGalleryEventLabel(e.target.value)
                  }
                  placeholder="Example: November 2026 Trailhead"
                  className="w-full rounded-lg border border-white/15 bg-white px-3 py-2.5 text-black"
                />
              </Field>

              <Field label="Caption">
                <input
                  type="text"
                  value={galleryCaption}
                  onChange={(e) =>
                    setGalleryCaption(e.target.value)
                  }
                  placeholder="Optional photo caption"
                  className="w-full rounded-lg border border-white/15 bg-white px-3 py-2.5 text-black"
                />
              </Field>
            </div>

            {galleryFile && (
              <div className="rounded-lg border border-[#F28C52]/20 bg-[#F28C52]/5 px-4 py-3 text-sm text-white/70">
                Selected:{" "}
                <span className="font-bold text-white">
                  {galleryFile.name}
                </span>
              </div>
            )}

            <button
              type="button"
              onClick={uploadGalleryPhoto}
              disabled={
                galleryUploading || !galleryFile
              }
              className="rounded-xl bg-[#F28C52] px-6 py-3 font-bold text-black transition hover:bg-[#C96A2C] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {galleryUploading
                ? "Processing & Uploading..."
                : "Upload to Gallery"}
            </button>
          </div>
        </div>

        {/* EXISTING PHOTOS */}
        <div className="mt-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h3 className="text-xl font-bold text-white">
                Gallery Photos
              </h3>

              <p className="mt-1 text-sm text-white/50">
                {galleryPhotos.length}{" "}
                {galleryPhotos.length === 1
                  ? "photo"
                  : "photos"}{" "}
                currently uploaded.
              </p>
            </div>

            <button
              type="button"
              onClick={loadGallery}
              disabled={galleryLoading}
              className="rounded-lg border border-white/15 px-4 py-2 text-sm font-bold text-white transition hover:border-[#F28C52]/60 hover:text-[#F28C52] disabled:opacity-50"
            >
              {galleryLoading
                ? "Loading..."
                : "Refresh Gallery"}
            </button>
          </div>

          {galleryLoading ? (
            <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-6 text-center text-white/50">
              Loading gallery photos...
            </div>
          ) : galleryPhotos.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-white/15 bg-white/[0.02] p-8 text-center">
              <p className="font-bold text-white">
                No gallery photos yet.
              </p>

              <p className="mt-2 text-sm text-white/50">
                Upload your first Trailhead photo above.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {galleryPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="overflow-hidden rounded-xl border border-white/10 bg-black/50"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-black">
                    <img
                      src={photo.image_url}
                      alt={
                        photo.caption ||
                        photo.event_label ||
                        "Trailhead Gallery"
                      }
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="p-4">
                    {photo.event_label && (
                      <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#F28C52]">
                        {photo.event_label}
                      </p>
                    )}

                    {photo.caption && (
                      <p className="mt-2 text-sm leading-6 text-white/75">
                        {photo.caption}
                      </p>
                    )}

                    {!photo.event_label &&
                      !photo.caption && (
                        <p className="text-sm text-white/40">
                          No caption
                        </p>
                      )}

                    <button
                      type="button"
                      onClick={() =>
                        deleteGalleryPhoto(photo)
                      }
                      disabled={
                        deletingPhotoId === photo.id
                      }
                      className="mt-4 w-full rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-200 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deletingPhotoId === photo.id
                        ? "Deleting..."
                        : "Delete Photo"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-white">
        {label}
      </span>

      {children}
    </label>
  );
}