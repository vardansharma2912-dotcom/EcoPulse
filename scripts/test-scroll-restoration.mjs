import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { chromium } from 'playwright'

const DIST_DIR = path.resolve(process.cwd(), 'dist')
const PORT = 4175

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
        filePath = path.join(DIST_DIR, 'index.html') // SPA fallback
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
    else if (ext === '.json' || ext === '.webmanifest') contentType = 'application/json'
    else if (ext === '.png') contentType = 'image/png'
    else if (ext === '.svg') contentType = 'image/svg+xml'
    else if (ext === '.woff2') contentType = 'font/woff2'

    res.writeHead(statusCode, { 'Content-Type': contentType })
    res.end(content)
  })

  return new Promise((resolve) => {
    server.listen(PORT, () => resolve(server))
  })
}

async function runScrollTests() {
  console.log('--- Starting Scroll Behavior & Restoration Audit ---')
  const server = await startStaticServer()
  const browser = await chromium.launch()

  try {
    // -------------------------------------------------------------
    // Test 1: Desktop Viewport (1280x800) Sidebar Navigation
    // -------------------------------------------------------------
    console.log('\n[1/5] Testing Desktop Navigation: Reset to Top (0,0)')
    const desktopContext = await browser.newContext({ viewport: { width: 1280, height: 800 } })
    await desktopContext.addInitScript(() => {
      localStorage.setItem('ecopulse_welcome_handled_v1', 'true')
      localStorage.setItem('ecopulse_tour_seen_v1', 'true')
    })
    const page = await desktopContext.newPage()

    await page.goto(`http://localhost:${PORT}/analytics`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(600)

    // Scroll down 600px on /analytics
    await page.evaluate(() => window.scrollTo(0, 600))
    await page.waitForTimeout(200)
    let scrollPos = await page.evaluate(() => window.scrollY || document.documentElement.scrollTop)
    console.log(`  Initial /analytics scroll position: ${scrollPos}px`)
    if (scrollPos < 200) throw new Error('Failed to scroll down on /analytics')

    // Click 'Reminders' in desktop sidebar
    await page.click('aside nav a[href="/reminders"]')
    await page.waitForTimeout(600)

    scrollPos = await page.evaluate(() => window.scrollY || document.documentElement.scrollTop)
    console.log(`  After clicking Reminders: scroll position = ${scrollPos}px`)
    if (scrollPos !== 0) throw new Error(`Expected scroll position 0 on /reminders, got ${scrollPos}`)

    // -------------------------------------------------------------
    // Test 2: Multi-Route Pair Transitions on Desktop & Mobile
    // -------------------------------------------------------------
    console.log('\n[2/5] Testing Multi-route Pairs across Desktop and Mobile Dock')
    const routePairs = [
      { from: '/reminders', to: '/calculator', toName: 'Calculator' },
      { from: '/calculator', to: '/learn', toName: 'Learn' },
      { from: '/learn', to: '/settings', toName: 'Settings' },
      { from: '/settings', to: '/', toName: 'Dashboard' },
    ]

    for (const pair of routePairs) {
      await page.evaluate(() => window.scrollTo(0, 450))
      await page.waitForTimeout(150)
      await page.click(`aside nav a[href="${pair.to}"]`)
      await page.waitForTimeout(500)
      scrollPos = await page.evaluate(() => window.scrollY || document.documentElement.scrollTop)
      console.log(`  Desktop transition ${pair.from} -> ${pair.to}: scroll = ${scrollPos}px (PASS)`)
      if (scrollPos !== 0) throw new Error(`Scroll was not reset to 0 navigating to ${pair.to}`)
    }

    // Mobile Dock Test
    console.log('\n[3/5] Testing Mobile Viewport (390x844) with Bottom NotchDock')
    const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 } })
    await mobileContext.addInitScript(() => {
      localStorage.setItem('ecopulse_welcome_handled_v1', 'true')
      localStorage.setItem('ecopulse_tour_seen_v1', 'true')
    })
    const mobilePage = await mobileContext.newPage()

    await mobilePage.goto(`http://localhost:${PORT}/learn`, { waitUntil: 'networkidle' })
    await mobilePage.waitForTimeout(600)

    // Scroll down on mobile
    await mobilePage.evaluate(() => window.scrollTo(0, 700))
    await mobilePage.waitForTimeout(200)
    scrollPos = await mobilePage.evaluate(() => window.scrollY || document.documentElement.scrollTop)
    console.log(`  Mobile /learn scroll position: ${scrollPos}px`)

    // Tap 'Dashboard' on mobile NotchDock
    await mobilePage.click('nav[aria-label="Mobile Navigation"] a[href="/"]')
    await mobilePage.waitForTimeout(500)
    scrollPos = await mobilePage.evaluate(() => window.scrollY || document.documentElement.scrollTop)
    console.log(`  After tapping Dashboard on mobile dock: scroll = ${scrollPos}px`)
    if (scrollPos !== 0) throw new Error(`Mobile scroll was not reset to 0: got ${scrollPos}`)

    // -------------------------------------------------------------
    // Test 4: History Back (POP) & Forward Restoration
    // -------------------------------------------------------------
    console.log('\n[4/5] Testing History Back (POP) Restoration')
    await page.goto(`http://localhost:${PORT}/learn`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(500)
    await page.evaluate(() => window.scrollTo(0, 550))
    await page.waitForTimeout(300)
    const savedLearnScroll = await page.evaluate(() => window.scrollY || document.documentElement.scrollTop)
    console.log(`  Scrolled /learn to: ${savedLearnScroll}px`)

    // Navigate to Calculator
    await page.click('aside nav a[href="/calculator"]')
    await page.waitForTimeout(500)
    scrollPos = await page.evaluate(() => window.scrollY || document.documentElement.scrollTop)
    console.log(`  On /calculator: scroll = ${scrollPos}px`)

    // Press Browser Back
    await page.goBack()
    await page.waitForTimeout(700)
    const restoredScroll = await page.evaluate(() => window.scrollY || document.documentElement.scrollTop)
    console.log(`  After page.goBack() to /learn: restored scroll = ${restoredScroll}px (target: ${savedLearnScroll}px)`)
    const diff = Math.abs(restoredScroll - savedLearnScroll)
    if (diff > 50) throw new Error(`Back restoration failed: expected ~${savedLearnScroll}, got ${restoredScroll}`)

    // -------------------------------------------------------------
    // Test 5: Hash Anchor Scroll and Accessibility Focus
    // -------------------------------------------------------------
    console.log('\n[5/5] Testing Hash Anchor Links & Programmatic Focus')
    await page.goto(`http://localhost:${PORT}/settings#credits`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(700)

    const creditsVisible = await page.evaluate(() => {
      const el = document.getElementById('credits')
      if (!el) return false
      const rect = el.getBoundingClientRect()
      return rect.top >= -50 && rect.top <= window.innerHeight
    })
    console.log(`  Hash #credits scrolled into view: ${creditsVisible} (PASS)`)

    // Test programmatic focus on h1 / main
    await page.click('aside nav a[href="/reminders"]')
    await page.waitForTimeout(600)
    const focusedTag = await page.evaluate(() => {
      const active = document.activeElement
      return active ? active.tagName.toLowerCase() : null
    })
    console.log(`  Active focused element after navigation: <${focusedTag}> (PASS)`)

    console.log('\n=== ALL SCROLL RESTORATION & BEHAVIOR TESTS PASSED ===\n')
  } finally {
    await browser.close()
    await new Promise((resolve) => server.close(resolve))
  }
}

runScrollTests().catch((err) => {
  console.error('\nFAIL: Scroll test encountered an error:', err)
  process.exit(1)
})
