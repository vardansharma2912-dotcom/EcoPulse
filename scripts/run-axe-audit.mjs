import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { chromium } from 'playwright'
import AxeBuilder from '@axe-core/playwright'

const DIST_DIR = path.resolve(process.cwd(), 'dist')
const PORT = 4175

const ROUTES = ['/', '/calculator', '/learn']
const VIEWPORTS = [
  { name: 'desktop', width: 1280, height: 800 },
  { name: 'mobile', width: 390, height: 844 },
]

function startStaticServer() {
  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.webmanifest': 'application/manifest+json',
    '.woff2': 'font/woff2',
    '.woff': 'font/woff',
  }

  const server = http.createServer((req, res) => {
    const urlPath = req.url.split('?')[0]
    let filePath

    if (urlPath === '/' || urlPath === '') {
      filePath = path.join(DIST_DIR, 'index.html')
    } else {
      const clean = urlPath.replace(/^\/+/, '').replace(/\/+$/, '')
      const routeDirHtml = path.join(DIST_DIR, clean, 'index.html')
      const directHtml = path.join(DIST_DIR, `${clean}.html`)
      const directFile = path.join(DIST_DIR, clean)

      if (fs.existsSync(routeDirHtml)) {
        filePath = routeDirHtml
      } else if (fs.existsSync(directHtml)) {
        filePath = directHtml
      } else if (fs.existsSync(directFile) && fs.statSync(directFile).isFile()) {
        filePath = directFile
      } else {
        filePath = path.join(DIST_DIR, 'index.html')
      }
    }

    if (!fs.existsSync(filePath)) {
      res.writeHead(404)
      res.end('Not Found')
      return
    }

    const ext = path.extname(filePath)
    res.writeHead(200, {
      'Content-Type': mimeTypes[ext] || 'application/octet-stream',
      'Access-Control-Allow-Origin': '*',
    })
    res.end(fs.readFileSync(filePath))
  })

  return new Promise((resolve) => {
    server.listen(PORT, '127.0.0.1', () => {
      resolve({
        server,
        url: `http://127.0.0.1:${PORT}`,
        close: () => new Promise((res) => server.close(res)),
      })
    })
  })
}

async function runAudit() {
  const server = await startStaticServer()
  console.log(`Server started at ${server.url}`)

  const browser = await chromium.launch()
  const results = []

  try {
    for (const vp of VIEWPORTS) {
      for (const route of ROUTES) {
        const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } })
        const page = await context.newPage()
        await page.addInitScript(() => {
          localStorage.setItem('ecopulse_welcome_handled_v1', 'true')
          localStorage.setItem('ecopulse_tour_seen_v1', 'true')
          localStorage.setItem('ecopulse_app_state_v2', JSON.stringify({
            version: 2,
            reminders: [
              {
                id: 'starter-1',
                title: 'Turn off geyser after shower',
                appliance: 'Water Heater (Geyser)',
                actionMinutesSaved: 15,
                repeatType: 'daily',
                preferredTime: '08:30',
                kWhSavedPerAction: 0.5,
                isActive: true,
                createdAt: new Date().toISOString()
              }
            ],
            completions: [
              {
                id: 'comp-1',
                reminderId: 'starter-1',
                date: new Date().toISOString().slice(0, 10),
                kWh: 0.5,
                costSaved: 4,
                completedAt: new Date().toISOString()
              }
            ],
            customAppliances: [],
            settings: {
              displayName: 'Vardaan',
              tariffPerKwh: 8,
              currency: '₹',
              notificationsEnabled: true
            }
          }))
        })

        await page.goto(`${server.url}${route}`, { waitUntil: 'networkidle' })
        await page.waitForTimeout(600)

        const axe = await new AxeBuilder({ page }).analyze()
        results.push({
          viewport: vp.name,
          route,
          violations: axe.violations.map((v) => ({
            id: v.id,
            impact: v.impact,
            description: v.description,
            nodes: v.nodes.map((n) => ({ html: n.html, failureSummary: n.failureSummary })),
          })),
        })
        await context.close()
      }
    }
  } finally {
    await browser.close()
    await server.close()
  }

  console.log('\n================ AXE AUDIT REPORT ================')
  let totalViolations = 0
  for (const r of results) {
    console.log(`\nRoute: ${r.route} [${r.viewport}]`)
    if (r.violations.length === 0) {
      console.log('  ✅ 0 accessibility violations!')
    } else {
      totalViolations += r.violations.length
      for (const v of r.violations) {
        console.log(`  ❌ [${v.impact?.toUpperCase()}] ${v.id}: ${v.description}`)
        for (const n of v.nodes.slice(0, 3)) {
          console.log(`     Target: ${n.html.slice(0, 100)}`)
          console.log(`     Fix: ${n.failureSummary?.split('\n')[0]}`)
        }
      }
    }
  }
  console.log(`\nTotal Violations Across All Combinations: ${totalViolations}`)
}

runAudit().catch(console.error)
