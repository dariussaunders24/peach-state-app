import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const adminEmails = ["dariussaunders24@gmail.com"];

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Missing auth token" }, { status: 401 });
    }

    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = (user.email || "").toLowerCase().trim();

    if (!adminEmails.includes(email)) {
      return NextResponse.json({ error: "Admin only" }, { status: 403 });
    }

    const { eventId, status } = await request.json();

    if (!eventId) {
      return NextResponse.json({ error: "Missing eventId" }, { status: 400 });
    }

    let query = supabaseAdmin
      .from("rsvps")
      .select("user_id, status")
      .eq("event_id", eventId);

    if (status !== "all") {
      query = query.eq("status", status);
    }

    const { data: rsvps, error: rsvpError } = await query;

    if (rsvpError) {
      return NextResponse.json({ error: rsvpError.message }, { status: 500 });
    }

    const emails: string[] = [];

    for (const rsvp of rsvps || []) {
      if (!rsvp.user_id) continue;

      const { data, error } = await supabaseAdmin.auth.admin.getUserById(
        rsvp.user_id
      );

      if (!error && data.user?.email) {
        emails.push(data.user.email.toLowerCase().trim());
      }
    }

    const uniqueEmails = Array.from(new Set(emails));

    return NextResponse.json({
      count: uniqueEmails.length,
      emailText: uniqueEmails.join(", "),
      emails: uniqueEmails,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}