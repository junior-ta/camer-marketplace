import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import { supabaseAdmin } from "@/lib/supabase"

// Returns a single order with full line item details
// Ownership is verified — users can only see their own orders
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token?.id) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
    }

    const { id } = await params

    // Fetch the order — the user_id check ensures ownership
    const { data, error } = await supabaseAdmin
      .from("orders")
      .select(`
        id,
        status,
        total_amount,
        stripe_session_id,
        created_at,
        updated_at,
        order_items (
          id,
          quantity,
          unit_price,
          products (
            id, name, slug, images
          )
        )
      `)
      .eq("id", id)
      .eq("user_id", token.id) // ownership check
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error("GET /api/orders/[id] error:", err)
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    )
  }
}