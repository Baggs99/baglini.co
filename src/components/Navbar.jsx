import { useEffect, useState } from 'react'
import { navLinks, siteMeta } from '../data/content.js'

function scrollToId(id) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export function Navbar() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const onResize = () => {
      if (window.innerWidth >= 768) setOpen(false)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [open])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[oklch(0.12_0.015_260_/_0.85)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 md:px-8">
        <a
          href="#top"
          className="font-display text-lg font-medium tracking-tight text-zinc-100 transition-colors hover:text-white"
          onClick={(e) => {
            e.preventDefault()
            scrollToId('top')
            setOpen(false)
          }}
        >
          {siteMeta.name}
        </a>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          {navLinks.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              className="text-sm font-medium text-zinc-400 transition-colors hover:text-zinc-100"
              onClick={(e) => {
                e.preventDefault()
                scrollToId(link.id)
              }}
            >
              {link.label}
            </a>
          ))}
          <a
            href="/workbench"
            className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-400"
          >
            Workbench
          </a>
        </nav>

        {/* Mobile menu button */}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] p-2.5 text-zinc-200 transition hover:border-white/15 hover:bg-white/[0.06] md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            {open ? (
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            ) : (
              <path
                d="M4 7h16M4 12h16M4 17h16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile panel */}
      {open && (
        <div
          id="mobile-nav"
          className="border-t border-white/[0.06] bg-[oklch(0.11_0.02_260)] px-5 py-5 md:hidden"
        >
          <nav className="flex flex-col gap-1" aria-label="Mobile primary">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                className="rounded-xl px-3 py-3 text-base font-medium text-zinc-200 transition hover:bg-white/[0.05]"
                onClick={(e) => {
                  e.preventDefault()
                  scrollToId(link.id)
                  setOpen(false)
                }}
              >
                {link.label}
              </a>
            ))}
            <a
              href="/workbench"
              className="rounded-xl px-3 py-3 text-base font-medium text-zinc-600 transition hover:bg-white/[0.05] hover:text-zinc-400"
              onClick={() => setOpen(false)}
            >
              Workbench
            </a>
          </nav>
        </div>
      )}
    </header>
  )
}
