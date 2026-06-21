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
    const { userId, badgeName } = await req.json();

    if (!userId || !badgeName) {
      return NextResponse.json(
        { error: "Missing userId or badgeName" },
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

    const email = data.user.email;

    await resend.emails.send({
      from: "Peach State Off-Road <notifications@peachstateoffroad.com>",
      to: email,
      subject: "You earned a new badge!",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>🏅 New Badge Awarded</h2>
          <p>Congratulations!</p>
          <p>You earned the <strong>${badgeName}</strong> badge in Peach State Off-Road and Overlanding.</p>
          <p>Log in to your profile to view your updated badges.</p>
          <br />
          <p>Get out. Explore. Belong.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}