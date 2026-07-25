import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import { supabaseAdmin } from "@/lib/supabase"
import Stripe from "stripe"

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-04-30.basil",
})

// ── POST /api/checkout ─────────────────────────────────────────
// Creates a Stripe checkout session from the user's current cart
export async function POST(req: NextRequest) {
  try {
    // Verify the user is authenticated
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token?.id) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
    }

    // Fetch the user's cart items with product details from the server
    const { data: cartItems, error: cartError } = await supabaseAdmin
      .from("cart_items")
      .select(`
        id,
        quantity,
        products (
          id, name, price, stock_qty, images
        )
      `)
      .eq("user_id", token.id)

    if (cartError) throw cartError

    // Cart must not be empty
    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json(
        { error: "Your cart is empty" },
        { status: 400 }
      )
    }

    // Build items array for reservation + Stripe

    const items = cartItems.map((item) => {
      const product = item.products as {
        id: string; name: string; price: number;
        stock_qty: number; images: string[]
      }
      return {
        product_id: product.id,
        quantity: item.quantity,
        price: product.price,
        name: product.name,
        images: product.images,
      }
    })

    // ── Reserve stock atomically before creating Stripe session ──
        // This prevents overselling in the time between add-to-cart and checkout
        
    // Stripe sessions expire after 30 minutes — match that window
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString()
    const tempSessionId = `temp_${token.id}_${Date.now()}`

    const { data: reservationResult } = await supabaseAdmin.rpc(
      "reserve_stock_atomic",
      {
        p_session_id: tempSessionId,
        p_user_id:    token.id,
        p_items:      items.map((i) => ({
          product_id: i.product_id,
          quantity:   i.quantity,
        })),
        p_expires_at: expiresAt,
      }
    )

    // If reservation failed, stock is not available
    if (!reservationResult?.success) {
      return NextResponse.json(
        {
          error: reservationResult?.error ??
            "Some items are no longer available in the requested quantity"
        },
        { status: 400 }
      )
    }

    // Build Stripe line items
    const lineItems = items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
          images: item.images?.[0] ? [item.images[0]] : [],
          metadata: { product_id: item.product_id },
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }))

    // Create Stripe session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      metadata: {
        user_id: token.id as string,
        temp_reservation_id: tempSessionId,
        cart_items: JSON.stringify(
          items.map((i) => ({
            product_id: i.product_id,
            quantity:   i.quantity,
            price:      i.price,
          }))
        ),
      },
      success_url: `${process.env.NEXTAUTH_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${process.env.NEXTAUTH_URL}/checkout/cancel`,
      // Stripe session also expires in 30 min
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
    })

    // Update reservation with the real Stripe session ID
    await supabaseAdmin
      .from("stock_reservations")
      .update({ stripe_session_id: session.id })
      .eq("stripe_session_id", tempSessionId)

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error("POST /api/checkout error:", err)
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    )
  }
}