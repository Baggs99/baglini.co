import { useEffect, useMemo, useState } from 'react'
import { brand, categories, pillars, wholesale } from './content.js'
import { MAX_QTY, cartLines, cartTotalCents, money, useCart } from './cart.js'

const AVAILABILITY = {
  in_stock: { label: 'In stock', className: 'bg-wap-green/10 text-wap-green' },
  low: { label: 'Only a few left', className: 'bg-wap-gold/20 text-[#7a5b16]' },
  sold_out: { label: 'Sold out', className: 'bg-zinc-200 text-zinc-500' },
}

function scrollToId(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

async function readJson(res) {
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body.error ?? 'Something went wrong. Please try again.')
  return body
}

// ---------- Header ----------

function Header({ count, onCart }) {
  const links = [
    { id: 'story', label: 'Our Story' },
    { id: 'shop', label: 'Shop' },
    { id: 'wholesale', label: 'Wholesale' },
    { id: 'contact', label: 'Contact' },
  ]
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-wap-navy/95 text-white backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 md:px-8">
        <a href="#top" className="font-display text-lg font-semibold tracking-wide">
          {brand.name}
        </a>
        <nav className="hidden items-center gap-7 text-sm font-medium text-white/80 md:flex" aria-label="Primary">
          {links.map((link) => (
            <a key={link.id} href={`#${link.id}`} className="transition hover:text-white" onClick={() => scrollToId(link.id)}>
              {link.label}
            </a>
          ))}
        </nav>
        <button
          type="button"
          onClick={onCart}
          className="inline-flex items-center gap-2 rounded-full bg-wap-gold px-4 py-2 text-sm font-semibold text-wap-navy-deep transition hover:bg-[#d9b25e]"
        >
          Cart
          <span className="rounded-full bg-wap-navy px-2 py-0.5 text-xs text-white">{count}</span>
        </button>
      </div>
    </header>
  )
}

// ---------- Hero ----------

function Hero() {
  return (
    <section id="top" className="wap-pattern relative overflow-hidden bg-wap-navy text-white">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 md:grid-cols-[1.2fr_1fr] md:items-center md:px-8 md:py-28">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-wap-gold">Houston, Texas · West African staples</p>
          <h1 className="mt-5 font-display text-5xl font-medium leading-[1.05] tracking-tight md:text-7xl">
            Experience the taste of <em className="text-wap-gold">Africa</em>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-white/75 md:text-lg">
            Organic red palm oil, smoked fish, frozen greens, and spices, brought to your kitchen while supporting
            small-scale farmers.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a
              href="#shop"
              onClick={() => scrollToId('shop')}
              className="inline-flex items-center justify-center rounded-full bg-wap-gold px-7 py-3.5 text-sm font-semibold text-wap-navy-deep transition hover:bg-[#d9b25e]"
            >
              Shop now →
            </a>
            <a
              href="#wholesale"
              onClick={() => scrollToId('wholesale')}
              className="inline-flex items-center justify-center rounded-full border border-white/25 px-7 py-3.5 text-sm font-semibold text-white transition hover:border-white/50"
            >
              Wholesale partners
            </a>
          </div>
        </div>

        {/* Palm oil feature card. Swap in WAP's product photography when it is available. */}
        <div className="relative mx-auto w-full max-w-sm">
          <div className="rounded-[2rem] border border-wap-gold/40 bg-gradient-to-b from-[#1f3550] to-[#101c2d] p-8 shadow-2xl shadow-black/40">
            <p className="text-xs uppercase tracking-[0.2em] text-wap-gold">Restocked</p>
            <p className="mt-4 font-display text-3xl leading-tight">Organic Red Palm Oil</p>
            <p className="mt-3 text-sm leading-relaxed text-white/70">
              Imported from smallholder farms in Sierra Leone. Rich in antioxidants and vitamin E, with a high smoke point for frying and sautéing.
            </p>
            <div className="mt-6 flex items-end justify-between border-t border-white/10 pt-5">
              <div>
                <p className="text-xs uppercase tracking-wider text-white/50">Sold by the gallon</p>
                <p className="font-display text-2xl">From {money(3000)}</p>
              </div>
              <a href="#shop" onClick={() => scrollToId('shop')} className="text-sm font-semibold text-wap-gold hover:text-white">
                Order →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ---------- Story ----------

function Story() {
  return (
    <section id="story" className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
      <div className="grid gap-12 md:grid-cols-[1fr_1.4fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-wap-palm">Our story</p>
          <h2 className="mt-4 font-display text-4xl leading-tight md:text-5xl">
            With a focus on sustainability and community.
          </h2>
        </div>
        <div className="space-y-5 text-lg leading-relaxed text-wap-muted">
          <p>
            We strive to bring you the authentic tastes and flavors of West Africa while supporting small-scale farmers and
            their families.
          </p>
          <p>
            Thank you for choosing WAP. We look forward to serving you.
          </p>
        </div>
      </div>
      <div className="mt-16 grid gap-6 md:grid-cols-3">
        {pillars.map((pillar) => (
          <div key={pillar.title} className="rounded-2xl border border-wap-navy/10 bg-wap-paper p-7">
            <div className="h-px w-10 bg-wap-gold" />
            <h3 className="mt-5 font-display text-xl font-medium">{pillar.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-wap-muted">{pillar.body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

// ---------- Shop ----------

function ProductCard({ product, quantity, onQuantity }) {
  const soldOut = product.availability === 'sold_out'
  const badge = AVAILABILITY[product.availability] ?? AVAILABILITY.in_stock
  return (
    <article className="flex flex-col rounded-2xl border border-wap-navy/10 bg-wap-paper p-6 transition hover:border-wap-navy/25 hover:shadow-lg hover:shadow-wap-navy/5">
      <div className="flex items-start justify-between gap-3">
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider ${badge.className}`}>
          {badge.label}
        </span>
        <span className="font-display text-xl">{money(product.price_cents)}</span>
      </div>
      <h3 className="mt-4 font-display text-xl leading-snug">{product.name}</h3>
      <p className="mt-1 text-xs uppercase tracking-wider text-wap-muted">{product.unit}</p>
      {product.description && <p className="mt-3 flex-1 text-sm leading-relaxed text-wap-muted">{product.description}</p>}

      <div className="mt-6 flex items-center justify-between gap-3">
        {soldOut ? (
          <p className="text-sm text-wap-muted">Back soon. Email us to be notified.</p>
        ) : (
          <div className="inline-flex items-center rounded-full border border-wap-navy/15" role="group" aria-label={`Quantity for ${product.name}`}>
            <button
              type="button"
              className="h-10 w-10 text-lg text-wap-navy disabled:opacity-30"
              onClick={() => onQuantity(quantity - 1)}
              disabled={quantity === 0}
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="w-8 text-center text-sm font-semibold tabular-nums" aria-live="polite">
              {quantity}
            </span>
            <button
              type="button"
              className="h-10 w-10 text-lg text-wap-navy disabled:opacity-30"
              onClick={() => onQuantity(quantity + 1)}
              disabled={quantity >= MAX_QTY}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        )}
        {!soldOut && (
          <button
            type="button"
            onClick={() => onQuantity(Math.max(1, quantity))}
            className="rounded-full bg-wap-navy px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-wap-navy-deep"
          >
            {quantity > 0 ? 'In cart' : 'Add to cart'}
          </button>
        )}
      </div>
    </article>
  )
}

function Shop({ products, loadError, cart, setQuantity, onReview }) {
  const [category, setCategory] = useState('all')
  const visible = useMemo(
    () => products.filter((p) => category === 'all' || p.category === category),
    [products, category],
  )
  const itemCount = Object.values(cart).reduce((a, b) => a + b, 0)

  return (
    <section id="shop" className="bg-wap-paper py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-wap-palm">Shop</p>
            <h2 className="mt-4 font-display text-4xl md:text-5xl">Pantry staples, shipped to you</h2>
          </div>
          {itemCount > 0 && (
            <button
              type="button"
              onClick={onReview}
              className="self-start rounded-full bg-wap-gold px-6 py-3 text-sm font-semibold text-wap-navy-deep hover:bg-[#d9b25e] md:self-auto"
            >
              Review cart ({itemCount}) →
            </button>
          )}
        </div>

        <div className="mt-10 flex flex-wrap gap-2" role="tablist" aria-label="Product categories">
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              role="tab"
              aria-selected={category === c.id}
              onClick={() => setCategory(c.id)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                category === c.id ? 'bg-wap-navy text-white' : 'border border-wap-navy/15 text-wap-navy hover:border-wap-navy/40'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {loadError && <p className="mt-8 rounded-xl bg-red-50 p-4 text-sm text-red-700">{loadError}</p>}
        {!products.length && !loadError && <p className="mt-10 text-sm text-wap-muted">Loading products…</p>}

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((product) => (
            <ProductCard
              key={product.sku}
              product={product}
              quantity={cart[product.sku] ?? 0}
              onQuantity={(q) => setQuantity(product.sku, q)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

// ---------- Checkout ----------

function Checkout({ products, cart, setQuantity, clear, notice }) {
  const lines = cartLines(cart, products)
  const total = cartTotalCents(lines)
  const [customer, setCustomer] = useState({ name: '', email: '', phone: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const body = await readJson(
        await fetch('/api/wap/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: lines.map((l) => ({ sku: l.sku, quantity: l.quantity })),
            customer,
          }),
        }),
      )
      // Stock is held for an hour. Payment happens on Stripe's hosted page, so card details never touch this site.
      window.location.href = body.url
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  const field = 'mt-1.5 w-full rounded-xl border border-wap-navy/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-wap-navy focus:ring-2 focus:ring-wap-navy/10'

  return (
    <section id="checkout" className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-wap-palm">Checkout</p>
      <h2 className="mt-4 font-display text-4xl md:text-5xl">Your order</h2>
      {notice}

      {lines.length === 0 ? (
        <p className="mt-8 text-wap-muted">
          Your cart is empty.{' '}
          <a href="#shop" className="font-semibold text-wap-navy underline underline-offset-4" onClick={() => scrollToId('shop')}>
            Browse the shop
          </a>
          .
        </p>
      ) : (
        <div className="mt-10 grid gap-10 lg:grid-cols-[1.1fr_1fr]">
          <div className="rounded-2xl border border-wap-navy/10 bg-wap-paper">
            <ul className="divide-y divide-wap-navy/10">
              {lines.map((line) => (
                <li key={line.sku} className="flex items-center justify-between gap-4 p-5">
                  <div>
                    <p className="font-medium">{line.name}</p>
                    <p className="text-xs text-wap-muted">{line.unit} · {money(line.price_cents)} each</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="inline-flex items-center rounded-full border border-wap-navy/15">
                      <button type="button" className="h-8 w-8" onClick={() => setQuantity(line.sku, line.quantity - 1)} aria-label={`Decrease ${line.name}`}>−</button>
                      <span className="w-6 text-center text-sm tabular-nums">{line.quantity}</span>
                      <button type="button" className="h-8 w-8" onClick={() => setQuantity(line.sku, line.quantity + 1)} disabled={line.quantity >= MAX_QTY} aria-label={`Increase ${line.name}`}>+</button>
                    </div>
                    <span className="w-20 text-right font-medium tabular-nums">{money(line.price_cents * line.quantity)}</span>
                  </div>
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between border-t border-wap-navy/10 p-5">
              <span className="text-sm text-wap-muted">Subtotal (shipping calculated at payment)</span>
              <span className="font-display text-2xl">{money(total)}</span>
            </div>
            <div className="border-t border-wap-navy/10 p-5 text-right">
              <button type="button" onClick={clear} className="text-sm text-wap-muted underline underline-offset-4 hover:text-wap-navy">
                Empty cart
              </button>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-5" noValidate>
            <p className="text-sm text-wap-muted">
              We will email your confirmation number and receipt. Pay securely on Stripe's checkout page, where you will also enter your shipping address.
            </p>
            <label className="block text-sm font-medium">
              Full name *
              <input className={field} required autoComplete="name" value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} />
            </label>
            <label className="block text-sm font-medium">
              Email *
              <input className={field} type="email" required autoComplete="email" value={customer.email} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} />
            </label>
            <label className="block text-sm font-medium">
              Phone *
              <input className={field} type="tel" required autoComplete="tel" value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} />
            </label>
            {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-wap-navy px-6 py-4 text-sm font-semibold text-white transition hover:bg-wap-navy-deep disabled:opacity-60"
            >
              {submitting ? 'Opening secure checkout…' : `Pay ${money(total)} securely →`}
            </button>
          </form>
        </div>
      )}
    </section>
  )
}

// ---------- Wholesale ----------

function Wholesale() {
  const [form, setForm] = useState({ name: '', company: '', email: '', phone: '', interest: wholesale.interests[0], message: '' })
  const [status, setStatus] = useState({ state: 'idle', message: '' })
  const field = 'mt-1.5 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/40 focus:border-wap-gold'

  async function submit(e) {
    e.preventDefault()
    setStatus({ state: 'saving', message: '' })
    try {
      await readJson(
        await fetch('/api/wap/wholesale', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        }),
      )
      setStatus({ state: 'done', message: 'Thanks. Our wholesale team will be in touch soon.' })
    } catch (err) {
      setStatus({ state: 'error', message: err.message })
    }
  }

  return (
    <section id="wholesale" className="wap-pattern bg-wap-navy py-20 text-white md:py-28">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 md:grid-cols-2 md:px-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-wap-gold">Wholesale</p>
          <h2 className="mt-4 font-display text-4xl leading-tight md:text-5xl">Stock the flavors of West Africa</h2>
          <p className="mt-6 text-lg leading-relaxed text-white/75">{wholesale.intro}</p>
          <p className="mt-4 text-sm italic text-white/60">{wholesale.palletNote}</p>
        </div>
        {status.state === 'done' ? (
          <div className="rounded-2xl border border-wap-gold/40 p-8">
            <p className="font-display text-2xl">{status.message}</p>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-7" noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium">Name *<input className={field} required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
              <label className="block text-sm font-medium">Company<input className={field} value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></label>
              <label className="block text-sm font-medium">Email *<input className={field} type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
              <label className="block text-sm font-medium">Phone<input className={field} type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
            </div>
            <label className="block text-sm font-medium">
              What are you interested in?
              <select className={field} value={form.interest} onChange={(e) => setForm({ ...form, interest: e.target.value })}>
                {wholesale.interests.map((i) => (
                  <option key={i} className="text-wap-ink">{i}</option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium">Message<textarea className={`${field} min-h-24`} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></label>
            {status.state === 'error' && <p role="alert" className="text-sm text-red-300">{status.message}</p>}
            <button type="submit" disabled={status.state === 'saving'} className="w-full rounded-full bg-wap-gold px-6 py-3.5 text-sm font-semibold text-wap-navy-deep hover:bg-[#d9b25e] disabled:opacity-60">
              {status.state === 'saving' ? 'Sending…' : 'Send wholesale inquiry'}
            </button>
          </form>
        )}
      </div>
    </section>
  )
}

// ---------- Contact / footer ----------

function Footer() {
  return (
    <footer id="contact" className="bg-wap-navy-deep text-white/80">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 md:grid-cols-3 md:px-8">
        <div>
          <p className="font-display text-xl text-white">{brand.name}</p>
          <p className="mt-3 text-sm leading-relaxed">
            {brand.address.map((line) => (
              <span key={line} className="block">{line}</span>
            ))}
          </p>
        </div>
        <div className="text-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-wap-gold">Talk to us</p>
          <a href={`mailto:${brand.email}`} className="mt-3 block underline underline-offset-4 hover:text-white">{brand.email}</a>
        </div>
        <div className="text-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-wap-gold">Follow</p>
          <div className="mt-3 flex gap-5">
            <a href={brand.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-white">Instagram ↗</a>
            <a href={brand.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-white">Facebook ↗</a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-6xl px-5 py-6 text-xs text-white/50 md:px-8">
          © {new Date().getFullYear()} {brand.name}. Payments are processed by Stripe.
        </p>
      </div>
    </footer>
  )
}

// ---------- Page ----------

export function Storefront() {
  const [products, setProducts] = useState([])
  const [loadError, setLoadError] = useState('')
  const { cart, setQuantity, clear } = useCart()
  const [result, setResult] = useState(null) // { kind: 'success' | 'cancelled' | 'pending', confirmationNumber? }

  useEffect(() => {
    fetch('/api/wap/products')
      .then(readJson)
      .then((data) => setProducts(data.products))
      .catch((err) => setLoadError(err.message || 'Could not load products.'))
  }, [])

  // Handle the return trip from Stripe Checkout.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const state = params.get('checkout')
    const sessionId = params.get('session_id')
    if (!state) return
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.hash}`)

    if (state === 'cancelled') {
      setResult({ kind: 'cancelled' })
      return
    }
    if (state !== 'success' || !sessionId) return

    let cancelled = false
    ;(async () => {
      // The webhook usually lands within seconds. Poll briefly so the customer sees their confirmation number.
      for (let attempt = 0; attempt < 10 && !cancelled; attempt++) {
        const res = await fetch(`/api/wap/order-status?session_id=${encodeURIComponent(sessionId)}`)
        if (res.ok) {
          const data = await res.json()
          if (data.status !== 'awaiting_payment') {
            clear()
            setResult({ kind: 'success', confirmationNumber: data.confirmationNumber, email: data.email })
            return
          }
        }
        await new Promise((r) => setTimeout(r, 1500))
      }
      if (!cancelled) setResult({ kind: 'pending' })
    })()
    return () => {
      cancelled = true
    }
    // Runs once per page load; clear is stable enough for this one-shot read.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const notice = result && (
    <div className={`mt-8 rounded-2xl p-6 ${result.kind === 'success' ? 'bg-wap-green/10' : 'bg-wap-gold/15'}`}>
      {result.kind === 'success' && (
        <>
          <p className="font-display text-2xl">Thank you. Your order is confirmed.</p>
          <p className="mt-2 text-sm">
            Confirmation number <strong className="tracking-wider">{result.confirmationNumber}</strong>. We sent a receipt to {result.email}.
          </p>
        </>
      )}
      {result.kind === 'cancelled' && <p className="text-sm">Checkout was cancelled. Your items are still in your cart.</p>}
      {result.kind === 'pending' && (
        <p className="text-sm">We are still confirming your payment. If you were charged and do not see a confirmation email soon, contact {brand.email}.</p>
      )}
    </div>
  )

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2">
        Skip to content
      </a>
      <Header count={Object.values(cart).reduce((a, b) => a + b, 0)} onCart={() => scrollToId('checkout')} />
      <main id="main">
        <Hero />
        <Story />
        <Shop products={products} loadError={loadError} cart={cart} setQuantity={setQuantity} onReview={() => scrollToId('checkout')} />
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <Checkout products={products} cart={cart} setQuantity={setQuantity} clear={clear} notice={notice} />
        </div>
        <Wholesale />
      </main>
      <Footer />
    </>
  )
}
