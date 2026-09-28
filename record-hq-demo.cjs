const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const ARTIFACT_DIR = "C:/Users/Rajch/.gemini/antigravity-ide/brain/36b68850-c8bb-405b-a478-c7e5fea963ab";
const PUBLIC_DIR = path.resolve(__dirname, "public");
const BASE_URL = "http://localhost:8080";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function smoothScroll(page, targetY, durationMs = 1500) {
  const startY = await page.evaluate(() => window.scrollY);
  const diff = targetY - startY;

  await page.evaluate(
    ({ startY, diff, durationMs }) => {
      return new Promise((resolve) => {
        const start = performance.now();
        function step(now) {
          const elapsed = now - start;
          const progress = Math.min(elapsed / durationMs, 1);
          // Ease in-out cubic
          const ease =
            progress < 0.5
              ? 4 * progress * progress * progress
              : 1 - Math.pow(-2 * progress + 2, 3) / 2;
          window.scrollTo(0, startY + diff * ease);
          if (progress < 1) {
            requestAnimationFrame(step);
          } else {
            resolve();
          }
        }
        requestAnimationFrame(step);
      });
    },
    { startY, diff, durationMs },
  );

  await sleep(300);
}

(async () => {
  console.log("=========================================================");
  console.log("RECORDING 1080p HIGH-DEFINITION DEMO (2:30 - 3:00 TARGET)");
  console.log(`Resolution: 1920x1080 (Full HD)`);
  console.log(`Target: ${BASE_URL}`);
  console.log("=========================================================\n");

  const tempVideoDir = path.join(ARTIFACT_DIR, "raw_hq_video");
  if (!fs.existsSync(tempVideoDir)) {
    fs.mkdirSync(tempVideoDir, { recursive: true });
  }

  for (const file of fs.readdirSync(tempVideoDir)) {
    try {
      fs.unlinkSync(path.join(tempVideoDir, file));
    } catch {
      // ignore
    }
  }

  const browser = await chromium.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-blink-features=AutomationControlled",
      "--hide-scrollbars",
      "--window-size=1920,1080",
    ],
  });

  // 1. First take dedicated 1080p Hero Screenshot
  console.log("[Setup] Capturing crisp 1080p Hero Section screenshot...");
  const heroPage = await browser.newPage({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 2, // 2x retina sharpness
  });
  await heroPage.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
  await sleep(1500);

  // Capture hero section element or viewport
  const heroElement = await heroPage.$("section.apex-hero-group, main > section:first-of-type, main");
  if (heroElement) {
    await heroElement.screenshot({
      path: path.join(ARTIFACT_DIR, "hero_section.png"),
    });
    await heroElement.screenshot({
      path: path.join(PUBLIC_DIR, "hero_section.png"),
    });
    console.log("  -> Saved hero_section.png (2x Retina 4K sharpness)!");
  } else {
    await heroPage.screenshot({
      path: path.join(ARTIFACT_DIR, "hero_section.png"),
    });
    await heroPage.screenshot({
      path: path.join(PUBLIC_DIR, "hero_section.png"),
    });
  }
  await heroPage.close();

  // 2. Start Full HD 1080p Video Recording Context
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: {
      dir: tempVideoDir,
      size: { width: 1920, height: 1080 },
    },
  });

  const page = await context.newPage();

  // Clean CSS injection: hide scrollbar, remove focus outline rings, ensure smooth rendering
  await page.addInitScript(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      * {
        outline: none !important;
      }
      ::-webkit-scrollbar {
        display: none !important;
      }
    `;
    document.head?.appendChild(style);
  });

  const startTime = Date.now();

  try {
    // -------------------------------------------------------------
    // SCENE 1: LANDING PAGE & DM SIMULATOR (~55 seconds)
    // -------------------------------------------------------------
    console.log("[Scene 1] Landing Page (0:00 - 0:55)...");
    await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
    await sleep(8000); // 8s to admire hero typography, badges, and Austin headline

    // Smooth scroll down to Instagram DM simulator
    console.log("  -> Scrolling to Instagram DM simulation...");
    await smoothScroll(page, 560, 2000);
    await sleep(15000); // 15s to watch simulated lead inquiry and autonomous triage reply cycle

    // Scroll down to packages & vehicle scale multipliers
    console.log("  -> Scrolling to detailing packages and vehicle scaling...");
    await smoothScroll(page, 1300, 2000);
    await sleep(8000); // 8s to read pricing and 1.0x - 1.55x multipliers

    // Scroll to Austin service clusters
    console.log("  -> Scrolling to Austin service clusters...");
    await smoothScroll(page, 2050, 2000);
    await sleep(6000); // 6s to see 78704, 78701, 78746 zones

    // Open Operational Impact comparison drawer
    console.log("  -> Opening operational impact drawer...");
    const drawerBtn = page.locator("button:has-text('Compare'), button:has-text('Before vs After')").first();
    if (await drawerBtn.isVisible()) {
      await drawerBtn.click();
      await sleep(8000); // 8s to absorb Before vs After operational metrics
      const closeBtn = page.locator("button:has-text('Close Drawer'), button[aria-label='Close drawer']").first();
      if (await closeBtn.isVisible()) {
        await closeBtn.click();
      } else {
        await page.keyboard.press("Escape");
      }
      await sleep(2000);
    }

    // Scroll back to top
    console.log("  -> Scrolling back to top...");
    await smoothScroll(page, 0, 1800);
    await sleep(2500);

    // Click CTA
    console.log("  -> Clicking 'Book Van 01' CTA...");
    const cta = page.locator("#hero-cta-btn, a[href='/book']").first();
    await cta.click();
    await page.waitForURL("**/book", { timeout: 8000 });

    // -------------------------------------------------------------
    // SCENE 2: CUSTOMER BOOKING FLOW (~70 seconds)
    // -------------------------------------------------------------
    console.log("\n[Scene 2] Customer Booking Flow (0:55 - 2:05)...");
    await sleep(4000); // Admire Step 1 header

    // Step 1: Vehicle Selection
    console.log("  -> Step 1: Selecting Mid-Size Crossover & SUV (1.25x scale)...");
    const vehicleCards = page.locator(".apex-vehicle-card");
    await vehicleCards.nth(1).click();
    await sleep(3500);
    await page.click("button:has-text('Continue')");
    await sleep(3500);

    // Step 2: Service Package & Condition Flags
    console.log("  -> Step 2: Selecting Ceramic Coating ($563)...");
    await page.click("button:has-text('1-Stage Paint Correction + Ceramic Coating')");
    await sleep(3500);
    console.log("  -> Toggling Heavy Pet Hair removal (+$50)...");
    const petSwitch = page.locator("button[role='switch']").first();
    if (await petSwitch.isVisible()) {
      await petSwitch.click();
      await sleep(4500); // Let viewer observe live calculation to $613
    }
    await page.click("button:has-text('Continue')");
    await sleep(3500);

    // Step 3: Austin Geofence & Cluster Matching
    console.log("  -> Step 3: Selecting Austin Sector 78704 (SoCo Cluster)...");
    await page.click("button:has-text('78704')");
    await sleep(4500); // Admire the green Route Cluster Match banner and $0 travel fee waiver
    const slotBtns = page.locator("button:has-text('AM'), button:has-text('PM')");
    if ((await slotBtns.count()) > 0) {
      await slotBtns.first().click();
      await sleep(3500);
    }
    await page.click("button:has-text('Continue')");
    await sleep(3500);

    // Step 4: 3-Point Site Readiness Checklist
    console.log("  -> Step 4: Completing pre-flight readiness checks...");
    const checks = page.locator("button[role='checkbox']");
    const count = await checks.count();
    for (let i = 0; i < count; i++) {
      const isChecked = (await checks.nth(i).getAttribute("aria-checked")) === "true";
      if (!isChecked) {
        await checks.nth(i).click();
        await sleep(900);
      }
    }
    await page.fill("input[name='firstName'], #customer-first-name", "Marcus Vance");
    await sleep(1000);
    await page.fill("input[name='phone'], #customer-phone", "5125550188");
    await sleep(3500);
    await page.click("button:has-text('Continue')");
    await sleep(3500);

    // Step 5: Deposit Card Authorization
    console.log("  -> Step 5: Authorizing $50 card hold...");
    await page.fill("input[name='cardNumber'], #card-number", "4242 4242 4242 4242");
    await sleep(800);
    await page.fill("input[name='cardExpiry'], #card-expiry", "12/28");
    await sleep(800);
    await page.fill("input[name='cardCvc'], #card-cvc", "888");
    await sleep(800);
    await page.fill("input[name='cardName'], #card-name", "Marcus Vance");
    await sleep(3500);

    await page.click("button:has-text('Authorize $50')");
    await page.waitForSelector('h1:has-text("You\'re Booked.")', { timeout: 10000 });
    await sleep(6000); // 6s to read the confirmed pass and reference code

    // Apple Wallet Pass Modal
    console.log("  -> Viewing digital Apple Wallet pass modal...");
    const walletBtn = page.locator("button:has-text('Save to Apple Wallet')");
    if (await walletBtn.isVisible()) {
      await walletBtn.click();
      await sleep(5000);
      await page.keyboard.press("Escape");
      await sleep(2500);
    }

    // -------------------------------------------------------------
    // SCENE 3: OWNER OPERATIONS HUD (~35 seconds)
    // -------------------------------------------------------------
    console.log("\n[Scene 3] Owner Operations HUD (2:05 - 2:40)...");
    await page.goto(`${BASE_URL}/hud`, { waitUntil: "networkidle" });
    await sleep(8000); // 8s to take in telemetry gauges, time-saved counter, and sequenced route deck

    // Job Status Transition
    console.log("  -> Clicking 'Job Started' on first sequenced stop...");
    const jobStarted = page.locator("button:has-text('Job Started')").first();
    if (await jobStarted.isVisible()) {
      await jobStarted.click();
      await sleep(5000); // Watch status update and toast
    }

    // Flash Storm Contingency
    console.log("  -> Triggering 'Simulate Flash Storm'...");
    await page.click("button:has-text('Simulate Flash Storm')");
    await sleep(7000); // 7s to read Travis County rain advisory and client SMS link

    // -------------------------------------------------------------
    // SCENE 4: CUSTOMER WEATHER RESCHEDULE PORTAL (~30 seconds)
    // -------------------------------------------------------------
    console.log("\n[Scene 4] Resolving Customer Reschedule Link (2:40 - 3:00)...");
    const rescheduleLink = page.locator("a[href*='/reschedule/']").first();
    await rescheduleLink.click();
    await page.waitForURL("**/reschedule/**", { timeout: 8000 });
    await sleep(7000); // 7s to view precipitation advisory and Porsche 911 GT3 card

    // Select replacement slot
    console.log("  -> Selecting replacement arrival window...");
    const repSlots = page.locator("button:has-text('Friday'), button:has-text('Saturday')");
    if ((await repSlots.count()) > 1) {
      await repSlots.nth(1).click();
      await sleep(4000);
    }

    // Confirm reschedule
    console.log("  -> Confirming replacement slot...");
    await page.click("button:has-text('Confirm Replacement Slot')");
    await page.waitForSelector('h1:has-text("Replacement Slot Confirmed")', { timeout: 8000 });
    await sleep(8000); // 8s on confirmed screen with Google Calendar button

    const totalSeconds = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\nHigh-Definition Recording finished in ${totalSeconds} seconds!`);
  } catch (err) {
    console.error("Recording error:", err);
  } finally {
    await page.close();
    await context.close();
    await browser.close();

    const videoFiles = fs.readdirSync(tempVideoDir);
    if (videoFiles.length > 0) {
      const srcVideo = path.join(tempVideoDir, videoFiles[0]);
      const destArtifact = path.join(ARTIFACT_DIR, "apex_demo_1080p_3min.webm");
      const destPublic = path.join(PUBLIC_DIR, "apex_demo_1080p_3min.webm");

      fs.copyFileSync(srcVideo, destArtifact);
      fs.copyFileSync(srcVideo, destPublic);

      const sizeMb = (fs.statSync(destArtifact).size / (1024 * 1024)).toFixed(2);
      console.log(`\n[SUCCESS] Full HD 1080p Video saved:`);
      console.log(`  -> ${destArtifact} (${sizeMb} MB)`);
      console.log(`  -> ${destPublic} (${sizeMb} MB)`);
    }
  }
})();
