"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Package, ArrowLeft, Truck, CheckCircle, Clock, XCircle } from "lucide-react"

// ── Types ──────────────────────────────────────────────────────
interface OrderProduct {
  id: string
  name: string
  slug: string
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
  updated_at: string
  order_items: OrderItem[]
}

// ── Status timeline helper ─────────────────────────────────────
// Shows a visual progress indicator for the order status
function StatusTimeline({ status }: { status: string }) {
  const steps = [
    { key: "pending",   label: "Order Placed",  icon: Clock },
    { key: "paid",      label: "Payment Confirmed", icon: CheckCircle },
    { key: "shipped",   label: "Shipped",        icon: Truck },
  ]

  const statusOrder = ["pending", "paid", "shipped"]
  const currentIndex = statusOrder.indexOf(status)

  // Don't show timeline for cancelled orders
  if (status === "cancelled") {
    return (
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "16px 20px", borderRadius: 12,
        backgroundColor: "#fde8e8", marginBottom: 32,
      }}>
        <XCircle size={20} color="#ba1a1a" />
        <p style={{ fontSize: 14, fontWeight: 700, color: "#ba1a1a" }}>
          This order was cancelled
        </p>
      </div>
    )
  }

  return (
    <div style={{
      display: "flex", alignItems: "center",
      gap: 0, marginBottom: 40,
      backgroundColor: "#fff", borderRadius: 16,
      padding: "24px 28px",
      border: "1px solid #f0f0f0",
      boxShadow: "0 2px 8px rgba(0,33,12,0.05)",
    }}>
      {steps.map((step, i) => {
        const isCompleted = i <= currentIndex
        const Icon = step.icon
        return (
          <div key={step.key} style={{ display: "flex", alignItems: "center", flex: 1 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              {/* Step circle */}
              <div style={{
                width: 40, height: 40, borderRadius: "50%",
                backgroundColor: isCompleted ? "#006b35" : "#f3f3f4",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "background 0.3s",
              }}>
                <Icon size={18} color={isCompleted ? "#fff" : "#9ca3af"} />
              </div>
              <span style={{
                fontSize: 11, fontWeight: 600,
                color: isCompleted ? "#006b35" : "#9ca3af",
                textAlign: "center", whiteSpace: "nowrap",
              }}>
                {step.label}
              </span>
            </div>

            {/* Connector line between steps */}
            {i < steps.length - 1 && (
              <div style={{
                flex: 1, height: 2, margin: "0 8px", marginBottom: 24,
                backgroundColor: i < currentIndex ? "#006b35" : "#f3f3f4",
                transition: "background 0.3s",
              }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────
export default function OrderDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session) {
      router.push("/login")
      return
    }

    if (!id) return

    // Fetch the specific order
    fetch(`/api/orders/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) router.push("/orders")
        else setOrder(data)
      })
      .catch(() => router.push("/orders"))
      .finally(() => setLoading(false))
  }, [id, session, router])

  if (loading) {
    return (
      <div style={{
        minHeight: "80vh",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "Inter, sans-serif", color: "#6b7280", fontSize: 14,
      }}>
        Loading order...
      </div>
    )
  }

  if (!order) return null

  // Calculate subtotal from line items
  const subtotal = order.order_items.reduce(
    (sum, item) => sum + item.unit_price * item.quantity,
    0
  )

  return (
    <div style={{
      backgroundColor: "#f9f9f9", minHeight: "100vh",
      fontFamily: "Inter, sans-serif", padding: "40px 40px 80px",
    }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>

        {/* Back link */}
        <Link href="/orders" style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          fontSize: 13, fontWeight: 600, color: "#006b35",
          textDecoration: "none", marginBottom: 32,
        }}>
          <ArrowLeft size={16} />
          Back to Orders
        </Link>

        {/* Header */}
        <div style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "flex-start", marginBottom: 32, flexWrap: "wrap", gap: 16,
        }}>
          <div>
            <h1 style={{
              fontSize: 32, fontWeight: 900,
              letterSpacing: "-0.04em", color: "#1a3d2b", marginBottom: 6,
            }}>
              Order #{order.id.slice(0, 8).toUpperCase()}
            </h1>
            <p style={{ fontSize: 13, color: "#6b7280" }}>
              Placed on {new Date(order.created_at).toLocaleDateString("en-US", {
                weekday: "long", year: "numeric",
                month: "long", day: "numeric",
              })}
            </p>
          </div>
          <span style={{
            fontSize: 28, fontWeight: 900,
            color: "#006b35", letterSpacing: "-0.03em",
          }}>
            ${order.total_amount.toFixed(2)}
          </span>
        </div>

        {/* Status timeline */}
        <StatusTimeline status={order.status} />

        {/* Order items */}
        <div style={{
          backgroundColor: "#fff", borderRadius: 20,
          padding: "28px", border: "1px solid #f0f0f0",
          boxShadow: "0 2px 8px rgba(0,33,12,0.05)", marginBottom: 24,
        }}>
          <h2 style={{
            fontSize: 16, fontWeight: 800, color: "#1a1c1c",
            marginBottom: 24, letterSpacing: "-0.02em",
          }}>
            Items Ordered
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {order.order_items.map((item) => (
              <div key={item.id} style={{
                display: "flex", gap: 16, alignItems: "center",
                paddingBottom: 20, borderBottom: "1px solid #f9f9f9",
              }}>
                {/* Product image */}
                <Link href={`/products/${item.products?.id}`}>
                  <div style={{
                    width: 80, height: 80, borderRadius: 12,
                    overflow: "hidden", backgroundColor: "#f3f3f4",
                    flexShrink: 0, border: "1px solid #f0f0f0",
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
                        justifyContent: "center", fontSize: 11, color: "#9ca3af",
                      }}>
                        No image
                      </div>
                    )}
                  </div>
                </Link>

                {/* Product name + qty */}
                <div style={{ flexGrow: 1 }}>
                  <Link href={`/products/${item.products?.id}`} style={{ textDecoration: "none" }}>
                    <p style={{
                      fontSize: 14, fontWeight: 700,
                      color: "#1a1c1c", marginBottom: 4,
                    }}>
                      {item.products?.name ?? "Product"}
                    </p>
                  </Link>
                  <p style={{ fontSize: 13, color: "#6b7280" }}>
                    ${item.unit_price.toFixed(2)} × {item.quantity}
                  </p>
                </div>

                {/* Line total */}
                <p style={{
                  fontSize: 15, fontWeight: 900,
                  color: "#006b35", flexShrink: 0,
                }}>
                  ${(item.unit_price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          {/* Order totals */}
          <div style={{
            marginTop: 24, paddingTop: 20,
            borderTop: "1px solid #f0f0f0",
            display: "flex", flexDirection: "column", gap: 10,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13, color: "#6b7280" }}>Subtotal</span>
              <span style={{ fontSize: 13, fontWeight: 600 }}>${subtotal.toFixed(2)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13, color: "#6b7280" }}>Shipping & Tax</span>
              <span style={{ fontSize: 13, color: "#006b35", fontWeight: 600 }}>
                ${(order.total_amount - subtotal).toFixed(2)}
              </span>
            </div>
            <div style={{
              display: "flex", justifyContent: "space-between",
              paddingTop: 12, borderTop: "2px solid #1a1c1c", marginTop: 4,
            }}>
              <span style={{ fontSize: 15, fontWeight: 800, color: "#1a1c1c" }}>Total Paid</span>
              <span style={{ fontSize: 20, fontWeight: 900, color: "#006b35", letterSpacing: "-0.02em" }}>
                ${order.total_amount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Stripe reference */}
        <div style={{
          backgroundColor: "#fff", borderRadius: 16,
          padding: "20px 24px", border: "1px solid #f0f0f0",
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <Package size={18} color="#006b35" />
          <div>
            <p style={{ fontSize: 12, color: "#9ca3af", marginBottom: 2 }}>
              Stripe Payment Reference
            </p>
            <p style={{
              fontSize: 12, fontFamily: "monospace",
              color: "#4b5563", letterSpacing: "0.02em",
            }}>
              {order.stripe_session_id}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}