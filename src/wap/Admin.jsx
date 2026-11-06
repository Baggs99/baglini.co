import { useCallback, useEffect, useMemo, useState } from 'react'
import { money } from './cart.js'

const STATUS_LABEL = {
  awaiting_payment: 'Awaiting payment',
  paid: 'New · paid',
  preparing: 'Preparing',
  ready: 'Ready to ship',
  shipped: 'Shipped',
  fulfilled: 'Fulfilled',
  expired: 'Expired',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
}

const STATUS_STYLE = {
  awaiting_payment: 'bg-zinc-100 text-zinc-600',
  paid: 'bg-wap-gold/25 text-[#6e5312]',
  preparing: 'bg-sky-100 text-sky-800',
  ready: 'bg-wap-green/15 text-wap-green',
  shipped: 'bg-indigo-100 text-indigo-800',
  fulfilled: 'bg-zinc-200 text-zinc-700',
  expired: 'bg-zinc-100 text-zinc-500',
  cancelled: 'bg-red-100 text-red-800',
  refunded: 'bg-red-100 text-red-800',
}

// The queue a fulfillment team works through. Everything else is history.
const OPEN = ['paid', 'preparing', 'ready', 'shipped']
const ADVANCE_LABEL = { paid: 'Start preparing', preparing: 'Mark ready to ship', ready: 'Mark shipped', shipped: 'Mark fulfilled' }
const FILTERS = [
  { id: 'open', label: 'Open queue' },
  { id: 'all', label: 'All orders' },
  { id: 'awaiting_payment', label: 'Awaiting payment' },
  { id: 'closed', label: 'Closed' },
]

async function api(path, options = {}) {
  const res = await fetch(`/api/wap/admin${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers ?? {}) },
    body: options.body ? JSON.stringify(options.body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(data.error ?? 'Request failed.')
    err.status = res.status
    throw err
  }
  return data
}

function Login({ onLogin }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  async function submit(e) {
    e.preventDefault()
    setError('')
    try {
      await api('', { method: 'POST', body: { action: 'login', password } })
      onLogin()
    } catch (err) {
      setError(err.message)
    }
  }
  return (
    <div className="flex min-h-screen items-center justify-center bg-wap-navy p-6">
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl">
        <p className="font-display text-2xl text-wap-navy">Order queue</p>
        <p className="mt-1 text-sm text-wap-muted">Staff only.</p>
        <label className="mt-6 block text-sm font-medium">
          Password
          <input
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-wap-navy/20 px-4 py-3 text-sm outline-none focus:border-wap-navy"
          />
        </label>
        {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
        <button type="submit" className="mt-6 w-full rounded-full bg-wap-navy px-6 py-3 text-sm font-semibold text-white hover:bg-wap-navy-deep">
          Log in
        </button>
      </form>
    </div>
  )
}

function OrderCard({ order, onChanged, onError }) {
  const [note, setNote] = useState(order.staff_note ?? '')
  const [busy, setBusy] = useState(false)
  const lines = order.wap_order_items ?? []
  const next = ADVANCE_LABEL[order.status]
  const cancellable = ['paid', 'preparing', 'ready'].includes(order.status)

  async function run(body) {
    setBusy(true)
    try {
      await api('', { method: 'PATCH', body: { type: 'order', id: order.id, ...body } })
      await onChanged()
    } catch (err) {
      onError(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function cancel() {
    const ok = window.confirm(
      `Cancel ${order.confirmation_number} and refund ${money(order.total_cents ?? order.subtotal_cents)}? This cannot be undone.`,
    )
    if (ok) await run({ action: 'cancel', staffNote: note })
  }

  return (
    <article className="rounded-2xl border border-wap-navy/10 bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-sm font-semibold tracking-wider">{order.confirmation_number}</p>
          <p className="text-xs text-wap-muted">
            Placed {new Date(order.created_at).toLocaleString()}
            {order.paid_at && ` · Paid ${new Date(order.paid_at).toLocaleString()}`}
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLE[order.status]}`}>
          {STATUS_LABEL[order.status]}
        </span>
      </div>

      <div className="mt-5 grid gap-6 md:grid-cols-2">
        <div className="text-sm">
          <p className="font-semibold">{order.customer_name}</p>
          <p className="text-wap-muted">
            <a className="underline" href={`mailto:${order.customer_email}`}>{order.customer_email}</a> · {order.customer_phone}
          </p>
          {order.ship_to && (
            <div className="mt-3 rounded-xl bg-wap-cream p-3 text-xs leading-relaxed">
              <p className="font-semibold uppercase tracking-wider text-wap-muted">Ship to</p>
              <p>{order.ship_to.name}</p>
              <p>{[order.ship_to.line1, order.ship_to.line2].filter(Boolean).join(', ')}</p>
              <p>{[order.ship_to.city, order.ship_to.state, order.ship_to.postal_code].filter(Boolean).join(', ')}</p>
            </div>
          )}
        </div>
        <div>
          <ul className="space-y-1 text-sm">
            {lines.map((line) => (
              <li key={line.id} className="flex justify-between gap-4">
                <span>{line.quantity} × {line.name}</span>
                <span className="tabular-nums">{money(line.unit_price_cents * line.quantity)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 flex justify-between border-t border-wap-navy/10 pt-3 text-sm font-semibold">
            <span>Total</span>
            <span className="tabular-nums">{money(order.total_cents ?? order.subtotal_cents)}</span>
          </p>
        </div>
      </div>

      <label className="mt-5 block text-sm font-medium">
        Staff note
        <textarea
          className="mt-1.5 w-full rounded-xl border border-wap-navy/15 px-3 py-2 text-sm outline-none focus:border-wap-navy"
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onBlur={() => note !== (order.staff_note ?? '') && run({ staffNote: note })}
        />
      </label>

      <div className="mt-4 flex flex-wrap gap-2">
        {next && (
          <button
            type="button"
            disabled={busy}
            onClick={() => run({ action: 'advance', staffNote: note })}
            className="rounded-full bg-wap-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-wap-navy-deep disabled:opacity-50"
          >
            {next}
          </button>
        )}
        {cancellable && (
          <button type="button" disabled={busy} onClick={cancel} className="rounded-full border border-red-300 px-5 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50">
            Cancel and refund
          </button>
        )}
      </div>
    </article>
  )
}

function Queue({ orders, onChanged, onError }) {
  const [filter, setFilter] = useState('open')
  const shown = useMemo(() => {
    return orders.filter((o) => {
      if (filter === 'all') return true
      if (filter === 'open') return OPEN.includes(o.status)
      if (filter === 'awaiting_payment') return o.status === 'awaiting_payment'
      return ['fulfilled', 'expired', 'cancelled', 'refunded'].includes(o.status)
    })
  }, [orders, filter])

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`rounded-full px-4 py-2 text-sm font-medium ${filter === f.id ? 'bg-wap-navy text-white' : 'border border-wap-navy/15 hover:border-wap-navy/40'}`}
          >
            {f.label}
          </button>
        ))}
      </div>
      <div className="mt-6 grid gap-4">
        {shown.length === 0 && <p className="text-sm text-wap-muted">No orders here right now.</p>}
        {shown.map((order) => (
          <OrderCard key={order.id} order={order} onChanged={onChanged} onError={onError} />
        ))}
      </div>
    </div>
  )
}

function ProductRow({ product, onSaved, onError }) {
  const [price, setPrice] = useState((product.price_cents / 100).toFixed(2))
  const [stock, setStock] = useState(String(product.stock_on_hand))
  const [active, setActive] = useState(product.active)
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)
    try {
      await api('', {
        method: 'PATCH',
        body: {
          type: 'product',
          sku: product.sku,
          price_cents: Math.round(Number(price) * 100),
          stock_on_hand: Number(stock),
          active,
        },
      })
      await onSaved()
    } catch (err) {
      onError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const dirty =
    Math.round(Number(price) * 100) !== product.price_cents || Number(stock) !== product.stock_on_hand || active !== product.active

  return (
    <tr className="border-t border-wap-navy/10">
      <td className="py-3 pr-4">
        <p className="font-medium">{product.name}</p>
        <p className="text-xs text-wap-muted">{product.sku} · {product.unit}</p>
      </td>
      <td className="py-3 pr-4">
        <input className="w-24 rounded-lg border border-wap-navy/15 px-2 py-1.5 text-sm" value={price} inputMode="decimal" onChange={(e) => setPrice(e.target.value)} aria-label={`Price for ${product.name}`} />
      </td>
      <td className="py-3 pr-4">
        <input className="w-24 rounded-lg border border-wap-navy/15 px-2 py-1.5 text-sm" value={stock} inputMode="numeric" onChange={(e) => setStock(e.target.value)} aria-label={`Stock for ${product.name}`} />
      </td>
      <td className="py-3 pr-4">
        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
          Listed
        </label>
      </td>
      <td className="py-3">
        <button type="button" disabled={!dirty || saving} onClick={save} className="rounded-full bg-wap-navy px-4 py-2 text-xs font-semibold text-white disabled:opacity-40">
          {saving ? 'Saving…' : 'Save'}
        </button>
      </td>
    </tr>
  )
}

function Inventory({ products, onChanged, onError }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-wap-navy/10 bg-white p-6">
      <p className="mb-4 text-sm text-wap-muted">
        Catalog prices come from the storefront until a product database is connected. Purchase orders still track in Stripe; inventory edits need that database.
      </p>
      <table className="w-full text-left text-sm">
        <thead className="text-xs uppercase tracking-wider text-wap-muted">
          <tr>
            <th className="pb-3 pr-4 font-semibold">Product</th>
            <th className="pb-3 pr-4 font-semibold">Price</th>
            <th className="pb-3 pr-4 font-semibold">On hand</th>
            <th className="pb-3 pr-4 font-semibold">Status</th>
            <th className="pb-3" />
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <ProductRow key={`${p.sku}-${p.price_cents}-${p.stock_on_hand}-${p.active}`} product={p} onSaved={onChanged} onError={onError} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Wholesale({ inquiries, onChanged, onError }) {
  async function setStatus(id, status) {
    try {
      await api('', { method: 'PATCH', body: { type: 'wholesale', id, status } })
      await onChanged()
    } catch (err) {
      onError(err.message)
    }
  }
  if (!inquiries.length) return <p className="text-sm text-wap-muted">No wholesale inquiries yet.</p>
  return (
    <div className="grid gap-4">
      {inquiries.map((w) => (
        <article key={w.id} className="rounded-2xl border border-wap-navy/10 bg-white p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-semibold">{w.name}{w.company && <span className="font-normal text-wap-muted"> · {w.company}</span>}</p>
              <p className="text-sm text-wap-muted">
                <a className="underline" href={`mailto:${w.email}`}>{w.email}</a>
                {w.phone && ` · ${w.phone}`}
              </p>
              <p className="mt-1 text-xs text-wap-muted">{new Date(w.created_at).toLocaleString()} · {w.interest}</p>
            </div>
            <select className="rounded-lg border border-wap-navy/15 px-3 py-1.5 text-sm" value={w.status} onChange={(e) => setStatus(w.id, e.target.value)} aria-label="Inquiry status">
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          {w.message && <p className="mt-4 whitespace-pre-line text-sm leading-relaxed">{w.message}</p>}
        </article>
      ))}
    </div>
  )
}

export function Admin() {
  const [authed, setAuthed] = useState(null) // null = checking
  const [data, setData] = useState({ orders: [], products: [], wholesale: [] })
  const [tab, setTab] = useState('queue')
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    try {
      setData(await api(''))
      setAuthed(true)
    } catch (err) {
      if (err.status === 401) setAuthed(false)
      else setError(err.message)
    }
  }, [])

  useEffect(() => {
    refresh()
    // Keep the queue fresh for staff watching it on a second screen.
    const timer = setInterval(() => refresh(), 60_000)
    return () => clearInterval(timer)
  }, [refresh])

  if (authed === null) return <p className="p-10 text-sm text-wap-muted">Loading…</p>
  if (!authed) return <Login onLogin={refresh} />

  const openCount = data.orders.filter((o) => OPEN.includes(o.status)).length
  const tabs = [
    { id: 'queue', label: `Orders (${openCount} open)` },
    { id: 'inventory', label: 'Inventory' },
    { id: 'wholesale', label: `Wholesale (${data.wholesale.filter((w) => w.status === 'new').length} new)` },
  ]

  return (
    <div className="min-h-screen bg-wap-cream">
      <header className="bg-wap-navy text-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-4">
          <p className="font-display text-lg">Purchase orders</p>
          <button
            type="button"
            className="text-sm text-white/70 hover:text-white"
            onClick={async () => {
              await api('', { method: 'POST', body: { action: 'logout' } })
              setAuthed(false)
            }}
          >
            Log out
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-5 py-8">
        <nav className="flex flex-wrap gap-2" aria-label="Staff sections">
          {tabs.map((t) => (
            <button key={t.id} type="button" onClick={() => setTab(t.id)} className={`rounded-full px-4 py-2 text-sm font-medium ${tab === t.id ? 'bg-wap-navy text-white' : 'border border-wap-navy/15 hover:border-wap-navy/40'}`}>
              {t.label}
            </button>
          ))}
        </nav>
        {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
        <div className="mt-6">
          {tab === 'queue' && <Queue orders={data.orders} onChanged={refresh} onError={setError} />}
          {tab === 'inventory' && <Inventory products={data.products} onChanged={refresh} onError={setError} />}
          {tab === 'wholesale' && <Wholesale inquiries={data.wholesale} onChanged={refresh} onError={setError} />}
        </div>
      </main>
    </div>
  )
}
