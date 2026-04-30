export default function FAQPage() {
  const faqs = [
    {
      question: "Do I need an off-road vehicle to join?",
      answer:
        "Yes. All vehicles must be AWD or 4x4 and equipped with all-terrain tires. This ensures safety and the ability to complete trails without issues.",
    },
    {
      question: "Can beginners join?",
      answer:
        "Absolutely. All skill levels are welcome. Many rides include guidance, spotting, and learning opportunities for newer members.",
    },
    {
      question: "What should I bring to a ride?",
      answer:
        "Recommended items include water, snacks or lunch, recovery gear (if you have it), a GMRS radio, and a positive attitude. Chairs are also encouraged for breaks.",
    },
    {
      question: "Are GMRS radios required?",
      answer:
        "They are strongly recommended. GMRS radios allow for communication during convoy driving, trail coordination, and safety updates.",
    },
    {
      question: "Do I need recovery gear?",
      answer:
        "Not required for beginners, but highly encouraged. As you progress, having basic recovery gear becomes important for safety and helping others.",
    },
    {
      question: "How do RSVPs work?",
      answer:
        "Each event has a capacity limit. Once that limit is reached, additional members will be placed on a waitlist. If someone cancels, the next person on the waitlist is automatically moved into the event.",
    },
    {
      question: "Can I bring family or kids?",
      answer:
        "Yes. Many of our events are family-friendly. Always review the event details to confirm difficulty and suitability.",
    },
    {
      question: "What is the risk policy?",
      answer:
        "Off-roading involves inherent risks. By attending events, you accept full responsibility for your vehicle, passengers, and actions. Peach State and its organizers are not liable for damage, injury, or loss.",
    },
    {
      question: "How do vendor discounts work?",
      answer:
        "Peach State members have access to exclusive vendor discounts. For current offers and codes, visit the Vendors page or contact us directly.",
    },
    {
      question: "How do I become a vendor partner?",
      answer:
        "We welcome partnerships with brands and businesses that align with our community. Email dariussaunders24@gmail.com for more information.",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-[#F28C52]/30 bg-black/40 p-6">
        <h1 className="text-3xl font-bold text-[#F28C52]">
          Frequently Asked Questions
        </h1>

        <p className="mt-3 max-w-3xl text-gray-300">
          Everything you need to know about Peach State rides, expectations, and
          how to get involved in the community.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="rounded-xl border border-white/10 bg-black/30 p-5"
          >
            <h2 className="text-lg font-semibold text-[#F28C52]">
              {faq.question}
            </h2>

            <p className="mt-2 text-gray-300">{faq.answer}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-[#F28C52]/30 bg-black/40 p-6">
        <h2 className="text-2xl font-bold text-[#F28C52]">
          Still have questions?
        </h2>

        <p className="mt-3 text-gray-300">
          Reach out directly and we’ll help you get what you need.
        </p>

        <a
          href="mailto:dariussaunders24@gmail.com?subject=Peach State Question"
          className="mt-5 inline-block rounded-lg bg-[#F28C52] px-5 py-3 font-semibold text-black hover:bg-[#C96A2C]"
        >
          Email Us
        </a>
      </div>
    </div>
  );
}