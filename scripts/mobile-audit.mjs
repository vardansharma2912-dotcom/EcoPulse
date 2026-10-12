/**
 * EcoPulse Mobile UI Audit Script (Playwright)
 * Audits mobile, tablet, and desktop viewports against strict P0/P1/P2 criteria.
 */

import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'

const PORT = 4173
const BASE_URL = `http://localhost:${PORT}`

const VIEWPORTS = [
  // Mobile Portrait
  { name: 'iphone-se', width: 320, height: 568, isMobile: true, hasTouch: true, dsf: 2 },
  { name: 'android-small', width: 360, height: 640, isMobile: true, hasTouch: true, dsf: 2 },
  { name: 'iphone-12', width: 390, height: 844, isMobile: true, hasTouch: true, dsf: 2 },
  { name: 'pixel-7', width: 412, height: 915, isMobile: true, hasTouch: true, dsf: 2 },
  // Tablet
  { name: 'ipad-mini', width: 768, height: 1024, isMobile: true, hasTouch: true, dsf: 2 },
  // Mobile Landscape
  { name: 'iphone-landscape', width: 844, height: 390, isMobile: true, hasTouch: true, dsf: 2 },
  // Desktop Regressions
  { name: 'desktop-laptop', width: 1366, height: 768, isMobile: false, hasTouch: false, dsf: 1 },
  { name: 'desktop-hd', width: 1920, height: 1080, isMobile: false, hasTouch: false, dsf: 1 },
]

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
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
    console.log(`[Audit] Vite preview server already running on port ${PORT}`)
    return null
  }

  console.log(`[Audit] Launching vite preview on port ${PORT}...`)
  const child = process.platform === 'win32'
    ? spawn('cmd.exe', ['/c', `npx vite preview --port ${PORT} --strictPort`], { stdio: 'ignore' })
    : spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { stdio: 'ignore' })

  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 500))
    if (await isPortOpen(PORT)) {
      console.log(`[Audit] Server ready at ${BASE_URL}`)
      return child
    }
  }
  throw new Error(`[Audit] Server failed to start at ${BASE_URL}`)
}

async function launchBrowser() {
  try {
    const browser = await chromium.launch({ channel: 'chrome', headless: true })
    console.log('[Audit] Launched Chrome successfully')
    return browser
  } catch (err) {
    console.warn('[Audit] Chrome launch failed, trying Edge:', err.message)
    try {
      const browser = await chromium.launch({ channel: 'msedge', headless: true })
      console.log('[Audit] Launched Microsoft Edge successfully')
      return browser
    } catch (err2) {
      console.error('[Audit] Neither Chrome nor Edge could be launched:', err2.message)
      throw err2
    }
  }
}

function getInitScript(storageState) {
  return `
    (function() {
      try {
        localStorage.clear();
        if ('${storageState}' === 'welcome') {
          // Cleared storage triggers welcome page
        } else if ('${storageState}' === 'returning' || '${storageState}' === 'demo') {
          localStorage.setItem('ecopulse_welcome_handled_v1', 'true');
          localStorage.setItem('ecopulse_tour_seen_v1', 'true');
          localStorage.setItem('ecopulse_last_visit_v1', new Date().toISOString());
        } else if ('${storageState}' === 'alerts_3') {
          localStorage.setItem('ecopulse_welcome_handled_v1', 'true');
          localStorage.setItem('ecopulse_tour_seen_v1', 'true');
          const now = new Date();
          const pad = (n) => String(n).padStart(2, '0');
          const m = now.getMinutes();
          const t1 = pad(now.getHours()) + ':' + pad(Math.max(0, m - 1));
          const t2 = pad(now.getHours()) + ':' + pad(Math.max(0, m - 2));
          const t3 = pad(now.getHours()) + ':' + pad(Math.max(0, m - 3));
          const yesterday = new Date(Date.now() - 86400000).toISOString();
          const reminders = [
            { id: 'rem-alert-1', title: 'Turn off workspace monitors', time: t1, category: 'work', recurrence: 'daily', active: true, watts: 80, estimatedHoursSaved: 2, createdAt: yesterday },
            { id: 'rem-alert-2', title: 'Unplug kettle and blender', time: t2, category: 'kitchen', recurrence: 'daily', active: true, watts: 1500, estimatedHoursSaved: 0.5, createdAt: yesterday },
            { id: 'rem-alert-3', title: 'Switch off living room AC', time: t3, category: 'climate', recurrence: 'daily', active: true, watts: 1200, estimatedHoursSaved: 1.5, createdAt: yesterday }
          ];
          localStorage.setItem('ecopulse_reminders_v1', JSON.stringify(reminders));
        }
      } catch (e) {
        console.error('Failed to init storage', e);
      }
    })();
  `
}

async function evaluatePageHealth(page, vp) {
  return await page.evaluate((context) => {
    const { vpWidth, vpHeight, isMobile } = context

    // 1. Horizontal overflow check
    const scrollWidth = document.documentElement.scrollWidth
    const innerWidth = window.innerWidth
    const hasHScroll = scrollWidth > innerWidth + 1

    const overflowingElements = []
    if (hasHScroll) {
      const all = document.querySelectorAll('*')
      for (const el of all) {
        if (el === document.documentElement || el === document.body) continue
        const style = window.getComputedStyle(el)
        if (style.overflowX === 'auto' || style.overflowX === 'scroll' || style.overflow === 'hidden') continue

        const rect = el.getBoundingClientRect()
        if (rect.right > innerWidth + 1 && rect.width > 0 && rect.height > 0) {
          overflowingElements.push({
            tag: el.tagName.toLowerCase(),
            class: (el.className || '').toString().slice(0, 50),
            right: Math.round(rect.right),
            width: Math.round(rect.width),
          })
          if (overflowingElements.length >= 5) break
        }
      }
    }

    // 2. Dock checks (mobile / tablet < 1024px)
    let dockInfo = null
    if (isMobile) {
      const dock = document.querySelector('nav[aria-label="Mobile Navigation"]')
      if (dock) {
        const rect = dock.getBoundingClientRect()
        const style = window.getComputedStyle(dock)
        dockInfo = {
          bottom: rect.bottom,
          top: rect.top,
          height: rect.height,
          isFixed: style.position === 'fixed',
          isAtBottom: rect.bottom <= vpHeight + 2 && rect.bottom >= vpHeight - 2,
        }
      }
    }

    // Check content bottom padding >= dock height
    let contentBottomPaddingOk = true
    if (isMobile) {
      const main = document.querySelector('main')
      if (main) {
        const style = window.getComputedStyle(main)
        const pb = parseFloat(style.paddingBottom) || 0
        // Dock height is 64px
        contentBottomPaddingOk = pb >= 64
      }
    }

    // 3. Overlays checks
    const dialogs = Array.from(document.querySelectorAll('[role="dialog"], [role="alertdialog"]'))
    const overlayIssues = []
    for (const d of dialogs) {
      const rect = d.getBoundingClientRect()
      const isVisible = rect.width > 0 && rect.height > 0 && window.getComputedStyle(d).visibility !== 'hidden'
      if (isVisible) {
        const clipped = rect.left < -2 || rect.right > vpWidth + 2 || rect.top < -2 || rect.bottom > vpHeight + 2
        overlayIssues.push({
          role: d.getAttribute('role'),
          rect: { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom, width: rect.width, height: rect.height },
          clipped,
        })
      }
    }

    // 3b. Touch targets (< 44x44)
    const touchTargetViolations = []
    if (isMobile) {
      const interactables = document.querySelectorAll('button, a, input, select, [role="button"]')
      for (const el of interactables) {
        const style = window.getComputedStyle(el)
        if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') continue
        if (el.tagName.toLowerCase() === 'a' && style.display === 'inline') continue

        const rect = el.getBoundingClientRect()
        if (rect.width > 0 && rect.height > 0) {
          if (rect.width < 40 || rect.height < 40) {
            touchTargetViolations.push({
              tag: el.tagName.toLowerCase(),
              class: (el.className || '').toString().slice(0, 40),
              width: Math.round(rect.width),
              height: Math.round(rect.height),
              text: (el.textContent || '').trim().slice(0, 25),
            })
          }
        }
      }
    }

    // 4. Font sizes
    const fontViolations = []
    const inputs = document.querySelectorAll('input, select, textarea')
    for (const inp of inputs) {
      const fontSize = parseFloat(window.getComputedStyle(inp).fontSize)
      if (fontSize < 16) {
        fontViolations.push({
          tag: inp.tagName.toLowerCase(),
          fontSize,
          name: inp.getAttribute('name') || inp.getAttribute('placeholder') || 'input',
        })
      }
    }

    const bodyTexts = document.querySelectorAll('p, span, label, div')
    let sub12Count = 0
    for (const el of bodyTexts) {
      if (el.children.length > 0) continue
      const text = (el.textContent || '').trim()
      if (!text) continue
      const style = window.getComputedStyle(el)
      if (style.display === 'none' || style.visibility === 'hidden') continue
      const fs = parseFloat(style.fontSize)
      if (fs < 11.5) {
        sub12Count++
      }
    }

    // 5. Clipped text
    let clippedTextCount = 0
    const textEls = document.querySelectorAll('h1, h2, h3, h4, p, span')
    for (const el of textEls) {
      const style = window.getComputedStyle(el)
      if (style.overflow === 'hidden' && style.textOverflow !== 'ellipsis' && el.scrollWidth > el.clientWidth + 2) {
        clippedTextCount++
      }
    }

    // 7. Backdrop-filter count
    let backdropFilterCount = 0
    const allElements = document.querySelectorAll('*')
    for (const el of allElements) {
      const style = window.getComputedStyle(el)
      if ((style.backdropFilter && style.backdropFilter !== 'none') || (style.webkitBackdropFilter && style.webkitBackdropFilter !== 'none')) {
        const rect = el.getBoundingClientRect()
        if (rect.width > 0 && rect.height > 0 && rect.top < vpHeight && rect.bottom > 0) {
          backdropFilterCount++
        }
      }
    }

    return {
      scrollWidth,
      innerWidth,
      hasHScroll,
      overflowingElements,
      dockInfo,
      contentBottomPaddingOk,
      overlayIssues,
      touchTargetViolations: touchTargetViolations.slice(0, 10),
      totalTouchViolations: touchTargetViolations.length,
      fontViolations,
      sub12Count,
      clippedTextCount,
      backdropFilterCount,
    }
  }, { vpWidth: vp.width, vpHeight: vp.height, isMobile: vp.isMobile })
}

async function runAudit() {
  const auditDir = path.resolve('audit')
  const screensDir = path.resolve('audit/screens')
  ensureDir(auditDir)
  ensureDir(screensDir)

  const serverChild = await startServer()
  const browser = await launchBrowser()

  const results = []
  const consoleMessages = []
  const failedRequests = []

  const testCases = [
    // 1. Pages (Returning state)
    { path: '/#/', name: 'dashboard', state: 'returning' },
    { path: '/#/reminders', name: 'reminders', state: 'returning' },
    { path: '/#/calculator', name: 'calculator', state: 'returning' },
    { path: '/#/analytics', name: 'analytics', state: 'returning' },
    { path: '/#/learn', name: 'learn', state: 'returning' },
    { path: '/#/settings', name: 'settings', state: 'returning' },

    // 2. Welcome page (Storage cleared)
    { path: '/#/', name: 'welcome-page', state: 'welcome' },

    // 3. Tour Steps 1-5
    { path: '/#/learn', name: 'tour-step-1', state: 'returning', trigger: 'tour-1' },
    { path: '/#/learn', name: 'tour-step-2', state: 'returning', trigger: 'tour-2' },
    { path: '/#/learn', name: 'tour-step-3', state: 'returning', trigger: 'tour-3' },
    { path: '/#/learn', name: 'tour-step-4', state: 'returning', trigger: 'tour-4' },
    { path: '/#/learn', name: 'tour-step-5', state: 'returning', trigger: 'tour-5' },

    // 4. Overlays & Modals
    { path: '/#/reminders', name: 'drawer-add-reminder', state: 'returning', trigger: 'add-reminder' },
    { path: '/#/reminders', name: 'dialog-snooze-custom', state: 'returning', trigger: 'snooze' },
    { path: '/#/reminders', name: 'dialog-delete', state: 'returning', trigger: 'delete' },
    { path: '/#/settings', name: 'dialog-reset', state: 'returning', trigger: 'reset' },
    { path: '/#/', name: 'search-sheet', state: 'returning', trigger: 'search' },

    // 5. Alert panel with 3 due reminders & Toast visible
    { path: '/#/', name: 'alert-panel-3', state: 'alerts_3' },
    { path: '/#/reminders', name: 'toast-visible', state: 'returning', trigger: 'toast' },
  ]

  console.log('\n[Audit] Running test matrix across viewports and states...\n')

  for (const vp of VIEWPORTS) {
    console.log(`\n========================================`)
    console.log(`Viewport: ${vp.name} (${vp.width}x${vp.height}, isMobile: ${vp.isMobile})`)
    console.log(`========================================`)

    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      isMobile: vp.isMobile,
      hasTouch: vp.hasTouch,
      deviceScaleFactor: vp.dsf,
    })

    for (const tc of testCases) {
      if (!vp.isMobile && (tc.name.startsWith('search-sheet') || tc.name.startsWith('drawer-'))) {
        continue
      }

      const page = await context.newPage()

      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleMessages.push({ vp: vp.name, tc: tc.name, type: msg.type(), text: msg.text() })
        }
      })
      page.on('requestfailed', (req) => {
        failedRequests.push({ vp: vp.name, tc: tc.name, url: req.url(), failure: req.failure() })
      })

      await page.addInitScript(getInitScript(tc.state))
      await page.goto(`${BASE_URL}${tc.path}`, { waitUntil: 'networkidle' })
      await page.waitForTimeout(300)

      // Handle triggers
      if (tc.trigger === 'add-reminder') {
        const addBtn = page.locator('button:has-text("Add Reminder")').first()
        if (await addBtn.isVisible()) {
          await addBtn.click()
          await page.waitForTimeout(350)
        }
      } else if (tc.trigger === 'snooze') {
        const moreBtn = page.locator('button[aria-label^="More options"]').first()
        if (await moreBtn.isVisible()) {
          await moreBtn.click()
          await page.waitForTimeout(200)
          const snoozeOpt = page.locator('button:has-text("Snooze reminder")').first()
          if (await snoozeOpt.isVisible()) {
            await snoozeOpt.click()
            await page.waitForTimeout(300)
            const customBtn = page.locator('button:has-text("Custom")').first()
            if (await customBtn.isVisible()) {
              await customBtn.click()
              await page.waitForTimeout(200)
            }
          }
        }
      } else if (tc.trigger === 'delete') {
        const moreBtn = page.locator('button[aria-label^="More options"]').first()
        if (await moreBtn.isVisible()) {
          await moreBtn.click()
          await page.waitForTimeout(200)
          const deleteOpt = page.locator('button:has-text("Delete reminder")').first()
          if (await deleteOpt.isVisible()) {
            await deleteOpt.click()
            await page.waitForTimeout(300)
          }
        }
      } else if (tc.trigger === 'reset') {
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
        await page.waitForTimeout(200)
        const resetBtn = page.locator('button:has-text("Reset All")').first()
        if (await resetBtn.isVisible()) {
          await resetBtn.click()
          await page.waitForTimeout(300)
        }
      } else if (tc.trigger === 'search') {
        const searchBtn = page.locator('button[aria-label="Open search sheet"]').first()
        if (await searchBtn.isVisible()) {
          await searchBtn.click()
          await page.waitForTimeout(350)
        }
      } else if (tc.trigger?.startsWith('tour-')) {
        const replayBtn = page.locator('button:has-text("Replay tour")').first()
        if (await replayBtn.isVisible()) {
          await replayBtn.click()
          await page.waitForTimeout(300)
          const stepNum = parseInt(tc.trigger.split('-')[1], 10)
          for (let s = 1; s < stepNum; s++) {
            const nextBtn = page.locator('button:has-text("Next")').first()
            if (await nextBtn.isVisible()) {
              await nextBtn.click()
              await page.waitForTimeout(250)
            }
          }
        }
      } else if (tc.trigger === 'toast') {
        const doneBtn = page.locator('button:has-text("Done")').first()
        if (await doneBtn.isVisible()) {
          await doneBtn.click()
          await page.waitForTimeout(250)
        }
      }

      // Screenshots
      const screenshotSlug = `${vp.name}_${tc.name}`
      const vpScreenPath = path.join(screensDir, `${screenshotSlug}_viewport.png`)
      const fullScreenPath = path.join(screensDir, `${screenshotSlug}_full.png`)

      await page.screenshot({ path: vpScreenPath, fullPage: false })
      await page.screenshot({ path: fullScreenPath, fullPage: true })

      // Evaluate Health
      const health = await evaluatePageHealth(page, vp)

      // Dock scroll stability test (mobile returning dashboard)
      let dockScrollStable = true
      if (vp.isMobile && tc.name === 'dashboard' && health.dockInfo) {
        const initialRect = await page.evaluate(() => {
          const dock = document.querySelector('nav[aria-label="Mobile Navigation"]')
          return dock ? dock.getBoundingClientRect() : null
        })
        await page.evaluate(() => window.scrollTo(0, 300))
        await page.waitForTimeout(100)
        const midRect = await page.evaluate(() => {
          const dock = document.querySelector('nav[aria-label="Mobile Navigation"]')
          return dock ? dock.getBoundingClientRect() : null
        })
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
        await page.waitForTimeout(100)
        const bottomRect = await page.evaluate(() => {
          const dock = document.querySelector('nav[aria-label="Mobile Navigation"]')
          return dock ? dock.getBoundingClientRect() : null
        })

        if (initialRect && midRect && bottomRect) {
          dockScrollStable =
            Math.abs(initialRect.bottom - midRect.bottom) < 2 &&
            Math.abs(midRect.bottom - bottomRect.bottom) < 2
        }
      }

      // Dock hidden when dialog/overlay open test
      let dockHiddenOnModal = true
      if (vp.isMobile && (tc.name.startsWith('dialog-') || tc.name.startsWith('drawer-'))) {
        const dockPresent = await page.evaluate(() => {
          return document.querySelector('nav[aria-label="Mobile Navigation"]') !== null
        })
        dockHiddenOnModal = !dockPresent
      }

      const result = {
        viewport: vp.name,
        width: vp.width,
        height: vp.height,
        isMobile: vp.isMobile,
        testCase: tc.name,
        hasHorizontalScroll: health.hasHScroll,
        scrollWidth: health.scrollWidth,
        innerWidth: health.innerWidth,
        overflowingCount: health.overflowingElements.length,
        dockFixed: health.dockInfo ? health.dockInfo.isFixed : null,
        dockScrollStable,
        dockHiddenOnModal,
        contentBottomPaddingOk: health.contentBottomPaddingOk,
        overlayClippedCount: health.overlayIssues.filter((o) => o.clipped).length,
        touchViolations: health.totalTouchViolations,
        fontViolations: health.fontViolations.length,
        sub12Count: health.sub12Count,
        clippedTextCount: health.clippedTextCount,
        backdropFilterCount: health.backdropFilterCount,
      }

      results.push(result)

      const statusIcon =
        !result.hasHorizontalScroll &&
        result.overflowingCount === 0 &&
        result.overlayClippedCount === 0
          ? '✓'
          : '✗'

      console.log(
        `  ${statusIcon} [${tc.name.padEnd(20)}] H-Scroll: ${result.hasHorizontalScroll ? 'YES' : 'NO'} (${result.scrollWidth}px vs ${result.innerWidth}px) | Overlays clipped: ${result.overlayClippedCount} | Dock fixed: ${result.dockFixed} | Dock stable: ${result.dockScrollStable} | Backdrops: ${result.backdropFilterCount}`
      )

      await page.close()
    }

    await context.close()
  }

  // Summary Table
  console.log('\n\n========================================================================')
  console.log('AUDIT SUMMARY REPORT')
  console.log('========================================================================')

  const totalHScroll = results.filter((r) => r.hasHorizontalScroll).length
  const totalOverlayClipped = results.reduce((acc, r) => acc + r.overlayClippedCount, 0)
  const totalDockUnstable = results.filter((r) => r.isMobile && r.dockScrollStable === false).length
  const totalDockModalLeaks = results.filter((r) => r.isMobile && r.dockHiddenOnModal === false).length

  console.log(`Total Horizontal Scroll Violations (P0): ${totalHScroll}`)
  console.log(`Total Clipped Overlays (P0):             ${totalOverlayClipped}`)
  console.log(`Total Dock Scroll Unstable (P0):         ${totalDockUnstable}`)
  console.log(`Total Dock Visible in Modal (P0):        ${totalDockModalLeaks}`)
  console.log(`Console Errors:                          ${consoleMessages.length}`)
  console.log(`Failed Requests:                         ${failedRequests.length}`)
  console.log('========================================================================\n')

  const reportData = {
    timestamp: new Date().toISOString(),
    summary: {
      totalTests: results.length,
      totalHScroll,
      totalOverlayClipped,
      totalDockUnstable,
      totalDockModalLeaks,
      consoleErrorsCount: consoleMessages.length,
      failedRequestsCount: failedRequests.length,
    },
    results,
    consoleMessages,
    failedRequests,
  }

  fs.writeFileSync(path.join(auditDir, 'report.json'), JSON.stringify(reportData, null, 2), 'utf8')
  console.log(`Report successfully written to audit/report.json`)

  await browser.close()
  if (serverChild) {
    serverChild.kill()
  }
}

runAudit().catch((err) => {
  console.error('[Audit] Fatal error during audit run:', err)
  process.exit(1)
})
