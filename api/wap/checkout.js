// POST /api/wap/checkout: reserve stock, create a pending order, and return a Stripe Checkout URL.
import {
  HttpError,
  makeConfirmationNumber,
  normalizeCustomer,
  normalizeItems,
  publicOrigin,
  requireEnv,
  sendError,
  stripe,
  supabase,
} from '../../wap-server/lib.js'

// Stripe requires session expiry between 30 minutes and 24 hours out. Stock is held until then.
const HOLD_MINUTES = 60

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' })
  let orderId = null
  try {
    requireEnv('STRIPE_SECRET_KEY', 'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY')
    const items = normalizeItems(req.body?.items)
    const customer = normalizeCustomer(req.body?.customer)
    const db = supabase()
    const expiresAt = new Date(Date.now() + HOLD_MINUTES * 60_000)
    const confirmation = makeConfirmationNumber()

    // Reserves stock and writes the order + line items atomically. Raises if any line is short.
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

    const { data: lines, error: linesError } = await db
      .from('wap_order_items')
      .select('name, sku, unit_price_cents, quantity')
      .eq('order_id', orderId)
    if (linesError) throw linesError

    const origin = publicOrigin(req)
    const session = await stripe().checkout.sessions.create({
      mode: 'payment',
      customer_email: customer.email,
      client_reference_id: orderId,
      line_items: lines.map((line) => ({
        quantity: line.quantity,
        price_data: {
          currency: 'usd',
          unit_amount: line.unit_price_cents,
          product_data: { name: line.name, metadata: { sku: line.sku } },
        },
      })),
      shipping_address_collection: { allowed_countries: ['US'] },
      metadata: { order_id: orderId, confirmation_number: confirmation },
      expires_at: Math.floor(expiresAt.getTime() / 1000),
      success_url: `${origin}/west-african-produce?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/west-african-produce?checkout=cancelled#shop`,
    })

    const { error: linkError } = await db
      .from('wap_orders')
      .update({ stripe_session_id: session.id })
      .eq('id', orderId)
    if (linkError) throw linkError

    return res.status(200).json({ url: session.url, confirmationNumber: confirmation })
  } catch (err) {
    // Free the held stock if the order was created but checkout could not start.
    if (orderId) await supabase().rpc('wap_cancel_order', { p_id: orderId, p_status: 'expired' }).catch(() => {})
    return sendError(res, err)
  }
}
