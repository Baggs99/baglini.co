import { about } from '../data/content.js'
import { Reveal } from './Reveal.jsx'

export function About() {
  return (
    <section
      id="about"
      className="border-b border-white/[0.06] bg-[oklch(0.125_0.012_260)]"
      aria-labelledby="about-heading"
    >
      <div className="mx-auto max-w-6xl px-5 py-24 md:px-8 md:py-32">
        <Reveal>
          <h2
            id="about-heading"
            className="font-display text-3xl font-medium tracking-tight text-zinc-50 md:text-4xl"
          >
            {about.title}
          </h2>
          <div className="mt-10 max-w-3xl space-y-6 text-lg leading-relaxed text-zinc-400">
            {about.paragraphs.map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
