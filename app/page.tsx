"use client";

import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";

export default function Home() {
  const [nextEvent, setNextEvent] = useState<any>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeStorageKey, setWelcomeStorageKey] = useState("");
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUserAndLoadHome();
  }, []);

  useEffect(() => {
    const dismissed =
      typeof window !== "undefined" &&
      localStorage.getItem("installBannerDismissed") === "true";

    if (!dismissed) {
      setShowInstallBanner(true);
    }
  }, []);

  async function checkUserAndLoadHome() {
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      window.location.href = "/login";
      return;
    }

    const userId = userData.user.id;
    const storageKey = `welcomePanelDismissed:${userId}`;
    setWelcomeStorageKey(storageKey);

    const dismissed =
      typeof window !== "undefined" &&
      localStorage.getItem(storageKey) === "true";

    const { data: profileData } = await supabase
      .from("profiles")
      .select("name, vehicle, location, image_url")
      .eq("user_id", userId)
      .limit(1);

    const profile = profileData?.[0];

    const profileComplete =
      !!profile?.name &&
      !!profile?.vehicle &&
      !!profile?.location &&
      !!profile?.image_url;

    if (profileComplete) {
      localStorage.setItem(storageKey, "true");
      setShowWelcome(false);
    } else {
      setShowWelcome(!dismissed);
    }

    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("events")
      .select("*")
      .gte("event_date", now)
      .order("event_date", { ascending: true })
      .limit(3);

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    setNextEvent(data?.[0] || null);
    setUpcomingEvents(data || []);
    setLoading(false);
  }

  function dismissWelcomePanel() {
    if (welcomeStorageKey) {
      localStorage.setItem(welcomeStorageKey, "true");
    }

    setShowWelcome(false);
  }

  function dismissInstallBanner() {
    localStorage.setItem("installBannerDismissed", "true");
    setShowInstallBanner(false);
  }

  if (loading) {
    return <p className="text-gray-300">Loading home...</p>;
  }

  return (
    <div className="space-y-8">
      {showInstallBanner && (
        <section className="relative rounded-xl border border-[#F28C52]/30 bg-black/40 p-4">
          <button
            onClick={dismissInstallBanner}
            aria-label="Dismiss install banner"
            className="absolute right-3 top-2 text-lg font-bold text-red-400 hover:text-red-300"
          >
            ✕
          </button>

          <p className="pr-6 text-sm leading-6 text-gray-300">
            📲{" "}
            <span className="font-semibold text-[#F28C52]">
              Add this app to your phone:
            </span>{" "}
            iPhone users, open in Safari, tap Share, then Add to Home Screen.
            Android users, open in Chrome, tap the menu, then Add to Home
            Screen.
          </p>
        </section>
      )}

      {showWelcome && (
        <section className="relative rounded-2xl border border-[#F28C52]/40 bg-black/50 p-6 shadow-xl">
          <button
            onClick={dismissWelcomePanel}
            aria-label="Dismiss welcome panel"
            className="absolute right-4 top-4 text-xl font-bold text-red-400 hover:text-red-300"
          >
            ✕
          </button>

          <p className="pr-8 text-xs font-semibold uppercase tracking-[0.3em] text-[#F28C52]/80">
            Start Here
          </p>

          <h1 className="mt-3 pr-8 text-4xl font-bold text-[#F28C52]">
            Welcome to Peach State Off-Road
          </h1>

          <p className="mt-4 max-w-3xl text-gray-300">
            You’re in. Finish setting up your profile and jump into your first
            ride. This helps other members recognize you and your rig on the
            trail.
          </p>

          <div className="mt-6 grid gap-3 md:grid-cols-4">
            <a
              href="/profiles"
              className="rounded-xl bg-[#F28C52] px-5 py-4 text-center font-semibold text-black hover:bg-[#C96A2C]"
            >
              Complete Profile
            </a>

            <a
              href="/events"
              className="rounded-xl border border-[#F28C52] px-5 py-4 text-center font-semibold text-[#F28C52] hover:bg-[#F28C52] hover:text-black"
            >
              View Events
            </a>

            <a
              href="/members"
              className="rounded-xl border border-white/20 px-5 py-4 text-center font-semibold text-white hover:border-[#F28C52] hover:text-[#F28C52]"
            >
              Browse Members
            </a>

            <a
              href="/vendors"
              className="rounded-xl border border-white/20 px-5 py-4 text-center font-semibold text-white hover:border-[#F28C52] hover:text-[#F28C52]"
            >
              Vendor Discounts
            </a>
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-[#F28C52]/30 bg-black/40 p-6">
        <h1 className="mt-3 text-4xl font-bold text-[#F28C52]">
          Welcome to the Trail Hub
        </h1>

        <p className="mt-4 max-w-3xl text-gray-300">
          Find upcoming events, manage your profile, view past events, and stay
          connected with the Peach State Off-Road and Overlanding community.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href="/events"
            className="rounded-lg bg-[#F28C52] px-5 py-3 font-semibold text-black hover:bg-[#C96A2C]"
          >
            View Events
          </a>

          <a
            href="/profiles"
            className="rounded-lg border border-[#F28C52] px-5 py-3 font-semibold text-[#F28C52] hover:bg-[#F28C52] hover:text-black"
          >
            My Profile
          </a>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Next Upcoming Event</h2>

        {!nextEvent ? (
          <div className="rounded-xl border border-white/10 bg-black/30 p-5">
            <p className="text-gray-400">No upcoming events scheduled yet.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-[#F28C52]/30 bg-black/40">
            {nextEvent.cover_photo_url && (
              <img
                src={nextEvent.cover_photo_url}
                alt={nextEvent.title}
                className="h-64 w-full object-cover"
              />
            )}

            <div className="p-6">
              <h3 className="text-2xl font-bold text-[#F28C52]">
                {nextEvent.title}
              </h3>

              {(nextEvent.public_location || nextEvent.location) && (
                <p className="mt-2 text-gray-300">
                  {nextEvent.public_location || nextEvent.location}
                </p>
              )}

              {nextEvent.difficulty && (
                <p className="mt-2 text-sm font-semibold text-[#F28C52]">
                  Difficulty: {nextEvent.difficulty}
                </p>
              )}

              {nextEvent.event_date && (
                <p className="mt-2 text-sm text-gray-400">
                  {new Date(nextEvent.event_date).toLocaleString()}
                </p>
              )}

              <a
                href={`/events/${nextEvent.id}`}
                className="mt-5 inline-block rounded-lg border border-[#F28C52] px-5 py-3 font-semibold text-[#F28C52] hover:bg-[#F28C52] hover:text-black"
              >
                View Event Details
              </a>
            </div>
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Upcoming Events</h2>

        {upcomingEvents.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-black/30 p-5">
            <p className="text-gray-400">No upcoming events yet.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {upcomingEvents.map((event) => (
              <a
                key={event.id}
                href={`/events/${event.id}`}
                className="rounded-xl border border-[#F28C52]/20 bg-black/40 p-4 hover:border-[#F28C52]"
              >
                <h3 className="font-bold text-white">{event.title}</h3>

                {(event.public_location || event.location) && (
                  <p className="mt-1 text-sm text-gray-300">
                    {event.public_location || event.location}
                  </p>
                )}

                {event.event_date && (
                  <p className="mt-2 text-sm text-gray-400">
                    {new Date(event.event_date).toLocaleDateString()}
                  </p>
                )}
              </a>
            ))}
          </div>
        )}
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <a
          href="/events"
          className="rounded-xl border border-white/10 bg-black/30 p-5 hover:border-[#F28C52]"
        >
          <h3 className="font-bold text-[#F28C52]">Events</h3>
          <p className="mt-2 text-sm text-gray-400">RSVP for upcoming events.</p>
        </a>

        <a
          href="/profiles"
          className="rounded-xl border border-white/10 bg-black/30 p-5 hover:border-[#F28C52]"
        >
          <h3 className="font-bold text-[#F28C52]">My Profile</h3>
          <p className="mt-2 text-sm text-gray-400">
            Update your vehicle and info.
          </p>
        </a>

        <a
          href="/gallery"
          className="rounded-xl border border-white/10 bg-black/30 p-5 hover:border-[#F28C52]"
        >
          <h3 className="font-bold text-[#F28C52]">Gallery</h3>
          <p className="mt-2 text-sm text-gray-400">View ride photos.</p>
        </a>

        <a
          href="/vendors"
          className="rounded-xl border border-white/10 bg-black/30 p-5 hover:border-[#F28C52]"
        >
          <h3 className="font-bold text-[#F28C52]">Vendors</h3>
          <p className="mt-2 text-sm text-gray-400">See discounts.</p>
        </a>
      </section>
    </div>
  );
}