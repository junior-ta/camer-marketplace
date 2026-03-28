interface StockBadgeProps {
  qty: number
}

export default function StockBadge({ qty }: StockBadgeProps) {
  if (qty === 0) {
    return (
      <span style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "3px 10px",
        borderRadius: 9999,
        fontSize: 11,
        fontWeight: 700,
        backgroundColor: "#fde8e8",
        color: "#ba1a1a",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
      }}>
        Sold Out
      </span>
    )
  }

  if (qty <= 10) {
    return (
      <span style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "3px 10px",
        borderRadius: 9999,
        fontSize: 11,
        fontWeight: 700,
        backgroundColor: "#fff8e1",
        color: "#92600a",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
      }}>
        Only {qty} left
      </span>
    )
  }

  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      padding: "3px 10px",
      borderRadius: 9999,
      fontSize: 11,
      fontWeight: 700,
      backgroundColor: "#e8f5ee",
      color: "#006b35",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
    }}>
      In Stock
    </span>
  )
}