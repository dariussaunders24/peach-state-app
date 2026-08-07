"use client";

import { ReactNode, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const CAPACITY = 35;
const EVENT_IMAGE = "/the-trailhead.png";

export default function TheTrailhead() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [waiverAccepted, setWaiverAccepted] = useState(false);

  const [registrationCount, setRegistrationCount] = useState(0);
  const [loadingCount, setLoadingCount] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const spotsRemaining = Math.max(CAPACITY - registrationCount, 0);
  const isFull = registrationCount >= CAPACITY;

  useEffect(() => {
    loadRegistrationCount();
  }, []);

  async function getRegistrationCount() {
    const { count, error } = await supabase
      .from("the_trailhead_registrations")
      .select("*", {
        count: "exact",
        head: true,
      });

    if (error) {
      console.error("Registration count error:", error.message);
      return null;
    }

    return count || 0;
  }

  async function loadRegistrationCount() {
    const count = await getRegistrationCount();

    if (count !== null) {
      setRegistrationCount(count);
    }

    setLoadingCount(false);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (submitting) return;

    setSubmitting(true);
    setError("");

    const currentCount = await getRegistrationCount();

    if (currentCount === null) {
      setError(
        "Unable to verify registration availability. Please try again."
      );
      setSubmitting(false);
      return;
    }

    setRegistrationCount(currentCount);

    if (currentCount >= CAPACITY) {
      setError("Registration is currently full.");
      setSubmitting(false);
      return;
    }

    if (!firstName.trim()) {
      setError("Please enter your first name.");
      setSubmitting(false);
      return;
    }

    if (!lastName.trim()) {
      setError("Please enter your last name.");
      setSubmitting(false);
      return;
    }

    if (!phone.trim()) {
      setError("Please enter your phone number.");
      setSubmitting(false);
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email address.");
      setSubmitting(false);
      return;
    }

    if (!waiverAccepted) {
      setError("You must accept the waiver before registering.");
      setSubmitting(false);
      return;
    }

    const { error: insertError } = await supabase
      .from("the_trailhead_registrations")
      .insert({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone.trim(),
        email: email.trim().toLowerCase(),
        waiver_accepted: waiverAccepted,
      });

    if (insertError) {
      console.error("Registration error:", insertError.message);
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
      return;
    }

    setRegistrationCount(currentCount + 1);
    setSuccess(true);
    setSubmitting(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 text-white">
      <section className="overflow-hidden rounded-2xl border border-white/10 bg-black/45 shadow-xl backdrop-blur">
        <div className="flex justify-center bg-black/20 p-6">
          <img
            src={EVENT_IMAGE}
            alt="The Trailhead monthly meet"
            className="h-auto w-full max-w-2xl rounded-xl object-contain"
          />
        </div>

        <div className="p-6 md:p-8">
          <p className="text-xs uppercase tracking-[0.3em] text-[#F28C52]/80">
            Peach State Off-Road & Overlanding
          </p>

          <h1 className="mt-3 font-cinzel text-4xl font-bold text-white md:text-5xl">
            The Trailhead
          </h1>

          <p className="mt-3 text-lg text-white/70">
            Our monthly off-road, overland, and automotive community meet.
          </p>

          <section className="mt-8 rounded-xl border border-white/10 bg-black/30 p-5">
            <h2 className="text-xl font-bold">What is The Trailhead?</h2>

            <div className="mt-3 space-y-4 leading-7 text-white/75">
              <p>
                The Trailhead is Peach State Off-Road & Overlanding&apos;s
                monthly community meet that is open to the entire community and
                is hosted at Revolution Auto.
              </p>

              <p>
                This is more than a traditional car meet. The Trailhead is a
                place for off-roaders, overlanders, outdoor enthusiasts,
                families, pets and anyone interested in the community to get
                together, check out different builds, meet new people, and
                spend time with the community.
              </p>

              <p>
                You do not need a heavily modified vehicle to attend. Stock
                vehicles, daily drivers, trail rigs, overland builds, trucks,
                SUVs, Jeeps, Subarus, Broncos, Toyotas, and everything in
                between are welcome.
              </p>
            </div>
          </section>

          <section className="mt-6 rounded-xl border border-white/10 bg-black/30 p-5">
            <h2 className="text-xl font-bold">What to Expect</h2>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <FeatureCard
                title="Off-Road & Overland Builds"
                text="Check out vehicles from across the community and meet the people behind the builds."
              />

              <FeatureCard
                title="Food Truck"
                text="Grab something to eat while you hang out and explore the meet."
              />

              <FeatureCard
                title="Featured Rigs"
                text={
                  <>
                    Select vehicles will be chosen to park in our Featured Rig
                    section. Apply via email to{" "}
                    <a
                      href="mailto:dariussaunders24@gmail.com?subject=Featured%20Rig%20Application"
                      className="font-semibold text-[#F28C52] hover:underline"
                    >
                      dariussaunders24@gmail.com
                    </a>{" "}
                    for a chance to be chosen.
                  </>
                }
              />

              <FeatureCard
                title="Giveaways"
                text="SELECT Trailhead meets will include giveaways and raffle prizes for attendees."
              />

              <FeatureCard
                title="Little Explorers"
                text="Kids can take part in our Little Explorer activities and Trailhead Passport program."
              />

              <FeatureCard
                title="Community"
                text="Meet fellow members, ask questions, talk builds, learn something new, and get connected."
              />
            </div>
          </section>

          <section className="mt-6 rounded-xl border border-[#F28C52]/25 bg-[#F28C52]/10 p-5">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#F28C52]">
              For the Kids
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              Little Explorer Passport
            </h2>

            <p className="mt-3 leading-7 text-white/75">
              Kids attending The Trailhead can participate in the Little
              Explorer Passport program. Complete activities around the meet,
              collect stamps, take part in monthly challenges, and reach
              Explorer milestones throughout the year.
            </p>
          </section>

          <section className="mt-6 rounded-xl border border-white/10 bg-black/30 p-5">
            <h2 className="text-xl font-bold">Register for The Trailhead</h2>

            <p className="mt-3 leading-7 text-white/75">
              Registration helps us plan parking, activities, giveaways, and
              overall attendance for each Trailhead meet. No admittance without
              proof of registration.
            </p>

            <div className="mt-5 rounded-xl border border-[#F28C52]/25 bg-[#F28C52]/10 p-4">
              {loadingCount ? (
                <p className="font-semibold text-white/80">
                  Loading registration count...
                </p>
              ) : (
                <>
                  <p className="text-lg font-bold text-white">
                    {registrationCount} of {CAPACITY} Spots Filled
                  </p>

                  <p className="mt-1 text-sm text-white/70">
                    {isFull
                      ? "Registration is currently full."
                      : `${spotsRemaining} spots remaining.`}
                  </p>
                </>
              )}
            </div>
          </section>

          <section className="mt-6 rounded-xl border border-white/10 bg-black/30 p-5">
            <h2 className="text-xl font-bold">Waiver & Disclaimer</h2>

            <p className="mt-3 text-sm leading-6 text-white/70">
              By registering for and participating in The Trailhead, I
              acknowledge that I am voluntarily attending an automotive
              community event. I understand that attendance and participation
              may involve risks including vehicle damage, personal injury,
              property damage, traffic-related incidents, or other unforeseen
              circumstances.
            </p>

            <p className="mt-3 text-sm leading-6 text-white/70">
              I agree to operate my vehicle safely, follow all applicable laws,
              respect the host property, follow event organizer and host
              instructions, and accept full responsibility for myself, my
              passengers, my vehicle, and my actions.
            </p>

            <p className="mt-3 text-sm leading-6 text-white/70">
              I release Peach State Off-Road & Overlanding, Revolution Auto,
              event organizers, volunteers, vendors, sponsors, property owners,
              and associated parties from liability to the fullest extent
              permitted by law.
            </p>
          </section>

          {success ? (
            <div className="mt-8 rounded-xl border border-green-500/30 bg-green-500/10 p-5">
              <h2 className="text-xl font-bold text-green-300">
                You&apos;re registered!
              </h2>

              <p className="mt-2 text-white/75">
                Thank you for registering for The Trailhead. We look forward to
                seeing you there.
              </p>
            </div>
          ) : isFull ? (
            <div className="mt-8 rounded-xl border border-red-500/30 bg-red-500/10 p-5">
              <h2 className="text-xl font-bold text-red-200">
                Registration is currently full
              </h2>

              <p className="mt-2 text-white/75">
                All available spots for this Trailhead meet have been filled.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <h2 className="text-2xl font-bold">Registration</h2>

              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  label="First Name"
                  value={firstName}
                  onChange={setFirstName}
                  required
                />

                <Field
                  label="Last Name"
                  value={lastName}
                  onChange={setLastName}
                  required
                />
              </div>

              <Field
                label="Phone Number"
                type="tel"
                value={phone}
                onChange={setPhone}
                required
              />

              <Field
                label="Email"
                type="email"
                value={email}
                onChange={setEmail}
                required
              />

              <label className="flex gap-3 rounded-xl border border-white/10 bg-black/30 p-4 text-sm text-white/75">
                <input
                  type="checkbox"
                  checked={waiverAccepted}
                  onChange={(e) => setWaiverAccepted(e.target.checked)}
                  className="mt-1 h-4 w-4"
                  required
                />

                <span>
                  I have read and agree to the waiver and disclaimer above.
                </span>
              </label>

              {error && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3">
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || loadingCount}
                className="w-full rounded-lg bg-[#F28C52] px-5 py-3 font-semibold text-black transition hover:bg-[#C96A2C] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting
                  ? "Submitting..."
                  : "Register for The Trailhead"}
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-white/80">{label}</span>

      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-[#F28C52]"
      />
    </label>
  );
}

function FeatureCard({
  title,
  text,
}: {
  title: string;
  text: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/30 p-4">
      <h3 className="font-bold text-white">{title}</h3>
      <div className="mt-2 text-sm leading-6 text-white/65">{text}</div>
    </div>
  );
}