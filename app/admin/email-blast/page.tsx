"use client";

import { useEffect, useMemo, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import { TextStyle, FontFamily } from "@tiptap/extension-text-style";

type Recipient = {
  id: string;
  name: string;
  email: string;
};

export default function EmailBlastPage() {
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [subject, setSubject] = useState("");
  const [heading, setHeading] = useState("");
  const [buttonText, setButtonText] = useState("");
  const [buttonUrl, setButtonUrl] = useState("");

  const [search, setSearch] = useState("");

  const [loadingRecipients, setLoadingRecipients] = useState(true);
  const [sending, setSending] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // -----------------------------------------
  // Rich text editor
  // -----------------------------------------

  const editor = useEditor({
    immediatelyRender: false,

    extensions: [
      StarterKit,

      Underline,

      TextStyle,

      FontFamily.configure({
        types: ["textStyle"],
      }),

      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
        HTMLAttributes: {
          target: "_blank",
          rel: "noopener noreferrer",
        },
      }),
    ],

    content: "",

    editorProps: {
      attributes: {
        class:
          "min-h-[300px] w-full px-4 py-4 text-black outline-none",
      },
    },
  });

  // -----------------------------------------
  // Load recipients
  // -----------------------------------------

  useEffect(() => {
    loadRecipients();
  }, []);

  async function loadRecipients() {
    setLoadingRecipients(true);
    setError("");

    try {
      const response = await fetch(
        "/api/admin/email-blast/recipients"
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to load recipients."
        );
      }

      const loadedRecipients: Recipient[] =
        data.recipients || [];

      setRecipients(loadedRecipients);

      // Everyone selected by default
      setSelectedIds(
        new Set(
          loadedRecipients.map(
            (recipient) => recipient.id
          )
        )
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong loading recipients."
      );
    } finally {
      setLoadingRecipients(false);
    }
  }

  // -----------------------------------------
  // Recipient selection
  // -----------------------------------------

  function toggleRecipient(id: string) {
    setSelectedIds((current) => {
      const next = new Set(current);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  }

  function selectAll() {
    setSelectedIds(
      new Set(
        recipients.map(
          (recipient) => recipient.id
        )
      )
    );
  }

  function deselectAll() {
    setSelectedIds(new Set());
  }

  const filteredRecipients = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return recipients;
    }

    return recipients.filter((recipient) => {
      return (
        recipient.name
          .toLowerCase()
          .includes(term) ||
        recipient.email
          .toLowerCase()
          .includes(term)
      );
    });
  }, [recipients, search]);

  // -----------------------------------------
  // Font
  // -----------------------------------------

  function changeFont(font: string) {
    if (!editor) return;

    if (!font) {
      editor
        .chain()
        .focus()
        .unsetFontFamily()
        .run();

      return;
    }

    editor
      .chain()
      .focus()
      .setFontFamily(font)
      .run();
  }

  // -----------------------------------------
  // Links
  // -----------------------------------------

  function addLink() {
    if (!editor) return;

    const existingUrl =
      editor.getAttributes("link").href || "";

    const url = window.prompt(
      "Enter the link URL:",
      existingUrl
    );

    if (url === null) {
      return;
    }

    if (url.trim() === "") {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .unsetLink()
        .run();

      return;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({
        href: url.trim(),
      })
      .run();
  }

  // -----------------------------------------
  // Send blast
  // -----------------------------------------

  async function handleSend() {
    setError("");
    setSuccess("");

    if (!subject.trim()) {
      setError("Enter an email subject.");
      return;
    }

    if (!editor || editor.isEmpty) {
      setError("Enter an email message.");
      return;
    }

    if (selectedIds.size === 0) {
      setError("Select at least one recipient.");
      return;
    }

    if (
      buttonText.trim() &&
      !buttonUrl.trim()
    ) {
      setError(
        "Add a URL for the email button."
      );
      return;
    }

    if (
      buttonUrl.trim() &&
      !buttonText.trim()
    ) {
      setError(
        "Add button text for the email button."
      );
      return;
    }

    const selectedRecipients =
      recipients.filter((recipient) =>
        selectedIds.has(recipient.id)
      );

    const confirmed = window.confirm(
      `Send this email to ${selectedRecipients.length.toLocaleString()} recipient${
        selectedRecipients.length === 1
          ? ""
          : "s"
      }?`
    );

    if (!confirmed) {
      return;
    }

    setSending(true);

    try {
      const response = await fetch(
        "/api/admin/email-blast/send",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            subject: subject.trim(),

            heading:
              heading.trim() || null,

            // Rich HTML from Tiptap
            messageHtml:
              editor.getHTML(),

            buttonText:
              buttonText.trim() || null,

            buttonUrl:
              buttonUrl.trim() || null,

            recipientIds:
              selectedRecipients.map(
                (recipient) =>
                  recipient.id
              ),
          }),
        }
      );

      const responseText =
        await response.text();

      let data: any = {};

      if (responseText) {
        try {
          data =
            JSON.parse(responseText);
        } catch {
          console.error(
            "Non-JSON response:",
            responseText
          );
        }
      }

      if (!response.ok) {
        throw new Error(
          data.error ||
            `Email send failed with status ${response.status}.`
        );
      }

      setSuccess(
        `Email blast sent to ${
          data.successfulRecipients?.toLocaleString?.() ??
          selectedRecipients.length
        } recipients.`
      );

      setSubject("");
      setHeading("");
      setButtonText("");
      setButtonUrl("");

      editor.commands.clearContent();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong sending the email blast."
      );
    } finally {
      setSending(false);
    }
  }

  if (!editor) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-10 text-white">
        <p className="text-white/70">
          Loading email editor...
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 text-white">

      {/* HEADER */}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#F28C52] md:text-4xl">
          Email Blast
        </h1>

        <p className="mt-2 text-white/70">
          Send an email announcement to
          Peach State members.
        </p>
      </div>

      {/* ALERTS */}

      {error && (
        <div className="mb-6 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-200">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 rounded-xl border border-green-500/40 bg-green-500/10 p-4 text-green-200">
          {success}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_420px]">

        {/* -------------------------------- */}
        {/* COMPOSER */}
        {/* -------------------------------- */}

        <section className="rounded-2xl border border-[#F28C52]/20 bg-black/35 p-6">

          <h2 className="mb-6 text-xl font-semibold text-white">
            Compose Email
          </h2>

          <div className="space-y-6">

            {/* SUBJECT */}

            <div>
              <label className="mb-2 block text-sm font-medium text-white/80">
                Subject
              </label>

              <input
                type="text"
                value={subject}
                onChange={(e) =>
                  setSubject(
                    e.target.value
                  )
                }
                placeholder="Email subject"
                className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-[#F28C52]"
              />
            </div>

            {/* HEADING */}

            <div>
              <label className="mb-2 block text-sm font-medium text-white/80">
                Email Heading

                <span className="ml-2 text-white/40">
                  (optional)
                </span>
              </label>

              <input
                type="text"
                value={heading}
                onChange={(e) =>
                  setHeading(
                    e.target.value
                  )
                }
                placeholder="Main heading inside the email"
                className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-[#F28C52]"
              />
            </div>

            {/* MESSAGE */}

            <div>
              <label className="mb-2 block text-sm font-medium text-white/80">
                Message
              </label>

              <div className="overflow-hidden rounded-xl border border-white/15 bg-white">

                {/* TOOLBAR */}

                <div className="flex flex-wrap items-center gap-2 border-b border-black/10 bg-[#f3f3f3] p-3">

                  {/* FONT */}

                  <select
                    defaultValue=""
                    onChange={(e) =>
                      changeFont(
                        e.target.value
                      )
                    }
                    className="rounded-lg border border-black/20 bg-white px-3 py-2 text-sm text-black"
                  >
                    <option value="">
                      Default Font
                    </option>

                    <option value="Canva">
                      Canva
                    </option>

                    <option value="Cinzel">
                      Cinzel
                    </option>
                  </select>

                  <div className="h-7 w-px bg-black/15" />

                  {/* BOLD */}

                  <button
                    type="button"
                    onClick={() =>
                      editor
                        .chain()
                        .focus()
                        .toggleBold()
                        .run()
                    }
                    className={`h-9 min-w-9 rounded-lg border px-3 text-sm font-bold ${
                      editor.isActive(
                        "bold"
                      )
                        ? "border-[#F28C52] bg-[#F28C52] text-black"
                        : "border-black/15 bg-white text-black"
                    }`}
                  >
                    B
                  </button>

                  {/* ITALIC */}

                  <button
                    type="button"
                    onClick={() =>
                      editor
                        .chain()
                        .focus()
                        .toggleItalic()
                        .run()
                    }
                    className={`h-9 min-w-9 rounded-lg border px-3 text-sm italic ${
                      editor.isActive(
                        "italic"
                      )
                        ? "border-[#F28C52] bg-[#F28C52] text-black"
                        : "border-black/15 bg-white text-black"
                    }`}
                  >
                    I
                  </button>

                  {/* UNDERLINE */}

                  <button
                    type="button"
                    onClick={() =>
                      editor
                        .chain()
                        .focus()
                        .toggleUnderline()
                        .run()
                    }
                    className={`h-9 min-w-9 rounded-lg border px-3 text-sm underline ${
                      editor.isActive(
                        "underline"
                      )
                        ? "border-[#F28C52] bg-[#F28C52] text-black"
                        : "border-black/15 bg-white text-black"
                    }`}
                  >
                    U
                  </button>

                  <div className="h-7 w-px bg-black/15" />

                  {/* NORMAL PARAGRAPH */}

                  <button
                    type="button"
                    onClick={() =>
                      editor
                        .chain()
                        .focus()
                        .setParagraph()
                        .run()
                    }
                    className={`rounded-lg border px-3 py-2 text-sm ${
                      editor.isActive(
                        "paragraph"
                      )
                        ? "border-[#F28C52] bg-[#F28C52] text-black"
                        : "border-black/15 bg-white text-black"
                    }`}
                  >
                    Normal
                  </button>

                  {/* HEADING */}

                  <button
                    type="button"
                    onClick={() =>
                      editor
                        .chain()
                        .focus()
                        .toggleHeading({
                          level: 2,
                        })
                        .run()
                    }
                    className={`rounded-lg border px-3 py-2 text-sm font-bold ${
                      editor.isActive(
                        "heading",
                        {
                          level: 2,
                        }
                      )
                        ? "border-[#F28C52] bg-[#F28C52] text-black"
                        : "border-black/15 bg-white text-black"
                    }`}
                  >
                    Heading
                  </button>

                  <div className="h-7 w-px bg-black/15" />

                  {/* BULLET LIST */}

                  <button
                    type="button"
                    onClick={() =>
                      editor
                        .chain()
                        .focus()
                        .toggleBulletList()
                        .run()
                    }
                    className={`rounded-lg border px-3 py-2 text-sm ${
                      editor.isActive(
                        "bulletList"
                      )
                        ? "border-[#F28C52] bg-[#F28C52] text-black"
                        : "border-black/15 bg-white text-black"
                    }`}
                  >
                    • List
                  </button>

                  {/* NUMBERED LIST */}

                  <button
                    type="button"
                    onClick={() =>
                      editor
                        .chain()
                        .focus()
                        .toggleOrderedList()
                        .run()
                    }
                    className={`rounded-lg border px-3 py-2 text-sm ${
                      editor.isActive(
                        "orderedList"
                      )
                        ? "border-[#F28C52] bg-[#F28C52] text-black"
                        : "border-black/15 bg-white text-black"
                    }`}
                  >
                    1. List
                  </button>

                  {/* LINK */}

                  <button
                    type="button"
                    onClick={addLink}
                    className={`rounded-lg border px-3 py-2 text-sm ${
                      editor.isActive(
                        "link"
                      )
                        ? "border-[#F28C52] bg-[#F28C52] text-black"
                        : "border-black/15 bg-white text-black"
                    }`}
                  >
                    Link
                  </button>

                  {/* REMOVE LINK */}

                  {editor.isActive(
                    "link"
                  ) && (
                    <button
                      type="button"
                      onClick={() =>
                        editor
                          .chain()
                          .focus()
                          .unsetLink()
                          .run()
                      }
                      className="rounded-lg border border-red-300 bg-white px-3 py-2 text-sm text-red-600"
                    >
                      Remove Link
                    </button>
                  )}
                </div>

                {/* EDITOR */}

                <EditorContent
                  editor={editor}
                  className="
                    email-rich-editor
                    min-h-[300px]
                    bg-white
                    text-black
                    [&_.ProseMirror]:min-h-[300px]
                    [&_.ProseMirror]:outline-none
                    [&_.ProseMirror_p]:mb-3
                    [&_.ProseMirror_h2]:mb-3
                    [&_.ProseMirror_h2]:mt-4
                    [&_.ProseMirror_h2]:text-2xl
                    [&_.ProseMirror_h2]:font-bold
                    [&_.ProseMirror_ul]:my-3
                    [&_.ProseMirror_ul]:list-disc
                    [&_.ProseMirror_ul]:pl-7
                    [&_.ProseMirror_ol]:my-3
                    [&_.ProseMirror_ol]:list-decimal
                    [&_.ProseMirror_ol]:pl-7
                    [&_.ProseMirror_a]:text-blue-600
                    [&_.ProseMirror_a]:underline
                  "
                />
              </div>

              <p className="mt-2 text-xs text-white/40">
                Highlight text before
                applying a font or
                formatting option.
              </p>
            </div>

            {/* CTA */}

            <div className="rounded-xl border border-white/10 bg-white/5 p-4">

              <h3 className="font-medium text-white">
                Call-to-Action Button
              </h3>

              <p className="mt-1 text-sm text-white/50">
                Optional. Leave both
                fields blank if you do
                not want a button.
              </p>

              <div className="mt-4 grid gap-4 md:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm text-white/70">
                    Button Text
                  </label>

                  <input
                    type="text"
                    value={buttonText}
                    onChange={(e) =>
                      setButtonText(
                        e.target.value
                      )
                    }
                    placeholder="Register Now"
                    className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-[#F28C52]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-white/70">
                    Button URL
                  </label>

                  <input
                    type="url"
                    value={buttonUrl}
                    onChange={(e) =>
                      setButtonUrl(
                        e.target.value
                      )
                    }
                    placeholder="https://..."
                    className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-[#F28C52]"
                  />
                </div>
              </div>
            </div>

            {/* SEND */}

            <div className="border-t border-white/10 pt-6">

              <button
                type="button"
                onClick={handleSend}
                disabled={
                  sending ||
                  loadingRecipients ||
                  selectedIds.size === 0
                }
                className="w-full rounded-xl bg-[#F28C52] px-5 py-4 text-base font-bold text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {sending
                  ? "Sending Email Blast..."
                  : `Send Email Blast to ${selectedIds.size.toLocaleString()} Recipient${
                      selectedIds.size === 1
                        ? ""
                        : "s"
                    }`}
              </button>

              <p className="mt-3 text-center text-xs text-white/40">
                You will be asked to
                confirm before the
                email is sent.
              </p>
            </div>
          </div>
        </section>

        {/* -------------------------------- */}
        {/* RECIPIENTS */}
        {/* -------------------------------- */}

        <section className="rounded-2xl border border-[#F28C52]/20 bg-black/35 p-5">

          <div className="mb-4">

            <h2 className="text-xl font-semibold text-white">
              Recipients
            </h2>

            {!loadingRecipients && (
              <p className="mt-1 text-sm text-[#F28C52]">
                {selectedIds.size.toLocaleString()}{" "}
                of{" "}
                {recipients.length.toLocaleString()}{" "}
                selected
              </p>
            )}
          </div>

          {loadingRecipients ? (
            <p className="text-white/60">
              Loading members...
            </p>
          ) : (
            <>

              {/* SEARCH */}

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                placeholder="Search name or email..."
                className="mb-4 w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#F28C52]"
              />

              {/* CONTROLS */}

              <div className="mb-4 flex gap-2">

                <button
                  type="button"
                  onClick={selectAll}
                  className="flex-1 rounded-lg border border-[#F28C52]/50 bg-[#F28C52]/10 px-3 py-2 text-sm font-medium text-[#F28C52] transition hover:bg-[#F28C52]/20"
                >
                  Select All
                </button>

                <button
                  type="button"
                  onClick={
                    deselectAll
                  }
                  className="flex-1 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white/70 transition hover:bg-white/10"
                >
                  Deselect All
                </button>
              </div>

              {/* LIST */}

              <div className="max-h-[650px] space-y-2 overflow-y-auto pr-1">

                {filteredRecipients.map(
                  (recipient) => {
                    const selected =
                      selectedIds.has(
                        recipient.id
                      );

                    return (
                      <label
                        key={
                          recipient.id
                        }
                        className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-black/25 p-3 transition hover:border-[#F28C52]/40"
                      >
                        <input
                          type="checkbox"
                          checked={
                            selected
                          }
                          onChange={() =>
                            toggleRecipient(
                              recipient.id
                            )
                          }
                          className="mt-1 h-4 w-4 accent-[#F28C52]"
                        />

                        <div className="min-w-0">

                          <div className="truncate text-sm font-medium text-white">
                            {
                              recipient.name
                            }
                          </div>

                          <div className="truncate text-xs text-white/50">
                            {
                              recipient.email
                            }
                          </div>

                        </div>
                      </label>
                    );
                  }
                )}

                {filteredRecipients.length ===
                  0 && (
                  <div className="py-8 text-center text-sm text-white/50">
                    No matching members
                    found.
                  </div>
                )}
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}