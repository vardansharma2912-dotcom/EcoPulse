import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'
import lighthouse from 'lighthouse'
import * as chromeLauncher from 'chrome-launcher'

const DIST_DIR = path.resolve(process.cwd(), 'dist')
const PORT = 4178

const ROUTES = ['/', '/calculator', '/learn']

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
    let body = fs.readFileSync(filePath)
    const headers = {
      'Content-Type': mimeTypes[ext] || 'application/octet-stream',
      'Access-Control-Allow-Origin': '*',
    }

    if (filePath.includes('assets') || ['.woff2', '.woff', '.png', '.webp', '.jpg', '.ico'].includes(ext)) {
      headers['Cache-Control'] = 'public, max-age=31536000, immutable'
    } else if (ext === '.html') {
      headers['Cache-Control'] = 'public, max-age=0, must-revalidate'
    }

    const acceptEncoding = req.headers['accept-encoding'] || ''
    if (acceptEncoding.includes('gzip') && ['.html', '.js', '.css', '.json', '.svg'].includes(ext)) {
      headers['Content-Encoding'] = 'gzip'
      body = zlib.gzipSync(body)
    }

    res.writeHead(200, headers)
    res.end(body)
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

async function runLighthouseAudit() {
  const server = await startStaticServer()
  console.log(`Static server running at ${server.url}`)

  const chrome = await chromeLauncher.launch({
    chromeFlags: ['--headless', '--no-sandbox', '--disable-gpu'],
  })
  console.log(`Chrome running on port ${chrome.port}`)

  const auditScores = []

  try {
    for (const formFactor of ['desktop', 'mobile']) {
      for (const route of ROUTES) {
        const url = `${server.url}${route}`
        console.log(`\nAuditing ${route} on ${formFactor}...`)

        const flags = {
          port: chrome.port,
          output: 'json',
          logLevel: 'error',
          onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
          formFactor,
          screenEmulation:
            formFactor === 'desktop'
              ? {
                  mobile: false,
                  width: 1350,
                  height: 940,
                  deviceScaleFactor: 1,
                  disabled: false,
                }
              : {
                  mobile: true,
                  width: 390,
                  height: 844,
                  deviceScaleFactor: 2,
                  disabled: false,
                },
          throttling: {
            rttMs: 40,
            throughputKbps: 10 * 1024,
            cpuSlowdownMultiplier: 1,
            requestLatencyMs: 0,
            downloadThroughputKbps: 0,
            uploadThroughputKbps: 0,
          },
        }

        const runnerResult = await lighthouse(url, flags)
        const report = runnerResult.lhr

        const scores = {
          route,
          formFactor,
          performance: Math.round((report.categories.performance?.score || 0) * 100),
          accessibility: Math.round((report.categories.accessibility?.score || 0) * 100),
          bestPractices: Math.round((report.categories['best-practices']?.score || 0) * 100),
          seo: Math.round((report.categories.seo?.score || 0) * 100),
        }

        console.log(
          `  -> Perf: ${scores.performance} | A11y: ${scores.accessibility} | BestPractices: ${scores.bestPractices} | SEO: ${scores.seo}`
        )

        // Log any audit failures if score < 95
        const failures = []
        for (const cat of Object.values(report.categories)) {
          if ((cat.score || 0) * 100 < 95) {
            for (const auditRef of cat.auditRefs) {
              const audit = report.audits[auditRef.id]
              if (audit && audit.score !== null && audit.score < 0.95 && audit.scoreDisplayMode !== 'notApplicable') {
                failures.push({
                  category: cat.title,
                  id: auditRef.id,
                  title: audit.title,
                  score: audit.score,
                  description: audit.description,
                })
              }
            }
          }
        }

        auditScores.push({ ...scores, failures })
      }
    }
  } finally {
    await chrome.kill()
    await server.close()
  }

  console.log('\n================ LIGHTHOUSE SUMMARY ================')
  console.table(
    auditScores.map((s) => ({
      Route: s.route,
      Device: s.formFactor,
      Performance: s.performance,
      Accessibility: s.accessibility,
      'Best Practices': s.bestPractices,
      SEO: s.seo,
      'Issues <95': s.failures.length,
    }))
  )

  const under95 = auditScores.filter(
    (s) => s.performance < 95 || s.accessibility < 95 || s.bestPractices < 95 || s.seo < 95
  )

  if (under95.length > 0) {
    console.log('\nAudits that scored below 95:')
    for (const item of under95) {
      console.log(`\n[${item.route} - ${item.formFactor}]`)
      for (const f of item.failures) {
        console.log(`  - (${f.category}) ${f.id}: ${f.title} (score: ${f.score})`)
      }
    }
  } else {
    console.log('\n🎉 ALL ROUTES SCORED >= 95 ACROSS ALL CATEGORIES!')
  }

  return auditScores
}

runLighthouseAudit().catch(console.error)
