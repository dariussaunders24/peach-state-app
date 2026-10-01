export default function TrailheadVendorsPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 text-white">
      <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#F28C52]">
        The Trailhead
      </p>

      <h1 className="mt-2 font-cinzel text-4xl font-bold md:text-5xl">
        Vendors
      </h1>

      <p className="mt-4 max-w-3xl text-lg leading-8 text-white/70">
        Meet the businesses, makers, organizations, food vendors, and community
        partners joining us at The Trailhead.
      </p>

      <section className="mt-8 rounded-2xl border border-white/10 bg-black/30 p-6 md:p-8">
        <h2 className="text-2xl font-bold">Upcoming Vendors</h2>

        <p className="mt-3 leading-7 text-white/65">
          Vendor information for the next Trailhead will be posted here.
        </p>
      </section>

      <section className="mt-6 rounded-2xl border border-[#F28C52]/30 bg-[#F28C52]/10 p-6 md:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#F28C52]">
          Get Involved
        </p>

        <h2 className="mt-2 text-2xl font-bold">
          Interested in Being a Vendor?
        </h2>

        <p className="mt-3 max-w-3xl leading-7 text-white/70">
          Vendor participation information and an online inquiry form will be
          available here soon.
        </p>
      </section>
    </main>
  );
}