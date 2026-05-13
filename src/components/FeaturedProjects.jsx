import { livePortfolioProjects, projects } from '../data/content.js'
import { Reveal } from './Reveal.jsx'

const ACTION_BUTTONS = [
  { key: 'paperUrl',      label: 'Paper' },
  { key: 'calculatorUrl', label: 'Interactive Map' },
  { key: 'githubUrl',     label: 'GitHub' },
  { key: 'liveUrl',       label: 'Live App' },
]

function ProjectActions({ project }) {
  const buttons = ACTION_BUTTONS.filter(({ key }) => project[key])
  if (buttons.length === 0) return null

  return (
    <div className="mt-8">
      {project.liveUrlNote && (
        <p className="mb-2.5 text-xs text-zinc-600 italic">{project.liveUrlNote}</p>
      )}
      <div className="flex flex-wrap gap-3">
        {buttons.map(({ key, label }) => (
          <a
            key={key}
            href={project[key]}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.10] bg-white/[0.05] px-4 py-2 text-xs font-semibold tracking-wide text-zinc-300 transition duration-150 hover:-translate-y-px hover:border-white/[0.18] hover:bg-white/[0.09] hover:text-zinc-100"
          >
            {label}
            <span aria-hidden="true" className="text-zinc-500">↗</span>
          </a>
        ))}
      </div>
    </div>
  )
}

function LivePortfolioCard({ project, index }) {
  return (
    <Reveal delay={index * 0.05}>
      <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-6 shadow-[0_20px_60px_-28px_rgba(0,0,0,0.75)] transition duration-300 ease-out before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/25 before:to-transparent hover:-translate-y-1 hover:border-white/[0.14] hover:shadow-[0_28px_70px_-24px_rgba(0,0,0,0.85)] md:rounded-3xl md:p-7">
        <span className="inline-flex w-fit rounded-full border border-white/[0.10] bg-white/[0.04] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500 md:text-xs">
          {project.tag}
        </span>
        <h3 className="mt-4 font-display text-lg font-medium tracking-tight text-zinc-50 md:text-xl">
          {project.title}
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-500 md:text-[15px]">
          {project.description}
        </p>
        <a
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex w-fit items-center gap-1.5 rounded-lg border border-white/[0.12] bg-white/[0.06] px-3.5 py-2 text-xs font-semibold tracking-wide text-zinc-200 transition duration-150 group-hover:border-white/[0.22] group-hover:bg-white/[0.10] group-hover:text-white"
        >
          {project.ctaLabel}
          <span aria-hidden="true" className="text-zinc-500 transition group-hover:text-zinc-300">
            ↗
          </span>
        </a>
      </article>
    </Reveal>
  )
}

export function FeaturedProjects() {
  return (
    <section
      id="projects"
      className="border-b border-white/[0.06]"
      aria-labelledby="projects-heading"
    >
      <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-24">
        <Reveal>
          <h2
            id="projects-heading"
            className="font-display text-3xl font-medium tracking-tight text-zinc-50 md:text-4xl"
          >
            Featured projects
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-zinc-500 md:text-base">
            Live sites and selected work across policy, education, technology, and advisory.
          </p>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-5">
          {livePortfolioProjects.map((project, i) => (
            <LivePortfolioCard key={project.id} project={project} index={i} />
          ))}
        </div>

        <div className="mt-10 border-t border-white/[0.06] pt-10 md:mt-12 md:pt-12">
          <h3
            id="projects-more-heading"
            className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600"
          >
            Research & products
          </h3>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {projects.map((project, i) => (
            <Reveal key={project.id} delay={i * 0.06}>
              <article className="group relative flex h-full flex-col rounded-3xl border border-white/[0.07] bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-8 shadow-[0_24px_80px_-32px_rgba(0,0,0,0.65)] transition duration-300 hover:border-white/[0.12] hover:shadow-[0_28px_90px_-28px_rgba(0,0,0,0.75)]">
                <span className="inline-flex w-fit rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium uppercase tracking-wider text-zinc-400">
                  {project.tag}
                </span>
                <h3 className="mt-5 font-display text-xl font-medium tracking-tight text-zinc-50 md:text-2xl">
                  {project.title}
                </h3>
                <p className="mt-3 flex-1 text-[15px] leading-relaxed text-zinc-400">
                  {project.description}
                </p>
                {project.cardNote && (
                  <p className="mt-4 text-xs font-medium text-zinc-600 tracking-wide">{project.cardNote}</p>
                )}
                <ProjectActions project={project} />
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
