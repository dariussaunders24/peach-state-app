import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const adminEmails = ["dariussaunders24@gmail.com"];

const BUCKET_NAME = "trailhead-gallery";

async function verifyAdmin(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.replace("Bearer ", "").trim();

  if (!token) {
    return null;
  }

  const authClient = createClient(
    supabaseUrl,
    supabasePublishableKey
  );

  const {
    data: { user },
    error,
  } = await authClient.auth.getUser(token);

  if (error || !user?.email) {
    return null;
  }

  if (!adminEmails.includes(user.email.toLowerCase())) {
    return null;
  }

  return user;
}

/* =========================================================
   GET
   Load all Trailhead Gallery photos for the admin page
========================================================= */

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAdmin(request);

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("trailhead_gallery")
      .select(
        "id, image_url, storage_path, caption, event_label, display_order, created_at"
      )
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Trailhead gallery load error:", error);

      return NextResponse.json(
        { error: "Unable to load gallery photos." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      photos: data || [],
    });
  } catch (error) {
    console.error("Trailhead gallery GET error:", error);

    return NextResponse.json(
      { error: "Unable to load gallery photos." },
      { status: 500 }
    );
  }
}

/* =========================================================
   POST
   Upload a new Trailhead Gallery photo
========================================================= */

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAdmin(request);

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    const formData = await request.formData();

    const file = formData.get("photo");
    const caption = String(formData.get("caption") || "").trim();
    const eventLabel = String(
      formData.get("event_label") || ""
    ).trim();

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Please select a photo." },
        { status: 400 }
      );
    }

    const maxFileSize = 8 * 1024 * 1024;

    if (file.size > maxFileSize) {
      return NextResponse.json(
        { error: "Photo must be 8 MB or smaller." },
        { status: 400 }
      );
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/heic",
      "image/heif",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            "Unsupported image type. Use JPG, PNG, WEBP, HEIC, or HEIF.",
        },
        { status: 400 }
      );
    }

    const extension =
      file.name.split(".").pop()?.toLowerCase() || "jpg";

    const photoId = crypto.randomUUID();

    const storagePath = `${photoId}/${Date.now()}-${photoId}.${extension}`;

    const fileBuffer = await file.arrayBuffer();

    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(storagePath, fileBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error(
        "Trailhead gallery storage upload error:",
        uploadError
      );

      return NextResponse.json(
        { error: "Unable to upload photo." },
        { status: 500 }
      );
    }

    const {
      data: { publicUrl },
    } = supabaseAdmin.storage
      .from(BUCKET_NAME)
      .getPublicUrl(storagePath);

    const { data: photo, error: insertError } =
      await supabaseAdmin
        .from("trailhead_gallery")
        .insert({
          image_url: publicUrl,
          storage_path: storagePath,
          caption: caption || null,
          event_label: eventLabel || null,
          display_order: 0,
        })
        .select(
          "id, image_url, storage_path, caption, event_label, display_order, created_at"
        )
        .single();

    if (insertError) {
      console.error(
        "Trailhead gallery database insert error:",
        insertError
      );

      await supabaseAdmin.storage
        .from(BUCKET_NAME)
        .remove([storagePath]);

      return NextResponse.json(
        { error: "Unable to save gallery photo." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      photo,
    });
  } catch (error) {
    console.error("Trailhead gallery POST error:", error);

    return NextResponse.json(
      { error: "Unable to upload gallery photo." },
      { status: 500 }
    );
  }
}

/* =========================================================
   DELETE
   Delete a Trailhead Gallery photo
========================================================= */

export async function DELETE(request: NextRequest) {
  try {
    const user = await verifyAdmin(request);

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const id = String(body?.id || "").trim();

    if (!id) {
      return NextResponse.json(
        { error: "Photo ID is required." },
        { status: 400 }
      );
    }

    const { data: photo, error: lookupError } =
      await supabaseAdmin
        .from("trailhead_gallery")
        .select("id, storage_path")
        .eq("id", id)
        .single();

    if (lookupError || !photo) {
      return NextResponse.json(
        { error: "Gallery photo not found." },
        { status: 404 }
      );
    }

    /*
     * Delete the database record first.
     * If that succeeds, remove the actual image from Storage.
     */
    const { error: deleteError } = await supabaseAdmin
      .from("trailhead_gallery")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error(
        "Trailhead gallery database delete error:",
        deleteError
      );

      return NextResponse.json(
        { error: "Unable to delete gallery photo." },
        { status: 500 }
      );
    }

    const { error: storageError } =
      await supabaseAdmin.storage
        .from(BUCKET_NAME)
        .remove([photo.storage_path]);

    if (storageError) {
      /*
       * The public gallery record is already gone, so don't report the
       * entire delete as failed. Log the orphaned Storage object instead.
       */
      console.error(
        "Trailhead gallery storage cleanup error:",
        storageError
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Trailhead gallery DELETE error:", error);

    return NextResponse.json(
      { error: "Unable to delete gallery photo." },
      { status: 500 }
    );
  }
}