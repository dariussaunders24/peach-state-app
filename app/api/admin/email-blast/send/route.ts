import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";
import sanitizeHtml from "sanitize-html";

const resend = new Resend(process.env.RESEND_API_KEY);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const FROM_EMAIL =
  "Peach State Off-Road <notifications@peachstateoffroad.com>";

type Recipient = {
  id: string;
  email: string;
  name: string;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function sanitizeMessageHtml(messageHtml: string) {
  return sanitizeHtml(messageHtml, {
    allowedTags: [
      "p",
      "br",
      "strong",
      "b",
      "em",
      "i",
      "u",
      "h1",
      "h2",
      "h3",
      "ul",
      "ol",
      "li",
      "a",
      "span",
    ],

    allowedAttributes: {
      a: [
        "href",
        "target",
        "rel",
      ],

      span: [
        "style",
      ],

      p: [
        "style",
      ],

      h1: [
        "style",
      ],

      h2: [
        "style",
      ],

      h3: [
        "style",
      ],
    },

    allowedStyles: {
      "*": {
        "font-family": [
          /^Canva$/i,
          /^Cinzel$/i,
          /^Arial$/i,
          /^Georgia$/i,
          /^serif$/i,
          /^sans-serif$/i,
        ],
      },
    },

    allowedSchemes: [
      "http",
      "https",
      "mailto",
    ],

    transformTags: {
      a: sanitizeHtml.simpleTransform(
        "a",
        {
          target: "_blank",
          rel: "noopener noreferrer",
        },
        true
      ),
    },
  });
}

function buildEmailHtml({
  heading,
  messageHtml,
  buttonText,
  buttonUrl,
}: {
  heading?: string | null;
  messageHtml: string;
  buttonText?: string | null;
  buttonUrl?: string | null;
}) {
  const cleanMessage =
    sanitizeMessageHtml(messageHtml);

  return `
<!DOCTYPE html>

<html>

<head>
  <meta charset="UTF-8" />

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />

  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&display=swap');

    .email-message p {
      margin:0 0 16px 0;
    }

    .email-message h1,
    .email-message h2,
    .email-message h3 {
      margin:24px 0 12px 0;
      color:#171717;
      line-height:1.25;
    }

    .email-message h1 {
      font-size:28px;
    }

    .email-message h2 {
      font-size:24px;
    }

    .email-message h3 {
      font-size:20px;
    }

    .email-message ul {
      margin:12px 0 18px 0;
      padding-left:26px;
    }

    .email-message ol {
      margin:12px 0 18px 0;
      padding-left:26px;
    }

    .email-message li {
      margin-bottom:7px;
    }

    .email-message a {
      color:#D96E32;
      text-decoration:underline;
    }
  </style>
</head>

<body
  style="
    margin:0;
    padding:0;
    background-color:#101010;
    font-family:Arial, Helvetica, sans-serif;
  "
>

  <table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="
      background-color:#101010;
      padding:30px 15px;
    "
  >

    <tr>
      <td align="center">

        <table
          width="100%"
          cellpadding="0"
          cellspacing="0"
          border="0"
          style="
            max-width:650px;
            background-color:#ffffff;
            border-radius:14px;
            overflow:hidden;
          "
        >

          <!-- HEADER -->

          <tr>
            <td
              align="center"
              bgcolor="#000000"
              style="
                background-color:#000000;
                padding:28px 35px;
              "
            >

              <img
                src="https://www.peachstateoffroad.com/peach-state-email-logo.png"
                alt="Peach State Off-Road and Overlanding"
                width="520"
                style="
                  display:block;
                  width:100%;
                  max-width:520px;
                  height:auto;
                  margin:0 auto;
                  border:0;
                "
              />

            </td>
          </tr>

          <!-- ORANGE ACCENT -->

          <tr>
            <td
              bgcolor="#F28C52"
              style="
                height:5px;
                background-color:#F28C52;
                font-size:0;
                line-height:0;
              "
            >
              &nbsp;
            </td>
          </tr>

          <!-- EMAIL CONTENT -->

          <tr>

            <td
              style="
                padding:36px 32px 32px 32px;
              "
            >

              ${
                heading
                  ? `
                    <h1
                      style="
                        margin:0 0 24px 0;
                        font-family:'Cinzel', Georgia, serif;
                        font-size:27px;
                        font-weight:700;
                        line-height:1.25;
                        color:#171717;
                      "
                    >
                      ${escapeHtml(heading)}
                    </h1>
                  `
                  : ""
              }

              <div
                class="email-message"
                style="
                  font-family:Arial, Helvetica, sans-serif;
                  font-size:16px;
                  line-height:1.7;
                  color:#333333;
                "
              >
                ${cleanMessage}
              </div>

              ${
                buttonText && buttonUrl
                  ? `
                    <table
                      width="100%"
                      cellpadding="0"
                      cellspacing="0"
                      border="0"
                      style="
                        margin-top:30px;
                      "
                    >
                      <tr>

                        <td align="center">

                          <a
                            href="${escapeHtml(buttonUrl)}"
                            target="_blank"
                            rel="noopener noreferrer"
                            style="
                              display:inline-block;
                              background-color:#F28C52;
                              color:#111111;
                              text-decoration:none;
                              font-size:16px;
                              font-weight:700;
                              padding:15px 28px;
                              border-radius:8px;
                            "
                          >
                            ${escapeHtml(buttonText)}
                          </a>

                        </td>

                      </tr>
                    </table>
                  `
                  : ""
              }

            </td>

          </tr>

          <!-- TAGLINE -->

          <tr>

            <td
              align="center"
              bgcolor="#f7f7f7"
              style="
                background-color:#f7f7f7;
                border-top:1px solid #eeeeee;
                padding:24px 25px 18px 25px;
              "
            >

              <div
                style="
                  font-size:16px;
                  font-weight:700;
                  color:#333333;
                "
              >
                Get Out.
                <span style="color:#F28C52;">
                  Explore.
                </span>
                Belong.
              </div>

            </td>

          </tr>

          <!-- FOOTER -->

          <tr>

            <td
              align="center"
              bgcolor="#f7f7f7"
              style="
                background-color:#f7f7f7;
                padding:0 25px 26px 25px;
              "
            >

              <div
                style="
                  font-size:12px;
                  line-height:1.6;
                  color:#777777;
                "
              >
                Peach State Off-Road and Overlanding

                <br />

                peachstateoffroad.com

                <br />
                <br />

                You are receiving this email because you are a registered
                Peach State Off-Road and Overlanding member.
              </div>

            </td>

          </tr>

        </table>

      </td>
    </tr>

  </table>

</body>

</html>
`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      subject,
      heading,
      messageHtml,
      buttonText,
      buttonUrl,
      recipientIds,
    } = body;

    // -----------------------------------------
    // Validate
    // -----------------------------------------

    if (!subject?.trim()) {
      return NextResponse.json(
        {
          error:
            "Subject is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !messageHtml ||
      typeof messageHtml !== "string"
    ) {
      return NextResponse.json(
        {
          error:
            "Message is required.",
        },
        {
          status: 400,
        }
      );
    }

    const cleanMessage =
      sanitizeMessageHtml(messageHtml);

    const textOnlyMessage =
      cleanMessage
        .replace(/<br\s*\/?>/gi, " ")
        .replace(/<[^>]+>/g, "")
        .replace(/&nbsp;/g, " ")
        .trim();

    if (!textOnlyMessage) {
      return NextResponse.json(
        {
          error:
            "Message is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !Array.isArray(recipientIds) ||
      recipientIds.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "No recipients selected.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      buttonText?.trim() &&
      !buttonUrl?.trim()
    ) {
      return NextResponse.json(
        {
          error:
            "Button URL is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      buttonUrl?.trim() &&
      !buttonText?.trim()
    ) {
      return NextResponse.json(
        {
          error:
            "Button text is required.",
        },
        {
          status: 400,
        }
      );
    }

    // -----------------------------------------
    // Load all Auth users
    // -----------------------------------------

    const authUsers: {
      id: string;
      email: string;
    }[] = [];

    let page = 1;

    const perPage = 1000;

    while (true) {
      const {
        data: {
          users,
        },
        error,
      } =
        await supabaseAdmin.auth.admin.listUsers(
          {
            page,
            perPage,
          }
        );

      if (error) {
        console.error(
          "Error loading Auth users:",
          error
        );

        return NextResponse.json(
          {
            error:
              "Could not load recipients.",
          },
          {
            status: 500,
          }
        );
      }

      for (const user of users) {
        if (!user.email) {
          continue;
        }

        authUsers.push({
          id: user.id,
          email: user.email,
        });
      }

      if (
        users.length < perPage
      ) {
        break;
      }

      page++;
    }

    // -----------------------------------------
    // Load profiles
    // -----------------------------------------

    const {
      data: profiles,
      error: profileError,
    } =
      await supabaseAdmin
        .from("profiles")
        .select(
          "user_id, name, is_banned"
        );

    if (profileError) {
      console.error(
        "Profile error:",
        profileError
      );

      return NextResponse.json(
        {
          error:
            "Could not load member profiles.",
        },
        {
          status: 500,
        }
      );
    }

    const profileMap =
      new Map(
        (profiles || []).map(
          (profile) => [
            profile.user_id,
            profile,
          ]
        )
      );

    // -----------------------------------------
    // Build selected recipient list
    // -----------------------------------------

    const selectedSet =
      new Set(recipientIds);

    const recipients: Recipient[] =
      authUsers
        .filter((user) => {
          if (
            !selectedSet.has(user.id)
          ) {
            return false;
          }

          const profile =
            profileMap.get(user.id);

          if (
            profile?.is_banned ===
            true
          ) {
            return false;
          }

          return true;
        })
        .map((user) => {
          const profile =
            profileMap.get(user.id);

          return {
            id: user.id,
            email: user.email,
            name:
              profile?.name?.trim() ||
              "Unnamed Member",
          };
        });

    if (
      recipients.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "No valid recipients found.",
        },
        {
          status: 400,
        }
      );
    }

    // -----------------------------------------
    // Create blast record
    // -----------------------------------------

    const {
      data: blast,
      error: blastError,
    } =
      await supabaseAdmin
        .from("email_blasts")
        .insert({
          subject:
            subject.trim(),

          heading:
            heading?.trim() ||
            null,

          message:
            cleanMessage,

          button_text:
            buttonText?.trim() ||
            null,

          button_url:
            buttonUrl?.trim() ||
            null,

          total_recipients:
            recipients.length,

          successful_recipients:
            0,

          failed_recipients:
            0,

          status:
            "sending",
        })
        .select("id")
        .single();

    if (
      blastError ||
      !blast
    ) {
      console.error(
        "Blast insert error:",
        blastError
      );

      return NextResponse.json(
        {
          error:
            "Could not create email blast record.",
        },
        {
          status: 500,
        }
      );
    }

    // -----------------------------------------
    // Insert recipient records
    // -----------------------------------------

    const recipientRows =
      recipients.map(
        (recipient) => ({
          blast_id:
            blast.id,

          user_id:
            recipient.id,

          email:
            recipient.email,

          name:
            recipient.name,

          status:
            "pending",
        })
      );

    const {
      error:
        recipientInsertError,
    } =
      await supabaseAdmin
        .from(
          "email_blast_recipients"
        )
        .insert(
          recipientRows
        );

    if (
      recipientInsertError
    ) {
      console.error(
        "Recipient record insert error:",
        recipientInsertError
      );

      await supabaseAdmin
        .from("email_blasts")
        .update({
          status:
            "failed",
        })
        .eq(
          "id",
          blast.id
        );

      return NextResponse.json(
        {
          error:
            "Could not create recipient records.",
        },
        {
          status: 500,
        }
      );
    }

    // -----------------------------------------
    // Build final email HTML
    // -----------------------------------------

    const html =
      buildEmailHtml({
        heading:
          heading?.trim() ||
          null,

        messageHtml:
          cleanMessage,

        buttonText:
          buttonText?.trim() ||
          null,

        buttonUrl:
          buttonUrl?.trim() ||
          null,
      });

    let successfulRecipients =
      0;

    let failedRecipients =
      0;

    // -----------------------------------------
    // Send in batches of 100
    // -----------------------------------------

    const batchSize =
      100;

    for (
      let i = 0;
      i < recipients.length;
      i += batchSize
    ) {
      const batch =
        recipients.slice(
          i,
          i + batchSize
        );

      const emails =
        batch.map(
          (recipient) => ({
            from:
              FROM_EMAIL,

            to: [
              recipient.email,
            ],

            subject:
              subject.trim(),

            html,
          })
        );

      try {
        const {
          data,
          error,
        } =
          await resend.batch.send(
            emails
          );

        if (
          error ||
          !data
        ) {
          console.error(
            "Resend batch error:",
            error
          );

          failedRecipients +=
            batch.length;

          await supabaseAdmin
            .from(
              "email_blast_recipients"
            )
            .update({
              status:
                "failed",

              error_message:
                error?.message ||
                "Unknown Resend batch error",
            })
            .eq(
              "blast_id",
              blast.id
            )
            .in(
              "user_id",
              batch.map(
                (recipient) =>
                  recipient.id
              )
            );

          continue;
        }

        for (
          let index = 0;
          index < batch.length;
          index++
        ) {
          const recipient =
            batch[index];

          const result =
            data.data?.[
              index
            ];

          if (result?.id) {
            successfulRecipients++;

            await supabaseAdmin
              .from(
                "email_blast_recipients"
              )
              .update({
                status:
                  "sent",

                resend_email_id:
                  result.id,

                sent_at:
                  new Date().toISOString(),
              })
              .eq(
                "blast_id",
                blast.id
              )
              .eq(
                "user_id",
                recipient.id
              );
          } else {
            failedRecipients++;

            await supabaseAdmin
              .from(
                "email_blast_recipients"
              )
              .update({
                status:
                  "failed",

                error_message:
                  "Resend did not return an email ID.",
              })
              .eq(
                "blast_id",
                blast.id
              )
              .eq(
                "user_id",
                recipient.id
              );
          }
        }
      } catch (error) {
        console.error(
          "Unexpected batch send error:",
          error
        );

        failedRecipients +=
          batch.length;

        await supabaseAdmin
          .from(
            "email_blast_recipients"
          )
          .update({
            status:
              "failed",

            error_message:
              error instanceof Error
                ? error.message
                : "Unexpected send error",
          })
          .eq(
            "blast_id",
            blast.id
          )
          .in(
            "user_id",
            batch.map(
              (recipient) =>
                recipient.id
            )
          );
      }
    }

    // -----------------------------------------
    // Finish blast
    // -----------------------------------------

    let finalStatus =
      "completed";

    if (
      successfulRecipients === 0
    ) {
      finalStatus =
        "failed";
    } else if (
      failedRecipients > 0
    ) {
      finalStatus =
        "completed_with_errors";
    }

    await supabaseAdmin
      .from("email_blasts")
      .update({
        successful_recipients:
          successfulRecipients,

        failed_recipients:
          failedRecipients,

        status:
          finalStatus,

        completed_at:
          new Date().toISOString(),
      })
      .eq(
        "id",
        blast.id
      );

    return NextResponse.json({
      success: true,

      blastId:
        blast.id,

      totalRecipients:
        recipients.length,

      successfulRecipients,

      failedRecipients,

      status:
        finalStatus,
    });
  } catch (error) {
    console.error(
      "Email blast send error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong sending the email blast.",
      },
      {
        status: 500,
      }
    );
  }
}