// GET /api/wap/products: active catalog with availability (exact stock stays private).
import { catalogProducts } from '../../wap-server/catalog.js'
import { hasSupabase, sendError, supabase } from '../../wap-server/lib.js'

function availability(stock) {
  if (stock <= 0) return 'sold_out'
  if (stock <= 5) return 'low'
  return 'in_stock'
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed.' })
  try {
    if (!hasSupabase()) {
      res.setHeader('Cache-Control', 'no-store')
      return res.status(200).json({
        products: catalogProducts().map(({ stock_on_hand, ...product }) => ({
          ...product,
          availability: availability(stock_on_hand),
        })),
      })
    }

    const { data, error } = await supabase()
      .from('wap_products')
      .select('sku, name, category, description, unit, price_cents, stock_on_hand, sort_order')
      .eq('active', true)
      .order('sort_order', { ascending: true })
    if (error) throw error
    res.setHeader('Cache-Control', 'no-store')
    return res.status(200).json({
      products: data.map(({ stock_on_hand, ...p }) => ({ ...p, availability: availability(stock_on_hand) })),
    })
  } catch (err) {
    return sendError(res, err)
  }
}
