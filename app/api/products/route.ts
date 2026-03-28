import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const search    = searchParams.get("search") ?? ""
    const category  = searchParams.get("category") ?? ""
    const minPrice  = parseFloat(searchParams.get("minPrice") ?? "0")
    const maxPrice  = parseFloat(searchParams.get("maxPrice") ?? "999999")
    const page      = parseInt(searchParams.get("page") ?? "1")
    const limit     = 12
    const offset    = (page - 1) * limit

    let query = supabase
      .from("products")
      .select(`
        id, name, slug, price, stock_qty,
        images, shipping_options, is_active,
        categories(id, name, slug)
      `, { count: "exact" })
      .eq("is_active", true)
      .gte("price", minPrice)
      .lte("price", maxPrice)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (search) {
      query = query.ilike("name", `%${search}%`)
    }

    if (category) {
      const { data: cat } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", category)
        .single()

      if (cat) {
        query = query.eq("category_id", cat.id)
      }
    }

    const { data, error, count } = await query
    if (error) throw error

    return NextResponse.json({
      products: data,
      total: count ?? 0,
      page,
      totalPages: Math.ceil((count ?? 0) / limit),
    })
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    )
  }
}