// POST /api/wap/stripe-webhook: mark paid, email a receipt, release stock if a session expires unpaid.
import { fulfillPaidSession } from '../../wap-server/fulfill.js'
import { patchStripeOrder } from '../../wap-server/stripe-orders.js'
import { hasSupabase, requireEnv, sendError, stripe, supabase } from '../../wap-server/lib.js'

export const config = { api: { bodyParser: false } }

async function readRawBody(req) {
  if (req.rawBody) return Buffer.isBuffer(req.rawBody) ? req.rawBody : Buffer.from(req.rawBody)
  const chunks = []
  for await (const chunk of req) chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  return Buffer.concat(chunks)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' })
  try {
    requireEnv('STRIPE_WEBHOOK_SECRET')
    const signature = req.headers['stripe-signature']
    if (!signature) return res.status(400).json({ error: 'Missing stripe-signature.' })

    const event = stripe().webhooks.constructEvent(await readRawBody(req), signature, process.env.STRIPE_WEBHOOK_SECRET)
    const db = hasSupabase() ? supabase() : null

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      if (session.payment_status !== 'paid') return res.status(200).json({ received: true })

      if (db) {
        const { data: updated, error } = await db
          .from('wap_orders')
          .update({
            status: 'paid',
            paid_at: new Date().toISOString(),
            status_updated_at: new Date().toISOString(),
            stripe_payment_intent_id: typeof session.payment_intent === 'string' ? session.payment_intent : null,
            total_cents: session.amount_total,
            ship_to: session.shipping_details?.address
              ? { name: session.shipping_details.name, ...session.shipping_details.address }
              : null,
          })
          .eq('stripe_session_id', session.id)
          .eq('status', 'awaiting_payment')
          .select('id')
        if (error) throw error

        if (!updated?.length) {
          const { data: late } = await db
            .from('wap_orders')
            .select('id, status')
            .eq('stripe_session_id', session.id)
            .maybeSingle()
          if (late?.status === 'expired') {
            if (typeof session.payment_intent === 'string') {
              await stripe().refunds.create({ payment_intent: session.payment_intent })
            }
            await db
              .from('wap_orders')
              .update({
                status: 'refunded',
                staff_note: 'Paid after the stock hold expired. Refunded automatically.',
                status_updated_at: new Date().toISOString(),
              })
              .eq('id', late.id)
            return res.status(200).json({ received: true })
          }
        }
      }

      await fulfillPaidSession(session)
    }

    if (event.type === 'checkout.session.expired') {
      if (db) {
        const { data: order } = await db
          .from('wap_orders')
          .select('id')
          .eq('stripe_session_id', event.data.object.id)
          .eq('status', 'awaiting_payment')
          .maybeSingle()
        if (order) await db.rpc('wap_cancel_order', { p_id: order.id, p_status: 'expired' })
      } else {
        await patchStripeOrder(event.data.object.id, { wap_status: 'expired' }).catch(() => {})
      }
    }

    return res.status(200).json({ received: true })
  } catch (err) {
    if (err?.type === 'StripeSignatureVerificationError') return res.status(400).json({ error: 'Invalid signature.' })
    return sendError(res, err)
  }
}
