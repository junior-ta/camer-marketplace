import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import { supabaseAdmin } from "@/lib/supabase"

// Secure server-side image upload to Supabase Storage.
// Only authenticated users can upload — in production you'd add an admin role check here.
export async function POST(req: NextRequest) {
  try {
    // Must be logged in to upload
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token?.id) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Only JPEG, PNG and WebP images are allowed" },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size must be under 5MB" },
        { status: 400 }
      )
    }

    // Generate a unique filename using timestamp + random string
    // This prevents filename collisions and path traversal attacks
    const ext = file.type.split("/")[1]
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const path = `products/${filename}`

    // Convert File to ArrayBuffer for Supabase upload
    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    // Upload using service role (bypasses RLS — safe server-side only)
    const { data, error } = await supabaseAdmin.storage
      .from("product-images")
      .upload(path, buffer, {
        contentType: file.type,
        upsert: false, // never overwrite existing files
      })

    if (error) throw error

    // Get the public URL for this image
    const { data: urlData } = supabaseAdmin.storage
      .from("product-images")
      .getPublicUrl(data.path)

    return NextResponse.json({
      url: urlData.publicUrl,
      path: data.path,
    })
  } catch (err) {
    console.error("POST /api/admin/upload error:", err)
    return NextResponse.json(
      { error: "Upload failed. Please try again." },
      { status: 500 }
    )
  }
}