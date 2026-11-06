const ROUTES = {
  'GET /api/wap/products': () => import('../api/wap/products.js'),
  'GET /api/wap/order-status': () => import('../api/wap/order-status.js'),
  'GET /api/wap/admin': () => import('../api/wap/admin.js'),
  'POST /api/wap/admin': () => import('../api/wap/admin.js'),
  'PATCH /api/wap/admin': () => import('../api/wap/admin.js'),
  'POST /api/wap/checkout': () => import('../api/wap/checkout.js'),
  'POST /api/wap/wholesale': () => import('../api/wap/wholesale.js'),
  'POST /api/wap/stripe-webhook': () => import('../api/wap/stripe-webhook.js'),
}

function wrapResponse(res) {
  res.status = (code) => {
    res.statusCode = code
    return res
  }
  res.json = (body) => {
    if (!res.getHeader('Content-Type')) res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.end(JSON.stringify(body))
    return res
  }
  return res
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

export async function tryHandleWapApi(req, res) {
  const url = new URL(req.url ?? '/', 'http://127.0.0.1')
  const pathname = url.pathname.replace(/\/$/, '') || '/'
  const load = ROUTES[`${req.method} ${pathname}`]
  if (!load) return false

  const raw = await readBody(req)
  req.rawBody = raw
  req.query = Object.fromEntries(url.searchParams.entries())
  if (pathname !== '/api/wap/stripe-webhook') {
    try {
      req.body = raw.length ? JSON.parse(raw.toString('utf8')) : {}
    } catch {
      res.statusCode = 400
      res.setHeader('Content-Type', 'application/json; charset=utf-8')
      res.end(JSON.stringify({ error: 'Invalid JSON body.' }))
      return true
    }
  }

  await (await load()).default(req, wrapResponse(res))
  return true
}
