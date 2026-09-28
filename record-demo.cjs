const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const ARTIFACT_DIR = "C:/Users/Rajch/.gemini/antigravity-ide/brain/36b68850-c8bb-405b-a478-c7e5fea963ab";
const PUBLIC_DIR = path.resolve(__dirname, "public");
const BASE_URL = "http://localhost:8080";

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function smoothScroll(page, targetY, steps = 10, interval = 60) {
  const currentY = await page.evaluate(() => window.scrollY);
  const diff = targetY - currentY;
  for (let i = 1; i <= steps; i++) {
    await page.evaluate((y) => window.scrollTo(0, y), currentY + (diff * i) / steps);
    await sleep(interval);
  }
}

(async () => {
  console.log("=================================================");
  console.log("STARTING APEX DETAIL WORKS VIDEO DEMO RECORDING");
  console.log(`Artifact Directory: ${ARTIFACT_DIR}`);
  console.log("=================================================\n");

  const videoTempDir = path.join(ARTIFACT_DIR, "temp_video");
  if (!fs.existsSync(videoTempDir)) {
    fs.mkdirSync(videoTempDir, { recursive: true });
  }

  const browser = await chromium.launch({
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    recordVideo: {
      dir: videoTempDir,
      size: { width: 1280, height: 800 },
    },
  });

  const page = await context.newPage();

  try {
    // -----------------------------------------------------------------
    // SCENE 1: LANDING PAGE (/)
    // -----------------------------------------------------------------
    console.log("[Scene 1] Landing Page...");
    await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
    await sleep(2500); // Admire hero

    // Scroll to Instagram DM Simulator
    console.log("  -> Scrolling to Instagram DM simulation...");
    await smoothScroll(page, 520, 12, 50);
    await sleep(3500); // Watch simulated DM conversation cycle

    // Scroll to Packages & Clusters
    console.log("  -> Scrolling to packages and Austin service clusters...");
    await smoothScroll(page, 1300, 14, 50);
    await sleep(2500);

    // Open Before/After Comparison Drawer
    console.log("  -> Opening Operational Impact Drawer...");
    const drawerBtn = page.locator("button:has-text('Compare'), button:has-text('Before vs After')").first();
    if (await drawerBtn.isVisible()) {
      await drawerBtn.click();
      await sleep(2500);
      const closeBtn = page.locator("button:has-text('Close Drawer'), button[aria-label='Close drawer']").first();
      if (await closeBtn.isVisible()) {
        await closeBtn.click();
      } else {
        await page.keyboard.press("Escape");
      }
      await sleep(1000);
    }

    // Scroll back to top and click CTA
    console.log("  -> Scrolling back to top...");
    await smoothScroll(page, 0, 10, 40);
    await sleep(1000);

    console.log("  -> Clicking 'Book Van 01' CTA...");
    const cta = page.locator("#hero-cta-btn, a[href='/book']").first();
    await cta.click();
    await page.waitForURL("**/book", { timeout: 8000 });

    // -----------------------------------------------------------------
    // SCENE 2: CUSTOMER BOOKING FLOW (/book)
    // -----------------------------------------------------------------
    console.log("[Scene 2] Customer Booking Engine (/book)...");
    await sleep(1500);

    // Step 1: Vehicle Selection
    console.log("  -> Step 1: Selecting Mid-Size Crossover & SUV (1.25x scale)...");
    const vehicleCards = page.locator(".apex-vehicle-card");
    await vehicleCards.nth(1).click();
    await sleep(1200);
    await page.click("button:has-text('Continue')");
    await sleep(1500);

    // Step 2: Service Package + Condition Flag
    console.log("  -> Step 2: Selecting Ceramic Coating & adding Pet Hair removal...");
    await page.click("button:has-text('1-Stage Paint Correction + Ceramic Coating')");
    await sleep(1000);
    const petSwitch = page.locator("button[role='switch']").first();
    if (await petSwitch.isVisible()) {
      await petSwitch.click();
      await sleep(1200);
    }
    await page.click("button:has-text('Continue')");
    await sleep(1500);

    // Step 3: Austin Metro Geofence & Cluster Match
    console.log("  -> Step 3: Selecting Austin Sector 78704 (SoCo Cluster)...");
    await page.click("button:has-text('78704')");
    await sleep(1500); // Show route cluster match banner
    const slotBtns = page.locator("button:has-text('AM'), button:has-text('PM')");
    if ((await slotBtns.count()) > 0) {
      await slotBtns.first().click();
      await sleep(1200);
    }
    await page.click("button:has-text('Continue')");
    await sleep(1500);

    // Step 4: 3-Point Site Readiness Checklist
    console.log("  -> Step 4: Completing pre-flight readiness checks...");
    const checks = page.locator("button[role='checkbox']");
    const count = await checks.count();
    for (let i = 0; i < count; i++) {
      const isChecked = (await checks.nth(i).getAttribute("aria-checked")) === "true";
      if (!isChecked) {
        await checks.nth(i).click();
        await sleep(300);
      }
    }
    await page.fill("input[name='firstName'], #customer-first-name", "Marcus Vance");
    await sleep(400);
    await page.fill("input[name='phone'], #customer-phone", "5125550188");
    await sleep(1000);
    await page.click("button:has-text('Continue')");
    await sleep(1500);

    // Step 5: Card Hold Authorization
    console.log("  -> Step 5: Authorizing $50 deposit hold...");
    await page.fill("input[name='cardNumber'], #card-number", "4242 4242 4242 4242");
    await sleep(300);
    await page.fill("input[name='cardExpiry'], #card-expiry", "12/28");
    await sleep(300);
    await page.fill("input[name='cardCvc'], #card-cvc", "888");
    await sleep(300);
    await page.fill("input[name='cardName'], #card-name", "Marcus Vance");
    await sleep(1000);

    await page.click("button:has-text('Authorize $50')");

    // Confirmation Pass
    console.log("  -> Awaiting confirmation pass...");
    await page.waitForSelector('h1:has-text("You\'re Booked.")', { timeout: 10000 });
    await sleep(1500);
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, "shot_01_booking_confirmation.png"),
    });

    // Open Apple Wallet Pass Modal
    console.log("  -> Viewing Digital Apple Wallet pass modal...");
    const walletBtn = page.locator("button:has-text('Save to Apple Wallet')");
    if (await walletBtn.isVisible()) {
      await walletBtn.click();
      await sleep(2000);
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, "shot_02_apple_wallet_modal.png"),
      });
      await page.keyboard.press("Escape");
      await sleep(1000);
    }

    // -----------------------------------------------------------------
    // SCENE 3: OWNER OPERATIONS HUD (/hud)
    // -----------------------------------------------------------------
    console.log("[Scene 3] Owner Operations Cockpit (/hud)...");
    await page.goto(`${BASE_URL}/hud`, { waitUntil: "networkidle" });
    await sleep(2500); // Telemetry gauges and route deck
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, "shot_03_owner_hud_cockpit.png"),
    });

    // Click Job Started
    console.log("  -> Triggering Job Started status transition...");
    const jobStarted = page.locator("button:has-text('Job Started')").first();
    if (await jobStarted.isVisible()) {
      await jobStarted.click();
      await sleep(1800);
    }

    // Flash Storm Contingency
    console.log("  -> Triggering Flash Storm Reschedule Contingency...");
    await page.click("button:has-text('Simulate Flash Storm')");
    await sleep(2500);
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, "shot_04_hud_storm_modal.png"),
    });

    // -----------------------------------------------------------------
    // SCENE 4: CUSTOMER WEATHER RESCHEDULE PORTAL (/reschedule/...)
    // -----------------------------------------------------------------
    console.log("[Scene 4] Resolving Customer Reschedule Link...");
    const rescheduleLink = page.locator("a[href*='/reschedule/']").first();
    await rescheduleLink.click();
    await page.waitForURL("**/reschedule/**", { timeout: 8000 });
    await sleep(2500);
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, "shot_05_reschedule_portal.png"),
    });

    // Select Replacement Slot
    console.log("  -> Selecting replacement arrival window...");
    const repSlots = page.locator("button:has-text('Friday'), button:has-text('Saturday')");
    if ((await repSlots.count()) > 1) {
      await repSlots.nth(1).click();
      await sleep(1200);
    }

    // Confirm Reschedule
    console.log("  -> Confirming replacement slot...");
    await page.click("button:has-text('Confirm Replacement Slot')");
    await page.waitForSelector('h1:has-text("Replacement Slot Confirmed")', { timeout: 8000 });
    await sleep(2500);
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, "shot_06_reschedule_confirmed.png"),
    });

    console.log("\nWalkthrough recording completed successfully!");
  } catch (err) {
    console.error("Recording error:", err);
  } finally {
    // Close context to finish writing video
    await page.close();
    await context.close();
    await browser.close();

    // Find generated video
    const videoFiles = fs.readdirSync(videoTempDir);
    if (videoFiles.length > 0) {
      const generatedVideo = path.join(videoTempDir, videoFiles[0]);
      const finalArtifactVideo = path.join(ARTIFACT_DIR, "apex_walkthrough_recording.webm");
      const finalPublicVideo = path.join(PUBLIC_DIR, "apex_walkthrough_recording.webm");

      fs.copyFileSync(generatedVideo, finalArtifactVideo);
      fs.copyFileSync(generatedVideo, finalPublicVideo);

      const sizeKb = Math.round(fs.statSync(finalArtifactVideo).size / 1024);
      console.log(`Video saved to: ${finalArtifactVideo} (${sizeKb} KB)`);
      console.log(`Public video saved to: ${finalPublicVideo} (${sizeKb} KB)`);
    }
  }
})();
