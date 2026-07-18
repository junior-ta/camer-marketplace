"use client"

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body style={{
        margin: 0,
        fontFamily: "Inter, sans-serif",
        backgroundColor: "#f9f9f9",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
      }}>
        <div style={{ textAlign: "center", padding: "40px 24px" }}>
          <div style={{
            fontSize: 80, fontWeight: 900,
            color: "#e8e8e8", letterSpacing: "-0.06em",
            fontStyle: "italic", marginBottom: 16,
          }}>
            500
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#1a3d2b", marginBottom: 12 }}>
            Critical Error
          </h1>
          <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 32 }}>
            Something went seriously wrong. Please refresh the page.
          </p>
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
              fontFamily: "Inter, sans-serif",
            }}
          >
            Refresh Page
          </button>
        </div>
      </body>
    </html>
  )
}