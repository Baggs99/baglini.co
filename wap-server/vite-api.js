import { loadEnv } from 'vite'
import { tryHandleWapApi } from './http-api.js'

function apiMiddleware(req, res, next) {
  tryHandleWapApi(req, res)
    .then((handled) => {
      if (!handled) next()
    })
    .catch((err) => {
      console.error(err)
      if (!res.headersSent) {
        res.statusCode = 500
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
        res.end(JSON.stringify({ error: 'Something went wrong. Please try again or email sales.' }))
      }
    })
}

export function wapApiPlugin() {
  return {
    name: 'wap-api',
    config(_, { mode }) {
      const env = loadEnv(mode, process.cwd(), '')
      for (const [key, value] of Object.entries(env)) {
        if (process.env[key] === undefined) process.env[key] = value
      }
    },
    configureServer(server) {
      server.middlewares.use(apiMiddleware)
    },
    configurePreviewServer(server) {
      server.middlewares.use(apiMiddleware)
    },
  }
}
