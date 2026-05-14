/**
 * Capture shrink-wrapped #gameScreen gameplay, compose framed 1200x628 PNG for the portfolio card.
 * Requires: `npm i -D playwright`, `npx playwright install chromium`, and Python Pillow.
 * Run: node scripts/capture-and-compose-4-connect.mjs
 */
import { chromium } from 'playwright'
import { spawn, spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const PORT = 5182
const BASE = `http://127.0.0.1:${PORT}`
const rawPath = path.join(root, 'public/previews/_4-connect-raw.png')
const outPath = path.join(root, 'public/previews/4-connect.png')
const composePy = path.join(root, 'scripts', 'compose-4-connect-preview.py')

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function waitForServer(url, timeoutMs = 75000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url)
      if (res.ok) return
    } catch {
      /* retry */
    }
    await sleep(200)
  }
  throw new Error(`Server not ready: ${url}`)
}

function startVite() {
  return spawn('npx', ['vite', '--host', '127.0.0.1', '--strictPort', '--port', String(PORT)], {
    cwd: root,
    stdio: 'inherit',
    shell: true,
  })
}

async function overlayOpen(page, id) {
  return page.locator(`#${id}`).evaluate((el) => el.classList.contains('visible'))
}

async function drop(page, col) {
  await page.locator('#board').locator(`[aria-label="Drop piece in column ${col}"]`).click()
  await sleep(380)
}

async function killVite(child) {
  if (!child?.pid) return
  try {
    if (process.platform === 'win32') {
      spawn('taskkill', ['/pid', String(child.pid), '/f', '/t'], { stdio: 'ignore' })
    } else {
      child.kill('SIGTERM')
    }
  } catch {
    /* ignore */
  }
}

async function main() {
  fs.mkdirSync(path.join(root, 'public/previews'), { recursive: true })

  const perm = [4, 7, 3, 5, 6, 2, 1]

  const vite = startVite()
  try {
    await waitForServer(`${BASE}/`)
    await sleep(400)

    const browser = await chromium.launch({ headless: true })
    const page = await browser.newPage({
      viewport: { width: 520, height: 1080 },
      deviceScaleFactor: 2,
    })

    await page.goto(`${BASE}/4-connect/index.html`, { waitUntil: 'domcontentloaded', timeout: 90000 })
    await page.waitForFunction(() => document.querySelectorAll('#board .column').length >= 7, {
      timeout: 30000,
    })
    await page.locator('#muteBtn').click().catch(() => {})
    await sleep(150)
    await page.locator('#modePvpBtn').click()
    await sleep(450)

    for (let round = 0; round < 3; round++) {
      if ((await overlayOpen(page, 'winOverlay')) || (await overlayOpen(page, 'drawOverlay'))) break
      for (const c of perm) {
        if ((await overlayOpen(page, 'winOverlay')) || (await overlayOpen(page, 'drawOverlay'))) break
        await drop(page, c)
      }
    }
    await sleep(350)
    await page.mouse.move(8, 8)
    await sleep(250)

    await page.addStyleTag({
      content:
        '#gameScreen { min-height: auto !important; } #gameScreen.screen { min-height: auto !important; }',
    })
    await sleep(100)

    const shell = page.locator('#gameScreen')
    await shell.screenshot({ path: rawPath })

    /** Portrait reference candidate (same clip as source UI) */
    await shell.screenshot({ path: path.join(root, 'public/previews/4-connect-portrait-preview.png') })

    await browser.close()
  } finally {
    killVite(vite)
    await sleep(350)
  }

  const compose = spawnSync('python', [composePy, rawPath, outPath], {
    cwd: root,
    stdio: 'inherit',
    encoding: 'utf8',
  })
  if (compose.status !== 0) {
    throw new Error(`compose exited ${compose.status}`)
  }

  try {
    fs.unlinkSync(rawPath)
  } catch {
    /* optional */
  }
  console.log('Done:', outPath)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
