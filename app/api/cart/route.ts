import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import { supabaseAdmin } from "@/lib/supabase"
import { z } from "zod"

const addToCartSchema = z.object({
  product_id: z.string().uuid("Invalid product ID"),
  quantity: z.number().int().min(1).max(100).default(1),
})


// Returns the current user's cart items with product details
export async function GET(req: NextRequest) {
  try {
    // Verify the user is authenticated
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token?.id) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
    }

    // Fetch cart items joined with product info
    const { data, error } = await supabaseAdmin
      .from("cart_items")
      .select(`
        id,
        quantity,
        created_at,
        products (
          id, name, slug, price,
          stock_qty, images
        )
      `)
      .eq("user_id", token.id)
      .order("created_at", { ascending: true })

    if (error) throw error

    return NextResponse.json(data ?? [])
  } catch (err) {
    console.error("GET /api/cart error:", err)
    return NextResponse.json(
      { error: "Failed to fetch cart" },
      { status: 500 }
    )
  }
}


// Adds a product to the cart, or increments qty if already there
export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token?.id) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
    }

    // Validate request body
    const body = await req.json()
    const parsed = addToCartSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    const { product_id, quantity } = parsed.data

    // Check the product exists and has enough stock
    const { data: product, error: productError } = await supabaseAdmin
      .from("products")
      .select("id, stock_qty, name")
      .eq("id", product_id)
      .eq("is_active", true)
      .single()

    if (productError || !product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      )
    }

    if (product.stock_qty === 0) {
      return NextResponse.json(
        { error: "This product is sold out" },
        { status: 400 }
      )
    }

    // Check if this product is already in the user's cart
    const { data: existing } = await supabaseAdmin
      .from("cart_items")
      .select("id, quantity")
      .eq("user_id", token.id)
      .eq("product_id", product_id)
      .single()

    if (existing) {
      // Product already in cart — increment quantity instead
      const newQty = existing.quantity + quantity

      // Make sure we don't exceed stock
      if (newQty > product.stock_qty) {
        return NextResponse.json(
          { error: `Only ${product.stock_qty} in stock` },
          { status: 400 }
        )
      }

      const { data: updated, error: updateError } = await supabaseAdmin
        .from("cart_items")
        .update({ quantity: newQty })
        .eq("id", existing.id)
        .select()
        .single()

      if (updateError) throw updateError

      return NextResponse.json(updated)
    }

    // Not in cart yet — insert new cart item
    const { data: inserted, error: insertError } = await supabaseAdmin
      .from("cart_items")
      .insert({
        user_id: token.id,
        product_id,
        quantity,
      })
      .select()
      .single()

    if (insertError) throw insertError

    return NextResponse.json(inserted, { status: 201 })
  } catch (err) {
    console.error("POST /api/cart error:", err)
    return NextResponse.json(
      { error: "Failed to add to cart" },
      { status: 500 }
    )
  }
}