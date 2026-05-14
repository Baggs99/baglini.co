import { portfolioFeatured, portfolioOther } from '../data/content.js'
import { Reveal } from './Reveal.jsx'

const visualGradients = {
  indigo:
    'from-indigo-500/[0.22] via-[oklch(0.26_0.09_268_/_0.85)] to-zinc-950',
  teal: 'from-teal-400/[0.18] via-emerald-950/70 to-zinc-950',
  amber: 'from-amber-500/[0.16] via-amber-950/35 to-zinc-950',
  slate: 'from-sky-400/[0.12] via-slate-900/95 to-zinc-950',
  violet: 'from-violet-500/[0.2] via-violet-950/50 to-zinc-950',
  rose: 'from-rose-500/[0.15] via-rose-950/40 to-zinc-950',
}

function VisualFrame({ variant, featured, previewSrc, previewAlt = '' }) {
  const grad = visualGradients[variant] ?? visualGradients.indigo
  const sizeClass = featured
    ? 'min-h-[12.5rem] lg:min-h-[17rem]'
    : previewSrc
      ? 'aspect-[21/11] md:aspect-auto md:h-[10.75rem]'
      : 'aspect-[21/11] md:aspect-auto md:h-36'

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] ${sizeClass}`}>
      {previewSrc ? (
        <>
          <img
            src={previewSrc}
            alt={previewAlt}
            className="absolute inset-0 h-full w-full object-cover object-center transition duration-700 ease-out group-hover/card:scale-[1.045]"
            loading="lazy"
            decoding="async"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-zinc-950/45 via-transparent to-zinc-950/15"
          />
        </>
      ) : (
        <>
          <div
            aria-hidden="true"
            className={`absolute inset-0 scale-100 bg-gradient-to-br bg-zinc-900 transition duration-700 ease-out group-hover/card:scale-[1.04] ${grad}`}
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-[0.22] bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[length:26px_26px]"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-24 -right-24 h-56 w-56 rounded-full bg-white/[0.06] blur-3xl transition duration-700 ease-out group-hover/card:scale-110 group-hover/card:bg-[oklch(0.92_0.02_260_/_0.08)]"
          />
          <div
            aria-hidden="true"
            className="absolute inset-x-8 top-10 h-2 rounded-full bg-white/[0.08] backdrop-blur-sm opacity-70"
          />
        </>
      )}
    </div>
  )
}

function TechTags({ tags }) {
  if (!tags?.length) return null
  return (
    <ul className="mt-4 flex flex-wrap gap-2" aria-label="Topics and tech">
      {tags.map((t) => (
        <li key={t}>
          <span className="inline-block rounded-lg border border-white/[0.08] bg-black/20 px-2.5 py-1 text-[11px] font-medium text-zinc-400 md:text-xs">
            {t}
          </span>
        </li>
      ))}
    </ul>
  )
}

export function FeaturedProjects() {
  return (
    <section
      id="projects"
      className="border-b border-white/[0.06] bg-[oklch(0.115_0.014_260)]"
      aria-labelledby="projects-heading"
    >
      <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-zinc-500">
            Select work
          </p>
          <h2
            id="projects-heading"
            className="mt-3 font-display text-3xl font-medium tracking-tight text-zinc-50 md:text-4xl"
          >
            Products, tools, and research built for real users
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-500 md:text-[15px]">
            Below: live tools, research sites, and products in regular use.
          </p>
        </Reveal>

        <div className="mt-10 space-y-5 md:mt-12 md:space-y-6">
          <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
            Featured projects
          </h3>
          <div className="grid gap-6 lg:gap-8">
            {portfolioFeatured.map((project, i) => (
              <Reveal key={project.id} delay={i * 0.05}>
                <article className="group/card overflow-hidden rounded-[1.65rem] border border-white/[0.065] bg-gradient-to-b from-white/[0.05] to-white/[0.015] shadow-[0_26px_100px_-38px_rgba(0,0,0,0.88)] transition duration-300 ease-out hover:-translate-y-0.5 hover:border-emerald-500/15 hover:shadow-[0_36px_120px_-38px_rgba(0,0,0,0.92)] lg:flex lg:flex-row lg:items-stretch">
                  <div className="p-6 pb-0 lg:flex lg:w-[47%] lg:flex-col lg:justify-center lg:p-10 lg:pr-5 lg:pb-10">
                    <VisualFrame
                      variant={project.visualVariant}
                      featured
                      previewSrc={project.previewSrc}
                      previewAlt={project.previewAlt}
                    />
                  </div>
                  <div className="flex flex-1 flex-col px-6 pb-8 pt-6 lg:p-10 lg:pl-6">
                    <span className="inline-flex w-fit rounded-full border border-white/[0.10] bg-white/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
                      {project.category}
                    </span>
                    <h4 className="mt-5 font-display text-2xl font-medium tracking-tight text-zinc-50 md:text-3xl">
                      {project.title}
                    </h4>
                    <p className="mt-3 flex-1 text-[15px] leading-relaxed text-zinc-400 md:text-[16px]">
                      {project.description}
                    </p>
                    <TechTags tags={project.techTags} />
                    <div className="mt-7 flex flex-wrap items-center gap-3">
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl bg-zinc-100 px-5 py-2.5 text-sm font-semibold text-zinc-950 shadow-[0_0_0_1px_rgba(255,255,255,0.08)] transition hover:bg-white"
                      >
                        {project.ctaPrimary}
                        <span aria-hidden="true" className="text-zinc-600">
                          ↗
                        </span>
                      </a>
                      {project.paperUrl ? (
                        <a
                          href={project.paperUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-xl border border-white/[0.12] bg-white/[0.04] px-5 py-2.5 text-sm font-semibold text-zinc-200 transition hover:border-white/[0.2] hover:bg-white/[0.07]"
                        >
                          {project.ctaSecondary}
                          <span aria-hidden="true" className="text-zinc-500">
                            ↗
                          </span>
                        </a>
                      ) : null}
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>

        <div className="mt-14 border-t border-white/[0.055] pt-12 md:mt-14 md:pt-12">
          <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
            Other projects
          </h3>
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {portfolioOther.map((project, i) => (
              <Reveal key={project.id} delay={i * 0.04}>
                <article className="group/card flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.035] to-white/[0.01] shadow-[0_18px_64px_-32px_rgba(0,0,0,0.78)] transition duration-300 hover:-translate-y-1 hover:border-sky-500/12 hover:shadow-[0_28px_80px_-30px_rgba(0,0,0,0.85)]">
                  <div className="relative overflow-hidden px-5 pb-2 pt-5">
                    <div className="overflow-hidden rounded-xl">
                      <VisualFrame
                        variant={project.visualVariant}
                        featured={false}
                        previewSrc={project.previewSrc}
                        previewAlt={project.previewAlt}
                      />
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col px-6 pb-6 pt-4">
                    <span className="inline-flex w-fit rounded-full border border-white/[0.09] bg-white/[0.03] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                      {project.category}
                    </span>
                    <h4 className="mt-3 font-display text-lg font-medium tracking-tight text-zinc-50 md:text-xl">
                      {project.title}
                    </h4>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-500">{project.description}</p>
                    {project.note ? (
                      <p className="mt-2 text-xs italic text-zinc-600">{project.note}</p>
                    ) : null}
                    <TechTags tags={project.techTags} />
                    <div className="mt-5 flex flex-wrap gap-2">
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/[0.12] bg-white/[0.06] px-4 py-2.5 text-xs font-semibold text-zinc-100 transition hover:border-white/[0.2] hover:bg-white/[0.1] sm:flex-none sm:justify-start"
                      >
                        {project.ctaPrimary}
                        <span aria-hidden="true" className="text-zinc-500">
                          ↗
                        </span>
                      </a>
                      {project.githubUrl ? (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/[0.1] px-4 py-2.5 text-xs font-semibold text-zinc-300 transition hover:border-white/[0.18] hover:bg-white/[0.05]"
                        >
                          {project.ctaGithub}
                          <span aria-hidden="true" className="text-zinc-500">
                            ↗
                          </span>
                        </a>
                      ) : null}
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
