"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Package, ChevronRight, ShoppingBag } from "lucide-react"
import { Skeleton, OrderCardSkeleton } from "@/components/Skeleton"

// ── Types ──────────────────────────────────────────────────────
interface OrderProduct {
  id: string
  name: string
  images: string[]
}

interface OrderItem {
  id: string
  quantity: number
  unit_price: number
  products: OrderProduct
}

interface Order {
  id: string
  status: string
  total_amount: number
  stripe_session_id: string
  created_at: string
  order_items: OrderItem[]
}


// Returns styled badge based on order status
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string; color: string; label: string }> = {
    paid:      { bg: "#e8f5ee", color: "#006b35", label: "Paid" },
    shipped:   { bg: "#e8f0fe", color: "#1a56db", label: "Shipped" },
    pending:   { bg: "#fff8e1", color: "#92600a", label: "Pending" },
    cancelled: { bg: "#fde8e8", color: "#ba1a1a", label: "Cancelled" },
  }

  const style = styles[status] ?? styles.pending

  return (
    <span style={{
      padding: "3px 12px",
      borderRadius: 9999,
      fontSize: 11,
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: "0.06em",
      backgroundColor: style.bg,
      color: style.color,
    }}>
      {style.label}
    </span>
  )
}


export default function OrdersPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!session) {
      router.push("/login")
      return
    }

    // Fetch the user's orders
    fetch("/api/orders")
      .then((r) => r.json())
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Failed to fetch orders:", err))
      .finally(() => setLoading(false))
  }, [session, router])

  // Loading state
  if (loading) {
    return (
      <div style={{
        backgroundColor: "#f9f9f9", minHeight: "100vh",
        fontFamily: "Inter, sans-serif", padding: "40px 40px 80px",
      }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ marginBottom: 40 }}>
            <Skeleton width={180} height={36} borderRadius={8} />
            <div style={{ marginTop: 8 }}>
              <Skeleton width={120} height={14} />
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[1, 2, 3].map((i) => <OrderCardSkeleton key={i} />)}
          </div>
        </div>
      </div>
    )
  }

  // Empty state — no orders yet
  if (orders.length === 0) {
    return (
      <div style={{
        minHeight: "80vh",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        fontFamily: "Inter, sans-serif", gap: 20, padding: "0 24px",
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
            No orders yet
          </p>
          <p style={{ fontSize: 14, color: "#6b7280" }}>
            Your purchase history will appear here.
          </p>
        </div>
        <Link href="/" style={{
          padding: "14px 32px", borderRadius: 9999,
          background: "linear-gradient(135deg, #006b35, #008744)",
          color: "#fff", fontWeight: 700, fontSize: 14,
          textDecoration: "none",
          boxShadow: "0 4px 14px rgba(0,107,53,0.3)",
        }}>
          Start Shopping
        </Link>
      </div>
    )
  }

  return (
    <div style={{
      backgroundColor: "#f9f9f9", minHeight: "100vh",
      fontFamily: "Inter, sans-serif", padding: "40px 40px 80px",
    }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <h1 style={{
            fontSize: 36, fontWeight: 900,
            letterSpacing: "-0.04em", color: "#1a3d2b",
          }}>
            My Orders
          </h1>
          <p style={{ fontSize: 14, color: "#6b7280", marginTop: 4 }}>
            {orders.length} order{orders.length !== 1 ? "s" : ""} placed
          </p>
        </div>

        {/* Orders list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              style={{ textDecoration: "none" }}
            >
              <div
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 16,
                  padding: "24px 28px",
                  border: "1px solid #f0f0f0",
                  boxShadow: "0 2px 8px rgba(0,33,12,0.05)",
                  transition: "box-shadow 0.2s, transform 0.2s",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,33,12,0.1)"
                  e.currentTarget.style.transform = "translateY(-2px)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,33,12,0.05)"
                  e.currentTarget.style.transform = "translateY(0)"
                }}
              >
                {/* Order header row */}
                <div style={{
                  display: "flex", justifyContent: "space-between",
                  alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {/* Order icon */}
                    <div style={{
                      width: 40, height: 40, borderRadius: "50%",
                      backgroundColor: "#e8f5ee",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      <Package size={18} color="#006b35" />
                    </div>
                    <div>
                      {/* Truncated order ID */}
                      <p style={{ fontSize: 13, fontWeight: 700, color: "#1a1c1c" }}>
                        Order #{order.id.slice(0, 8).toUpperCase()}
                      </p>
                      <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>
                        {new Date(order.created_at).toLocaleDateString("en-US", {
                          year: "numeric", month: "long", day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <StatusBadge status={order.status} />
                    <span style={{
                      fontSize: 18, fontWeight: 900,
                      color: "#006b35", letterSpacing: "-0.02em",
                    }}>
                      ${order.total_amount.toFixed(2)}
                    </span>
                    <ChevronRight size={18} color="#9ca3af" />
                  </div>
                </div>

                {/* Product image previews */}
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  {order.order_items.slice(0, 4).map((item) => (
                    <div key={item.id} style={{
                      width: 52, height: 52,
                      borderRadius: 10, overflow: "hidden",
                      backgroundColor: "#f3f3f4", flexShrink: 0,
                      border: "1px solid #f0f0f0",
                    }}>
                      {item.products?.images?.[0] ? (
                        <img
                          src={item.products.images[0]}
                          alt={item.products.name}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : (
                        <div style={{
                          width: "100%", height: "100%",
                          display: "flex", alignItems: "center",
                          justifyContent: "center", fontSize: 10, color: "#9ca3af",
                        }}>
                          No img
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Show +N if more than 4 items */}
                  {order.order_items.length > 4 && (
                    <div style={{
                      width: 52, height: 52, borderRadius: 10,
                      backgroundColor: "#f3f3f4",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, fontWeight: 700, color: "#6b7280",
                    }}>
                      +{order.order_items.length - 4}
                    </div>
                  )}

                  {/* Item count summary */}
                  <p style={{ fontSize: 13, color: "#6b7280", marginLeft: 4 }}>
                    {order.order_items.reduce((sum, i) => sum + i.quantity, 0)} item
                    {order.order_items.reduce((sum, i) => sum + i.quantity, 0) !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}