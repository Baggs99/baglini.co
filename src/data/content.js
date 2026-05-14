/**
 * Site copy & links — edit this file to update text across the homepage.
 */

export const siteMeta = {
  name: 'Dan Baglini',
  title: 'Dan Baglini: Portfolio · Policy, AI & Education Products',
  description:
    'Yale SOM MBA, former Army intelligence officer. Interactive tools, research platforms, AI systems, and web products.',
}

export const navLinks = [
  { label: 'About', id: 'about' },
  { label: 'Projects', id: 'projects' },
  { label: 'Experience', id: 'experience' },
  { label: 'Writing', id: 'writing' },
  { label: 'Contact', id: 'contact' },
]

export const hero = {
  eyebrow: 'YALE SOM · PUBLIC POLICY · APPLIED TECHNOLOGY',
  headline: 'Building tools at the intersection of policy, education, and technology.',
  subheadline:
    "I'm Daniel Baglini, a Yale SOM MBA and former Army intelligence officer. I build interactive tools, research platforms, and web applications that make complex ideas easier to understand.",
  primaryCta: { label: 'View projects', href: '#projects' },
  secondaryCta: { label: 'Contact', href: '#contact' },
}

export const about = {
  title: 'About',
  paragraphs: [
    'I combine executive-level judgment with builder execution: translating messy problems into usable products that institutions and users can rely on.',
    'Shipped work spans policy calculators, recruiting tools, multimedia research platforms, outreach systems, and public-facing websites. Rigorous evidence and clear stakeholder communication underpin every shipping decision.',
  ],
}

/** Large showcase cards (visual weight). */
export const portfolioFeatured = [
  {
    id: 'case-repo',
    title: 'Case Repo',
    category: 'MBA Recruiting Tool',
    description:
      'A searchable case interview repository for MBA students, built to help consulting candidates find, preview, rate, and practice real cases.',
    techTags: ['Search', 'Case Prep', 'Cloud Storage', 'MBA Recruiting'],
    liveUrl: 'https://cases.baglini.co/',
    ctaPrimary: 'Browse Cases',
    visualVariant: 'indigo',
    previewSrc: '/previews/case-repo.png',
    previewAlt:
      'Case Repo web application: Yale and Booth co-branded header with Browse navigation and sign-in to the MBA consulting case catalog',
  },
  {
    id: 'ri-calculator',
    title: 'RI School Consolidation Calculator',
    category: 'Policy + Data Tool',
    description:
      'An interactive map and calculator exploring how Rhode Island school district consolidation could affect costs, leadership structures, and local decision-making.',
    techTags: ['Education Policy', 'Mapping', 'Public Finance', 'Data Visualization'],
    liveUrl: 'https://calc.baglini.co',
    ctaPrimary: 'Open Calculator',
    paperUrl: '/rhode-island-school-consolidation-paper.pdf',
    ctaSecondary: 'Read paper',
    visualVariant: 'teal',
    previewSrc: '/previews/ri-school-consolidation.png',
    previewAlt:
      'Rhode Island school consolidation calculator showing the interactive district map alongside policy and fiscal controls',
  },
]

/** Smaller placards — live sites plus shipped tools already on this page. */
export const portfolioOther = [
  {
    id: '4-connect',
    title: '4 Connect',
    category: 'Web Game',
    description:
      'A polished Connect Four with two-player mode, multiple AI tiers, handcrafted motion, Web Audio, and minimax-backed play.',
    techTags: ['Vanilla JS', 'Web Audio', 'Game AI', 'Mobile UX'],
    liveUrl: '/4-connect/',
    ctaPrimary: 'Play',
    visualVariant: 'rose',
    previewSrc: '/previews/4-connect.png',
    previewAlt:
      '4 Connect mobile game interface on a framed canvas: modes, players, filled board mid-game, and controls',
  },
  {
    id: 'elc-outreach',
    title: 'Education Leadership Conference Outreach',
    category: 'AI Outreach System',
    description:
      'An AI-assisted system that generates credible, personalized outreach at scale to drive attendance without sacrificing tone or relevance.',
    techTags: ['AI', 'Email', 'Outreach', 'Scaling'],
    liveUrl: 'https://elc.baglini.co',
    ctaPrimary: 'Open tool',
    note: 'Cold start may take a few seconds on first load.',
    githubUrl: 'https://github.com/Baggs99/ELC-Mass-Email-Sender',
    ctaGithub: 'GitHub',
    visualVariant: 'violet',
    previewSrc: '/previews/elc-outreach.png',
    previewAlt:
      'Education Leadership Conference Outreach app with AI-assisted email drafting and outreach workflow controls',
  },
  {
    id: 'auwm',
    title: 'African Urban Worship Music',
    category: 'Multimedia Research Project',
    description:
      'A digital storytelling project exploring African urban worship music through research, writing, media, and course-based analysis.',
    techTags: ['Research', 'Media', 'Culture', 'Storytelling'],
    liveUrl: 'https://auwm.baglini.co/',
    ctaPrimary: 'View Project',
    visualVariant: 'amber',
    previewSrc: '/previews/auwm.png',
    previewAlt:
      'African Urban Worship Music site showing rich multimedia layout with research narratives and imagery',
  },
  {
    id: 'yale-som-consulting',
    title: 'Yale SOM Consulting Club',
    category: 'Student Organization Website',
    description:
      'A redesigned website for Yale SOM consulting recruiting resources, events, timelines, and student-facing communications.',
    techTags: ['Consulting', 'Recruiting', 'Web Design', 'Yale SOM'],
    liveUrl: 'https://yalesomconsultingclub.com/',
    ctaPrimary: 'Visit Site',
    visualVariant: 'slate',
    previewSrc: '/previews/yale-som-consulting-club.png',
    previewAlt:
      'Yale SOM Consulting Club homepage with recruiting-focused navigation, events, and student resources',
  },
]

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

/** Writing section header copy */
export const writingSection = {
  title: 'Writing & ideas',
  subtitle:
    'Published honors research, essays, and memos on institutions, policy, technology, and leadership.',
}

/** Honors thesis hosted on institutional repository */
export const honorsThesis = {
  id: 'uri-army-officer-retention-thesis',
  title: 'Analysis of Officer Retention and Success in the US Army by Commissioning Source',
  documentType: 'Undergraduate Honors Thesis',
  institution: 'University of Rhode Island',
  author: 'Daniel Baglini',
  description:
    'An undergraduate honors thesis analyzing how commissioning source impacts officer retention and promotion outcomes in the United States Army, using statistical analysis of Army officer career data.',
  href: 'https://digitalcommons.uri.edu/srhonorsprog/875/',
  ctaLabel: 'Read Thesis',
  archiveNote: 'Published through URI DigitalCommons',
  subjectTags: ['Military Research', 'Public Policy', 'Data Analysis', 'Army Leadership'],
}

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
      'A short memo on where digital tools actually change outcomes, and where they only add noise.',
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

export const tip = {
  heading: 'Leave a Tip',
  body: 'If you found this helpful, feel free to support the project.',
  ctaLabel: 'Leave a tip',
  href: 'https://donate.stripe.com/aFa9AV0AB9gyeLGcCG24000',
}
