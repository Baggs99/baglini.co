// POST /api/wap/wholesale: pallet and private-label inquiries from Texas and DC-metro wholesalers.
import { HttpError, sendError, supabase } from '../../wap-server/lib.js'

function clean(value, max) {
  return String(value ?? '').trim().slice(0, max)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' })
  try {
    const body = req.body ?? {}
    const name = clean(body.name, 120)
    const email = clean(body.email, 200).toLowerCase()
    if (!name) throw new HttpError(400, 'Please enter your name.')
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new HttpError(400, 'Please enter a valid email address.')

    const { error } = await supabase().from('wap_wholesale_inquiries').insert({
      name,
      email,
      company: clean(body.company, 160) || null,
      phone: clean(body.phone, 40) || null,
      interest: clean(body.interest, 80) || null,
      message: clean(body.message, 2000) || null,
    })
    if (error) throw error
    return res.status(200).json({ ok: true })
  } catch (err) {
    return sendError(res, err)
  }
}
