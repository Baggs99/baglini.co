// Cart lives in localStorage as { [sku]: quantity }. Quantities are capped to match the server.
import { useEffect, useState } from 'react'

const KEY = 'wap-cart-v1'
export const MAX_QTY = 99

function read() {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? '{}')
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

export function useCart() {
  const [cart, setCart] = useState(read)

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(cart))
  }, [cart])

  const setQuantity = (sku, quantity) =>
    setCart((prev) => {
      const next = { ...prev }
      const q = Math.max(0, Math.min(MAX_QTY, Math.floor(quantity)))
      if (q === 0) delete next[sku]
      else next[sku] = q
      return next
    })

  const clear = () => setCart({})

  return { cart, setQuantity, clear }
}

export function cartLines(cart, products) {
  return Object.entries(cart)
    .map(([sku, quantity]) => {
      const product = products.find((p) => p.sku === sku)
      return product ? { ...product, quantity } : null
    })
    .filter(Boolean)
}

export function cartTotalCents(lines) {
  return lines.reduce((sum, line) => sum + line.price_cents * line.quantity, 0)
}

export function money(cents) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format((cents ?? 0) / 100)
}
