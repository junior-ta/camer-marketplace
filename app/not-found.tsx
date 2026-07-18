import Link from "next/link"

export default function NotFound() {
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
      {/* Big 404 */}
      <div style={{
        fontSize: 120,
        fontWeight: 900,
        letterSpacing: "-0.06em",
        color: "#e8e8e8",
        lineHeight: 1,
        marginBottom: 8,
        fontStyle: "italic",
      }}>
        404
      </div>

      <h1 style={{
        fontSize: 28,
        fontWeight: 800,
        letterSpacing: "-0.03em",
        color: "#1a3d2b",
        marginBottom: 12,
        textAlign: "center",
      }}>
        Page not found
      </h1>

      <p style={{
        fontSize: 15,
        color: "#6b7280",
        textAlign: "center",
        maxWidth: 380,
        lineHeight: 1.7,
        marginBottom: 40,
      }}>
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
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
          Back to Shop
        </Link>
        <Link href="/contact" style={{
          padding: "14px 32px",
          borderRadius: 9999,
          border: "1px solid #e8e8e8",
          backgroundColor: "#fff",
          color: "#1a1c1c",
          fontWeight: 700,
          fontSize: 14,
          textDecoration: "none",
        }}>
          Contact Us
        </Link>
      </div>
    </div>
  )
}