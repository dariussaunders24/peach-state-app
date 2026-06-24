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
    const { eventId } = await req.json();

    if (!eventId) {
      return NextResponse.json({ error: "Missing eventId" }, { status: 400 });
    }

    const { data: event, error: eventError } = await supabaseAdmin
      .from("events")
      .select("id, title, event_date, public_location, location")
      .eq("id", eventId)
      .single();

    if (eventError || !event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const { data: usersData, error: usersError } =
      await supabaseAdmin.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });

    if (usersError) {
      return NextResponse.json(
        { error: "Could not load users" },
        { status: 500 }
      );
    }

    const emails =
      usersData.users
        ?.map((user) => user.email)
        .filter((email): email is string => Boolean(email)) || [];

    if (emails.length === 0) {
      return NextResponse.json({ message: "No users to notify" });
    }

    const eventUrl = `https://www.peachstateoffroad.com/events/${eventId}`;

    const emailBatches = [];

for (let i = 0; i < emails.length; i += 50) {
  emailBatches.push(emails.slice(i, i + 50));
}

const resendResponses = [];

const failedEmails: string[] = [];

for (const email of emails) {
  const emailResponse = await resend.emails.send({
      from: "Peach State Off-Road <notifications@peachstateoffroad.com>",
      to: email,
      subject: `New Peach State Event Posted: ${event.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>New Peach State Event Posted</h2>

          <p><strong>${event.title}</strong></p>

          ${event.event_date ? `<p><strong>Date:</strong> ${event.event_date}</p>` : ""}
          ${
            event.public_location || event.location
              ? `<p><strong>Location:</strong> ${event.public_location || event.location}</p>`
              : ""
          }

          <p>A new event has been posted in the Peach State app.</p>

          <p>
            <a href="${eventUrl}" 
              style="background:#d96b27;color:white;padding:12px 18px;text-decoration:none;border-radius:6px;display:inline-block;">
              View Event & RSVP
            </a>
          </p>

          <p style="font-size:12px;color:#666;">
            Get out. Explore. Belong.
          </p>
        </div>
      `,
    });
      resendResponses.push(emailResponse);
}
return NextResponse.json({
  success: true,
  notified: emails.length - failedEmails.length,
  failed: failedEmails.length,
});
  } catch (error) {
    console.error("New event notification error:", error);

    return NextResponse.json(
      { error: "Failed to send new event notification" },
      { status: 500 }
    );
  }
}