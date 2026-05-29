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

    // Fetch the user's cart items with product details
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

    // Validate stock for every item before creating the session
    // This prevents overselling in the time between add-to-cart and checkout
    for (const item of cartItems) {
      const product = item.products as {
        id: string; name: string; price: number;
        stock_qty: number; images: string[]
      }

      if (!product) {
        return NextResponse.json(
          { error: "A product in your cart no longer exists" },
          { status: 400 }
        )
      }

      if (product.stock_qty < item.quantity) {
        return NextResponse.json(
          { error: `Not enough stock for "${product.name}". Only ${product.stock_qty} left.` },
          { status: 400 }
        )
      }
    }

    // Build Stripe line items from cart
    const lineItems = cartItems.map((item) => {
      const product = item.products as {
        id: string; name: string; price: number;
        stock_qty: number; images: string[]
      }

      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: product.name,
            // Pass product image to Stripe checkout page if available
            images: product.images?.[0] ? [product.images[0]] : [],
            // Store product ID in metadata for webhook processing
            metadata: { product_id: product.id },
          },
          // Stripe uses cents — multiply by 100
          unit_amount: Math.round(product.price * 100),
        },
        quantity: item.quantity,
      }
    })

    // Create the Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      // Pass user ID and cart metadata for the webhook to use
      metadata: {
        user_id: token.id as string,
        cart_items: JSON.stringify(
          cartItems.map((item) => ({
            product_id: (item.products as { id: string }).id,
            quantity: item.quantity,
            price: (item.products as { price: number }).price,
          }))
        ),
      },
      // Where to redirect after payment
      success_url: `${process.env.NEXTAUTH_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/checkout/cancel`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error("POST /api/checkout error:", err)
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    )
  }
}