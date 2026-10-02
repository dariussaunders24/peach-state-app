import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

const resend = new Resend(process.env.RESEND_API_KEY);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const TRAILHEAD_EMAIL = "thetrailheadinfo@gmail.com";
const STORAGE_BUCKET = "trailhead-featured-rigs";

const MAX_PHOTOS = 4;
const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8 MB per photo

const allowedTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];

export async function POST(req: Request) {
  const uploadedPaths: string[] = [];

  try {
    const formData = await req.formData();

    const name = getText(formData, "name");
    const email = getText(formData, "email");
    const phone = getText(formData, "phone");
    const location = getText(formData, "location");

    const vehicleYear = getText(formData, "vehicle_year");
    const vehicleMake = getText(formData, "vehicle_make");
    const vehicleModel = getText(formData, "vehicle_model");
    const vehicleName = getText(formData, "vehicle_name");

    const instagram = getText(formData, "instagram");
    const buildDetails = getText(formData, "build_details");
    const rigStory = getText(formData, "rig_story");

    // -----------------------------------------
    // 1. Validate required fields
    // -----------------------------------------

    if (
      !name ||
      !email ||
      !location ||
      !vehicleYear ||
      !vehicleMake ||
      !vehicleModel ||
      !buildDetails ||
      !rigStory
    ) {
      return NextResponse.json(
        { error: "Please complete all required fields." },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    // -----------------------------------------
    // 2. Validate photos
    // -----------------------------------------

    const photos = formData
      .getAll("photos")
      .filter((item): item is File => item instanceof File && item.size > 0);

    if (photos.length < 2) {
      return NextResponse.json(
        { error: "Please upload at least 2 vehicle photos." },
        { status: 400 }
      );
    }

    if (photos.length > MAX_PHOTOS) {
      return NextResponse.json(
        { error: `You may upload a maximum of ${MAX_PHOTOS} photos.` },
        { status: 400 }
      );
    }

    for (const photo of photos) {
      if (!allowedTypes.includes(photo.type)) {
        return NextResponse.json(
          {
            error:
              "Photos must be JPG, PNG, WEBP, HEIC, or HEIF files.",
          },
          { status: 400 }
        );
      }

      if (photo.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          {
            error: "Each photo must be 8 MB or smaller.",
          },
          { status: 400 }
        );
      }
    }

    // -----------------------------------------
    // 3. Generate submission ID
    // -----------------------------------------

    const submissionId = crypto.randomUUID();

    // -----------------------------------------
    // 4. Upload photos to Supabase Storage
    // -----------------------------------------

    const photoUrls: string[] = [];

    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];

      const extension =
        getFileExtension(photo.name) ||
        getExtensionFromMimeType(photo.type) ||
        "jpg";

      const storagePath = `${submissionId}/${i + 1}-${crypto.randomUUID()}.${extension}`;

      const bytes = await photo.arrayBuffer();

      const { error: uploadError } = await supabaseAdmin.storage
        .from(STORAGE_BUCKET)
        .upload(storagePath, bytes, {
          contentType: photo.type,
          upsert: false,
        });

      if (uploadError) {
        console.error("Featured Rig photo upload error:", uploadError);

        await cleanupUploads(uploadedPaths);

        return NextResponse.json(
          { error: "Unable to upload vehicle photos." },
          { status: 500 }
        );
      }

      uploadedPaths.push(storagePath);

      const { data: publicUrlData } = supabaseAdmin.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(storagePath);

      photoUrls.push(publicUrlData.publicUrl);
    }

    // -----------------------------------------
    // 5. Save submission to database
    // -----------------------------------------

    const { data: submission, error: submissionError } =
      await supabaseAdmin
        .from("trailhead_featured_rig_submissions")
        .insert({
          id: submissionId,

          name,
          email,
          phone: phone || null,

          location,

          vehicle_year: vehicleYear,
          vehicle_make: vehicleMake,
          vehicle_model: vehicleModel,
          vehicle_name: vehicleName || null,

          instagram: instagram || null,

          build_details: buildDetails,
          rig_story: rigStory,

          photo_urls: photoUrls,
        })
        .select("*")
        .single();

    if (submissionError) {
      console.error(
        "Featured Rig submission database error:",
        submissionError
      );

      await cleanupUploads(uploadedPaths);

      return NextResponse.json(
        { error: "Unable to save your Featured Rig submission." },
        { status: 500 }
      );
    }

    // -----------------------------------------
    // 6. Build photo links for notification
    // -----------------------------------------

    const photoLinks = photoUrls
      .map(
        (url, index) => `
          <li style="margin-bottom:8px;">
            <a href="${escapeHtml(url)}">
              View Vehicle Photo ${index + 1}
            </a>
          </li>
        `
      )
      .join("");

    const vehicleDisplay = [
      vehicleYear,
      vehicleMake,
      vehicleModel,
    ]
      .filter(Boolean)
      .join(" ");

    // -----------------------------------------
    // 7. Send Trailhead notification email
    // -----------------------------------------

    const { error: emailError } = await resend.emails.send({
      from: "Peach State Off-Road <notifications@peachstateoffroad.com>",
      to: TRAILHEAD_EMAIL,
      replyTo: email,
      subject: `Trailhead Featured Rig Submission — ${vehicleDisplay}`,
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#222;max-width:700px;margin:auto;">
          
          <h2 style="margin-bottom:4px;">
            New Trailhead Featured Rig Submission
          </h2>

          <p style="color:#666;margin-top:0;">
            A new vehicle has been submitted for consideration for
            The Trailhead Featured Rig Area.
          </p>

          <hr style="border:none;border-top:1px solid #ddd;margin:24px 0;" />

          <h3>Applicant</h3>

          <p>
            <strong>Name:</strong>
            ${escapeHtml(name)}
          </p>

          <p>
            <strong>Email:</strong>
            ${escapeHtml(email)}
          </p>

          <p>
            <strong>Phone:</strong>
            ${escapeHtml(phone || "Not provided")}
          </p>

          <p>
            <strong>Location:</strong>
            ${escapeHtml(location)}
          </p>

          <hr style="border:none;border-top:1px solid #ddd;margin:24px 0;" />

          <h3>Vehicle</h3>

          <p>
            <strong>Year:</strong>
            ${escapeHtml(vehicleYear)}
          </p>

          <p>
            <strong>Make:</strong>
            ${escapeHtml(vehicleMake)}
          </p>

          <p>
            <strong>Model:</strong>
            ${escapeHtml(vehicleModel)}
          </p>

          <p>
            <strong>Vehicle Name:</strong>
            ${escapeHtml(vehicleName || "Not provided")}
          </p>

          <p>
            <strong>Instagram:</strong>
            ${escapeHtml(instagram || "Not provided")}
          </p>

          <hr style="border:none;border-top:1px solid #ddd;margin:24px 0;" />

          <h3>Build Details</h3>

          <p style="white-space:pre-wrap;">
            ${escapeHtml(buildDetails)}
          </p>

          <h3>Rig Story</h3>

          <p style="white-space:pre-wrap;">
            ${escapeHtml(rigStory)}
          </p>

          <h3>Vehicle Photos</h3>

          <ul>
            ${photoLinks}
          </ul>

          <hr style="border:none;border-top:1px solid #ddd;margin:24px 0;" />

          <p style="font-size:13px;color:#777;">
            Submission ID: ${escapeHtml(submission.id)}
          </p>

        </div>
      `,
    });

    // We keep the submission even if the notification email fails.
    // That way a Resend problem never destroys someone's application.

    if (emailError) {
      console.error(
        "Featured Rig notification email error:",
        emailError
      );

      return NextResponse.json({
        success: true,
        warning:
          "Your submission was saved, but the notification email could not be sent.",
      });
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Featured Rig submission API error:", error);

    if (uploadedPaths.length > 0) {
      await cleanupUploads(uploadedPaths);
    }

    return NextResponse.json(
      { error: "Something went wrong submitting your rig." },
      { status: 500 }
    );
  }
}

// -----------------------------------------
// Helpers
// -----------------------------------------

function getText(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getFileExtension(filename: string) {
  const parts = filename.split(".");

  if (parts.length < 2) {
    return "";
  }

  return parts.pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "";
}

function getExtensionFromMimeType(type: string) {
  switch (type) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/heic":
      return "heic";
    case "image/heif":
      return "heif";
    default:
      return "";
  }
}

async function cleanupUploads(paths: string[]) {
  if (paths.length === 0) return;

  const { error } = await supabaseAdmin.storage
    .from(STORAGE_BUCKET)
    .remove(paths);

  if (error) {
    console.error(
      "Featured Rig upload cleanup error:",
      error
    );
  }
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}