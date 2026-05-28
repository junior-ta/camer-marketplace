import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import { supabaseAdmin } from "@/lib/supabase"
import { z } from "zod"

// Validation schema for updating quantity
const updateSchema = z.object({
  quantity: z.number().int().min(1).max(100),
})


// Updates the quantity of a specific cart item
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token?.id) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
    }

    const { id } = await params

    // Validate new quantity
    const body = await req.json()
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    const { quantity } = parsed.data

    // Verify this cart item belongs to the requesting user
    // (extra safety on top of RLS)
    const { data: cartItem } = await supabaseAdmin
      .from("cart_items")
      .select("id, product_id")
      .eq("id", id)
      .eq("user_id", token.id)
      .single()

    if (!cartItem) {
      return NextResponse.json(
        { error: "Cart item not found" },
        { status: 404 }
      )
    }

    // Check stock before allowing quantity increase
    const { data: product } = await supabaseAdmin
      .from("products")
      .select("stock_qty")
      .eq("id", cartItem.product_id)
      .single()

    if (product && quantity > product.stock_qty) {
      return NextResponse.json(
        { error: `Only ${product.stock_qty} in stock` },
        { status: 400 }
      )
    }

    // Update the quantity
    const { data: updated, error } = await supabaseAdmin
      .from("cart_items")
      .update({ quantity })
      .eq("id", id)
      .eq("user_id", token.id) // double-check ownership
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(updated)
  } catch (err) {
    console.error("PATCH /api/cart/[id] error:", err)
    return NextResponse.json(
      { error: "Failed to update cart item" },
      { status: 500 }
    )
  }
}


// Removes a specific item from the cart
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token?.id) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
    }

    const { id } = await params

    // Delete only if the item belongs to this user
    const { error } = await supabaseAdmin
      .from("cart_items")
      .delete()
      .eq("id", id)
      .eq("user_id", token.id) // ownership check prevents deleting others' items

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("DELETE /api/cart/[id] error:", err)
    return NextResponse.json(
      { error: "Failed to remove cart item" },
      { status: 500 }
    )
  }
}