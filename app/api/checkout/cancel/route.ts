import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import { supabaseAdmin } from "@/lib/supabase"

// ── POST /api/checkout/cancel ──────────────────────────────────
// Called when user lands on the cancel page.
// Releases any pending stock reservations for this user.
// This is a fallback for when Stripe's checkout.session.expired
// webhook hasn't fired yet (common in development).
export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token?.id) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
    }

    const body = await req.json()
    const { session_id } = body

    if (session_id) {
      // Release this specific session's reservation
      await supabaseAdmin
        .from("stock_reservations")
        .update({ status: "released" })
        .eq("stripe_session_id", session_id)
        .eq("user_id", token.id)
        .eq("status", "pending")
    } else {
      // No session ID — release ALL pending reservations for this user
      // This is the safest fallback
      await supabaseAdmin
        .from("stock_reservations")
        .update({ status: "released" })
        .eq("user_id", token.id)
        .eq("status", "pending")
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("POST /api/checkout/cancel error:", err)
    return NextResponse.json(
      { error: "Failed to release reservation" },
      { status: 500 }
    )
  }
}