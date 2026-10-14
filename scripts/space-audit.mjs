/**
 * EcoPulse Space & Layout Measurement Audit
 * Programmatically measures rendered pages across viewports and states to detect:
 * a) Horizontal overflow (scrollWidth > innerWidth)
 * b) Empty space below the last content element vs dock / document
 * c) Mostly empty cards (content height < 55% of box height)
 * d) Grid/flex siblings with height difference > 16px and blank space inside
 * e) Vertical gaps between sections > 40px (mobile) or > 64px (desktop)
 * f) Chart unused axis / padding space
 * g) Empty states taller than 160px on mobile
 * h) Stray margin/padding doubling (parent padding + child margin, stacked gap + space-y)
 * i) Excessive page top padding or gap between header & first card
 * j) Footer floating mid-screen or huge gaps above/below
 */

import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'

const PORT = 4173
const BASE_URL = `http://localhost:${PORT}`

const VIEWPORTS = [
  { name: '360x640', width: 360, height: 640, isMobile: true, hasTouch: true },
  { name: '390x844', width: 390, height: 844, isMobile: true, hasTouch: true },
  { name: '430x932', width: 430, height: 932, isMobile: true, hasTouch: true },
  { name: '768x1024', width: 768, height: 1024, isMobile: true, hasTouch: true },
  { name: '1024x768', width: 1024, height: 768, isMobile: false, hasTouch: false },
  { name: '1440x900', width: 1440, height: 900, isMobile: false, hasTouch: false },
  { name: '1920x1080', width: 1920, height: 1080, isMobile: false, hasTouch: false },
]

const ROUTES = [
  { path: '/', name: 'dashboard' },
  { path: '/reminders', name: 'reminders' },
  { path: '/calculator', name: 'calculator' },
  { path: '/analytics', name: 'analytics' },
  { path: '/learn', name: 'learn' },
  { path: '/settings', name: 'settings' },
  { path: '/404', name: '404' },
]

// Extra special routes / triggers:
// welcome: / with fresh storage
// tour: /learn with tour triggered

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
    console.log(`[SpaceAudit] Server already active on port ${PORT}`)
    return null
  }

  console.log(`[SpaceAudit] Starting vite preview on port ${PORT}...`)
  const child = process.platform === 'win32'
    ? spawn('cmd.exe', ['/c', `npx vite preview --port ${PORT} --strictPort`], { stdio: 'ignore' })
    : spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { stdio: 'ignore' })

  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 500))
    if (await isPortOpen(PORT)) {
      console.log(`[SpaceAudit] Server ready at ${BASE_URL}`)
      return child
    }
  }
  throw new Error(`[SpaceAudit] Failed to start server at ${BASE_URL}`)
}

async function launchBrowser() {
  try {
    const browser = await chromium.launch({ channel: 'chrome', headless: true })
    console.log('[SpaceAudit] Chrome launched')
    return browser
  } catch (err) {
    console.warn('[SpaceAudit] Chrome launch failed, trying Edge:', err.message)
    const browser = await chromium.launch({ channel: 'msedge', headless: true })
    console.log('[SpaceAudit] Edge launched')
    return browser
  }
}

function getInitScript(stateName) {
  return `
    (function() {
      try {
        localStorage.clear();
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];

        if ('${stateName}' === 'fresh') {
          // completely fresh first launch
          return;
        }

        // Set common flags for non-fresh states
        localStorage.setItem('ecopulse_welcome_handled_v1', 'true');
        localStorage.setItem('ecopulse_tour_seen_v1', 'true');
        localStorage.setItem('ecopulse_last_visit_v1', now.toISOString());

        if ('${stateName}' === 'zero_reminders') {
          const appState = {
            version: 2,
            settings: {
              displayName: 'Alex',
              tariffPerKwh: 8,
              currency: '₹',
              notificationsEnabled: false,
            },
            reminders: [],
            completions: [],
            streak: 0,
            bestStreak: 0,
            lastActiveDate: null,
          };
          localStorage.setItem('ecopulse_app_state_v2', JSON.stringify(appState));
        } else if ('${stateName}' === 'sample') {
          const reminders = [
            { id: 'rem-1', title: 'Turn off workspace monitors', time: '22:00', category: 'work', recurrence: 'daily', active: true, watts: 80, estimatedHoursSaved: 8, createdAt: now.toISOString() },
            { id: 'rem-2', title: 'Unplug electric kettle & microwave', time: '09:00', category: 'kitchen', recurrence: 'daily', active: true, watts: 1500, estimatedHoursSaved: 0.5, createdAt: now.toISOString() },
            { id: 'rem-3', title: 'Switch off dormitory AC', time: '08:30', category: 'climate', recurrence: 'daily', active: true, watts: 1200, estimatedHoursSaved: 4, createdAt: now.toISOString() },
            { id: 'rem-4', title: 'Turn off dorm study lamps', time: '23:30', category: 'lighting', recurrence: 'daily', active: true, watts: 40, estimatedHoursSaved: 6, createdAt: now.toISOString() },
          ];

          const completions = [];
          for (let i = 0; i < 14; i++) {
            const d = new Date(now.getTime() - i * 86400000);
            const dStr = d.toISOString().split('T')[0];
            reminders.forEach((r, idx) => {
              completions.push({
                id: 'comp-' + i + '-' + idx,
                reminderId: r.id,
                date: dStr,
                timestamp: d.toISOString(),
                kwhSaved: ((r.watts * (r.estimatedHoursSaved || 2)) / 1000),
                costSaved: ((r.watts * (r.estimatedHoursSaved || 2)) / 1000) * 8,
                isDemo: true,
              });
            });
          }

          const appState = {
            version: 2,
            settings: {
              displayName: 'Alex',
              tariffPerKwh: 8,
              currency: '₹',
              notificationsEnabled: false,
            },
            reminders,
            completions,
            streak: 14,
            bestStreak: 14,
            lastActiveDate: dateStr,
          };
          localStorage.setItem('ecopulse_app_state_v2', JSON.stringify(appState));
        }
      } catch (e) {
        console.error('Storage init failed', e);
      }
    })();
  `
}

async function measureSpaceIssues(page, vp) {
  return await page.evaluate((context) => {
    const { height: vpHeight, isMobile } = context
    const issues = []

    // 1. (a) Document scrollWidth > clientWidth (horizontal overflow)
    const docScrollWidth = document.documentElement.scrollWidth
    const docClientWidth = document.documentElement.clientWidth
    if (docScrollWidth > docClientWidth + 1) {
      issues.push({
        type: 'horizontal_overflow',
        severity: 'high',
        gap: docScrollWidth - docClientWidth,
        details: `Document scrollWidth (${docScrollWidth}px) exceeds clientWidth (${docClientWidth}px) by ${docScrollWidth - docClientWidth}px`,
      })
    }

    // 2. (b) Empty space below the last content element vs document bottom
    // Find last content element inside main or footer
    const mainEl = document.querySelector('main')
    const footerEl = document.querySelector('footer')
    const dockEl = document.querySelector('nav[aria-label="Mobile Navigation"]')
    const dockHeight = dockEl ? dockEl.getBoundingClientRect().height : (isMobile ? 64 : 0)

    // Check last content inside main
    if (mainEl) {
      const mainChildren = Array.from(mainEl.querySelectorAll('*')).filter(el => {
        const r = el.getBoundingClientRect()
        return r.width > 0 && r.height > 0 && window.getComputedStyle(el).display !== 'none'
      })
      if (mainChildren.length > 0) {
        let maxBottom = 0
        for (const child of mainChildren) {
          const r = child.getBoundingClientRect()
          const absBottom = window.scrollY + r.bottom
          if (absBottom > maxBottom) maxBottom = absBottom
        }
        
        // If footer exists, check space between last element in main and footer
        if (footerEl) {
          const footerRect = footerEl.getBoundingClientRect()
          const footerAbsTop = window.scrollY + footerRect.top
          const gapToFooter = footerAbsTop - maxBottom
          if (gapToFooter > (isMobile ? 48 : 80)) {
            issues.push({
              type: 'empty_space_before_footer',
              severity: 'medium',
              gap: Math.round(gapToFooter),
              details: `Gap between last content element in main and footer is ${Math.round(gapToFooter)}px (expected <= ${isMobile ? 32 : 48}px)`,
            })
          }
        }
      }
    }

    // Check bottom padding of page vs dock on mobile
    if (isMobile) {
      // Bottom of last visible non-dock element
      const allVisible = Array.from(document.querySelectorAll('main, footer, section, div')).filter(el => {
        if (dockEl && (el === dockEl || dockEl.contains(el))) return false
        const r = el.getBoundingClientRect()
        return r.width > 0 && r.height > 0 && window.getComputedStyle(el).position !== 'fixed'
      })
      let lastElementBottom = 0
      for (const el of allVisible) {
        const r = el.getBoundingClientRect()
        const absBottom = window.scrollY + r.bottom
        if (absBottom > lastElementBottom) lastElementBottom = absBottom
      }

      const totalDocHeight = document.documentElement.scrollHeight
      const gapBelow = totalDocHeight - lastElementBottom
      const allowedGap = 24 + dockHeight
      if (gapBelow > allowedGap + 20) {
        issues.push({
          type: 'bottom_dock_gap',
          severity: 'medium',
          gap: Math.round(gapBelow),
          details: `Empty space below last visible content is ${Math.round(gapBelow)}px, exceeding 24px + dock height (${allowedGap}px)`,
        })
      }
    }

    // 3. (c) Mostly empty cards: content height < 55% of box height
    const cards = Array.from(document.querySelectorAll('.glass-panel, [class*="rounded-2xl"], [class*="rounded-3xl"], [class*="Card"]')).filter(el => {
      const r = el.getBoundingClientRect()
      return r.width >= 120 && r.height >= 120 && window.getComputedStyle(el).display !== 'none'
    })

    for (const card of cards) {
      const cardHeight = card.clientHeight
      if (cardHeight < 120) continue

      // Calculate total bounding box of immediate children
      let minTop = Infinity
      let maxBottom = -Infinity
      const children = Array.from(card.children).filter(c => {
        const r = c.getBoundingClientRect()
        return r.width > 0 && r.height > 0 && window.getComputedStyle(c).position !== 'absolute'
      })

      if (children.length > 0) {
        for (const child of children) {
          const r = child.getBoundingClientRect()
          if (r.top < minTop) minTop = r.top
          if (r.bottom > maxBottom) maxBottom = r.bottom
        }
        const contentHeight = maxBottom - minTop
        const ratio = contentHeight / cardHeight
        if (ratio < 0.55 && cardHeight > 160) {
          issues.push({
            type: 'mostly_empty_card',
            severity: 'medium',
            gap: Math.round(cardHeight - contentHeight),
            details: `Card (${card.className.slice(0, 40)}) has content height ${Math.round(contentHeight)}px out of ${cardHeight}px box (${Math.round(ratio * 100)}% filled)`,
          })
        }
      }
    }

    // 4. (d) Grid or flex siblings in same row with height diff > 16px and blank space inside
    const gridAndFlexContainers = Array.from(document.querySelectorAll('.grid, [class*="grid-cols-"], .flex-row')).filter(el => {
      const r = el.getBoundingClientRect()
      return r.width > 200 && r.height > 60
    })

    for (const container of gridAndFlexContainers) {
      const children = Array.from(container.children).filter(c => {
        const r = c.getBoundingClientRect()
        return r.width > 80 && r.height > 40 && window.getComputedStyle(c).display !== 'none'
      })

      // Group children that share approximately the same top offset (+/- 10px)
      const rows = []
      for (const child of children) {
        const r = child.getBoundingClientRect()
        let foundRow = false
        for (const row of rows) {
          if (Math.abs(row[0].rect.top - r.top) < 10) {
            row.push({ el: child, rect: r })
            foundRow = true
            break
          }
        }
        if (!foundRow) {
          rows.push([{ el: child, rect: r }])
        }
      }

      for (const row of rows) {
        if (row.length > 1) {
          const heights = row.map(item => item.rect.height)
          const minH = Math.min(...heights)
          const maxH = Math.max(...heights)
          const diff = maxH - minH
          if (diff > 20) {
            issues.push({
              type: 'unequal_column_height',
              severity: 'low',
              gap: Math.round(diff),
              details: `Siblings in same row have height difference of ${Math.round(diff)}px (${Math.round(maxH)}px vs ${Math.round(minH)}px)`,
            })
          }
        }
      }
    }

    // 5. (e) Vertical gaps between consecutive sibling sections > 40px (mobile) or > 64px (desktop)
    const sectionContainers = [document.querySelector('main > div'), document.querySelector('main')].filter(Boolean)
    for (const container of sectionContainers) {
      const sections = Array.from(container.children).filter(el => {
        const r = el.getBoundingClientRect()
        return r.width > 0 && r.height > 0 && window.getComputedStyle(el).display !== 'none'
      })

      for (let i = 0; i < sections.length - 1; i++) {
        const cur = sections[i].getBoundingClientRect()
        const next = sections[i + 1].getBoundingClientRect()
        const gap = next.top - cur.bottom
        const maxAllowed = isMobile ? 40 : 64
        if (gap > maxAllowed + 4) {
          issues.push({
            type: 'excessive_section_gap',
            severity: 'medium',
            gap: Math.round(gap),
            details: `Gap between consecutive sections is ${Math.round(gap)}px (max allowed is ${maxAllowed}px)`,
          })
        }
      }
    }

    // 6. (f) Charts: large empty areas or unused axis space
    const chartWrappers = Array.from(document.querySelectorAll('.recharts-responsive-container, .recharts-wrapper'))
    for (const cw of chartWrappers) {
      const r = cw.getBoundingClientRect()
      const svg = cw.querySelector('svg')
      if (svg) {
        const svgRect = svg.getBoundingClientRect()
        const emptyHeight = r.height - svgRect.height
        if (emptyHeight > 40) {
          issues.push({
            type: 'chart_empty_area',
            severity: 'medium',
            gap: Math.round(emptyHeight),
            details: `Chart container has ${Math.round(emptyHeight)}px of unused vertical space`,
          })
        }
      }
    }

    // 7. (g) Empty states taller than 160px on mobile
    if (isMobile) {
      const emptyStates = Array.from(document.querySelectorAll('[data-empty-state], .empty-state, [role="status"]')).filter(el => {
        const text = (el.textContent || '').toLowerCase()
        return text.includes('no reminders') || text.includes('no habits') || text.includes('no activity') || text.includes('nothing scheduled')
      })
      for (const es of emptyStates) {
        const h = es.getBoundingClientRect().height
        if (h > 175) {
          issues.push({
            type: 'oversized_empty_state',
            severity: 'medium',
            gap: Math.round(h - 160),
            details: `Empty state is ${Math.round(h)}px tall on mobile (limit: 160px)`,
          })
        }
      }
    }

    // 8. (h) Stray margin or padding doubling
    const paddedParents = Array.from(document.querySelectorAll('main, [class*="space-y-"], .p-4, .p-6, .p-8, .p-3\\.5'))
    for (const parent of paddedParents) {
      const pStyle = window.getComputedStyle(parent)
      const pBottom = parseFloat(pStyle.paddingBottom) || 0
      const lastChild = parent.lastElementChild
      if (lastChild && pBottom >= 16) {
        const cStyle = window.getComputedStyle(lastChild)
        const cBottom = parseFloat(cStyle.marginBottom) || 0
        if (cBottom >= 16) {
          issues.push({
            type: 'margin_padding_doubling',
            severity: 'medium',
            gap: Math.round(pBottom + cBottom),
            details: `Parent padding-bottom (${pBottom}px) stacked with child margin-bottom (${cBottom}px) totaling ${pBottom + cBottom}px`,
          })
        }
      }
    }

    // 9. (i) Page top padding larger than header needs & gap between header and first card
    if (mainEl) {
      const mainStyle = window.getComputedStyle(mainEl)
      const pt = parseFloat(mainStyle.paddingTop) || 0
      const maxPt = isMobile ? 24 : 40
      if (pt > maxPt + 8) {
        issues.push({
          type: 'excessive_top_padding',
          severity: 'medium',
          gap: Math.round(pt),
          details: `Main top padding is ${Math.round(pt)}px (expected <= ${maxPt}px)`,
        })
      }

      // Gap between PageHeader and first card
      const pageHeader = mainEl.querySelector('header, [class*="PageHeader"]')
      if (pageHeader) {
        const nextEl = pageHeader.nextElementSibling
        if (nextEl) {
          const phRect = pageHeader.getBoundingClientRect()
          const nRect = nextEl.getBoundingClientRect()
          const headerGap = nRect.top - phRect.bottom
          const allowedHeaderGap = isMobile ? 24 : 36
          if (headerGap > allowedHeaderGap + 8) {
            issues.push({
              type: 'header_first_card_gap',
              severity: 'medium',
              gap: Math.round(headerGap),
              details: `Gap between PageHeader and first element is ${Math.round(headerGap)}px (expected <= ${allowedHeaderGap}px)`,
            })
          }
        }
      }
    }

    // 10. (j) Footer: extra space above or below it, or floating mid-screen
    if (footerEl) {
      const fRect = footerEl.getBoundingClientRect()
      const fStyle = window.getComputedStyle(footerEl)
      const docScrollH = document.documentElement.scrollHeight
      const isShortPage = docScrollH <= vpHeight + 2

      // If page is short, footer should sit at the bottom of the viewport
      if (isShortPage) {
        const gapUnderFooter = vpHeight - fRect.bottom
        if (gapUnderFooter > 20 && !isMobile) {
          issues.push({
            type: 'floating_footer',
            severity: 'high',
            gap: Math.round(gapUnderFooter),
            details: `Footer floats mid-screen with ${Math.round(gapUnderFooter)}px empty space below on short page`,
          })
        }
      }

      // Check footer padding
      const fPb = parseFloat(fStyle.paddingBottom) || 0
      if (isMobile && fPb > 100) {
        issues.push({
          type: 'excessive_footer_padding_mobile',
          severity: 'medium',
          gap: Math.round(fPb),
          details: `Footer bottom padding is ${Math.round(fPb)}px on mobile (expected <= dock height + 24px)`,
        })
      }
    }

    return {
      scrollWidth: docScrollWidth,
      clientWidth: docClientWidth,
      issues,
    }
  }, { width: vp.width, height: vp.height, isMobile: vp.isMobile })
}

async function runSpaceAudit() {
  const auditDir = path.resolve('audit/space')
  ensureDir(auditDir)

  const serverChild = await startServer()
  const browser = await launchBrowser()

  const allResults = []

  // Test states
  const states = ['fresh', 'sample', 'zero_reminders']

  console.log(`\n======================================================`)
  console.log(`Starting EcoPulse Space & Layout Measurement Audit`)
  console.log(`Testing ${VIEWPORTS.length} viewports across ${ROUTES.length} routes & ${states.length} states`)
  console.log(`======================================================\n`)

  try {
    for (const vp of VIEWPORTS) {
      console.log(`--> Auditing Viewport: ${vp.name} (${vp.width}x${vp.height})`)

      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        isMobile: vp.isMobile,
        hasTouch: vp.hasTouch,
        deviceScaleFactor: 1,
      })

      const page = await context.newPage()

      for (const st of states) {
        for (const route of ROUTES) {
          // In fresh state, the welcome screen is shown on root `/`
          // Let's also test `/404`
          const url = `${BASE_URL}${route.path}`

          await page.addInitScript(getInitScript(st))
          await page.goto(url, { waitUntil: 'networkidle' })
          await page.waitForTimeout(250)

          // Measure layout & spacing
          const measurement = await measureSpaceIssues(page, vp)

          // Screenshot name: page-viewport-state.png
          const cleanPageName = route.name === 'dashboard' && st === 'fresh' ? 'welcome' : route.name
          const screenshotName = `${cleanPageName}-${vp.width}x${vp.height}-${st}.png`
          const screenshotPath = path.join(auditDir, screenshotName)
          await page.screenshot({ path: screenshotPath, fullPage: true })

          if (measurement.issues.length > 0) {
            allResults.push({
              page: cleanPageName,
              route: route.path,
              viewport: vp.name,
              width: vp.width,
              height: vp.height,
              state: st,
              screenshot: screenshotName,
              issues: measurement.issues,
            })
          }
        }

        // Tour test on sample state
        if (st === 'sample') {
          const tourUrl = `${BASE_URL}/learn`
          await page.goto(tourUrl, { waitUntil: 'networkidle' })
          await page.waitForTimeout(200)

          const replayBtn = page.locator('button:has-text("Replay tour")').first()
          if (await replayBtn.isVisible()) {
            await replayBtn.click()
            await page.waitForTimeout(300)
            const tourMeasurement = await measureSpaceIssues(page, vp)
            const tourScreenshot = `tour-${vp.width}x${vp.height}-${st}.png`
            await page.screenshot({ path: path.join(auditDir, tourScreenshot), fullPage: true })

            if (tourMeasurement.issues.length > 0) {
              allResults.push({
                page: 'tour',
                route: '/learn',
                viewport: vp.name,
                width: vp.width,
                height: vp.height,
                state: st,
                screenshot: tourScreenshot,
                issues: tourMeasurement.issues,
              })
            }
          }
        }
      }

      await context.close()
    }

    // Write audit findings JSON report
    const reportPath = path.join(auditDir, 'space-audit-report.json')
    fs.writeFileSync(reportPath, JSON.stringify(allResults, null, 2), 'utf-8')
    console.log(`\n[SpaceAudit] Completed. Identified ${allResults.length} test configurations with issues.`)
    console.log(`[SpaceAudit] Saved report to ${reportPath}\n`)

  } finally {
    await browser.close()
    if (serverChild) {
      serverChild.kill()
    }
  }
}

runSpaceAudit().catch(err => {
  console.error('[SpaceAudit] Fatal error:', err)
  process.exit(1)
})
