import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const publishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_hYxJh5K04tEeLwB0l1M7Jw_7NSHtnSf";

const supabaseAdmin = createClient(
  supabaseUrl,
  serviceRoleKey
);

const adminEmails = [
  "dariussaunders24@gmail.com",
];

async function verifyAdmin(request: NextRequest) {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  const token = authorization.substring(7);

  const supabaseAuth = createClient(
    supabaseUrl,
    publishableKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );

  const {
    data: { user },
    error,
  } = await supabaseAuth.auth.getUser(token);

  if (error || !user?.email) {
    return null;
  }

  const email = user.email.toLowerCase().trim();

  if (!adminEmails.includes(email)) {
    return null;
  }

  return user;
}

export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);

    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("trailhead_settings")
      .select("*")
      .order("id", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Trailhead settings load error:", error);

      return NextResponse.json(
        { error: "Unable to load Trailhead settings." },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Trailhead settings record was not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      settings: data,
    });
  } catch (error) {
    console.error("Trailhead settings GET error:", error);

    return NextResponse.json(
      { error: "Unable to load Trailhead settings." },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);

    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    if (!body.id) {
      return NextResponse.json(
        { error: "Trailhead settings ID is required." },
        { status: 400 }
      );
    }

    const updates = {
      event_date: body.event_date || null,
      start_time: body.start_time || null,
      end_time: body.end_time || null,
      venue_name: body.venue_name?.trim() || null,
      address: body.address?.trim() || null,
      announcement: body.announcement?.trim() || null,
      special_feature: body.special_feature?.trim() || null,
      event_image: body.event_image?.trim() || null,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin
      .from("trailhead_settings")
      .update(updates)
      .eq("id", body.id)
      .select("*")
      .single();

    if (error) {
      console.error("Trailhead settings update error:", error);

      return NextResponse.json(
        { error: "Unable to save Trailhead settings." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      settings: data,
    });
  } catch (error) {
    console.error("Trailhead settings PUT error:", error);

    return NextResponse.json(
      { error: "Unable to save Trailhead settings." },
      { status: 500 }
    );
  }
}