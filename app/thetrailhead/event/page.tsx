export default function TrailheadEventPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 text-white">
      <PageHeader
        eyebrow="The Next Meet"
        title="Event Info"
        description="Everything you need to know before coming to The Trailhead."
      />

      <section className="mt-8 rounded-2xl border border-[#F28C52]/30 bg-[#F28C52]/10 p-6 md:p-8">
        <h2 className="font-cinzel text-3xl font-bold">
          The Trailhead
        </h2>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Info title="Location" text="Revolution Auto Service" />
          <Info title="Admission" text="Free — No RSVP Required" />
          <Info
            title="Address"
            text="3620 Kennesaw N Industrial Pkwy, Suite E, Kennesaw, GA 30144"
          />
          <Info title="Who Can Attend?" text="Everyone — Open to the Public" />
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-6">
        <h2 className="text-2xl font-bold">What to Expect</h2>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Info
            title="Off-Road & Overland Builds"
            text="Walk through vehicles from across the community and meet the people behind the builds."
          />

          <Info
            title="Featured Rigs"
            text="Select builds receive dedicated display spaces at each Trailhead."
          />

          <Info
            title="Food & Coffee"
            text="Food and drink vendors may be available during the meet."
          />

          <Info
            title="Little Explorers"
            text="Kid-focused activities, passports, challenges, and prizes."
          />

          <Info
            title="Community Vendors"
            text="Meet businesses and organizations connected to the off-road, overland, outdoor, and automotive communities."
          />

          <Info
            title="Buy / Sell / Trade"
            text="Bring off-road, overland, camping, recovery, and vehicle gear to buy, sell, or trade."
          />
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-6">
        <h2 className="text-2xl font-bold">Vehicles</h2>

        <p className="mt-3 leading-7 text-white/70">
          All makes, models, and build levels are welcome. You do not need an
          off-road build or modified vehicle to attend. Stock vehicles, daily
          drivers, project vehicles, trail rigs, and full overland builds are
          all welcome.
        </p>
      </section>

      <section className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-6">
        <h2 className="text-2xl font-bold">Families & Kids</h2>

        <p className="mt-3 leading-7 text-white/70">
          The Trailhead is family friendly. Kids are welcome, and Little
          Explorers gives younger attendees their own activities and
          experiences during the meet.
        </p>
      </section>
    </main>
  );
}

function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <header>
      <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#F28C52]">
        {eyebrow}
      </p>

      <h1 className="mt-2 font-cinzel text-4xl font-bold md:text-5xl">
        {title}
      </h1>

      <p className="mt-3 max-w-3xl text-lg text-white/65">
        {description}
      </p>
    </header>
  );
}

function Info({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-4">
      <h3 className="font-bold text-white">{title}</h3>
      <p className="mt-2 leading-6 text-white/65">{text}</p>
    </div>
  );
}