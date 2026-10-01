export default function LittleExplorersPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 text-white">
      <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#F28C52]">
        The Trailhead
      </p>

      <h1 className="mt-2 font-cinzel text-4xl font-bold md:text-5xl">
        Little Explorers
      </h1>

      <p className="mt-4 max-w-3xl text-lg leading-8 text-white/70">
        The Trailhead isn&apos;t just for the grown-ups. Little Explorers gives
        kids their own way to participate, explore, and have fun at the meet.
      </p>

      <section className="mt-8 rounded-2xl border border-[#F28C52]/30 bg-[#F28C52]/10 p-6 md:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#F28C52]">
          Little Explorer Passport
        </p>

        <h2 className="mt-2 text-2xl font-bold">
          Explore. Complete. Collect.
        </h2>

        <p className="mt-3 max-w-3xl leading-7 text-white/70">
          Kids can participate in the Little Explorer Passport program,
          complete activities around The Trailhead, collect stamps, take part
          in monthly challenges, and reach Explorer milestones throughout the
          year.
        </p>
      </section>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Card
          title="Get a Passport"
          text="Stop by Little Explorer HQ during The Trailhead to get started."
        />

        <Card
          title="Complete Activities"
          text="Each meet can include activities, challenges, and things to discover."
        />

        <Card
          title="Earn Prizes"
          text="Complete activities and visit Explorer HQ for available prizes and rewards."
        />
      </div>
    </main>
  );
}

function Card({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-5">
      <h2 className="text-xl font-bold">{title}</h2>
      <p className="mt-3 leading-6 text-white/65">{text}</p>
    </div>
  );
}