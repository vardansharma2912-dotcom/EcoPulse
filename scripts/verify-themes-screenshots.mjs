import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'

const PORT = 4173
const BASE_URL = `http://localhost:${PORT}`
const OUT_DIR = path.resolve(process.cwd(), 'docs/verify')

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
    console.log(`[Verify] Preview server already running on port ${PORT}`)
    return null
  }

  console.log(`[Verify] Launching vite preview on port ${PORT}...`)
  const child = process.platform === 'win32'
    ? spawn('cmd.exe', ['/c', `npx vite preview --port ${PORT} --strictPort`], { stdio: 'ignore' })
    : spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { stdio: 'ignore' })

  for (let i = 0; i < 40; i++) {
    await new Promise((r) => setTimeout(r, 500))
    if (await isPortOpen(PORT)) {
      console.log(`[Verify] Server ready at ${BASE_URL}`)
      return child
    }
  }
  throw new Error(`[Verify] Server failed to start at ${BASE_URL}`)
}

async function launchBrowser() {
  try {
    const browser = await chromium.launch({ channel: 'chrome', headless: true })
    console.log('[Verify] Launched Chrome successfully')
    return browser
  } catch (err) {
    console.warn('[Verify] Chrome launch failed, trying Edge:', err.message)
    const browser = await chromium.launch({ channel: 'msedge', headless: true })
    console.log('[Verify] Launched Microsoft Edge successfully')
    return browser
  }
}

function getSeedStorageScript(theme = 'light', isWelcome = false, isTour = false) {
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
      displayName: isWelcome ? '' : 'Campus Eco Warrior',
      tariffPerKwh: 8,
      currency: '₹',
      notificationsEnabled: true,
      theme: theme,
    },
    lastUpdated: now.toISOString(),
  }

  return `
    (function() {
      try {
        localStorage.clear();
        localStorage.setItem('ecopulse_theme_v1', '${theme}');
        if (!${isWelcome}) {
          localStorage.setItem('ecopulse_welcome_handled_v1', 'true');
        }
        if (!${isTour}) {
          localStorage.setItem('ecopulse_tour_seen_v1', 'true');
        }
        localStorage.setItem('ecopulse_app_state_v2', JSON.stringify(${JSON.stringify(state)}));
        document.documentElement.setAttribute('data-theme', '${theme}');
      } catch (err) {
        console.error('Failed to seed storage', err);
      }
    })();
  `
}

async function captureScenarios(page, theme, prefix) {
  // 1. Dashboard
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' })
  await page.evaluate(getSeedStorageScript(theme, false, false))
  await page.reload({ waitUntil: 'networkidle' })
  await page.waitForTimeout(600)
  await page.screenshot({ path: path.join(OUT_DIR, `${prefix}-${theme}-dashboard.png`) })

  // 2. Reminders
  await page.goto(`${BASE_URL}/reminders`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(600)
  await page.screenshot({ path: path.join(OUT_DIR, `${prefix}-${theme}-reminders.png`) })

  // 3. Reminders with Dialog / Drawer open
  const addBtn = page.locator('button:has-text("New Reminder"), button:has-text("Add Reminder")').first()
  if (await addBtn.isVisible()) {
    await addBtn.click()
    await page.waitForTimeout(600)
    await page.screenshot({ path: path.join(OUT_DIR, `${prefix}-${theme}-reminders-dialog.png`) })
    const cancelBtn = page.locator('button:has-text("Cancel")').first()
    if (await cancelBtn.isVisible()) {
      await cancelBtn.click()
      await page.waitForTimeout(400)
    }
  }

  // 4. Calculator
  await page.goto(`${BASE_URL}/calculator`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(600)
  await page.screenshot({ path: path.join(OUT_DIR, `${prefix}-${theme}-calculator.png`) })

  // 5. Analytics
  await page.goto(`${BASE_URL}/analytics`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(600)
  await page.screenshot({ path: path.join(OUT_DIR, `${prefix}-${theme}-analytics.png`) })

  // 6. Learn
  await page.goto(`${BASE_URL}/learn`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(600)
  await page.screenshot({ path: path.join(OUT_DIR, `${prefix}-${theme}-learn.png`) })

  // 7. Settings
  await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(600)
  await page.screenshot({ path: path.join(OUT_DIR, `${prefix}-${theme}-settings.png`) })

  // 8. Settings Reset Dialog
  const resetBtn = page.locator('button:has-text("Reset All")').first()
  if (await resetBtn.isVisible()) {
    await resetBtn.click()
    await page.waitForTimeout(600)
    await page.screenshot({ path: path.join(OUT_DIR, `${prefix}-${theme}-reset-dialog.png`) })
    const keepBtn = page.locator('button:has-text("Keep My Data"), button:has-text("Cancel")').first()
    if (await keepBtn.isVisible()) {
      await keepBtn.click()
      await page.waitForTimeout(400)
    }
  }

  // 9. Toast notification
  const saveBtn = page.locator('button:has-text("Save Settings")').first()
  if (await saveBtn.isVisible()) {
    await saveBtn.click()
    await page.waitForTimeout(400)
    await page.screenshot({ path: path.join(OUT_DIR, `${prefix}-${theme}-toast.png`) })
  }

  // 10. Tour Dialog (Replay tour)
  const replayTourBtn = page.locator('button:has-text("Replay tour")').first()
  if (await replayTourBtn.isVisible()) {
    await replayTourBtn.click()
    await page.waitForTimeout(600)
    await page.screenshot({ path: path.join(OUT_DIR, `${prefix}-${theme}-tour.png`) })
    const closeBtn = page.locator('button[aria-label="Close tour"], button:has-text("Skip"), button:has-text("Done")').first()
    if (await closeBtn.isVisible()) {
      await closeBtn.click()
      await page.waitForTimeout(400)
    }
  }

  // 11. Welcome Screen
  await page.evaluate(getSeedStorageScript(theme, true, false))
  await page.reload({ waitUntil: 'networkidle' })
  await page.waitForTimeout(600)
  await page.screenshot({ path: path.join(OUT_DIR, `${prefix}-${theme}-welcome.png`) })

  // 12. 404 Page
  await page.evaluate(getSeedStorageScript(theme, false, false))
  await page.goto(`${BASE_URL}/404-page-not-found`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(600)
  await page.screenshot({ path: path.join(OUT_DIR, `${prefix}-${theme}-404.png`) })

  // 13. Alert panel / Drawer (on mobile)
  if (prefix === 'mobile') {
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(600)
    const alertBell = page.locator('button[aria-label*="alert" i], button[aria-label*="notification" i]').first()
    if (await alertBell.isVisible()) {
      await alertBell.click()
      await page.waitForTimeout(500)
      await page.screenshot({ path: path.join(OUT_DIR, `${prefix}-${theme}-alert-panel.png`) })
    }
  }
}

async function run() {
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true })
  }

  const serverProcess = await startServer()
  const browser = await launchBrowser()

  try {
    // 1. Desktop context (1440x900)
    console.log('[Verify] Starting Desktop captures...')
    const desktopContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1,
      reducedMotion: 'reduce',
    })
    const desktopPage = await desktopContext.newPage()

    console.log('[Verify] Desktop Light mode...')
    await captureScenarios(desktopPage, 'light', 'desktop')

    console.log('[Verify] Desktop Dark mode...')
    await captureScenarios(desktopPage, 'dark', 'desktop')

    await desktopContext.close()

    // 2. Mobile context (390x844)
    console.log('[Verify] Starting Mobile captures...')
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
      deviceScaleFactor: 1,
      reducedMotion: 'reduce',
    })
    const mobilePage = await mobileContext.newPage()

    console.log('[Verify] Mobile Light mode...')
    await captureScenarios(mobilePage, 'light', 'mobile')

    console.log('[Verify] Mobile Dark mode...')
    await captureScenarios(mobilePage, 'dark', 'mobile')

    await mobileContext.close()

    console.log('[Verify] All verification screenshots completed!')
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
  console.error('[Verify] Error occurred:', err)
  process.exit(1)
})
