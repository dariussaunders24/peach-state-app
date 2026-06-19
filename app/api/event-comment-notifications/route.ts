import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

const resend = new Resend(process.env.RESEND_API_KEY || "");

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

type Recipient = {
  user_id: string | null;
  email: string;
};

function uniqueRecipients(recipients: Recipient[]) {
  const map = new Map<string, Recipient>();

  for (const recipient of recipients) {
    if (!recipient.email) continue;
    map.set(recipient.email.toLowerCase(), recipient);
  }

  return Array.from(map.values());
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function getProfileName(userId: string) {
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("name")
    .eq("user_id", userId)
    .maybeSingle();

  return profile?.name || "Member";
}

export async function POST(req: Request) {
  try {
    const { eventId, commentId } = await req.json();

    if (!eventId || !commentId) {
      return NextResponse.json(
        { error: "Missing eventId or commentId" },
        { status: 400 }
      );
    }

    const { data: comment, error: commentError } = await supabaseAdmin
      .from("event_comments")
      .select("*")
      .eq("id", commentId)
      .single();

    if (commentError || !comment) {
      return NextResponse.json(
        { error: commentError?.message || "Comment not found" },
        { status: 500 }
      );
    }

    const { data: event, error: eventError } = await supabaseAdmin
      .from("events")
      .select("id, title")
      .eq("id", eventId)
      .single();

    if (eventError || !event) {
      return NextResponse.json(
        { error: eventError?.message || "Event not found" },
        { status: 500 }
      );
    }

    const commenterId = comment.user_id;
    const commenterName = await getProfileName(commenterId);
    const isReply = Boolean(comment.parent_id);

    let recipients: Recipient[] = [];
    let notificationType = "";
    let parentCommentText = "";
    let parentCommenterName = "";

    if (isReply) {
      const { data: parentComment } = await supabaseAdmin
        .from("event_comments")
        .select("user_id, comment")
        .eq("id", comment.parent_id)
        .single();

      if (parentComment) {
        parentCommentText = parentComment.comment || "";
        parentCommenterName = await getProfileName(parentComment.user_id);
      }

      if (parentComment?.user_id && parentComment.user_id !== commenterId) {
        const { data: parentUser } =
          await supabaseAdmin.auth.admin.getUserById(parentComment.user_id);

        if (parentUser.user?.email) {
          recipients.push({
            user_id: parentComment.user_id,
            email: parentUser.user.email,
          });
        }
      }

      notificationType = "reply_notification";
    }

    if (!isReply) {
      const adminEmails = (process.env.ADMIN_EMAILS || "")
        .split(",")
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean);

      const { data: commenterUser } =
        await supabaseAdmin.auth.admin.getUserById(commenterId);

      const commenterEmail = commenterUser.user?.email?.toLowerCase() || "";

      const commenterIsAdmin = adminEmails.includes(commenterEmail);

      if (commenterIsAdmin) {
        const { data: goingRsvps } = await supabaseAdmin
          .from("rsvps")
          .select("user_id")
          .eq("event_id", eventId)
          .eq("status", "going");

        for (const rsvp of goingRsvps || []) {
          if (!rsvp.user_id || rsvp.user_id === commenterId) continue;

          const { data: userData } =
            await supabaseAdmin.auth.admin.getUserById(rsvp.user_id);

          if (userData.user?.email) {
            recipients.push({
              user_id: rsvp.user_id,
              email: userData.user.email,
            });
          }
        }

        notificationType = "admin_event_update";
      } else {
        for (const email of adminEmails) {
          if (email && email !== commenterEmail) {
            recipients.push({
              user_id: null,
              email,
            });
          }
        }

        const { data: captains } = await supabaseAdmin
          .from("profiles")
          .select("user_id, email, role")
          .eq("role", "Ride Captain");

        for (const captain of captains || []) {
          if (!captain.email) continue;
          if (captain.user_id === commenterId) continue;

          recipients.push({
            user_id: captain.user_id,
            email: captain.email,
          });
        }

        notificationType = "comment_alert";
      }
    }

    recipients = uniqueRecipients(recipients);

    if (recipients.length === 0) {
      return NextResponse.json({
        success: true,
        sent: 0,
        type: notificationType,
      });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
    const eventUrl = `${siteUrl}/events`;

    const safeEventTitle = escapeHtml(event.title || "Event");
    const safeCommentText = escapeHtml(comment.comment || "");
    const safeCommenterName = escapeHtml(commenterName);
    const safeParentCommentText = escapeHtml(parentCommentText);
    const safeParentCommenterName = escapeHtml(parentCommenterName);

    const introText =
      notificationType === "admin_event_update"
        ? `${safeCommenterName} posted an event update.`
        : notificationType === "reply_notification"
        ? `${safeCommenterName} replied to ${safeParentCommenterName}.`
        : `${safeCommenterName} commented on this event.`;

    const replyContextHtml =
      notificationType === "reply_notification"
        ? `
          <div style="margin-top: 18px; padding: 14px; border-left: 4px solid #999; background: #f5f5f5;">
            <p style="margin: 0 0 8px; font-size: 13px; color: #555;">
              Original comment from ${safeParentCommenterName}:
            </p>
            <p style="margin: 0; white-space: pre-line; color: #222;">
              ${safeParentCommentText}
            </p>
          </div>
        `
        : "";

    for (const recipient of recipients) {
      const { data: log } = await supabaseAdmin
        .from("event_comment_notifications")
        .insert({
          event_id: eventId,
          comment_id: commentId,
          recipient_user_id: recipient.user_id,
          recipient_email: recipient.email,
          notification_type: notificationType,
          status: "pending",
        })
        .select("id")
        .single();

      try {
        await resend.emails.send({
          from: "Peach State Off-Road <notifications@peachstateoffroad.com>",
          to: recipient.email,
          subject:
            notificationType === "admin_event_update"
              ? `Event update: ${event.title}`
              : notificationType === "reply_notification"
              ? `New reply on ${event.title}`
              : `New comment on ${event.title}`,
          html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #222;">
              <h2 style="margin-bottom: 8px;">${safeEventTitle}</h2>

              <p style="margin: 0 0 16px; color: #444;">
                ${introText}
              </p>

              ${replyContextHtml}

              <div style="margin-top: 18px; padding: 14px; border-left: 4px solid #F28C52; background: #fff7f2;">
                <p style="margin: 0 0 8px; font-size: 13px; color: #555;">
                  ${notificationType === "reply_notification" ? "Reply" : "Comment"} from ${safeCommenterName}:
                </p>
                <p style="margin: 0; white-space: pre-line; color: #222;">
                  ${safeCommentText}
                </p>
              </div>

              <p style="margin-top: 22px;">
                <a href="${eventUrl}" style="color: #C96A2C; font-weight: bold;">
                  View event discussion
                </a>
              </p>
            </div>
          `,
        });

        if (log?.id) {
          await supabaseAdmin
            .from("event_comment_notifications")
            .update({
              status: "sent",
              sent_at: new Date().toISOString(),
            })
            .eq("id", log.id);
        }
      } catch (emailError) {
        if (log?.id) {
          await supabaseAdmin
            .from("event_comment_notifications")
            .update({
              status: "failed",
              error_message:
                emailError instanceof Error
                  ? emailError.message
                  : "Unknown email error",
            })
            .eq("id", log.id);
        }
      }
    }

    return NextResponse.json({
      success: true,
      sent: recipients.length,
      type: notificationType,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Notification failed",
      },
      { status: 500 }
    );
  }
}