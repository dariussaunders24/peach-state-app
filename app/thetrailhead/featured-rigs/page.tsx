export default function FeaturedRigsPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 text-white">
      <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#F28C52]">
        The Trailhead
      </p>

      <h1 className="mt-2 font-cinzel text-4xl font-bold md:text-5xl">
        Featured Rigs
      </h1>

      <p className="mt-4 max-w-3xl text-lg leading-8 text-white/70">
        The Featured Rig area highlights vehicles and the people behind the
        builds that make the off-road, overland, outdoor, and automotive
        community unique.
      </p>

      <section className="mt-8 rounded-2xl border border-white/10 bg-black/30 p-6 md:p-8">
        <h2 className="text-2xl font-bold">What Is a Featured Rig?</h2>

        <p className="mt-3 leading-7 text-white/70">
          Selected vehicles receive a dedicated display space at The Trailhead
          where attendees can get a closer look at the build, modifications,
          equipment, and story behind the vehicle.
        </p>
      </section>

      <section className="mt-6 rounded-2xl border border-[#F28C52]/30 bg-[#F28C52]/10 p-6 md:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#F28C52]">
          Submit Your Build
        </p>

        <h2 className="mt-2 text-2xl font-bold">
          Want to Be a Featured Rig?
        </h2>

        <p className="mt-3 max-w-3xl leading-7 text-white/70">
          Featured Rig submissions are open to the public. You do not need to
          be a Peach State member to submit a vehicle.
        </p>

        <div className="mt-5 rounded-xl border border-white/10 bg-black/25 p-4">
          <p className="font-semibold text-white">
            Online Featured Rig applications are coming soon.
          </p>

          <p className="mt-2 text-sm text-white/60">
            The application form will be added directly to this page.
          </p>
        </div>
      </section>
    </main>
  );
}