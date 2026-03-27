import { contactLinks } from '../data/content.js'
import { Reveal } from './Reveal.jsx'

export function Contact() {
  return (
    <section
      id="contact"
      className="border-b border-white/[0.06] bg-[oklch(0.125_0.012_260)]"
      aria-labelledby="contact-heading"
    >
      <div className="mx-auto max-w-6xl px-5 py-24 md:px-8 md:py-32">
        <Reveal>
          <h2
            id="contact-heading"
            className="font-display text-3xl font-medium tracking-tight text-zinc-50 md:text-4xl"
          >
            Contact
          </h2>
          <p className="mt-4 max-w-xl text-zinc-500">
            If the work resonates, reach out: collaboration, perspective, or a conversation worth having.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-4 sm:grid-cols-2">
          {contactLinks.map((link, i) => (
            <Reveal key={link.id} delay={i * 0.05}>
              <a
                href={link.href}
                target={link.href.startsWith('http') || link.href.endsWith('.pdf') ? '_blank' : undefined}
                rel={link.href.startsWith('http') || link.href.endsWith('.pdf') ? 'noreferrer noopener' : undefined}
                className="group flex flex-col rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.05] to-transparent p-6 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.8)] transition hover:border-white/[0.14] hover:shadow-[0_24px_70px_-36px_rgba(0,0,0,0.85)]"
              >
                <span className="text-sm font-semibold text-zinc-200">{link.label}</span>
                <span className="mt-1 text-xs text-zinc-500">{link.hint}</span>
                <span className="mt-4 text-xs font-medium uppercase tracking-wider text-zinc-500 transition group-hover:text-zinc-400">
                  Open →
                </span>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
