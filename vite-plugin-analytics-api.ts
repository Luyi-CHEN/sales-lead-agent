import fs from 'fs'
import path from 'path'
import type { Plugin } from 'vite'

const DATA_DIR = path.resolve(__dirname, '.analytics-data')
const CHAT_FILE = path.join(DATA_DIR, 'chat-logs.json')
const CLICK_FILE = path.join(DATA_DIR, 'click-paths.json')

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
  if (!fs.existsSync(CHAT_FILE)) fs.writeFileSync(CHAT_FILE, '[]')
  if (!fs.existsSync(CLICK_FILE)) fs.writeFileSync(CLICK_FILE, '[]')
}

function readJSON(file: string): any[] {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf-8'))
  } catch {
    return []
  }
}

function writeJSON(file: string, data: any[]) {
  // Keep max 5000 entries
  const trimmed = data.length > 5000 ? data.slice(-5000) : data
  fs.writeFileSync(file, JSON.stringify(trimmed, null, 2))
}

function parseBody(req: any): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', (chunk: string) => { body += chunk })
    req.on('end', () => {
      try { resolve(JSON.parse(body)) } catch { resolve(null) }
    })
    req.on('error', reject)
  })
}

export function analyticsApiPlugin(): Plugin {
  return {
    name: 'analytics-api',
    configureServer(server) {
      ensureDataDir()

      server.middlewares.use(async (req, res, next) => {
        const url = req.url || ''

        // CORS headers for cross-device access
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

        if (req.method === 'OPTIONS') {
          res.statusCode = 204
          res.end()
          return
        }

        // GET /api/analytics/chat — retrieve all chat logs
        if (url === '/api/analytics/chat' && req.method === 'GET') {
          const data = readJSON(CHAT_FILE)
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(data))
          return
        }

        // POST /api/analytics/chat — append chat log entries
        if (url === '/api/analytics/chat' && req.method === 'POST') {
          const body = await parseBody(req)
          if (body) {
            const existing = readJSON(CHAT_FILE)
            const entries = Array.isArray(body) ? body : [body]
            existing.push(...entries)
            writeJSON(CHAT_FILE, existing)
          }
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ ok: true }))
          return
        }

        // DELETE /api/analytics/chat — clear chat logs
        if (url === '/api/analytics/chat' && req.method === 'DELETE') {
          writeJSON(CHAT_FILE, [])
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ ok: true }))
          return
        }

        // GET /api/analytics/clicks — retrieve all click paths
        if (url === '/api/analytics/clicks' && req.method === 'GET') {
          const data = readJSON(CLICK_FILE)
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(data))
          return
        }

        // POST /api/analytics/clicks — append click path entries
        if (url === '/api/analytics/clicks' && req.method === 'POST') {
          const body = await parseBody(req)
          if (body) {
            const existing = readJSON(CLICK_FILE)
            const entries = Array.isArray(body) ? body : [body]
            existing.push(...entries)
            writeJSON(CLICK_FILE, existing)
          }
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ ok: true }))
          return
        }

        // DELETE /api/analytics/clicks — clear click paths
        if (url === '/api/analytics/clicks' && req.method === 'DELETE') {
          writeJSON(CLICK_FILE, [])
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ ok: true }))
          return
        }

        next()
      })
    },
  }
}
