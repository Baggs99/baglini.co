import { useRef } from 'react'
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
const reachLinks = ['email', 'linkedin', 'github']
  .map((id) => contactLinks.find((link) => link.id === id))
  .filter(Boolean)

function ReachIcon({ id }) {
  if (id === 'email') {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <rect x="5" y="10" width="38" height="28" fill="none" stroke="currentColor" strokeWidth="2.4" />
        <path d="M7 14l17 13L41 14" fill="none" stroke="currentColor" strokeWidth="2.4" />
      </svg>
    )
  }
  if (id === 'linkedin') {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <rect x="6" y="6" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="2.4" />
        <path
          d="M16 21.5V33M16 15.5h.02M23 33v-6.8a4 4 0 018 0V33M23 21.5V33"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 .5A11.5 11.5 0 0 0 .5 12.3c0 5.2 3.4 9.6 8.1 11.2.6.1.8-.3.8-.6v-2.1c-3.3.7-4-1.6-4-1.6-.5-1.4-1.3-1.7-1.3-1.7-1.1-.8.1-.8.1-.8 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.6-.3-5.4-1.3-5.4-6 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.6.1-3.2 0 0 1-.3 3.3 1.2a11.4 11.4 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.6.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.7-2.8 5.7-5.4 6 .4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6 4.7-1.6 8.1-6 8.1-11.2A11.5 11.5 0 0 0 12 .5Z"
      />
    </svg>
  )
}

export function Home() {
  const stageRef = useRef(null)
  const tileRef = useRef(null)

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
        <h2 className="home-section-head">Selected work</h2>
        <div className="home-shelf">
          {projects.map((item) => {
            const extraHref = item.paperUrl || item.githubUrl
            const extraLabel = item.paperUrl ? item.ctaSecondary : item.ctaGithub
            return (
              <article className="home-video" key={item.id}>
                <a className="home-video-thumb" href={item.liveUrl} target="_blank" rel="noopener noreferrer">
                  {item.previewSrc ? (
                    <img src={item.previewSrc} alt={item.previewAlt || ''} />
                  ) : (
                    <span className="home-video-fallback" aria-hidden="true" />
                  )}
                  <span className="home-video-badge">{item.ctaPrimary}</span>
                </a>
                <div className="home-video-body">
                  <span className="home-video-mark" aria-hidden="true">DB</span>
                  <div>
                    <h3>
                      <a href={item.liveUrl} target="_blank" rel="noopener noreferrer">
                        {item.title}
                      </a>
                    </h3>
                    <p className="home-video-by">Dan Baglini · {item.category}</p>
                    <p className="home-video-desc">{item.description}</p>
                    {extraHref ? (
                      <a className="home-sublink" href={extraHref} target="_blank" rel="noopener noreferrer">
                        {extraLabel}
                      </a>
                    ) : null}
                  </div>
                </div>
              </article>
            )
          })}
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

      <section className="home-section home-contact-section" id="contact" aria-labelledby="contact-heading">
        <h2 className="home-section-head" id="contact-heading">
          Contact
        </h2>
        <div className="home-contact-grid">
          <a className="home-resume" href={resume.href} target="_blank" rel="noopener noreferrer">
            <img src="/images/resume-preview.png" alt="Preview of Dan Baglini's one-page resume" />
            <span>Open resume</span>
          </a>
          <div className="home-reach">
            {reachLinks.map((link) => (
              <a
                key={link.id}
                className="home-reach-link"
                href={link.href}
                target={link.href.startsWith('http') ? '_blank' : undefined}
                rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              >
                <ReachIcon id={link.id} />
                <span>
                  <span className="home-reach-label">{link.label}</span>
                  <span className="home-reach-hint">{link.id === 'email' ? email.href.replace('mailto:', '') : link.hint}</span>
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <footer className="home-footer">
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
