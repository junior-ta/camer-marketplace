"use client"

import { useState, useEffect, useCallback, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import ProductCard from "@/components/ProductCard"
import StockBadge from "@/components/StockBadge"

interface Product {
  id: string
  name: string
  slug: string
  price: number
  stock_qty: number
  images: string[]
  categories: { name: string; slug: string } | null
}

interface Category {
  id: string
  name: string
  slug: string
  image_url: string
}

function HomePageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(searchParams.get("search") ?? "")
  const [debouncedSearch, setDebouncedSearch] = useState(searchParams.get("search") ?? "")
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") ?? "")
  const [maxPrice, setMaxPrice] = useState(parseInt(searchParams.get("maxPrice") ?? "500"))
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [totalProducts, setTotalProducts] = useState(0)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  // Sync state when URL params change externally (e.g. navbar links)
  useEffect(() => {
    const cat = searchParams.get("category") ?? ""
    const s = searchParams.get("search") ?? ""
    const price = parseInt(searchParams.get("maxPrice") ?? "500")
    setSelectedCategory(cat)
    setSearch(s)
    setDebouncedSearch(s)
    setMaxPrice(price)
  }, [searchParams])

  // Sync filters to URL
  useEffect(() => {
    const params = new URLSearchParams()
    if (debouncedSearch) params.set("search", debouncedSearch)
    if (selectedCategory) params.set("category", selectedCategory)
    if (maxPrice < 500) params.set("maxPrice", maxPrice.toString())
    const query = params.toString()
    router.replace(query ? `/?${query}` : "/", { scroll: false })
  }, [debouncedSearch, selectedCategory, maxPrice, router])

  // Fetch categories
  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then(setCategories)
  }, [])

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (debouncedSearch) params.set("search", debouncedSearch)
    if (selectedCategory) params.set("category", selectedCategory)
    if (maxPrice < 500) params.set("maxPrice", maxPrice.toString())

    const res = await fetch(`/api/products?${params}`)
    const data = await res.json()
    setProducts(data.products ?? [])
    setTotalProducts(data.total ?? 0)
    setLoading(false)
  }, [debouncedSearch, selectedCategory, maxPrice])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  return (
    <div style={{ backgroundColor: "#f9f9f9", minHeight: "100vh", fontFamily: "Inter, sans-serif" }}>

      {/* ── HERO ─────────────────────────────────────────── */}
      <section style={{ padding: "0 40px 0", maxWidth: 1440, margin: "0 auto" }}>
        <div style={{
          position: "relative",
          borderRadius: 20,
          overflow: "hidden",
          minHeight: 480,
          display: "flex",
          alignItems: "center",
          background: "linear-gradient(135deg, #001a0c 0%, #003d1f 50%, #006b35 100%)",
        }}>
          {/* Background image overlay */}
          <img
            src="https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=1400"
            alt="African spices"
            style={{
              position: "absolute", inset: 0,
              width: "100%", height: "100%",
              objectFit: "cover", opacity: 0.25,
            }}
          />
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(90deg, rgba(0,20,10,0.95) 0%, rgba(0,40,20,0.7) 50%, transparent 100%)",
          }} />

          {/* Hero content */}
          <div style={{ position: "relative", zIndex: 10, padding: "80px 72px", maxWidth: 680 }}>
            <span style={{
              display: "inline-block",
              padding: "4px 14px",
              borderRadius: 9999,
              backgroundColor: "rgba(140,249,169,0.15)",
              color: "#8cf9a9",
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              marginBottom: 24,
              border: "1px solid rgba(140,249,169,0.3)",
            }}>
              New Collection 2025
            </span>

            <h1 style={{
              fontSize: "clamp(40px, 5vw, 68px)",
              fontWeight: 900,
              letterSpacing: "-0.04em",
              lineHeight: 1.05,
              color: "#ffffff",
              marginBottom: 24,
            }}>
              Taste the{" "}
              <span style={{
                fontStyle: "italic",
                background: "linear-gradient(135deg, #70dc8f, #8cf9a9)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>
                Heart
              </span>
              {" "}of Africa.
            </h1>

            <p style={{
              fontSize: 17,
              color: "rgba(255,255,255,0.7)",
              lineHeight: 1.7,
              marginBottom: 40,
              maxWidth: 460,
            }}>
              Shop our curated selection of authentic products imported straight from the motherland. Delivered to your door.
            </p>

            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <button
                onClick={() => document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" })}
                style={{
                  padding: "14px 32px",
                  borderRadius: 9999,
                  background: "linear-gradient(135deg, #006b35, #008744)",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 14,
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 4px 20px rgba(0,107,53,0.4)",
                  transition: "transform 0.2s, opacity 0.2s",
                  fontFamily: "Inter, sans-serif",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >
                Shop Now
              </button>
              <Link href="/contact" style={{
                padding: "14px 32px",
                borderRadius: 9999,
                backgroundColor: "rgba(255,255,255,0.1)",
                color: "#fff",
                fontWeight: 600,
                fontSize: 14,
                textDecoration: "none",
                border: "1px solid rgba(255,255,255,0.2)",
                transition: "background 0.2s",
                backdropFilter: "blur(4px)",
              }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.18)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)")}
              >
                Contact Us
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div style={{
            position: "absolute",
            bottom: 32,
            right: 48,
            display: "flex",
            gap: 40,
            zIndex: 10,
          }}>
            {[
              { num: "18+", label: "Products" },
              { num: "9", label: "Categories" },
              { num: "100%", label: "Authentic" },
            ].map((s) => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: "#fff", letterSpacing: "-0.04em" }}>{s.num}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ───────────────────────────────────── */}
      <section style={{ padding: "64px 40px", maxWidth: 1440, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 40 }}>
          <div>
            <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em", color: "#1a1c1c" }}>
              Curated Categories
            </h2>
            <p style={{ fontSize: 14, color: "#6b7280", marginTop: 4 }}>
              Explore our hand-selected world of African delicacies.
            </p>
          </div>
          <button
            onClick={() => setSelectedCategory("")}
            style={{
              fontSize: 13, fontWeight: 600, color: "#006b35",
              background: "none", border: "none", cursor: "pointer",
              fontFamily: "Inter, sans-serif",
            }}
          >
            View all →
          </button>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
          gap: 24,
        }}>
          {/* All category */}
          <button
            onClick={() => setSelectedCategory("")}
            style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              gap: 12, background: "none", border: "none", cursor: "pointer",
              fontFamily: "Inter, sans-serif",
            }}
          >
            <div style={{
              width: 88, height: 88, borderRadius: "50%",
              overflow: "hidden", backgroundColor: "#e8f5ee",
              display: "flex", alignItems: "center", justifyContent: "center",
              border: selectedCategory === "" ? "2px solid #006b35" : "2px solid transparent",
              transition: "transform 0.2s, border 0.2s",
              boxShadow: "0 2px 12px rgba(0,33,12,0.08)",
            }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.06)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <span style={{ fontSize: 28 }}>🛍️</span>
            </div>
            <span style={{
              fontSize: 12, fontWeight: 700, color: selectedCategory === "" ? "#006b35" : "#1a1c1c",
              transition: "color 0.2s",
            }}>All</span>
          </button>

          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => setSelectedCategory(cat.slug === selectedCategory ? "" : cat.slug)}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                gap: 12, background: "none", border: "none", cursor: "pointer",
                fontFamily: "Inter, sans-serif",
              }}
            >
              <div style={{
                width: 88, height: 88, borderRadius: "50%", overflow: "hidden",
                border: selectedCategory === cat.slug ? "2px solid #006b35" : "2px solid transparent",
                transition: "transform 0.2s, border 0.2s",
                boxShadow: "0 2px 12px rgba(0,33,12,0.08)",
              }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.06)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >
                <img
                  src={cat.image_url}
                  alt={cat.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <span style={{
                fontSize: 12, fontWeight: 700,
                color: selectedCategory === cat.slug ? "#006b35" : "#1a1c1c",
                transition: "color 0.2s", textAlign: "center",
              }}>
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* ── SHOP GRID ─────────────────────────────────────── */}
      <section id="shop" style={{
        padding: "0 40px 80px",
        maxWidth: 1440, margin: "0 auto",
      }}>
        {/* Shop header + filters */}
        <div style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "flex-start", marginBottom: 32, flexWrap: "wrap", gap: 16,
        }}>
          <div>
            <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em", color: "#1a1c1c" }}>
              {selectedCategory
                ? categories.find((c) => c.slug === selectedCategory)?.name ?? "Products"
                : "All Products"}
            </h2>
            <p style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>
              {loading ? "Loading..." : `${totalProducts} product${totalProducts !== 1 ? "s" : ""} found`}
            </p>
          </div>

          {/* Filters row */}
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            {/* Search */}
            <div style={{
              display: "flex", alignItems: "center",
              backgroundColor: "#fff", borderRadius: 9999,
              padding: "8px 16px", gap: 8,
              border: "1px solid #e8e8e8",
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  border: "none", outline: "none", fontSize: 13,
                  color: "#1a1c1c", backgroundColor: "transparent",
                  fontFamily: "Inter, sans-serif", width: 180,
                }}
              />
            </div>

            {/* Max price */}
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              backgroundColor: "#fff", borderRadius: 9999,
              padding: "8px 16px", border: "1px solid #e8e8e8",
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            }}>
              <span style={{ fontSize: 12, color: "#6b7280", whiteSpace: "nowrap" }}>
                Max ${maxPrice}
              </span>
              <input
                type="range"
                min={0} max={500} step={10}
                value={maxPrice}
                onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                style={{ width: 80, accentColor: "#006b35" }}
              />
            </div>

            {/* Clear filters */}
            {(search || selectedCategory || maxPrice < 500) && (
              <button
                onClick={() => { setSearch(""); setSelectedCategory(""); setMaxPrice(500) }}
                style={{
                  padding: "8px 16px", borderRadius: 9999,
                  border: "1px solid #e8e8e8", backgroundColor: "#fff",
                  fontSize: 12, fontWeight: 600, color: "#ba1a1a",
                  cursor: "pointer", fontFamily: "Inter, sans-serif",
                }}
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Product grid */}
        {loading ? (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 24,
          }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{
                height: 340, borderRadius: 16,
                backgroundColor: "#e8e8e8",
                animation: "pulse 1.5s infinite",
              }} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "80px 0",
            color: "#6b7280",
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <p style={{ fontSize: 18, fontWeight: 600, color: "#1a1c1c" }}>No products found</p>
            <p style={{ fontSize: 14, marginTop: 8 }}>Try adjusting your search or filters</p>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 24,
          }}>
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* ── BANNER ───────────────────────────────────────── */}
      <section style={{
        margin: "0 40px 80px",
        maxWidth: 1360,
        marginLeft: "auto",
        marginRight: "auto",
      }}>
        <div style={{
          borderRadius: 20,
          background: "linear-gradient(135deg, #006b35 0%, #008744 100%)",
          padding: "60px 72px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 32,
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", right: -40, top: -40,
            width: 300, height: 300, borderRadius: "50%",
            backgroundColor: "rgba(255,255,255,0.05)",
          }} />
          <div style={{
            position: "absolute", right: 80, bottom: -60,
            width: 200, height: 200, borderRadius: "50%",
            backgroundColor: "rgba(255,255,255,0.05)",
          }} />
          <div style={{ zIndex: 1 }}>
            <h2 style={{
              fontSize: 36, fontWeight: 900,
              letterSpacing: "-0.04em", color: "#fff",
              marginBottom: 8,
            }}>
              Join the Flavor Revolution
            </h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.75)", maxWidth: 400 }}>
              Exclusive products, early access to new arrivals, and the stories behind the sourcing.
            </p>
          </div>
          <Link href="/register" style={{
            padding: "16px 40px",
            borderRadius: 9999,
            backgroundColor: "#fff",
            color: "#006b35",
            fontWeight: 800,
            fontSize: 15,
            textDecoration: "none",
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            whiteSpace: "nowrap",
            zIndex: 1,
            transition: "transform 0.2s",
          }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            Create Account →
          </Link>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────── */}
      <footer style={{
        backgroundColor: "#f0f2f0",
        borderTop: "1px solid #e0e4e0",
        padding: "60px 40px 32px",
        fontFamily: "Inter, sans-serif",
      }}>
        <div style={{
          maxWidth: 1440, margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "2fr 1fr 1fr 1fr",
          gap: 48, marginBottom: 48,
        }}>
          <div>
            <p style={{ fontSize: 18, fontWeight: 900, fontStyle: "italic", color: "#1a3d2b", marginBottom: 12, letterSpacing: "-0.04em" }}>
              Camer-Market
            </p>
            <p style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.7, textTransform: "uppercase", letterSpacing: "0.08em", maxWidth: 220 }}>
              Curating authentic African flavors for the modern palate.
            </p>
          </div>
          {[
            { title: "Shop", links: ["All Products", "New Arrivals", "Best Sellers"] },
            { title: "Company", links: ["Sustainability", "Privacy", "Terms of Service"] },
            { title: "Support", links: ["Help Center", "Shipping Policy", "Contact Us"] },
          ].map((col) => (
            <div key={col.title}>
              <h5 style={{
                fontSize: 11, fontWeight: 800,
                textTransform: "uppercase", letterSpacing: "0.12em",
                color: "#1a3d2b", marginBottom: 20,
              }}>
                {col.title}
              </h5>
              <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" style={{
                      fontSize: 12, textTransform: "uppercase",
                      letterSpacing: "0.08em", color: "#6b7280",
                      textDecoration: "underline",
                      textDecorationColor: "rgba(0,107,53,0.2)",
                      textUnderlineOffset: 4,
                      transition: "color 0.2s",
                    }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#006b35")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "#6b7280")}
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{
          maxWidth: 1440, margin: "0 auto",
          borderTop: "1px solid #e0e4e0", paddingTop: 24,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "#9ca3af" }}>
            © 2025 Camer-Market. Authentic Flavors of Africa.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Inter, sans-serif",
        color: "#6b7280",
        fontSize: 14,
      }}>
        Loading...
      </div>
    }>
      <HomePageInner />
    </Suspense>
  )
}