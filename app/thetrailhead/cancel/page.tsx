"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function TrailheadCancelPage() {
  const searchParams = useSearchParams();
  const registrationId = searchParams.get("id");

  const [canceling, setCanceling] = useState(false);
  const [canceled, setCanceled] = useState(false);
  const [registrationCode, setRegistrationCode] = useState("");
  const [error, setError] = useState("");

  async function cancelRegistration() {
    if (!registrationId || canceling) return;

    const confirmed = window.confirm(
      "Are you sure you want to cancel your Trailhead registration?"
    );

    if (!confirmed) return;

    setCanceling(true);
    setError("");

    try {
      const response = await fetch("/api/thetrailhead-cancel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          registrationId,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setError(
          data?.error ||
            "Unable to cancel your registration. Please try again."
        );
        setCanceling(false);
        return;
      }

      setRegistrationCode(data?.registrationCode || "");
      setCanceled(true);
      setCanceling(false);
    } catch (cancelError) {
      console.error("Cancellation error:", cancelError);
      setError("Unable to cancel your registration. Please try again.");
      setCanceling(false);
    }
  }

  if (!registrationId) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-12 text-white">
        <section className="rounded-2xl border border-white/10 bg-black/45 p-6 shadow-xl backdrop-blur">
          <h1 className="font-cinzel text-3xl font-bold">
            Cancel Registration
          </h1>

          <p className="mt-4 text-white/75">
            This cancellation link is incomplete or invalid.
          </p>

          <Link
            href="/thetrailhead"
            className="mt-6 inline-block rounded-lg bg-[#F28C52] px-5 py-3 font-semibold text-black transition hover:bg-[#C96A2C]"
          >
            Return to The Trailhead
          </Link>
        </section>
      </main>
    );
  }

  if (canceled) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-12 text-white">
        <section className="rounded-2xl border border-green-500/30 bg-black/45 p-6 shadow-xl backdrop-blur">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#F28C52]">
            The Trailhead
          </p>

          <h1 className="mt-3 font-cinzel text-3xl font-bold">
            Registration Canceled
          </h1>

          <p className="mt-4 leading-7 text-white/75">
            Your Trailhead registration has been canceled and your spot is now
            available for someone else.
          </p>

          {registrationCode && (
            <div className="mt-5 rounded-xl border border-white/10 bg-black/30 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/50">
                Canceled Registration
              </p>
              <p className="mt-1 text-xl font-bold">{registrationCode}</p>
            </div>
          )}

          <p className="mt-5 text-sm text-white/65">
            We also sent a cancellation confirmation to the email address used
            when you registered.
          </p>

          <Link
            href="/thetrailhead"
            className="mt-6 inline-block rounded-lg bg-[#F28C52] px-5 py-3 font-semibold text-black transition hover:bg-[#C96A2C]"
          >
            Return to The Trailhead
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-12 text-white">
      <section className="rounded-2xl border border-white/10 bg-black/45 p-6 shadow-xl backdrop-blur">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#F28C52]">
          The Trailhead
        </p>

        <h1 className="mt-3 font-cinzel text-3xl font-bold">
          Cancel Registration
        </h1>

        <p className="mt-4 leading-7 text-white/75">
          If you can no longer attend The Trailhead, you can cancel your
          registration here. Your spot will immediately be released and made
          available to another attendee.
        </p>

        <div className="mt-6 rounded-xl border border-red-400/20 bg-red-500/10 p-4">
          <p className="text-sm leading-6 text-red-100">
            Canceling is permanent. If you change your mind later, you will
            need to register again and a spot may no longer be available.
          </p>
        </div>

        {error && (
          <div className="mt-5 rounded-lg border border-red-500/30 bg-red-500/10 p-3">
            <p className="text-sm text-red-200">{error}</p>
          </div>
        )}

        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={cancelRegistration}
            disabled={canceling}
            className="rounded-lg bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {canceling ? "Canceling..." : "Cancel My Registration"}
          </button>

          <Link
            href="/thetrailhead"
            className="rounded-lg border border-white/15 bg-white/5 px-5 py-3 text-center font-semibold text-white transition hover:bg-white/10"
          >
            Keep My Registration
          </Link>
        </div>
      </section>
    </main>
  );
}