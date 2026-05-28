"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react"
import { useSession } from "next-auth/react"

// ── Types ──────────────────────────────────────────────────────

export interface CartProduct {
  id: string
  name: string
  slug: string
  price: number
  stock_qty: number
  images: string[]
}

export interface CartItem {
  id: string           // cart_item UUID
  quantity: number
  products: CartProduct
}

interface CartContextValue {
  items: CartItem[]             // all cart items
  itemCount: number             // total number of items (sum of quantities)
  subtotal: number              // total price before shipping
  loading: boolean              // true while fetching
  addItem: (productId: string, quantity?: number) => Promise<void>
  updateItem: (cartItemId: string, quantity: number) => Promise<void>
  removeItem: (cartItemId: string) => Promise<void>
  clearCart: () => void
  refreshCart: () => Promise<void>
}

// ── Context ────────────────────────────────────────────────────

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession()
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)

  // Fetch cart from the API
  const refreshCart = useCallback(async () => {
    // Only fetch if logged in
    if (!session?.user) {
      setItems([])
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/cart")
      if (!res.ok) throw new Error("Failed to fetch cart")
      const data = await res.json()
      setItems(data)
    } catch (err) {
      console.error("refreshCart error:", err)
    } finally {
      setLoading(false)
    }
  }, [session?.user])

  // Refresh cart whenever session changes (login/logout)
  useEffect(() => {
    refreshCart()
  }, [refreshCart])

  // Add a product to the cart
  const addItem = useCallback(
    async (productId: string, quantity = 1) => {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId, quantity }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? "Failed to add to cart")
      }
      // Refresh cart state after adding
      await refreshCart()
    },
    [refreshCart]
  )

  // Update the quantity of a cart item
  const updateItem = useCallback(
    async (cartItemId: string, quantity: number) => {
      const res = await fetch(`/api/cart/${cartItemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? "Failed to update item")
      }
      // Optimistically update local state for instant UI feedback
      setItems((prev) =>
        prev.map((item) =>
          item.id === cartItemId ? { ...item, quantity } : item
        )
      )
    },
    []
  )

  // Remove an item from the cart
  const removeItem = useCallback(
    async (cartItemId: string) => {
      const res = await fetch(`/api/cart/${cartItemId}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? "Failed to remove item")
      }
      // Optimistically remove from local state
      setItems((prev) => prev.filter((item) => item.id !== cartItemId))
    },
    []
  )

  // Clear all items from local state (called after order completes)
  const clearCart = useCallback(() => setItems([]), [])

  // Derived values
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = items.reduce(
    (sum, item) => sum + item.products.price * item.quantity,
    0
  )

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        loading,
        addItem,
        updateItem,
        removeItem,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

// Custom hook — throws if used outside CartProvider
export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used inside CartProvider")
  return ctx
}