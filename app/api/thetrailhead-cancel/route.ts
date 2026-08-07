import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

const resend = new Resend(process.env.RESEND_API_KEY);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { registrationId } = await req.json();

    if (!registrationId || typeof registrationId !== "string") {
      return NextResponse.json(
        { error: "Missing registrationId" },
        { status: 400 }
      );
    }

    const { data: registration, error: lookupError } = await supabaseAdmin
      .from("the_trailhead_registrations")
      .select("id, first_name, last_name, email")
      .eq("id", registrationId)
      .single();

    if (lookupError || !registration) {
      return NextResponse.json(
        { error: "Registration not found or already canceled." },
        { status: 404 }
      );
    }

    const { error: deleteError } = await supabaseAdmin
      .from("the_trailhead_registrations")
      .delete()
      .eq("id", registration.id);

    if (deleteError) {
      console.error("Trailhead cancellation delete error:", deleteError.message);

      return NextResponse.json(
        { error: "Unable to cancel registration." },
        { status: 500 }
      );
    }

    const registrationCode = `TH-${registration.id
      .slice(0, 8)
      .toUpperCase()}`;

    const emailResult = await resend.emails.send({
      from: "Peach State Off-Road <notifications@peachstateoffroad.com>",
      to: registration.email,
      subject: "The Trailhead - Registration Canceled",
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
                  Registration Canceled
                </div>

                <p style="margin:14px 0 0;font-size:16px;line-height:1.6;color:#d6d6d6;">
                  Hi ${registration.first_name},
                </p>

                <p style="margin:10px 0 0;font-size:16px;line-height:1.6;color:#d6d6d6;">
                  Your registration for The Trailhead has been canceled and
                  your spot has been released.
                </p>

                <div style="margin:24px 0;padding:18px;background:#111111;border:1px solid #333333;border-radius:12px;">
                  <div style="font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#F28C52;">
                    Canceled Registration
                  </div>
                  <div style="margin-top:8px;font-size:20px;font-weight:800;color:#ffffff;">
                    ${registrationCode}
                  </div>
                  <div style="margin-top:6px;font-size:14px;color:#bbbbbb;">
                    ${registration.first_name} ${registration.last_name}
                  </div>
                </div>

                <p style="margin:0;font-size:14px;line-height:1.6;color:#bbbbbb;">
                  If your plans change again, you may register again as long as
                  spots are still available.
                </p>
              </div>
            </div>
          </div>
        </div>
      `,
    });

    if (emailResult.error) {
      console.error(
        "Trailhead cancellation email error:",
        emailResult.error.message
      );
    }

    return NextResponse.json({
      success: true,
      registrationCode,
      emailSent: !emailResult.error,
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