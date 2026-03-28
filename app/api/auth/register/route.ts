import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import bcrypt from "bcryptjs"
import { z } from "zod"

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Validate with Zod
    const parsed = registerSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    const { name, email, password } = parsed.data

    // Check if user already exists
    const { data: existing } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("email", email)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      )
    }

    // Hash password with bcrypt (cost factor 12)
    const password_hash = await bcrypt.hash(password, 12)

    // Insert new user
    const { data: user, error } = await supabaseAdmin
      .from("users")
      .insert({ name, email, password_hash })
      .select("id, email, name")
      .single()

    if (error || !user) {
      return NextResponse.json(
        { error: "Failed to create account. Please try again." },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: "Account created successfully", user },
      { status: 201 }
    )
  } catch {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}