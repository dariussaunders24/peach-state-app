"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import PastEventCard from "../components/PastEventCard";

const adminEmails = ["dariussaunders24@gmail.com"];

export default function PastEventsPage() {
  const [pastEvents, setPastEvents] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdmin();
    loadPastEvents();
  }, []);

  async function checkAdmin() {
    const { data } = await supabase.auth.getUser();

    if (
      data.user &&
      adminEmails.includes((data.user.email || "").toLowerCase().trim())
    ) {
      setIsAdmin(true);
    }
  }

  async function loadPastEvents() {
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("events")
      .select("*")
      .lt("event_date", now)
      .order("event_date", { ascending: false });

    if (error) {
      console.error("Error loading past events:", error);
      return;
    }

    setPastEvents(data || []);
  }

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-[#F28C52]/30 bg-black/40 p-6">
        <h1 className="text-3xl font-bold text-[#F28C52]">Past Events</h1>

        <p className="mt-3 max-w-3xl text-gray-300">
          Previous Peach State Off-Road and Overlanding rides, campouts, meetups,
          and route archives.
        </p>
      </section>

      <section className="space-y-4">
        {pastEvents.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-black/30 p-5">
            <p className="text-gray-400">No past events yet.</p>
          </div>
        ) : (
          pastEvents.map((event) => (
            <PastEventCard
              key={event.id}
              event={event}
              isAdmin={isAdmin}
            />
          ))
        )}
      </section>
    </div>
  );
}