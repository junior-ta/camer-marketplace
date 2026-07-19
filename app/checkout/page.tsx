"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useCart } from "@/components/CartContext"
import { toast } from "sonner"
import { ArrowRight, ShieldCheck, Lock } from "lucide-react"
import Link from "next/link"

export default function CheckoutPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { items, subtotal, itemCount } = useCart()
  const [loading, setLoading] = useState(false)

  // Redirect to login if not authenticated
  if (!session) {
    router.push("/login")
    return null
  }

  // Redirect to cart if empty
  if (itemCount === 0) {
    router.push("/cart")
    return null
  }

  async function handleCheckout() {
    setLoading(true)
    try {
      // Call our checkout API to create a Stripe session
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error ?? "Failed to start checkout")
        return
      }

      // Redirect to Stripe hosted checkout page
      window.location.href = data.url
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      backgroundColor: "#f9f9f9",
      minHeight: "100vh",
      fontFamily: "Inter, sans-serif",
      padding: "40px 40px 80px",
    }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <h1 style={{
            fontSize: 36, fontWeight: 900,
            letterSpacing: "-0.04em", color: "#1a3d2b",
          }}>
            Checkout
          </h1>
          <p style={{ fontSize: 14, color: "#6b7280", marginTop: 4 }}>
            Review your order before paying
          </p>
        </div>

        <div className="checkout-grid" 
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 380px",
          gap: 32, alignItems: "start",
        }}>

          {/* ── Order Items ── */}
          <div style={{
            backgroundColor: "#fff",
            borderRadius: 20,
            padding: "28px",
            boxShadow: "0 2px 12px rgba(0,33,12,0.05)",
            border: "1px solid #f0f0f0",
          }}>
            <h2 style={{
              fontSize: 16, fontWeight: 800,
              color: "#1a1c1c", marginBottom: 24,
              letterSpacing: "-0.02em",
            }}>
              Order Items ({itemCount})
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {items.map((item) => (
                <div key={item.id} style={{
                  display: "flex", gap: 16,
                  alignItems: "center",
                  paddingBottom: 20,
                  borderBottom: "1px solid #f9f9f9",
                }}>
                  {/* Product image */}
                  <div style={{
                    width: 72, height: 72,
                    borderRadius: 12, overflow: "hidden",
                    backgroundColor: "#f3f3f4", flexShrink: 0,
                  }}>
                    {item.products.images?.[0] && (
                      <img
                        src={item.products.images[0]}
                        alt={item.products.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    )}
                  </div>

                  {/* Product info */}
                  <div style={{ flexGrow: 1 }}>
                    <p style={{
                      fontSize: 14, fontWeight: 700,
                      color: "#1a1c1c", marginBottom: 4,
                    }}>
                      {item.products.name}
                    </p>
                    <p style={{ fontSize: 13, color: "#6b7280" }}>
                      Qty: {item.quantity} × ${item.products.price.toFixed(2)}
                    </p>
                  </div>

                  {/* Line total */}
                  <p style={{
                    fontSize: 15, fontWeight: 900,
                    color: "#006b35", flexShrink: 0,
                  }}>
                    ${(item.products.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            {/* Back to cart */}
            <Link href="/cart" style={{
              display: "inline-flex", alignItems: "center",
              gap: 6, fontSize: 13, fontWeight: 600,
              color: "#006b35", textDecoration: "none", marginTop: 8,
            }}>
              ← Edit Cart
            </Link>
          </div>

          {/* ── Payment Summary ── */}
          <div style={{
            backgroundColor: "#fff",
            borderRadius: 20, padding: "28px",
            boxShadow: "0 2px 12px rgba(0,33,12,0.05)",
            border: "1px solid #f0f0f0",
            position: "sticky", top: 100,
          }}>
            <h2 style={{
              fontSize: 16, fontWeight: 800,
              color: "#1a1c1c", marginBottom: 24,
              letterSpacing: "-0.02em",
            }}>
              Payment Summary
            </h2>

            {/* Totals */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, color: "#6b7280" }}>Subtotal</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>${subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, color: "#6b7280" }}>Shipping</span>
                <span style={{ fontSize: 13, color: "#006b35", fontWeight: 600 }}>
                  Calculated by Stripe
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, color: "#6b7280" }}>Tax</span>
                <span style={{ fontSize: 13, color: "#006b35", fontWeight: 600 }}>
                  Calculated by Stripe
                </span>
              </div>
            </div>

            {/* Total */}
            <div style={{
              display: "flex", justifyContent: "space-between",
              alignItems: "center",
              borderTop: "2px solid #1a1c1c",
              paddingTop: 20, marginBottom: 28,
            }}>
              <span style={{ fontSize: 16, fontWeight: 800, color: "#1a1c1c" }}>
                Total
              </span>
              <span style={{
                fontSize: 24, fontWeight: 900,
                color: "#006b35", letterSpacing: "-0.03em",
              }}>
                ${subtotal.toFixed(2)}+
              </span>
            </div>

            {/* Pay button */}
            <button
              onClick={handleCheckout}
              disabled={loading}
              style={{
                width: "100%",
                padding: "16px",
                borderRadius: 9999,
                border: "none",
                background: loading
                  ? "#e8e8e8"
                  : "linear-gradient(135deg, #006b35, #008744)",
                color: loading ? "#9ca3af" : "#fff",
                fontWeight: 800, fontSize: 15,
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                boxShadow: loading ? "none" : "0 4px 20px rgba(0,107,53,0.3)",
                transition: "transform 0.2s",
                fontFamily: "Inter, sans-serif",
                opacity: loading ? 0.7 : 1,
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.transform = "scale(1.02)"
              }}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              {loading ? "Preparing checkout..." : "Pay with Stripe"}
              {!loading && <ArrowRight size={18} />}
            </button>

            {/* Security badges */}
            <div style={{
              marginTop: 20, display: "flex",
              flexDirection: "column", gap: 10,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 11, color: "#006b35" }}>
                  You will be redirected to this website after the payment is done.
                </span>
              </div>
              <p></p>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Lock size={14} color="#006b35" />
                <span style={{ fontSize: 11, color: "#6b7280" }}>
                  256-bit SSL encrypted payment
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <ShieldCheck size={14} color="#006b35" />
                <span style={{ fontSize: 11, color: "#6b7280" }}>
                  Powered by Stripe — we never store card details
                </span>
              </div>
            </div>

            {/* Test card hint for development */}
            <div style={{
              marginTop: 20, padding: "12px 16px",
              backgroundColor: "#f0f9f4", borderRadius: 10,
              border: "1px solid #c8e6d4",
            }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#006b35", marginBottom: 4 }}>
                🧪 Test Mode
              </p>
              <p style={{ fontSize: 11, color: "#3e4a3f", lineHeight: 1.5 }}>
                Use card: <strong>4242 4242 4242 4242</strong><br />
                Any future date · Any CVC · Any ZIP
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}