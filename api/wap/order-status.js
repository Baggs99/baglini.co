// GET /api/wap/order-status?session_id=...: lets the success page show a confirmation number. No customer PII.
import { sendError, supabase } from '../../wap-server/lib.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed.' })
  const sessionId = String(req.query?.session_id ?? '')
  if (!/^cs_[A-Za-z0-9_]+$/.test(sessionId)) return res.status(400).json({ error: 'Missing session.' })
  try {
    const { data, error } = await supabase()
      .from('wap_orders')
      .select('confirmation_number, status, total_cents, customer_email')
      .eq('stripe_session_id', sessionId)
      .maybeSingle()
    if (error) throw error
    if (!data) return res.status(404).json({ error: 'Order not found.' })
    res.setHeader('Cache-Control', 'no-store')
    return res.status(200).json({
      confirmationNumber: data.confirmation_number,
      status: data.status,
      totalCents: data.total_cents,
      email: data.customer_email,
    })
  } catch (err) {
    return sendError(res, err)
  }
}
