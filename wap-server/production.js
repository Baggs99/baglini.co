// Serves the Vite build and the West African Produce APIs on Render (or any Node host).
import fs from 'node:fs'
import http from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { tryHandleWapApi } from './http-api.js'

const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)))
const DIST = path.join(ROOT, 'dist')
const PORT = Number(process.env.PORT || 3000)
const HOST = process.env.HOST || '0.0.0.0'

const MIME = {
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
}

function insideDist(file) {
  const resolved = path.resolve(file)
  return resolved === DIST || resolved.startsWith(`${DIST}${path.sep}`)
}

function sendFile(res, file) {
  if (!insideDist(file) || !fs.existsSync(file) || !fs.statSync(file).isFile()) return false
  res.statusCode = 200
  res.setHeader('Content-Type', MIME[path.extname(file).toLowerCase()] || 'application/octet-stream')
  fs.createReadStream(file).pipe(res)
  return true
}

function serveStatic(req, res) {
  const url = new URL(req.url ?? '/', 'http://127.0.0.1')
  let pathname
  try {
    pathname = decodeURIComponent(url.pathname)
  } catch {
    res.statusCode = 400
    res.end('Bad path')
    return
  }
  if (pathname !== '/' && pathname.endsWith('/')) pathname = pathname.slice(0, -1)

  const candidates = []
  if (pathname === '/') candidates.push(path.join(DIST, 'index.html'))
  else {
    const relative = pathname.replace(/^\/+/, '')
    candidates.push(path.join(DIST, relative))
    candidates.push(path.join(DIST, relative, 'index.html'))
  }
  candidates.push(path.join(DIST, 'index.html'))

  for (const file of candidates) {
    if (sendFile(res, file)) return
  }

  res.statusCode = 404
  res.setHeader('Content-Type', 'text/plain; charset=utf-8')
  res.end('Not found')
}

const server = http.createServer(async (req, res) => {
  try {
    if (await tryHandleWapApi(req, res)) return
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.statusCode = 405
      res.end('Method not allowed')
      return
    }
    serveStatic(req, res)
  } catch (err) {
    console.error(err)
    if (!res.headersSent) {
      res.statusCode = 500
      res.setHeader('Content-Type', 'application/json; charset=utf-8')
      res.end(JSON.stringify({ error: 'Something went wrong. Please try again or email sales.' }))
    }
  }
})

server.listen(PORT, HOST, () => {
  console.log(`baglini.co listening on ${HOST}:${PORT}`)
})
