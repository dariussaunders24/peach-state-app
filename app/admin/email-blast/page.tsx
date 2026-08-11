"use client";

import { useEffect, useMemo, useState } from "react";

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
  const [message, setMessage] = useState("");
  const [buttonText, setButtonText] = useState("");
  const [buttonUrl, setButtonUrl] = useState("");

  const [search, setSearch] = useState("");

  const [loadingRecipients, setLoadingRecipients] = useState(true);
  const [sending, setSending] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
      const response = await fetch("/api/admin/email-blast/recipients");

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load recipients.");
      }

      const loadedRecipients: Recipient[] = data.recipients || [];

      setRecipients(loadedRecipients);

      // Everyone selected by default
      setSelectedIds(
        new Set(loadedRecipients.map((recipient) => recipient.id))
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
    setSelectedIds(new Set(recipients.map((recipient) => recipient.id)));
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
        recipient.name.toLowerCase().includes(term) ||
        recipient.email.toLowerCase().includes(term)
      );
    });
  }, [recipients, search]);

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

    if (!message.trim()) {
      setError("Enter an email message.");
      return;
    }

    if (selectedIds.size === 0) {
      setError("Select at least one recipient.");
      return;
    }

    if (buttonText.trim() && !buttonUrl.trim()) {
      setError("Add a URL for the email button.");
      return;
    }

    if (buttonUrl.trim() && !buttonText.trim()) {
      setError("Add button text for the email button.");
      return;
    }

    const selectedRecipients = recipients.filter((recipient) =>
      selectedIds.has(recipient.id)
    );

    const confirmed = window.confirm(
      `Send this email to ${selectedRecipients.length.toLocaleString()} recipient${
        selectedRecipients.length === 1 ? "" : "s"
      }?`
    );

    if (!confirmed) {
      return;
    }

    setSending(true);

    try {
      const response = await fetch("/api/admin/email-blast/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: subject.trim(),
          heading: heading.trim() || null,
          message: message.trim(),
          buttonText: buttonText.trim() || null,
          buttonUrl: buttonUrl.trim() || null,

          recipientIds: selectedRecipients.map(
            (recipient) => recipient.id
          ),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send email blast.");
      }

      setSuccess(
        `Email blast sent to ${data.successfulRecipients?.toLocaleString?.() ?? selectedRecipients.length} recipients.`
      );

      setSubject("");
      setHeading("");
      setMessage("");
      setButtonText("");
      setButtonUrl("");
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

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 text-white">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#F28C52] md:text-4xl">
          Email Blast
        </h1>

        <p className="mt-2 text-white/70">
          Send an email announcement to Peach State members.
        </p>
      </div>

      {/* Alerts */}
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
        {/* EMAIL COMPOSER */}
        {/* -------------------------------- */}

        <section className="rounded-2xl border border-[#F28C52]/20 bg-black/35 p-6">
          <h2 className="mb-6 text-xl font-semibold text-white">
            Compose Email
          </h2>

          <div className="space-y-6">
            {/* Subject */}
            <div>
              <label className="mb-2 block text-sm font-medium text-white/80">
                Subject
              </label>

              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Email subject"
                className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-[#F28C52]"
              />
            </div>

            {/* Heading */}
            <div>
              <label className="mb-2 block text-sm font-medium text-white/80">
                Email Heading
                <span className="ml-2 text-white/40">(optional)</span>
              </label>

              <input
                type="text"
                value={heading}
                onChange={(e) => setHeading(e.target.value)}
                placeholder="Main heading inside the email"
                className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-[#F28C52]"
              />
            </div>

            {/* Message */}
            <div>
              <label className="mb-2 block text-sm font-medium text-white/80">
                Message
              </label>

              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your announcement..."
                rows={12}
                className="w-full resize-y rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-[#F28C52]"
              />
            </div>

            {/* Button section */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <h3 className="font-medium text-white">
                Call-to-Action Button
              </h3>

              <p className="mt-1 text-sm text-white/50">
                Optional. Leave both fields blank if you do not want a button.
              </p>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-white/70">
                    Button Text
                  </label>

                  <input
                    type="text"
                    value={buttonText}
                    onChange={(e) => setButtonText(e.target.value)}
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
                    onChange={(e) => setButtonUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-[#F28C52]"
                  />
                </div>
              </div>
            </div>

            {/* Send */}
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
                      selectedIds.size === 1 ? "" : "s"
                    }`}
              </button>

              <p className="mt-3 text-center text-xs text-white/40">
                You will be asked to confirm before the email is sent.
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
                {selectedIds.size.toLocaleString()} of{" "}
                {recipients.length.toLocaleString()} selected
              </p>
            )}
          </div>

          {loadingRecipients ? (
            <p className="text-white/60">Loading members...</p>
          ) : (
            <>
              {/* Search */}
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name or email..."
                className="mb-4 w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#F28C52]"
              />

              {/* Select controls */}
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
                  onClick={deselectAll}
                  className="flex-1 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white/70 transition hover:bg-white/10"
                >
                  Deselect All
                </button>
              </div>

              {/* Recipient list */}
              <div className="max-h-[650px] space-y-2 overflow-y-auto pr-1">
                {filteredRecipients.map((recipient) => {
                  const selected = selectedIds.has(recipient.id);

                  return (
                    <label
                      key={recipient.id}
                      className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-black/25 p-3 transition hover:border-[#F28C52]/40"
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleRecipient(recipient.id)}
                        className="mt-1 h-4 w-4 accent-[#F28C52]"
                      />

                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-white">
                          {recipient.name}
                        </div>

                        <div className="truncate text-xs text-white/50">
                          {recipient.email}
                        </div>
                      </div>
                    </label>
                  );
                })}

                {filteredRecipients.length === 0 && (
                  <div className="py-8 text-center text-sm text-white/50">
                    No matching members found.
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