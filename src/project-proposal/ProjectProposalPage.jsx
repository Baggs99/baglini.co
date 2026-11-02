import { useEffect, useState } from 'react'

const storageKey = 'baglini-project-proposal'

const defaultProposal = {
  title: 'Project Proposal',
  due: '11:59pm Monday, November 2, 2026',
  student: 'Daniel Baglini',
  ideas: [
    {
      name: "McNay's Cookie Orderer",
      tagline: 'A Yale-only McNay cookie pickup app for ordering a cookie between classes.',
      journeys: [
        'As a Yale student, I enter my @yale.edu email, receive a magic link, verify my email, and return to the app as a verified user.',
        'As a verified student, I choose an available McNay class-break pickup window, accept the student-run prototype disclaimer, pay for one chocolate chip cookie, and receive a pickup code after payment is confirmed.',
        "As a student with a confirmed order, I see my pickup window, pickup code, and instructions to meet at the entrance of McNay's.",
        "As an admin/operator, I log in to /admin, view paid orders by pickup window, open or close pickup windows, and update each order's status from paid to placed, ready, picked up, refund needed, or refunded.",
      ],
      features: [
        'Yale email verification with magic links so only verified Yale users can order.',
        'Single-item ordering flow for one $2.25 McNay chocolate chip cookie, connected to pickup-window availability and cutoff times.',
        'Pickup-window capacity tracking so students can only choose active windows that still have spots left.',
        'Stripe Checkout and webhook-confirmed paid orders, with pickup codes generated after payment.',
        'Password-protected admin page for viewing orders, toggling pickup windows, sending status updates, and managing fulfillment.',
        'Skip for MVP: full menu management, delivery, loyalty rewards, group orders, complex inventory forecasting, and a polished multi-role staff system.',
      ],
      aiFeature:
        'An LLM creates an operator briefing for each pickup period: it summarizes paid orders by window, highlights sold-out or nearly sold-out windows, flags orders that may need refund attention, and drafts short customer/admin status messages.',
    },
    {
      name: 'Campus Club Event Finder',
      tagline:
        'A campus event discovery platform that helps students find club meetings and activities they actually want to attend.',
      journeys: [
        'As a student, I create a profile with interests, browse upcoming events, filter by category/date, and save events I want to attend.',
        'As a club officer, I log in, create event listings, add descriptions and meeting details, and update or cancel events.',
        'As an admin, I review reported events, manage clubs, and keep categories organized.',
      ],
      features: [
        'Event listings with date, time, location, club, category, and description.',
        'Student account pages for saved events and interest preferences.',
        'Club officer dashboard for creating and editing events.',
        'Search and filtering by date, category, club, and keyword.',
        'Skip for MVP: real-time chat, ticketing, campus map integrations, and calendar sync.',
      ],
      aiFeature:
        'An LLM recommends events from a student\'s saved interests and summarizes a weekly "what\'s happening on campus" digest.',
    },
    {
      name: 'Study Group Scheduler',
      tagline: 'A lightweight app for students to find and organize study groups around shared courses and availability.',
      journeys: [
        'As a student, I create an account, add my courses and weekly availability, and browse possible study groups.',
        'As a student, I can create a study group, invite classmates, propose meeting times, and post basic study goals.',
        'As a group organizer, I manage members, choose a meeting time, and keep a short agenda for the next session.',
      ],
      features: [
        'Student profiles with courses, availability, and study preferences.',
        'Study group creation with course, size limit, meeting format, and proposed times.',
        'Matching/search page for students to find compatible groups.',
        'Group page with member list, meeting details, and simple agenda notes.',
        'Skip for MVP: live video, complex calendar integrations, direct messaging, and automated room reservations.',
      ],
      aiFeature:
        "An LLM suggests compatible study groups based on course overlap and availability, and generates a short study agenda from the group's stated goals.",
    },
  ],
}

function readSavedProposal() {
  try {
    const saved = window.localStorage.getItem(storageKey)
    return saved ? JSON.parse(saved) : defaultProposal
  } catch {
    return defaultProposal
  }
}

function ProjectProposalPage() {
  const [proposal, setProposal] = useState(readSavedProposal)
  const [draft, setDraft] = useState(proposal)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    document.title = `${proposal.title} · ${proposal.student}`
  }, [proposal])

  const savedStatus = getSavedStatus()

  function startEditing() {
    setDraft(proposal)
    setIsEditing(true)
  }

  function saveDraft() {
    setProposal(draft)
    window.localStorage.setItem(storageKey, JSON.stringify(draft))
    setIsEditing(false)
  }

  function resetProposal() {
    window.localStorage.removeItem(storageKey)
    setProposal(defaultProposal)
    setDraft(defaultProposal)
    setIsEditing(false)
  }

  const visibleProposal = isEditing ? draft : proposal

  return (
    <main className="proposal-page">
      <header className="proposal-hero">
        <a className="proposal-home-link" href="/">
          baglini.co
        </a>
        <div className="proposal-hero-grid">
          <div>
            {isEditing ? (
              <TextInput
                label="Title"
                value={draft.title}
                onChange={(value) => setDraft({ ...draft, title: value })}
              />
            ) : (
              <h1>{proposal.title}</h1>
            )}
            <p className="proposal-lede">
              Three ranked semester project ideas with realistic user journeys, MVP scope, and one LLM-powered feature each.
            </p>
          </div>
          <div className="proposal-meta-card">
            <EditableMeta
              isEditing={isEditing}
              proposal={visibleProposal}
              onChange={(next) => setDraft({ ...draft, ...next })}
            />
          </div>
        </div>
        <div className="proposal-actions" aria-label="Proposal editing controls">
          {isEditing ? (
            <>
              <button onClick={saveDraft} type="button">
                Save edits
              </button>
              <button className="secondary" onClick={() => setIsEditing(false)} type="button">
                Cancel
              </button>
            </>
          ) : (
            <button onClick={startEditing} type="button">
              Edit page
            </button>
          )}
          <button className="secondary" onClick={resetProposal} type="button">
            Reset
          </button>
          <button className="secondary" onClick={() => window.print()} type="button">
            Print
          </button>
          <span>{savedStatus}</span>
        </div>
      </header>

      <section className="proposal-list" aria-label="Ranked project ideas">
        {visibleProposal.ideas.map((idea, index) => (
          <IdeaCard
            idea={idea}
            index={index}
            isEditing={isEditing}
            key={index}
            onChange={(nextIdea) => {
              const nextIdeas = [...draft.ideas]
              nextIdeas[index] = nextIdea
              setDraft({ ...draft, ideas: nextIdeas })
            }}
          />
        ))}
      </section>
    </main>
  )
}

function EditableMeta({ isEditing, proposal, onChange }) {
  if (isEditing) {
    return (
      <div className="proposal-edit-stack">
        <TextInput label="Due" value={proposal.due} onChange={(due) => onChange({ due })} />
        <TextInput label="Student" value={proposal.student} onChange={(student) => onChange({ student })} />
      </div>
    )
  }

  return (
    <>
      <p>
        <span>Due</span>
        {proposal.due}
      </p>
      <p>
        <span>Student</span>
        {proposal.student}
      </p>
    </>
  )
}

function IdeaCard({ idea, index, isEditing, onChange }) {
  if (isEditing) {
    return (
      <article className="proposal-card">
        <div className="proposal-rank">Choice {index + 1}</div>
        <TextInput label="Idea name" value={idea.name} onChange={(name) => onChange({ ...idea, name })} />
        <TextInput label="Tagline" value={idea.tagline} onChange={(tagline) => onChange({ ...idea, tagline })} />
        <ListEditor
          label="Major user journeys"
          value={idea.journeys}
          onChange={(journeys) => onChange({ ...idea, journeys })}
        />
        <ListEditor
          label="Core MVP features"
          value={idea.features}
          onChange={(features) => onChange({ ...idea, features })}
        />
        <TextArea label="AI feature" value={idea.aiFeature} onChange={(aiFeature) => onChange({ ...idea, aiFeature })} />
      </article>
    )
  }

  return (
    <article className="proposal-card">
      <div className="proposal-rank">Choice {index + 1}</div>
      <h2>{idea.name}</h2>
      <p className="proposal-tagline">{idea.tagline}</p>
      <ContentList title="Major user journeys" items={idea.journeys} />
      <ContentList title="Core MVP features" items={idea.features} />
      <section className="proposal-ai">
        <h3>AI feature</h3>
        <p>{idea.aiFeature}</p>
      </section>
    </article>
  )
}

function ContentList({ title, items }) {
  return (
    <section>
      <h3>{title}</h3>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  )
}

function TextInput({ label, value, onChange }) {
  return (
    <label className="proposal-field">
      <span>{label}</span>
      <input onChange={(event) => onChange(event.target.value)} value={value} />
    </label>
  )
}

function TextArea({ label, value, onChange }) {
  return (
    <label className="proposal-field">
      <span>{label}</span>
      <textarea onChange={(event) => onChange(event.target.value)} rows={4} value={value} />
    </label>
  )
}

function ListEditor({ label, value, onChange }) {
  return (
    <label className="proposal-field">
      <span>{label}</span>
      <textarea
        onChange={(event) =>
          onChange(
            event.target.value
              .split('\n')
              .map((line) => line.trim())
              .filter(Boolean),
          )
        }
        rows={Math.max(4, value.length + 1)}
        value={value.join('\n')}
      />
      <small>One item per line.</small>
    </label>
  )
}

function getSavedStatus() {
  try {
    return window.localStorage.getItem(storageKey)
      ? 'Saved edits are active in this browser.'
      : 'Showing the published proposal.'
  } catch {
    return 'Showing the published proposal.'
  }
}

export default ProjectProposalPage
