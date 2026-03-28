"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import StockBadge from "@/components/StockBadge"
import { ShoppingCart, Truck, Shield, ChevronDown, ChevronUp } from "lucide-react"

interface ShippingOption { name: string; price: number; days: string }
interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  stock_qty: number
  images: string[]
  shipping_options: ShippingOption[]
  categories: { name: string; slug: string } | null
}

export default function ProductDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [addingToCart, setAddingToCart] = useState(false)
  const [descOpen, setDescOpen] = useState(true)
  const [shippingOpen, setShippingOpen] = useState(false)

  useEffect(() => {
    if (!id) return
    fetch(`/api/products/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) router.push("/")
        else setProduct(data)
      })
      .finally(() => setLoading(false))
  }, [id, router])

  async function handleAddToCart() {
    if (!session) {
      toast.error("Please sign in to add items to your cart")
      router.push("/login")
      return
    }
    if (!product || product.stock_qty === 0) return

    setAddingToCart(true)
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: product.id, quantity }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? "Failed to add to cart")
        return
      }
      toast.success(`${product.name} added to cart!`)
    } catch {
      toast.error("Something went wrong. Try again.")
    } finally {
      setAddingToCart(false)
    }
  }

  if (loading) {
    return (
      <div style={{
        minHeight: "80vh", display: "flex",
        alignItems: "center", justifyContent: "center",
        fontFamily: "Inter, sans-serif", color: "#6b7280",
      }}>
        Loading...
      </div>
    )
  }

  if (!product) return null

  return (
    <div style={{ backgroundColor: "#f9f9f9", minHeight: "100vh", fontFamily: "Inter, sans-serif" }}>
      <main style={{ maxWidth: 1440, margin: "0 auto", padding: "40px 40px 80px" }}>

        {/* Breadcrumb */}
        <nav style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 48, fontSize: 13, color: "#6b7280" }}>
          <Link href="/" style={{ color: "#6b7280", textDecoration: "none" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#006b35")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#6b7280")}
          >Shop</Link>
          <span>›</span>
          {product.categories && (
            <>
              <Link href={`/?category=${product.categories.slug}`}
                style={{ color: "#6b7280", textDecoration: "none" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#006b35")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#6b7280")}
              >
                {product.categories.name}
              </Link>
              <span>›</span>
            </>
          )}
          <span style={{ color: "#1a1c1c", fontWeight: 600 }}>{product.name}</span>
        </nav>

        {/* Main grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 80, alignItems: "start",
        }}>

          {/* ── LEFT: Image Gallery ── */}
          <div style={{ display: "grid", gridTemplateColumns: "80px 1fr", gap: 16 }}>

            {/* Thumbnails */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  style={{
                    aspectRatio: "1",
                    borderRadius: 10,
                    overflow: "hidden",
                    cursor: "pointer",
                    border: selectedImage === i ? "2px solid #006b35" : "2px solid transparent",
                    padding: 0,
                    transition: "border 0.2s",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  }}
                >
                  <img
                    src={img}
                    alt={`${product.name} ${i + 1}`}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </button>
              ))}
            </div>

            {/* Main image */}
            <div style={{
              aspectRatio: "4/5",
              borderRadius: 20,
              overflow: "hidden",
              boxShadow: "0 20px 40px rgba(0,33,12,0.08)",
              backgroundColor: "#f3f3f4",
              position: "relative",
            }}>
              <img
                src={product.images[selectedImage] ?? product.images[0]}
                alt={product.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              {product.stock_qty === 0 && (
                <div style={{
                  position: "absolute", inset: 0,
                  backgroundColor: "rgba(0,0,0,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <span style={{
                    backgroundColor: "#ba1a1a", color: "#fff",
                    padding: "8px 24px", borderRadius: 9999,
                    fontWeight: 800, fontSize: 13,
                    textTransform: "uppercase", letterSpacing: "0.1em",
                  }}>
                    Sold Out
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT: Product Info ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>

            {/* Header */}
            <div>
              {product.categories && (
                <Link href={`/?category=${product.categories.slug}`} style={{
                  fontSize: 11, fontWeight: 700,
                  textTransform: "uppercase", letterSpacing: "0.12em",
                  color: "#006b35", textDecoration: "none", marginBottom: 12,
                  display: "inline-block",
                }}>
                  {product.categories.name}
                </Link>
              )}
              <h1 style={{
                fontSize: "clamp(32px, 4vw, 52px)",
                fontWeight: 900, letterSpacing: "-0.04em",
                lineHeight: 1.05, color: "#1a3d2b", marginBottom: 16,
              }}>
                {product.name}
              </h1>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <span style={{
                  fontSize: 36, fontWeight: 900,
                  color: "#006b35", letterSpacing: "-0.03em",
                }}>
                  ${product.price.toFixed(2)}
                </span>
                <StockBadge qty={product.stock_qty} />
              </div>
            </div>

            {/* Quantity + Add to cart */}
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              {/* Quantity picker */}
              <div style={{
                display: "flex", alignItems: "center",
                backgroundColor: "#f3f3f4", borderRadius: 9999,
                padding: "4px",
                border: "1px solid #e8e8e8",
              }}>
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  style={{
                    width: 36, height: 36, borderRadius: "50%",
                    border: "none", backgroundColor: "transparent",
                    cursor: "pointer", fontSize: 18, fontWeight: 700,
                    color: "#1a1c1c", display: "flex",
                    alignItems: "center", justifyContent: "center",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e8e8e8")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  −
                </button>
                <span style={{
                  width: 40, textAlign: "center",
                  fontSize: 15, fontWeight: 700, color: "#1a1c1c",
                }}>
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock_qty, q + 1))}
                  disabled={quantity >= product.stock_qty}
                  style={{
                    width: 36, height: 36, borderRadius: "50%",
                    border: "none", backgroundColor: "transparent",
                    cursor: "pointer", fontSize: 18, fontWeight: 700,
                    color: "#1a1c1c", display: "flex",
                    alignItems: "center", justifyContent: "center",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e8e8e8")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  +
                </button>
              </div>

              {/* Add to cart */}
              <button
                onClick={handleAddToCart}
                disabled={product.stock_qty === 0 || addingToCart}
                style={{
                  flexGrow: 1,
                  padding: "16px 32px",
                  borderRadius: 9999,
                  border: "none",
                  background: product.stock_qty === 0
                    ? "#e8e8e8"
                    : "linear-gradient(135deg, #006b35, #008744)",
                  color: product.stock_qty === 0 ? "#9ca3af" : "#fff",
                  fontWeight: 800, fontSize: 15,
                  cursor: product.stock_qty === 0 ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center",
                  justifyContent: "center", gap: 10,
                  boxShadow: product.stock_qty === 0 ? "none" : "0 4px 20px rgba(0,107,53,0.35)",
                  transition: "transform 0.2s, opacity 0.2s",
                  opacity: addingToCart ? 0.7 : 1,
                  fontFamily: "Inter, sans-serif",
                }}
                onMouseEnter={(e) => {
                  if (product.stock_qty > 0) e.currentTarget.style.transform = "scale(1.02)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)"
                }}
              >
                <ShoppingCart size={18} />
                {addingToCart ? "Adding..." : product.stock_qty === 0 ? "Sold Out" : "Add to Cart"}
              </button>
            </div>

            {/* Shipping options */}
            {product.shipping_options && product.shipping_options.length > 0 && (
              <div style={{
                backgroundColor: "#fff",
                borderRadius: 16, padding: "20px 24px",
                border: "1px solid #e8e8e8",
                display: "flex", flexDirection: "column", gap: 14,
              }}>
                {product.shipping_options.map((opt, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: "50%",
                      backgroundColor: "#e8f5ee",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      <Truck size={16} color="#006b35" />
                    </div>
                    <div style={{ flexGrow: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: "#1a1c1c" }}>{opt.name}</p>
                      <p style={{ fontSize: 12, color: "#6b7280" }}>Arrives in {opt.days} business days</p>
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 800, color: "#006b35" }}>
                      {opt.price === 0 ? "Free" : `$${opt.price.toFixed(2)}`}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Guarantee */}
            <div style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "16px 20px", borderRadius: 12,
              backgroundColor: "#fff", border: "1px solid #e8e8e8",
            }}>
              <Shield size={20} color="#006b35" />
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#1a1c1c" }}>
                  Authenticity Guaranteed
                </p>
                <p style={{ fontSize: 12, color: "#6b7280" }}>
                  All products are directly imported and quality checked.
                </p>
              </div>
            </div>

            {/* Description accordion */}
            <div style={{ borderTop: "1px solid #e8e8e8", paddingTop: 24 }}>
              <button
                onClick={() => setDescOpen((p) => !p)}
                style={{
                  width: "100%", display: "flex",
                  justifyContent: "space-between", alignItems: "center",
                  background: "none", border: "none", cursor: "pointer",
                  padding: 0, fontFamily: "Inter, sans-serif",
                  marginBottom: descOpen ? 16 : 0,
                }}
              >
                <span style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", color: "#1a1c1c" }}>
                  Description
                </span>
                {descOpen ? <ChevronUp size={16} color="#6b7280" /> : <ChevronDown size={16} color="#6b7280" />}
              </button>
              {descOpen && (
                <p style={{ fontSize: 14, lineHeight: 1.8, color: "#4b5563" }}>
                  {product.description ?? "No description available."}
                </p>
              )}
            </div>

            {/* Shipping accordion */}
            <div style={{ borderTop: "1px solid #e8e8e8", paddingTop: 24 }}>
              <button
                onClick={() => setShippingOpen((p) => !p)}
                style={{
                  width: "100%", display: "flex",
                  justifyContent: "space-between", alignItems: "center",
                  background: "none", border: "none", cursor: "pointer",
                  padding: 0, fontFamily: "Inter, sans-serif",
                  marginBottom: shippingOpen ? 16 : 0,
                }}
              >
                <span style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", color: "#1a1c1c" }}>
                  Shipping & Returns
                </span>
                {shippingOpen ? <ChevronUp size={16} color="#6b7280" /> : <ChevronDown size={16} color="#6b7280" />}
              </button>
              {shippingOpen && (
                <p style={{ fontSize: 14, lineHeight: 1.8, color: "#4b5563" }}>
                  We ship all orders within 1-2 business days. Standard shipping takes 5-7 days. Express shipping takes 2-3 days. Returns accepted within 30 days of delivery for unopened items.
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}