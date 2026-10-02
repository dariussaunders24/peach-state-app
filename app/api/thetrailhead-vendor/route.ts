import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

const resend = new Resend(process.env.RESEND_API_KEY);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const TRAILHEAD_EMAIL = "thetrailheadinfo@gmail.com";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const businessName = clean(body.business_name);
    const contactName = clean(body.contact_name);
    const email = clean(body.email);
    const phone = clean(body.phone);
    const websiteSocial = clean(body.website_social);
    const businessType = clean(body.business_type);
    const productsServices = clean(body.products_services);
    const setupDescription = clean(body.setup_description);
    const spaceNeeded = clean(body.space_needed);
    const powerNeeded = clean(body.power_needed);
    const additionalNotes = clean(body.additional_notes);

    // -----------------------------------------
    // Validate required fields
    // -----------------------------------------

    if (
      !businessName ||
      !contactName ||
      !email ||
      !businessType ||
      !productsServices
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
    // Save submission
    // -----------------------------------------

    const { data: submission, error: submissionError } =
      await supabaseAdmin
        .from("trailhead_vendor_submissions")
        .insert({
          business_name: businessName,
          contact_name: contactName,
          email,
          phone: phone || null,

          website_social: websiteSocial || null,
          business_type: businessType,
          products_services: productsServices,

          setup_description: setupDescription || null,
          space_needed: spaceNeeded || null,
          power_needed: powerNeeded || null,
          additional_notes: additionalNotes || null,
        })
        .select("*")
        .single();

    if (submissionError) {
      console.error(
        "Trailhead vendor submission database error:",
        submissionError
      );

      return NextResponse.json(
        { error: "Unable to save your vendor submission." },
        { status: 500 }
      );
    }

    // -----------------------------------------
    // Send notification email
    // -----------------------------------------

    const { error: emailError } = await resend.emails.send({
      from: "Peach State Off-Road <notifications@peachstateoffroad.com>",
      to: TRAILHEAD_EMAIL,
      replyTo: email,
      subject: `Trailhead Vendor Submission — ${businessName}`,
      html: `
        <div style="
          font-family:Arial,sans-serif;
          line-height:1.6;
          color:#222;
          max-width:700px;
          margin:auto;
        ">

          <h2 style="margin-bottom:4px;">
            New Trailhead Vendor Submission
          </h2>

          <p style="color:#666;margin-top:0;">
            A business has submitted an inquiry about becoming
            a vendor at The Trailhead.
          </p>

          <hr style="
            border:none;
            border-top:1px solid #ddd;
            margin:24px 0;
          " />

          <h3>Business Information</h3>

          <p>
            <strong>Business Name:</strong><br />
            ${escapeHtml(businessName)}
          </p>

          <p>
            <strong>Business Type:</strong><br />
            ${escapeHtml(businessType)}
          </p>

          <p>
            <strong>Website / Social Media:</strong><br />
            ${escapeHtml(websiteSocial || "Not provided")}
          </p>

          <h3>Contact Information</h3>

          <p>
            <strong>Contact Name:</strong><br />
            ${escapeHtml(contactName)}
          </p>

          <p>
            <strong>Email:</strong><br />
            ${escapeHtml(email)}
          </p>

          <p>
            <strong>Phone:</strong><br />
            ${escapeHtml(phone || "Not provided")}
          </p>

          <hr style="
            border:none;
            border-top:1px solid #ddd;
            margin:24px 0;
          " />

          <h3>Products / Services</h3>

          <p style="white-space:pre-wrap;">
            ${escapeHtml(productsServices)}
          </p>

          <h3>Vendor Setup</h3>

          <p style="white-space:pre-wrap;">
            ${escapeHtml(
              setupDescription || "Not provided"
            )}
          </p>

          <p>
            <strong>Space Needed:</strong><br />
            ${escapeHtml(spaceNeeded || "Not provided")}
          </p>

          <p>
            <strong>Power Needed:</strong><br />
            ${escapeHtml(powerNeeded || "Not provided")}
          </p>

          <h3>Additional Notes</h3>

          <p style="white-space:pre-wrap;">
            ${escapeHtml(
              additionalNotes || "None provided"
            )}
          </p>

          <hr style="
            border:none;
            border-top:1px solid #ddd;
            margin:24px 0;
          " />

          <p style="font-size:13px;color:#777;">
            Submission ID:
            ${escapeHtml(submission.id)}
          </p>

        </div>
      `,
    });

    // Keep the database submission even if Resend fails.
    if (emailError) {
      console.error(
        "Trailhead vendor notification email error:",
        emailError
      );

      return NextResponse.json({
        success: true,
        warning:
          "Your vendor inquiry was saved, but the notification email could not be sent.",
      });
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "Trailhead vendor submission API error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong submitting your vendor inquiry.",
      },
      { status: 500 }
    );
  }
}

// -----------------------------------------
// Helpers
// -----------------------------------------

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}