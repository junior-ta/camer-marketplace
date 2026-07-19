import { NextRequest, NextResponse } from "next/server"
import { isAdmin } from "@/lib/admin"

// Lightweight endpoint just to check admin status
// Used by the navbar to conditionally show the admin link
export async function GET(req: NextRequest) {
  const admin = await isAdmin(req)
  return NextResponse.json({ isAdmin: admin })
}