"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const CAPACITY = 200;

export default function RigsForRiggsPage() {
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

  async function loadRegistrationCount() {
    const { count, error } = await supabase
      .from("rigs_for_riggs_registrations")
      .select("*", { count: "exact", head: true });

    if (error) {
      console.error("Registration count error:", error.message);
    }

    setRegistrationCount(count || 0);
    setLoadingCount(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    await loadRegistrationCount();

    if (registrationCount >= CAPACITY) {
      setError("Registration is currently full.");
      setSubmitting(false);
      return;
    }

    if (!waiverAccepted) {
      setError("You must accept the waiver before registering.");
      setSubmitting(false);
      return;
    }

    const { error } = await supabase
      .from("rigs_for_riggs_registrations")
      .insert({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        waiver_accepted: waiverAccepted,
      });

    if (error) {
      console.error(error.message);
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
      return;
    }

    setRegistrationCount((current) => current + 1);
    setSuccess(true);
    setSubmitting(false);
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 text-white">
      <section className="overflow-hidden rounded-2xl border border-white/10 bg-black/45 shadow-xl backdrop-blur">
      <div className="flex justify-center bg-black/20 p-6">
  <img
    src="/rigs-for-riggs.png"
    alt="Rigs for Riggs event flyer"
    className="h-auto w-full max-w-2xl rounded-xl object-contain"
  />
</div>

        <div className="p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-[#F28C52]/80">
            Community Parade Registration
          </p>

          <h1 className="mt-3 font-cinzel text-4xl font-bold text-white">
            Rigs for Riggs
          </h1>

          <section className="mt-6 rounded-xl border border-white/10 bg-black/30 p-5">
            <h2 className="text-xl font-bold">Event Details</h2>

            <div className="mt-1 space-y-2 text-white/75">
              
            </div>

            <p className="mt-4 text-white/75">
              <div className="whitespace-pre-line leading-8 text-white/75">
{`EVENT UPDATE: We wanted to share an important update regarding the Rigs for Riggs drive-by event.
With heavy hearts, we are saddened to share that Riggs recently passed away surrounded by the love of his family. While this is not the outcome any of us hoped for, Riggs' family has asked that we still come together as planned to celebrate his life, support their family, and bring some excitement to his big brother during this difficult time.

- Donations for the family can be made here, otherwise, you donations (no oversized toys or riding toys), can be donated at the check-in locations. Roy donations will be distributed to various child organizations.
- Decorations: No birthday decorations, but "In loving memory of Riggs" signage is okay if anyone wants to show support.
- Noise: We encourage drivers not to use their vehicle volume excessively, but mild honking/revving is now okay.
- Please contact event coordinators directly if you have any other questions.


Date: Saturday, June 28, 2026

Arrival & Check-In: 12:30 PM

Driver Meeting (Required): 1:15PM

Vehicle Roll-Out: 1:45PM

Parade Start: 2:00 PM

Meet-Up Location:

Appalachian Gun, Pawn & Range
140 Shelby Lane
Jasper, GA 30143

Overflow parking will be available at the trailer store across from the main parking area if needed. Please follow parking attendants and organizer instructions upon arrival.

ABOUT THE EVENT

The family has just been approved for a GoFund Me. Please donate whatever you can. Every little bit helps:
https://www.gofundme.com/f/remembering-riggs-help-the-grooms-family-heal

Riggs is a 4-year-old boy who has been diagnosed with terminal cancer, but who also loves big off-road vehicles and all things automotive. Join us as we come together to create a special birthday parade and an unforgettable day for Riggs and his family.

On Saturday, June 27, we will come together as a community to create a special birthday parade for Riggs and his family. Whether you drive a lifted truck, Jeep, Bronco, SUV, overland rig, or other unique vehicle, your participation can help create lasting memories for a very special little boy.

Participants are encouraged to bring positive energy, decorate their vehicles if desired, and help make this an unforgettable experience.

Video birthday wishes for Riggs are welcome and appreciated.

PARTICIPANT GUIDELINES

To help ensure a safe and enjoyable experience for Riggs and his family, all participants must follow these guidelines:

• No contact parade
• Gift and donation drop-off locations available
• No revving engines
• No horn use
• No sirens
• No flashing lights or strobes
• Maintain idle speed
• Follow organizer instructions
• Be mindful of Riggs' medical condition and noise sensitivities
• No riding toys, Power Wheels, or similar vehicles

DONATIONS

Participation is free.

In lieu of gifts, cash donations are preferred. Digital donations are also welcome. Donation information and QR code available on the flyer.

IMPORTANT INFORMATION

• GMRS radios on channel 4
• All participating vehicles must be street legal
• All participating vehicles must carry valid insurance
• Drivers are responsible for obeying all traffic laws
• Attendance at the driver meeting is required
• No press or media attendance is requested
• Please respect the privacy of Riggs and his family
• Follow all directions provided by event organizers and volunteers`}
</div>

            </p>

            <p className="mt-4 text-white/75">
              Please register below if you would like to participate. Registration is per individual vehicle, not person or club. 
            </p>

            <div className="mt-5 rounded-xl border border-[#F28C52]/25 bg-[#F28C52]/10 p-4">
              {loadingCount ? (
                <p className="font-semibold text-white/80">
                  Loading registration count...
                </p>
              ) : (
                <>
                  <p className="text-lg font-bold text-white">
                    {registrationCount} of {CAPACITY} Vehicle Spots Filled
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
              By registering for and participating in this event, I acknowledge
              that I am voluntarily participating in a vehicle parade/community
              event. I understand that participation may involve risks including
              vehicle damage, personal injury, property damage, traffic-related
              incidents, or other unforeseen circumstances. I agree that my vehicle is street legal and legally insured and I agree to operate
              my vehicle safely, follow all traffic laws, follow event organizer
              instructions, and accept full responsibility for myself, my
              passengers, my vehicle, and my actions. I release the event
              organizers, volunteers, hosts, property owners, and any associated
              parties from liability to the fullest extent permitted by law.
            </p>
          </section>

          {success ? (
            <div className="mt-8 rounded-xl border border-green-500/30 bg-green-500/10 p-5">
              <h2 className="text-xl font-bold text-green-300">
                Registration received
              </h2>
              <p className="mt-2 text-white/75">
                Thank you for registering for Rigs for Riggs.
              </p>
            </div>
          ) : isFull ? (
            <div className="mt-8 rounded-xl border border-red-500/30 bg-red-500/10 p-5">
              <h2 className="text-xl font-bold text-red-200">
                Registration is currently full
              </h2>
              <p className="mt-2 text-white/75">
                All available vehicle spots have been filled.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
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

              {error && <p className="text-sm text-red-300">{error}</p>}

              <button
                type="submit"
                disabled={submitting || loadingCount}
                className="w-full rounded-lg bg-[#F28C52] px-5 py-3 font-semibold text-black transition hover:bg-[#C96A2C] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Submitting..." : "Register my vehicle for Rigs for Riggs"}
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
        className="mt-2 w-full rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[#F28C52]"
      />
    </label>
  );
}