import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { count: goingCount, error: goingError } = await supabaseAdmin
      .from("the_trailhead_registrations")
      .select("*", { count: "exact", head: true })
      .eq("status", "going");

    if (goingError) {
      throw goingError;
    }

    const { count: waitlistCount, error: waitlistError } = await supabaseAdmin
      .from("the_trailhead_registrations")
      .select("*", { count: "exact", head: true })
      .eq("status", "waitlist");

    if (waitlistError) {
      throw waitlistError;
    }

    return NextResponse.json({
      goingCount: goingCount || 0,
      waitlistCount: waitlistCount || 0,
    });
  } catch (error) {
    console.error("Trailhead counts error:", error);

    return NextResponse.json(
      { error: "Unable to load registration counts." },
      { status: 500 }
    );
  }
}