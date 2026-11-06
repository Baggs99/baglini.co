// Shared server helpers for the West African Produce storefront API.
// Lives outside /api so Vercel bundles it into each function that imports it.
import crypto from 'node:crypto'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

export const STATUSES = ['awaiting_payment', 'paid', 'preparing', 'ready', 'shipped', 'fulfilled', 'expired', 'cancelled', 'refunded']
// Forward-only path for fulfillment. Cancelling is separate and allowed from any open state below.
export const NEXT_STATUS = { paid: 'preparing', preparing: 'ready', ready: 'shipped', shipped: 'fulfilled' }
export const CANCELLABLE = ['paid', 'preparing', 'ready']
export const MAX_QTY = 99

export class HttpError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

export function requireEnv(...names) {
  const missing = names.filter((name) => !process.env[name])
  if (missing.length) throw new HttpError(503, `Server is missing config: ${missing.join(', ')}`)
}

let supabaseClient
export function hasSupabase() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
}

export function supabase() {
  requireEnv('SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY')
  supabaseClient ??= createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  })
  return supabaseClient
}

let stripeClient
export function stripe() {
  requireEnv('STRIPE_SECRET_KEY')
  stripeClient ??= new Stripe(process.env.STRIPE_SECRET_KEY)
  return stripeClient
}

export function publicOrigin(req) {
  const host = String(req.headers['x-forwarded-host'] ?? req.headers.host ?? '')
  if (host) {
    const local = host.includes('localhost') || host.startsWith('127.0.0.1')
    const proto = req.headers['x-forwarded-proto'] ?? (local ? 'http' : 'https')
    return `${proto}://${host}`.replace(/\/$/, '')
  }
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, '')
  return 'http://localhost:5173'
}

// Customer-facing confirmation number. No 0/O/1/I so it can be read aloud over the phone.
const CONFIRM_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'
export function makeConfirmationNumber() {
  const bytes = crypto.randomBytes(6)
  let code = ''
  for (const b of bytes) code += CONFIRM_ALPHABET[b % CONFIRM_ALPHABET.length]
  return `WAP-${code}`
}

// Accepts an array of { sku, quantity }, merges duplicates, and enforces the quantity cap.
export function normalizeItems(raw) {
  if (!Array.isArray(raw) || raw.length === 0) throw new HttpError(400, 'Your cart is empty.')
  const merged = new Map()
  for (const line of raw) {
    const sku = String(line?.sku ?? '').trim()
    const quantity = Number(line?.quantity)
    if (!sku) throw new HttpError(400, 'Each item needs a product.')
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QTY) {
      throw new HttpError(400, `Quantities must be whole numbers from 1 to ${MAX_QTY}.`)
    }
    merged.set(sku, (merged.get(sku) ?? 0) + quantity)
  }
  return [...merged].map(([sku, quantity]) => ({ sku, quantity }))
}

export function normalizeCustomer(raw) {
  const name = String(raw?.name ?? '').trim()
  const email = String(raw?.email ?? '').trim().toLowerCase()
  const phone = String(raw?.phone ?? '').trim()
  if (!name) throw new HttpError(400, 'Please enter your name.')
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new HttpError(400, 'Please enter a valid email address.')
  if (phone.replace(/\D/g, '').length < 7) throw new HttpError(400, 'Please enter a phone number.')
  return { name: name.slice(0, 120), email: email.slice(0, 200), phone: phone.slice(0, 40) }
}

// Admin session: a cookie holding an expiry timestamp and an HMAC signed with ADMIN_PASSWORD.
const ADMIN_COOKIE = 'wap_admin'
const ADMIN_TTL_MS = 1000 * 60 * 60 * 12

function adminSignature(expires) {
  return crypto.createHmac('sha256', process.env.ADMIN_PASSWORD).update(`wap-admin:${expires}`).digest('base64url')
}

export function passwordMatches(candidate) {
  requireEnv('ADMIN_PASSWORD')
  const a = Buffer.from(String(candidate ?? ''))
  const b = Buffer.from(process.env.ADMIN_PASSWORD)
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}

function cookieSecurity() {
  return process.env.VERCEL || process.env.NODE_ENV === 'production' || process.env.APP_URL?.startsWith('https')
    ? 'Secure; '
    : ''
}

export function adminCookieHeader() {
  const expires = Date.now() + ADMIN_TTL_MS
  const token = `${expires}.${adminSignature(expires)}`
  return `${ADMIN_COOKIE}=${token}; HttpOnly; ${cookieSecurity()}SameSite=Lax; Path=/api/wap; Max-Age=${ADMIN_TTL_MS / 1000}`
}

export function clearAdminCookieHeader() {
  return `${ADMIN_COOKIE}=; HttpOnly; ${cookieSecurity()}SameSite=Lax; Path=/api/wap; Max-Age=0`
}

export function isAdmin(req) {
  requireEnv('ADMIN_PASSWORD')
  const raw = (req.headers.cookie ?? '')
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${ADMIN_COOKIE}=`))
  if (!raw) return false
  const [expiresText, signature] = raw.slice(ADMIN_COOKIE.length + 1).split('.')
  const expires = Number(expiresText)
  if (!expires || expires < Date.now() || !signature) return false
  const expected = adminSignature(expires)
  return signature.length === expected.length && crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
}

export function sendError(res, err) {
  if (err instanceof HttpError) return res.status(err.status).json({ error: err.message })
  console.error(err)
  return res.status(500).json({ error: 'Something went wrong. Please try again or email sales.' })
}
