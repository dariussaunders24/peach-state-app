import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

const resend = new Resend(process.env.RESEND_API_KEY);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const EVENT_DATE = "Sunday, October 4, 2026";
const EVENT_TIME = "2:00 PM - 5:00 PM";
const EVENT_LOCATION = "Revolution Auto Service";
const EVENT_ADDRESS =
  "3620 Kennesaw North Industrial Pkwy Ste E, Kennesaw, GA 30144";

function emailShell(content: string) {
  return `
    <div style="margin:0;padding:0;background:#111111;font-family:Arial,Helvetica,sans-serif;color:#ffffff;">
      <div style="max-width:620px;margin:0 auto;padding:32px 20px;">
        <div style="background:#1b1b1b;border:1px solid #333333;border-radius:16px;overflow:hidden;">
          <div style="background:#F28C52;padding:22px 28px;">
            <div style="font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#111111;">
              Peach State Off-Road &amp; Overlanding
            </div>
            <div style="margin-top:6px;font-size:30px;font-weight:800;color:#111111;">
              THE TRAILHEAD
            </div>
          </div>
          <div style="padding:28px;">
            ${content}
          </div>
        </div>
      </div>
    </div>
  `;
}

export async function POST(req: Request) {
  try {
    const { registrationId } = await req.json();

    if (!registrationId || typeof registrationId !== "string") {
      return NextResponse.json(
        { error: "Missing registrationId" },
        { status: 400 }
      );
    }

    const { data, error: cancelError } = await supabaseAdmin.rpc(
      "cancel_the_trailhead_registration",
      {
        p_registration_id: registrationId,
      }
    );

    if (cancelError) {
      console.error("Trailhead cancel RPC error:", cancelError.message);
      return NextResponse.json(
        { error: "Unable to cancel registration." },
        { status: 500 }
      );
    }

    if (!data?.length) {
      return NextResponse.json(
        { error: "Registration not found or already canceled." },
        { status: 404 }
      );
    }

    const canceled = data[0];
    const registrationCode = `TH-${String(canceled.canceled_id)
      .slice(0, 8)
      .toUpperCase()}`;

    const cancelEmail = await resend.emails.send({
      from: "Peach State Off-Road <notifications@peachstateoffroad.com>",
      to: canceled.canceled_email,
      subject: "The Trailhead - Registration Canceled",
      html: emailShell(`
        <div style="font-size:24px;font-weight:800;color:#ffffff;">
          Registration Canceled
        </div>

        <p style="margin:14px 0 0;font-size:16px;line-height:1.6;color:#d6d6d6;">
          Hi ${canceled.canceled_first_name},
        </p>

        <p style="margin:10px 0 0;font-size:16px;line-height:1.6;color:#d6d6d6;">
          Your ${canceled.canceled_status === "waitlist" ? "waitlist registration" : "registration"}
          for The Trailhead has been canceled.
          ${
            canceled.canceled_status === "going"
              ? "Your confirmed spot has been released."
              : "Your position on the waitlist has been removed."
          }
        </p>

        <div style="margin:24px 0;padding:18px;background:#111111;border:1px solid #333333;border-radius:12px;">
          <div style="font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#F28C52;">
            Canceled Registration
          </div>
          <div style="margin-top:8px;font-size:20px;font-weight:800;color:#ffffff;">
            ${registrationCode}
          </div>
        </div>

        <p style="margin:0;font-size:14px;line-height:1.6;color:#bbbbbb;">
          If your plans change again, you may register again as long as registration
          or the waitlist remains open.
        </p>
      `),
    });

    let promotedRegistrationCode: string | null = null;
    let promotionEmailSent = false;

    if (canceled.promoted_id) {
      const { data: promoted, error: promotedLookupError } = await supabaseAdmin
        .from("the_trailhead_registrations")
        .select("id, first_name, last_name, email")
        .eq("id", canceled.promoted_id)
        .single();

      if (promotedLookupError || !promoted) {
        console.error(
          "Promoted Trailhead registration lookup error:",
          promotedLookupError?.message
        );
      } else {
        promotedRegistrationCode = `TH-${promoted.id
          .slice(0, 8)
          .toUpperCase()}`;

        const origin = new URL(req.url).origin;
        const cancelUrl = `${origin}/thetrailhead/cancel?id=${encodeURIComponent(
          promoted.id
        )}`;

        const promotionEmail = await resend.emails.send({
          from: "Peach State Off-Road <notifications@peachstateoffroad.com>",
          to: promoted.email,
          subject: "The Trailhead - A Spot Opened Up! You’re Confirmed",
          html: emailShell(`
            <div style="font-size:24px;font-weight:800;color:#ffffff;">
              A Spot Opened Up!
            </div>

            <p style="margin:14px 0 0;font-size:16px;line-height:1.6;color:#d6d6d6;">
              Hi ${promoted.first_name},
            </p>

            <p style="margin:10px 0 0;font-size:16px;line-height:1.6;color:#d6d6d6;">
              You have automatically been moved from the waitlist into a confirmed
              spot for The Trailhead.
            </p>

            <div style="margin:24px 0;padding:22px;background:#111111;border:1px solid #F28C52;border-radius:12px;text-align:center;">
              <div style="font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#F28C52;">
                Registration Code
              </div>
              <div style="margin-top:8px;font-size:30px;font-weight:800;letter-spacing:1px;color:#ffffff;">
                ${promotedRegistrationCode}
              </div>
              <div style="margin-top:8px;font-size:15px;color:#bbbbbb;">
                ${promoted.first_name} ${promoted.last_name}
              </div>
            </div>

            <div style="margin-top:24px;border-top:1px solid #333333;padding-top:22px;">
              <div style="font-size:18px;font-weight:800;color:#ffffff;">
                Event Details
              </div>
              <p style="margin:12px 0 0;line-height:1.7;color:#d6d6d6;">
                <strong style="color:#ffffff;">Date:</strong> ${EVENT_DATE}<br />
                <strong style="color:#ffffff;">Time:</strong> ${EVENT_TIME}<br />
                <strong style="color:#ffffff;">Location:</strong> ${EVENT_LOCATION}<br />
                <strong style="color:#ffffff;">Address:</strong> ${EVENT_ADDRESS}
              </p>
            </div>

            <div style="margin-top:24px;padding:16px;background:#F28C521A;border-left:4px solid #F28C52;border-radius:6px;">
              <div style="font-size:15px;font-weight:700;line-height:1.5;color:#ffffff;">
                YOU ARE NOW CONFIRMED
              </div>
              <div style="margin-top:5px;font-size:14px;line-height:1.5;color:#d6d6d6;">
                Please save this email and have it available at check-in as proof
                of registration.
              </div>
            </div>

            <div style="margin-top:28px;border-top:1px solid #333333;padding-top:22px;">
              <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#bbbbbb;">
                Can&apos;t make it? Please cancel so the next person on the waitlist
                can be promoted.
              </p>
              <a
                href="${cancelUrl}"
                style="display:inline-block;background:#F28C52;color:#111111;text-decoration:none;font-size:14px;font-weight:800;padding:12px 18px;border-radius:8px;"
              >
                Cancel My Registration
              </a>
            </div>
          `),
        });

        promotionEmailSent = !promotionEmail.error;

        if (promotionEmail.error) {
          console.error(
            "Trailhead promotion email error:",
            promotionEmail.error.message
          );
        }
      }
    }

    if (cancelEmail.error) {
      console.error(
        "Trailhead cancellation email error:",
        cancelEmail.error.message
      );
    }

    return NextResponse.json({
      success: true,
      registrationCode,
      canceledStatus: canceled.canceled_status,
      cancellationEmailSent: !cancelEmail.error,
      promoted: Boolean(canceled.promoted_id),
      promotedRegistrationCode,
      promotionEmailSent,
    });
  } catch (error) {
    console.error("Trailhead cancellation route error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to cancel registration.",
      },
      { status: 500 }
    );
  }
}