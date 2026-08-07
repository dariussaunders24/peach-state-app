import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

const CAPACITY = 35;

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
    const body = await req.json();

    const firstName = String(body.firstName || "").trim();
    const lastName = String(body.lastName || "").trim();
    const phone = String(body.phone || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const waiverAccepted = body.waiverAccepted === true;

    if (!firstName || !lastName || !phone || !email) {
      return NextResponse.json(
        { error: "Please complete all required fields." },
        { status: 400 }
      );
    }

    if (!waiverAccepted) {
      return NextResponse.json(
        { error: "You must accept the waiver before registering." },
        { status: 400 }
      );
    }

    const { data, error: rpcError } = await supabaseAdmin.rpc(
      "register_the_trailhead",
      {
        p_first_name: firstName,
        p_last_name: lastName,
        p_phone: phone,
        p_email: email,
        p_waiver_accepted: waiverAccepted,
      }
    );

    if (rpcError || !data?.length) {
      console.error("Trailhead registration RPC error:", rpcError?.message);

      return NextResponse.json(
        { error: "Unable to complete registration. Please try again." },
        { status: 500 }
      );
    }

    const registrationId = data[0].registration_id as string;
    const status = data[0].registration_status as "going" | "waitlist";
    const registrationCode = `TH-${registrationId.slice(0, 8).toUpperCase()}`;
    const origin = new URL(req.url).origin;
    const cancelUrl = `${origin}/thetrailhead/cancel?id=${encodeURIComponent(
      registrationId
    )}`;

    const isGoing = status === "going";

    const subject = isGoing
      ? "The Trailhead - Registration Confirmed"
      : "The Trailhead - Waitlist Confirmation";

    const statusTitle = isGoing
      ? "Registration Confirmed"
      : "You’re on the Waitlist";

    const statusMessage = isGoing
      ? `Your registration for The Trailhead has been confirmed. Please save this email and have it available at check-in as proof of registration.`
      : `The Trailhead is currently full, but your registration has been added to the waitlist. If a confirmed spot opens, you will automatically be moved to Going and we will email you immediately.`;

    const statusBox = isGoing
      ? `
        <div style="margin-top:24px;padding:16px;background:#F28C521A;border-left:4px solid #F28C52;border-radius:6px;">
          <div style="font-size:15px;font-weight:700;line-height:1.5;color:#ffffff;">
            CHECK-IN REQUIREMENT
          </div>
          <div style="margin-top:5px;font-size:14px;line-height:1.5;color:#d6d6d6;">
            Please show this confirmation email or your registration code when you arrive.
            Admission is limited to registered vehicles.
          </div>
        </div>
      `
      : `
        <div style="margin-top:24px;padding:16px;background:#F28C521A;border-left:4px solid #F28C52;border-radius:6px;">
          <div style="font-size:15px;font-weight:700;line-height:1.5;color:#ffffff;">
            WAITLIST STATUS
          </div>
          <div style="margin-top:5px;font-size:14px;line-height:1.5;color:#d6d6d6;">
            Do not come to the event unless you receive a promotion email confirming that
            you have been moved from the waitlist into a confirmed spot.
          </div>
        </div>
      `;

    const sendResult = await resend.emails.send({
      from: "Peach State Off-Road <notifications@peachstateoffroad.com>",
      to: email,
      subject,
      html: emailShell(`
        <div style="font-size:24px;font-weight:800;color:#ffffff;">
          ${statusTitle}
        </div>

        <p style="margin:14px 0 0;font-size:16px;line-height:1.6;color:#d6d6d6;">
          Hi ${firstName},
        </p>

        <p style="margin:10px 0 0;font-size:16px;line-height:1.6;color:#d6d6d6;">
          ${statusMessage}
        </p>

        <div style="margin:24px 0;padding:22px;background:#111111;border:1px solid #F28C52;border-radius:12px;text-align:center;">
          <div style="font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#F28C52;">
            Registration Code
          </div>
          <div style="margin-top:8px;font-size:30px;font-weight:800;letter-spacing:1px;color:#ffffff;">
            ${registrationCode}
          </div>
          <div style="margin-top:8px;font-size:15px;color:#bbbbbb;">
            ${firstName} ${lastName}
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

        ${statusBox}

        <div style="margin-top:28px;border-top:1px solid #333333;padding-top:22px;">
          <div style="font-size:16px;font-weight:800;color:#ffffff;">
            Can&apos;t make it?
          </div>
          <p style="margin:8px 0 16px;font-size:14px;line-height:1.6;color:#bbbbbb;">
            Cancel your registration so your confirmed spot or waitlist position
            can be released.
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

    if (sendResult.error) {
      console.error("Trailhead registration email error:", sendResult.error.message);
    }

    const { count: goingCount } = await supabaseAdmin
      .from("the_trailhead_registrations")
      .select("*", { count: "exact", head: true })
      .eq("status", "going");

    const { count: waitlistCount } = await supabaseAdmin
      .from("the_trailhead_registrations")
      .select("*", { count: "exact", head: true })
      .eq("status", "waitlist");

    return NextResponse.json({
      success: true,
      status,
      registrationCode,
      emailSent: !sendResult.error,
      goingCount: goingCount || 0,
      waitlistCount: waitlistCount || 0,
      capacity: CAPACITY,
    });
  } catch (error) {
    console.error("Trailhead register route error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to complete registration.",
      },
      { status: 500 }
    );
  }
}