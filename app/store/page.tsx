"use client";

import { useState } from "react";

const products = [
  {
    id: "shirts",
    name: "Peach State Group Shirt",
    price: 25,
    image: "/store/shirts.png",
    description: "Group shirt available in multiple colors and sizes.",
    hasSize: true,
    hasColor: true,
    colors: ["Military Green", "Green", "Red", "Gray", "Tan", "Blue"],
    sizes: ["S", "M", "L", "XL", "2XL", "3XL"],
  },
  {
    id: "sticker",
    name: '3" Round Group Sticker',
    price: 3,
    image: "/store/sticker-3in.png",
    description: 'Peach State 3" round group sticker.',
    hasSize: false,
    hasColor: false,
  },
  {
    id: "banner",
    name: '6" x 36" Windshield Banner Vinyl',
    price: 50,
    image: "/store/windshield-banner.png",
    description: 'Large Peach State windshield banner vinyl.',
    hasSize: false,
    hasColor: false,
  },
  {
    id: "window-vinyl",
    name: '6" x 6" Window Vinyl',
    price: 15,
    image: "/store/window-vinyl.png",
    description: 'Peach State 6" x 6" window vinyl.',
    hasSize: false,
    hasColor: false,
  },
];

export default function StorePage() {
  const [selectedProduct, setSelectedProduct] = useState(products[0]);
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");

  const total = selectedProduct.price * Number(quantity || 1);

  function submitOrder() {
    if (!name.trim()) return alert("Name is required.");
    if (!email.trim()) return alert("Email is required.");
    if (selectedProduct.hasSize && !size) return alert("Please select a size.");
    if (selectedProduct.hasColor && !color) return alert("Please select a color.");

    const subject = encodeURIComponent("Peach State Merch Order Request");

    const body = encodeURIComponent(`
Peach State Merch Order Request

Name: ${name}
Email: ${email}

Product: ${selectedProduct.name}
Price: $${selectedProduct.price}
Quantity: ${quantity}
${selectedProduct.hasSize ? `Size: ${size}` : ""}
${selectedProduct.hasColor ? `Color: ${color}` : ""}

Estimated Total: $${total}

Notes:
${notes || "None"}

Please send PayPal invoice details.
`);

    window.location.href = `mailto:dariussaunders24@gmail.com?subject=${subject}&body=${body}`;
  }

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-[#F28C52]/30 bg-black/40 p-6">
        <h1 className="text-3xl font-bold text-[#F28C52]">
          Peach State Merch Store
        </h1>

        <p className="mt-3 max-w-3xl text-gray-300">
          Order Peach State shirts, stickers, banners, and vinyl decals. Submit
          your order request here and an invoice will be sent manually.
        </p>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        {products.map((product) => (
          <button
            key={product.id}
            onClick={() => {
              setSelectedProduct(product);
              setSize("");
              setColor("");
            }}
            className={`overflow-hidden rounded-2xl border bg-black/40 text-left transition ${
              selectedProduct.id === product.id
                ? "border-[#F28C52]"
                : "border-white/10 hover:border-[#F28C52]/60"
            }`}
          >
            <div className="flex h-56 items-center justify-center bg-white p-4">
              <img
                src={product.image}
                alt={product.name}
                className="max-h-full max-w-full object-contain"
              />
            </div>

            <div className="p-5">
              <h2 className="text-xl font-bold text-white">{product.name}</h2>
              <p className="mt-2 text-2xl font-bold text-[#F28C52]">
                ${product.price}
              </p>
              <p className="mt-2 text-sm text-gray-300">
                {product.description}
              </p>
            </div>
          </button>
        ))}
      </section>

      <section className="rounded-2xl border border-[#F28C52]/30 bg-black/40 p-6">
        <h2 className="text-2xl font-bold text-[#F28C52]">
          Place Order Request
        </h2>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm text-gray-200">Product</label>
            <select
              value={selectedProduct.id}
              onChange={(e) => {
                const product = products.find((p) => p.id === e.target.value);
                if (product) {
                  setSelectedProduct(product);
                  setSize("");
                  setColor("");
                }
              }}
              className="w-full rounded-lg bg-white p-3 text-black"
            >
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} - ${product.price}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-200">Quantity</label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full rounded-lg bg-white p-3 text-black"
            />
          </div>

          {selectedProduct.hasSize && (
            <div>
              <label className="mb-2 block text-sm text-gray-200">Size</label>
              <select
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="w-full rounded-lg bg-white p-3 text-black"
              >
                <option value="">Select size</option>
                {selectedProduct.sizes?.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          )}

          {selectedProduct.hasColor && (
            <div>
              <label className="mb-2 block text-sm text-gray-200">Color</label>
              <select
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full rounded-lg bg-white p-3 text-black"
              >
                <option value="">Select color</option>
                {selectedProduct.colors?.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm text-gray-200">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg bg-white p-3 text-black"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-200">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg bg-white p-3 text-black"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm text-gray-200">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Pickup preference, special request, alternate contact info, etc."
              className="min-h-28 w-full rounded-lg bg-white p-3 text-black placeholder-gray-500"
            />
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-white/10 bg-black/30 p-4">
          <p className="text-gray-300">
            Estimated Total:{" "}
            <span className="text-xl font-bold text-[#F28C52]">${total}</span>
          </p>
          <p className="mt-2 text-sm text-gray-400">
            Payment is not collected on this site. After submitting, an invoice
            will be sent manually.
          </p>
        </div>

        <button
          onClick={submitOrder}
          className="mt-5 w-full rounded-lg bg-[#F28C52] px-5 py-3 font-semibold text-black hover:bg-[#C96A2C]"
        >
          Submit Order Request
        </button>
      </section>
    </div>
  );
}