import { motion } from 'framer-motion'
import { hero } from '../data/content.js'

function scrollTo(href) {
  if (href.startsWith('#')) {
    const id = href.slice(1)
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      if (history.replaceState) {
        history.replaceState(null, '', `${window.location.pathname}${window.location.search}#${encodeURIComponent(id)}`)
      }
    }
  }
}

export function Hero() {
  return (
    <section
      id="top"
      className="relative overflow-hidden border-b border-white/[0.06]"
      aria-labelledby="hero-heading"
    >
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,oklch(0.35_0.08_250_/_0.35),transparent)]"
          animate={{ opacity: [0.32, 0.42, 0.32] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_100%_50%,oklch(0.28_0.06_260_/_0.2),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_0%_80%,oklch(0.3_0.05_200_/_0.15),transparent)]" />
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
            backgroundSize: '64px 64px',
          }}
        />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-6xl px-5 pb-14 pt-[4.75rem] md:px-8 md:pb-20 md:pt-[5.5rem]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">
            {hero.eyebrow}
          </p>
          <h1
            id="hero-heading"
            className="max-w-4xl font-display text-4xl font-medium leading-[1.1] tracking-tight text-zinc-50 sm:text-5xl md:text-[2.85rem]"
          >
            {hero.headline}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-zinc-400 md:text-lg">
            {hero.subheadline}
          </p>

          <div className="mt-10 flex flex-col gap-3.5 sm:mt-12 sm:flex-row sm:items-center">
            <a
              href={hero.primaryCta.href}
              onClick={(e) => {
                if (hero.primaryCta.href.startsWith('#')) {
                  e.preventDefault()
                  scrollTo(hero.primaryCta.href)
                }
              }}
              className="inline-flex items-center justify-center rounded-2xl bg-zinc-100 px-8 py-3.5 text-sm font-semibold text-zinc-950 shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_12px_40px_-12px_rgba(0,0,0,0.5)] transition hover:bg-white hover:shadow-[0_0_0_1px_rgba(255,255,255,0.12),0_16px_48px_-12px_rgba(0,0,0,0.55)]"
            >
              {hero.primaryCta.label}
            </a>
            <a
              href={hero.secondaryCta.href}
              onClick={(e) => {
                if (hero.secondaryCta.href.startsWith('#')) {
                  e.preventDefault()
                  scrollTo(hero.secondaryCta.href)
                }
              }}
              className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] px-8 py-3.5 text-sm font-semibold text-zinc-100 transition hover:border-white/18 hover:bg-white/[0.06]"
            >
              {hero.secondaryCta.label}
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
