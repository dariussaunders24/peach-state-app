"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { supabase } from "../lib/supabase";

const adminEmails = ["dariussaunders24@gmail.com"];

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);

  const [memberSearch, setMemberSearch] = useState("");
  const [memberFilter, setMemberFilter] = useState<
    "all" | "active" | "banned"
  >("all");

  useEffect(() => {
    checkAdmin();
  }, []);

  async function checkAdmin() {
    const { data } = await supabase.auth.getUser();

    if (
      data.user &&
      adminEmails.includes(
        (data.user.email || "").toLowerCase().trim()
      )
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

    const { data: badgeData } = await supabase
      .from("badges")
      .select("*");

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

    const { error } = await supabase
      .from("member_badges")
      .insert({
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

    const emailResponse = await fetch(
      "/api/badge-awarded-email",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          badgeName: badge?.name || "new",
        }),
      }
    );

    const emailResult = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error("Badge email error:", emailResult);
    }

    alert("Badge assigned and member notified.");
    loadData();
  }

  async function removeBadge(memberBadgeId: string) {
    await supabase
      .from("member_badges")
      .delete()
      .eq("id", memberBadgeId);

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
      <h1 className="text-3xl font-bold text-[#F28C52]">
        Admin Dashboard
      </h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Members" value={members.length} />

        <StatCard
          label="Active Members"
          value={
            members.filter((member) => !member.is_banned).length
          }
        />

        <StatCard
          label="Banned Members"
          value={
            members.filter((member) => member.is_banned).length
          }
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <a
          href="/admin/thetrailhead"
          className="rounded-xl border border-white/10 bg-black/30 p-5 transition hover:border-[#F28C52]/60"
        >
          <h2 className="text-xl font-bold text-white">
            Trailhead Management
          </h2>

          <p className="mt-2 text-sm text-white/60">
            Manage the next Trailhead meet, event details,
            location, announcements, and public Trailhead
            content.
          </p>
        </a>

        <a
          href="/admin/resources"
          className="rounded-xl border border-white/10 bg-black/30 p-5 transition hover:border-[#F28C52]/60"
        >
          <h2 className="text-xl font-bold text-white">
            Training Resources
          </h2>

          <p className="mt-2 text-sm text-white/60">
            Create and manage blogs, videos, guides, and
            beginner training content.
          </p>
        </a>

        <a
          href="/admin/email-blast"
          className="rounded-xl border border-white/10 bg-black/30 p-5 transition hover:border-[#F28C52]/60"
        >
          <h2 className="text-xl font-bold text-white">
            Email Blast
          </h2>

          <p className="mt-2 text-sm text-white/60">
            Send announcements and updates to registered
            Peach State members.
          </p>
        </a>
      </div>

      <StewardshipManagement />

      <div className="rounded-xl border border-white/10 bg-black/30 p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">
              Members
            </h2>

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
                setMemberFilter(
                  e.target.value as "all" | "active" | "banned"
                )
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
          Showing {filteredMembers.length} of {members.length}{" "}
          members
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
                    {member.is_banned
                      ? "Unban Member"
                      : "Ban Member"}
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
                    onChange={(e) =>
                      assignBadge(
                        member.user_id,
                        e.target.value
                      )
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
            ))
          )}
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-black/30 p-4">
        <h2 className="text-xl font-bold text-white">
          Events
        </h2>

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

function StatCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-white/50">
        {label}
      </p>

      <p className="mt-2 text-3xl font-bold text-[#F28C52]">
        {value}
      </p>
    </div>
  );
}

const STEWARDSHIP_CHANGED_EVENT = "pso:stewardship-updated";
const STEWARDSHIP_STORAGE_KEY = "pso:stewardship-updated";

type StewardshipTotals = {
  trash_lbs: number | null;
  tires_removed: number | null;
  volunteer_hours: number | null;
  miles_cleaned: number | null;
};

type StewardshipCleanup = StewardshipTotals & {
  id: string;
  cleanup_date: string;
  title: string;
  location: string | null;
  notes: string | null;
  created_at: string;
};

type StewardshipForm = {
  cleanup_date: string;
  title: string;
  location: string;
  trash_lbs: string;
  tires_removed: string;
  volunteer_hours: string;
  miles_cleaned: string;
  notes: string;
};

const metricFields = [
  {
    key: "trash_lbs",
    label: "Pounds of trash removed",
    step: "0.01",
  },
  {
    key: "tires_removed",
    label: "Tires removed",
    step: "1",
  },
  {
    key: "volunteer_hours",
    label: "Hours volunteered",
    step: "0.01",
  },
  {
    key: "miles_cleaned",
    label: "Miles cleaned",
    step: "0.01",
  },
] as const;

function formatStewardshipNumber(
  value: number | null | undefined
) {
  if (
    value === null ||
    value === undefined ||
    !Number.isFinite(value)
  ) {
    return "—";
  }

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(value);
}

function todayInEasternTime() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const get = (type: string) =>
    parts.find((part) => part.type === type)?.value || "";

  return `${get("year")}-${get("month")}-${get("day")}`;
}

function emptyStewardshipForm(): StewardshipForm {
  return {
    cleanup_date: todayInEasternTime(),
    title: "",
    location: "",
    trash_lbs: "",
    tires_removed: "",
    volunteer_hours: "",
    miles_cleaned: "",
    notes: "",
  };
}

function cleanupToForm(
  row: StewardshipCleanup
): StewardshipForm {
  const metric = (value: number | null) =>
    value === null ? "" : String(value);

  return {
    cleanup_date: row.cleanup_date,
    title: row.title,
    location: row.location || "",
    trash_lbs: metric(row.trash_lbs),
    tires_removed: metric(row.tires_removed),
    volunteer_hours: metric(row.volunteer_hours),
    miles_cleaned: metric(row.miles_cleaned),
    notes: row.notes || "",
  };
}

function parseStewardshipForm(form: StewardshipForm) {
  const title = form.title.trim();

  if (!title || title.length > 160) {
    throw new Error(
      "Enter a cleanup name of 160 characters or fewer."
    );
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(form.cleanup_date)) {
    throw new Error("Choose a cleanup date.");
  }

  const date = new Date(`${form.cleanup_date}T12:00:00Z`);

  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== form.cleanup_date
  ) {
    throw new Error("Choose a valid cleanup date.");
  }

  if (form.location.trim().length > 240) {
    throw new Error(
      "Keep the location to 240 characters or fewer."
    );
  }

  if (form.notes.trim().length > 2000) {
    throw new Error(
      "Keep the notes to 2,000 characters or fewer."
    );
  }

  const totals: StewardshipTotals = {
    trash_lbs: null,
    tires_removed: null,
    volunteer_hours: null,
    miles_cleaned: null,
  };

  for (const field of metricFields) {
    const text = form[field.key].trim();

    if (text === "") continue;

    const value = Number(text);

    if (!Number.isFinite(value) || value < 0) {
      throw new Error(
        `${field.label} must be zero or greater.`
      );
    }

    if (field.key === "tires_removed") {
      if (
        !Number.isInteger(value) ||
        value > 2147483647
      ) {
        throw new Error(
          "Enter a whole number for tires removed."
        );
      }
    } else {
      if (value > 9999999999.99) {
        throw new Error(`${field.label} is too large.`);
      }

      const rounded = Math.round(value * 100) / 100;

      if (
        Math.abs(value - rounded) >
        Number.EPSILON * Math.abs(value) * 2
      ) {
        throw new Error(
          `${field.label} must have no more than two decimal places.`
        );
      }
    }

    totals[field.key] = value;
  }

  if (
    Object.values(totals).every(
      (value) => value === null
    )
  ) {
    throw new Error("Enter at least one cleanup measurement.");
  }

  return {
    cleanup_date: form.cleanup_date,
    title,
    location: form.location.trim() || null,
    notes: form.notes.trim() || null,
    ...totals,
  };
}

function announceStewardshipChange() {
  window.dispatchEvent(
    new Event(STEWARDSHIP_CHANGED_EVENT)
  );

  try {
    window.localStorage.setItem(
      STEWARDSHIP_STORAGE_KEY,
      String(Date.now())
    );
  } catch {
    // Regular refreshes still update other tabs
    // when browser storage is unavailable.
  }
}

const PAGE_SIZE = 25;

const inputClass =
  "mt-1 w-full rounded-lg border border-[#F28C52]/25 bg-black/40 px-3 py-2 text-white focus:border-[#F28C52] focus:outline-none focus:ring-1 focus:ring-[#F28C52]";

const secondaryClass =
  "rounded-lg border border-[#F28C52]/30 px-4 py-2 text-sm text-[#F28C52] hover:bg-[#F28C52]/10 disabled:opacity-50";

function message(error: unknown) {
  if (error instanceof Error) return error.message;

  if (
    error &&
    typeof error === "object" &&
    "message" in error
  ) {
    return String(error.message);
  }

  return "Please try again.";
}

function dateLabel(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T12:00:00Z`));
}

function StewardshipManagement() {
  const [form, setForm] =
    useState<StewardshipForm>(emptyStewardshipForm);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [entries, setEntries] =
    useState<StewardshipCleanup[]>([]);

  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const request = useRef(0);

  const loadEntries = useCallback(async () => {
    const currentRequest = ++request.current;
    setLoading(true);

    try {
      const start = (page - 1) * PAGE_SIZE;

      const {
        data,
        count: total,
        error: loadError,
      } = await supabase
        .from("stewardship_cleanups")
        .select(
          "id,cleanup_date,title,location,trash_lbs,tires_removed,volunteer_hours,miles_cleaned,notes,created_at",
          { count: "exact" }
        )
        .order("cleanup_date", { ascending: false })
        .order("created_at", { ascending: false })
        .order("id", { ascending: false })
        .range(start, start + PAGE_SIZE - 1);

      if (loadError) throw loadError;
      if (currentRequest !== request.current) return;

      const totalCount = total || 0;
      const lastPage = Math.max(
        1,
        Math.ceil(totalCount / PAGE_SIZE)
      );

      if (page > lastPage) {
        setPage(lastPage);
        return;
      }

      setEntries((data || []) as StewardshipCleanup[]);
      setCount(totalCount);
    } catch (problem) {
      if (currentRequest === request.current) {
        setError(
          `Could not load cleanups. ${message(problem)}`
        );
      }
    } finally {
      if (currentRequest === request.current) {
        setLoading(false);
      }
    }
  }, [page]);

  useEffect(() => {
    void loadEntries();

    return () => {
      request.current += 1;
    };
  }, [loadEntries]);

  function updateField<K extends keyof StewardshipForm>(
    key: K,
    value: StewardshipForm[K]
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyStewardshipForm());
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (saving || deletingId) return;

    setError("");
    setNotice("");

    let payload: ReturnType<typeof parseStewardshipForm>;

    try {
      payload = parseStewardshipForm(form);
    } catch (problem) {
      setError(message(problem));
      return;
    }

    setSaving(true);

    try {
      const result = editingId
        ? await supabase
            .from("stewardship_cleanups")
            .update(payload)
            .eq("id", editingId)
            .select("id")
            .single()
        : await supabase
            .from("stewardship_cleanups")
            .insert(payload)
            .select("id")
            .single();

      if (result.error) throw result.error;

      announceStewardshipChange();

      setNotice(
        editingId ? "Cleanup updated." : "Cleanup added."
      );

      resetForm();

      if (page !== 1) {
        setPage(1);
      } else {
        await loadEntries();
      }
    } catch (problem) {
      setError(
        `Could not save the cleanup. ${message(problem)}`
      );
    } finally {
      setSaving(false);
    }
  }

  async function remove(row: StewardshipCleanup) {
    if (saving || deletingId) return;

    if (
      !window.confirm(
        `Delete "${row.title}" and remove its measurements from the tracker totals?`
      )
    ) {
      return;
    }

    setDeletingId(row.id);
    setError("");
    setNotice("");

    try {
      const { error: deleteError } = await supabase
        .from("stewardship_cleanups")
        .delete()
        .eq("id", row.id)
        .select("id")
        .single();

      if (deleteError) throw deleteError;

      if (editingId === row.id) resetForm();

      announceStewardshipChange();
      setNotice("Cleanup deleted.");

      await loadEntries();
    } catch (problem) {
      setError(
        `Could not delete the cleanup. ${message(problem)}`
      );
    } finally {
      setDeletingId(null);
    }
  }

  const busy = saving || deletingId !== null;
  const pageCount = Math.max(
    1,
    Math.ceil(count / PAGE_SIZE)
  );

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-[#F28C52]">
            Stewardship Impact
          </h2>

          <p className="mt-1 text-sm text-gray-300">
            Record each cleanup once. Its measurements are
            added to the totals across the app.
          </p>
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-lg border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-200"
        >
          {error}
        </p>
      )}

      {notice && (
        <p
          role="status"
          className="rounded-lg border border-green-400/30 bg-green-400/10 p-3 text-sm text-green-200"
        >
          {notice}
        </p>
      )}

      <form
        onSubmit={save}
        className="rounded-2xl border border-[#F28C52]/25 bg-black/30 p-4 sm:p-6"
      >
        <h2 className="mb-4 text-lg font-semibold text-[#F28C52]">
          {editingId ? "Edit cleanup" : "Add a cleanup"}
        </h2>

        <fieldset
          disabled={busy}
          className="grid min-w-0 gap-4 sm:grid-cols-2"
        >
          <label
            className="text-sm text-gray-200"
            htmlFor="cleanup-date"
          >
            Cleanup date
            <input
              id="cleanup-date"
              type="date"
              required
              value={form.cleanup_date}
              onChange={(event) =>
                updateField(
                  "cleanup_date",
                  event.target.value
                )
              }
              className={inputClass}
            />
          </label>

          <label
            className="text-sm text-gray-200"
            htmlFor="cleanup-title"
          >
            Cleanup name
            <input
              id="cleanup-title"
              type="text"
              required
              maxLength={160}
              value={form.title}
              onChange={(event) =>
                updateField("title", event.target.value)
              }
              className={inputClass}
            />
          </label>

          <label
            className="text-sm text-gray-200 sm:col-span-2"
            htmlFor="cleanup-location"
          >
            Location (optional)
            <input
              id="cleanup-location"
              type="text"
              maxLength={240}
              value={form.location}
              onChange={(event) =>
                updateField(
                  "location",
                  event.target.value
                )
              }
              className={inputClass}
            />
          </label>

          {metricFields.map((field) => (
            <label
              key={field.key}
              className="text-sm text-gray-200"
              htmlFor={`cleanup-${field.key}`}
            >
              {field.label}
              <input
                id={`cleanup-${field.key}`}
                type="number"
                inputMode={
                  field.key === "tires_removed"
                    ? "numeric"
                    : "decimal"
                }
                min="0"
                step={field.step}
                value={form[field.key]}
                onChange={(event) =>
                  updateField(
                    field.key,
                    event.target.value
                  )
                }
                className={inputClass}
                aria-describedby="cleanup-measurement-help"
              />
            </label>
          ))}

          <div
            id="cleanup-measurement-help"
            className="space-y-1 text-xs text-gray-300 sm:col-span-2"
          >
            <p>
              Hours: enter the combined volunteer time.
              Ten people working three hours equals 30 hours.
            </p>
            <p>
              Miles: count the road or trail distance once
              per cleanup.
            </p>
            <p>
              Leave a measurement blank if it is not
              recorded. Use 0 when you know the count is zero.
            </p>
          </div>

          <label
            className="text-sm text-gray-200 sm:col-span-2"
            htmlFor="cleanup-notes"
          >
            Notes (optional)
            <textarea
              id="cleanup-notes"
              rows={3}
              maxLength={2000}
              value={form.notes}
              onChange={(event) =>
                updateField("notes", event.target.value)
              }
              className={inputClass}
              placeholder="For example: approximate weight, partners, or items collected."
            />
          </label>

          <div className="flex flex-wrap gap-3 sm:col-span-2">
            <button
              type="submit"
              disabled={busy}
              className="rounded-lg bg-[#F28C52] px-5 py-2 font-semibold text-black hover:bg-[#f5a271] disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : editingId
                  ? "Save changes"
                  : "Add cleanup"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                disabled={busy}
                className={secondaryClass}
              >
                Cancel editing
              </button>
            )}
          </div>
        </fieldset>
      </form>

      <section
        className="rounded-2xl border border-[#F28C52]/25 bg-black/30 p-4 sm:p-6"
        aria-label="Recorded cleanups"
      >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-[#F28C52]">
            Recorded cleanups ({count})
          </h2>

          <button
            type="button"
            disabled={loading || busy}
            onClick={() => {
              setError("");
              void loadEntries();
            }}
            className={secondaryClass}
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {!loading && entries.length === 0 ? (
          <p className="text-sm text-gray-300">
            No cleanups have been entered yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-gray-300">
                <tr>
                  <th className="px-2 py-3 font-medium">
                    Cleanup
                  </th>
                  <th className="px-2 py-3 text-right font-medium">
                    LBS
                  </th>
                  <th className="px-2 py-3 text-right font-medium">
                    Tires
                  </th>
                  <th className="px-2 py-3 text-right font-medium">
                    Hours
                  </th>
                  <th className="px-2 py-3 text-right font-medium">
                    Miles
                  </th>
                  <th className="px-2 py-3 font-medium">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {entries.map((row) => (
                  <tr
                    key={row.id}
                    className="border-t border-white/10 align-top"
                  >
                    <td className="min-w-48 px-2 py-3">
                      <div className="font-semibold text-white">
                        {row.title}
                      </div>

                      <div className="text-xs text-gray-400">
                        {dateLabel(row.cleanup_date)}
                        {row.location
                          ? ` · ${row.location}`
                          : ""}
                      </div>
                    </td>

                    <td
                      className="px-2 py-3 text-right tabular-nums"
                      style={{ color: "#ffffff" }}
                    >
                      {formatStewardshipNumber(
                        row.trash_lbs
                      )}
                    </td>

                    <td
                      className="px-2 py-3 text-right tabular-nums"
                      style={{ color: "#ffffff" }}
                    >
                      {formatStewardshipNumber(
                        row.tires_removed
                      )}
                    </td>

                    <td
                      className="px-2 py-3 text-right tabular-nums"
                      style={{ color: "#ffffff" }}
                    >
                      {formatStewardshipNumber(
                        row.volunteer_hours
                      )}
                    </td>

                    <td
                      className="px-2 py-3 text-right tabular-nums"
                      style={{ color: "#ffffff" }}
                    >
                      {formatStewardshipNumber(
                        row.miles_cleaned
                      )}
                    </td>

                    <td className="px-2 py-3">
                      <div className="flex gap-3">
                        <button
                          type="button"
                          disabled={busy || loading}
                          className="text-[#F28C52] underline disabled:opacity-50"
                          onClick={() => {
                            setEditingId(row.id);
                            setForm(cleanupToForm(row));
                            setError("");
                            setNotice("");

                            window.scrollTo({
                              top: 0,
                              behavior: "smooth",
                            });
                          }}
                          aria-label={`Edit ${row.title}`}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          disabled={busy || loading}
                          className="text-red-300 underline disabled:opacity-50"
                          onClick={() => void remove(row)}
                          aria-label={`Delete ${row.title}`}
                        >
                          {deletingId === row.id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pageCount > 1 && (
          <div className="mt-4 flex items-center justify-between gap-3">
            <button
              type="button"
              className={secondaryClass}
              disabled={page === 1 || loading || busy}
              onClick={() =>
                setPage((value) => value - 1)
              }
            >
              Previous
            </button>

            <span className="text-xs text-gray-300">
              Page {page} of {pageCount}
            </span>

            <button
              type="button"
              className={secondaryClass}
              disabled={
                page === pageCount || loading || busy
              }
              onClick={() =>
                setPage((value) => value + 1)
              }
            >
              Next
            </button>
          </div>
        )}
      </section>
    </section>
  );
}