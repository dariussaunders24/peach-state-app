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
    const { userId, eventTitle, eventId } = await req.json();

    if (!userId || !eventTitle || !eventId) {
      return NextResponse.json(
        { error: "Missing userId, eventTitle, or eventId" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId);

    if (error || !data?.user?.email) {
      return NextResponse.json(
        { error: "User email not found" },
        { status: 404 }
      );
    }

    await resend.emails.send({
      from: "Peach State Off-Road <notifications@peachstateoffroad.com>",
      to: data.user.email,
      subject: `You're in! A spot opened up for ${eventTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>You're in!</h2>
          <p>A spot opened up for <strong>${eventTitle}</strong>.</p>
          <p>You have been moved from the waitlist to the Going list.</p>
          <p>If you can no longer attend, please cancel your RSVP as soon as possible so another member can take the spot.</p>
          <p>
            <a href="https://www.peachstateoffroad.com/events/${eventId}">
              View Event
            </a>
          </p>
          <p>Get out. Explore. Belong.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Waitlist promotion email failed" },
      { status: 500 }
    );
  }
}