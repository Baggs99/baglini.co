import { useEffect } from 'react'
import { siteMeta } from './data/content.js'
import { About } from './components/About.jsx'
import { Contact } from './components/Contact.jsx'
import { Experience } from './components/Experience.jsx'
import { FeaturedProjects } from './components/FeaturedProjects.jsx'
import { Footer } from './components/Footer.jsx'
import { Hero } from './components/Hero.jsx'
import { Navbar } from './components/Navbar.jsx'
import { TipCta } from './components/TipCta.jsx'
import { Writing } from './components/Writing.jsx'

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
      if (el) {
        el.scrollIntoView({ behavior: 'auto', block: 'start' })
      }
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
    <>
      <a href="#main" className="sr-only skip-link">
        Skip to content
      </a>
      <Navbar />
      <main id="main">
        <Hero />
        <About />
        <FeaturedProjects />
        <Experience />
        <Writing />
        <Contact />
      </main>
      <TipCta />
      <Footer />
    </>
  )
}

export default App
