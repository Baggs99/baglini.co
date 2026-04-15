import { footer, siteMeta, tip } from '../data/content.js'

export function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-[oklch(0.11_0.015_260)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-12 md:flex-row md:items-center md:justify-between md:px-8">
        <p className="text-sm font-medium text-zinc-400">
          © {new Date().getFullYear()} {siteMeta.name}
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
          <a
            href={tip.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-zinc-600 transition hover:text-zinc-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40"
          >
            Leave a tip ↗
          </a>
          <p className="text-sm text-zinc-600">{footer.line}</p>
        </div>
      </div>
    </footer>
  )
}
