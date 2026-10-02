export default function TrailheadFAQPage() {
  const faqs = [
    {
      question: "What is The Trailhead?",
      answer:
        "The Trailhead is a free monthly off-road and overland community meet hosted by Peach State Off-Road & Overlanding. It brings together enthusiasts, families, local businesses, vendors, and the outdoor community in a relaxed, welcoming environment.",
    },
    {
      question: "Is The Trailhead open to the public?",
      answer:
        "Yes. The Trailhead is a public community event. You do not need a Peach State membership or account to attend.",
    },
    {
      question: "Does it cost anything to attend?",
      answer:
        "No. The Trailhead is free to attend.",
    },
    {
      question: "Do I need to RSVP?",
      answer:
        "No. There is no RSVP or registration requirement. Just show up and enjoy the meet.",
    },
    {
      question: "When and where is The Trailhead?",
      answer:
        "The Trailhead is held monthly. Visit the Event Info page for the date, time, location, and details for the next meet.",
    },
    {
      question: "What happens at The Trailhead?",
      answer:
        "Each meet is a chance to check out vehicles, meet other people in the off-road and overland community, visit vendors, see Featured Rigs, participate in Little Explorers activities, and spend time with people who share an interest in vehicles and the outdoors. Special activities and features may change from month to month.",
    },
    {
      question: "Do I need an off-road vehicle?",
      answer:
        "No. All makes, models, and build levels are welcome, including stock vehicles and daily drivers. You also do not need to bring a vehicle specifically for display.",
    },
    {
      question: "Do I have to be a Peach State member?",
      answer:
        "No. The Trailhead is hosted by Peach State Off-Road & Overlanding, but the meet is open to everyone. Peach State membership is not required.",
    },
    {
      question: "Is The Trailhead family friendly?",
      answer:
        "Yes. Families and kids are welcome. Little Explorers gives younger attendees their own activities, passport program, monthly challenges, stamps, and available prizes.",
    },
    {
      question: "What is the Little Explorer Passport?",
      answer:
        "Kids can pick up a Little Explorer Passport at Little Explorer HQ and participate in activities throughout the year. They can complete monthly activities, collect stamps, and work toward Explorer milestones and available rewards.",
    },
    {
      question: "Can I bring my pet?",
      answer:
        "Yes. The Trailhead is pet friendly. Owners are responsible for keeping pets under control and cleaning up after them.",
    },
    {
      question: "Can I bring something to sell or trade?",
      answer:
        "Yes. Attendees may bring off-road, overland, camping, recovery, and vehicle-related gear to buy, sell, or trade. Items remain the responsibility of the individual attendees involved.",
    },
    {
      question: "How do I become a Featured Rig?",
      answer:
        "Featured Rig submissions are open to everyone. Visit the Featured Rigs page and submit your vehicle using the online form. Selected vehicles may receive a dedicated display spot at an upcoming Trailhead.",
    },
    {
      question: "Does my vehicle have to be heavily modified to be a Featured Rig?",
      answer:
        "No. Featured Rigs are not selected only by modification level or cost. Interesting builds, unique platforms, purpose-built vehicles, creative setups, and rigs with a great story are all encouraged to apply.",
    },
    {
      question: "Can my business become a vendor?",
      answer:
        "Yes. Businesses and organizations interested in participating can submit a vendor inquiry through the Vendors page. Submitting an inquiry does not guarantee vendor space, and participation is subject to approval and available space.",
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

      <p className="mt-4 max-w-3xl text-lg leading-8 text-white/65">
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

                <span className="text-xl text-[#F28C52] transition-transform duration-200 group-open:rotate-45">
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

      <section className="mt-10 rounded-2xl border border-[#F28C52]/30 bg-[#F28C52]/10 p-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#F28C52]">
          Still Have Questions?
        </p>

        <h2 className="mt-2 text-2xl font-bold">
          Come See What The Trailhead Is About
        </h2>

        <p className="mt-3 leading-7 text-white/70">
          No membership. No RSVP. No special vehicle required.
          Check the Event Info page for details on the next meet
          and come hang out with the community.
        </p>

        <a
          href="/thetrailhead/event"
          className="mt-5 inline-flex rounded-xl bg-[#F28C52] px-5 py-3 font-bold text-black transition hover:bg-[#C96A2C]"
        >
          View Next Trailhead
        </a>
      </section>
    </main>
  );
}