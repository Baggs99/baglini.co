import { useEffect, useRef, useState } from 'react'
import '../styles/home.css'
import {
  about,
  contactLinks,
  experience,
  honorsThesis,
  portfolioFeatured,
  portfolioOther,
  tip,
} from '../data/content.js'

const projects = [...portfolioFeatured, ...portfolioOther.filter((project) => !project.hidden)]
const headlineLines = ['I get', 'computers', 'talking to', 'each other.']
const ledeCopy =
  'Former Army intelligence officer and Yale SOM MBA candidate, building tools, games, and research in public policy and applied technology.'

const email = contactLinks.find((link) => link.id === 'email')
const resume = contactLinks.find((link) => link.id === 'resume')
const footerLinks = contactLinks.filter((link) => link.id !== 'email' && link.id !== 'resume')

function shortName(title) {
  return title.split(' ').slice(0, 2).join(' ')
}

export function Home() {
  const [current, setCurrent] = useState(0)
  const stripRef = useRef(null)
  const stageRef = useRef(null)
  const tileRef = useRef(null)
  const project = projects[current]

  // Keep the selected thumbnail centred in the strip
  useEffect(() => {
    const strip = stripRef.current
    const button = strip?.children[current]
    if (!strip || !button) return
    strip.scrollTo({ left: button.offsetLeft - (strip.clientWidth - button.offsetWidth) / 2, behavior: 'smooth' })
  }, [current])

  useEffect(() => {
    function onKey(event) {
      if (event.key === 'ArrowRight') setCurrent((n) => Math.min(projects.length - 1, n + 1))
      if (event.key === 'ArrowLeft') setCurrent((n) => Math.max(0, n - 1))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  function onPointerMove(event) {
    const rect = stageRef.current.getBoundingClientRect()
    const tile = tileRef.current
    tile.style.setProperty('--ry', `${((event.clientX - rect.left) / rect.width - 0.5) * 18}deg`)
    tile.style.setProperty('--rx', `${-((event.clientY - rect.top) / rect.height - 0.5) * 14}deg`)
  }

  function onPointerLeave() {
    tileRef.current.style.setProperty('--rx', '0deg')
    tileRef.current.style.setProperty('--ry', '0deg')
  }

  let offset = 0
  const headline = headlineLines.map((line) => {
    const base = offset
    offset += line.length
    return (
      <span className="home-line" key={line} aria-hidden="true">
        {[...line].map((ch, ci) => (
          <span
            className="home-letter"
            key={ci}
            style={{ animationDelay: `${(base + ci) * 28 + 150}ms` }}
          >
            {ch === ' ' ? ' ' : ch}
          </span>
        ))}
      </span>
    )
  })

  return (
    <div className="home">
      <header className="home-header">
        <a href="#top" id="top">Dan Baglini</a>
        <nav className="home-nav" aria-label="Primary">
          <a href="#work">Work</a>
          <a href="#about">About</a>
          <a href="#experience">Experience</a>
          <a href="#writing">Writing</a>
          <a href="#contact">Contact</a>
        </nav>
      </header>

      <section className="home-hero" aria-labelledby="home-headline">
        <div>
          <h1 className="home-h1" id="home-headline" aria-label="I get computers talking to each other.">
            {headline}
          </h1>
          <p className="home-kicker home-rise" style={{ animationDelay: '0.8s' }}>
            Shipped, not just sketched.
          </p>
          <p className="home-lede home-rise" style={{ animationDelay: '0.9s' }}>
            {ledeCopy}
          </p>
          <div className="home-cta home-rise" style={{ animationDelay: '1s' }}>
            <a className="home-btn home-btn--solid" href={email.href}>
              Email Dan
            </a>
            <a className="home-btn" href={resume.href}>
              Resume
            </a>
          </div>
        </div>
        <div className="home-stage" ref={stageRef} onPointerMove={onPointerMove} onPointerLeave={onPointerLeave}>
          <img className="home-tile" ref={tileRef} src="/sprites/5-talk-animated.svg" alt="" />
        </div>
        <span className="home-hero-credit">Eads Bridge, C.N. Dry, 1875 · Library of Congress</span>
      </section>

      <section className="home-section home-rise" id="work" style={{ animationDelay: '0.5s' }}>
        <h2 className="home-section-head">
          Selected work
          <span>
            {String(current + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}
          </span>
        </h2>
        <div className="home-screen">
          <div className="home-shot">
            {projects.map((item, index) => (
              <img
                key={item.id}
                src={item.previewSrc}
                alt={item.previewAlt}
                className={index === current ? 'on' : undefined}
              />
            ))}
          </div>
          <div className="home-cap">
            <div>
              <p className="home-category">{project.category}</p>
              <h3>{project.title}</h3>
              <p className="home-desc">{project.description}</p>
              <div className="home-tags">
                {project.techTags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </div>
            <div className="home-actions">
              <a className="home-go" href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                {project.ctaPrimary}
              </a>
              {project.paperUrl ? (
                <a className="home-sublink" href={project.paperUrl} target="_blank" rel="noopener noreferrer">
                  {project.ctaSecondary}
                </a>
              ) : project.githubUrl ? (
                <a className="home-sublink" href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                  {project.ctaGithub}
                </a>
              ) : null}
            </div>
          </div>
        </div>
        <div className="home-strip" ref={stripRef} role="group" aria-label="Projects">
          {projects.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className={`home-thumb${index === current ? ' on' : ''}`}
              onClick={() => setCurrent(index)}
              aria-pressed={index === current}
            >
              <img src={item.previewSrc} alt="" />
              <span>{shortName(item.title)}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="home-section home-about home-rise" id="about" style={{ animationDelay: '0.2s' }}>
        <h2 className="home-section-head">About</h2>
        {about.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </section>

      <section className="home-section" id="experience">
        <h2 className="home-section-head">Experience</h2>
        <ol className="home-pins">
          {experience.map((item) => (
            <li className="home-pin" key={item.id}>
              <p className="home-when">{item.period}</p>
              <h3>{item.title}</h3>
              <p className="home-sub">{item.subtitle}</p>
              {item.detail ? <p>{item.detail}</p> : null}
              <p>{item.summary}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="home-section" id="writing">
        <h2 className="home-section-head">Writing</h2>
        <article className="home-thesis">
          <p className="home-when">{honorsThesis.documentType}</p>
          <h3>{honorsThesis.title}</h3>
          <p>
            {honorsThesis.author}. {honorsThesis.institution}.
          </p>
          <p>{honorsThesis.description}</p>
          <div className="home-tags">
            {honorsThesis.subjectTags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
          <p>{honorsThesis.archiveNote}</p>
          <a className="home-go" href={honorsThesis.href} target="_blank" rel="noopener noreferrer">
            {honorsThesis.ctaLabel}
          </a>
        </article>
      </section>

      <footer className="home-footer" id="contact">
        <div className="home-contact">
          <a href={email.href}>{email.href.replace('mailto:', '')}</a>
          <a href={resume.href}>Resume</a>
          {footerLinks.map((link) => (
            <a key={link.id} href={link.href} target="_blank" rel="noopener noreferrer">
              {link.label}
            </a>
          ))}
        </div>
        <div className="home-foot-row">
          <p>© {new Date().getFullYear()} Dan Baglini</p>
          <a href={tip.href} target="_blank" rel="noopener noreferrer">
            {tip.ctaLabel}
          </a>
        </div>
      </footer>
    </div>
  )
}
