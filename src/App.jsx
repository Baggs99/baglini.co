import { About } from './components/About.jsx'
import { Contact } from './components/Contact.jsx'
import { Experience } from './components/Experience.jsx'
import { FeaturedProjects } from './components/FeaturedProjects.jsx'
import { Footer } from './components/Footer.jsx'
import { Hero } from './components/Hero.jsx'
import { Navbar } from './components/Navbar.jsx'
import { Writing } from './components/Writing.jsx'

/**
 * Single-page layout — section order matches `navLinks` in src/data/content.js.
 * To add a section: create a component, import it here, and add a matching nav entry + id.
 */
function App() {
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

export default App
