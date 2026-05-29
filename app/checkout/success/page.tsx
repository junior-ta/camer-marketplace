"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useCart } from "@/components/CartContext"
import { CheckCircle } from "lucide-react"

export default function SuccessPage() {
  const { clearCart } = useCart()

  // Clear the local cart state when landing on success page
  // (the webhook already cleared it in the DB)
  useEffect(() => {
    clearCart()
  }, [clearCart])

  return (
    <div style={{
      minHeight: "80vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "Inter, sans-serif",
      padding: "40px 24px",
      backgroundColor: "#f9f9f9",
    }}>
      {/* Success icon */}
      <div style={{
        width: 96, height: 96, borderRadius: "50%",
        backgroundColor: "#e8f5ee",
        display: "flex", alignItems: "center",
        justifyContent: "center", marginBottom: 24,
      }}>
        <CheckCircle size={48} color="#006b35" />
      </div>

      <h1 style={{
        fontSize: 36, fontWeight: 900,
        letterSpacing: "-0.04em", color: "#1a3d2b",
        marginBottom: 12, textAlign: "center",
      }}>
        Order Confirmed!
      </h1>

      <p style={{
        fontSize: 16, color: "#4b5563",
        textAlign: "center", maxWidth: 420,
        lineHeight: 1.7, marginBottom: 40,
      }}>
        Thank you for your purchase. Your order has been received and
        is being processed. You&apos;ll receive a confirmation shortly.
      </p>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
        <Link href="/orders" style={{
          padding: "14px 32px",
          borderRadius: 9999,
          background: "linear-gradient(135deg, #006b35, #008744)",
          color: "#fff",
          fontWeight: 700, fontSize: 14,
          textDecoration: "none",
          boxShadow: "0 4px 14px rgba(0,107,53,0.3)",
        }}>
          View My Orders
        </Link>
        <Link href="/" style={{
          padding: "14px 32px",
          borderRadius: 9999,
          border: "1px solid #e8e8e8",
          backgroundColor: "#fff",
          color: "#1a1c1c",
          fontWeight: 700, fontSize: 14,
          textDecoration: "none",
        }}>
          Continue Shopping
        </Link>
      </div>
    </div>
  )
}