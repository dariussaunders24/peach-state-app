
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const resend = new Resend(process.env.RESEND_API_KEY);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const TRAILHEAD_EMAIL = "thetrailheadinfo@gmail.com";
const STORAGE_BUCKET = "trailhead-featured-rigs";

const MIN_PHOTOS = 2;
const MAX_PHOTOS = 4;
const MAX_FILE_SIZE = 8 * 1024 * 1024;

const allowedTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];

type ImageFormat = {
  mime: string;
  extension: string;
};

export async function POST(req: Request) {
  const uploadedPaths: string[] = [];
  let submissionSaved = false;

  try {
    const formData = await req.formData();

    // -----------------------------------------
    // 1. Read application fields
    // -----------------------------------------

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
    // 2. Validate required fields
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
    // 3. Validate photo count
    // -----------------------------------------

    const photos = formData
      .getAll("photos")
      .filter(
        (item): item is File =>
          item instanceof File && item.size > 0
      );

    if (photos.length < MIN_PHOTOS) {
      return NextResponse.json(
        { error: "Please upload at least 2 vehicle photos." },
        { status: 400 }
      );
    }

    if (photos.length > MAX_PHOTOS) {
      return NextResponse.json(
        {
          error: `You may upload a maximum of ${MAX_PHOTOS} photos.`,
        },
        { status: 400 }
      );
    }

    // -----------------------------------------
    // 4. Validate photo sizes and formats
    // -----------------------------------------

    const validatedPhotos: {
      file: File;
      format: ImageFormat;
    }[] = [];

    for (const photo of photos) {
      if (photo.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          {
            error:
              `"${photo.name}" is larger than 8 MB after processing. ` +
              "Please choose a smaller photo.",
          },
          { status: 400 }
        );
      }

      const format = await detectImageFormat(photo);

      if (!format || !allowedTypes.includes(format.mime)) {
        return NextResponse.json(
          {
            error:
              `"${photo.name}" is not a supported image. ` +
              "Please upload JPG, PNG, WEBP, HEIC, or HEIF photos.",
          },
          { status: 400 }
        );
      }

      validatedPhotos.push({ file: photo, format });
    }

    // -----------------------------------------
    // 5. Generate submission ID
    // -----------------------------------------

    const submissionId = crypto.randomUUID();

    // -----------------------------------------
    // 6. Upload photos to Supabase
    // -----------------------------------------

    const photoUrls: string[] = [];

    for (let i = 0; i < validatedPhotos.length; i++) {
      const { file, format } = validatedPhotos[i];

      const storagePath =
        `${submissionId}/` +
        `${i + 1}-${crypto.randomUUID()}.${format.extension}`;

      const bytes = await file.arrayBuffer();

      const { error: uploadError } =
        await supabaseAdmin.storage
          .from(STORAGE_BUCKET)
          .upload(storagePath, bytes, {
            contentType: format.mime,
            upsert: false,
          });

      if (uploadError) {
        console.error(
          "Featured Rig photo upload error:",
          uploadError
        );

        await cleanupUploads(uploadedPaths);

        return NextResponse.json(
          {
            error:
              "Unable to upload vehicle photos. Please try again.",
          },
          { status: 500 }
        );
      }

      uploadedPaths.push(storagePath);

      const { data: publicUrlData } =
        supabaseAdmin.storage
          .from(STORAGE_BUCKET)
          .getPublicUrl(storagePath);

      photoUrls.push(publicUrlData.publicUrl);
    }

    // -----------------------------------------
    // 7. Save submission to database
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
        {
          error:
            "Unable to save your Featured Rig submission.",
        },
        { status: 500 }
      );
    }

    submissionSaved = true;

    // -----------------------------------------
    // 8. Build notification email
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
    // 9. Send notification email
    // -----------------------------------------

    try {
      const { error: emailError } =
        await resend.emails.send({
          from:
            "Peach State Off-Road <notifications@peachstateoffroad.com>",

          to: TRAILHEAD_EMAIL,
          replyTo: email,

          subject:
            `Trailhead Featured Rig Submission — ${vehicleDisplay}`,

          html: `
            <div style="
              font-family:Arial,sans-serif;
              line-height:1.6;
              color:#222;
              max-width:700px;
              margin:auto;
            ">

              <h2>
                New Trailhead Featured Rig Submission
              </h2>

              <p>
                A new vehicle has been submitted for
                consideration for The Trailhead
                Featured Rig Area.
              </p>

              <hr />

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

              <hr />

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

              <hr />

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

              <hr />

              <p style="
                font-size:13px;
                color:#777;
              ">
                Submission ID:
                ${escapeHtml(submission.id)}
              </p>

            </div>
          `,
        });

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
    } catch (emailException) {
      console.error(
        "Featured Rig notification exception:",
        emailException
      );

      return NextResponse.json({
        success: true,
        warning:
          "Your submission was saved, but the notification email could not be sent.",
      });
    }

    // -----------------------------------------
    // 10. Success
    // -----------------------------------------

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "Featured Rig submission API error:",
      error
    );

    // Never delete photos belonging to
    // an already-saved submission.
    if (!submissionSaved && uploadedPaths.length > 0) {
      await cleanupUploads(uploadedPaths);
    }

    return NextResponse.json(
      {
        error:
          "Something went wrong submitting your rig.",
      },
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

// -----------------------------------------
// Detect actual image format from file bytes
// -----------------------------------------

async function detectImageFormat(
  file: File
): Promise<ImageFormat | null> {
  const header = new Uint8Array(
    await file.slice(0, 32).arrayBuffer()
  );

  // JPEG
  if (
    header.length >= 3 &&
    header[0] === 0xff &&
    header[1] === 0xd8 &&
    header[2] === 0xff
  ) {
    return {
      mime: "image/jpeg",
      extension: "jpg",
    };
  }

  // PNG
  if (
    header.length >= 8 &&
    header[0] === 0x89 &&
    header[1] === 0x50 &&
    header[2] === 0x4e &&
    header[3] === 0x47 &&
    header[4] === 0x0d &&
    header[5] === 0x0a &&
    header[6] === 0x1a &&
    header[7] === 0x0a
  ) {
    return {
      mime: "image/png",
      extension: "png",
    };
  }

  const ascii = (
    start: number,
    end: number
  ) =>
    String.fromCharCode(
      ...header.slice(start, end)
    );

  // WEBP
  if (
    header.length >= 12 &&
    ascii(0, 4) === "RIFF" &&
    ascii(8, 12) === "WEBP"
  ) {
    return {
      mime: "image/webp",
      extension: "webp",
    };
  }

  // HEIC / HEIF
  if (
    header.length >= 12 &&
    ascii(4, 8) === "ftyp"
  ) {
    const brand = ascii(8, 12);

    if (
      [
        "heic",
        "heix",
        "hevc",
        "hevx",
      ].includes(brand)
    ) {
      return {
        mime: "image/heic",
        extension: "heic",
      };
    }

    if (
      [
        "mif1",
        "msf1",
      ].includes(brand)
    ) {
      return {
        mime: "image/heif",
        extension: "heif",
      };
    }
  }

  return null;
}

// -----------------------------------------
// Cleanup incomplete uploads
// -----------------------------------------

async function cleanupUploads(paths: string[]) {
  if (paths.length === 0) {
    return;
  }

  const { error } =
    await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .remove(paths);

  if (error) {
    console.error(
      "Featured Rig upload cleanup error:",
      error
    );
  }
}

// -----------------------------------------
// Escape HTML for email safety
// -----------------------------------------

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
