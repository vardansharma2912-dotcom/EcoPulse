import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'

const PORT = 4173
const BASE_URL = `http://localhost:${PORT}`
const OUT_DIR = path.resolve('C:/Users/HP/.gemini/antigravity-ide/brain/4e82b64d-2aa0-4d0a-b064-c6548194aa54/first_run_screenshots')

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true })
}

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
    console.log(`[Verify] Server already running on port ${PORT}`)
    return null
  }

  console.log(`[Verify] Launching vite preview on port ${PORT}...`)
  const child = process.platform === 'win32'
    ? spawn('cmd.exe', ['/c', `npx vite preview --port ${PORT} --strictPort`], { stdio: 'ignore' })
    : spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { stdio: 'ignore' })

  for (let i = 0; i < 30; i++) {
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
    return await chromium.launch({ channel: 'chrome', headless: true })
  } catch {
    return await chromium.launch({ channel: 'msedge', headless: true })
  }
}

async function run() {
  const serverProcess = await startServer()
  const browser = await launchBrowser()

  try {
    // 1. Check 360x640: hero button visible without scrolling
    console.log('--- Checking 360x640 mobile viewport ---')
    const context360 = await browser.newContext({
      viewport: { width: 360, height: 640 },
      reducedMotion: 'reduce',
    })
    const page360 = await context360.newPage()
    await page360.goto(BASE_URL)
    await page360.evaluate(() => localStorage.clear())
    await page360.reload()
    await page360.waitForSelector('text=Welcome to EcoPulse')

    // Tap Skip on welcome screen
    const skipBtn360 = page360.locator('button:has-text("Skip for now")')
    if (await skipBtn360.isVisible()) {
      await skipBtn360.click()
    }
    await page360.waitForSelector('text=EcoPulse reminds you to switch things off.')
    await page360.waitForTimeout(1000)

    const heroBtn360 = page360.locator('button:has-text("Add my first reminder")')
    await heroBtn360.waitFor({ state: 'visible' })
    const heroBox = await heroBtn360.boundingBox()
    console.log(`[360x640] Hero primary button bounding box: y=${heroBox.y}, height=${heroBox.height}`)
    const isVisibleWithoutScroll = (heroBox.y + heroBox.height) <= 640
    console.log(`[360x640] Is hero button visible without scrolling? ${isVisibleWithoutScroll} (bottom at ${heroBox.y + heroBox.height}px <= 640px)`)
    await page360.screenshot({ path: path.join(OUT_DIR, '01_hero_card_360x640.png'), fullPage: false })
    await context360.close()

    // 2. Full Flow on 390x844 (Mobile iPhone standard)
    console.log('--- Running Full Flow on 390x844 ---')
    let tapCount = 0
    const contextMobile = await browser.newContext({
      viewport: { width: 390, height: 844 },
      reducedMotion: 'reduce',
    })
    const pageMobile = await contextMobile.newPage()
    await pageMobile.goto(BASE_URL)
    await pageMobile.evaluate(() => localStorage.clear())
    await pageMobile.reload()
    await pageMobile.waitForSelector('text=Welcome to EcoPulse')
    await pageMobile.waitForTimeout(300)

    // Step 1: Welcome Screen
    await pageMobile.screenshot({ path: path.join(OUT_DIR, '02_welcome_390x844.png') })
    console.log('Step 1 captured: Welcome screen')

    // Tap 1: Continue / Skip
    const skipBtn = pageMobile.locator('button:has-text("Skip for now")')
    await skipBtn.click()
    tapCount++
    console.log(`Tap ${tapCount}: Dismissed welcome screen`)
    await pageMobile.waitForSelector('text=EcoPulse reminds you to switch things off.')
    await pageMobile.waitForTimeout(1000)

    // Step 2: Dashboard with Hero Card
    await pageMobile.screenshot({ path: path.join(OUT_DIR, '03_hero_card_390x844.png') })
    console.log('Step 2 captured: Hero card on 390x844')

    // Tap 2: Tap a quick-add template (e.g. "Lights off when leaving")
    const templateBtn = pageMobile.locator('button:has-text("Lights off when leaving")')
    await templateBtn.waitFor({ state: 'visible' })
    await templateBtn.click()
    tapCount++
    console.log(`Tap ${tapCount}: Tapped quick-add template "Lights off when leaving"`)
    await pageMobile.waitForSelector('text=Add Reminder')
    await pageMobile.waitForTimeout(300)

    // Step 3: Reminder Form Dialog prefilled
    await pageMobile.screenshot({ path: path.join(OUT_DIR, '04_dialog_prefilled_390x844.png') })
    console.log('Step 3 captured: Prefilled reminder dialog')

    // Tap 3: Tap Save Reminder
    const saveBtn = pageMobile.locator('button:has-text("Save Reminder")')
    await saveBtn.click()
    tapCount++
    console.log(`Tap ${tapCount}: Tapped "Save Reminder"`)
    await pageMobile.waitForSelector('text=Nice. It will remind you at')
    await pageMobile.waitForTimeout(300)

    // Step 4: Toast notification & Simple View
    await pageMobile.screenshot({ path: path.join(OUT_DIR, '05_toast_and_simple_view_390x844.png') })
    console.log('Step 4 captured: Toast notification & Simple view')

    // Tap 4: Tap Done on the reminder card
    const doneBtn = pageMobile.locator('button:has-text("Done")')
    await doneBtn.waitFor({ state: 'visible' })
    await doneBtn.click()
    tapCount++
    console.log(`Tap ${tapCount}: Tapped "Done" on reminder`)
    await pageMobile.waitForTimeout(500)

    // Step 5: Full View after completion
    await pageMobile.screenshot({ path: path.join(OUT_DIR, '06_after_done_full_view_390x844.png') })
    console.log('Step 5 captured: Full view after first completion')
    console.log(`Total taps from clean state to first completed reminder: ${tapCount}`)
    await contextMobile.close()

    // 3. Desktop Flow on 1440x900
    console.log('--- Running Verification on 1440x900 Desktop ---')
    const contextDesktop = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      reducedMotion: 'reduce',
    })
    const pageDesktop = await contextDesktop.newPage()
    await pageDesktop.goto(BASE_URL)
    await pageDesktop.evaluate(() => localStorage.clear())
    await pageDesktop.reload()
    await pageDesktop.waitForSelector('text=Welcome to EcoPulse')

    const skipDesktop = pageDesktop.locator('button:has-text("Skip for now")')
    if (await skipDesktop.isVisible()) {
      await skipDesktop.click()
    }
    await pageDesktop.waitForSelector('text=EcoPulse reminds you to switch things off.')
    await pageDesktop.waitForTimeout(1000)

    await pageDesktop.screenshot({ path: path.join(OUT_DIR, '07_hero_card_1440x900.png') })
    console.log('Step captured: Hero card on 1440x900 Desktop')

    // Click template on desktop
    const deskTemplate = pageDesktop.locator('button:has-text("Lights off when leaving")')
    await deskTemplate.click()
    await pageDesktop.waitForSelector('text=Add Reminder')
    await pageDesktop.waitForTimeout(300)
    await pageDesktop.screenshot({ path: path.join(OUT_DIR, '08_dialog_prefilled_1440x900.png') })

    // Save
    await pageDesktop.locator('button:has-text("Save Reminder")').click()
    await pageDesktop.waitForSelector('text=Nice. It will remind you at')
    await pageDesktop.waitForTimeout(300)
    await pageDesktop.screenshot({ path: path.join(OUT_DIR, '09_toast_simple_view_1440x900.png') })

    // Click Done
    await pageDesktop.locator('button:has-text("Done")').click()
    await pageDesktop.waitForTimeout(500)
    await pageDesktop.screenshot({ path: path.join(OUT_DIR, '10_full_view_1440x900.png') })

    await contextDesktop.close()
    console.log('--- Verification successfully completed! ---')
  } finally {
    await browser.close()
    if (serverProcess) {
      serverProcess.kill()
    }
  }
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
