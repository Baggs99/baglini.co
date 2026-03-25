# Dan Baglini — personal site

A single-page React (Vite) site with Tailwind CSS: dark theme, restrained palette, and subtle motion. Content is centralized for easy edits.

## Prerequisites

- [Node.js](https://nodejs.org/) 20+ (LTS recommended)
- npm (comes with Node)

## Setup

```bash
npm install
```

## Development

```bash
npm run dev
```

Open the URL shown in the terminal (usually `http://localhost:5173`). Edit files and save — Vite hot-reloads.

## Production build

```bash
npm run build
```

Output is written to `dist/`. Preview it locally:

```bash
npm run preview
```

## Editing copy and links

Most text, buttons, and navigation targets live in **`src/data/content.js`**.

- **`siteMeta`** — page title and meta description (also update `index.html` title/description if you change branding).
- **`navLinks`** — labels and section IDs; IDs must match `id` attributes on sections in the components used by `App.jsx`.
- **`hero`**, **`about`**, **`projects`**, **`experience`**, **`articles`**, **`contactLinks`**, **`footer`** — arrays and strings for each block.

Project cards, timeline items, and article cards are driven by arrays — add or remove objects to change what appears.

## Project layout

```
src/
  App.jsx              # Page shell: nav, main sections, footer
  main.jsx             # React entry
  index.css            # Tailwind + global styles
  data/
    content.js         # ← Start here for text/links
  components/
    Navbar.jsx         # Sticky header + mobile menu
    Hero.jsx
    About.jsx
    FeaturedProjects.jsx
    Experience.jsx
    Writing.jsx
    Contact.jsx
    Footer.jsx
    Reveal.jsx         # Scroll-in animation wrapper
```

## Deploy

### Vercel

1. Push this folder to GitHub/GitLab/Bitbucket.
2. In [Vercel](https://vercel.com/), **Import** the repository.
3. Framework preset: **Vite**.
4. Build command: `npm run build`  
   Output directory: `dist`
5. Deploy.

No extra config is required for this static single-page app.

### Render (static site)

1. Create a **Static Site** on [Render](https://render.com/).
2. Connect the repo and set:
   - **Build command:** `npm install && npm run build`
   - **Publish directory:** `dist`
3. Deploy.

## Scripts

| Command          | Purpose                    |
| ---------------- | -------------------------- |
| `npm run dev`    | Local dev server           |
| `npm run build`  | Production build → `dist` |
| `npm run preview`| Serve `dist` locally       |
| `npm run lint`   | Run ESLint                 |

## Tech stack

- [React](https://react.dev/) 19
- [Vite](https://vite.dev/) 8
- [Tailwind CSS](https://tailwindcss.com/) 4 (`@tailwindcss/vite`)
- [Framer Motion](https://www.framer.com/motion/) — light scroll reveals

---

Optional next steps: see the “Optional upgrades” section in your project brief (blog, case studies, data visualization).
