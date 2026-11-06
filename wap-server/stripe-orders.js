import { HttpError, NEXT_STATUS, stripe } from './lib.js'

export const WAP_META = 'wap'

function shipToFrom(session) {
  const details = session.shipping_details ?? session.collected_information?.shipping_details
  if (!details?.address) return null
  return { name: details.name, ...details.address }
}

function statusFrom(session) {
  const marked = session.metadata?.wap_status
  if (session.status === 'expired' && marked !== 'paid' && marked !== 'preparing' && marked !== 'ready' && marked !== 'shipped' && marked !== 'fulfilled') {
    return 'expired'
  }
  if (session.payment_status === 'paid') {
    if (marked && marked !== 'awaiting_payment') return marked
    return 'paid'
  }
  return marked || 'awaiting_payment'
}

function linesFrom(session) {
  const expanded = session.line_items?.data ?? []
  if (expanded.length) {
    return expanded.map((line, index) => ({
      id: line.id ?? `${session.id}-${index}`,
      name: line.description ?? line.price?.product ?? 'Item',
      sku: line.price?.metadata?.sku ?? line.price?.product_data?.metadata?.sku ?? '',
      unit_price_cents: line.price?.unit_amount ?? Math.round((line.amount_subtotal ?? 0) / (line.quantity || 1)),
      quantity: line.quantity ?? 1,
    }))
  }
  try {
    const packed = JSON.parse(session.metadata?.items || '[]')
    return packed.map((line, index) => ({
      id: `${session.id}-${index}`,
      name: line.n,
      sku: line.sku,
      unit_price_cents: line.p,
      quantity: line.q,
    }))
  } catch {
    return []
  }
}

export function orderFromSession(session) {
  const meta = session.metadata ?? {}
  return {
    id: session.id,
    confirmation_number: meta.confirmation_number,
    status: statusFrom(session),
    customer_name: meta.customer_name || session.customer_details?.name || '',
    customer_email: session.customer_details?.email || session.customer_email || meta.customer_email || '',
    customer_phone: meta.customer_phone || '',
    total_cents: session.amount_total,
    subtotal_cents: session.amount_subtotal,
    created_at: new Date((session.created ?? 0) * 1000).toISOString(),
    paid_at: session.payment_status === 'paid' ? new Date((session.created ?? 0) * 1000).toISOString() : null,
    ship_to: shipToFrom(session),
    staff_note: meta.staff_note || '',
    stripe_payment_intent_id: typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id,
    receipt_sent: meta.receipt_sent === '1',
    wap_order_items: linesFrom(session),
  }
}

export async function listStripeOrders() {
  const sessions = await stripe().checkout.sessions.list({
    limit: 100,
    expand: ['data.line_items'],
  })
  return sessions.data.filter((session) => session.metadata?.[WAP_META] === '1').map(orderFromSession)
}

export async function getStripeOrder(sessionId) {
  const session = await stripe().checkout.sessions.retrieve(sessionId, { expand: ['line_items'] })
  if (session.metadata?.[WAP_META] !== '1') return null
  return { session, order: orderFromSession(session) }
}

export async function patchStripeOrder(sessionId, patch) {
  const current = await stripe().checkout.sessions.retrieve(sessionId)
  const metadata = { ...(current.metadata ?? {}), ...patch }
  const session = await stripe().checkout.sessions.update(sessionId, { metadata })
  return orderFromSession(session)
}

export async function advanceStripeOrder(sessionId, staffNote) {
  const { order } = (await getStripeOrder(sessionId)) ?? {}
  if (!order) throw new HttpError(404, 'Order not found.')
  const next = NEXT_STATUS[order.status]
  if (!next) throw new HttpError(409, `Orders in "${order.status}" cannot be advanced.`)
  return patchStripeOrder(sessionId, {
    wap_status: next,
    ...(staffNote !== undefined ? { staff_note: String(staffNote).slice(0, 500) } : {}),
  })
}

export async function refundStripeOrder(sessionId, staffNote) {
  const found = await getStripeOrder(sessionId)
  if (!found) throw new HttpError(404, 'Order not found.')
  if (found.order.stripe_payment_intent_id) {
    await stripe().refunds.create({ payment_intent: found.order.stripe_payment_intent_id })
  }
  return patchStripeOrder(sessionId, {
    wap_status: found.order.stripe_payment_intent_id ? 'refunded' : 'cancelled',
    ...(staffNote !== undefined ? { staff_note: String(staffNote).slice(0, 500) } : {}),
  })
}
