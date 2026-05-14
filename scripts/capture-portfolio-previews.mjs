/**
 * Capture raw desktop screenshots for portfolio preview composition.
 *
 * Prerequisites: Chromium installed for Playwright (`npx playwright install chromium`).
 *
 * Usage (from repo root):
 *   node scripts/capture-portfolio-previews.mjs
 *   node scripts/capture-portfolio-previews.mjs --only=elc-outreach
 *
 * Writes PNGs under public/previews/_raw/<id>.png
 * Then run: python scripts/compose-portfolio-preview.py ... (see README in script output)
 */

import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { chromium } from 'playwright'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const rawDir = path.join(root, 'public', 'previews', '_raw')

/** @typedef {{ id: string, url: string, settleMs?: number, gotoTimeoutMs?: number, waitUntil?: import('playwright').WaitUntilEvent, waitPastRenderSplash?: boolean, splashTimeoutMs?: number, settleAfterSplashMs?: number }} CaptureJob */

/** @type {CaptureJob[]} */
const jobs = [
  {
    id: 'case-repo',
    url: 'https://cases.baglini.co/',
    settleMs: 4500,
    waitUntil: 'domcontentloaded',
    gotoTimeoutMs: 75000,
  },
  {
    id: 'ri-school-consolidation',
    url: 'https://calc.baglini.co/',
    settleMs: 8000,
    waitUntil: 'domcontentloaded',
    gotoTimeoutMs: 90000,
  },
  {
    id: 'elc-outreach',
    url: 'https://elc.baglini.co/',
    waitPastRenderSplash: true,
    splashTimeoutMs: 180000,
    settleAfterSplashMs: 5000,
    waitUntil: 'domcontentloaded',
    gotoTimeoutMs: 180000,
  },
  {
    id: 'auwm',
    url: 'https://auwm.baglini.co/',
    settleMs: 5000,
    waitUntil: 'domcontentloaded',
    gotoTimeoutMs: 90000,
  },
  {
    id: 'yale-som-consulting-club',
    url: 'https://yalesomconsultingclub.com/',
    settleMs: 5000,
    waitUntil: 'domcontentloaded',
    gotoTimeoutMs: 90000,
  },
]

const VIEWPORT = { width: 1440, height: 1000 }
const PYTHON = process.env.PYTHON ?? 'python'

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const RENDER_COLD_SPLASH_MARKERS = [
  'WELCOME TO RENDER',
  'APPLICATION LOADING',
  'SERVICE WAKING UP',
  'SERVICE IS WAKING UP',
  'YOUR APP IS ALMOST LIVE',
]

/**
 * Cold-start hosts may show an interstitial before the SPA loads — avoid using that as product art.
 */
async function waitPastRenderSplash(page, timeoutMs = 150000, pollMs = 4000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    const isSplash = await page
      .evaluate((markers) => {
        const t = document.body?.innerText ?? ''
        return markers.some((m) => t.includes(m))
      }, RENDER_COLD_SPLASH_MARKERS)
      .catch(() => true)
    if (!isSplash) return
    await delay(pollMs)
  }
  console.warn('[capture] splash wait timed out — screenshot may still be a loading gateway')
}

async function dismissCommonBanners(page) {
  const selectors = [
    '#onetrust-accept-btn-handler',
    'button[data-testid="cookie-accept"]',
    '[id*="cookie"] button',
    '[class*="cookie"] button',
    '[class*="CookieConsent"] button',
    '#cookie-accept',
  ]
  for (const sel of selectors) {
    try {
      const el = page.locator(sel).first()
      if ((await el.count()) > 0) {
        await el.click({ timeout: 1200 }).catch(() => {})
      }
    } catch {
      /**/
    }
  }
  await page
    .evaluate(() => {
      const labels = /accept(\s+all)?|agree|i understand|got it|^ok$/i
      const nodes = /** @type {HTMLElement[]} */ ([
        ...document.querySelectorAll('button, [role="button"], a.btn, a[class*="button"]'),
      ])
      for (const n of nodes) {
        const t = (n.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 48)
        if (!t) continue
        if (!labels.test(t)) continue
        const style = window.getComputedStyle(n)
        if (style.visibility === 'hidden' || style.display === 'none') continue
        if (typeof n.click === 'function') {
          try {
            n.click()
          } catch {
            /**/
          }
        }
      }
    })
    .catch(() => {})
}

/** @type {[string, string, string][]} */
const composePlan = [
  ['case-repo', 'case-repo.png', '0'],
  ['ri-school-consolidation', 'ri-school-consolidation.png', '-0.15'],
  ['elc-outreach', 'elc-outreach.png', '-0.1'],
  ['auwm', 'auwm.png', '0'],
  ['yale-som-consulting-club', 'yale-som-consulting-club.png', '0'],
]

function composeAll(rawId, finalName, verticalBias = '0') {
  const composeScript = path.join(root, 'scripts', 'compose-portfolio-preview.py')
  const inp = path.join(rawDir, `${rawId}.png`)
  const out = path.join(root, 'public', 'previews', finalName)
  execFileSync(PYTHON, [composeScript, inp, out], {
    cwd: root,
    stdio: 'inherit',
    env: { ...process.env, VERTICAL_BIAS: verticalBias },
  })
}

async function main() {
  fs.mkdirSync(rawDir, { recursive: true })

  const onlyArg = process.argv.find((a) => a.startsWith('--only='))
  const onlyId = onlyArg?.split('=')[1]?.trim()

  const browser = await chromium.launch({ headless: true })

  try {
    for (const job of jobs) {
      if (onlyId && job.id !== onlyId) continue
      const outPath = path.join(rawDir, `${job.id}.png`)
      const context = await browser.newContext({
        viewport: VIEWPORT,
        deviceScaleFactor: 1,
      })
      const page = await context.newPage()

      console.log('[capture]', job.id, job.url)

      await page.goto(job.url, {
        waitUntil: job.waitUntil ?? 'domcontentloaded',
        timeout: job.gotoTimeoutMs ?? 75000,
      })

      await delay(800)
      await dismissCommonBanners(page)

      if (job.waitPastRenderSplash) {
        await waitPastRenderSplash(page, job.splashTimeoutMs ?? 150000)
        await dismissCommonBanners(page)
        await delay(job.settleAfterSplashMs ?? 4000)
      } else {
        await delay(job.settleMs ?? 3500)
      }

      await page.bringToFront()
      await page.screenshot({
        path: outPath,
        fullPage: false,
        animations: 'disabled',
        type: 'png',
      })

      await context.close()
      console.log('  wrote', path.relative(root, outPath))
    }
  } finally {
    await browser.close()
  }

  console.log('\nComposing canvases...')
  const toCompose = onlyId
    ? composePlan.filter(([rawId]) => rawId === onlyId)
    : composePlan
  for (const [rawId, outName, bias] of toCompose) {
    composeAll(rawId, outName, bias)
  }

  const portrait = path.join(root, 'public', 'previews', '4-connect-portrait-preview.png')
  if (!onlyId) {
    if (!fs.existsSync(portrait)) {
      console.warn('Skip 4-connect composed: missing', portrait)
    } else {
      const composeScript = path.join(root, 'scripts', 'compose-portfolio-preview.py')
      const outFour = path.join(root, 'public', 'previews', '4-connect.png')
      execFileSync(PYTHON, [composeScript, portrait, outFour], {
        cwd: root,
        stdio: 'inherit',
        env: { ...process.env, VERTICAL_BIAS: '0.05' },
      })
      console.log('composed 4-connect.png from portrait capture')
    }
  }

  console.log('\nDone.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
