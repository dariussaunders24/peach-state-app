import Link from "next/link";

const EVENT_IMAGE = "/the-trailhead.png";

export default function TheTrailheadPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 text-white">
      {/* HERO */}
      <section className="overflow-hidden rounded-2xl border border-white/10 bg-black/45 shadow-xl backdrop-blur">
        <div className="flex justify-center bg-black/20 p-4 md:p-6">
          <img
            src={EVENT_IMAGE}
            alt="The Trailhead monthly off-road and overland community meet"
            className="h-auto w-full max-w-4xl rounded-xl object-contain"
          />
        </div>

        <div className="p-6 md:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#F28C52]">
            Peach State Off-Road & Overlanding Presents
          </p>

          <h1 className="mt-3 font-cinzel text-4xl font-bold md:text-6xl">
            The Trailhead
          </h1>

          <p className="mt-4 max-w-3xl text-lg leading-8 text-white/70">
            A monthly off-road, overland, outdoor, and automotive community
            meet built around vehicles, adventure, families, and the people
            who bring the community together.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <Badge>Free to Attend</Badge>
            <Badge>No RSVP Required</Badge>
            <Badge>Open to the Public</Badge>
            <Badge>All Makes & Models</Badge>
            <Badge>Family Friendly</Badge>
          </div>
        </div>
      </section>

      {/* NEXT MEET */}
      <section className="mt-6 rounded-2xl border border-[#F28C52]/30 bg-[#F28C52]/10 p-6 md:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#F28C52]">
          Next Trailhead
        </p>

        <div className="mt-3 grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <h2 className="font-cinzel text-3xl font-bold">
              Monthly Community Meet
            </h2>

            <div className="mt-4 space-y-1 text-white/80">
              <p>
                <strong className="text-white">Location:</strong>{" "}
                Revolution Auto Service
              </p>

              <p>
                <strong className="text-white">Address:</strong>{" "}
                3620 Kennesaw N Industrial Pkwy, Suite E, Kennesaw, GA 30144
              </p>
            </div>

            <p className="mt-4 text-sm font-semibold uppercase tracking-[0.15em] text-[#F28C52]">
              Free • No RSVP • Just Show Up
            </p>
          </div>

          <Link
            href="/thetrailhead/event"
            className="inline-flex items-center justify-center rounded-lg bg-[#F28C52] px-5 py-3 font-bold text-black transition hover:bg-[#C96A2C]"
          >
            View Event Info
          </Link>
        </div>
      </section>

      {/* WHAT IS THE TRAILHEAD */}
      <section className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-6 md:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#F28C52]">
          Welcome to The Trailhead
        </p>

        <h2 className="mt-2 font-cinzel text-3xl font-bold">
          More Than a Car Meet
        </h2>

        <div className="mt-4 max-w-4xl space-y-4 leading-7 text-white/75">
          <p>
            The Trailhead is a free monthly community meet hosted by Peach
            State Off-Road & Overlanding and open to the public.
          </p>

          <p>
            It is a place for off-roaders, overlanders, outdoor enthusiasts,
            families, vehicle enthusiasts, and anyone interested in the
            community to get together, check out different builds, meet new
            people, and spend time with others who enjoy getting outside.
          </p>

          <p>
            You do not need a heavily modified vehicle to attend. Stock
            vehicles, daily drivers, trail rigs, overland builds, trucks,
            SUVs, Jeeps, Subarus, Broncos, Toyotas, and everything in between
            are welcome.
          </p>

          <p className="font-semibold text-white">
            No membership. No RSVP. No special vehicle required.
          </p>
        </div>
      </section>

      {/* EXPLORE */}
      <section className="mt-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#F28C52]">
            Explore The Trailhead
          </p>

          <h2 className="mt-2 font-cinzel text-3xl font-bold">
            There&apos;s More to See
          </h2>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ExploreCard
            title="Event Info"
            description="Get the details for the next Trailhead including location, time, parking, and what to expect."
            href="/thetrailhead/event"
            linkText="View Event Info"
          />

          <ExploreCard
            title="Featured Rigs"
            description="Check out the vehicles selected for the Featured Rig area and learn how to submit your own build."
            href="/thetrailhead/featured-rigs"
            linkText="Explore Featured Rigs"
          />

          <ExploreCard
            title="Little Explorers"
            description="Learn about our activities, passports, challenges, and prizes created especially for kids."
            href="/thetrailhead/little-explorers"
            linkText="Visit Little Explorers"
          />

          <ExploreCard
            title="Vendors"
            description="See the businesses, food, coffee, organizations, and community vendors joining us."
            href="/thetrailhead/vendors"
            linkText="Meet the Vendors"
          />

          <ExploreCard
            title="Buy / Sell / Trade"
            description="Bring off-road, overland, camping, recovery, and vehicle gear to buy, sell, or trade with other attendees."
            href="/thetrailhead/event"
            linkText="Learn More"
          />

          <ExploreCard
            title="FAQ"
            description="Coming for the first time? Find answers to common questions about vehicles, families, pets, parking, and more."
            href="/thetrailhead/faq"
            linkText="Read the FAQ"
          />
        </div>
      </section>

      {/* FEATURED RIG CTA */}
      <section className="mt-8 rounded-2xl border border-[#F28C52]/30 bg-black/40 p-6 md:p-8">
        <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#F28C52]">
              Featured Rig
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              Want Your Build in the Featured Rig Area?
            </h2>

            <p className="mt-3 max-w-3xl leading-7 text-white/70">
              Each Trailhead gives select vehicles a dedicated place to show
              off their build and share the story behind it. Featured Rig
              submissions are open to the public.
            </p>
          </div>

          <Link
            href="/thetrailhead/featured-rigs"
            className="inline-flex items-center justify-center rounded-lg border border-[#F28C52] px-5 py-3 font-bold text-[#F28C52] transition hover:bg-[#F28C52] hover:text-black"
          >
            Featured Rig Info
          </Link>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="mt-8 rounded-2xl bg-[#F28C52] p-6 text-center text-black md:p-8">
        <h2 className="font-cinzel text-3xl font-bold">
          Start at The Trailhead.
        </h2>

        <p className="mx-auto mt-3 max-w-2xl font-medium">
          Bring your vehicle, bring the family, meet the community, and see
          where the next adventure starts.
        </p>

        <p className="mt-4 text-sm font-bold uppercase tracking-[0.2em]">
          Free • Public • All Makes & Models Welcome
        </p>
      </section>
    </main>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-semibold text-white/80">
      {children}
    </span>
  );
}

function ExploreCard({
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
    <Link
      href={href}
      className="group flex h-full flex-col rounded-xl border border-white/10 bg-black/30 p-5 transition hover:border-[#F28C52]/40 hover:bg-black/45"
    >
      <h3 className="text-xl font-bold text-white group-hover:text-[#F28C52]">
        {title}
      </h3>

      <p className="mt-3 flex-1 text-sm leading-6 text-white/65">
        {description}
      </p>

      <p className="mt-5 text-sm font-bold text-[#F28C52]">
        {linkText} →
      </p>
    </Link>
  );
}