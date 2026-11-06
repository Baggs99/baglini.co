import { palmCatalogProducts } from '../src/wap/content.js'
import { HttpError } from './lib.js'

export function catalogProducts() {
  return palmCatalogProducts.map((product) => ({
    ...product,
    stock_on_hand: product.stock_on_hand ?? 99,
    active: product.active ?? true,
  }))
}

export function productBySku(sku) {
  return catalogProducts().find((product) => product.sku === sku) ?? null
}

export function priceLines(items) {
  return items.map((item) => {
    const product = productBySku(item.sku)
    if (!product || product.active === false) {
      throw new HttpError(400, `Unknown product: ${item.sku}`)
    }
    return {
      sku: product.sku,
      name: product.name,
      unit: product.unit,
      unit_price_cents: product.price_cents,
      quantity: item.quantity,
    }
  })
}
