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

async function getAuthEmail(userId: string) {
  const { data } = await supabaseAdmin.auth.admin.getUserById(userId);
  return data.user?.email || "";
}

async function getRootComment(comment: any): Promise<any> {
  let current = comment;

  while (current?.parent_id) {
    const { data: parent } = await supabaseAdmin
      .from("event_comments")
      .select("*")
      .eq("id", current.parent_id)
      .single();

    if (!parent) break;
    current = parent;
  }

  return current;
}

function buildEmailHtml({
  safeEventTitle,
  introText,
  replyContextHtml,
  notificationType,
  safeCommenterName,
  safeCommentText,
  eventUrl,
}: any) {
  return `
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
  `;
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
    const commenterEmail = (await getAuthEmail(commenterId)).toLowerCase();
    const isReply = Boolean(comment.parent_id);

    let recipients: Recipient[] = [];
    let notificationType = "";
    let parentCommentText = "";
    let parentCommenterName = "";

    const adminEmails = (process.env.ADMIN_EMAILS || "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean);

    const commenterIsAdmin = adminEmails.includes(commenterEmail);

    if (isReply) {
      const { data: parentComment } = await supabaseAdmin
        .from("event_comments")
        .select("*")
        .eq("id", comment.parent_id)
        .single();

      if (parentComment) {
        parentCommentText = parentComment.comment || "";
        parentCommenterName = await getProfileName(parentComment.user_id);

        if (parentComment.user_id !== commenterId) {
          const parentEmail = await getAuthEmail(parentComment.user_id);
          if (parentEmail) {
            recipients.push({
              user_id: parentComment.user_id,
              email: parentEmail,
            });
          }
        }

        const rootComment = await getRootComment(parentComment);

        if (
          rootComment?.user_id &&
          rootComment.user_id !== commenterId &&
          rootComment.user_id !== parentComment.user_id
        ) {
          const rootEmail = await getAuthEmail(rootComment.user_id);
          if (rootEmail) {
            recipients.push({
              user_id: rootComment.user_id,
              email: rootEmail,
            });
          }
        }
      }

      notificationType = "reply_notification";
    }

    if (!isReply) {
      if (commenterIsAdmin) {
        const { data: goingRsvps } = await supabaseAdmin
          .from("rsvps")
          .select("user_id")
          .eq("event_id", eventId)
          .eq("status", "going");

        for (const rsvp of goingRsvps || []) {
          if (!rsvp.user_id || rsvp.user_id === commenterId) continue;

          const email = await getAuthEmail(rsvp.user_id);

          if (email) {
            recipients.push({
              user_id: rsvp.user_id,
              email,
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

    const subject =
      notificationType === "admin_event_update"
        ? `Event update: ${event.title}`
        : notificationType === "reply_notification"
        ? `New reply on ${event.title}`
        : `New comment on ${event.title}`;

    const html = buildEmailHtml({
      safeEventTitle,
      introText,
      replyContextHtml,
      notificationType,
      safeCommenterName,
      safeCommentText,
      eventUrl,
    });

    const logs: any[] = [];

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
        .select("id, recipient_email")
        .single();

      if (log) logs.push(log);
    }

    if (notificationType === "admin_event_update") {
      const batchPayload = logs.map((log) => ({
        from: "Peach State Off-Road <notifications@peachstateoffroad.com>",
        to: log.recipient_email,
        subject,
        html,
      }));

      try {
        const batchResult: any = await resend.batch.send(batchPayload as any);

        if (batchResult?.error) {
          await supabaseAdmin
            .from("event_comment_notifications")
            .update({
              status: "failed",
              error_message: batchResult.error.message || "Batch send failed",
            })
            .in(
              "id",
              logs.map((log) => log.id)
            );

          return NextResponse.json(
            { error: batchResult.error.message || "Batch send failed" },
            { status: 500 }
          );
        }

        const sentData = batchResult?.data || [];

        for (let i = 0; i < logs.length; i++) {
          await supabaseAdmin
            .from("event_comment_notifications")
            .update({
              status: "sent",
              resend_email_id: sentData[i]?.id || null,
              sent_at: new Date().toISOString(),
            })
            .eq("id", logs[i].id);
        }

        return NextResponse.json({
          success: true,
          sent: logs.length,
          type: notificationType,
          batch: true,
        });
      } catch (emailError) {
        await supabaseAdmin
          .from("event_comment_notifications")
          .update({
            status: "failed",
            error_message:
              emailError instanceof Error
                ? emailError.message
                : "Unknown batch send error",
          })
          .in(
            "id",
            logs.map((log) => log.id)
          );

        return NextResponse.json(
          {
            error:
              emailError instanceof Error
                ? emailError.message
                : "Unknown batch send error",
          },
          { status: 500 }
        );
      }
    }

    for (const log of logs) {
      try {
        const sendResult: any = await resend.emails.send({
          from: "Peach State Off-Road <notifications@peachstateoffroad.com>",
          to: log.recipient_email,
          subject,
          html,
        });

        if (sendResult?.error) {
          throw new Error(sendResult.error.message || "Email send failed");
        }

        await supabaseAdmin
          .from("event_comment_notifications")
          .update({
            status: "sent",
            resend_email_id: sendResult?.data?.id || null,
            sent_at: new Date().toISOString(),
          })
          .eq("id", log.id);
      } catch (emailError) {
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

    return NextResponse.json({
      success: true,
      sent: logs.length,
      type: notificationType,
      batch: false,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Notification failed",
      },
      { status: 500 }
    );
  }
}