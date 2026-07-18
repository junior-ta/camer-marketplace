"use client"

import { useEffect } from "react"
import Link from "next/link"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  // Log the error to the console in development
  useEffect(() => {
    console.error("Application error:", error)
  }, [error])

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
      {/* Big 500 */}
      <div style={{
        fontSize: 120,
        fontWeight: 900,
        letterSpacing: "-0.06em",
        color: "#e8e8e8",
        lineHeight: 1,
        marginBottom: 8,
        fontStyle: "italic",
      }}>
        500
      </div>

      <h1 style={{
        fontSize: 28,
        fontWeight: 800,
        letterSpacing: "-0.03em",
        color: "#1a3d2b",
        marginBottom: 12,
        textAlign: "center",
      }}>
        Something went wrong
      </h1>

      <p style={{
        fontSize: 15,
        color: "#6b7280",
        textAlign: "center",
        maxWidth: 380,
        lineHeight: 1.7,
        marginBottom: 40,
      }}>
        An unexpected error occurred. Our team has been notified.
        Please try again or contact us if the problem persists.
      </p>

      {/* Error digest for debugging */}
      {error.digest && (
        <p style={{
          fontSize: 11,
          color: "#9ca3af",
          fontFamily: "monospace",
          marginBottom: 32,
          backgroundColor: "#f3f3f4",
          padding: "6px 12px",
          borderRadius: 6,
        }}>
          Error ID: {error.digest}
        </p>
      )}

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
        {/* Try again resets the error boundary */}
        <button
          onClick={reset}
          style={{
            padding: "14px 32px",
            borderRadius: 9999,
            background: "linear-gradient(135deg, #006b35, #008744)",
            color: "#fff",
            fontWeight: 700,
            fontSize: 14,
            border: "none",
            cursor: "pointer",
            boxShadow: "0 4px 14px rgba(0,107,53,0.3)",
            fontFamily: "Inter, sans-serif",
          }}
        >
          Try Again
        </button>
        <Link href="/" style={{
          padding: "14px 32px",
          borderRadius: 9999,
          border: "1px solid #e8e8e8",
          backgroundColor: "#fff",
          color: "#1a1c1c",
          fontWeight: 700,
          fontSize: 14,
          textDecoration: "none",
        }}>
          Back to Shop
        </Link>
      </div>
    </div>
  )
}