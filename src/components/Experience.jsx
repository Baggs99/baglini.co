import { experience } from '../data/content.js'
import { Reveal } from './Reveal.jsx'

export function Experience() {
  return (
    <section
      id="experience"
      className="border-b border-white/[0.06] bg-[oklch(0.125_0.012_260)]"
      aria-labelledby="experience-heading"
    >
      <div className="mx-auto max-w-6xl px-5 py-24 md:px-8 md:py-32">
        <Reveal>
          <h2
            id="experience-heading"
            className="font-display text-3xl font-medium tracking-tight text-zinc-50 md:text-4xl"
          >
            Experience
          </h2>
          <p className="mt-4 max-w-xl text-zinc-500">
            Service, study, and strategy. Discipline carried across each chapter.
          </p>
        </Reveal>

        <div className="relative mt-16 md:mt-20">
          {/* Vertical line — desktop */}
          <div
            className="absolute left-[11px] top-2 hidden h-[calc(100%-1rem)] w-px bg-gradient-to-b from-white/30 via-white/15 to-transparent md:block"
            aria-hidden="true"
          />

          <ol className="space-y-10 md:space-y-12">
            {experience.map((item, i) => (
              <Reveal key={item.id} delay={i * 0.08}>
                <li className="group relative md:pl-12">
                  {/* Timeline dot */}
                  <span
                    className="absolute left-0 top-2 hidden h-[11px] w-[11px] rounded-full border border-white/40 bg-zinc-800 shadow-[0_0_0_3px_oklch(0.125_0.012_260),0_0_8px_rgba(255,255,255,0.06)] transition duration-200 group-hover:border-white/60 group-hover:shadow-[0_0_0_3px_oklch(0.125_0.012_260),0_0_12px_rgba(255,255,255,0.12)] md:block"
                    aria-hidden="true"
                  />

                  {/* Card */}
                  <div className="rounded-2xl border border-transparent p-5 transition duration-150 group-hover:-translate-y-px group-hover:border-white/[0.07] group-hover:bg-white/[0.02] md:p-6">
                    <div className="flex flex-col gap-1.5 sm:flex-row sm:items-baseline sm:justify-between">
                      <div>
                        <h3 className="font-display text-lg font-medium text-zinc-100 md:text-xl">
                          {item.title}
                        </h3>
                        <p className="mt-0.5 text-sm text-zinc-500">{item.subtitle}</p>
                      </div>
                      <span className="shrink-0 text-xs font-semibold uppercase tracking-wider text-zinc-600">
                        {item.period}
                      </span>
                    </div>
                    {item.detail && (
                      <p className="mt-2 text-xs font-medium tracking-wide text-zinc-600">{item.detail}</p>
                    )}
                    <p className="mt-3 max-w-2xl text-[15px] leading-[1.75] text-zinc-400">
                      {item.summary}
                    </p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
