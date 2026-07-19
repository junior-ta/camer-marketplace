import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { isAdmin } from "@/lib/admin"

// ── GET /api/admin/orders ──────────────────────────────────────
// Returns ALL orders across all users — admin only.

export async function GET(req: NextRequest) {
  try {

    //admin role check.
    if (!(await isAdmin(req))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
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