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
            A concise arc: service, study, and strategy — with discipline carried
            across each chapter.
          </p>
        </Reveal>

        <div className="relative mt-16 md:mt-20">
          {/* Vertical line — desktop */}
          <div
            className="absolute left-[11px] top-2 hidden h-[calc(100%-1rem)] w-px bg-gradient-to-b from-white/25 via-white/10 to-transparent md:block"
            aria-hidden="true"
          />

          <ol className="space-y-12 md:space-y-14">
            {experience.map((item, i) => (
              <Reveal key={item.id} delay={i * 0.08}>
                <li className="relative md:pl-12">
                  <span
                    className="absolute left-0 top-1.5 hidden h-2.5 w-2.5 rounded-full border border-white/30 bg-zinc-900 shadow-[0_0_0_4px_oklch(0.12_0.015_260)] md:block"
                    aria-hidden="true"
                  />
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
                    <div>
                      <h3 className="font-display text-lg font-medium text-zinc-100 md:text-xl">
                        {item.title}
                      </h3>
                      <p className="text-sm text-zinc-500">{item.subtitle}</p>
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      {item.period}
                    </span>
                  </div>
                  <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-zinc-400">
                    {item.summary}
                  </p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
