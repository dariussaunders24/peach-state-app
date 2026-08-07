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

export async function POST(req: Request) {
  try {
    const { registrationId } = await req.json();

    if (!registrationId) {
      return NextResponse.json(
        { error: "Missing registrationId" },
        { status: 400 }
      );
    }

    const { data: registration, error: registrationError } =
      await supabaseAdmin
        .from("the_trailhead_registrations")
        .select("id, first_name, last_name, email")
        .eq("id", registrationId)
        .single();

    if (registrationError || !registration) {
      console.error(
        "Trailhead registration lookup error:",
        registrationError?.message
      );

      return NextResponse.json(
        { error: "Registration not found" },
        { status: 404 }
      );
    }

    const registrationCode = `TH-${registration.id
      .slice(0, 8)
      .toUpperCase()}`;

    const fullName = `${registration.first_name} ${registration.last_name}`;
    const origin = new URL(req.url).origin;
    const cancelUrl = `${origin}/thetrailhead/cancel?id=${encodeURIComponent(
      registration.id
    )}`;

    const sendResult = await resend.emails.send({
      from: "Peach State Off-Road <notifications@peachstateoffroad.com>",
      to: registration.email,
      subject: "The Trailhead - Registration Confirmed",
      html: `
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
                <div style="font-size:24px;font-weight:800;color:#ffffff;">
                  Registration Confirmed
                </div>

                <p style="margin:14px 0 0;font-size:16px;line-height:1.6;color:#d6d6d6;">
                  Hi ${registration.first_name},
                </p>

                <p style="margin:10px 0 0;font-size:16px;line-height:1.6;color:#d6d6d6;">
                  Your registration for The Trailhead has been confirmed.
                  Please save this email and have it available at check-in as
                  proof of registration.
                </p>

                <div style="margin:24px 0;padding:22px;background:#111111;border:1px solid #F28C52;border-radius:12px;text-align:center;">
                  <div style="font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#F28C52;">
                    Registration Code
                  </div>
                  <div style="margin-top:8px;font-size:30px;font-weight:800;letter-spacing:1px;color:#ffffff;">
                    ${registrationCode}
                  </div>
                  <div style="margin-top:8px;font-size:15px;color:#bbbbbb;">
                    ${fullName}
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
                    CHECK-IN REQUIREMENT
                  </div>
                  <div style="margin-top:5px;font-size:14px;line-height:1.5;color:#d6d6d6;">
                    Please show this confirmation email or your registration
                    code when you arrive. Admission is limited to registered
                    vehicles.
                  </div>
                </div>

                <div style="margin-top:28px;border-top:1px solid #333333;padding-top:22px;">
                  <div style="font-size:16px;font-weight:800;color:#ffffff;">
                    Can&apos;t make it?
                  </div>
                  <p style="margin:8px 0 16px;font-size:14px;line-height:1.6;color:#bbbbbb;">
                    Please cancel your registration so the spot can be made
                    available to someone else.
                  </p>
                  <a
                    href="${cancelUrl}"
                    style="display:inline-block;background:#F28C52;color:#111111;text-decoration:none;font-size:14px;font-weight:800;padding:12px 18px;border-radius:8px;"
                  >
                    Cancel My Registration
                  </a>
                </div>

                <p style="margin:24px 0 0;font-size:14px;line-height:1.6;color:#999999;">
                  We look forward to seeing you at The Trailhead.
                </p>
              </div>
            </div>
          </div>
        </div>
      `,
    });

    if (sendResult.error) {
      console.error(
        "Trailhead confirmation send error:",
        sendResult.error.message
      );

      return NextResponse.json(
        { error: sendResult.error.message || "Email send failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      registrationCode,
      emailId: sendResult.data?.id || null,
    });
  } catch (error) {
    console.error("Trailhead confirmation route error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to send confirmation email",
      },
      { status: 500 }
    );
  }
}