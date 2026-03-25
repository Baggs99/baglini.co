import { footer, siteMeta } from '../data/content.js'

export function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-[oklch(0.11_0.015_260)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-12 md:flex-row md:items-center md:justify-between md:px-8">
        <p className="text-sm font-medium text-zinc-400">
          © {new Date().getFullYear()} {siteMeta.name}
        </p>
        <p className="text-sm text-zinc-600">{footer.line}</p>
      </div>
    </footer>
  )
}
