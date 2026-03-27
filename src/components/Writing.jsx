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

        <Reveal delay={0.1}>
          <div className="mt-14 rounded-2xl border border-white/[0.07] border-dashed bg-white/[0.01] px-8 py-12 text-center">
            <p className="text-sm font-medium uppercase tracking-widest text-zinc-600">Coming soon</p>
            <p className="mt-3 text-zinc-500 text-sm max-w-sm mx-auto">
              Essays and ideas are in progress. Check back soon.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
