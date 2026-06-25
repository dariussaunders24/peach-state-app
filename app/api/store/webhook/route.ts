import { NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const resend = new Resend(process.env.RESEND_API_KEY);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function formatMoney(cents: number | null | undefined) {
  if (!cents) return "$0.00";
  return `$${(cents / 100).toFixed(2)}`;
}

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: `Webhook error: ${error.message}` },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.order_id;

    if (orderId) {
      await supabaseAdmin
        .from("store_orders")
        .update({
          status: "paid",
          stripe_session_id: session.id,
        })
        .eq("id", orderId);

      const { data: order } = await supabaseAdmin
        .from("store_orders")
        .select("*")
        .eq("id", orderId)
        .single();

      const { data: items } = await supabaseAdmin
        .from("store_order_items")
        .select("*")
        .eq("order_id", orderId);

      const itemList =
        items
          ?.map((item: any) => {
            const options = [
              item.size ? `Size: ${item.size}` : null,
              item.color ? `Color: ${item.color}` : null,
            ]
              .filter(Boolean)
              .join(" | ");

            return `
              <li>
                <strong>${item.product_name}</strong><br />
                Quantity: ${item.quantity}<br />
                Price: ${formatMoney(item.price)} each<br />
                ${options ? `${options}<br />` : ""}
              </li>
            `;
          })
          .join("") || "";

      await resend.emails.send({
        from: "Peach State Store <onboarding@resend.dev>",
        to: "dariussaunders24@gmail.com",
        subject: "New PSO Merch Order Received",
        html: `
          <h2>New PSO Merch Order</h2>

          <p><strong>Status:</strong> Paid</p>
          <p><strong>Total:</strong> ${formatMoney(order?.total)}</p>

          <h3>Customer</h3>
          <p>
            <strong>Name:</strong> ${order?.customer_name || "N/A"}<br />
            <strong>Email:</strong> ${order?.customer_email || "N/A"}
          </p>

          <h3>Items</h3>
          <ul>${itemList}</ul>

          ${
            order?.notes
              ? `<h3>Notes</h3><p>${order.notes}</p>`
              : ""
          }

          <p><strong>Stripe Session:</strong> ${session.id}</p>
        `,
      });
    }
  }

  return NextResponse.json({ received: true });
}