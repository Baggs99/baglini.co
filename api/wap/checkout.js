// POST /api/wap/checkout: price from the server catalog, then open Stripe Checkout.
import { priceLines } from '../../wap-server/catalog.js'
import {
  HttpError,
  hasSupabase,
  makeConfirmationNumber,
  normalizeCustomer,
  normalizeItems,
  publicOrigin,
  requireEnv,
  sendError,
  stripe,
  supabase,
} from '../../wap-server/lib.js'

const HOLD_MINUTES = 60

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' })
  let orderId = null
  try {
    requireEnv('STRIPE_SECRET_KEY')
    const items = normalizeItems(req.body?.items)
    const customer = normalizeCustomer(req.body?.customer)
    const lines = priceLines(items)
    const confirmation = makeConfirmationNumber()
    const origin = publicOrigin(req)
    const expiresAt = new Date(Date.now() + HOLD_MINUTES * 60_000)
    const subtotal = lines.reduce((sum, line) => sum + line.unit_price_cents * line.quantity, 0)

    if (hasSupabase()) {
      const db = supabase()
      const { data: newOrderId, error: reserveError } = await db.rpc('wap_reserve_order', {
        p_confirmation: confirmation,
        p_customer: customer,
        p_items: items,
        p_expires_at: expiresAt.toISOString(),
      })
      if (reserveError) {
        const short = /insufficient_stock:([^\s"]+)/.exec(reserveError.message)
        if (short) throw new HttpError(409, 'Sorry, an item in your cart just sold out. Please update your cart.')
        throw reserveError
      }
      orderId = newOrderId
    }

    const session = await stripe().checkout.sessions.create({
      mode: 'payment',
      customer_email: customer.email,
      client_reference_id: orderId ?? confirmation,
      line_items: lines.map((line) => ({
        quantity: line.quantity,
        price_data: {
          currency: 'usd',
          unit_amount: line.unit_price_cents,
          product_data: { name: line.name, metadata: { sku: line.sku } },
        },
      })),
      shipping_address_collection: { allowed_countries: ['US'] },
      metadata: {
        wap: '1',
        wap_status: 'awaiting_payment',
        confirmation_number: confirmation,
        customer_name: customer.name,
        customer_email: customer.email,
        customer_phone: customer.phone,
        order_id: orderId ?? '',
        items: JSON.stringify(lines.map((line) => ({ sku: line.sku, q: line.quantity, p: line.unit_price_cents, n: line.name }))).slice(0, 500),
      },
      expires_at: Math.floor(expiresAt.getTime() / 1000),
      success_url: `${origin}/west-african-produce/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/west-african-produce/?checkout=cancelled#shop`,
    })

    if (hasSupabase() && orderId) {
      const { error: linkError } = await supabase()
        .from('wap_orders')
        .update({ stripe_session_id: session.id, subtotal_cents: subtotal })
        .eq('id', orderId)
      if (linkError) throw linkError
    }

    return res.status(200).json({ url: session.url, confirmationNumber: confirmation })
  } catch (err) {
    if (orderId && hasSupabase()) {
      await supabase().rpc('wap_cancel_order', { p_id: orderId, p_status: 'expired' }).catch(() => {})
    }
    return sendError(res, err)
  }
}
