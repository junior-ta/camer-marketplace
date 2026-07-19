import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import { supabaseAdmin } from "@/lib/supabase"

// ── GET /api/admin/orders ──────────────────────────────────────
// Returns ALL orders across all users — admin only.
// In production, gate this behind an admin role check.
export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token?.id) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
    }

    // Fetch all orders sorted newest first
    const { data, error } = await supabaseAdmin
      .from("orders")
      .select(`
        id,
        status,
        total_amount,
        user_id,
        created_at,
        order_items (
          id, quantity, unit_price,
          products ( id, name, images )
        )
      `)
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json(data ?? [])
  } catch (err) {
    console.error("GET /api/admin/orders error:", err)
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    )
  }
}