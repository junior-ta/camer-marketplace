"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Trash2, ShoppingBag, ArrowRight, Minus, Plus } from "lucide-react"
import { useCart } from "@/components/CartContext"
import { CartItemSkeleton, Skeleton } from "@/components/Skeleton"

export default function CartPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { items, itemCount, subtotal, loading, updateItem, removeItem } = useCart()


  async function handleQuantityChange(cartItemId: string, newQty: number, stockQty: number) {
    if (newQty < 1) return
    if (newQty > stockQty) {
      toast.error(`Only ${stockQty} in stock`)
      return
    }
    try {
      await updateItem(cartItemId, newQty)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update")
    }
  }


  async function handleRemove(cartItemId: string, productName: string) {
    try {
      await removeItem(cartItemId)
      toast.success(`${productName} removed from cart`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove item")
    }
  }

  // Redirect to login if not authenticated
  if (!session) {
    return (
      <div style={{
        minHeight: "80vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Inter, sans-serif",
        gap: 16,
      }}>
        <ShoppingBag size={48} color="#e8e8e8" />
        <p style={{ fontSize: 18, fontWeight: 700, color: "#1a1c1c" }}>
          Sign in to view your cart
        </p>
        <Link href="/login" style={{
          padding: "12px 32px",
          borderRadius: 9999,
          background: "linear-gradient(135deg, #006b35, #008744)",
          color: "#fff",
          fontWeight: 700,
          fontSize: 14,
          textDecoration: "none",
        }}>
          Sign In
        </Link>
      </div>
    )
  }

  // Loading skeleton
  if (loading) {
    return (
      <div style={{
        backgroundColor: "#f9f9f9", minHeight: "100vh",
        fontFamily: "Inter, sans-serif", padding: "40px 40px 80px",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ marginBottom: 40 }}>
            <Skeleton width={160} height={36} borderRadius={8} />
            <div style={{ marginTop: 8 }}>
              <Skeleton width={100} height={14} />
            </div>
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 360px",
            gap: 32,
          }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[1, 2, 3].map((i) => <CartItemSkeleton key={i} />)}
            </div>
            <Skeleton height={400} borderRadius={20} />
          </div>
        </div>
      </div>
    )
  }

  // Empty cart state
  if (items.length === 0) {
    return (
      <div style={{
        minHeight: "80vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Inter, sans-serif",
        gap: 20,
        padding: "0 24px",
      }}>
        <div style={{
          width: 96, height: 96, borderRadius: "50%",
          backgroundColor: "#f3f3f4",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <ShoppingBag size={40} color="#9ca3af" />
        </div>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 22, fontWeight: 800, color: "#1a1c1c", marginBottom: 8 }}>
            Your cart is empty
          </p>
          <p style={{ fontSize: 14, color: "#6b7280" }}>
            Looks like you haven&apos;t added anything yet.
          </p>
        </div>
        <Link href="/" style={{
          padding: "14px 32px",
          borderRadius: 9999,
          background: "linear-gradient(135deg, #006b35, #008744)",
          color: "#fff",
          fontWeight: 700,
          fontSize: 14,
          textDecoration: "none",
          boxShadow: "0 4px 14px rgba(0,107,53,0.3)",
        }}>
          Browse Products
        </Link>
      </div>
    )
  }

  return (
    <div style={{
      backgroundColor: "#f9f9f9",
      minHeight: "100vh",
      fontFamily: "Inter, sans-serif",
      padding: "40px 40px 80px",
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <h1 style={{
            fontSize: 36, fontWeight: 900,
            letterSpacing: "-0.04em", color: "#1a3d2b",
          }}>
            Your Cart
          </h1>
          <p style={{ fontSize: 14, color: "#6b7280", marginTop: 4 }}>
            {itemCount} item{itemCount !== 1 ? "s" : ""} in your cart
          </p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 360px",
          gap: 32,
          alignItems: "start",
        }}>

          {/* ── Cart Items ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {items.map((item) => (
              <div
                key={item.id}
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 16,
                  padding: "20px 24px",
                  display: "flex",
                  gap: 20,
                  alignItems: "center",
                  boxShadow: "0 2px 8px rgba(0,33,12,0.05)",
                  border: "1px solid #f0f0f0",
                }}
              >
                {/* Product image */}
                <Link href={`/products/${item.products.id}`}>
                  <div style={{
                    width: 88, height: 88,
                    borderRadius: 12, overflow: "hidden",
                    backgroundColor: "#f3f3f4", flexShrink: 0,
                  }}>
                    {item.products.images?.[0] ? (
                      <img
                        src={item.products.images[0]}
                        alt={item.products.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <div style={{
                        width: "100%", height: "100%",
                        display: "flex", alignItems: "center",
                        justifyContent: "center", color: "#9ca3af", fontSize: 11,
                      }}>
                        No image
                      </div>
                    )}
                  </div>
                </Link>

                {/* Product info */}
                <div style={{ flexGrow: 1, minWidth: 0 }}>
                  <Link href={`/products/${item.products.id}`} style={{ textDecoration: "none" }}>
                    <h3 style={{
                      fontSize: 15, fontWeight: 700,
                      color: "#1a1c1c", marginBottom: 4,
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    }}>
                      {item.products.name}
                    </h3>
                  </Link>
                  <p style={{ fontSize: 16, fontWeight: 900, color: "#006b35" }}>
                    ${item.products.price.toFixed(2)}
                  </p>
                  {/* Low stock warning */}
                  {item.products.stock_qty <= 10 && item.products.stock_qty > 0 && (
                    <p style={{ fontSize: 11, color: "#92600a", marginTop: 4 }}>
                      Only {item.products.stock_qty} left in stock
                    </p>
                  )}
                </div>

                {/* Quantity controls */}
                <div style={{
                  display: "flex", alignItems: "center",
                  backgroundColor: "#f3f3f4", borderRadius: 9999,
                  padding: "4px", gap: 0, flexShrink: 0,
                }}>
                  <button
                    onClick={() => handleQuantityChange(item.id, item.quantity - 1, item.products.stock_qty)}
                    disabled={item.quantity <= 1}
                    style={{
                      width: 32, height: 32, borderRadius: "50%",
                      border: "none", backgroundColor: "transparent",
                      cursor: item.quantity <= 1 ? "not-allowed" : "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: item.quantity <= 1 ? "#d1d5db" : "#1a1c1c",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      if (item.quantity > 1) e.currentTarget.style.backgroundColor = "#e8e8e8"
                    }}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <Minus size={14} />
                  </button>
                  <span style={{
                    width: 36, textAlign: "center",
                    fontSize: 14, fontWeight: 700, color: "#1a1c1c",
                  }}>
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(item.id, item.quantity + 1, item.products.stock_qty)}
                    disabled={item.quantity >= item.products.stock_qty}
                    style={{
                      width: 32, height: 32, borderRadius: "50%",
                      border: "none", backgroundColor: "transparent",
                      cursor: item.quantity >= item.products.stock_qty ? "not-allowed" : "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: item.quantity >= item.products.stock_qty ? "#d1d5db" : "#1a1c1c",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      if (item.quantity < item.products.stock_qty) e.currentTarget.style.backgroundColor = "#e8e8e8"
                    }}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <Plus size={14} />
                  </button>
                </div>

                {/* Line total */}
                <div style={{
                  textAlign: "right", flexShrink: 0, minWidth: 80,
                }}>
                  <p style={{ fontSize: 16, fontWeight: 900, color: "#1a1c1c" }}>
                    ${(item.products.price * item.quantity).toFixed(2)}
                  </p>
                </div>

                {/* Remove button */}
                <button
                  onClick={() => handleRemove(item.id, item.products.name)}
                  style={{
                    width: 36, height: 36, borderRadius: "50%",
                    border: "none", backgroundColor: "transparent",
                    cursor: "pointer", flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#9ca3af", transition: "background 0.2s, color 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#fde8e8"
                    e.currentTarget.style.color = "#ba1a1a"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent"
                    e.currentTarget.style.color = "#9ca3af"
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}

            {/* Continue shopping link */}
            <Link href="/" style={{
              display: "inline-flex", alignItems: "center",
              gap: 6, fontSize: 13, fontWeight: 600,
              color: "#006b35", textDecoration: "none",
              marginTop: 8,
            }}>
              ← Continue Shopping
            </Link>
          </div>

          {/* ── Order Summary ── */}
          <div style={{
            backgroundColor: "#fff",
            borderRadius: 20,
            padding: "28px 28px",
            boxShadow: "0 2px 16px rgba(0,33,12,0.06)",
            border: "1px solid #f0f0f0",
            position: "sticky",
            top: 100,
          }}>
            <h2 style={{
              fontSize: 18, fontWeight: 800,
              color: "#1a1c1c", marginBottom: 24,
              letterSpacing: "-0.02em",
            }}>
              Order Summary
            </h2>

            {/* Line items summary */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
              {items.map((item) => (
                <div key={item.id} style={{
                  display: "flex", justifyContent: "space-between",
                  fontSize: 13, color: "#4b5563",
                }}>
                  <span style={{ maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {item.products.name} × {item.quantity}
                  </span>
                  <span style={{ fontWeight: 600, flexShrink: 0 }}>
                    ${(item.products.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: 20, marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: "#6b7280" }}>Subtotal</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>${subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, color: "#6b7280" }}>Shipping</span>
                <span style={{ fontSize: 13, color: "#006b35", fontWeight: 600 }}>
                  Calculated at checkout
                </span>
              </div>
            </div>

            {/* Total */}
            <div style={{
              display: "flex", justifyContent: "space-between",
              alignItems: "center",
              borderTop: "2px solid #1a1c1c", paddingTop: 20, marginBottom: 24,
            }}>
              <span style={{ fontSize: 16, fontWeight: 800, color: "#1a1c1c" }}>Total</span>
              <span style={{ fontSize: 22, fontWeight: 900, color: "#006b35", letterSpacing: "-0.03em" }}>
                ${subtotal.toFixed(2)}
              </span>
            </div>

            {/* Checkout button */}
            <button
              onClick={() => router.push("/checkout")}
              style={{
                width: "100%",
                padding: "16px",
                borderRadius: 9999,
                border: "none",
                background: "linear-gradient(135deg, #006b35, #008744)",
                color: "#fff",
                fontWeight: 800,
                fontSize: 15,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                boxShadow: "0 4px 20px rgba(0,107,53,0.3)",
                transition: "transform 0.2s, opacity 0.2s",
                fontFamily: "Inter, sans-serif",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              Proceed to Checkout
              <ArrowRight size={18} />
            </button>

            {/* Security note */}
            <p style={{
              fontSize: 11, color: "#9ca3af",
              textAlign: "center", marginTop: 16,
              lineHeight: 1.5,
            }}>
              🔒 Secure checkout powered by Stripe
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}