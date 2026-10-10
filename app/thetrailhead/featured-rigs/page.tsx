
"use client";

import { FormEvent, useRef, useState } from "react";
import heic2any from "heic2any";

const MAX_PHOTOS = 4;
const MIN_PHOTOS = 2;
const MAX_ORIGINAL_FILE_SIZE = 50 * 1024 * 1024;
const MAX_UPLOAD_FILE_SIZE = 8 * 1024 * 1024;

export default function FeaturedRigsPage() {
  const formRef = useRef<HTMLFormElement>(null);

  const [photos, setPhotos] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [processingPhoto, setProcessingPhoto] = useState(0);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  function handlePhotos(files: FileList | null) {
    setError("");

    if (!files) {
      setPhotos([]);
      return;
    }

    const selected = Array.from(files);

    if (selected.length > MAX_PHOTOS) {
      setError(`Please select no more than ${MAX_PHOTOS} photos.`);
      setPhotos([]);
      return;
    }

    const oversized = selected.find(
      (file) => file.size > MAX_ORIGINAL_FILE_SIZE
    );

    if (oversized) {
      setError(
        `"${oversized.name}" is larger than 50 MB. Please choose a smaller photo.`
      );
      setPhotos([]);
      return;
    }

    setPhotos(selected);
  }

  async function optimizePhoto(file: File): Promise<File> {
    const lowerName = file.name.toLowerCase();

    const isHeic =
      ["image/heic", "image/heif"].includes(file.type.toLowerCase()) ||
      lowerName.endsWith(".heic") ||
      lowerName.endsWith(".heif");

    if (
      !isHeic &&
      file.size <= 3 * 1024 * 1024 &&
      ["image/jpeg", "image/png", "image/webp"].includes(file.type)
    ) {
      return file;
    }

    let source: Blob = file;

    if (isHeic) {
      const converted = await heic2any({
        blob: file,
        toType: "image/jpeg",
        quality: 0.9,
      });

      source = Array.isArray(converted)
        ? converted[0]
        : converted;
    }

    const url = URL.createObjectURL(source);

    try {
      const img = await new Promise<HTMLImageElement>(
        (resolve, reject) => {
          const image = new Image();

          image.onload = () => resolve(image);

          image.onerror = () =>
            reject(new Error(`Could not read ${file.name}.`));

          image.src = url;
        }
      );

      const scale = Math.min(
        1,
        2400 / Math.max(img.naturalWidth, img.naturalHeight)
      );

      const canvas = document.createElement("canvas");

      canvas.width = Math.max(
        1,
        Math.round(img.naturalWidth * scale)
      );

      canvas.height = Math.max(
        1,
        Math.round(img.naturalHeight * scale)
      );

      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error(
          "Image processing is not supported by this browser."
        );
      }

      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);

      context.drawImage(
        img,
        0,
        0,
        canvas.width,
        canvas.height
      );

      const blob = await new Promise<Blob>(
        (resolve, reject) => {
          canvas.toBlob(
            (result) =>
              result
                ? resolve(result)
                : reject(
                    new Error(
                      `Could not optimize ${file.name}.`
                    )
                  ),
            "image/jpeg",
            0.85
          );
        }
      );

      const name =
        file.name.replace(/\.[^/.]+$/, "") ||
        "featured-rig-photo";

      return new File(
        [blob],
        `${name}.jpg`,
        {
          type: "image/jpeg",
          lastModified: Date.now(),
        }
      );
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess(false);

    if (photos.length < MIN_PHOTOS) {
      setError("Please upload at least 2 vehicle photos.");
      return;
    }

    if (photos.length > MAX_PHOTOS) {
      setError("Please upload no more than 4 vehicle photos.");
      return;
    }

    setSubmitting(true);

    try {
      const form = event.currentTarget;
      const formData = new FormData(form);

      formData.delete("photos");

      // Process photos individually to reduce
      // memory usage on mobile devices.
      for (
        let index = 0;
        index < photos.length;
        index++
      ) {
        setProcessingPhoto(index + 1);

        let optimized: File;

        try {
          optimized = await optimizePhoto(
            photos[index]
          );
        } catch (cause) {
          throw new Error(
            `Unable to process ${photos[index].name}. Please try a JPG photo.`,
            { cause }
          );
        }

        if (optimized.size > MAX_UPLOAD_FILE_SIZE) {
          throw new Error(
            `${photos[index].name} is still over 8 MB after optimization. Please choose another photo.`
          );
        }

        formData.append("photos", optimized);
      }

      setProcessingPhoto(0);

      const response = await fetch(
        "/api/thetrailhead-featured-rig",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json().catch(
        () => null
      );

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Unable to submit your rig. Please try again."
        );
      }

      setSuccess(true);
      setPhotos([]);
      formRef.current?.reset();

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (submitError) {
      console.error(
        "Featured Rig submission error:",
        submitError
      );

      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to submit your rig. Please try again."
      );
    } finally {
      setProcessingPhoto(0);
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 text-white">
      {/* HEADER */}
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#F28C52]">
          The Trailhead
        </p>

        <h1 className="mt-2 font-cinzel text-4xl font-bold md:text-5xl">
          Featured Rigs
        </h1>

        <p className="mt-4 max-w-3xl text-lg leading-8 text-white/70">
          The Featured Rig Area puts the spotlight on vehicles
          and the people behind them. Selected rigs receive a
          dedicated display space at an upcoming Trailhead meet.
        </p>
      </header>

      {/* SUCCESS */}
      {success && (
        <section className="mt-8 rounded-2xl border border-green-400/30 bg-green-500/10 p-6">
          <h2 className="text-2xl font-bold text-green-200">
            Your rig has been submitted!
          </h2>

          <p className="mt-3 leading-7 text-white/75">
            Thanks for submitting your vehicle for consideration
            for The Trailhead Featured Rig Area. We&apos;ll review
            your submission and contact you using the information
            you provided if your rig is selected.
          </p>
        </section>
      )}

      {/* INTRO */}
      <section className="mt-8 grid gap-5 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-black/30 p-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#F28C52]">
            What We&apos;re Looking For
          </p>

          <h2 className="mt-2 font-cinzel text-2xl font-bold">
            Every Build Has a Story
          </h2>

          <p className="mt-4 leading-7 text-white/70">
            A Featured Rig doesn&apos;t have to be the most
            expensive, most modified, or most extreme vehicle at
            the meet. We&apos;re interested in unique builds,
            interesting platforms, purpose-built vehicles, creative
            ideas, and rigs with a story behind them.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/30 p-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#F28C52]">
            Who Can Submit?
          </p>

          <h2 className="mt-2 font-cinzel text-2xl font-bold">
            Open to Everyone
          </h2>

          <p className="mt-4 leading-7 text-white/70">
            Featured Rig submissions are open to the public. You
            do not need to be a Peach State Off-Road &amp; Overlanding
            member, and you do not need an account to submit your
            vehicle.
          </p>
        </div>
      </section>

      {/* FORM */}
      <section className="mt-8 rounded-2xl border border-[#F28C52]/30 bg-black/40 p-6 md:p-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#F28C52]">
            Featured Rig Application
          </p>

          <h2 className="mt-2 font-cinzel text-3xl font-bold">
            Submit Your Rig
          </h2>

          <p className="mt-3 max-w-3xl leading-7 text-white/65">
            Tell us about your vehicle and what makes it yours.
            Submitting a vehicle does not guarantee selection.
          </p>
        </div>

        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="mt-8 space-y-8"
        >
          {/* CONTACT */}
          <FormSection
            title="About You"
            description="How we can identify and contact you about your submission."
          >
            <div className="grid gap-5 md:grid-cols-2">
              <Field
                label="Name"
                name="name"
                required
                placeholder="First and last name"
              />

              <Field
                label="Email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
              />

              <Field
                label="Phone"
                name="phone"
                type="tel"
                placeholder="Optional"
              />

              <Field
                label="City / State"
                name="location"
                required
                placeholder="Example: Cumming, GA"
              />
            </div>
          </FormSection>

          {/* VEHICLE */}
          <FormSection
            title="Your Rig"
            description="Tell us what you drive."
          >
            <div className="grid gap-5 md:grid-cols-3">
              <Field
                label="Year"
                name="vehicle_year"
                required
                placeholder="2024"
              />

              <Field
                label="Make"
                name="vehicle_make"
                required
                placeholder="Subaru"
              />

              <Field
                label="Model"
                name="vehicle_model"
                required
                placeholder="Ascent"
              />
            </div>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <Field
                label="Vehicle Name"
                name="vehicle_name"
                placeholder="Optional"
              />

              <Field
                label="Instagram"
                name="instagram"
                placeholder="@yourhandle — optional"
              />
            </div>
          </FormSection>

          {/* BUILD */}
          <FormSection
            title="The Build"
            description="Give us a good overview of what you've done to the vehicle."
          >
            <TextArea
              label="Build Details"
              name="build_details"
              required
              rows={7}
              placeholder="Tell us about your suspension, tires, armor, recovery equipment, lighting, camping setup, performance modifications, custom work, or anything else that makes up your build."
            />
          </FormSection>

          {/* STORY */}
          <FormSection
            title="The Story"
            description="The vehicle is only part of what makes a Featured Rig interesting."
          >
            <TextArea
              label="Why should we feature your rig?"
              name="rig_story"
              required
              rows={6}
              placeholder="Tell us about the story behind the vehicle, how you use it, where it has taken you, what makes it unique, or why you'd like to display it at The Trailhead."
            />
          </FormSection>

          {/* PHOTOS */}
          <FormSection
            title="Vehicle Photos"
            description="Upload 2–4 clear photos that give us a good look at your rig."
          >
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-white">
                Photos <span className="text-[#F28C52]">*</span>
              </span>

              <input
                type="file"
                name="photos"
                accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.heic,.heif"
                multiple
                required
                disabled={submitting}
                onChange={(event) =>
                  handlePhotos(event.target.files)
                }
                className="block w-full cursor-pointer rounded-xl border border-white/15 bg-white/5 p-3 text-sm text-white file:mr-4 file:rounded-lg file:border-0 file:bg-[#F28C52] file:px-4 file:py-2 file:font-bold file:text-black disabled:opacity-50"
              />
            </label>

            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-white/50">
                2–4 photos
              </span>

              <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-white/50">
                Up to 50 MB original photo
              </span>

              <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-white/50">
                JPG • PNG • WEBP • HEIC • HEIF
              </span>
            </div>

            <p className="mt-3 text-sm text-white/50">
              Large photos and iPhone HEIC images are automatically
              optimized before submission.
            </p>

            {photos.length > 0 && (
              <div className="mt-4 rounded-xl border border-white/10 bg-black/30 p-4">
                <p className="font-bold text-[#F28C52]">
                  {photos.length}{" "}
                  {photos.length === 1 ? "photo" : "photos"} selected
                </p>

                <div className="mt-2 space-y-1">
                  {photos.map((photo, index) => (
                    <p
                      key={`${photo.name}-${index}`}
                      className="truncate text-sm text-white/60"
                    >
                      {index + 1}. {photo.name}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {submitting && processingPhoto > 0 && (
              <div className="mt-4 rounded-xl border border-[#F28C52]/30 bg-[#F28C52]/10 p-4">
                <p className="font-bold text-[#F28C52]">
                  Processing photo {processingPhoto} of {photos.length}...
                </p>

                <p className="mt-2 text-sm text-white/60">
                  Please keep this page open while your photos
                  are being prepared.
                </p>
              </div>
            )}
          </FormSection>

          {/* ERROR */}
          {error && (
            <div className="rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-red-200">
              {error}
            </div>
          )}

          {/* SUBMIT */}
          <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
            <p className="text-sm leading-6 text-white/55">
              By submitting your rig, you&apos;re asking to be
              considered for a future Trailhead Featured Rig Area.
              Submission does not guarantee selection. If selected,
              The Trailhead team will contact you using the
              information provided above.
            </p>

            <button
              type="submit"
              disabled={submitting}
              className="mt-5 w-full rounded-xl bg-[#F28C52] px-6 py-3.5 text-lg font-bold text-black transition hover:bg-[#C96A2C] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {submitting
                ? processingPhoto > 0
                  ? `Processing Photo ${processingPhoto} of ${photos.length}...`
                  : "Submitting Rig..."
                : "Submit My Rig"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-white/10 pt-7 first:border-t-0 first:pt-0">
      <h3 className="font-cinzel text-xl font-bold text-white">
        {title}
      </h3>

      <p className="mt-1 text-sm text-white/50">
        {description}
      </p>

      <div className="mt-5">{children}</div>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-white">
        {label}
        {required && (
          <span className="text-[#F28C52]"> *</span>
        )}
      </span>

      <input
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-lg border border-white/15 bg-white px-3 py-2.5 text-black placeholder:text-gray-500"
      />
    </label>
  );
}

function TextArea({
  label,
  name,
  required = false,
  rows = 5,
  placeholder,
}: {
  label: string;
  name: string;
  required?: boolean;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-white">
        {label}
        {required && (
          <span className="text-[#F28C52]"> *</span>
        )}
      </span>

      <textarea
        name={name}
        required={required}
        rows={rows}
        placeholder={placeholder}
        className="w-full rounded-lg border border-white/15 bg-white px-3 py-2.5 text-black placeholder:text-gray-500"
      />
    </label>
  );
}
