import { useEffect, useMemo, useState } from 'react'
import { brand, categories, palmCatalogProducts, palmVolumes, pillars, priceGuides, productFamilies, recipes, wholesale } from './content.js'
import { MAX_QTY, cartLines, cartTotalCents, money, useCart } from './cart.js'
import { PALM_FAMILY_SHOTS, packShotFor, packShotForSizeLabel } from './media.js'

const AVAILABILITY = {
  in_stock: { label: 'In stock', className: 'text-wap-leaf' },
  low: { label: 'Few left', className: 'text-[#9a6b0c]' },
  sold_out: { label: 'Sold out', className: 'text-wap-ink/45' },
}

const HERO_IMAGE =
  'https://images.pexels.com/photos/34220615/pexels-photo-34220615.jpeg?auto=compress&cs=tinysrgb&w=1800'

function mergeCommerceProducts(apiProducts) {
  const bySku = liveProductMap(apiProducts)
  const palm = palmCatalogProducts.map((catalog) => ({
    ...catalog,
    ...(bySku[catalog.sku] ?? {}),
    sku: catalog.sku,
    category: 'palm-oil',
    sort_order: catalog.sort_order,
    availability: bySku[catalog.sku]?.availability ?? catalog.availability,
  }))
  const rest = (apiProducts ?? []).filter((product) => product.category !== 'palm-oil')
  return [...palm, ...rest]
}

const HERO_PROOF = [
  'Sourced from small farm holders',
  'Mechanically filtered for clean flavor',
  'Ships from Houston. Shipping calculated at checkout.',
]

const PALM_USE_CASES = ['Stews and soups', 'Frying and sauteing', 'Sauces and rice dishes']

const EDUCATION_CARDS = [
  {
    eyebrow: 'Why West African Produce',
    title: 'Red palm oil should taste like origin, not warehouse.',
    body: 'West African Produce focuses on crude natural red palm oil sourced from small farm holders, then mechanically filtered for quality before packaging.',
  },
  {
    eyebrow: 'How to use it',
    title: 'Cook hot, finish rich, build deeper color.',
    body: 'Use palm oil for stews, soups, frying, sauces, jollof-style rice, beans, greens, and recipes where color and body matter.',
  },
  {
    eyebrow: 'Retail or wholesale',
    title: 'Buy one gallon today. Ask for pallets when shelves need supply.',
    body: 'Retail shoppers can buy online immediately. Wholesale buyers can ask about 60-case pallets, private labels, and case pricing.',
  },
  {
    eyebrow: 'From farm to Houston',
    title: 'A simpler route for West African staples.',
    body: 'The catalog spans oils, smoked fish, frozen greens, and spices, with sourcing and shipping details made clear before checkout.',
  },
]

function scrollToId(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

async function readJson(res) {
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body.error ?? 'Something went wrong. Please try again.')
  return body
}

// The one memorable object on the page: a gallon of palm oil, drawn to match the label on the shelf.
function PalmBottle({ className = '', sizeLabel = '1 GALLON' }) {
  return (
    <svg viewBox="0 0 300 420" className={className} role="img" aria-label={`Organic red palm oil, ${sizeLabel.toLowerCase()}`}>
      <defs>
        <linearGradient id="palmOilFill" x1="75" x2="230" y1="96" y2="410" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E45B23" />
          <stop offset="0.72" stopColor="#B93216" />
          <stop offset="1" stopColor="#8B2515" />
        </linearGradient>
        <linearGradient id="labelPaper" x1="65" x2="238" y1="170" y2="338" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFF8E7" />
          <stop offset="1" stopColor="#F0DFC0" />
        </linearGradient>
      </defs>
      <ellipse cx="151" cy="393" rx="85" ry="18" fill="#091426" opacity="0.18" />
      <rect x="112" y="18" width="76" height="46" rx="8" fill="#14213A" />
      <rect x="100" y="60" width="100" height="34" rx="6" fill="#14213A" />
      <path d="M100 94 C 60 110, 44 150, 44 200 L 44 372 C 44 396, 60 406, 84 406 L 216 406 C 240 406, 256 396, 256 372 L 256 200 C 256 150, 240 110, 200 94 Z" fill="url(#palmOilFill)" />
      <path d="M84 126 C 66 147, 62 176, 62 216 L 62 354 C 62 378, 75 389, 97 389" fill="none" stroke="#F3843D" strokeWidth="15" strokeLinecap="round" opacity="0.28" />
      <rect x="62" y="170" width="176" height="164" rx="16" fill="url(#labelPaper)" />
      <path d="M82 188 H218" stroke="#E3A92B" strokeWidth="5" strokeLinecap="round" />
      <text x="150" y="216" textAnchor="middle" fontFamily="Fraunces, serif" fontWeight="600" fontSize="13" fill="#1F1610" letterSpacing="1.6">WEST AFRICAN</text>
      <text x="150" y="240" textAnchor="middle" fontFamily="Fraunces, serif" fontWeight="700" fontSize="22" fill="#1F1610">PRODUCE</text>
      <text x="150" y="268" textAnchor="middle" fontFamily="Figtree, sans-serif" fontWeight="600" fontSize="12" fill="#1F1610" letterSpacing="2">ORGANIC RED</text>
      <text x="150" y="286" textAnchor="middle" fontFamily="Figtree, sans-serif" fontWeight="600" fontSize="12" fill="#1F1610" letterSpacing="2">PALM OIL</text>
      <path d="M92 304 Q 150 288 208 304" stroke="#C08A2A" strokeWidth="5" fill="none" strokeLinecap="round" />
      <text x="150" y="326" textAnchor="middle" fontFamily="Figtree, sans-serif" fontWeight="700" fontSize="12" fill="#1F1610">{sizeLabel}</text>
    </svg>
  )
}

// ---------- Header ----------

function Header({ count }) {
  const links = [
    { id: 'catalog', label: 'Catalog' },
    { id: 'shop', label: 'Shop' },
    { id: 'wholesale', label: 'Wholesale' },
    { id: 'recipes', label: 'Recipes' },
    { id: 'contact', label: 'Contact' },
  ]
  return (
    <header className="sticky top-0 z-40 border-b border-wap-ink/10 bg-wap-paper/92 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-4 md:px-10">
        <a href="#top" className="inline-flex items-center gap-3 font-display text-xl font-semibold tracking-tight text-wap-ink">
          <span className="wap-mark">W</span>
          <span>West African Produce</span>
        </a>
        <nav className="hidden items-center gap-7 text-[15px] text-wap-ink md:flex" aria-label="Primary">
          {links.map((link) => (
            <a key={link.id} href={`#${link.id}`} className="text-wap-ink/70 underline-offset-4 hover:text-wap-ink hover:underline" onClick={() => scrollToId(link.id)}>
              {link.label}
            </a>
          ))}
        </nav>
        <a href="#checkout" onClick={() => scrollToId('checkout')} className="wap-btn wap-btn-ink min-h-10 px-4 py-2 text-sm">
          Cart ({count})
        </a>
      </div>
    </header>
  )
}

// ---------- Hero ----------

function PackShot({ product, src, alt = '', size = 'sm', decorative = true }) {
  const image = src ?? packShotFor(product)
  if (!image) return null
  return (
    <span className={`wap-pack wap-pack-${size}`} aria-hidden={decorative ? 'true' : undefined}>
      <img src={image} alt={decorative ? '' : alt} />
    </span>
  )
}

function HeroOption({ product, selected, onSelect }) {
  const badge = AVAILABILITY[product.availability] ?? AVAILABILITY.in_stock
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={`wap-size-option ${selected ? 'is-selected' : ''}`}
    >
      <PackShot product={product} size="sm" />
      <span>
        <span className="block text-xs font-extrabold uppercase tracking-[0.18em]">{product.unit}</span>
        <span className="mt-1 block font-display text-2xl font-extrabold tabular-nums">{money(product.price_cents)}</span>
        <span className={`mt-1 block text-xs font-bold ${selected ? 'text-wap-ink/70' : badge.className}`}>{badge.label}</span>
      </span>
    </button>
  )
}

function liveProductMap(products) {
  return Object.fromEntries((products ?? []).map((product) => [product.sku, product]))
}

function packOption(volume, pack, liveBySku) {
  const sku = pack === 'case' ? volume.caseSku : volume.sku
  const catalog = palmCatalogProducts.find((product) => product.sku === sku)
  const live = liveBySku[sku]
  return {
    ...catalog,
    ...live,
    sku,
    pack,
    volumeId: volume.id,
    availability: live?.availability ?? catalog?.availability ?? 'in_stock',
  }
}

function Hero({ products, cart, setQuantity, onReview, loadError }) {
  const liveBySku = useMemo(() => liveProductMap(products), [products])
  const [volumeId, setVolumeId] = useState('1gal')
  const [pack, setPack] = useState('single')
  const [draftQty, setDraftQty] = useState(1)

  const volume = palmVolumes.find((item) => item.id === volumeId) ?? palmVolumes[3]
  const packs = useMemo(
    () => [
      packOption(volume, 'single', liveBySku),
      packOption(volume, 'case', liveBySku),
    ],
    [volume, liveBySku],
  )
  const selectedProduct = packs.find((item) => item.pack === pack) ?? packs[0]
  const canBuy = Boolean(selectedProduct?.sku && selectedProduct.availability !== 'sold_out')
  const inCart = selectedProduct?.sku && canBuy ? (cart[selectedProduct.sku] ?? 0) : 0
  const lineTotal = selectedProduct ? selectedProduct.price_cents * draftQty : 0

  function addSelected() {
    if (!canBuy) return
    setQuantity(selectedProduct.sku, Math.min(MAX_QTY, inCart + Math.max(1, draftQty)))
  }

  return (
    <section id="top" className="wap-hero">
      <div className="wap-hero-stage">
        <img
          src={HERO_IMAGE}
          alt="Palm trees and a tin-roofed dwelling in West Africa"
          className="wap-hero-photo"
          decoding="async"
          fetchPriority="high"
        />
        <div className="wap-hero-veil" />
        <div className="wap-hero-content">
          <div className="wap-hero-product wap-rise">
            <PalmBottle className="wap-gallon" sizeLabel={volume.bottleLabel} />
          </div>

          <div className="wap-buy wap-rise-delay">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-wap-palm">Organic red palm oil</p>
                <h1>Natural red palm oil.</h1>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-wap-muted">From Sierra Leone small farm holders. For stews, frying, soups, and sauces.</p>
              </div>
              {inCart > 0 && (
                <button type="button" onClick={onReview} className="wap-btn wap-btn-ink min-h-10 px-4 py-2 text-sm">
                  Review {inCart} in cart
                </button>
              )}
            </div>

            <div className="wap-volume mt-5" role="radiogroup" aria-label="Volume size">
              {palmVolumes.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="radio"
                  aria-checked={item.id === volume.id}
                  className={item.id === volume.id ? 'is-selected' : ''}
                  onClick={() => setVolumeId(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <p className="mt-3 font-display text-3xl font-bold tabular-nums" aria-live="polite">
              {money(selectedProduct?.price_cents ?? 0)}
              <span className="ml-2 align-middle text-sm font-sans font-semibold text-wap-muted">
                {pack === 'case' ? selectedProduct?.unit : `each · ${volume.unit}`}
              </span>
            </p>

            <div className="mt-4 grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Bottle or case">
              {packs.map((product) => (
                <HeroOption key={`${product.volumeId}-${product.pack}`} product={product} selected={product.pack === pack} onSelect={() => setPack(product.pack)} />
              ))}
            </div>

            {loadError && (
              <p className="mt-3 border-l-2 border-wap-gold bg-wap-gold/15 p-3 text-sm font-medium text-wap-ink">
                Preview inventory shown. Live prices come from our inventory when the API is available.
              </p>
            )}

            <div className="mt-5 grid gap-3 sm:grid-cols-[auto_1fr] sm:items-center">
              <div className="wap-qty" role="group" aria-label="Quantity">
                <button type="button" onClick={() => setDraftQty((q) => Math.max(1, q - 1))} disabled={draftQty === 1} aria-label="Decrease quantity">−</button>
                <span className="w-8 text-center font-semibold tabular-nums" aria-live="polite">{draftQty}</span>
                <button type="button" onClick={() => setDraftQty((q) => Math.min(MAX_QTY, q + 1))} disabled={draftQty >= MAX_QTY} aria-label="Increase quantity">+</button>
              </div>
              <button type="button" onClick={addSelected} disabled={!canBuy} className="wap-btn">
                {!canBuy ? 'Sold out' : `Add ${money(lineTotal)}`}
              </button>
            </div>

            <p className="mt-4 text-sm font-medium text-wap-ink/80">Use it for {PALM_USE_CASES.join(', ')}.</p>
            <button type="button" onClick={() => scrollToId('catalog')} className="mt-3 text-sm font-semibold text-wap-ink underline underline-offset-4 hover:text-wap-palm">
              View our full catalog
            </button>
          </div>
        </div>
      </div>
      <div className="wap-rule" />
      <div className="wap-proof-bar">
        {HERO_PROOF.map((note) => (
          <p key={note}>{note}</p>
        ))}
      </div>
      <div className="wap-wholesale-bar">
        <div>
          <p className="font-display text-2xl font-semibold tracking-tight md:text-3xl">Need cases or pallets?</p>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-wap-paper/75">
            Restaurants, grocers, and distributors can order pallets, cases, and private labels. A palm oil pallet holds 60 cases, with 4 gallons in each case.
          </p>
        </div>
        <button type="button" onClick={() => scrollToId('wholesale')} className="wap-btn wap-btn-gold self-start">
          Start wholesale inquiry
        </button>
      </div>
    </section>
  )
}

// ---------- Catalog ----------

function Catalog() {
  return (
    <section id="catalog" className="bg-wap-paper">
      <div className="mx-auto max-w-6xl px-5 py-14 md:px-10 md:py-20">
        <div className="wap-shelf-head">
          <div>
            <p className="text-sm font-semibold text-wap-palm">The pantry</p>
            <h2 className="mt-3 max-w-3xl font-display text-4xl font-semibold tracking-tight md:text-6xl">Oils first. Then the rest of the kitchen.</h2>
          </div>
          <button type="button" onClick={() => scrollToId('shop')} className="wap-btn self-start md:self-auto">
            Shop available products
          </button>
        </div>

        <div className="wap-pantry-shelf mt-10">
          {productFamilies.map((family) => (
            <article key={family.title} className="wap-shelf-row">
              <div className="wap-shelf-label">
                <p>{family.eyebrow}</p>
                <h3>{family.title}</h3>
              </div>
              <p className="wap-shelf-copy">{family.body}</p>
              {family.title === 'Oils' ? (
                <div className="wap-pack-rail">
                  {PALM_FAMILY_SHOTS.map((pack) => (
                    <figure key={pack.label} className="wap-pack-figure">
                      <PackShot src={pack.src} alt={pack.alt} size="md" decorative={false} />
                      <figcaption>{pack.label}</figcaption>
                    </figure>
                  ))}
                </div>
              ) : (
                <div className="wap-shelf-tags">
                  {family.items.slice(0, 4).map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

// ---------- Story ----------

function Story() {
  return (
    <section id="story" className="bg-wap-paper">
      <div className="mx-auto max-w-6xl px-5 py-20 md:px-10 md:py-28">
      <div className="grid gap-12 md:grid-cols-[0.95fr_1.05fr]">
        <p className="text-sm font-semibold text-wap-palm md:col-span-2">Our farms</p>
        <h2 className="font-display text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
          Grown by farmers who sell to their neighbors.
        </h2>
        <div className="border-l-2 border-wap-palm pl-6 text-lg leading-relaxed text-wap-ink/80 md:pl-8">
          <p>
            We bring West African flavors to market while supporting small-scale farmers and their families. Our palm oil is pressed from fruit grown on smallholder farms in Sierra Leone.
          </p>
          <p className="mt-5">Thank you for choosing West African Produce. We look forward to serving you.</p>
        </div>
      </div>
      <div className="mt-16 grid gap-4 md:grid-cols-3">
        {pillars.map((pillar) => (
          <div key={pillar.title} className="border-t border-wap-ink/20 pt-5">
            <h3 className="font-display text-2xl font-semibold">{pillar.title}</h3>
            <p className="mt-3 leading-relaxed text-wap-ink/75">{pillar.body}</p>
          </div>
        ))}
      </div>
      </div>
    </section>
  )
}

// ---------- Shop ----------

function ProductRow({ product, quantity, onQuantity }) {
  const soldOut = product.availability === 'sold_out'
  const badge = AVAILABILITY[product.availability] ?? AVAILABILITY.in_stock
  const categoryLabel = categories.find((c) => c.id === product.category)?.label ?? 'Pantry'
  const shot = packShotFor(product)
  return (
    <li className={`grid items-center gap-5 border-b border-wap-ink/15 py-6 md:gap-8 ${shot ? 'md:grid-cols-[auto_1fr_auto_auto]' : 'md:grid-cols-[1fr_auto_auto]'}`}>
      <PackShot product={product} size="md" />
      <div>
        <p className="text-sm font-semibold text-wap-palm">{categoryLabel}</p>
        <h3 className="font-display text-2xl font-semibold leading-tight">{product.name}</h3>
        <p className="mt-1 text-sm text-wap-ink/65">
          {product.unit}
          <span className={`ml-3 font-semibold ${badge.className}`}>{badge.label}</span>
        </p>
        {product.description && <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-wap-ink/75">{product.description}</p>}
      </div>
      <p className="font-display text-2xl font-bold tabular-nums">{money(product.price_cents)}</p>
      {soldOut ? (
        <p className="text-sm text-wap-ink/60">Email us to be told when it returns.</p>
      ) : (
        <div className="flex items-center gap-3">
          <div className="wap-qty" role="group" aria-label={`Quantity for ${product.name}`}>
            <button type="button" className="h-10 w-10 text-lg font-bold disabled:opacity-30" onClick={() => onQuantity(quantity - 1)} disabled={quantity === 0} aria-label="Decrease quantity">−</button>
            <span className="w-7 text-center text-sm font-semibold tabular-nums" aria-live="polite">{quantity}</span>
            <button type="button" className="h-10 w-10 text-lg font-bold disabled:opacity-30" onClick={() => onQuantity(quantity + 1)} disabled={quantity >= MAX_QTY} aria-label="Increase quantity">+</button>
          </div>
          <button type="button" onClick={() => onQuantity(Math.max(1, quantity))} className="wap-btn min-h-10 px-5 py-2 text-sm">
            {quantity > 0 ? 'Added' : 'Add'}
          </button>
        </div>
      )}
    </li>
  )
}

function Shop({ products, loadError, cart, setQuantity, onReview }) {
  const [category, setCategory] = useState('all')
  const visible = useMemo(() => (products ?? []).filter((p) => category === 'all' || p.category === category), [products, category])
  const itemCount = Object.values(cart).reduce((a, b) => a + b, 0)

  return (
    <section id="shop" className="mx-auto max-w-6xl px-5 py-20 md:px-10 md:py-28">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold text-wap-palm">Shop</p>
          <h2 className="mt-3 font-display text-5xl font-semibold tracking-tight md:text-7xl">Order online</h2>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-wap-ink/70">
            Use this live inventory area for customer checkout. The catalog above handles the broader product story and case pricing.
          </p>
        </div>
        {itemCount > 0 && (
          <button type="button" onClick={onReview} className="wap-btn wap-btn-ink self-start text-sm md:self-auto">
            Review order ({itemCount})
          </button>
        )}
      </div>

      <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2 border-b border-wap-ink/15 pb-4" role="tablist" aria-label="Product categories">
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-selected={category === c.id}
            onClick={() => setCategory(c.id)}
            className={`text-base font-semibold pb-2 -mb-[17px] border-b-2 ${category === c.id ? 'border-wap-palm text-wap-ink' : 'border-transparent text-wap-ink/55 hover:text-wap-ink'}`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {loadError && <p className="mt-8 border-l-4 border-red-600 bg-red-50 p-4 text-sm text-red-800">{loadError}</p>}
      {!products.length && !loadError && <p className="mt-10 text-wap-ink/60">Loading products…</p>}

      <ul className="mt-8 grid gap-4">
        {visible.map((product) => (
          <ProductRow key={product.sku} product={product} quantity={cart[product.sku] ?? 0} onQuantity={(q) => setQuantity(product.sku, q)} />
        ))}
      </ul>
    </section>
  )
}

// ---------- Education ----------

function EducationStack() {
  return (
    <section id="why-wap" className="bg-wap-paper px-5 py-16 md:px-10 md:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold text-wap-palm">Why West African Produce</p>
          <h2 className="mt-3 font-display text-5xl font-semibold leading-[0.98] tracking-tight md:text-7xl">
            Proof after the buy button.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-wap-ink/70">
            The shopping path stays fast. These cards answer the questions customers ask once they are curious about origin, usage, and wholesale.
          </p>
        </div>

        <div className="wap-stack mt-12">
          {EDUCATION_CARDS.map((card, index) => (
            <article key={card.title} className="wap-stack-card" style={{ '--stack-index': index }}>
              <p className="text-sm font-semibold text-wap-gold">{card.eyebrow}</p>
              <h3 className="mt-4 max-w-3xl font-display text-4xl font-semibold leading-none tracking-tight md:text-6xl">{card.title}</h3>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-wap-cream/78">{card.body}</p>
            </article>
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
          body: JSON.stringify({ items: lines.map((l) => ({ sku: l.sku, quantity: l.quantity })), customer }),
        }),
      )
      // Card details never touch this site. Stripe's hosted page takes payment and the shipping address.
      window.location.assign(body.url)
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  const field = 'mt-2 w-full border-b-2 border-wap-ink bg-transparent px-1 py-3 text-base outline-none focus:border-wap-palm'

  return (
    <section id="checkout" className="bg-wap-paper">
      <div className="mx-auto max-w-6xl px-5 py-20 md:px-10 md:py-28">
        <p className="text-sm font-semibold text-wap-palm">Checkout</p>
        <h2 className="mt-3 font-display text-5xl font-semibold tracking-tight md:text-7xl">Your order</h2>
        {notice}

        {lines.length === 0 ? (
          <p className="mt-10 text-lg text-wap-ink/70">
            Nothing in your order yet.{' '}
            <button type="button" className="font-bold text-wap-ink underline underline-offset-4" onClick={() => scrollToId('shop')}>
              Go to the shop
            </button>
          </p>
        ) : (
          <div className="mt-12 grid gap-12 lg:grid-cols-[1.1fr_1fr]">
            <div>
              <ul className="divide-y divide-wap-ink/15 border-y border-wap-ink/15">
                {lines.map((line) => (
                  <li key={line.sku} className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <PackShot product={line} size="sm" />
                      <div>
                        <p className="font-display text-xl font-bold">{line.name}</p>
                        <p className="text-sm text-wap-ink/60">{line.unit} · {money(line.price_cents)} each</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
                      <div className="wap-qty">
                        <button type="button" className="h-8 w-8 font-bold" onClick={() => setQuantity(line.sku, line.quantity - 1)} aria-label={`Decrease ${line.name}`}>−</button>
                        <span className="w-6 text-center text-sm font-bold tabular-nums">{line.quantity}</span>
                        <button type="button" className="h-8 w-8 font-bold disabled:opacity-30" onClick={() => setQuantity(line.sku, line.quantity + 1)} disabled={line.quantity >= MAX_QTY} aria-label={`Increase ${line.name}`}>+</button>
                      </div>
                      <span className="min-w-20 text-right font-bold tabular-nums">{money(line.price_cents * line.quantity)}</span>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <button type="button" onClick={clear} className="text-sm font-semibold text-wap-ink/70 underline underline-offset-4 hover:text-wap-ink">
                  Clear order
                </button>
                <p className="sm:text-right">
                  <span className="block text-sm text-wap-ink/60">Subtotal. Shipping is added at payment.</span>
                  <span className="font-display text-4xl font-extrabold tabular-nums">{money(total)}</span>
                </p>
              </div>
            </div>

            <form onSubmit={submit} className="space-y-6" noValidate>
              <label className="block text-sm font-bold">
                Full name
                <input className={field} required autoComplete="name" value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} />
              </label>
              <label className="block text-sm font-bold">
                Email
                <input className={field} type="email" required autoComplete="email" value={customer.email} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} />
              </label>
              <label className="block text-sm font-bold">
                Phone
                <input className={field} type="tel" required autoComplete="tel" value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} />
              </label>
              <p className="text-sm leading-relaxed text-wap-ink/70">
                Next you will pay on Stripe&apos;s secure page, where you also enter your shipping address. We email your confirmation number and receipt.
              </p>
              {error && <p role="alert" className="border-l-4 border-red-600 bg-red-50 p-4 text-sm text-red-800">{error}</p>}
              <button type="submit" disabled={submitting} className="wap-btn w-full py-5 text-lg disabled:opacity-60">
                {submitting ? 'Opening payment…' : `Pay ${money(total)}`}
              </button>
            </form>
          </div>
        )}
      </div>
    </section>
  )
}

// ---------- Recipes ----------

function Recipes() {
  return (
    <section id="recipes" className="bg-wap-navy px-5 py-16 text-wap-paper md:px-10 md:py-24">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-semibold text-wap-gold">Recipes</p>
        <h2 className="mt-3 max-w-3xl font-display text-5xl font-semibold leading-[0.98] tracking-tight md:text-7xl">Cook with what you just bought.</h2>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-wap-paper/75">
          Ground Nut Soup and Plassas show how these oils, smoked fish, greens, and spices work together in the pot.
        </p>

        <div className="mt-12 grid gap-10 md:grid-cols-2">
          {recipes.map((recipe) => (
            <article key={recipe.title} className="border-t border-wap-paper/20 pt-6">
              <h3 className="font-display text-3xl font-semibold">{recipe.title}</h3>
              <p className="mt-4 leading-relaxed text-wap-paper/75">{recipe.body}</p>
              <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-sm font-semibold">
                {recipe.ingredients.map((ingredient) => (
                  <span key={ingredient}>{ingredient}</span>
                ))}
              </div>
              <button type="button" onClick={() => scrollToId('shop')} className="wap-btn wap-btn-gold mt-7 text-sm">
                Shop ingredients
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

// ---------- Wholesale ----------

function WholesaleSection() {
  const [form, setForm] = useState({ name: '', company: '', email: '', phone: '', interest: wholesale.interests[0], message: '' })
  const [status, setStatus] = useState({ kind: '', message: '' })
  const [submitting, setSubmitting] = useState(false)
  const field = 'mt-2 w-full border border-wap-paper/25 bg-transparent px-3 py-3 text-base text-wap-paper outline-none placeholder:text-wap-paper/40 focus:border-wap-gold'

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function submit(e) {
    e.preventDefault()
    setSubmitting(true)
    setStatus({ kind: '', message: '' })
    try {
      await readJson(
        await fetch('/api/wap/wholesale', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        }),
      )
      setStatus({ kind: 'success', message: 'Thanks. We will follow up about case, pallet, or private-label pricing.' })
      setForm({ name: '', company: '', email: '', phone: '', interest: wholesale.interests[0], message: '' })
    } catch (err) {
      setStatus({ kind: 'error', message: err.message })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section id="wholesale" className="bg-wap-ink px-5 py-16 text-wap-paper md:px-10 md:py-24">
      <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="text-sm font-semibold text-wap-gold">Wholesale</p>
          <h2 className="mt-3 font-display text-5xl font-semibold leading-[0.98] tracking-tight md:text-6xl">A serious path for bigger buyers.</h2>
          <p className="mt-6 leading-relaxed text-wap-paper/76">
            {wholesale.intro} {wholesale.palletNote}
          </p>
          <div className="mt-7 grid gap-3 text-sm font-semibold text-wap-paper/80 sm:grid-cols-2">
            {['Pallet orders', 'Case programs', 'Private labels', 'Texas + DC metro'].map((item) => (
              <p key={item} className="border-t border-wap-paper/20 pt-3">{item}</p>
            ))}
          </div>
          <div className="mt-8 border-t border-wap-paper/20 pt-5">
            <p className="text-sm font-semibold text-wap-gold">Case pricing guide</p>
            <div className="mt-4 space-y-3">
              {priceGuides[0].rows.map(([name, qty, oneCase, volume]) => (
                <div key={`${name}-${qty}`} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 border-t border-wap-cream/12 pt-3 text-sm">
                  <PackShot src={packShotForSizeLabel(name)} alt={name} size="xs" decorative={false} />
                  <div>
                    <p className="font-bold">{name}</p>
                    <p className="text-wap-cream/55">{qty}</p>
                  </div>
                  <p className="text-right tabular-nums">
                    {oneCase}
                    <span className="block text-wap-gold">{volume}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <form onSubmit={submit} className="border border-wap-paper/20 p-5 md:p-6" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-bold">
              Name
              <input className={field} required autoComplete="name" value={form.name} onChange={(e) => update('name', e.target.value)} />
            </label>
            <label className="block text-sm font-bold">
              Company
              <input className={field} autoComplete="organization" value={form.company} onChange={(e) => update('company', e.target.value)} />
            </label>
            <label className="block text-sm font-bold">
              Email
              <input className={field} required type="email" autoComplete="email" value={form.email} onChange={(e) => update('email', e.target.value)} />
            </label>
            <label className="block text-sm font-bold">
              Phone
              <input className={field} type="tel" autoComplete="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} />
            </label>
          </div>
          <label className="mt-4 block text-sm font-bold">
            Interest
            <select className={field} value={form.interest} onChange={(e) => update('interest', e.target.value)}>
              {wholesale.interests.map((interest) => (
                <option key={interest} value={interest} className="text-wap-ink">
                  {interest}
                </option>
              ))}
            </select>
          </label>
          <label className="mt-4 block text-sm font-bold">
            Message
            <textarea className={`${field} min-h-32 resize-y`} value={form.message} onChange={(e) => update('message', e.target.value)} placeholder="Tell us about order volume, location, private-label needs, or timeline." />
          </label>
          {status.message && (
            <p role="alert" className={`mt-4 p-4 text-sm font-semibold ${status.kind === 'success' ? 'bg-wap-leaf text-wap-paper' : 'bg-red-100 text-red-900'}`}>
              {status.message}
            </p>
          )}
          <button type="submit" disabled={submitting} className="wap-btn wap-btn-gold mt-5 w-full disabled:opacity-60">
            {submitting ? 'Sending inquiry…' : 'Send wholesale inquiry'}
          </button>
        </form>
      </div>
    </section>
  )
}

// ---------- Footer ----------

function Footer() {
  return (
    <footer id="contact" className="bg-wap-ink text-wap-cream/80">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 md:grid-cols-3 md:px-10">
        <div>
          <p className="font-display text-2xl font-semibold text-wap-cream">West African Produce</p>
          <p className="mt-3 leading-relaxed">
            {brand.address.map((line) => (
              <span key={line} className="block">{line}</span>
            ))}
          </p>
        </div>
        <div>
          <p className="font-bold text-wap-cream">Email</p>
          <a href={`mailto:${brand.email}`} className="mt-3 block underline underline-offset-4 hover:text-wap-cream">{brand.email}</a>
        </div>
        <div>
          <p className="font-bold text-wap-cream">Follow</p>
          <div className="mt-3 flex flex-col gap-2">
            <a href={brand.instagram} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-wap-cream">Instagram</a>
            <a href={brand.facebook} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-wap-cream">Facebook</a>
          </div>
        </div>
      </div>
      <p className="mx-auto max-w-6xl border-t border-wap-cream/15 px-5 py-6 text-sm text-wap-cream/55 md:px-10">
        © {new Date().getFullYear()} {brand.name}. Payments are processed by Stripe.
      </p>
    </footer>
  )
}

// ---------- Page ----------

export function Storefront() {
  const [products, setProducts] = useState([])
  const [loadError, setLoadError] = useState('')
  const { cart, setQuantity, clear } = useCart()
  const [result, setResult] = useState(null)

  useEffect(() => {
    fetch('/api/wap/products')
      .then(readJson)
      .then((data) => {
        if (!Array.isArray(data.products)) throw new Error('Product inventory is not available in this preview.')
        setProducts(data.products)
      })
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
    // One-shot read of the URL on page load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const notice = result && (
    <div className={`mt-10 border-l-4 p-6 ${result.kind === 'success' ? 'border-wap-leaf bg-wap-leaf/10' : 'border-wap-gold bg-wap-gold/15'}`}>
      {result.kind === 'success' && (
        <>
          <p className="font-display text-3xl font-extrabold">Your order is confirmed.</p>
          <p className="mt-2">
            Confirmation number <strong className="tracking-wider">{result.confirmationNumber}</strong>. We sent a receipt to {result.email}.
          </p>
        </>
      )}
      {result.kind === 'cancelled' && <p>Payment was cancelled. Your order is still here.</p>}
      {result.kind === 'pending' && (
        <p>We are still confirming your payment. If you were charged and no confirmation email arrives soon, write to {brand.email}.</p>
      )}
    </div>
  )
  const commerceProducts = mergeCommerceProducts(products)

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2">
        Skip to content
      </a>
      <Header count={Object.values(cart).reduce((a, b) => a + b, 0)} />
      <main id="main">
        <Hero products={commerceProducts} cart={cart} setQuantity={setQuantity} onReview={() => scrollToId('checkout')} loadError={loadError} />
        <Catalog />
        <Shop products={commerceProducts} loadError={loadError} cart={cart} setQuantity={setQuantity} onReview={() => scrollToId('checkout')} />
        {/* Only show the order section when there is something to review or a payment result to report. */}
        {(Object.keys(cart).length > 0 || result) && (
          <Checkout products={commerceProducts} cart={cart} setQuantity={setQuantity} clear={clear} notice={notice} />
        )}
        <EducationStack />
        <Recipes />
        <Story />
        <WholesaleSection />
      </main>
      <Footer />
    </>
  )
}
