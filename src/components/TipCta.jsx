import { tip } from '../data/content.js'
import { Reveal } from './Reveal.jsx'

export function TipCta() {
  return (
    <div className="border-b border-white/[0.06] bg-[oklch(0.115_0.013_260)]">
      <div className="mx-auto max-w-6xl px-5 py-14 md:px-8 md:py-16">
        <Reveal>
          <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-600">
                Support
              </p>
              <p className="mt-1.5 text-[15px] text-zinc-400">
                {tip.body}
              </p>
            </div>
            <a
              href={tip.href}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 inline-flex items-center gap-2 rounded-xl border border-white/[0.10] bg-white/[0.04] px-5 py-2.5 text-sm font-semibold text-zinc-300 transition duration-150 hover:-translate-y-px hover:border-white/[0.18] hover:bg-white/[0.08] hover:text-zinc-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40"
            >
              {tip.ctaLabel}
              <span aria-hidden="true" className="text-zinc-500">↗</span>
            </a>
          </div>
        </Reveal>
      </div>
    </div>
  )
}
