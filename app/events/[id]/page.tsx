"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../lib/supabase";
import CanIRunThis from "../../components/CanIRunThis";

const adminEmails = ["dariussaunders24@gmail.com"];

const defaultDisclaimer =
  "By RSVP’ing to this event, you accept any and all risk for vehicle damage, personal injury, recovery needs, or liability. Peach State Off-Road and Overlanding and its organizers are not liable. No-shows without canceling your RSVP at least 24 hours before the event will result in a (1) ride ban. This is so we can ensure maximum enjoyment and available spots for all members who want to attend.";

export default function EventDetailPage() {
  const params = useParams();
  const eventId = params.id as string;

  const [event, setEvent] = useState<any>(null);
  const [routes, setRoutes] = useState<any[]>([]);
  const [attendees, setAttendees] = useState<any[]>([]);
  const [waitlist, setWaitlist] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [userStatus, setUserStatus] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [canManageAttendance, setCanManageAttendance] = useState(false);

  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState("");
  const [replyText, setReplyText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState("");
  const [editText, setEditText] = useState("");

  useEffect(() => {
    if (eventId) loadPage();
  }, [eventId]);

  async function loadPage() {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    const userId = user?.id || "";

    setCurrentUserId(userId);

    const userIsAdmin = adminEmails.includes(
      (user?.email || "").toLowerCase().trim()
    );

    setIsAdmin(userIsAdmin);

    let userIsRideCaptain = false;

    if (userId) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("public_role")
        .eq("user_id", userId)
        .maybeSingle();

      userIsRideCaptain =
        (profile?.public_role || "").trim().toLowerCase() === "ride captain";
    }

    setCanManageAttendance(userIsAdmin || userIsRideCaptain);

    const { data: eventData, error } = await supabase
      .from("events")
      .select("*")
      .eq("id", eventId)
      .single();

    if (error) {
      alert(error.message);
      return;
    }

    const { data: rsvps } = await supabase
      .from("rsvps")
      .select("id, user_id, status, created_at, checked_in")
      .eq("event_id", eventId)
      .order("created_at", { ascending: true });

    const peopleWithNames = await Promise.all(
      (rsvps || []).map(async (rsvpItem) => {
        const { data: profile } = await supabase
          .from("profiles")
          .select("name")
          .eq("user_id", rsvpItem.user_id)
          .maybeSingle();

        return {
          id: rsvpItem.id,
          user_id: rsvpItem.user_id,
          status: rsvpItem.status,
          checked_in: rsvpItem.checked_in || false,
          name: profile?.name || "Member",
        };
      })
    );

    const going = peopleWithNames.filter((p) => p.status === "going");
    const waiting = peopleWithNames.filter((p) => p.status === "waitlist");

    setAttendees(going);
    setWaitlist(waiting);

    const me = peopleWithNames.find((p) => p.user_id === userId);
    setUserStatus(me?.status || "");

    setEvent({
      ...eventData,
      goingCount: going.length,
      waitlistCount: waiting.length,
    });

    const { data: routeData } = await supabase
      .from("route_links")
      .select("*")
      .eq("event_id", eventId)
      .order("created_at", { ascending: false });

    setRoutes(routeData || []);

    await loadComments();
  }

  async function loadComments() {
    const { data, error } = await supabase
      .from("event_comments")
      .select("*")
      .eq("event_id", eventId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error(error.message);
      return;
    }

    const commentsWithNames = await Promise.all(
      (data || []).map(async (comment) => {
        const { data: profile } = await supabase
          .from("profiles")
          .select("name")
          .eq("user_id", comment.user_id)
          .maybeSingle();

        return {
          ...comment,
          name: profile?.name || "Member",
        };
      })
    );

    setComments(commentsWithNames);
  }

  async function addComment(parentId: string | null = null) {
    const text = parentId ? replyText.trim() : newComment.trim();

    if (!text || !currentUserId) return;

    const { data: insertedComment, error } = await supabase
      .from("event_comments")
      .insert({
        event_id: eventId,
        user_id: currentUserId,
        parent_id: parentId,
        comment: text,
      })
      .select("id")
      .single();

    if (error) {
      alert(error.message);
      return;
    }

    if (insertedComment?.id) {
      fetch("/api/event-comment-notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId,
          commentId: insertedComment.id,
        }),
      });
    }

    setNewComment("");
    setReplyText("");
    setReplyingTo("");

    await loadComments();
  }

  async function updateComment(commentId: string) {
    if (!editText.trim()) return;

    const { error } = await supabase
      .from("event_comments")
      .update({
        comment: editText.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", commentId);

    if (error) {
      alert(error.message);
      return;
    }

    setEditingCommentId("");
    setEditText("");

    await loadComments();
  }

  async function deleteComment(commentId: string) {
    if (!confirm("Delete this comment?")) return;

    if (isAdmin) {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;

      if (!token) {
        alert("You must be logged in.");
        return;
      }

      const response = await fetch("/api/admin/delete-event-comment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ commentId }),
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.error || "Could not delete comment.");
        return;
      }

      await loadComments();
      return;
    }

    const { error } = await supabase
      .from("event_comments")
      .delete()
      .eq("id", commentId);

    if (error) {
      alert(error.message);
      return;
    }

    await loadComments();
  }

  async function rsvp() {
    if (!currentUserId) {
      alert("Please log in to RSVP.");
      return;
    }

    if (!event) return;

    const accepted = confirm(event.rsvp_disclaimer || defaultDisclaimer);

    if (!accepted) return;

    const status = event.goingCount >= event.capacity ? "waitlist" : "going";

    const { error } = await supabase.from("rsvps").insert({
      user_id: currentUserId,
      event_id: event.id,
      status,
    });

    if (error) {
      alert(error.message);
      return;
    }

    alert(
      status === "going"
        ? "RSVP confirmed. You’re on the Going list."
        : "This event is currently full. You’ve been added to the waitlist."
    );

    await loadPage();
  }

  async function cancelRsvp() {
    if (!event || !currentUserId) return;

    const { data: existing } = await supabase
      .from("rsvps")
      .select("*")
      .eq("user_id", currentUserId)
      .eq("event_id", event.id)
      .limit(1);

    if (!existing || existing.length === 0) return;

    const currentRsvp = existing[0];

    const { error } = await supabase
      .from("rsvps")
      .delete()
      .eq("id", currentRsvp.id);

    if (error) {
      alert(error.message);
      return;
    }

    if (currentRsvp.status === "going") {
      const { data: nextWaitlist } = await supabase
        .from("rsvps")
        .select("*")
        .eq("event_id", event.id)
        .eq("status", "waitlist")
        .order("created_at", { ascending: true })
        .limit(1);

      if (nextWaitlist && nextWaitlist.length > 0) {
        await supabase
          .from("rsvps")
          .update({ status: "going" })
          .eq("id", nextWaitlist[0].id);
      }
    }

    alert("Your RSVP has been canceled.");
    await loadPage();
  }

  async function toggleAttendance(rsvpId: string, currentValue: boolean) {
    if (!canManageAttendance) return;

    const { error } = await supabase
      .from("rsvps")
      .update({ checked_in: !currentValue })
      .eq("id", rsvpId);

    if (error) {
      alert(error.message);
      return;
    }

    await loadPage();
  }

  async function moveToWaitlist(rsvpId: string) {
    if (!canManageAttendance) return;

    const { error } = await supabase
      .from("rsvps")
      .update({ status: "waitlist" })
      .eq("id", rsvpId);

    if (error) {
      alert(error.message);
      return;
    }

    await loadPage();
  }

async function moveToGoing(rsvpId: string) {
  if (!canManageAttendance || !event) return;

  const promotedUser = waitlist.find((person: any) => person.id === rsvpId);

  const { error } = await supabase
    .from("rsvps")
    .update({ status: "going" })
    .eq("id", rsvpId);

  if (error) {
    alert(error.message);
    return;
  }

  if (!promotedUser?.user_id) {
    alert("Moved to Going, but user ID was missing so no notification/email was sent.");
    await loadPage();
    return;
  }

  const { error: notificationError } = await supabase
    .from("notifications")
    .insert({
      user_id: promotedUser.user_id,
      title: "You're In!",
      message: `A spot opened up for ${event.title}. You've been moved from the waitlist to Going.`,
    });

  if (notificationError) {
    alert(notificationError.message);
  }

  const emailResponse = await fetch("/api/notify-waitlist-promoted", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId: promotedUser.user_id,
      eventTitle: event.title,
      eventId: event.id,
    }),
  });

  if (!emailResponse.ok) {
    const emailResult = await emailResponse.json();
    alert(JSON.stringify(emailResult, null, 2));
  }

  await loadPage();
}

  async function removeRsvp(rsvpId: string) {
    if (!canManageAttendance) return;
    if (!confirm("Remove this member from the RSVP list?")) return;

    const { error } = await supabase.from("rsvps").delete().eq("id", rsvpId);

    if (error) {
      alert(error.message);
      return;
    }

    await loadPage();
  }

  if (!event) {
    return <p className="text-gray-300">Loading event...</p>;
  }

  const publicLocation = event.public_location || event.location;
  const canViewPrivateDetails =
    isAdmin || userStatus === "going" || userStatus === "waitlist";

  return (
    <div className="space-y-6">
      <a href="/events" className="text-sm text-[#F28C52] hover:underline">
        ← Back to Events
      </a>

      <div className="rounded-2xl border border-[#F28C52]/30 bg-black/40 p-6">
        <h1 className="text-4xl font-bold text-[#F28C52]">{event.title}</h1>

        {publicLocation && (
          <p className="mt-2 text-xl text-gray-200">{publicLocation}</p>
        )}

        {event.event_date && (
          <p className="mt-2 text-gray-400">
            {new Date(event.event_date).toLocaleString()}
          </p>
        )}

        {event.difficulty && (
          <p className="mt-4 text-sm font-semibold text-[#F28C52]">
            Difficulty: {event.difficulty}
          </p>
        )}

        {event.cover_photo_url && (
  <div className="mt-6 flex justify-center">
    <img
      src={event.cover_photo_url}
      alt={event.title}
      className="max-h-[650px] w-auto max-w-full rounded-xl bg-black object-contain"
    />
  </div>
)}

        <div className="mt-6 rounded-xl border border-white/10 bg-black/30 p-4">
          <p className="text-gray-300">
            <span className="font-semibold text-white">
              {event.goingCount} / {event.capacity}
            </span>{" "}
            going
          </p>

          <p className="mt-1 text-sm text-yellow-300">
            Waitlist: {event.waitlistCount}
          </p>
        </div>

        {canViewPrivateDetails ? (
          <>
            <div className="mt-6 rounded-xl border border-white/10 bg-black/30 p-4">
              <h2 className="text-xl font-bold text-[#F28C52]">
                Event Details
              </h2>

              {event.private_location && (
                <p className="mt-3 text-sm text-white">
                  <span className="text-gray-400">Exact location:</span>{" "}
                  {event.private_location}
                </p>
              )}

              {event.private_details && (
                <p className="mt-3 whitespace-pre-line text-sm leading-6 text-gray-300">
                  {event.private_details}
                </p>
              )}

              {!event.private_location && !event.private_details && (
                <p className="mt-3 text-sm text-gray-400">
                  No additional event details have been added yet.
                </p>
              )}
            </div>

            {event.bring_items?.length > 0 && (
              <div className="mt-6 rounded-xl border border-white/10 bg-black/30 p-4">
                <h2 className="text-xl font-bold text-[#F28C52]">
                  What to Bring
                </h2>

                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {event.bring_items.map((item: string) => (
                    <p key={item} className="text-sm text-gray-300">
                      ✓ {item}
                    </p>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 rounded-xl border border-white/10 bg-black/30 p-4">
              <h2 className="text-xl font-bold text-[#F28C52]">Route Hub</h2>

              {event.route_link && (
                <a
                  href={event.route_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block rounded-lg border border-[#F28C52] px-4 py-2 text-sm font-semibold text-[#F28C52] hover:bg-[#F28C52] hover:text-black"
                >
                  Open Route Link
                </a>
              )}

              {routes.length > 0 && (
                <div className="mt-4 space-y-3">
                  {routes.map((route) => (
                    <div
                      key={route.id}
                      className="rounded-lg border border-white/10 bg-black/30 p-3"
                    >
                      <p className="font-semibold text-white">{route.title}</p>

                      {route.difficulty && (
                        <p className="text-sm text-[#F28C52]">
                          Difficulty: {route.difficulty}
                        </p>
                      )}

                      <div className="mt-3 flex flex-wrap gap-2">
                        {route.onx_url && (
                          <a
                            href={route.onx_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-[#F28C52] underline"
                          >
                            onX
                          </a>
                        )}

                        {route.gpx_url && (
                          <a
                            href={route.gpx_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-[#F28C52] underline"
                          >
                            GPX
                          </a>
                        )}

                        {route.google_maps_url && (
                          <a
                            href={route.google_maps_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-[#F28C52] underline"
                          >
                            Meetup Pin
                          </a>
                        )}
                      </div>

                      {route.notes && (
                        <p className="mt-3 whitespace-pre-line text-sm text-gray-300">
                          {route.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {!event.route_link && routes.length === 0 && (
                <p className="mt-3 text-sm text-gray-400">
                  No route links have been added yet.
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="mt-6 rounded-xl border border-white/10 bg-black/30 p-4">
            <p className="font-semibold text-white">
              Details unlock after RSVP
            </p>
            <p className="mt-2 text-sm text-gray-400">
              Exact meetup location, route links, and event instructions are
              visible after RSVP.
            </p>
          </div>
        )}

        <div className="mt-6">
          <CanIRunThis
            eventTitle={event.title}
            requirements={{
              difficulty: event.trail_difficulty || "moderate",
              minTireDiameter: event.min_tire_diameter || 31,
              recommendedLiftLevel: event.recommended_lift_level ?? 1,
              stockFriendly: event.stock_friendly || false,
              skidPlates: event.skid_plates_requirement || "recommended",
              rockSliders: event.rock_sliders_requirement || "not_needed",
              recoveryPointsRequired: event.recovery_points_required ?? true,
              recoveryGearRequired: event.recovery_gear_required ?? true,
              winch: event.winch_requirement || "recommended",
              traction: event.traction_requirement || "factory_ok",
              waterCrossings: event.water_crossings || "moderate",
              pinstripingRisk: event.pinstriping_risk || "medium",
              terrain: event.trail_terrain || [
                "Ruts",
                "Mud / Clay",
                "Water Crossings",
              ],
            }}
          />
        </div>

        {userStatus ? (
          <div className="mt-6">
            <p className="mb-3 text-gray-300">
              Your status:{" "}
              <span className="font-semibold text-[#F28C52]">
                {userStatus === "going" ? "Going" : "Waitlisted"}
              </span>
            </p>

            <button
              onClick={cancelRsvp}
              className="rounded-lg border border-red-400 px-4 py-2 font-semibold text-red-300 hover:bg-red-400 hover:text-black"
            >
              Cancel RSVP
            </button>
          </div>
        ) : (
          <button
            onClick={rsvp}
            className="mt-6 rounded-lg bg-[#F28C52] px-5 py-3 font-semibold text-black hover:bg-[#C96A2C]"
          >
            {event.goingCount >= event.capacity ? "Join Waitlist" : "RSVP"}
          </button>
        )}
      </div>
<EventDiscussion
  comments={comments}
  currentUserId={currentUserId}
  isAdmin={isAdmin}
  newComment={newComment}
  setNewComment={setNewComment}
  addComment={addComment}
  replyingTo={replyingTo}
  setReplyingTo={setReplyingTo}
  replyText={replyText}
  setReplyText={setReplyText}
  editingCommentId={editingCommentId}
  setEditingCommentId={setEditingCommentId}
  editText={editText}
  setEditText={setEditText}
  updateComment={updateComment}
  deleteComment={deleteComment}
/>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-black/30 p-4">
          <h2 className="text-xl font-bold text-[#F28C52]">Attendees</h2>

          {attendees.length === 0 ? (
            <p className="mt-2 text-gray-400">No one yet.</p>
          ) : (
            attendees.map((a) => (
              <div
                key={a.id}
                className="mt-2 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-green-400/20 bg-green-500/10 px-3 py-2 text-gray-300"
              >
                <span>{a.name}</span>

                {canManageAttendance && (
                  <div className="flex flex-wrap gap-2">
                    <label className="flex items-center gap-2 rounded border border-[#F28C52]/40 px-2 py-1 text-xs text-[#F28C52]">
                      <input
                        type="checkbox"
                        checked={a.checked_in || false}
                        onChange={() => toggleAttendance(a.id, a.checked_in)}
                        className="h-4 w-4 accent-[#F28C52]"
                      />
                      Attended
                    </label>

                    <button
                      onClick={() => moveToWaitlist(a.id)}
                      className="rounded border border-yellow-300/40 px-2 py-1 text-xs text-yellow-200"
                    >
                      Move to Waitlist
                    </button>

                    <button
                      onClick={() => removeRsvp(a.id)}
                      className="rounded border border-red-400/40 px-2 py-1 text-xs text-red-300"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="rounded-xl border border-white/10 bg-black/30 p-4">
          <h2 className="text-xl font-bold text-yellow-300">Waitlist</h2>

          {waitlist.length === 0 ? (
            <p className="mt-2 text-gray-400">No one on waitlist.</p>
          ) : (
            waitlist.map((a, i) => (
              <div
                key={a.id}
                className="mt-2 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-yellow-300/20 bg-yellow-300/10 px-3 py-2 text-gray-300"
              >
                <span>
                  {i + 1}. {a.name}
                </span>

                {canManageAttendance && (
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => moveToGoing(a.id)}
                      className="rounded border border-green-400/40 px-2 py-1 text-xs text-green-300"
                    >
                      Move to Going
                    </button>

                    <button
                      onClick={() => removeRsvp(a.id)}
                      className="rounded border border-red-400/40 px-2 py-1 text-xs text-red-300"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

     
    </div>
  );
}

function EventDiscussion({
  comments,
  currentUserId,
  isAdmin,
  newComment,
  setNewComment,
  addComment,
  replyingTo,
  setReplyingTo,
  replyText,
  setReplyText,
  editingCommentId,
  setEditingCommentId,
  editText,
  setEditText,
  updateComment,
  deleteComment,
}: any) {
  const [expandedThreads, setExpandedThreads] = useState<string[]>([]);
  const [showAllTopComments, setShowAllTopComments] = useState(false);

  const topLevelComments = comments
    .filter((comment: any) => !comment.parent_id)
    .sort(
      (a: any, b: any) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

  const visibleTopLevelComments = showAllTopComments
    ? topLevelComments
    : topLevelComments.slice(0, 5);

  function isThreadExpanded(commentId: string) {
    return expandedThreads.includes(commentId);
  }

  function toggleThread(commentId: string) {
    setExpandedThreads((prev) =>
      prev.includes(commentId)
        ? prev.filter((id) => id !== commentId)
        : [...prev, commentId]
    );
  }

  function formatCommentDate(dateValue: string) {
    return new Date(dateValue).toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  function getAllThreadReplies(parentId: string): any[] {
    const directReplies = comments.filter(
      (reply: any) => reply.parent_id === parentId
    );

    return directReplies.flatMap((reply: any) => [
      reply,
      ...getAllThreadReplies(reply.id),
    ]);
  }

  function renderCommentCard(comment: any, isTopLevel = false) {
    const canManage = comment.user_id === currentUserId || isAdmin;

    return (
      <div
        className={`rounded-xl border ${
          isTopLevel
            ? "border-[#F28C52]/25 bg-black/45 p-4 shadow-lg shadow-black/20"
            : "border-white/10 bg-white/[0.04] p-3"
        }`}
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="font-semibold text-white">{comment.name}</p>

          <p className="text-xs text-gray-500">
            {formatCommentDate(comment.created_at)}
            {comment.updated_at !== comment.created_at ? " • Edited" : ""}
          </p>
        </div>

        {editingCommentId === comment.id ? (
          <div className="mt-3">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="min-h-[90px] w-full rounded-xl border border-white/10 bg-black/50 p-3 text-white outline-none focus:border-[#F28C52]"
            />

            <div className="mt-2 flex flex-wrap gap-2">
              <button
                onClick={() => updateComment(comment.id)}
                className="rounded-lg bg-[#F28C52] px-3 py-2 text-sm font-semibold text-black hover:bg-[#C96A2C]"
              >
                Save
              </button>

              <button
                onClick={() => {
                  setEditingCommentId("");
                  setEditText("");
                }}
                className="rounded-lg border border-white/15 px-3 py-2 text-sm font-semibold text-white/80 hover:border-[#F28C52] hover:text-[#F28C52]"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-gray-300">
            {comment.comment}
          </p>
        )}

        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          {currentUserId && (
            <button
              onClick={() => {
                setReplyingTo(comment.id);
                setReplyText("");
              }}
              className="rounded-full border border-[#F28C52]/30 px-3 py-1 text-xs font-bold text-[#F28C52] hover:bg-[#F28C52] hover:text-black"
            >
              Reply
            </button>
          )}

          {canManage && (
            <>
              <button
                onClick={() => {
                  setEditingCommentId(comment.id);
                  setEditText(comment.comment);
                }}
                className="rounded-full border border-white/15 px-3 py-1 text-xs font-bold text-white/60 hover:border-white/40 hover:text-white"
              >
                Edit
              </button>

              <button
                onClick={() => deleteComment(comment.id)}
                className="rounded-full border border-red-400/25 px-3 py-1 text-xs font-bold text-red-300 hover:bg-red-500/10"
              >
                Delete
              </button>
            </>
          )}
        </div>

        {replyingTo === comment.id && (
          <div className="mt-4 rounded-xl border border-[#F28C52]/20 bg-black/35 p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#F28C52]/80">
              Replying to {comment.name}
            </p>

            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write a reply..."
              className="min-h-[75px] w-full rounded-lg border border-white/10 bg-black/45 p-3 text-white outline-none focus:border-[#F28C52]"
            />

            <div className="mt-2 flex flex-wrap gap-2">
              <button
                onClick={() => addComment(comment.id)}
                className="rounded-lg bg-[#F28C52] px-3 py-2 text-sm font-semibold text-black hover:bg-[#C96A2C]"
              >
                Post Reply
              </button>

              <button
                onClick={() => {
                  setReplyingTo("");
                  setReplyText("");
                }}
                className="rounded-lg border border-white/15 px-3 py-2 text-sm font-semibold text-white/80 hover:border-[#F28C52] hover:text-[#F28C52]"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  function renderReplies(parentId: string) {
    const directReplies = comments.filter(
      (reply: any) => reply.parent_id === parentId
    );

    if (directReplies.length === 0) return null;

    return (
      <div className="mt-4 space-y-3">
        {directReplies.map((reply: any) => (
          <div key={reply.id}>
            {renderCommentCard(reply, false)}

            {comments.some((child: any) => child.parent_id === reply.id) && (
              <div className="mt-3 border-l border-white/10 pl-4">
                {renderReplies(reply.id)}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  function renderTopLevelComment(comment: any) {
    const allReplies = getAllThreadReplies(comment.id);
    const expanded = isThreadExpanded(comment.id);

    return (
      <div key={comment.id}>
        {renderCommentCard(comment, true)}

        {allReplies.length > 0 && (
          <div className="mt-3">
            <button
              onClick={() => toggleThread(comment.id)}
              className="rounded-full border border-white/15 px-3 py-1 text-xs font-bold text-white/70 hover:border-[#F28C52]/50 hover:text-[#F28C52]"
            >
              {expanded
                ? "Hide replies"
                : `View ${allReplies.length} ${
                    allReplies.length === 1 ? "reply" : "replies"
                  }`}
            </button>
          </div>
        )}

        {expanded && (
          <div className="mt-5 space-y-3 border-l border-[#F28C52]/35 pl-4">
            {renderReplies(comment.id)}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#F28C52]/20 bg-black/35 p-4 shadow-xl shadow-black/20">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h4 className="text-lg font-bold text-[#F28C52]">
            Event Discussion
          </h4>

          <p className="mt-1 text-sm text-gray-400">
            Coordinate meetup details, ask questions, and discuss the ride.
          </p>
        </div>

        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-white/60">
          {comments.length} {comments.length === 1 ? "Comment" : "Comments"}
        </span>
      </div>

      {currentUserId ? (
        <div className="mt-5 rounded-xl border border-white/10 bg-black/30 p-3">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="min-h-[95px] w-full rounded-xl border border-white/10 bg-black/45 p-3 text-white outline-none placeholder:text-white/30 focus:border-[#F28C52]"
          />

          <button
            onClick={() => addComment(null)}
            className="mt-3 rounded-lg bg-[#F28C52] px-4 py-2 font-semibold text-black hover:bg-[#C96A2C]"
          >
            Post Comment
          </button>
        </div>
      ) : (
        <div className="mt-5 rounded-xl border border-white/10 bg-black/30 p-4">
          <p className="text-sm text-gray-400">Log in to comment.</p>
        </div>
      )}

      <div className="mt-6 space-y-4">
        {topLevelComments.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-sm text-gray-400">
              No comments yet. Start the discussion.
            </p>
          </div>
        ) : (
          visibleTopLevelComments.map((comment: any) =>
            renderTopLevelComment(comment)
          )
        )}
      </div>

      {topLevelComments.length > 5 && (
        <div className="mt-5 flex justify-center">
          <button
            onClick={() => setShowAllTopComments((prev) => !prev)}
            className="rounded-full border border-[#F28C52]/30 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#F28C52] hover:bg-[#F28C52] hover:text-black"
          >
            {showAllTopComments
              ? "Show fewer comments"
              : `View all ${topLevelComments.length} comments`}
          </button>
        </div>
      )}
    </div>
  );
}