"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Package, Truck, CheckCircle, XCircle, Clock } from "lucide-react"

interface OrderProduct { id: string; name: string; images: string[] }
interface OrderItem { id: string; quantity: number; unit_price: number; products: OrderProduct }
interface Order {
  id: string
  status: string
  total_amount: number
  created_at: string
  user_id: string
  order_items: OrderItem[]
}

// Status config — colors, icons, labels
const STATUS_CONFIG: Record<string, {
  bg: string; color: string; label: string;
  icon: React.ComponentType<{ size: number; color: string }>
}> = {
  pending:   { bg: "#fff8e1", color: "#92600a", label: "Pending",   icon: Clock },
  paid:      { bg: "#e8f5ee", color: "#006b35", label: "Paid",      icon: CheckCircle },
  shipped:   { bg: "#e8f0fe", color: "#1a56db", label: "Shipped",   icon: Truck },
  cancelled: { bg: "#fde8e8", color: "#ba1a1a", label: "Cancelled", icon: XCircle },
}

// Available next statuses for each current status
const NEXT_STATUSES: Record<string, string[]> = {
  pending:   ["paid", "cancelled"],
  paid:      ["shipped", "cancelled"],
  shipped:   [],
  cancelled: [],
}

export default function AdminOrdersPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [isAdminUser, setIsAdminUser] = useState(false)
  const [authChecking, setAuthChecking] = useState(true)

  useEffect(() => {
    if (!session) {
      router.push("/login")
      return
    }

    // Check admin status by hitting a protected endpoint
    // If it returns 403, the user is not an admin
    fetch("/api/admin/orders")
      .then((res) => {
        if (res.status === 403) {
          // Not an admin — redirect to homepage silently
          router.push("/")
          return null
        }
        setIsAdminUser(true)
        return res.json()
      })
      .then((data) => {
        if (data) setOrders(data)
      })
      .catch(() => toast.error("Failed to load orders"))
      .finally(() => {
        setLoading(false)
        setAuthChecking(false)
      })
  }, [session, router])

  // Show nothing while checking auth — prevents flash of content
  if (authChecking) return null
  if (!isAdminUser) return null

  async function fetchAllOrders() {
    try {
      const res = await fetch("/api/admin/orders")
      if (!res.ok) throw new Error("Failed to fetch orders")
      const data = await res.json()
      setOrders(data)
    } catch (err) {
      toast.error("Failed to load orders")
    } finally {
      setLoading(false)
    }
  }

  async function handleStatusUpdate(orderId: string, newStatus: string) {
    setUpdating(orderId)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error ?? "Failed to update order")
        return
      }

      // Update local state so UI reflects change immediately
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, status: newStatus } : o
        )
      )

      toast.success(`Order marked as ${newStatus}`)
    } catch {
      toast.error("Something went wrong")
    } finally {
      setUpdating(null)
    }
  }

  if (loading) {
    return (
      <div style={{
        minHeight: "80vh", display: "flex",
        alignItems: "center", justifyContent: "center",
        fontFamily: "Inter, sans-serif", color: "#6b7280",
      }}>
        Loading orders...
      </div>
    )
  }

  return (
    <div style={{
      backgroundColor: "#f9f9f9", minHeight: "100vh",
      fontFamily: "Inter, sans-serif", padding: "40px 40px 80px",
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <div style={{
              padding: "4px 12px", borderRadius: 9999,
              backgroundColor: "#fde8e8",
              fontSize: 11, fontWeight: 700,
              color: "#ba1a1a", textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}>
              Admin Panel
            </div>
          </div>
          <h1 style={{
            fontSize: 32, fontWeight: 900,
            letterSpacing: "-0.04em", color: "#1a3d2b",
          }}>
            Order Management
          </h1>
          <p style={{ fontSize: 14, color: "#6b7280", marginTop: 4 }}>
            {orders.length} total order{orders.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Orders table */}
        {orders.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "80px 0",
            backgroundColor: "#fff", borderRadius: 20,
            border: "1px solid #f0f0f0",
          }}>
            <Package size={48} color="#e8e8e8" style={{ margin: "0 auto 16px" }} />
            <p style={{ fontSize: 18, fontWeight: 700, color: "#1a1c1c" }}>
              No orders yet
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {orders.map((order) => {
              const config = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending
              const StatusIcon = config.icon
              const nextStatuses = NEXT_STATUSES[order.status] ?? []

              return (
                <div key={order.id} style={{
                  backgroundColor: "#fff",
                  borderRadius: 16,
                  padding: "20px 24px",
                  border: "1px solid #f0f0f0",
                  boxShadow: "0 2px 8px rgba(0,33,12,0.04)",
                }}>
                  <div style={{
                    display: "flex", justifyContent: "space-between",
                    alignItems: "center", flexWrap: "wrap", gap: 16,
                  }}>

                    {/* Left: order info */}
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: "50%",
                        backgroundColor: config.bg, flexShrink: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <StatusIcon size={20} color={config.color} />
                      </div>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 700, color: "#1a1c1c" }}>
                          #{order.id.slice(0, 8).toUpperCase()}
                        </p>
                        <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>
                          {new Date(order.created_at).toLocaleDateString("en-US", {
                            year: "numeric", month: "short", day: "numeric",
                            hour: "2-digit", minute: "2-digit",
                          })}
                        </p>
                        <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 1 }}>
                          User: {order.user_id.slice(0, 8)}...
                        </p>
                      </div>
                    </div>

                    {/* Center: product thumbnails */}
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      {order.order_items.slice(0, 3).map((item) => (
                        <div key={item.id} style={{
                          width: 44, height: 44, borderRadius: 8,
                          overflow: "hidden", backgroundColor: "#f3f3f4",
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
                              justifyContent: "center", fontSize: 9, color: "#9ca3af",
                            }}>
                              No img
                            </div>
                          )}
                        </div>
                      ))}
                      <span style={{ fontSize: 12, color: "#6b7280" }}>
                        {order.order_items.reduce((s, i) => s + i.quantity, 0)} items
                      </span>
                    </div>

                    {/* Right: status + total + actions */}
                    <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                      {/* Current status badge */}
                      <span style={{
                        padding: "4px 12px", borderRadius: 9999,
                        fontSize: 11, fontWeight: 700,
                        textTransform: "uppercase", letterSpacing: "0.06em",
                        backgroundColor: config.bg, color: config.color,
                      }}>
                        {config.label}
                      </span>

                      {/* Total */}
                      <span style={{
                        fontSize: 16, fontWeight: 900,
                        color: "#006b35", letterSpacing: "-0.02em",
                        minWidth: 72, textAlign: "right",
                      }}>
                        ${order.total_amount.toFixed(2)}
                      </span>

                      {/* Status update buttons */}
                      {nextStatuses.length > 0 && (
                        <div style={{ display: "flex", gap: 8 }}>
                          {nextStatuses.map((nextStatus) => {
                            const nextConfig = STATUS_CONFIG[nextStatus]
                            const isShip = nextStatus === "shipped"
                            return (
                              <button
                                key={nextStatus}
                                onClick={() => handleStatusUpdate(order.id, nextStatus)}
                                disabled={updating === order.id}
                                style={{
                                  padding: "8px 16px",
                                  borderRadius: 9999,
                                  border: "none",
                                  backgroundColor: isShip ? "#006b35" : "#fde8e8",
                                  color: isShip ? "#fff" : "#ba1a1a",
                                  fontSize: 12, fontWeight: 700,
                                  cursor: updating === order.id ? "not-allowed" : "pointer",
                                  opacity: updating === order.id ? 0.6 : 1,
                                  transition: "opacity 0.2s, transform 0.1s",
                                  fontFamily: "Inter, sans-serif",
                                  display: "flex", alignItems: "center", gap: 6,
                                }}
                                onMouseEnter={(e) => {
                                  if (updating !== order.id) e.currentTarget.style.opacity = "0.85"
                                }}
                                onMouseLeave={(e) => {
                                  if (updating !== order.id) e.currentTarget.style.opacity = "1"
                                }}
                              >
                                {isShip && <Truck size={13} />}
                                {isShip ? "Mark Shipped" : "Cancel"}
                              </button>
                            )
                          })}
                        </div>
                      )}

                      {/* Final state label */}
                      {nextStatuses.length === 0 && (
                        <span style={{
                          fontSize: 11, color: "#9ca3af",
                          fontStyle: "italic",
                        }}>
                          No further actions
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}