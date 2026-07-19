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

  // Only process successful checkout completions
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session

    try {
      await handleCheckoutCompleted(session)
    } catch (err) {
      console.error("handleCheckoutCompleted error:", err)
      // Return 500 so Stripe retries the webhook
      return NextResponse.json(
        { error: "Webhook handler failed" },
        { status: 500 }
      )
    }
  }

  // Acknowledge receipt of the event
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
  const orderItems = cartItems.map((item) => ({
    order_id: order.id,
    product_id: item.product_id,
    quantity: item.quantity,
    unit_price: item.price,
  }))

  const { error: itemsError } = await supabaseAdmin
    .from("order_items")
    .insert(orderItems)

  if (itemsError) {
    throw new Error(`Failed to create order items: ${itemsError.message}`)
  }

  // ── 3. Decrement stock for each product atomically ─────────
  // The stored procedure locks rows and validates stock
  const stockItems = cartItems.map((item) => ({
    product_id: item.product_id,
    quantity: item.quantity,
  }))

  const { error: stockError } = await supabaseAdmin.rpc(
    "decrement_stock_atomic",
    { items: stockItems }
  )

  if (stockError) {
    // This means stock ran out between checkout creation and payment
    // The order is already created and paid — log this for manual review
    console.error(
      `⚠️ Stock decrement failed for order ${order.id}:`,
      stockError.message
    )
    // Don't throw here — the payment already went through. trigger an alert to manually handle this edge case.
  }

  // ── 4. Clear the user's cart after successful payment ──────
  await supabaseAdmin
    .from("cart_items")
    .delete()
    .eq("user_id", user_id)

  console.log(`✅ Order ${order.id} created for user ${user_id}`)
}