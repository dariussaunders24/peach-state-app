import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type Profile = {
  user_id: string;
  name: string | null;
  is_banned: boolean | null;
};

export async function GET() {
  try {
    // -----------------------------------------
    // 1. Load ALL Supabase Auth users
    // -----------------------------------------

    const allAuthUsers: {
      id: string;
      email: string;
    }[] = [];

    let page = 1;
    const perPage = 1000;

    while (true) {
      const {
        data: { users },
        error,
      } = await supabaseAdmin.auth.admin.listUsers({
        page,
        perPage,
      });

      if (error) {
        console.error("Error loading auth users:", error);

        return NextResponse.json(
          { error: "Failed to load users" },
          { status: 500 }
        );
      }

      for (const user of users) {
        if (!user.email) continue;

        allAuthUsers.push({
          id: user.id,
          email: user.email,
        });
      }

      if (users.length < perPage) {
        break;
      }

      page++;
    }

    // -----------------------------------------
    // 2. Load ALL profiles
    // -----------------------------------------

    const allProfiles: Profile[] = [];

    const profilePageSize = 1000;
    let from = 0;

    while (true) {
      const { data, error } = await supabaseAdmin
        .from("profiles")
        .select("user_id, name, is_banned")
        .range(from, from + profilePageSize - 1);

      if (error) {
        console.error("Error loading profiles:", error);

        return NextResponse.json(
          { error: "Failed to load member profiles" },
          { status: 500 }
        );
      }

      const rows = (data || []) as Profile[];

      allProfiles.push(...rows);

      if (rows.length < profilePageSize) {
        break;
      }

      from += profilePageSize;
    }

    // -----------------------------------------
    // 3. Match profiles to Auth users
    // -----------------------------------------

    const profileMap = new Map(
      allProfiles.map((profile) => [profile.user_id, profile])
    );

    const recipients = allAuthUsers
      .filter((user) => {
        const profile = profileMap.get(user.id);

        // Exclude banned members
        return profile?.is_banned !== true;
      })
      .map((user) => {
        const profile = profileMap.get(user.id);

        return {
          id: user.id,
          email: user.email,
          name: profile?.name?.trim() || "Unnamed Member",
        };
      });

    // -----------------------------------------
    // 4. Sort alphabetically by member name
    // -----------------------------------------

    recipients.sort((a, b) =>
      a.name.localeCompare(b.name, undefined, {
        sensitivity: "base",
      })
    );

    return NextResponse.json({
      recipients,
      total: recipients.length,
    });
  } catch (error) {
    console.error("Recipients API error:", error);

    return NextResponse.json(
      { error: "Something went wrong loading recipients" },
      { status: 500 }
    );
  }
}