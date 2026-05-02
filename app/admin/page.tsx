"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

const adminEmails = ["dariussaunders24@gmail.com"];

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);

  const [memberSearch, setMemberSearch] = useState("");
  const [memberFilter, setMemberFilter] = useState<"all" | "active" | "banned">(
    "all"
  );

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
      .select("*")
      .order("name", { ascending: true });

    const { data: eventData } = await supabase
      .from("events")
      .select("*")
      .order("event_date", { ascending: true });

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
    if (!badgeId) return;

    const badge = badges.find((item) => item.id === badgeId);

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
      return;
    }

    await supabase.from("notifications").insert({
      user_id: userId,
      title: "New Badge Awarded",
      message: `You earned the ${
        badge?.name || "new"
      } badge in Peach State Off-Road and Overlanding!`,
    });

    alert("Badge assigned and member notified.");
    loadData();
  }

  async function removeBadge(memberBadgeId: string) {
    await supabase.from("member_badges").delete().eq("id", memberBadgeId);
    loadData();
  }

  async function toggleBan(member: any) {
    const confirmAction = confirm(
      member.is_banned
        ? "Unban this member?"
        : "Ban this member? They will lose access immediately."
    );

    if (!confirmAction) return;

    const { error } = await supabase
      .from("profiles")
      .update({ is_banned: !member.is_banned })
      .eq("user_id", member.user_id);

    if (error) {
      alert(error.message);
      return;
    }

    loadData();
  }

  const filteredMembers = useMemo(() => {
    const search = memberSearch.toLowerCase().trim();

    return members.filter((member) => {
      const matchesSearch =
        !search ||
        member.name?.toLowerCase().includes(search) ||
        member.vehicle?.toLowerCase().includes(search) ||
        member.location?.toLowerCase().includes(search);

      const matchesFilter =
        memberFilter === "all" ||
        (memberFilter === "active" && !member.is_banned) ||
        (memberFilter === "banned" && member.is_banned);

      return matchesSearch && matchesFilter;
    });
  }, [members, memberSearch, memberFilter]);

  if (!isAdmin) {
    return (
      <div className="p-6 text-white">
        <h1 className="text-2xl font-bold">Admin Only</h1>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-[#F28C52]">Admin Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Members" value={members.length} />
        <StatCard
          label="Active Members"
          value={members.filter((member) => !member.is_banned).length}
        />
        <StatCard
          label="Banned Members"
          value={members.filter((member) => member.is_banned).length}
        />
      </div>

      <div className="rounded-xl border border-white/10 bg-black/30 p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Members</h2>
            <p className="mt-1 text-sm text-white/50">
              Search, filter, assign badges, and manage access.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
              placeholder="Search members..."
              className="rounded-lg border border-white/20 bg-white px-3 py-2 text-sm text-black placeholder-gray-500"
            />

            <select
              value={memberFilter}
              onChange={(e) =>
                setMemberFilter(e.target.value as "all" | "active" | "banned")
              }
              className="rounded-lg border border-white/20 bg-white px-3 py-2 text-sm text-black"
            >
              <option value="all">All Members</option>
              <option value="active">Active Only</option>
              <option value="banned">Banned Only</option>
            </select>
          </div>
        </div>

        <div className="mt-4 text-sm text-white/50">
          Showing {filteredMembers.length} of {members.length} members
        </div>

        <div className="mt-4 space-y-4">
          {filteredMembers.length === 0 ? (
            <div className="rounded-lg border border-white/10 bg-black/40 p-4 text-white/60">
              No members match your search/filter.
            </div>
          ) : (
            filteredMembers.map((member) => (
              <div
                key={member.user_id}
                className="rounded-lg border border-white/10 bg-black/40 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-white">
                        {member.name || "Unnamed"}
                      </span>

                      {member.is_banned && (
                        <span className="rounded bg-red-500/20 px-2 py-1 text-xs font-semibold text-red-300">
                          BANNED
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-sm text-white/60">
                      {member.vehicle || "Vehicle not listed"}
                    </p>

                    <p className="text-sm text-white/40">
                      {member.location || "Location not listed"}
                    </p>
                  </div>

                  <a
                    href={`/members/${member.user_id}`}
                    className="text-sm font-semibold text-[#F28C52]"
                  >
                    View Profile
                  </a>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    onClick={() => toggleBan(member)}
                    className={`rounded px-3 py-2 text-sm font-semibold text-white ${
                      member.is_banned
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-red-600 hover:bg-red-700"
                    }`}
                  >
                    {member.is_banned ? "Unban Member" : "Ban Member"}
                  </button>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {member.memberBadges.map((b: any) => (
                    <div
                      key={b.id}
                      className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-2 py-1"
                    >
                      {b.badges?.image_url ? (
                        <img
                          src={b.badges.image_url}
                          alt={b.badges?.name || "Badge"}
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

                <div className="mt-4 flex gap-2">
                  <select
                    className="rounded bg-white p-2 text-black"
                    defaultValue=""
                    onChange={(e) => assignBadge(member.user_id, e.target.value)}
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
            ))
          )}
        </div>
      </div>

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
                {event.event_date
                  ? new Date(event.event_date).toLocaleDateString()
                  : "No date"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-white/50">
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold text-[#F28C52]">{value}</p>
    </div>
  );
}