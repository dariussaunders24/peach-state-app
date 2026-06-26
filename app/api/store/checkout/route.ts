import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const productPriceMap: Record<string, number> = {
  shirts: 2500,
  "hoodie-1": 7000,
  "hoodie-2": 7000,
  "hat-1": 3000,
"hat-2": 3000,
  sticker: 300,
  banner: 5000,
  "window-vinyl": 1500,
};

export async function POST(req: Request) {
  try {
    const { cart, notes } = await req.json();

    if (!cart || cart.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const total = cart.reduce((sum: number, item: any) => {
      const unitAmount = productPriceMap[item.productId];

      if (!unitAmount) {
        throw new Error(`Invalid product: ${item.productId}`);
      }

      return sum + unitAmount * item.quantity;
    }, 0);

    const { data: order, error: orderError } = await supabaseAdmin
      .from("store_orders")
      .insert({
        total,
        status: "checkout_started",
        notes: notes || null,
      })
      .select("id")
      .single();

    if (orderError || !order) {
      console.error("Order insert error:", orderError);
      return NextResponse.json(
        { error: "Could not create order." },
        { status: 500 }
      );
    }

    const orderItems = cart.map((item: any) => {
      const unitAmount = productPriceMap[item.productId];

      if (!unitAmount) {
        throw new Error(`Invalid product: ${item.productId}`);
      }

      return {
        order_id: order.id,
        product_id: item.productId,
        product_name: item.name,
        quantity: item.quantity,
        price: unitAmount,
        size: item.size || null,
        color: item.color || null,
      };
    });

    const { error: itemsError } = await supabaseAdmin
      .from("store_order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error("Order items insert error:", itemsError);
      return NextResponse.json(
        { error: "Could not save order items." },
        { status: 500 }
      );
    }

    const line_items = cart.map((item: any) => {
      const unitAmount = productPriceMap[item.productId];

      if (!unitAmount) {
        throw new Error(`Invalid product: ${item.productId}`);
      }

      const details = [
        item.size ? `Size: ${item.size}` : null,
        item.color ? `Color: ${item.color}` : null,
      ]
        .filter(Boolean)
        .join(" | ");

      return {
        quantity: item.quantity,
        price_data: {
          currency: "usd",
          unit_amount: unitAmount,
          product_data: {
            name: details ? `${item.name} - ${details}` : item.name,
          },
        },
      };
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      shipping_address_collection: {
        allowed_countries: ["US"],
      },
      metadata: {
        order_id: order.id,
        notes: notes || "",
      },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/store/success?order=${order.id}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/store`,
    });

    await supabaseAdmin
      .from("store_orders")
      .update({
        stripe_session_id: session.id,
        status: "pending_payment",
      })
      .eq("id", order.id);

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Stripe checkout error:", error);

    return NextResponse.json(
      { error: error.message || "Checkout failed" },
      { status: 500 }
    );
  }
}