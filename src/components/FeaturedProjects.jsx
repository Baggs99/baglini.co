import { projects } from '../data/content.js'
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

export function FeaturedProjects() {
  return (
    <section
      id="projects"
      className="border-b border-white/[0.06]"
      aria-labelledby="projects-heading"
    >
      <div className="mx-auto max-w-6xl px-5 py-24 md:px-8 md:py-32">
        <Reveal>
          <h2
            id="projects-heading"
            className="font-display text-3xl font-medium tracking-tight text-zinc-50 md:text-4xl"
          >
            Featured projects
          </h2>
          <p className="mt-4 max-w-2xl text-zinc-500">
            Selected work spanning policy, education, technology, and advisory — each
            built for clarity under constraint.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-2">
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
                <ProjectActions project={project} />
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
