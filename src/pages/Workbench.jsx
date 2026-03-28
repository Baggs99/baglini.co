import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

// Change this to whatever password you want
const WORKBENCH_PASSWORD = 'baglini2025'
const SESSION_KEY = 'wb_auth'

export function Workbench() {
  const [authed, setAuthed] = useState(
    () => sessionStorage.getItem(SESSION_KEY) === 'true'
  )
  const [input, setInput] = useState('')
  const [error, setError] = useState(false)

  useEffect(() => {
    document.title = 'Workbench — Dan Baglini'
    return () => { document.title = 'Dan Baglini: Strategy, Policy & Technology' }
  }, [])

  function handleSubmit(e) {
    e.preventDefault()
    if (input === WORKBENCH_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, 'true')
      setAuthed(true)
      setError(false)
    } else {
      setError(true)
      setInput('')
    }
  }

  if (!authed) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[oklch(0.12_0.015_260)] px-5">
        <div className="w-full max-w-sm">
          <Link
            to="/"
            className="mb-10 inline-block text-xs font-semibold uppercase tracking-widest text-zinc-600 transition hover:text-zinc-400"
          >
            ← Back
          </Link>
          <h1 className="font-display text-3xl font-medium tracking-tight text-zinc-50">
            Workbench
          </h1>
          <p className="mt-2 text-sm text-zinc-500">Password required.</p>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-3">
            <input
              type="password"
              value={input}
              onChange={(e) => { setInput(e.target.value); setError(false) }}
              placeholder="Enter password"
              autoFocus
              className="w-full rounded-xl border border-white/[0.10] bg-white/[0.04] px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition focus:border-white/[0.22] focus:bg-white/[0.06]"
            />
            {error && (
              <p className="text-xs text-red-400">Incorrect password. Try again.</p>
            )}
            <button
              type="submit"
              className="rounded-xl bg-zinc-100 px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-white"
            >
              Enter
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[oklch(0.12_0.015_260)]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[oklch(0.12_0.015_260_/_0.85)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 md:px-8">
          <span className="font-display text-lg font-medium tracking-tight text-zinc-100">
            Workbench
          </span>
          <div className="flex items-center gap-4">
            <button
              onClick={() => { sessionStorage.removeItem(SESSION_KEY); setAuthed(false) }}
              className="text-xs font-medium text-zinc-600 transition hover:text-zinc-400"
            >
              Lock
            </button>
            <Link
              to="/"
              className="text-sm font-medium text-zinc-400 transition hover:text-zinc-100"
            >
              ← Site
            </Link>
          </div>
        </div>
      </header>

      {/* Content area — drop project experiments here */}
      <main className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
        <p className="text-sm text-zinc-600 italic">
          Nothing here yet. Add project experiments below.
        </p>
      </main>
    </div>
  )
}
