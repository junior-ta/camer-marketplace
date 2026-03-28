"use client"

import Link from "next/link"
import StockBadge from "./StockBadge"

interface Product {
  id: string
  name: string
  slug: string
  price: number
  stock_qty: number
  images: string[]
  categories: { name: string; slug: string } | null
}

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product.id}`} style={{ textDecoration: "none", color: "inherit" }}>
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "0 2px 8px rgba(0,33,12,0.06)",
          transition: "transform 0.25s, box-shadow 0.25s",
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-4px)"
          e.currentTarget.style.boxShadow = "0 16px 40px rgba(0,33,12,0.12)"
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)"
          e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,33,12,0.06)"
        }}
      >
        {/* Image */}
        <div style={{
          position: "relative",
          aspectRatio: "4/3",
          overflow: "hidden",
          backgroundColor: "#f3f3f4",
        }}>
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              style={{
                width: "100%", height: "100%",
                objectFit: "cover",
                transition: "transform 0.5s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.06)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            />
          ) : (
            <div style={{
              width: "100%", height: "100%",
              display: "flex", alignItems: "center",
              justifyContent: "center", color: "#9ca3af", fontSize: 13,
            }}>
              No image
            </div>
          )}

          {/* Category pill */}
          {product.categories && (
            <span style={{
              position: "absolute", top: 12, left: 12,
              padding: "3px 10px", borderRadius: 9999,
              fontSize: 10, fontWeight: 700,
              textTransform: "uppercase", letterSpacing: "0.06em",
              backgroundColor: "rgba(255,255,255,0.92)",
              color: "#006b35", backdropFilter: "blur(4px)",
            }}>
              {product.categories.name}
            </span>
          )}

          {/* Sold out overlay */}
          {product.stock_qty === 0 && (
            <div style={{
              position: "absolute", inset: 0,
              backgroundColor: "rgba(0,0,0,0.35)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{
                backgroundColor: "#ba1a1a", color: "#fff",
                padding: "6px 16px", borderRadius: 9999,
                fontSize: 11, fontWeight: 800,
                textTransform: "uppercase", letterSpacing: "0.08em",
              }}>
                Sold Out
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ padding: "16px 20px 20px", display: "flex", flexDirection: "column", gap: 8, flexGrow: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
            <h3 style={{
              fontSize: 14, fontWeight: 700,
              color: "#1a1c1c", lineHeight: 1.3,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}>
              {product.name}
            </h3>
            <span style={{
              fontSize: 16, fontWeight: 900,
              color: "#006b35", whiteSpace: "nowrap",
              letterSpacing: "-0.02em",
            }}>
              ${product.price.toFixed(2)}
            </span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
            <StockBadge qty={product.stock_qty} />
            <span style={{
              fontSize: 11, color: "#9ca3af",
              textTransform: "uppercase", letterSpacing: "0.06em",
            }}>
              View →
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}