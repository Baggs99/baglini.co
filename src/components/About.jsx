import { about } from '../data/content.js'
import { Reveal } from './Reveal.jsx'

export function About() {
  return (
    <section
      id="about"
      className="border-b border-white/[0.06] bg-[oklch(0.125_0.012_260)]"
      aria-labelledby="about-heading"
    >
      <div className="mx-auto max-w-6xl px-5 py-14 md:px-8 md:py-20">
        <Reveal>
          <h2
            id="about-heading"
            className="font-display text-3xl font-medium tracking-tight text-zinc-50 md:text-4xl"
          >
            {about.title}
          </h2>
          <div className="mt-8 max-w-3xl space-y-5 text-base leading-relaxed text-zinc-400 md:mt-10 md:text-lg">
            {about.paragraphs.map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
