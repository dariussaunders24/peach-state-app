const vendors = [
  {
    name: "Morrflate",
    discount: "10% Off",
    description: "Multi-tire inflation and deflation kits.",
    logo: "/vendors/morrflate.png",
    url: "https://morrflate.com",
  },
  {
    name: "OnX Offroad",
    discount: "50% Off All Memberships",
    description: "Trail maps and navigation.",
    logo: "/vendors/onx.png",
    url: "https://www.onxmaps.com/offroad",
  },
  {
    name: "Bulletpoint Mounting Solutions",
    discount: "10% Off",
    description: "Mounting systems for devices.",
    logo: "/vendors/bulletpoint.png",
    url: "https://www.bulletpointmountingsolutions.com",
  },
  {
    name: "Novsight",
    discount: "20% Off",
    description: "Off-road lighting.",
    logo: "/vendors/novsight.png",
    url: "https://www.novsights.com",
  },
  {
    name: "Retevis",
    discount: "$5 off $50 • $10 off $200 • $20 off $500",
    description: "GMRS radios and communication gear.",
    logo: "/vendors/retevis.png",
    url: "https://www.retevis.com",
  },
  {
    name: "Allsouth Autosports",
    discount: "Shop Labor Discount",
    description: "Off-road installs and upgrades.",
    logo: "/vendors/allsouth.png",
    url: "https://www.allsouthautosports.com",
  },
];

export default function VendorsPage() {
  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-[#F28C52]/30 bg-black/40 p-6">
        <h1 className="text-3xl font-bold text-[#F28C52]">
          Vendor Partners
        </h1>

        <p className="mt-3 max-w-3xl text-gray-300">
          Peach State members get access to exclusive discounts and benefits
          from trusted off-road, overlanding, lighting, communications, and
          automotive partners. Click any vendor name below to visit their website.
        </p>

        <p className="mt-4 text-sm text-gray-400">
          For discount codes and details, email{" "}
          <a
            href="mailto:dariussaunders24@gmail.com"
            className="font-semibold text-[#F28C52] hover:underline"
          >
            dariussaunders24@gmail.com
          </a>
          .
        </p>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        {vendors.map((vendor) => (
          <div
            key={vendor.name}
            className="rounded-2xl border border-[#F28C52]/20 bg-black/40 p-5"
          >
            <div className="flex min-h-28 items-center justify-center rounded-xl bg-white p-4">
              <img
                src={vendor.logo}
                alt={vendor.name}
                className="max-h-20 max-w-full object-contain"
              />
            </div>

           <a
  href={vendor.url}
  target="_blank"
  rel="noopener noreferrer"
  className="mt-5 block text-2xl font-bold text-white hover:text-[#F28C52]"
>
  {vendor.name}
</a>

            <p className="mt-2 text-xl font-bold text-[#F28C52]">
              {vendor.discount}
            </p>

            <p className="mt-3 text-gray-300">{vendor.description}</p>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-[#F28C52]/30 bg-black/40 p-6">
        <h2 className="text-2xl font-bold text-[#F28C52]">
          Interested in Becoming a Vendor Partner?
        </h2>

        <p className="mt-3 max-w-3xl text-gray-300">
          We are always looking to partner with quality brands, shops, and
          service providers that bring real value to the Peach State Off-Road
          and Overlanding community.
        </p>

        <a
          href="mailto:dariussaunders24@gmail.com?subject=Peach State Vendor Partnership"
          className="mt-5 inline-block rounded-lg bg-[#F28C52] px-5 py-3 font-semibold text-black hover:bg-[#C96A2C]"
        >
          Email About Partnership
        </a>
      </section>
    </div>
  );
}