"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type GalleryPhoto = {
  id: string;
  image_url: string;
  caption: string | null;
  event_label: string | null;
  display_order: number;
  created_at: string;
};

export default function TrailheadGalleryPage() {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPhoto, setSelectedPhoto] =
    useState<GalleryPhoto | null>(null);

  useEffect(() => {
    loadGallery();
  }, []);

  useEffect(() => {
    if (!selectedPhoto) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSelectedPhoto(null);
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedPhoto]);

  async function loadGallery() {
    setLoading(true);
    setError("");

    try {
      const { data, error: galleryError } = await supabase
        .from("trailhead_gallery")
        .select(
          "id, image_url, caption, event_label, display_order, created_at"
        )
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (galleryError) {
        console.error(
          "Trailhead public gallery load error:",
          galleryError
        );

        setError("Unable to load the Trailhead Gallery.");
        setLoading(false);
        return;
      }

      setPhotos(data || []);
    } catch (loadError) {
      console.error(
        "Trailhead public gallery load error:",
        loadError
      );

      setError("Unable to load the Trailhead Gallery.");
    }

    setLoading(false);
  }

  return (
    <>
      <main className="mx-auto max-w-6xl px-4 py-10 text-white md:py-14">
        {/* HEADER */}
        <section className="rounded-2xl border border-white/10 bg-black/45 px-6 py-10 text-center shadow-xl backdrop-blur md:px-10 md:py-12">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#F28C52] md:text-sm">
            The Trailhead
          </p>

          <h1 className="mt-3 font-cinzel text-4xl font-bold text-white md:text-5xl">
            Gallery
          </h1>

          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-white/70">
            Builds, people, families, vendors, and moments
            from The Trailhead community.
          </p>
        </section>

        {/* GALLERY */}
        <section className="mt-10">
          {loading ? (
            <div className="rounded-2xl border border-white/10 bg-black/40 p-10 text-center">
              <p className="text-white/60">
                Loading gallery...
              </p>
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-6 text-center text-red-200">
              {error}
            </div>
          ) : photos.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/15 bg-black/30 px-6 py-14 text-center">
              <h2 className="font-cinzel text-2xl font-bold text-white">
                The Gallery Is Just Getting Started
              </h2>

              <p className="mx-auto mt-4 max-w-2xl leading-7 text-white/60">
                Photos from The Trailhead will be added here
                as the community continues to meet, explore,
                and grow.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#F28C52]">
                    Trailhead Moments
                  </p>

                  <h2 className="mt-2 font-cinzel text-2xl font-bold text-white md:text-3xl">
                    From the Community
                  </h2>
                </div>

                <p className="hidden text-sm text-white/40 sm:block">
                  Click a photo to view larger
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
                {photos.map((photo) => (
                  <button
                    key={photo.id}
                    type="button"
                    onClick={() =>
                      setSelectedPhoto(photo)
                    }
                    className="group overflow-hidden rounded-xl border border-white/10 bg-black/50 text-left transition hover:border-[#F28C52]/60"
                  >
                    <div className="aspect-square overflow-hidden bg-black sm:aspect-[4/3]">
                      <img
                        src={photo.image_url}
                        alt={
                          photo.caption ||
                          photo.event_label ||
                          "The Trailhead Gallery"
                        }
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                      />
                    </div>

                    {(photo.event_label ||
                      photo.caption) && (
                      <div className="p-3 sm:p-4">
                        {photo.event_label && (
                          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#F28C52] sm:text-xs">
                            {photo.event_label}
                          </p>
                        )}

                        {photo.caption && (
                          <p className="mt-1 line-clamp-2 text-xs leading-5 text-white/70 sm:mt-2 sm:text-sm">
                            {photo.caption}
                          </p>
                        )}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </section>

        {/* BOTTOM */}
        <section className="mt-12 rounded-2xl border border-[#F28C52]/20 bg-[#F28C52]/5 px-6 py-8 text-center">
          <p className="font-cinzel text-xl font-bold text-white md:text-2xl">
            More Than a Meet. It&apos;s a Starting Point.
          </p>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-white/60">
            Follow The Trailhead on Instagram and Facebook
            for more photos, updates, and community content.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a
              href="https://www.instagram.com/thetrailhead_ga/"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-[#F28C52] px-5 py-2.5 text-sm font-bold text-black transition hover:bg-[#C96A2C]"
            >
              Instagram
            </a>

            <a
              href="https://www.facebook.com/thetrailhead.ga"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-[#F28C52]/60 px-5 py-2.5 text-sm font-bold text-white transition hover:border-[#F28C52] hover:bg-[#F28C52]/10"
            >
              Facebook
            </a>
          </div>
        </section>
      </main>

      {/* FULL SIZE PHOTO VIEWER */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative flex max-h-[95vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-white/15 bg-[#111]"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <button
              type="button"
              onClick={() => setSelectedPhoto(null)}
              aria-label="Close photo"
              className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/70 text-xl font-bold text-white transition hover:border-[#F28C52] hover:text-[#F28C52]"
            >
              ×
            </button>

            <div className="flex min-h-0 flex-1 items-center justify-center bg-black">
              <img
                src={selectedPhoto.image_url}
                alt={
                  selectedPhoto.caption ||
                  selectedPhoto.event_label ||
                  "The Trailhead Gallery"
                }
                className="max-h-[80vh] max-w-full object-contain"
              />
            </div>

            {(selectedPhoto.event_label ||
              selectedPhoto.caption) && (
              <div className="border-t border-white/10 p-5">
                {selectedPhoto.event_label && (
                  <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#F28C52]">
                    {selectedPhoto.event_label}
                  </p>
                )}

                {selectedPhoto.caption && (
                  <p className="mt-2 leading-7 text-white/75">
                    {selectedPhoto.caption}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}