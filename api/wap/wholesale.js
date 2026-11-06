// POST /api/wap/wholesale: pallet and private-label inquiries from Texas and DC-metro wholesalers.
import { Resend } from 'resend'
import { HttpError, hasSupabase, sendError, supabase } from '../../wap-server/lib.js'

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

    const inquiry = {
      name,
      email,
      company: clean(body.company, 160) || null,
      phone: clean(body.phone, 40) || null,
      interest: clean(body.interest, 80) || null,
      message: clean(body.message, 2000) || null,
    }

    if (hasSupabase()) {
      const { error } = await supabase().from('wap_wholesale_inquiries').insert(inquiry)
      if (error) throw error
    } else if (process.env.RESEND_API_KEY) {
      const staff = process.env.WAP_STAFF_EMAIL || 'dan@baglini.co'
      const { error } = await new Resend(process.env.RESEND_API_KEY).emails.send({
        from: process.env.RESEND_FROM || 'West African Produce <dan@baglini.co>',
        to: staff,
        replyTo: email,
        subject: `Wholesale inquiry · ${inquiry.interest || 'West African Produce'}`,
        text: [`Name: ${name}`, `Company: ${inquiry.company || '—'}`, `Email: ${email}`, `Phone: ${inquiry.phone || '—'}`, `Interest: ${inquiry.interest || '—'}`, '', inquiry.message || ''].join('\n'),
      })
      if (error) throw new Error(error.message || 'Could not send the wholesale inquiry.')
    } else {
      throw new HttpError(503, 'Wholesale inquiries are not configured yet.')
    }
    return res.status(200).json({ ok: true })
  } catch (err) {
    return sendError(res, err)
  }
}
