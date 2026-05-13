import { honorsThesis, writingSection } from '../data/content.js'
import { Reveal } from './Reveal.jsx'

function ThesisDocumentGlyph({ className = '' }) {
  return (
    <svg
      className={className}
      width="44"
      height="52"
      viewBox="0 0 44 52"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M10 6h17l9 9v31a4 4 0 01-4 4H10a4 4 0 01-4-4V10a4 4 0 014-4z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
        className="text-white/[0.22]"
      />
      <path
        d="M27 6v11h9"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
        className="text-white/[0.22]"
      />
      <path d="M14 26h16M14 32h16M14 38h11" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" className="text-white/[0.14]" />
    </svg>
  )
}

export function Writing() {
  const thesis = honorsThesis

  return (
    <section id="writing" className="border-b border-white/[0.06]" aria-labelledby="writing-heading">
      <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-24">
        <Reveal>
          <h2
            id="writing-heading"
            className="font-display text-3xl font-medium tracking-tight text-zinc-50 md:text-4xl"
          >
            {writingSection.title}
          </h2>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-zinc-500 md:text-base">
            {writingSection.subtitle}
          </p>
        </Reveal>

        <Reveal delay={0.06}>
          <a
            href={thesis.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group/thesis mt-10 block rounded-2xl border border-white/[0.065] bg-[linear-gradient(145deg,rgba(255,255,255,0.045)_0%,rgba(255,255,255,0.012)_48%,transparent_100%)] px-6 py-8 shadow-[0_22px_70px_-36px_rgba(0,0,0,0.82)] outline-none ring-emerald-500/0 transition duration-300 hover:-translate-y-0.5 hover:border-emerald-500/[0.14] hover:shadow-[0_28px_80px_-32px_rgba(0,0,0,0.88)] hover:ring-2 hover:ring-emerald-500/10 focus-visible:ring-2 focus-visible:ring-emerald-400/40 md:rounded-[1.35rem] md:px-10 md:py-10"
          >
            <div className="flex flex-col gap-8 md:flex-row md:gap-12 md:items-start">
              <div
                className="relative mx-auto flex h-[5.25rem] w-[4.25rem] shrink-0 items-center justify-center rounded-xl border border-white/[0.085] bg-gradient-to-br from-[oklch(0.175_0.018_95)] via-white/[0.045] to-white/[0.02] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition duration-300 group-hover/thesis:border-white/[0.13] md:mx-0"
                aria-hidden="true"
              >
                <div className="absolute inset-x-3 top-3 h-px bg-white/[0.08]" />
                <ThesisDocumentGlyph className="text-zinc-400 opacity-90 transition duration-300 group-hover/thesis:text-zinc-300 group-hover/thesis:opacity-100" />
              </div>

              <div className="min-w-0 flex-1 text-center md:text-left">
                <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 md:justify-start">
                  <span className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
                    {thesis.documentType}
                  </span>
                  <span className="hidden text-zinc-700 sm:inline" aria-hidden="true">
                    ·
                  </span>
                  <span className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-600">
                    {thesis.institution}
                  </span>
                </div>

                <p className="mt-3 font-mono text-[12px] tracking-[0.06em] text-zinc-500">
                  {thesis.author}
                </p>

                <h3 className="mt-4 max-w-3xl font-display text-[1.2rem] font-medium leading-snug tracking-tight text-zinc-50 sm:text-[1.35rem] md:text-[1.55rem] md:leading-[1.38]">
                  {thesis.title}
                </h3>

                <ul className="mt-5 flex flex-wrap justify-center gap-2 md:justify-start" aria-label="Research areas">
                  {thesis.subjectTags.map((tag) => (
                    <li key={tag}>
                      <span className="inline-block rounded-md border border-white/[0.07] bg-black/25 px-2.5 py-1 text-[11px] font-medium tracking-wide text-zinc-400 md:text-xs">
                        {tag}
                      </span>
                    </li>
                  ))}
                </ul>

                <p className="mt-5 max-w-3xl text-sm leading-relaxed text-zinc-400 md:text-[15px] md:leading-relaxed">
                  {thesis.description}
                </p>

                <p className="mt-5 font-mono text-[11px] leading-relaxed text-zinc-600">{thesis.archiveNote}</p>

                <span className="mt-8 inline-flex items-center gap-2 rounded-xl border border-white/[0.12] bg-white/[0.06] px-5 py-2.5 text-sm font-semibold tracking-wide text-zinc-100 transition duration-200 group-hover/thesis:border-white/[0.22] group-hover/thesis:bg-white/[0.09] md:mt-9">
                  {thesis.ctaLabel}
                  <span aria-hidden="true" className="text-zinc-500 transition group-hover/thesis:text-zinc-300">
                    ↗
                  </span>
                </span>
                <span className="sr-only"> Opens in new tab.</span>
              </div>
            </div>
          </a>
        </Reveal>

        <Reveal delay={0.12}>
          <div className="mt-10 rounded-2xl border border-dashed border-white/[0.06] bg-white/[0.015] px-6 py-10 text-center md:mt-12 md:px-10">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-600">Essays & memos</p>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-zinc-500">
              Shorter pieces on institutions and technology are in progress. Check back soon.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
