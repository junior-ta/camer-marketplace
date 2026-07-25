import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { supabaseAdmin } from "@/lib/supabase"

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-04-30.basil",
})

// ── POST /api/stripe ───────────────────────────────────────────
// Handles incoming Stripe webhook events
// This route must NOT parse the body as JSON — Stripe needs the raw bytes
// to verify the signature
export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get("stripe-signature")

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    // Verify the webhook came from Stripe using the webhook secret
    // This prevents anyone from faking a successful payment event
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error("Webhook signature verification failed:", err)
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    )
  }

  try {
    if (event.type === "checkout.session.completed") {
      // Payment succeeded — confirm reservation + create order
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
    }

    if (event.type === "checkout.session.expired") {
      // User abandoned checkout or session timed out — release reservation
      await handleCheckoutExpired(event.data.object as Stripe.Checkout.Session)
    }
  } catch (err) {
    console.error("Webhook handler error:", err)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}

// ── handleCheckoutCompleted ────────────────────────────────────
// Called when a Stripe payment succeeds.
// Creates the order, decrements stock, and clears the cart.
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const { user_id, cart_items: cartItemsJson } = session.metadata ?? {}

  if (!user_id || !cartItemsJson) {
    throw new Error("Missing metadata in Stripe session")
  }

  // Parse the cart items we stored in metadata during checkout
  const cartItems: {
    product_id: string
    quantity: number
    price: number
  }[] = JSON.parse(cartItemsJson)

  const totalAmount = session.amount_total
    ? session.amount_total / 100 // convert cents back to dollars
    : cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  // ── 1. Create the order record ─────────────────────────────
  const { data: order, error: orderError } = await supabaseAdmin
    .from("orders")
    .insert({
      user_id,
      stripe_session_id: session.id,
      status: "paid",
      total_amount: totalAmount,
    })
    .select()
    .single()

  if (orderError || !order) {
    throw new Error(`Failed to create order: ${orderError?.message}`)
  }

  // ── 2. Create order items ──────────────────────────────────
  await supabaseAdmin.from("order_items").insert(
    cartItems.map((item) => ({
      order_id:   order.id,
      product_id: item.product_id,
      quantity:   item.quantity,
      unit_price: item.price,
    }))
  )

  // ── 3. Confirm reservation + decrement stock atomically ────
  // Mark reservation as confirmed first
  await supabaseAdmin
    .from("stock_reservations")
    .update({ status: "confirmed" })
    .eq("stripe_session_id", session.id)

  // Now actually decrement the real stock
  const { error: stockError } = await supabaseAdmin.rpc(
    "decrement_stock_atomic",
    {
      items: cartItems.map((i) => ({
        product_id: i.product_id,
        quantity:   i.quantity,
      })),
    }
  )

  if (stockError) {
    // Payment taken, reservation confirmed, but real stock decrement failed.
    // The reservation system prevented overselling at checkout time,
    // so this is likely a DB error, not an oversell.
    // Log for manual review.
    console.error(
      `⚠️ STOCK ALERT: Order ${order.id} — stock decrement failed:`,
      stockError.message
    )
  }

  // ── 4. Clear cart ──────────────────────────────────────────
  await supabaseAdmin
    .from("cart_items")
    .delete()
    .eq("user_id", user_id)

  console.log(`✅ Order ${order.id} created for user ${user_id}`)
}


// ── Payment expired / cancelled ────────────────────────────────
// User left the Stripe page without paying — release the reservation
// so other users can buy those items
async function handleCheckoutExpired(session: Stripe.Checkout.Session) {
  const { error } = await supabaseAdmin
    .from("stock_reservations")
    .update({ status: "released" })
    .eq("stripe_session_id", session.id)
    .eq("status", "pending") // only release if still pending

  if (error) {
    console.error("Failed to release reservation:", error.message)
  } else {
    console.log(`🔓 Reservation released for expired session ${session.id}`)
  }
}