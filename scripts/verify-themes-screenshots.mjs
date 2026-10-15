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

function getSeedStorageScript(theme = 'light', mode = 'normal') {
  // mode: 'normal' (reminders + completions), 'empty' (0 reminders, clean slate), 'welcome', 'sample'
  const now = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  const dateStr = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

  const isWelcome = mode === 'welcome'
  const isEmpty = mode === 'empty'
  const isSample = mode === 'sample'

  let reminders = []
  let completions = []

  if (!isEmpty && !isWelcome) {
    reminders = [
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
        ...(isSample ? { isDemo: true } : {}),
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
          ...(isSample ? { isDemo: true } : {}),
        })
      }
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
        localStorage.setItem('ecopulse_tour_seen_v1', 'true');
        localStorage.setItem('ecopulse_app_state_v2', JSON.stringify(${JSON.stringify(state)}));
        document.documentElement.setAttribute('data-theme', '${theme}');
      } catch (err) {
        console.error('Failed to seed storage', err);
      }
    })();
  `
}

async function verifyHorizontalScroll(page, name) {
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
  const clientWidth = await page.evaluate(() => document.documentElement.clientWidth)
  if (scrollWidth > clientWidth) {
    console.error(`[OVERFLOW] Horizontal scroll on ${name}: scrollWidth=${scrollWidth} > clientWidth=${clientWidth}`)
    return false
  }
  return true
}

async function captureScenarios(page, theme, prefix, errorsList) {
  page.on('pageerror', (err) => {
    console.error(`[PAGE ERROR] [${prefix}-${theme}]`, err.message)
    errorsList.push(`[${prefix}-${theme}] ${err.message}`)
  })

  // 1. Welcome Screen
  console.log(`  -> ${prefix} ${theme}: Welcome Screen`)
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' })
  await page.evaluate(getSeedStorageScript(theme, 'welcome'))
  await page.reload({ waitUntil: 'networkidle' })
  await page.waitForTimeout(500)
  await verifyHorizontalScroll(page, `${prefix}-${theme}-welcome`)
  await page.screenshot({ path: path.join(OUT_DIR, `${prefix}-${theme}-welcome.png`) })

  // 2. Dashboard - 0 reminders (Clean state / Hero card)
  console.log(`  -> ${prefix} ${theme}: Dashboard (0 reminders / Hero card)`)
  await page.evaluate(getSeedStorageScript(theme, 'empty'))
  await page.reload({ waitUntil: 'networkidle' })
  await page.waitForSelector('text=EcoPulse reminds you to switch things off.')
  await page.waitForTimeout(500)
  await verifyHorizontalScroll(page, `${prefix}-${theme}-dashboard-0-reminders`)
  await page.screenshot({ path: path.join(OUT_DIR, `${prefix}-${theme}-dashboard-0-reminders.png`) })

  // 3. Tour Dialog (triggered from hero card or settings)
  console.log(`  -> ${prefix} ${theme}: Tour Dialog`)
  const tourWalkthroughBtn = page.locator('button:has-text("walkthrough"), button:has-text("Tour")').first()
  if (await tourWalkthroughBtn.isVisible()) {
    await tourWalkthroughBtn.click()
    await page.waitForTimeout(500)
    await page.screenshot({ path: path.join(OUT_DIR, `${prefix}-${theme}-tour.png`) })
    const skipTour = page.locator('button:has-text("Skip")').first()
    if (await skipTour.isVisible()) {
      await skipTour.click()
      await page.waitForTimeout(300)
    }
  }

  // 4. Dashboard - with Reminders & Completions
  console.log(`  -> ${prefix} ${theme}: Dashboard (with data)`)
  await page.evaluate(getSeedStorageScript(theme, 'normal'))
  await page.reload({ waitUntil: 'networkidle' })
  await page.waitForTimeout(500)
  await verifyHorizontalScroll(page, `${prefix}-${theme}-dashboard`)
  await page.screenshot({ path: path.join(OUT_DIR, `${prefix}-${theme}-dashboard.png`) })

  // 5. Dashboard - Sample Data ON
  console.log(`  -> ${prefix} ${theme}: Dashboard (sample data on)`)
  await page.evaluate(getSeedStorageScript(theme, 'sample'))
  await page.reload({ waitUntil: 'networkidle' })
  await page.waitForTimeout(500)
  await verifyHorizontalScroll(page, `${prefix}-${theme}-dashboard-sample-data`)
  await page.screenshot({ path: path.join(OUT_DIR, `${prefix}-${theme}-dashboard-sample-data.png`) })

  // 6. Reminders List Page
  console.log(`  -> ${prefix} ${theme}: Reminders Page`)
  await page.evaluate(getSeedStorageScript(theme, 'normal'))
  await page.goto(`${BASE_URL}/reminders`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(500)
  await verifyHorizontalScroll(page, `${prefix}-${theme}-reminders`)
  await page.screenshot({ path: path.join(OUT_DIR, `${prefix}-${theme}-reminders.png`) })

  // 7. Reminders Dialog / Drawer Open with Advanced Expanded
  console.log(`  -> ${prefix} ${theme}: Reminders Dialog / Drawer with Advanced Expanded`)
  const addBtn = page.locator('button:has-text("Add Reminder")').first()
  if (await addBtn.isVisible()) {
    await addBtn.click()
    await page.waitForSelector('text=Reminder Time (24h)')
    const advancedToggle = page.locator('button:has-text("Advanced options")').first()
    if (await advancedToggle.isVisible()) {
      // Check if already open or needs click
      const isExpanded = await advancedToggle.getAttribute('aria-expanded')
      if (isExpanded !== 'true') {
        await advancedToggle.click()
        await page.waitForTimeout(300)
      }
    }
    await page.waitForTimeout(400)
    await verifyHorizontalScroll(page, `${prefix}-${theme}-reminders-dialog`)
    await page.screenshot({ path: path.join(OUT_DIR, `${prefix}-${theme}-reminders-dialog.png`) })
    // Save screenshot as drawer if desktop
    if (prefix === 'desktop') {
      await page.screenshot({ path: path.join(OUT_DIR, `${prefix}-${theme}-drawer.png`) })
    }

    const cancelBtn = page.locator('button:has-text("Cancel")').first()
    if (await cancelBtn.isVisible()) {
      await cancelBtn.click()
      await page.waitForTimeout(400)
    }
  }

  // 8. Calculator Page
  console.log(`  -> ${prefix} ${theme}: Calculator Page`)
  await page.goto(`${BASE_URL}/calculator`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(500)
  await verifyHorizontalScroll(page, `${prefix}-${theme}-calculator`)
  await page.screenshot({ path: path.join(OUT_DIR, `${prefix}-${theme}-calculator.png`) })

  // 9. Analytics Page
  console.log(`  -> ${prefix} ${theme}: Analytics Page`)
  await page.goto(`${BASE_URL}/analytics`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(500)
  await verifyHorizontalScroll(page, `${prefix}-${theme}-analytics`)
  await page.screenshot({ path: path.join(OUT_DIR, `${prefix}-${theme}-analytics.png`) })

  // 10. Learn Page
  console.log(`  -> ${prefix} ${theme}: Learn Page`)
  await page.goto(`${BASE_URL}/learn`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(500)
  await verifyHorizontalScroll(page, `${prefix}-${theme}-learn`)
  await page.screenshot({ path: path.join(OUT_DIR, `${prefix}-${theme}-learn.png`) })

  // 11. Settings Page
  console.log(`  -> ${prefix} ${theme}: Settings Page`)
  await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(500)
  await verifyHorizontalScroll(page, `${prefix}-${theme}-settings`)
  await page.screenshot({ path: path.join(OUT_DIR, `${prefix}-${theme}-settings.png`) })

  // 12. Settings - Reset Dialog
  console.log(`  -> ${prefix} ${theme}: Settings Reset Dialog`)
  const resetBtn = page.locator('button:has-text("Reset All")').first()
  if (await resetBtn.isVisible()) {
    await resetBtn.click()
    await page.waitForTimeout(500)
    await page.screenshot({ path: path.join(OUT_DIR, `${prefix}-${theme}-reset-dialog.png`) })
    const keepBtn = page.locator('button:has-text("Keep My Data"), button:has-text("Cancel")').first()
    if (await keepBtn.isVisible()) {
      await keepBtn.click()
      await page.waitForTimeout(300)
    }
  }

  // 13. Toast Notification
  console.log(`  -> ${prefix} ${theme}: Toast Notification`)
  const saveBtn = page.locator('button:has-text("Save Settings")').first()
  if (await saveBtn.isVisible()) {
    await saveBtn.click()
    await page.waitForTimeout(300)
    await page.screenshot({ path: path.join(OUT_DIR, `${prefix}-${theme}-toast.png`) })
  }

  // 14. 404 Page
  console.log(`  -> ${prefix} ${theme}: 404 Page`)
  await page.goto(`${BASE_URL}/non-existent-page-route`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(500)
  await verifyHorizontalScroll(page, `${prefix}-${theme}-404`)
  await page.screenshot({ path: path.join(OUT_DIR, `${prefix}-${theme}-404.png`) })

  // 15. Alert Panel / Mobile Drawer Popover
  console.log(`  -> ${prefix} ${theme}: Alert Panel`)
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(500)
  const alertBell = page.locator('button[aria-label*="alert" i], button[aria-label*="notification" i]').first()
  if (await alertBell.isVisible()) {
    await alertBell.click()
    await page.waitForTimeout(500)
    await page.screenshot({ path: path.join(OUT_DIR, `${prefix}-${theme}-alert-panel.png`) })
    // Close popover
    await page.keyboard.press('Escape')
    await page.waitForTimeout(300)
  }
}

async function run() {
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true })
  }

  const serverProcess = await startServer()
  const browser = await launchBrowser()
  const pageErrors = []

  try {
    // Check 360x640: Hero button visible without scrolling
    console.log('--- Checking 360x640 Phone Viewport ---')
    const context360 = await browser.newContext({
      viewport: { width: 360, height: 640 },
      reducedMotion: 'reduce',
    })
    const page360 = await context360.newPage()
    await page360.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' })
    await page360.evaluate(getSeedStorageScript('light', 'empty'))
    await page360.reload({ waitUntil: 'networkidle' })
    await page360.waitForSelector('text=EcoPulse reminds you to switch things off.')
    await page360.waitForTimeout(500)

    const heroBtn = page360.locator('button:has-text("Add my first reminder")')
    await heroBtn.waitFor({ state: 'visible' })
    const box = await heroBtn.boundingBox()
    console.log(`[360x640] Hero button y=${box.y}, height=${box.height}, bottom=${box.y + box.height}`)
    const visibleAboveFold = (box.y + box.height) <= 640
    console.log(`[360x640] Is hero button visible without scrolling? ${visibleAboveFold}`)
    await page360.screenshot({ path: path.join(OUT_DIR, 'mobile-360x640-hero.png') })
    await context360.close()

    // Desktop Context (1440x900)
    console.log('--- Desktop Context (1440x900) ---')
    const desktopContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1,
      reducedMotion: 'reduce',
    })
    const desktopPage = await desktopContext.newPage()
    console.log('Capturing Desktop Light...')
    await captureScenarios(desktopPage, 'light', 'desktop', pageErrors)
    console.log('Capturing Desktop Dark...')
    await captureScenarios(desktopPage, 'dark', 'desktop', pageErrors)
    await desktopContext.close()

    // Mobile Context (390x844)
    console.log('--- Mobile Context (390x844) ---')
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
      deviceScaleFactor: 1,
      reducedMotion: 'reduce',
    })
    const mobilePage = await mobileContext.newPage()
    console.log('Capturing Mobile Light...')
    await captureScenarios(mobilePage, 'light', 'mobile', pageErrors)
    console.log('Capturing Mobile Dark...')
    await captureScenarios(mobilePage, 'dark', 'mobile', pageErrors)
    await mobileContext.close()

    console.log('--- Verification Script Completed ---')
    console.log(`Total collected page errors: ${pageErrors.length}`)
    if (pageErrors.length > 0) {
      console.error('Page errors encountered:', pageErrors)
    }
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
  console.error('[Verify] Fatal error:', err)
  process.exit(1)
})
