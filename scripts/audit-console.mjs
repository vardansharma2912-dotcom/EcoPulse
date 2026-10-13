import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { chromium } from 'playwright'

const DIST_DIR = path.resolve(process.cwd(), 'dist')
const PORT = 4174

const ROUTES = [
  '/',
  '/reminders',
  '/calculator',
  '/analytics',
  '/learn',
  '/settings',
  '/404',
]

const VIEWPORTS = [
  { name: 'desktop', width: 1280, height: 800 },
  { name: 'mobile', width: 390, height: 844 },
]

function startStaticServer() {
  const server = http.createServer((req, res) => {
    const urlPath = req.url.split('?')[0]
    let filePath
    let statusCode = 200

    if (urlPath === '/' || urlPath === '') {
      filePath = path.join(DIST_DIR, 'index.html')
    } else {
      const cleanSubpath = urlPath.replace(/^\/+/, '').replace(/\/+$/, '')
      const routeDirHtml = path.join(DIST_DIR, cleanSubpath, 'index.html')
      const directHtml = path.join(DIST_DIR, `${cleanSubpath}.html`)
      const assetFile = path.join(DIST_DIR, cleanSubpath)

      if (fs.existsSync(routeDirHtml)) {
        filePath = routeDirHtml
      } else if (fs.existsSync(directHtml)) {
        filePath = directHtml
      } else if (fs.existsSync(assetFile) && fs.statSync(assetFile).isFile()) {
        filePath = assetFile
      } else {
        filePath = path.join(DIST_DIR, '404.html')
        statusCode = 404
      }
    }

    if (!fs.existsSync(filePath)) {
      res.writeHead(404, { 'Content-Type': 'text/plain' })
      res.end('Not Found')
      return
    }

    const content = fs.readFileSync(filePath)
    const ext = path.extname(filePath)
    let contentType = 'text/html; charset=utf-8'
    if (ext === '.js') contentType = 'application/javascript'
    else if (ext === '.css') contentType = 'text/css'
    else if (ext === '.xml') contentType = 'application/xml'
    else if (ext === '.txt') contentType = 'text/plain'
    else if (ext === '.webp') contentType = 'image/webp'
    else if (ext === '.png') contentType = 'image/png'
    else if (ext === '.svg') contentType = 'image/svg+xml'
    else if (ext === '.woff2') contentType = 'font/woff2'

    res.writeHead(statusCode, { 'Content-Type': contentType })
    res.end(content)
  })

  return new Promise((resolve) => {
    server.listen(PORT, '127.0.0.1', () => {
      resolve(server)
    })
  })
}

async function auditEnvironment(modeName, baseUrl) {
  console.log(`\n========================================`)
  console.log(`[Audit] Running console & network audit in ${modeName} mode: ${baseUrl}`)
  console.log(`========================================`)

  const browser = await chromium.launch({ headless: true })
  const issues = []

  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      userAgent: vp.name === 'mobile'
        ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
        : undefined,
    })

    const page = await context.newPage()

    for (const route of ROUTES) {
      const routeIssues = []

      page.on('console', (msg) => {
        const type = msg.type()
        const text = msg.text()
        // Capture errors and warnings
        if (type === 'error' || type === 'warning' || text.toLowerCase().includes('warning') || text.toLowerCase().includes('error')) {
          routeIssues.push({ type: `console.${type}`, text })
        }
      })

      page.on('pageerror', (err) => {
        routeIssues.push({ type: 'pageerror', text: err.message })
      })

      page.on('requestfailed', (req) => {
        routeIssues.push({ type: 'requestfailed', text: `${req.url()} (${req.failure()?.errorText || 'failed'})` })
      })

      try {
        await page.goto(`${baseUrl}${route}`, { waitUntil: 'load', timeout: 10000 })
        await page.waitForTimeout(500) // allow React hydration and effect execution
      } catch (e) {
        routeIssues.push({ type: 'navigation_error', text: e.message })
      }

      if (routeIssues.length > 0) {
        issues.push({ mode: modeName, viewport: vp.name, route, issues: routeIssues })
      } else {
        console.log(`✓ [${modeName}] [${vp.name}] ${route}: 0 errors, 0 warnings, 0 failed requests`)
      }

      page.removeAllListeners('console')
      page.removeAllListeners('pageerror')
      page.removeAllListeners('requestfailed')
    }

    await context.close()
  }

  await browser.close()
  return issues
}

import { spawn } from 'node:child_process'

async function startDevServer() {
  const DEV_PORT = 5173
  const proc = spawn('npm.cmd', ['run', 'dev', '--', '--port', String(DEV_PORT), '--strictPort'], {
    shell: true,
    stdio: 'pipe',
  })

  await new Promise((resolve, reject) => {
    proc.stdout.on('data', (d) => {
      const str = d.toString()
      if (str.includes(`localhost:${DEV_PORT}`) || str.includes('Local:')) {
        resolve()
      }
    })
    proc.stderr.on('data', (d) => {
      console.error(d.toString())
    })
    setTimeout(resolve, 4000)
  })

  return {
    proc,
    url: `http://localhost:${DEV_PORT}`,
    close: () => {
      try {
        proc.kill('SIGTERM')
      } catch {}
    },
  }
}

async function main() {
  const previewServer = await startStaticServer()
  let devServer = null
  try {
    const previewIssues = await auditEnvironment('Preview (Production Dist)', `http://127.0.0.1:${PORT}`)

    console.log('\n--- PREVIEW AUDIT SUMMARY ---')
    if (previewIssues.length === 0) {
      console.log('🎉 PERFECT PREVIEW: Zero console errors, warnings, failed network requests, or React issues!')
    } else {
      console.log(`Found issues in preview on ${previewIssues.length} combinations:`)
      console.dir(previewIssues, { depth: null })
      process.exitCode = 1
    }

    devServer = await startDevServer()
    const devIssues = await auditEnvironment('Dev Mode', devServer.url)
    console.log('\n--- DEV AUDIT SUMMARY ---')
    if (devIssues.length === 0) {
      console.log('🎉 PERFECT DEV: Zero console errors, warnings, failed network requests, or React issues!')
    } else {
      console.log(`Found issues in dev on ${devIssues.length} combinations:`)
      console.dir(devIssues, { depth: null })
      process.exitCode = 1
    }
  } finally {
    previewServer.close()
    if (devServer) devServer.close()
  }
}

main().catch((err) => {
  console.error('[Audit] Fatal error:', err)
  process.exit(1)
})
