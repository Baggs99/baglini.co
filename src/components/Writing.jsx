import { articles } from '../data/content.js'
import { Reveal } from './Reveal.jsx'

export function Writing() {
  return (
    <section id="writing" className="border-b border-white/[0.06]" aria-labelledby="writing-heading">
      <div className="mx-auto max-w-6xl px-5 py-24 md:px-8 md:py-32">
        <Reveal>
          <h2
            id="writing-heading"
            className="font-display text-3xl font-medium tracking-tight text-zinc-50 md:text-4xl"
          >
            Writing & ideas
          </h2>
          <p className="mt-4 max-w-2xl text-zinc-500">
            Essays, memos, and short pieces on institutions, technology, and the
            work of leading in public.
          </p>
        </Reveal>

        <ul className="mt-14 grid gap-5 md:grid-cols-3">
          {articles.map((article, i) => (
            <Reveal key={article.id} delay={i * 0.07}>
              <li>
                <a
                  href={article.href}
                  className="block h-full rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 transition hover:border-white/[0.14] hover:bg-white/[0.04]"
                >
                  <h3 className="font-display text-lg font-medium leading-snug text-zinc-100">
                    {article.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-500">{article.description}</p>
                  <span className="mt-5 inline-block text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Read
                  </span>
                </a>
              </li>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}
