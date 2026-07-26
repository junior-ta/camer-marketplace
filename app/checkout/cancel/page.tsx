"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { XCircle } from "lucide-react"
import { Suspense } from "react"

function CancelPageInner() {
  const searchParams = useSearchParams()

  useEffect(() => {
    // Release the stock reservation immediately when user cancels
    // Don't wait for Stripe's webhook — it may take up to 30 min
    const sessionId = searchParams.get("session_id")

    fetch("/api/checkout/cancel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId ?? null }),
    }).catch((err) => console.error("Failed to release reservation:", err))
  }, [searchParams])

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
      <div style={{
        width: 96, height: 96, borderRadius: "50%",
        backgroundColor: "#fde8e8",
        display: "flex", alignItems: "center",
        justifyContent: "center", marginBottom: 24,
      }}>
        <XCircle size={48} color="#ba1a1a" />
      </div>

      <h1 style={{
        fontSize: 36, fontWeight: 900,
        letterSpacing: "-0.04em", color: "#1a1c1c",
        marginBottom: 12, textAlign: "center",
      }}>
        Payment Cancelled
      </h1>

      <p style={{
        fontSize: 16, color: "#4b5563",
        textAlign: "center", maxWidth: 400,
        lineHeight: 1.7, marginBottom: 40,
      }}>
        No worries — your cart is still saved.
        You can complete your purchase whenever you&apos;re ready.
      </p>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
        <Link href="/cart" style={{
          padding: "14px 32px",
          borderRadius: 9999,
          background: "linear-gradient(135deg, #006b35, #008744)",
          color: "#fff",
          fontWeight: 700, fontSize: 14,
          textDecoration: "none",
          boxShadow: "0 4px 14px rgba(0,107,53,0.3)",
        }}>
          Return to Cart
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

export default function CancelPage() {
  return (
    <Suspense fallback={null}>
      <CancelPageInner />
    </Suspense>
  )
}