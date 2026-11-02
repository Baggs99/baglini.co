import { useEffect } from 'react'
import { siteMeta } from './data/content.js'
import { Home } from './components/Home.jsx'

function App() {
  useEffect(() => {
    document.title = siteMeta.title
    const meta = document.querySelector('meta[name="description"]')
    if (meta) meta.setAttribute('content', siteMeta.description)
  }, [])

  useEffect(() => {
    const hash = window.location.hash.slice(1)
    if (!hash) return

    const scrollToHash = () => {
      const el = document.getElementById(hash)
      if (el) el.scrollIntoView({ behavior: 'auto', block: 'start' })
    }

    scrollToHash()
    requestAnimationFrame(() => {
      requestAnimationFrame(scrollToHash)
    })
    const t1 = setTimeout(scrollToHash, 80)
    const t2 = setTimeout(scrollToHash, 320)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [])

  return (
    <main id="main">
      <Home />
    </main>
  )
}

export default App
