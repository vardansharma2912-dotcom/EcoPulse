/**
 * EcoPulse Screenshot Capture Script (Playwright)
 * Captures clean desktop and mobile screenshots for docs/ and README.md.
 */

import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'

const PORT = 4173
const BASE_URL = `http://localhost:${PORT}`
const DOCS_DIR = path.resolve(process.cwd(), 'docs')

function isPortOpen(port) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}`, () => resolve(true))
    req.on('error', () => resolve(false))
    req.setTimeout(400, () => {
      req.destroy()
      resolve(false)
    })
  })
}

async function startServer() {
  const open = await isPortOpen(PORT)
  if (open) {
    console.log(`[Screenshots] Preview server already running on port ${PORT}`)
    return null
  }

  console.log(`[Screenshots] Launching vite preview on port ${PORT}...`)
  const child = process.platform === 'win32'
    ? spawn('cmd.exe', ['/c', `npx vite preview --port ${PORT} --strictPort`], { stdio: 'ignore' })
    : spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { stdio: 'ignore' })

  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 500))
    if (await isPortOpen(PORT)) {
      console.log(`[Screenshots] Server ready at ${BASE_URL}`)
      return child
    }
  }
  throw new Error(`[Screenshots] Server failed to start at ${BASE_URL}`)
}

async function launchBrowser() {
  try {
    const browser = await chromium.launch({ channel: 'chrome', headless: true })
    console.log('[Screenshots] Launched Chrome successfully')
    return browser
  } catch (err) {
    console.warn('[Screenshots] Chrome launch failed, trying Edge:', err.message)
    const browser = await chromium.launch({ channel: 'msedge', headless: true })
    console.log('[Screenshots] Launched Microsoft Edge successfully')
    return browser
  }
}

function getSeedStorageScript() {
  const now = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  const dateStr = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

  const reminders = [
    {
      id: 'rem-light',
      title: 'Turn off study desk lamp & room lights',
      category: 'lighting',
      time: '22:30',
      recurrence: 'daily',
      applianceWatts: 40,
      avoidedHours: 4,
      active: true,
      createdAt: new Date(now.getTime() - 14 * 86400000).toISOString(),
    },
    {
      id: 'rem-fan',
      title: 'Switch off ceiling fan when leaving room',
      category: 'cooling',
      time: '11:00',
      recurrence: 'daily',
      applianceWatts: 75,
      avoidedHours: 3,
      active: true,
      createdAt: new Date(now.getTime() - 14 * 86400000).toISOString(),
    },
    {
      id: 'rem-charger',
      title: 'Unplug laptop charger & phone adapter',
      category: 'chargers',
      time: '08:00',
      recurrence: 'weekdays',
      applianceWatts: 15,
      avoidedHours: 8,
      active: true,
      createdAt: new Date(now.getTime() - 14 * 86400000).toISOString(),
    },
    {
      id: 'rem-pc',
      title: 'Power down desktop PC & monitor power strip',
      category: 'computing',
      time: '23:00',
      recurrence: 'daily',
      applianceWatts: 65,
      avoidedHours: 6,
      active: true,
      createdAt: new Date(now.getTime() - 14 * 86400000).toISOString(),
    },
  ]

  const completions = []
  // Past 10 days of completions
  for (let i = 0; i < 10; i++) {
    const d = new Date(now.getTime() - i * 86400000)
    const ds = dateStr(d)
    completions.push({
      id: `comp-light-${i}`,
      reminderId: 'rem-light',
      title: 'Turn off study desk lamp & room lights',
      date: ds,
      completedAt: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 22, 35).toISOString(),
      kWh: 0.16,
      costSaved: 1.28,
      tariffAtTime: 8,
    })
    if (i % 2 === 0) {
      completions.push({
        id: `comp-fan-${i}`,
        reminderId: 'rem-fan',
        title: 'Switch off ceiling fan when leaving room',
        date: ds,
        completedAt: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 11, 15).toISOString(),
        kWh: 0.225,
        costSaved: 1.8,
        tariffAtTime: 8,
      })
    }
  }

  const state = {
    reminders,
    completions,
    settings: {
      displayName: 'Campus Eco Warrior',
      tariffPerKwh: 8,
      currency: '₹',
      notificationsEnabled: true,
    },
    lastUpdated: now.toISOString(),
  }

  return `
    (function() {
      try {
        localStorage.clear();
        localStorage.setItem('ecopulse_welcome_handled_v1', 'true');
        localStorage.setItem('ecopulse_tour_seen_v1', 'true');
        localStorage.setItem('ecopulse_app_state_v2', JSON.stringify(${JSON.stringify(state)}));
      } catch (err) {
        console.error('Failed to seed storage for screenshot', err);
      }
    })();
  `
}

async function run() {
  if (!fs.existsSync(DOCS_DIR)) {
    fs.mkdirSync(DOCS_DIR, { recursive: true })
  }

  const serverProcess = await startServer()
  const browser = await launchBrowser()

  try {
    // 1. Desktop context (1440x900)
    const desktopContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2,
    })
    const desktopPage = await desktopContext.newPage()
    await desktopPage.goto(BASE_URL, { waitUntil: 'networkidle' })
    await desktopPage.evaluate(getSeedStorageScript())
    await desktopPage.reload({ waitUntil: 'networkidle' })
    await desktopPage.waitForTimeout(800)

    // Capture Desktop Dashboard
    const desktopDashPath = path.join(DOCS_DIR, 'screenshot-desktop-dashboard.png')
    await desktopPage.screenshot({ path: desktopDashPath, fullPage: false })
    console.log(`[Screenshots] Saved ${desktopDashPath}`)

    // Capture Desktop Analytics
    await desktopPage.goto(`${BASE_URL}/#/analytics`, { waitUntil: 'networkidle' })
    await desktopPage.waitForTimeout(800)
    const desktopAnalyticsPath = path.join(DOCS_DIR, 'screenshot-desktop-analytics.png')
    await desktopPage.screenshot({ path: desktopAnalyticsPath, fullPage: false })
    console.log(`[Screenshots] Saved ${desktopAnalyticsPath}`)

    // Capture Desktop Calculator
    await desktopPage.goto(`${BASE_URL}/#/calculator`, { waitUntil: 'networkidle' })
    await desktopPage.waitForTimeout(800)
    const desktopCalcPath = path.join(DOCS_DIR, 'screenshot-desktop-calculator.png')
    await desktopPage.screenshot({ path: desktopCalcPath, fullPage: false })
    console.log(`[Screenshots] Saved ${desktopCalcPath}`)

    // Capture Desktop Learn Hub
    await desktopPage.goto(`${BASE_URL}/#/learn`, { waitUntil: 'networkidle' })
    await desktopPage.waitForTimeout(800)
    const desktopLearnPath = path.join(DOCS_DIR, 'screenshot-desktop-learn.png')
    await desktopPage.screenshot({ path: desktopLearnPath, fullPage: false })
    console.log(`[Screenshots] Saved ${desktopLearnPath}`)

    await desktopContext.close()

    // 2. Mobile context (iPhone 12/14/15 size: 390x844, touch, mobile)
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
      deviceScaleFactor: 2,
    })
    const mobilePage = await mobileContext.newPage()
    await mobilePage.goto(BASE_URL, { waitUntil: 'networkidle' })
    await mobilePage.evaluate(getSeedStorageScript())
    await mobilePage.reload({ waitUntil: 'networkidle' })
    await mobilePage.waitForTimeout(800)

    // Capture Mobile Dashboard
    const mobileDashPath = path.join(DOCS_DIR, 'screenshot-mobile-dashboard.png')
    await mobilePage.screenshot({ path: mobileDashPath, fullPage: false })
    console.log(`[Screenshots] Saved ${mobileDashPath}`)

    // Capture Mobile Analytics
    await mobilePage.goto(`${BASE_URL}/#/analytics`, { waitUntil: 'networkidle' })
    await mobilePage.waitForTimeout(800)
    const mobileAnalyticsPath = path.join(DOCS_DIR, 'screenshot-mobile-analytics.png')
    await mobilePage.screenshot({ path: mobileAnalyticsPath, fullPage: false })
    console.log(`[Screenshots] Saved ${mobileAnalyticsPath}`)

    await mobileContext.close()
    console.log('[Screenshots] All screenshots captured successfully!')
  } finally {
    await browser.close()
    if (serverProcess) {
      if (process.platform === 'win32') {
        spawn('taskkill', ['/pid', String(serverProcess.pid), '/f', '/t'])
      } else {
        serverProcess.kill('SIGTERM')
      }
    }
  }
}

run().catch((err) => {
  console.error('[Screenshots] Failed:', err)
  process.exit(1)
})
