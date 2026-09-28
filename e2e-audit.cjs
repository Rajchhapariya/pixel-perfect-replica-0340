const { chromium } = require('playwright');

const BASE_URL = 'http://localhost:8080';
const reports = [];

async function runTest(name, fn, browser) {
  const start = Date.now();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  try {
    await fn(page);
    const durationMs = Date.now() - start;
    reports.push({ name, passed: true, durationMs });
    console.log(`  [PASS] ${name} (${durationMs}ms)`);
  } catch (err) {
    const durationMs = Date.now() - start;
    reports.push({ name, passed: false, error: err.message, durationMs });
    console.error(`  [FAIL] ${name}: ${err.message}`);
  } finally {
    await page.close();
  }
}

(async () => {
  console.log('===============================================================');
  console.log('STARTING PLAYWRIGHT END-TO-END SYSTEM AUDIT');
  console.log(`Target: ${BASE_URL}`);
  console.log('===============================================================\n');

  const browser = await chromium.launch({ headless: true });

  try {
    // 1. Landing Page Test
    await runTest('1. Landing Page: Display typography, CTA buttons, and live KPI stats strip', async (page) => {
      await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
      const headline = await page.textContent('.apex-display');
      if (!headline || !headline.includes("Austin's Mobile")) {
        throw new Error(`Headline missing: ${headline}`);
      }
      const ctaBtn = await page.isVisible('#hero-cta-btn');
      if (!ctaBtn) throw new Error('Hero CTA button not visible');
      const statStrip = await page.isVisible('.apex-stat-strip');
      if (!statStrip) throw new Error('Stat strip not visible');
    }, browser);

    // 2. Header Navigation
    await runTest('2. Header Navigation: Brand logo, view switching between Customer and HUD', async (page) => {
      await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
      const logo = await page.isVisible("header img[alt='Apex Detail Works']");
      if (!logo) throw new Error('Logo not visible');
      await page.click("header a[href='/hud']");
      await page.waitForURL('**/hud');
      await page.click("header a[href='/']");
      await page.waitForURL('**/');
    }, browser);

    // 3. Before vs After Drawer
    await runTest('3. Before vs After Drawer: Opens comparison dialog and closes cleanly', async (page) => {
      await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
      await page.click("button[aria-label='Open Before vs After comparison']");
      await page.waitForSelector("div[role='dialog']", { timeout: 6000 });
      const text = await page.textContent("div[role='dialog']");
      if (!text || !text.includes('Instagram DMs')) throw new Error('Missing comparison content');
      await page.click("button[aria-label='Close panel']");
    }, browser);

    // 4. Autonomous 5-Step Booking Flow
    await runTest('4. Autonomous 5-Step Booking Flow: Vehicle -> Package -> Route Cluster -> Pre-flight -> Deposit Hold', async (page) => {
      await page.goto(`${BASE_URL}/book`, { waitUntil: 'networkidle' });

      // Step 1: Select vehicle
      const cards = await page.locator('.apex-vehicle-card').all();
      if (cards.length === 0) throw new Error('No vehicle cards found');
      await cards[0].click();
      await page.click("button:has-text('Continue')");

      // Step 2: Select package
      await page.waitForSelector("button:has-text('Express Foam & Seal')");
      await page.click("button:has-text('Express Foam & Seal')");
      await page.click("button:has-text('Continue')");

      // Step 3: Location & Slot
      await page.waitForSelector("button:has-text('South Congress')");
      await page.click("button:has-text('South Congress')");
      await page.waitForSelector("text=Route Cluster Match");
      const slotBtns = await page.locator("button:has-text('AM'), button:has-text('PM')").all();
      if (slotBtns.length === 0) throw new Error('No time slots available');
      await slotBtns[0].click();
      await page.click("button:has-text('Continue')");

      // Step 4: Site check & Contact
      await page.waitForSelector("input[placeholder='Cole']");
      await page.fill("input[placeholder='Cole']", 'Alexander');
      await page.fill("input[placeholder='5125550142']", '5125550199');
      const checkBtns = await page.locator("button:has-text('Level parking'), button:has-text('Exterior water'), button:has-text('Vehicle will be accessible')").all();
      for (const b of checkBtns) await b.click();
      await page.click("button:has-text('Continue')");

      // Step 5: Authorize hold
      await page.waitForSelector("button:has-text('Authorize $50')");
      await page.click("button:has-text('Authorize $50')");

      // Confirmation pass
      await page.waitForSelector("text=You're Booked.", { timeout: 10000 });
      const refCode = await page.textContent('.confirm-ref');
      if (!refCode || !refCode.includes('ADW-')) {
        throw new Error(`Invalid confirmation reference code: ${refCode}`);
      }
    }, browser);

    // 5. Operations HUD
    await runTest('5. Operations HUD: Live status, route clustering, and thunderstorm emergency reschedule', async (page) => {
      await page.goto(`${BASE_URL}/hud`, { waitUntil: 'networkidle' });
      await page.waitForSelector("h1:has-text('Owner Command HUD')");

      // Trigger weather reschedule
      const stormBtn = await page.waitForSelector("button:has-text('Simulate Flash Storm')");
      await stormBtn.click();

      await page.waitForSelector("h2:has-text('Travis County Precipitation Warning')");
      await page.click("button:has-text('Execute 1-Click Reschedule')");
      await page.waitForSelector('[data-sonner-toast]', { timeout: 6000 });
    }, browser);

  } finally {
    await browser.close();
  }

  console.log('\n===============================================================');
  const passed = reports.filter(r => r.passed).length;
  console.log(`PLAYWRIGHT AUDIT COMPLETE: ${passed}/${reports.length} TESTS PASSED`);
  console.log('===============================================================\n');

  process.exit(passed === reports.length ? 0 : 1);
})();
