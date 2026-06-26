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
  id: "hoodie-1",
  name: "Classic Logo Peach State Hoodie ",
  price: 70,
  image: "/store/hoodie.png",
  description: "Midweight Unisex Hoodie. Available in multiple sizes and colors.",
  hasSize: true,
  hasColor: true,
  colors: ["Gray", "Black", "Blue", "Green", "White"],
  sizes: ["S", "M", "L", "XL", "XXL"],
},
{
  id: "hoodie-2",
  name: "Peach State Hoodie. Available in multiple sizes and colors.",
  price: 70,
  image: "/store/hoodie2.png",
  description: "Midweight Unisex Hoodie. Available in multiple sizes and colors.",
  hasSize: true,
  hasColor: true,
  colors: ["Gray", "Black", "Blue", "Green", "White"],
  sizes: ["S", "M", "L", "XL", "XXL"],
},
{
  id: "hat-1",
  name: "Classic Logo Peach State Hat ",
  price: 30,
  image: "/store/hat1.png",
  description: "Classic Peach State logo hat. Available in gray, black, blue and white",
  hasSize: false,
  hasColor: true,
  colors: ["Gray", "Black", "Blue", "White"],
  },
{
  id: "hat-2",
  name: "Peach State Hat ",
  price: 30,
  image: "/store/hat2.png",
  description: "Peach State logo hat. Available in gray, black, blue and white",
  hasSize: false,
  hasColor: true,
  colors: ["Gray", "Black", "Blue", "White"],
},
{
  id: "can-coozie",
  name: "Peach State Beer Can Coozie",
  price: 3.50,
  image: "/store/cancoozie.png",
  description: "Orange beer can coozie with white Peach State logo.",
  hasSize: false,
  hasColor: false,
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
    price: 55,
    image: "/store/windshield-banner.png",
    description: "Large Peach State windshield banner vinyl.",
    hasSize: false,
    hasColor: false,
  },
  {
    id: "window-vinyl",
    name: '6" x 6" Window Vinyl',
    price: 20,
    image: "/store/window-vinyl.png",
    description: 'Peach State 6" x 6" window vinyl.',
    hasSize: false,
    hasColor: false,
  },
];

type Product = (typeof products)[number];

type CartItem = {
  cartId: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
};

export default function StorePage() {
  
  const [selectedProduct, setSelectedProduct] = useState<Product>(products[0]);
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [notes, setNotes] = useState("");
  const [checkingOut, setCheckingOut] = useState(false);

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  function resetOptions() {
    setSize("");
    setColor("");
    setQuantity("1");
  }

  function addToCart() {
    const qty = Number(quantity);

    if (!qty || qty < 1) return alert("Quantity must be at least 1.");
    if (selectedProduct.hasSize && !size) return alert("Please select a size.");
    if (selectedProduct.hasColor && !color) {
      return alert("Please select a color.");
    }

    const existingItem = cart.find(
      (item) =>
        item.productId === selectedProduct.id &&
        item.size === (selectedProduct.hasSize ? size : undefined) &&
        item.color === (selectedProduct.hasColor ? color : undefined)
    );

    if (existingItem) {
      setCart((prev) =>
        prev.map((item) =>
          item.cartId === existingItem.cartId
            ? { ...item, quantity: item.quantity + qty }
            : item
        )
      );
    } else {
      setCart((prev) => [
        ...prev,
        {
          cartId: `${selectedProduct.id}-${size || "no-size"}-${
            color || "no-color"
          }-${Date.now()}`,
          productId: selectedProduct.id,
          name: selectedProduct.name,
          price: selectedProduct.price,
          quantity: qty,
          size: selectedProduct.hasSize ? size : undefined,
          color: selectedProduct.hasColor ? color : undefined,
        },
      ]);
    }

    resetOptions();
  }

  function removeFromCart(cartId: string) {
    setCart((prev) => prev.filter((item) => item.cartId !== cartId));
  }

  function updateQuantity(cartId: string, quantity: number) {
    if (quantity < 1) return;

    setCart((prev) =>
      prev.map((item) =>
        item.cartId === cartId ? { ...item, quantity } : item
      )
    );
  }

  async function submitOrder() {
    if (checkingOut) return;
    if (cart.length === 0) return alert("Please add at least one item.");

    try {
      setCheckingOut(true);

      const res = await fetch("/api/store/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cart,
          notes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Checkout failed.");
        setCheckingOut(false);
        return;
      }

      window.location.href = data.url;
    } catch (error) {
      console.error(error);
      alert("Checkout failed. Please try again.");
      setCheckingOut(false);
    }
  }

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-[#F28C52]/30 bg-black/40 p-6">
        <h1 className="text-3xl font-bold text-[#F28C52]">
          Peach State Merch Store
        </h1>
        

        <p className="mt-3 max-w-3xl text-gray-300">
          Order Peach State shirts, stickers, banners, and vinyl decals. Add
          multiple items to your cart and checkout securely online.
        </p>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        {products.map((product) => (
          <button
            key={product.id}
            onClick={() => {
              setSelectedProduct(product);
              resetOptions();
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
        <h2 className="text-2xl font-bold text-[#F28C52]">Add Item to Cart</h2>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm text-gray-200">Product</label>
            <select
              value={selectedProduct.id}
              onChange={(e) => {
                const product = products.find((p) => p.id === e.target.value);
                if (product) {
                  setSelectedProduct(product);
                  resetOptions();
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
        </div>

        <button
          onClick={addToCart}
          className="mt-5 w-full rounded-lg bg-[#F28C52] px-5 py-3 font-semibold text-black hover:bg-[#C96A2C]"
        >
          Add to Cart
        </button>
      </section>

      <section className="rounded-2xl border border-[#F28C52]/30 bg-black/40 p-6">
        <h2 className="text-2xl font-bold text-[#F28C52]">Cart</h2>

        {cart.length === 0 ? (
          <p className="mt-4 text-gray-400">No items added yet.</p>
        ) : (
          <div className="mt-5 space-y-4">
            {cart.map((item) => (
              <div
                key={item.cartId}
                className="rounded-xl border border-white/10 bg-black/30 p-4"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="font-semibold text-white">{item.name}</h3>

                    <p className="mt-1 text-sm text-gray-400">
                      ${item.price} each
                    </p>

                    {item.size && (
                      <p className="mt-1 text-sm text-gray-300">
                        Size: {item.size}
                      </p>
                    )}

                    {item.color && (
                      <p className="mt-1 text-sm text-gray-300">
                        Color: {item.color}
                      </p>
                    )}

                    <p className="mt-2 text-sm font-semibold text-[#F28C52]">
                      Line Total: ${item.price * item.quantity}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() =>
                        updateQuantity(item.cartId, item.quantity - 1)
                      }
                      className="rounded border border-white/20 px-3 py-1 text-white hover:border-[#F28C52]"
                    >
                      -
                    </button>

                    <span className="min-w-8 text-center font-semibold text-white">
                      {item.quantity}
                    </span>

                    <button
                      onClick={() =>
                        updateQuantity(item.cartId, item.quantity + 1)
                      }
                      className="rounded border border-white/20 px-3 py-1 text-white hover:border-[#F28C52]"
                    >
                      +
                    </button>

                    <button
                      onClick={() => removeFromCart(item.cartId)}
                      className="rounded border border-red-400/40 px-3 py-1 text-red-300 hover:bg-red-500/10"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <div className="rounded-xl border border-white/10 bg-black/30 p-4">
              <p className="text-gray-300">
                Estimated Cart Total:{" "}
                <span className="text-xl font-bold text-[#F28C52]">
                  ${cartTotal}
                </span>
              </p>

              <p className="mt-2 text-sm text-gray-400">
                Contact, payment, and shipping details are collected securely by
                Stripe during checkout.
              </p>
            </div>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-[#F28C52]/30 bg-black/40 p-6">
        <h2 className="text-2xl font-bold text-[#F28C52]">Checkout</h2>

        <div className="mt-5">
          <label className="mb-2 block text-sm text-gray-200">
            Order Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Pickup preference, special request, alternate contact info, etc."
            className="min-h-28 w-full rounded-lg bg-white p-3 text-black placeholder-gray-500"
          />
        </div>

        <button
          onClick={submitOrder}
          disabled={checkingOut}
          className="mt-5 w-full rounded-lg bg-[#F28C52] px-5 py-3 font-semibold text-black hover:bg-[#C96A2C] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {checkingOut ? "Opening Checkout..." : "Checkout"}
        </button>
      </section>
    </div>
  );
}