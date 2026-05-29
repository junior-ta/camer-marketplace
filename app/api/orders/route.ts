import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import { supabaseAdmin } from "@/lib/supabase"


// Returns all orders for the currently logged-in user
// Orders are sorted newest first
export async function GET(req: NextRequest) {
  try {
    // Verify authentication
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token?.id) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
    }

    // Fetch orders with their line items and product details
    const { data, error } = await supabaseAdmin
      .from("orders")
      .select(`
        id,
        status,
        total_amount,
        stripe_session_id,
        created_at,
        order_items (
          id,
          quantity,
          unit_price,
          products (
            id, name, images
          )
        )
      `)
      .eq("user_id", token.id)
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json(data ?? [])
  } catch (err) {
    console.error("GET /api/orders error:", err)
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    )
  }
}