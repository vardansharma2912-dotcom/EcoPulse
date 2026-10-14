import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { chromium } from 'playwright'

const DIST_DIR = path.resolve(process.cwd(), 'dist')
const AUDIT_DIR = path.resolve(process.cwd(), 'audit', 'filler')
const PORT = 4199

if (!fs.existsSync(AUDIT_DIR)) {
  fs.mkdirSync(AUDIT_DIR, { recursive: true })
}

function startStaticServer() {
  const server = http.createServer((req, res) => {
    const urlPath = req.url.split('?')[0]
    let filePath

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
        filePath = path.join(DIST_DIR, 'index.html')
      }
    }

    if (!fs.existsSync(filePath)) {
      res.writeHead(404, { 'Content-Type': 'text/plain' })
      res.end('Not Found')
      return
    }

    const ext = path.extname(filePath)
    let contentType = 'text/html; charset=utf-8'
    if (ext === '.js') contentType = 'application/javascript'
    else if (ext === '.css') contentType = 'text/css'
    else if (ext === '.json' || ext === '.webmanifest') contentType = 'application/json'
    else if (ext === '.png') contentType = 'image/png'
    else if (ext === '.webp') contentType = 'image/webp'
    else if (ext === '.svg') contentType = 'image/svg+xml'
    else if (ext === '.woff2') contentType = 'font/woff2'

    res.writeHead(200, { 'Content-Type': contentType })
    res.end(fs.readFileSync(filePath))
  })

  return new Promise((resolve) => {
    server.listen(PORT, () => resolve(server))
  })
}

// Generate state payloads
function getStorageData(stateKey) {
  const today = new Date().toISOString().split('T')[0]
  const nowIso = new Date().toISOString()

  const rem1 = {
    id: 'rem-1',
    title: 'Turn off room lights before leaving',
    category: 'lighting',
    time: '09:00',
    recurrence: 'daily',
    applianceWatts: 40,
    avoidedHours: 3,
    active: true,
    createdAt: nowIso,
  }
  const rem2 = {
    id: 'rem-2',
    title: 'Switch off ceiling fan when room is unoccupied',
    category: 'cooling',
    time: '10:00',
    recurrence: 'daily',
    applianceWatts: 75,
    avoidedHours: 4,
    active: true,
    createdAt: nowIso,
  }
  const rem3 = {
    id: 'rem-3',
    title: 'Unplug phone & device chargers from wall socket',
    category: 'chargers',
    time: '08:00',
    recurrence: 'daily',
    applianceWatts: 10,
    avoidedHours: 8,
    active: true,
    createdAt: nowIso,
  }
  const rem4 = {
    id: 'rem-4',
    title: 'Put laptop on power-saving / sleep mode during lunch',
    category: 'computing',
    time: '13:00',
    recurrence: 'weekdays',
    applianceWatts: 65,
    avoidedHours: 2,
    active: true,
    createdAt: nowIso,
  }
  const rem5 = {
    id: 'rem-5',
    title: 'Switch off monitor & desk setup power strip at night',
    category: 'standby',
    time: '23:00',
    recurrence: 'daily',
    applianceWatts: 45,
    avoidedHours: 7,
    active: true,
    createdAt: nowIso,
  }
  const rem6 = {
    id: 'rem-6',
    title: 'Check and turn off shared corridor lights',
    category: 'shared',
    time: '21:30',
    recurrence: 'daily',
    applianceWatts: 60,
    avoidedHours: 5,
    active: true,
    createdAt: nowIso,
  }

  const baseSettings = {
    displayName: 'Vardan',
    tariffPerKwh: 8,
    currency: '₹',
    notificationsEnabled: false,
  }

  if (stateKey === 'fresh/0 reminders') {
    return {
      reminders: [],
      completions: [],
      settings: baseSettings,
      lastUpdated: nowIso,
    }
  }

  if (stateKey === '2 reminders all done') {
    return {
      reminders: [rem1, rem2],
      completions: [
        {
          id: 'comp-1',
          reminderId: 'rem-1',
          title: rem1.title,
          date: today,
          completedAt: nowIso,
          kWh: 0.12,
          costSaved: 0.96,
          tariffAtTime: 8,
        },
        {
          id: 'comp-2',
          reminderId: 'rem-2',
          title: rem2.title,
          date: today,
          completedAt: nowIso,
          kWh: 0.3,
          costSaved: 2.4,
          tariffAtTime: 8,
        },
      ],
      settings: baseSettings,
      lastUpdated: nowIso,
    }
  }

  if (stateKey === 'sample data on') {
    const sampleCompletions = []
    for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
      const d = new Date()
      d.setDate(d.getDate() - dayOffset)
      const dStr = d.toISOString().split('T')[0]
      sampleCompletions.push({
        id: `sample-${dayOffset}-1`,
        reminderId: 'rem-1',
        title: rem1.title,
        date: dStr,
        completedAt: d.toISOString(),
        kWh: 0.12,
        costSaved: 0.96,
        tariffAtTime: 8,
        isDemo: true,
      })
      if (dayOffset % 2 === 0) {
        sampleCompletions.push({
          id: `sample-${dayOffset}-2`,
          reminderId: 'rem-2',
          title: rem2.title,
          date: dStr,
          completedAt: d.toISOString(),
          kWh: 0.3,
          costSaved: 2.4,
          tariffAtTime: 8,
          isDemo: true,
        })
      }
    }
    return {
      reminders: [rem1, rem2, rem3, rem4],
      completions: sampleCompletions,
      settings: baseSettings,
      lastUpdated: nowIso,
    }
  }

  if (stateKey === 'many reminders') {
    return {
      reminders: [rem1, rem2, rem3, rem4, rem5, rem6],
      completions: [
        {
          id: 'comp-1',
          reminderId: 'rem-1',
          title: rem1.title,
          date: today,
          completedAt: nowIso,
          kWh: 0.12,
          costSaved: 0.96,
          tariffAtTime: 8,
        },
        {
          id: 'comp-3',
          reminderId: 'rem-3',
          title: rem3.title,
          date: today,
          completedAt: nowIso,
          kWh: 0.08,
          costSaved: 0.64,
          tariffAtTime: 8,
        },
      ],
      settings: baseSettings,
      lastUpdated: nowIso,
    }
  }

  throw new Error(`Unknown stateKey: ${stateKey}`)
}

const PAGES = [
  { name: 'Dashboard', route: '/' },
  { name: 'Calculator', route: '/calculator' },
  { name: 'Reminders', route: '/reminders' },
  { name: 'Analytics', route: '/analytics' },
  { name: 'Learn', route: '/learn' },
]

const VIEWPORTS = [
  { width: 1024, height: 768, label: '1024x768' },
  { width: 1280, height: 800, label: '1280x800' },
  { width: 1440, height: 900, label: '1440x900' },
  { width: 1920, height: 1080, label: '1920x1080' },
  { width: 2560, height: 1440, label: '2560x1440' },
]

const STATES = [
  'fresh/0 reminders',
  '2 reminders all done',
  'sample data on',
  'many reminders',
]

async function runAudit() {
  console.log('Starting Adaptive FillerSlot Playwright Audit...')
  const server = await startStaticServer()
  console.log(`Static server running on http://localhost:${PORT}`)

  const browser = await chromium.launch({ channel: 'chrome', headless: true })
  const results = []

  let totalRuns = 0
  let passCount = 0
  let failCount = 0

  for (const pageConfig of PAGES) {
    for (const vp of VIEWPORTS) {
      for (const st of STATES) {
        totalRuns++
        const context = await browser.newContext({
          viewport: { width: vp.width, height: vp.height },
          deviceScaleFactor: 1,
        })

        const storagePayload = getStorageData(st)

        // Inject initial state before document loads
        await context.addInitScript(
          ({ payload }) => {
            localStorage.setItem('ecopulse_welcome_handled_v1', 'true')
            localStorage.setItem('ecopulse_tour_seen_v1', 'true')
            localStorage.setItem('ecopulse_app_state_v2', JSON.stringify(payload))

            window.__layoutShifts = 0
            window.__firstPaintSettled = false
            try {
              const po = new PerformanceObserver((entryList) => {
                for (const entry of entryList.getEntries()) {
                  if (window.__firstPaintSettled && !entry.hadRecentInput) {
                    window.__layoutShifts += entry.value
                  }
                }
              })
              po.observe({ type: 'layout-shift', buffered: true })
            } catch (err) {
              console.error(err)
            }
          },
          { payload: storagePayload }
        )

        const page = await context.newPage()

        await page.goto(`http://localhost:${PORT}${pageConfig.route}`, {
          waitUntil: 'networkidle',
        })

        // Wait for fonts and initial paint to settle
        await page.evaluate(async () => {
          if (document.fonts) {
            await document.fonts.ready
          }
          await new Promise((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(resolve))
          )
        })
        await page.waitForTimeout(400)

        // Mark first paint settled and reset layout shifts counter
        await page.evaluate(() => {
          window.__layoutShifts = 0
          window.__firstPaintSettled = true
        })

        // Settle window for 300ms to capture any post-first-paint layout shifts
        await page.waitForTimeout(300)

        // Measure filler and layout metrics
        const metrics = await page.evaluate(() => {
          const slot = document.querySelector('[data-filler-slot="true"]')
          const fillerId = slot
            ? slot.getAttribute('data-filler-id') ||
              slot.getAttribute('data-filler-ids') ||
              'unknown'
            : 'none'

          const fillerHeight = slot ? slot.offsetHeight : 0
          const attrGapBefore = slot
            ? parseFloat(slot.getAttribute('data-gap-before') || '0')
            : 0

          // Layout shift score
          const shifts = window.__layoutShifts || 0

          // Check scrollbars and overflow
          const hasScrollbar =
            document.documentElement.scrollHeight > window.innerHeight
          const hasHorizontalOverflow =
            document.documentElement.scrollWidth > window.innerWidth

          return {
            hasFiller: Boolean(slot),
            fillerId,
            fillerHeight,
            gapBefore: attrGapBefore,
            shifts,
            hasScrollbar,
            hasHorizontalOverflow,
            docHeight: document.documentElement.scrollHeight,
          }
        })

        // Calculate afterGap
        const remainingGapAfter = metrics.hasFiller
          ? metrics.gapBefore - metrics.fillerHeight
          : 0

        // Determine Pass / Fail against criteria
        // Criteria:
        // 1. after-gap between 0 and 24 px whenever filler rendered
        // 2. no filler where before-gap was under 160 px
        // 3. zero layout shifts after first paint settles
        // 4. zero overflow
        const afterGapValid = !metrics.hasFiller || (remainingGapAfter >= 0 && remainingGapAfter <= 24)
        const noUnderMin = !metrics.hasFiller || metrics.gapBefore >= 160
        const zeroShifts = metrics.shifts === 0
        const noHorizOverflow = !metrics.hasHorizontalOverflow

        const passed = afterGapValid && noUnderMin && zeroShifts && noHorizOverflow

        if (passed) passCount++
        else failCount++

        // Save screenshot
        const safeName = `${pageConfig.name.toLowerCase()}-${vp.label}-${st.replace(/[/\s]/g, '_')}`
        const screenshotPath = path.join(AUDIT_DIR, `${safeName}.png`)
        await page.screenshot({ path: screenshotPath, fullPage: false })

        results.push({
          page: pageConfig.name,
          viewport: vp.label,
          state: st,
          beforeGap: metrics.hasFiller ? `${Math.round(metrics.gapBefore)}px` : '<160px',
          fillerId: metrics.fillerId,
          fillerHeight: metrics.hasFiller ? `${metrics.fillerHeight}px` : '-',
          afterGap: metrics.hasFiller ? `${Math.round(remainingGapAfter)}px` : '-',
          shifts: metrics.shifts.toFixed(4),
          passed,
          screenshot: `${safeName}.png`,
        })

        await context.close()
      }
    }
  }

  await browser.close()
  server.close()

  console.log(`\nAudit completed: ${totalRuns} total runs. Passed: ${passCount}, Failed: ${failCount}`)

  // Generate markdown table
  let mdTable = '| Page | Viewport | State | Before Gap | Filler ID | Filler H | After Gap | Layout Shifts | Status |\n'
  mdTable += '| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n'

  for (const r of results) {
    const status = r.passed ? 'PASS' : 'FAIL'
    mdTable += `| ${r.page} | ${r.viewport} | ${r.state} | ${r.beforeGap} | \`${r.fillerId}\` | ${r.fillerHeight} | ${r.afterGap} | ${r.shifts} | **${status}** |\n`
  }

  const reportPath = path.join(process.cwd(), 'audit', 'filler', 'audit-report.md')
  fs.writeFileSync(reportPath, mdTable, 'utf8')
  console.log(`Report written to ${reportPath}`)
  console.log('\n--- AUDIT TABLE ---')
  console.log(mdTable)
}

runAudit().catch((err) => {
  console.error('Audit run failed:', err)
  process.exit(1)
})
