import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { About } from './components/About.jsx'
import { Contact } from './components/Contact.jsx'
import { Experience } from './components/Experience.jsx'
import { FeaturedProjects } from './components/FeaturedProjects.jsx'
import { Footer } from './components/Footer.jsx'
import { Hero } from './components/Hero.jsx'
import { Navbar } from './components/Navbar.jsx'
import { Writing } from './components/Writing.jsx'
import { Workbench } from './pages/Workbench.jsx'

function Home() {
  useEffect(() => {
    const hash = window.location.hash
    if (!hash) return
    const el = document.getElementById(hash.slice(1))
    if (!el) return
    requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
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
      <Footer />
    </>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/workbench" element={<Workbench />} />
    </Routes>
  )
}

export default App
