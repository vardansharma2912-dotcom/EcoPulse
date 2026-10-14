const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function capture() {
  const browser = await chromium.launch({ headless: true });
  const auditDir = path.join(__dirname, '..', 'audit');
  if (!fs.existsSync(auditDir)) {
    fs.mkdirSync(auditDir, { recursive: true });
  }

  // 390x844 (Mobile)
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
  });
  await mobileContext.addInitScript(() => {
    localStorage.setItem('ecopulse_welcome_handled_v1', 'true');
    localStorage.setItem('ecopulse_tour_seen_v1', 'true');
    localStorage.setItem('ecopulse_getting_started_dismissed_v1', 'true');
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(1000);
  const mobileShotPath = path.join(auditDir, 'motion_mobile_390x844.png');
  await mobilePage.screenshot({ path: mobileShotPath });
  console.log('Mobile screenshot saved to:', mobileShotPath);
  await mobileContext.close();

  // 1440x900 (Desktop)
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  await desktopContext.addInitScript(() => {
    localStorage.setItem('ecopulse_welcome_handled_v1', 'true');
    localStorage.setItem('ecopulse_tour_seen_v1', 'true');
    localStorage.setItem('ecopulse_getting_started_dismissed_v1', 'true');
  });
  const desktopPage = await desktopContext.newPage();
  await desktopPage.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await desktopPage.waitForTimeout(1000);
  const desktopShotPath = path.join(auditDir, 'motion_desktop_1440x900.png');
  await desktopPage.screenshot({ path: desktopShotPath });
  console.log('Desktop screenshot saved to:', desktopShotPath);
  await desktopContext.close();

  await browser.close();
}

capture().catch((err) => {
  console.error(err);
  process.exit(1);
});
