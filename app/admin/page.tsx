"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const adminEmails = ["dariussaunders24@gmail.com"];

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);

  useEffect(() => {
    checkAdmin();
  }, []);

  async function checkAdmin() {
    const { data } = await supabase.auth.getUser();

    if (
      data.user &&
      adminEmails.includes((data.user.email || "").toLowerCase().trim())
    ) {
      setIsAdmin(true);
      loadData();
    }
  }

  async function loadData() {
    const { data: memberData } = await supabase
      .from("profiles")
      .select("*");

    const { data: eventData } = await supabase.from("events").select("*");

    const { data: badgeData } = await supabase.from("badges").select("*");

    const membersWithBadges = await Promise.all(
      (memberData || []).map(async (member) => {
        const { data: memberBadges } = await supabase
          .from("member_badges")
          .select("id, badge_id, badges(name, image_url)")
          .eq("user_id", member.user_id);

        return {
          ...member,
          memberBadges: memberBadges || [],
        };
      })
    );

    setMembers(membersWithBadges);
    setEvents(eventData || []);
    setBadges(badgeData || []);
  }

  async function assignBadge(userId: string, badgeId: string) {
    const { error } = await supabase.from("member_badges").insert({
      user_id: userId,
      badge_id: badgeId,
    });

    if (error) {
      if (error.message.includes("duplicate")) {
        alert("Badge already assigned");
      } else {
        alert(error.message);
      }
    }

    loadData();
  }

  async function removeBadge(memberBadgeId: string) {
    await supabase
      .from("member_badges")
      .delete()
      .eq("id", memberBadgeId);

    loadData();
  }

  if (!isAdmin) {
    return (
      <div className="p-6 text-white">
        <h1 className="text-2xl font-bold">Admin Only</h1>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-[#F28C52]">
        Admin Dashboard
      </h1>

      {/* Members */}
      <div className="rounded-xl border border-white/10 bg-black/30 p-4">
        <h2 className="text-xl font-bold text-white">Members</h2>

        <div className="mt-4 space-y-4">
          {members.map((member) => (
            <div
              key={member.user_id}
              className="rounded-lg border border-white/10 bg-black/40 p-4"
            >
              <div className="flex justify-between">
                <span className="text-white font-semibold">
                  {member.name || "Unnamed"}
                </span>

                <a
                  href={`/members/${member.user_id}`}
                  className="text-sm text-[#F28C52]"
                >
                  View Profile
                </a>
              </div>

              {/* Current Badges */}
              <div className="mt-3 flex flex-wrap gap-2">
                {member.memberBadges.map((b: any) => (
                  <div
                    key={b.id}
                    className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-2 py-1"
                  >
                    {b.badges?.image_url ? (
                      <img
                        src={b.badges.image_url}
                        className="h-6 w-6 rounded"
                      />
                    ) : (
                      <span>★</span>
                    )}

                    <span className="text-sm text-white">
                      {b.badges?.name}
                    </span>

                    <button
                      onClick={() => removeBadge(b.id)}
                      className="text-xs text-red-400"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              {/* Assign Badge */}
              <div className="mt-3 flex gap-2">
                <select
                  className="rounded bg-white p-2 text-black"
                  onChange={(e) =>
                    assignBadge(member.user_id, e.target.value)
                  }
                >
                  <option value="">Assign badge</option>
                  {badges.map((badge) => (
                    <option key={badge.id} value={badge.id}>
                      {badge.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Events */}
      <div className="rounded-xl border border-white/10 bg-black/30 p-4">
        <h2 className="text-xl font-bold text-white">Events</h2>

        <div className="mt-4 space-y-2">
          {events.map((event) => (
            <div
              key={event.id}
              className="flex justify-between rounded-lg border border-white/10 bg-black/40 p-3"
            >
              <span className="text-white">{event.title}</span>

              <span className="text-sm text-gray-400">
                {new Date(event.event_date).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}