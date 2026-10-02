"use client";

import { FormEvent, useRef, useState } from "react";

export default function VendorsPage() {
  const formRef = useRef<HTMLFormElement>(null);

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess(false);
    setSubmitting(true);

    try {
      const form = event.currentTarget;
      const formData = new FormData(form);

      const payload = {
        business_name: formData.get("business_name"),
        contact_name: formData.get("contact_name"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        website_social: formData.get("website_social"),
        business_type: formData.get("business_type"),
        products_services: formData.get("products_services"),
        setup_description: formData.get("setup_description"),
        space_needed: formData.get("space_needed"),
        power_needed: formData.get("power_needed"),
        additional_notes: formData.get("additional_notes"),
      };

      const response = await fetch("/api/thetrailhead-vendor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setError(
          data?.error ||
            "Unable to submit your vendor inquiry. Please try again."
        );
        setSubmitting(false);
        return;
      }

      setSuccess(true);
      formRef.current?.reset();

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (submitError) {
      console.error("Vendor submission error:", submitError);

      setError(
        "Unable to submit your vendor inquiry. Please try again."
      );
    }

    setSubmitting(false);
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 text-white">
      {/* HEADER */}
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#F28C52]">
          The Trailhead
        </p>

        <h1 className="mt-2 font-cinzel text-4xl font-bold md:text-5xl">
          Sponsors & Vendors
        </h1>

        <p className="mt-4 max-w-3xl text-lg leading-8 text-white/70">
          The Trailhead is built around community. Our sponsors
          help support the event throughout the year, while local
          businesses and organizations can apply to join us as
          vendors at upcoming meets.
        </p>
      </header>

      {/* YEARLY SPONSORS */}
      <section className="mt-10">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#F28C52]">
            Supporting The Trailhead
          </p>

          <h2 className="mt-2 font-cinzel text-3xl font-bold">
            Official Yearly Sponsors
          </h2>

          <p className="mx-auto mt-3 max-w-2xl leading-7 text-white/60">
            We&apos;re proud to recognize the businesses that
            support The Trailhead and the off-road and overland
            community throughout the year.
          </p>
        </div>

        <div className="mt-7 grid gap-5 md:grid-cols-2">
          {/* ONX */}
          <div className="rounded-2xl border border-[#F28C52]/30 bg-black/40 p-7">
            <div className="inline-flex rounded-full border border-[#F28C52]/30 bg-[#F28C52]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#F28C52]">
              Official Yearly Sponsor
            </div>

            <h3 className="mt-5 font-cinzel text-3xl font-bold">
              onX Offroad
            </h3>

            <p className="mt-4 leading-7 text-white/65">
              Proud yearly sponsor of The Trailhead and supporter
              of the off-road and overland community.
            </p>
          </div>

          {/* REVOLUTION */}
          <div className="rounded-2xl border border-[#F28C52]/30 bg-black/40 p-7">
            <div className="inline-flex rounded-full border border-[#F28C52]/30 bg-[#F28C52]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#F28C52]">
              Official Yearly Sponsor
            </div>

            <h3 className="mt-5 font-cinzel text-3xl font-bold">
              Revolution Auto Service
            </h3>

            <p className="mt-4 leading-7 text-white/65">
              Official yearly sponsor of The Trailhead and host
              location for our monthly community meet.
            </p>
          </div>
        </div>
      </section>

      {/* VENDOR INTRO */}
      <section className="mt-12 rounded-2xl border border-white/10 bg-black/30 p-6 md:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#F28C52]">
          Get Involved
        </p>

        <h2 className="mt-2 font-cinzel text-3xl font-bold">
          Become a Trailhead Vendor
        </h2>

        <p className="mt-4 max-w-4xl leading-7 text-white/70">
          Interested in bringing your business to The Trailhead?
          We welcome vendor inquiries from businesses and
          organizations that fit the off-road, overland,
          automotive, outdoor, adventure, and community atmosphere
          of the event.
        </p>

        <p className="mt-3 max-w-4xl leading-7 text-white/60">
          Tell us a little about your business and what you&apos;d
          like to bring to the event. Our team will review your
          submission and contact you about opportunities at an
          upcoming Trailhead meet.
        </p>
      </section>

      {/* SUCCESS */}
      {success && (
        <section className="mt-8 rounded-2xl border border-green-400/30 bg-green-500/10 p-6">
          <h2 className="text-2xl font-bold text-green-200">
            Vendor inquiry submitted!
          </h2>

          <p className="mt-3 leading-7 text-white/75">
            Thanks for your interest in The Trailhead. We&apos;ve
            received your information and will contact you using
            the information provided if there&apos;s an opportunity
            that fits an upcoming event.
          </p>
        </section>
      )}

      {/* FORM */}
      <section className="mt-8 rounded-2xl border border-[#F28C52]/30 bg-black/40 p-6 md:p-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#F28C52]">
            Vendor Application
          </p>

          <h2 className="mt-2 font-cinzel text-3xl font-bold">
            Tell Us About Your Business
          </h2>
        </div>

        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="mt-8 space-y-8"
        >
          {/* BUSINESS */}
          <FormSection
            title="Business Information"
            description="Tell us who you are and what your business does."
          >
            <div className="grid gap-5 md:grid-cols-2">
              <Field
                label="Business Name"
                name="business_name"
                required
                placeholder="Business name"
              />

              <Field
                label="Business Type"
                name="business_type"
                required
                placeholder="Example: Off-road shop, outdoor brand, food vendor"
              />

              <div className="md:col-span-2">
                <Field
                  label="Website / Social Media"
                  name="website_social"
                  placeholder="Website, Instagram, Facebook, etc."
                />
              </div>
            </div>
          </FormSection>

          {/* CONTACT */}
          <FormSection
            title="Contact Information"
            description="Who should we contact about your vendor inquiry?"
          >
            <div className="grid gap-5 md:grid-cols-2">
              <Field
                label="Contact Name"
                name="contact_name"
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
            </div>
          </FormSection>

          {/* PRODUCTS */}
          <FormSection
            title="What Would You Bring?"
            description="Help us understand what Trailhead attendees can expect from your setup."
          >
            <TextArea
              label="Products / Services"
              name="products_services"
              required
              rows={6}
              placeholder="Tell us what your business offers and what you would display, sell, demonstrate, or provide at The Trailhead."
            />

            <div className="mt-5">
              <TextArea
                label="Vendor Setup Description"
                name="setup_description"
                rows={5}
                placeholder="Example: 10x10 canopy, product display tables, demonstration vehicle, trailer, food truck, etc."
              />
            </div>
          </FormSection>

          {/* NEEDS */}
          <FormSection
            title="Setup Requirements"
            description="Let us know what your setup would require."
          >
            <div className="grid gap-5 md:grid-cols-2">
              <Field
                label="Space Needed"
                name="space_needed"
                placeholder="Example: 10x10, two parking spaces, truck + trailer"
              />

              <Field
                label="Power Needed"
                name="power_needed"
                placeholder="Example: None, standard outlet, generator"
              />
            </div>
          </FormSection>

          {/* NOTES */}
          <FormSection
            title="Anything Else?"
            description="Share anything else you'd like us to know."
          >
            <TextArea
              label="Additional Notes"
              name="additional_notes"
              rows={5}
              placeholder="Questions, special requests, event ideas, partnership opportunities, or other information."
            />
          </FormSection>

          {/* ERROR */}
          {error && (
            <div className="rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-red-200">
              {error}
            </div>
          )}

          {/* DISCLAIMER + SUBMIT */}
          <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
            <p className="text-sm leading-6 text-white/55">
              Submitting this form does not guarantee vendor space
              at a Trailhead event. Vendor participation is subject
              to approval, available space, event needs, and any
              requirements communicated by The Trailhead team.
            </p>

            <button
              type="submit"
              disabled={submitting}
              className="mt-5 w-full rounded-xl bg-[#F28C52] px-6 py-3.5 text-lg font-bold text-black transition hover:bg-[#C96A2C] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {submitting
                ? "Submitting..."
                : "Submit Vendor Inquiry"}
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