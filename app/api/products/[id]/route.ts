import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { data, error } = await supabase
      .from("products")
      .select(`
        id, name, slug, description, price,
        stock_qty, images, shipping_options, is_active,
        categories(id, name, slug)
      `)
      .eq("id", id)
      .eq("is_active", true)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    )
  }
}