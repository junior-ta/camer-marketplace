import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { z } from "zod"

// Validation schema for contact form submissions
const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000),
})

// ── POST /api/contact ──────────────────────────────────────────
// Stores a contact form submission in the database
// Public route — no authentication required
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Validate all fields with Zod
    const parsed = contactSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Validation failed" },
        { status: 400 }
      )
    }

    const { name, email, message } = parsed.data

    // Store the message in the database
    const { error } = await supabaseAdmin
      .from("contact_messages")
      .insert({ name, email, message })

    if (error) throw error

    return NextResponse.json(
      { message: "Message sent successfully" },
      { status: 201 }
    )
  } catch (err) {
    console.error("POST /api/contact error:", err)
    return NextResponse.json(
      { error: "Failed to send message. Please try again." },
      { status: 500 }
    )
  }
}