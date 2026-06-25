import Link from "next/link";

export default function StoreSuccessPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-16 text-white">
      <div className="mx-auto max-w-2xl rounded-2xl border border-[#F28C52]/40 bg-zinc-950 p-8 text-center">
        <h1 className="mb-4 text-3xl font-bold text-[#F28C52]">
          Order Received
        </h1>

        <p className="mb-6 text-zinc-300">
          Thank you for supporting Peach State Off-Road and Overlanding.
          Your order has been submitted successfully.
        </p>

        <Link
          href="/store"
          className="inline-block rounded-xl bg-[#F28C52] px-6 py-3 font-bold text-black"
        >
          Back to Store
        </Link>
      </div>
    </main>
  );
}