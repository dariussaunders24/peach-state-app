export default function TrailheadFAQPage() {
  const faqs = [
    {
      question: "Is The Trailhead open to the public?",
      answer:
        "Yes. The Trailhead is a public community event. You do not need a Peach State membership or account to attend.",
    },
    {
      question: "Does it cost anything to attend?",
      answer: "No. The Trailhead is free to attend.",
    },
    {
      question: "Do I need to RSVP?",
      answer:
        "No. There is no RSVP or registration requirement. Just show up and enjoy the meet.",
    },
    {
      question: "Do I need an off-road vehicle?",
      answer:
        "No. All makes, models, and build levels are welcome, including stock vehicles and daily drivers.",
    },
    {
      question: "Is The Trailhead family friendly?",
      answer:
        "Yes. Families and kids are welcome. Little Explorers also provides activities specifically for younger attendees.",
    },
    {
      question: "Can I bring my pet?",
      answer:
        "Yes. The Trailhead is pet friendly. Owners are responsible for keeping pets under control and cleaning up after them.",
    },
    {
      question: "Can I bring something to sell or trade?",
      answer:
        "Yes. Attendees may bring off-road, overland, camping, recovery, and vehicle-related gear to buy, sell, or trade.",
    },
    {
      question: "How do I become a Featured Rig?",
      answer:
        "Featured Rig submissions are open to the public. An online submission form will be available through the Featured Rigs page.",
    },
  ];

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 text-white">
      <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#F28C52]">
        The Trailhead
      </p>

      <h1 className="mt-2 font-cinzel text-4xl font-bold md:text-5xl">
        Frequently Asked Questions
      </h1>

      <p className="mt-4 text-lg text-white/65">
        Everything you need to know before your first Trailhead.
      </p>

      <div className="mt-8 space-y-3">
        {faqs.map((faq) => (
          <details
            key={faq.question}
            className="group rounded-xl border border-white/10 bg-black/30"
          >
            <summary className="cursor-pointer list-none p-5 font-bold text-white">
              <div className="flex items-center justify-between gap-4">
                <span>{faq.question}</span>
                <span className="text-xl text-[#F28C52] transition group-open:rotate-45">
                  +
                </span>
              </div>
            </summary>

            <div className="border-t border-white/10 px-5 py-4 leading-7 text-white/70">
              {faq.answer}
            </div>
          </details>
        ))}
      </div>
    </main>
  );
}