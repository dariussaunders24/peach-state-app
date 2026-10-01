import Link from "next/link";

const TRAILHEAD_LOGO = "/trailhead-logo.png";

export default function TrailheadPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 md:py-12">
      {/* HERO */}
      <section className="overflow-hidden rounded-2xl border border-white/10 bg-black/45 shadow-xl backdrop-blur">
        {/* Trailhead Logo */}
        <div className="px-4 pt-4 md:px-6 md:pt-6">
          <div className="mx-auto flex max-w-3xl justify-center rounded-2xl border border-[#F28C52]/40 bg-[#B85C2E] px-6 py-5 shadow-lg md:px-10 md:py-7">
            <img
              src={TRAILHEAD_LOGO}
              alt="The Trailhead"
              className="h-auto w-full max-w-2xl object-contain"
            />
          </div>
        </div>

        <div className="px-6 pb-8 pt-6 text-center md:px-10 md:pb-10">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#F28C52]">
            Peach State Off-Road & Overlanding Presents
          </p>

          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-white/80 md:text-xl">
            A monthly off-road, overland, outdoor, and automotive community
            meet built around vehicles, adventure, families, and the people who
            bring the community together.
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            {[
              "Free to Attend",
              "No RSVP Required",
              "Open to the Public",
              "All Makes & Models",
              "Family Friendly",
            ].map((item) => (
              <span
                key={item}
                className="rounded-full border border-[#F28C52]/30 bg-[#F28C52]/10 px-4 py-2 text-sm font-bold text-[#F28C52]"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* NEXT TRAILHEAD */}
      <section className="mt-8 rounded-2xl border border-[#F28C52]/30 bg-[#F28C52]/10 p-6 md:p-8">
        <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#F28C52]">
              Next Trailhead
            </p>

            <h2 className="mt-2 font-cinzel text-2xl font-bold text-white md:text-3xl">
              Monthly Community Meet
            </h2>

            <div className="mt-5 space-y-2 text-white/80">
              <p>
                <span className="font-bold text-white">Location:</span>{" "}
                Revolution Auto Service
              </p>

              <p>
                <span className="font-bold text-white">Address:</span>{" "}
                3620 Kennesaw N Industrial Pkwy, Suite E, Kennesaw, GA 30144
              </p>

              <p className="pt-2 font-bold text-[#F28C52]">
                Free • No RSVP • Just Show Up
              </p>
            </div>
          </div>

          <Link
            href="/thetrailhead/event"
            className="inline-flex items-center justify-center rounded-xl bg-[#F28C52] px-6 py-3 font-bold text-black transition hover:bg-[#C96A2C]"
          >
            View Event Info
          </Link>
        </div>
      </section>

      {/* ABOUT */}
      <section className="mt-12">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#F28C52]">
            Built for the Community
          </p>

          <h2 className="mt-3 font-cinzel text-3xl font-bold text-white md:text-4xl">
            More Than a Car Meet
          </h2>

          <p className="mt-5 text-lg leading-8 text-white/70">
            The Trailhead brings together the off-road, overland, outdoor, and
            automotive communities in one place. Whether you drive a stock
            daily driver, a dedicated trail rig, an overland build, or simply
            enjoy the outdoors, you&apos;re welcome here.
          </p>

          <p className="mt-4 text-lg font-bold text-white">
            No membership. No RSVP. No special vehicle required.
          </p>
        </div>
      </section>

      {/* EXPLORE */}
      <section className="mt-12">
        <div className="mb-6">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#F28C52]">
            Explore The Trailhead
          </p>

          <h2 className="mt-2 font-cinzel text-3xl font-bold text-white">
            There&apos;s More to See
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <TrailheadCard
            title="Event Info"
            description="Everything you need to know before coming to the next Trailhead meet."
            href="/thetrailhead/event"
            linkText="Event Details"
          />

          <TrailheadCard
            title="Featured Rigs"
            description="See what the Featured Rig area is all about and learn how to submit your vehicle."
            href="/thetrailhead/featured-rigs"
            linkText="Featured Rigs"
          />

          <TrailheadCard
            title="Little Explorers"
            description="Activities, passports, challenges, and prizes created for our youngest adventurers."
            href="/thetrailhead/little-explorers"
            linkText="Little Explorers"
          />

          <TrailheadCard
            title="Vendors"
            description="Meet the local businesses, shops, makers, and community vendors joining us."
            href="/thetrailhead/vendors"
            linkText="Vendors"
          />

          <TrailheadCard
            title="Buy / Sell / Trade"
            description="Bring off-road, overland, camping, and automotive gear you want to sell or trade."
            href="/thetrailhead/event"
            linkText="Learn More"
          />

          <TrailheadCard
            title="FAQ"
            description="Answers to common questions about attending The Trailhead."
            href="/thetrailhead/faq"
            linkText="View FAQ"
          />
        </div>
      </section>

      {/* FEATURED RIG CTA */}
      <section className="mt-12 overflow-hidden rounded-2xl border border-white/10 bg-black/45 p-6 md:p-8">
        <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#F28C52]">
              Featured Rig
            </p>

            <h2 className="mt-2 font-cinzel text-2xl font-bold text-white md:text-3xl">
              Want Your Build in the Featured Rig Area?
            </h2>

            <p className="mt-3 max-w-2xl leading-7 text-white/70">
              The Featured Rig area highlights vehicles and the people behind
              them. Submissions are open to the public and are not limited to
              Peach State members.
            </p>
          </div>

          <Link
            href="/thetrailhead/featured-rigs"
            className="inline-flex items-center justify-center rounded-xl border border-[#F28C52] px-6 py-3 font-bold text-[#F28C52] transition hover:bg-[#F28C52] hover:text-black"
          >
            Learn About Featured Rigs
          </Link>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="mt-12 rounded-2xl border border-white/10 bg-black/45 px-6 py-10 text-center md:px-10 md:py-14">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#F28C52]">
          Get Out. Explore. Belong.
        </p>

        <h2 className="mt-3 font-cinzel text-3xl font-bold text-white md:text-4xl">
          Start at The Trailhead.
        </h2>

        <p className="mx-auto mt-4 max-w-2xl text-lg text-white/70">
          Come meet the community, check out the builds, grab some food and
          coffee, bring the family, and see where your next adventure starts.
        </p>

        <p className="mt-6 font-bold text-[#F28C52]">
          Free • Public • All Makes & Models Welcome
        </p>
      </section>
    </main>
  );
}

function TrailheadCard({
  title,
  description,
  href,
  linkText,
}: {
  title: string;
  description: string;
  href: string;
  linkText: string;
}) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-white/10 bg-black/45 p-6 transition hover:border-[#F28C52]/40">
      <h3 className="font-cinzel text-xl font-bold text-white">{title}</h3>

      <p className="mt-3 flex-1 leading-7 text-white/65">{description}</p>

      <Link
        href={href}
        className="mt-5 inline-flex font-bold text-[#F28C52] transition hover:text-white"
      >
        {linkText} →
      </Link>
    </div>
  );
}