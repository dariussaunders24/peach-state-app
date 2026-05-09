import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const adminEmails = ["dariussaunders24@gmail.com"];

export async function POST(req: Request) {
  try {
    const { eventId, status } = await req.json();

    if (!eventId) {
      return NextResponse.json(
        { error: "Missing event ID" },
        { status: 400 }
      );
    }

    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

   const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  return NextResponse.json(
    {
      error: "Missing Supabase server environment variables.",
      hasUrl: Boolean(supabaseUrl),
      hasServiceRoleKey: Boolean(serviceRoleKey),
    },
    { status: 500 }
  );
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const { data: userData, error: userError } =
      await supabaseAdmin.auth.getUser(token);

    if (userError || !userData.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userEmail = userData.user.email?.toLowerCase().trim();

    if (!userEmail || !adminEmails.includes(userEmail)) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    let query = supabaseAdmin
      .from("rsvps")
      .select("user_id, status")
      .eq("event_id", eventId);

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    const { data: rsvps, error: rsvpError } = await query;

    if (rsvpError) {
      return NextResponse.json(
        { error: rsvpError.message },
        { status: 500 }
      );
    }

    const emails: string[] = [];

    for (const rsvp of rsvps || []) {
      const { data } =
        await supabaseAdmin.auth.admin.getUserById(rsvp.user_id);

      const email = data.user?.email;

      if (email) {
        emails.push(email);
      }
    }

    return NextResponse.json({
      emails,
      emailText: emails.join(", "),
      count: emails.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}