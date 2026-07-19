import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { isAdmin } from "@/lib/admin"
import { z } from "zod"

// Allowed order status transitions
// An order can only move forward — never backward
const STATUS_TRANSITIONS: Record<string, string[]> = {
  pending:   ["paid", "cancelled"],
  paid:      ["shipped", "cancelled"],
  shipped:   [], // final state — no further transitions
  cancelled: [], // final state
}

const updateSchema = z.object({
  status: z.enum(["pending", "paid", "shipped", "cancelled"]),
})

// ── PATCH /api/admin/orders/[id] ───────────────────────────────
// Allows an admin to update an order's status.
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // admin check
    if (!(await isAdmin(req))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id } = await params

    const body = await req.json()
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid status" },
        { status: 400 }
      )
    }

    const { status: newStatus } = parsed.data

    // Fetch current order status
    const { data: order, error: fetchError } = await supabaseAdmin
      .from("orders")
      .select("id, status")
      .eq("id", id)
      .single()

    if (fetchError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Validate the status transition is allowed
    const allowed = STATUS_TRANSITIONS[order.status] ?? []
    if (!allowed.includes(newStatus)) {
      return NextResponse.json(
        {
          error: `Cannot transition order from "${order.status}" to "${newStatus}"`,
        },
        { status: 400 }
      )
    }

    // Update the order status
    const { data: updated, error: updateError } = await supabaseAdmin
      .from("orders")
      .update({ status: newStatus })
      .eq("id", id)
      .select()
      .single()

    if (updateError) throw updateError

    return NextResponse.json(updated)
  } catch (err) {
    console.error("PATCH /api/admin/orders/[id] error:", err)
    return NextResponse.json(
      { error: "Failed to update order status" },
      { status: 500 }
    )
  }
}