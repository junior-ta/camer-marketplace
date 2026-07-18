// ── Skeleton Loader Components ─────────────────────────────────
// Used across all async data-fetching pages to show a loading state that matches the shape of the content being loaded. 
// It reduces layout shift.

interface SkeletonProps {
  width?: string | number
  height?: string | number
  borderRadius?: number
  style?: React.CSSProperties
}

// Base skeleton block with shimmer animation
export function Skeleton({ width = "100%", height = 16, borderRadius = 8, style }: SkeletonProps) {
  return (
    <div style={{
      width,
      height,
      borderRadius,
      backgroundColor: "#e8e8e8",
      backgroundImage: "linear-gradient(90deg, #e8e8e8 25%, #f0f0f0 50%, #e8e8e8 75%)",
      backgroundSize: "200% 100%",
      animation: "shimmer 1.5s infinite",
      ...style,
    }} />
  )
}

// Skeleton for a product card
export function ProductCardSkeleton() {
  return (
    <div style={{
      backgroundColor: "#fff",
      borderRadius: 16,
      overflow: "hidden",
      boxShadow: "0 2px 8px rgba(0,33,12,0.06)",
    }}>
      {/* Image placeholder */}
      <Skeleton height={200} borderRadius={0} />
      <div style={{ padding: "16px 20px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
        <Skeleton height={16} width="75%" />
        <Skeleton height={14} width="40%" />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
          <Skeleton height={22} width={80} borderRadius={9999} />
          <Skeleton height={14} width={40} />
        </div>
      </div>
    </div>
  )
}

// Skeleton for the order list page
export function OrderCardSkeleton() {
  return (
    <div style={{
      backgroundColor: "#fff",
      borderRadius: 16,
      padding: "24px 28px",
      border: "1px solid #f0f0f0",
      boxShadow: "0 2px 8px rgba(0,33,12,0.05)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Skeleton width={40} height={40} borderRadius={9999} />
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <Skeleton width={140} height={14} />
            <Skeleton width={100} height={12} />
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Skeleton width={60} height={22} borderRadius={9999} />
          <Skeleton width={70} height={20} />
        </div>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} width={52} height={52} borderRadius={10} />
        ))}
      </div>
    </div>
  )
}

// Skeleton for the cart page
export function CartItemSkeleton() {
  return (
    <div style={{
      backgroundColor: "#fff",
      borderRadius: 16,
      padding: "20px 24px",
      display: "flex",
      gap: 20,
      alignItems: "center",
      border: "1px solid #f0f0f0",
    }}>
      <Skeleton width={88} height={88} borderRadius={12} />
      <div style={{ flexGrow: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        <Skeleton width="60%" height={15} />
        <Skeleton width="30%" height={18} />
      </div>
      <Skeleton width={120} height={40} borderRadius={9999} />
      <Skeleton width={60} height={20} />
    </div>
  )
}