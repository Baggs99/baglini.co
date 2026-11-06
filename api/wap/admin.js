// /api/wap/admin: staff login, pending-order queue, inventory, and wholesale inquiries.
//   POST   { action: 'login' | 'logout' }
//   GET    -> orders, products, wholesale inquiries (requires login)
//   PATCH  { type: 'order', id, action: 'advance' | 'cancel', staffNote? }
//          { type: 'product', sku, price_cents?, stock_on_hand?, active? }
//          { type: 'wholesale', id, status }
import { catalogProducts } from '../../wap-server/catalog.js'
import {
  CANCELLABLE,
  HttpError,
  NEXT_STATUS,
  STATUSES,
  adminCookieHeader,
  clearAdminCookieHeader,
  hasSupabase,
  isAdmin,
  passwordMatches,
  sendError,
  stripe,
  supabase,
} from '../../wap-server/lib.js'
import { advanceStripeOrder, listStripeOrders, refundStripeOrder, patchStripeOrder } from '../../wap-server/stripe-orders.js'

const WHOLESALE_STATUSES = ['new', 'contacted', 'closed']

function isStripeOrderId(id) {
  return String(id).startsWith('cs_')
}

async function loadQueue(res) {
  if (!hasSupabase()) {
    const orders = await listStripeOrders()
    res.setHeader('Cache-Control', 'no-store')
    return res.status(200).json({
      orders,
      products: catalogProducts(),
      wholesale: [],
      statuses: STATUSES,
    })
  }

  const db = supabase()
  const [orders, products, wholesale] = await Promise.all([
    db.from('wap_orders').select('*, wap_order_items(*)').order('created_at', { ascending: false }).limit(300),
    db.from('wap_products').select('*').order('sort_order', { ascending: true }),
    db.from('wap_wholesale_inquiries').select('*').order('created_at', { ascending: false }).limit(200),
  ])
  for (const result of [orders, products, wholesale]) if (result.error) throw result.error
  res.setHeader('Cache-Control', 'no-store')
  return res.status(200).json({
    orders: orders.data,
    products: products.data,
    wholesale: wholesale.data,
    statuses: STATUSES,
  })
}

async function advanceOrder(id, staffNote) {
  if (isStripeOrderId(id) || !hasSupabase()) return advanceStripeOrder(id, staffNote)
  const db = supabase()
  const { data: order, error } = await db.from('wap_orders').select('status').eq('id', id).single()
  if (error || !order) throw new HttpError(404, 'Order not found.')
  const next = NEXT_STATUS[order.status]
  if (!next) throw new HttpError(409, `Orders in "${order.status}" cannot be advanced.`)
  const patch = { status: next, status_updated_at: new Date().toISOString() }
  if (staffNote !== undefined) patch.staff_note = staffNote
  // Filter on the old status so two staff clicking at once cannot skip a step.
  const { data, error: updateError } = await db
    .from('wap_orders')
    .update(patch)
    .eq('id', id)
    .eq('status', order.status)
    .select('id')
  if (updateError) throw updateError
  if (!data?.length) throw new HttpError(409, 'That order changed while you were looking. Refresh and try again.')
}

async function cancelOrder(id, staffNote) {
  if (isStripeOrderId(id) || !hasSupabase()) return refundStripeOrder(id, staffNote)
  const db = supabase()
  const { data: order, error } = await db
    .from('wap_orders')
    .select('id, status, stripe_payment_intent_id')
    .eq('id', id)
    .single()
  if (error || !order) throw new HttpError(404, 'Order not found.')
  if (!CANCELLABLE.includes(order.status)) {
    throw new HttpError(409, `Orders in "${order.status}" cannot be cancelled.`)
  }

  let finalStatus = 'cancelled'
  if (order.stripe_payment_intent_id) {
    await stripe().refunds.create({ payment_intent: order.stripe_payment_intent_id })
    finalStatus = 'refunded'
  }
  // Returns the reserved stock to inventory and records the terminal status.
  await db.rpc('wap_cancel_order', { p_id: id, p_status: finalStatus })
  if (staffNote !== undefined) {
    await db.from('wap_orders').update({ staff_note: staffNote }).eq('id', id)
  }
}

export default async function handler(req, res) {
  try {
    if (req.method === 'POST') {
      const action = req.body?.action
      if (action === 'login') {
        if (!passwordMatches(req.body?.password)) return res.status(401).json({ error: 'Wrong password.' })
        res.setHeader('Set-Cookie', adminCookieHeader())
        return res.status(200).json({ ok: true })
      }
      if (action === 'logout') {
        res.setHeader('Set-Cookie', clearAdminCookieHeader())
        return res.status(200).json({ ok: true })
      }
      return res.status(400).json({ error: 'Unknown action.' })
    }

    if (!isAdmin(req)) return res.status(401).json({ error: 'Log in to continue.' })

    if (req.method === 'GET') return loadQueue(res)

    if (req.method === 'PATCH') {
      const body = req.body ?? {}
      const db = hasSupabase() ? supabase() : null

      if (body.type === 'order') {
        const id = String(body.id ?? '')
        if (body.action === 'advance') await advanceOrder(id, body.staffNote)
        else if (body.action === 'cancel') await cancelOrder(id, body.staffNote)
        else if (typeof body.staffNote === 'string') {
          if (isStripeOrderId(id) || !hasSupabase()) await patchStripeOrder(id, { staff_note: body.staffNote.slice(0, 500) })
          else await db.from('wap_orders').update({ staff_note: body.staffNote.slice(0, 1000) }).eq('id', id)
        } else throw new HttpError(400, 'Unknown order action.')
        return res.status(200).json({ ok: true })
      }

      if (body.type === 'product') {
        if (!hasSupabase()) throw new HttpError(409, 'Inventory edits need the product database. Orders still track in Stripe.')
        const patch = { updated_at: new Date().toISOString() }
        if (body.price_cents !== undefined) {
          const price = Number(body.price_cents)
          if (!Number.isInteger(price) || price < 1) throw new HttpError(400, 'Price must be a whole number of cents.')
          patch.price_cents = price
        }
        if (body.stock_on_hand !== undefined) {
          const stock = Number(body.stock_on_hand)
          if (!Number.isInteger(stock) || stock < 0) throw new HttpError(400, 'Stock cannot be negative.')
          patch.stock_on_hand = stock
        }
        if (body.active !== undefined) patch.active = Boolean(body.active)
        const { error } = await db.from('wap_products').update(patch).eq('sku', String(body.sku ?? ''))
        if (error) throw error
        return res.status(200).json({ ok: true })
      }

      if (body.type === 'wholesale') {
        if (!hasSupabase()) throw new HttpError(409, 'Wholesale tracking needs the database.')
        if (!WHOLESALE_STATUSES.includes(body.status)) throw new HttpError(400, 'Unknown status.')
        const { error } = await db.from('wap_wholesale_inquiries').update({ status: body.status }).eq('id', String(body.id ?? ''))
        if (error) throw error
        return res.status(200).json({ ok: true })
      }

      throw new HttpError(400, 'Unknown update type.')
    }

    return res.status(405).json({ error: 'Method not allowed.' })
  } catch (err) {
    return sendError(res, err)
  }
}
