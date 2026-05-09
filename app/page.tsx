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
  const [notifications, setNotifications] = useState<any[]>([]);

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
    const { data: notificationData } = await supabase
  .from("notifications")
  .select("*")
  .eq("user_id", userId)
  .order("created_at", { ascending: false })
  .limit(5);

setNotifications(notificationData || []);
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
      {notifications.length > 0 && (
  <section className="rounded-2xl border border-[#F28C52]/30 bg-black/40 p-5">
    <h2 className="text-xl font-bold text-white">Notifications</h2>

    <div className="mt-4 space-y-3">
      {notifications.map((notification: any) => (
  <div
    key={notification.id}
    className="rounded-xl border border-white/10 bg-black/40 p-4"
  >
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="font-semibold text-[#F28C52]">
          {notification.title}
        </p>

        <p className="mt-1 text-sm text-gray-300">
          {notification.message}
        </p>
      </div>

      <button
        onClick={async () => {
          await supabase
            .from("notifications")
            .delete()
            .eq("id", notification.id);

          setNotifications((prev) =>
            prev.filter((n) => n.id !== notification.id)
          );
        }}
        className="text-xs text-gray-400 hover:text-red-400"
      >
        Dismiss
      </button>
    </div>
  </div>
))}
    </div>
  </section>
)}
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

      <section className="rounded-2xl border border-[#F28C52]/30 bg-black/40 p-6 shadow-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#F28C52]/80">
          Member Dashboard
        </p>

        <h1 className="mt-3 text-4xl font-bold text-[#F28C52]">
          Trail Hub
        </h1>

        <p className="mt-4 max-w-3xl text-gray-300">
          Your home base for Peach State Off-Road and Overlanding. Jump into
          events, manage your profile, browse member rigs, view ride media, and
          find vendor discounts from one place.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <a
            href="/events"
            className="rounded-xl border border-[#F28C52]/40 bg-[#F28C52] p-5 text-black transition hover:bg-[#C96A2C]"
          >
            <h3 className="text-lg font-bold">Events</h3>
            <p className="mt-2 text-sm">
              RSVP for rides, view upcoming plans, and check event details.
            </p>
          </a>

          <a
            href="/profiles"
            className="rounded-xl border border-white/10 bg-black/40 p-5 transition hover:border-[#F28C52]"
          >
            <h3 className="text-lg font-bold text-[#F28C52]">My Profile</h3>
            <p className="mt-2 text-sm text-gray-400">
              Update your rig, profile photo, location, and build info.
            </p>
          </a>

          <a
            href="/members"
            className="rounded-xl border border-white/10 bg-black/40 p-5 transition hover:border-[#F28C52]"
          >
            <h3 className="text-lg font-bold text-[#F28C52]">Members</h3>
            <p className="mt-2 text-sm text-gray-400">
              Browse other members, rigs, badges, and trail setups.
            </p>
          </a>

          <a
            href="/gallery"
            className="rounded-xl border border-white/10 bg-black/40 p-5 transition hover:border-[#F28C52]"
          >
            <h3 className="text-lg font-bold text-[#F28C52]">Gallery</h3>
            <p className="mt-2 text-sm text-gray-400">
              View photos and videos from past rides and events.
            </p>
          </a>

          <a
            href="/vendors"
            className="rounded-xl border border-white/10 bg-black/40 p-5 transition hover:border-[#F28C52]"
          >
            <h3 className="text-lg font-bold text-[#F28C52]">Vendors</h3>
            <p className="mt-2 text-sm text-gray-400">
              See partner vendors, group discounts, and member benefits.
            </p>
          </a>

          <a
            href="/faq"
            className="rounded-xl border border-white/10 bg-black/40 p-5 transition hover:border-[#F28C52]"
          >
            <h3 className="text-lg font-bold text-[#F28C52]">FAQ</h3>
            <p className="mt-2 text-sm text-gray-400">
              New here? Learn how rides, RSVPs, radios, and trail etiquette work.
            </p>
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
              <div className="mx-auto mt-5 aspect-[4/5] w-full max-w-[380px] overflow-hidden rounded-lg border border-white/10 bg-black shadow-lg">
                <img
                  src={nextEvent.cover_photo_url}
                  alt={nextEvent.title || "Event cover"}
                  className="h-full w-full object-contain"
                />
              </div>
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
                href="/events"
                className="mt-5 inline-block rounded-lg border border-[#F28C52] px-5 py-3 font-semibold text-[#F28C52] hover:bg-[#F28C52] hover:text-black"
              >
                View Event
              </a>
            </div>
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-white">Upcoming Events</h2>
            <p className="mt-1 text-sm text-gray-400">
              A quick look at the next rides on the calendar.
            </p>
          </div>

          <a
            href="/events"
            className="rounded-lg border border-[#F28C52]/70 px-4 py-2 text-sm font-semibold text-[#F28C52] hover:bg-[#F28C52] hover:text-black"
          >
            See All Events
          </a>
        </div>

        {upcomingEvents.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-black/30 p-5">
            <p className="text-gray-400">No upcoming events yet.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {upcomingEvents.map((event) => (
              <a
                key={event.id}
                href="/events"
                className="rounded-xl border border-[#F28C52]/20 bg-black/40 p-4 transition hover:border-[#F28C52]"
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
    </div>
  );
}