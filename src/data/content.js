/**
 * Site copy & links — edit this file to update text across the homepage.
 * Arrays drive project cards, timeline, writing previews, and contact buttons.
 */

export const siteMeta = {
  name: 'Dan Baglini',
  /** Shown in browser tab + SEO */
  title: 'Dan Baglini: Strategy, Policy & Technology',
  description:
    'U.S. Army veteran and Yale SOM student focused on strategy, technology, education, housing, and public leadership.',
}

/** Main navigation: label + hash id of section (must match section id in App) */
export const navLinks = [
  { label: 'About', id: 'about' },
  { label: 'Projects', id: 'projects' },
  { label: 'Experience', id: 'experience' },
  { label: 'Writing', id: 'writing' },
  { label: 'Contact', id: 'contact' },
]

export const hero = {
  headline: 'Dan Baglini',
  subheadline:
    'Veteran. Builder. Yale SOM. I work at the intersection of strategy, technology, and policy, turning complex problems into clear direction.',
  /** Primary / secondary CTAs — href can be #section or external URL */
  primaryCta: { label: 'View Projects', href: '#projects' },
  secondaryCta: { label: 'Contact Me', href: '#contact' },
}

export const about = {
  title: 'About',
  paragraphs: [
    'I am a U.S. Army veteran and student at the Yale School of Management, driven by a belief that good institutions need both rigor and imagination. My work sits where strategy meets execution: clarifying tradeoffs, aligning stakeholders, and shipping outcomes that hold up in the real world.',
    'I care deeply about technology, education, housing, and public leadership: not as abstractions, but as levers that shape who gets opportunity and how systems perform under pressure.',
  ],
}

/** Featured work — swap titles, tags, and href when you have live URLs */
export const projects = [
  {
    id: 'ri-schools',
    title: 'Rhode Island School District Consolidation',
    description:
      'Examines whether Rhode Island should consolidate its school districts, using real enrollment, budget, and geographic data to model cost savings, transportation tradeoffs, and structural feasibility across scenarios.',
    cardNote: 'Policy paper + interactive map tool',
    tag: 'Policy & education',
    paperUrl: '/rhode-island-school-consolidation-paper.pdf',
    calculatorUrl: 'https://calc.baglini.co',
  },
  {
    id: 'elc-outreach',
    title: 'Education Leadership Conference Outreach',
    description:
      'Built an AI-assisted system for generating personalized outreach emails at scale. Designed to drive conference attendance without sacrificing tone, relevance, or credibility.',
    tag: 'Outreach & strategy',
    liveUrl: 'https://elc.baglini.co',
    liveUrlNote: 'May take a few seconds to wake up on first load.',
    githubUrl: 'https://github.com/Baggs99/ELC-Mass-Email-Sender',
  },
]

/** Experience — order is top-to-bottom (newest first if you prefer; reorder as needed) */
export const experience = [
  {
    id: 'yale',
    period: 'Present',
    title: 'Yale School of Management',
    subtitle: 'MBA Candidate',
    detail: 'Strategy, policy, and organizational leadership',
    summary:
      'MBA candidate focused on strategy and decision-making under uncertainty, with an emphasis on public-sector and institutional challenges.',
  },
  {
    id: 'consulting',
    period: 'Ongoing',
    title: 'Consulting & Strategy',
    subtitle: 'Advisory and project-based work',
    detail: 'Policy analysis, stakeholder alignment, product strategy',
    summary:
      'Advisory and project-based work focused on structuring ambiguous problems, aligning stakeholders, and translating analysis into executable plans.',
  },
  {
    id: 'army',
    period: 'Prior',
    title: 'U.S. Army: Leadership & Intelligence',
    subtitle: 'Platoon Leader · Intelligence Officer · 173rd Airborne Brigade',
    summary:
      'Led intelligence teams in international operations, delivering decision-critical analysis and coordinating across U.S. and allied partners in high-stakes environments.',
  },
]

/** Writing / ideas — replace href with Medium, Substack, or PDF links later */
export const articles = [
  {
    id: 'a1',
    title: 'Institutions Under Strain',
    description:
      'Notes on credibility, delivery, and what it takes to earn trust when stakes are high and attention is short.',
    href: '#',
  },
  {
    id: 'a2',
    title: 'Technology as Leverage, Not Decoration',
    description:
      'A short memo on where digital tools actually change outcomes — and where they only add noise.',
    href: '#',
  },
  {
    id: 'a3',
    title: 'Housing and Opportunity',
    description:
      'Framing questions for policymakers who want affordability without surrendering long-term resilience.',
    href: '#',
  },
]

/**
 * Contact — replace # placeholders with real URLs and mailto:
 * Example email: href: 'mailto:you@example.com'
 */
export const contactLinks = [
  {
    id: 'linkedin',
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/daniel-baglini/',
    hint: 'Professional profile',
  },
  {
    id: 'email',
    label: 'Email',
    href: 'mailto:dan.baglini@yale.edu',
    hint: 'Direct line',
  },
  {
    id: 'resume',
    label: 'Resume',
    href: '/Baglini Resume Yale Format.pdf',
    hint: 'PDF download',
  },
  {
    id: 'github',
    label: 'GitHub',
    href: 'https://github.com/Baggs99',
    hint: 'Code & projects',
  },
]

export const footer = {
  line: 'Built with intention. Open to meaningful work.',
}
