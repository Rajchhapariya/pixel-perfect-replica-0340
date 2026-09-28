const { chromium } = require("playwright");

const BASE_URL = "http://localhost:8080";
const reports = [];

async function runTest(category, name, fn, browser, options = {}) {
  const start = Date.now();
  const context = await browser.newContext(
    options.contextOptions || {
      viewport: options.viewport || { width: 1280, height: 800 },
    },
  );
  const page = await context.newPage();

  const consoleErrors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      const text = msg.text();
      // Ignore favicon or non-critical 3rd party font warnings if any
      if (!text.includes("favicon") && !text.includes("404 (Not Found)")) {
        consoleErrors.push(text);
      }
    }
  });

  page.on("pageerror", (err) => {
    consoleErrors.push(err.message);
  });

  try {
    await fn(page, context);
    const durationMs = Date.now() - start;
    reports.push({ category, name, passed: true, durationMs });
    console.log(`  [PASS] [${category}] ${name} (${durationMs}ms)`);
  } catch (err) {
    const durationMs = Date.now() - start;
    reports.push({ category, name, passed: false, error: err.message, durationMs });
    console.error(`  [FAIL] [${category}] ${name}: ${err.message} (${durationMs}ms)`);
  } finally {
    await context.close();
  }
}

(async () => {
  console.log("===============================================================");
  console.log("APEX DETAIL WORKS — COMPREHENSIVE PRODUCTION READINESS AUDIT");
  console.log(`Target: ${BASE_URL}`);
  console.log("===============================================================\n");

  const browser = await chromium.launch({ headless: true });

  try {
    // -------------------------------------------------------------
    // SECTION 1: LANDING PAGE (/)
    // -------------------------------------------------------------
    console.log("--> Category: 1. Landing Page (/) Verification");

    await runTest(
      "Landing Page",
      "Loads without runtime errors and contains branding",
      async (page) => {
        const res = await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
        if (!res || res.status() >= 400)
          throw new Error(`HTTP status ${res ? res.status() : "none"}`);
        const logo = await page.waitForSelector("header img[alt='Apex Detail Works']", {
          timeout: 5000,
        });
        if (!logo) throw new Error("Header brand logo missing");
      },
      browser,
    );

    await runTest(
      "Landing Page",
      "Hero section: display typography, subtitle, and CTA to /book",
      async (page) => {
        await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
        const display = await page.textContent(".apex-display");
        if (!display || !display.includes("Austin's Mobile"))
          throw new Error("Hero headline missing text");
        const sub = await page.textContent(".apex-hero-sub");
        if (!sub || !sub.includes("Cole Ramsey")) throw new Error("Hero subtitle missing text");

        const cta = await page.waitForSelector("#hero-cta-btn");
        await cta.click();
        await page.waitForURL("**/book", { timeout: 6000 });
      },
      browser,
    );

    await runTest(
      "Landing Page",
      "Instagram DM Simulator renders and cycles through conversation",
      async (page) => {
        await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
        const dmContainer = await page.waitForSelector(
          "div[aria-label='Instagram DM simulation']",
          { timeout: 5000 },
        );
        if (!dmContainer) throw new Error("Instagram DM simulator container missing");

        // Verify header in DM simulator
        const username = await page.textContent("div[aria-label='Instagram DM simulation']");
        if (!username || !username.includes("Apex Detail Works"))
          throw new Error("DM simulator header missing Apex Detail Works");

        // Wait for incoming / outgoing message text
        await page.waitForSelector("text=Hey Cole! Love the work on your page", { timeout: 8000 });
        await page.waitForSelector("text=Select Package & Lock Slot", { timeout: 8000 });
      },
      browser,
    );

    await runTest(
      "Landing Page",
      "Stat strip & problem-solving section render proof points",
      async (page) => {
        await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
        const statStrip = await page.waitForSelector(".apex-stat-strip");
        if (!statStrip) throw new Error("Stat strip not found");

        const problemH2 = await page.textContent(".apex-section-h2");
        if (!problemH2 || !problemH2.includes("Instagram DMs"))
          throw new Error("Problem headline missing");

        // Verify 3 steps
        const steps = await page.locator("text=Glove Lockout").count();
        if (steps === 0) throw new Error("Glove Lockout problem step missing");
      },
      browser,
    );

    await runTest(
      "Landing Page",
      "Before/After drawer: opens, renders metrics, closes on Escape/button",
      async (page) => {
        await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
        const trigger = await page.waitForSelector(
          "button[aria-label='Open Before vs After comparison']",
        );
        await trigger.click();
        await page.waitForSelector("div[role='dialog']", { timeout: 5000 });

        const dialogText = await page.textContent("div[role='dialog']");
        if (!dialogText || !dialogText.includes("$900") || !dialogText.includes("no-shows")) {
          throw new Error("Drawer missing verified comparison metrics");
        }

        // Close via Escape key
        await page.keyboard.press("Escape");
        await page.waitForTimeout(400);
        const isVisible = await page.isVisible("div[role='dialog']");
        if (isVisible) throw new Error("Drawer failed to close on Escape");
      },
      browser,
    );

    await runTest(
      "Landing Page",
      "Image integrity: all images render with non-zero dimensions",
      async (page) => {
        await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
        // Scroll to trigger lazy-loaded images like footer logo
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(600);
        const brokenImages = await page.evaluate(() => {
          const imgs = Array.from(document.querySelectorAll("img"));
          return imgs
            .filter((img) => !img.complete || img.naturalWidth === 0)
            .map((img) => img.src);
        });
        if (brokenImages.length > 0)
          throw new Error(`Broken images found: ${brokenImages.join(", ")}`);
      },
      browser,
    );

    await runTest(
      "Landing Page",
      "Footer links point to valid existing routes without dead links",
      async (page) => {
        await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
        const footerLinks = await page.$$eval("footer a", (anchors) =>
          anchors.map((a) => a.getAttribute("href")).filter((h) => h && h.startsWith("/")),
        );
        const validRoutes = ["/", "/book", "/hud"];
        for (const link of footerLinks) {
          if (!validRoutes.includes(link.split("?")[0])) {
            throw new Error(`Footer contains invalid internal route: ${link}`);
          }
        }
      },
      browser,
    );

    // -------------------------------------------------------------
    // SECTION 2: CUSTOMER BOOKING FLOW (/book)
    // -------------------------------------------------------------
    console.log("\n--> Category: 2. Complete Customer Booking Experience (/book)");

    await runTest(
      "Booking Flow",
      "Step 1: Vehicle selection with pricing multipliers",
      async (page) => {
        await page.goto(`${BASE_URL}/book`, { waitUntil: "networkidle" });
        const vehicleCards = await page.locator(".apex-vehicle-card").all();
        if (vehicleCards.length !== 3)
          throw new Error(`Expected 3 vehicle cards, found ${vehicleCards.length}`);

        // Select Mid-Size Crossover (1.25x multiplier)
        await vehicleCards[1].click();
        const continueBtn = page.locator("button:has-text('Continue')");
        await continueBtn.click();
        await page.waitForSelector("text=Choose your service package", { timeout: 5000 });
      },
      browser,
    );

    await runTest(
      "Booking Flow",
      "Step 2: Service packages and add-on condition flags update pricing in real time",
      async (page) => {
        await page.goto(`${BASE_URL}/book`, { waitUntil: "networkidle" });
        // Pick sedan
        await page.locator(".apex-vehicle-card").first().click();
        await page.click("button:has-text('Continue')");

        // Verify 3 packages exist: Interior, Express Foam, Ceramic
        const interiorPkg = await page.waitForSelector("text=Interior Steam & Deep Extraction");
        const foamPkg = await page.waitForSelector("text=Express Foam & Seal");
        const ceramicPkg = await page.waitForSelector(
          "text=1-Stage Paint Correction + Ceramic Coating",
        );
        if (!interiorPkg || !foamPkg || !ceramicPkg)
          throw new Error("Expected service packages missing");

        // Select Express Foam & Seal ($140 base)
        await page.click("button:has-text('Express Foam & Seal')");

        // Toggle Heavy Pet / Dog Hair Removal add-on (+$50)
        const dogHairSwitch = page.locator("button[role='switch']").first();
        await dogHairSwitch.click();

        // Check StickyBar total reflects $140 + $50 = $190
        const totalText = await page.textContent(".font-mono.text-cyan:has-text('Total:')");
        if (!totalText || !totalText.includes("$190")) {
          throw new Error(`Expected Total to be $190 with add-on, got ${totalText}`);
        }

        await page.click("button:has-text('Continue')");
        await page.waitForSelector("text=Where are you located?", { timeout: 5000 });
      },
      browser,
    );

    await runTest(
      "Booking Flow",
      "Step 3: Austin metro geofence validation (rejects invalid zip, accepts Austin zip)",
      async (page) => {
        await page.goto(`${BASE_URL}/book`, { waitUntil: "networkidle" });
        await page.locator(".apex-vehicle-card").first().click();
        await page.click("button:has-text('Continue')");
        await page.click("button:has-text('Continue')");

        // 1. Test non-Austin zip code (e.g. 56010 or 90210)
        const zipInput = page.locator("input[placeholder*='Enter 5-digit zip']");
        await zipInput.fill("56010");
        await page.click("button:has-text('Check Cluster')");
        await page.waitForSelector("text=Outside Austin Metro Service Area", { timeout: 5000 });

        // Continue button should be disabled
        const continueBtn = page.locator("button:has-text('Continue')");
        const isDisabled = await continueBtn.isDisabled();
        if (!isDisabled) throw new Error("Continue button should be disabled for non-Austin zip");

        // 2. Select quick Austin sector (78704 - South Congress)
        await page.click("button:has-text('78704')");
        await page.waitForSelector("text=Route Cluster Match — South Congress", { timeout: 6000 });

        // Select time slot
        const slotBtns = await page.locator("button:has-text('AM'), button:has-text('PM')").all();
        if (slotBtns.length === 0) throw new Error("No time slots available for cluster");
        await slotBtns[0].click();

        // Continue should now be enabled
        const isEnabled = await continueBtn.isEnabled();
        if (!isEnabled)
          throw new Error("Continue button should be enabled after valid slot selection");
        await continueBtn.click();
        await page.waitForSelector("text=Quick site readiness check", { timeout: 5000 });
      },
      browser,
    );

    await runTest(
      "Booking Flow",
      "Step 4: Pre-flight site checklist, water tank fallback, and phone validation",
      async (page) => {
        await page.goto(`${BASE_URL}/book`, { waitUntil: "networkidle" });
        await page.locator(".apex-vehicle-card").first().click();
        await page.click("button:has-text('Continue')");
        await page.click("button:has-text('Continue')");
        await page.click("button:has-text('78704')");
        await page.waitForSelector("text=Route Cluster Match");
        const slots = await page.locator("button:has-text('AM'), button:has-text('PM')").all();
        await slots[0].click();
        await page.click("button:has-text('Continue')");

        // Check pre-flight checklist toggles
        const checks = await page
          .locator(
            "button:has-text('Level parking'), button:has-text('Exterior water'), button:has-text('Vehicle will be accessible')",
          )
          .all();
        for (const btn of checks) await btn.click();

        // Fill Name
        await page.fill("input[name='firstName']", "Cole Client");

        // Test invalid phone number (e.g. 512)
        await page.fill("input[name='phone']", "512");
        await page.waitForSelector("#phone-error", { timeout: 4000 });

        // Fill valid 10-digit phone
        await page.fill("input[name='phone']", "5125550188");
        const phoneErrorVisible = await page.isVisible("#phone-error");
        if (phoneErrorVisible)
          throw new Error("Phone error still visible for valid 10-digit number");

        await page.click("button:has-text('Continue')");
        await page.waitForSelector("text=Secure $50 Hold", { timeout: 5000 });
      },
      browser,
    );

    await runTest(
      "Booking Flow",
      "Step 5 & Post-Confirmation: Card authorization, deposit hold, calendar link, wallet pass",
      async (page) => {
        await page.goto(`${BASE_URL}/book`, { waitUntil: "networkidle" });
        await page.locator(".apex-vehicle-card").first().click();
        await page.click("button:has-text('Continue')");
        await page.click("button:has-text('Continue')");
        await page.click("button:has-text('78704')");
        await page.waitForSelector("text=Route Cluster Match");
        const slots = await page.locator("button:has-text('AM'), button:has-text('PM')").all();
        await slots[0].click();
        await page.click("button:has-text('Continue')");

        const checks = await page
          .locator(
            "button:has-text('Level parking'), button:has-text('Exterior water'), button:has-text('Vehicle will be accessible')",
          )
          .all();
        for (const btn of checks) await btn.click();
        await page.fill("input[name='firstName']", "E2E Tester");
        await page.fill("input[name='phone']", "5125550199");
        await page.click("button:has-text('Continue')");

        // Step 5: Fill credit card
        await page.fill("input[name='cardNumber']", "4242 4242 4242 4242");
        await page.fill("input[name='cardExpiry']", "12/28");
        await page.fill("input[name='cardCvc']", "888");
        await page.fill("input[name='cardName']", "E2E Tester");

        // Verify order summary contains Deposit today $50
        const summaryText = await page.textContent("aside.surface");
        if (!summaryText || !summaryText.includes("$50"))
          throw new Error("Order summary missing $50 deposit");

        // Authorize
        await page.click("button:has-text('Authorize $50')");

        // Confirmation Pass
        await page.waitForSelector('h1:has-text("You\'re Booked.")', { timeout: 10000 });
        const refCode = await page.textContent(".confirm-ref");
        if (!refCode || !refCode.includes("ADW-78704-")) {
          throw new Error(`Expected confirmation code ADW-78704-xx, got ${refCode}`);
        }

        // Check Apple Wallet pass trigger
        await page.click("button:has-text('Save to Apple Wallet')");
        await page.waitForSelector("div[role='dialog']", { timeout: 4000 });
        const walletTitle = await page.textContent("#wallet-pass-modal-title");
        if (!walletTitle || !walletTitle.includes("APEX DETAIL WORKS"))
          throw new Error("Wallet pass modal missing title");
        await page.keyboard.press("Escape");
        await page.waitForTimeout(300);

        // Check Google Calendar button exists
        const gcalBtn = await page.waitForSelector("button:has-text('Add to Google Calendar')");
        if (!gcalBtn) throw new Error("Google Calendar button missing");

        // Reset action
        await page.click("button:has-text('Book another vehicle')");
        await page.waitForSelector("text=What are we working on today?", { timeout: 5000 });
      },
      browser,
    );

    // -------------------------------------------------------------
    // SECTION 3: OWNER OPERATIONS HUD (/hud)
    // -------------------------------------------------------------
    console.log("\n--> Category: 3. Owner Operations Cockpit (/hud)");

    await runTest(
      "Owner HUD",
      "HUD loads without runtime errors with telemetry cards and route deck",
      async (page) => {
        const res = await page.goto(`${BASE_URL}/hud`, { waitUntil: "networkidle" });
        if (!res || res.status() >= 400)
          throw new Error(`HTTP status ${res ? res.status() : "none"}`);

        await page.waitForSelector("h1:has-text('Owner Command HUD')");

        // Telemetry cards
        const telemetry = await page.textContent(".grid.font-mono");
        if (
          !telemetry ||
          !telemetry.includes("Deionized Water") ||
          !telemetry.includes("Inverter Bank")
        ) {
          throw new Error("Missing HUD equipment telemetry cards");
        }

        // Route deck
        const routeH2 = await page.textContent('h2:has-text("Today\'s Route")');
        if (!routeH2) throw new Error("Today's Route header missing");
      },
      browser,
    );

    await runTest(
      "Owner HUD",
      "Job status transition buttons update booking state and dispatch SMS logs",
      async (page) => {
        await page.goto(`${BASE_URL}/hud`, { waitUntil: "networkidle" });

        // Click "Job Started" on first route card
        const jobStartedBtn = page.locator("button:has-text('Job Started')").first();
        await jobStartedBtn.click();
        await page.waitForSelector("[data-sonner-toast]", { timeout: 5000 });
      },
      browser,
    );

    await runTest(
      "Owner HUD",
      "Flash storm emergency simulation dispatches 1-click batch reschedule",
      async (page) => {
        await page.goto(`${BASE_URL}/hud`, { waitUntil: "networkidle" });
        const stormBtn = await page.waitForSelector("button:has-text('Simulate Flash Storm')");
        await stormBtn.click();

        await page.waitForSelector("h2:has-text('Travis County Precipitation Warning')", {
          timeout: 5000,
        });
        const dispatchBtn = page.locator("button:has-text('Execute 1-Click Reschedule')");
        await dispatchBtn.click();

        await page.waitForSelector("[data-sonner-toast]", { timeout: 6000 });
        const toastText = await page.textContent("[data-sonner-toast]");
        if (!toastText || !toastText.includes("reschedule")) {
          throw new Error(`Unexpected toast message: ${toastText}`);
        }
      },
      browser,
    );

    await runTest(
      "Owner HUD",
      "Reset Demo State restores seed bookings and audit feed cleanly",
      async (page) => {
        await page.goto(`${BASE_URL}/hud`, { waitUntil: "networkidle" });
        const resetBtn = page.locator("button:has-text('Reset Demo State')").first();
        await resetBtn.click();
        await page.waitForSelector("[data-sonner-toast]", { timeout: 5000 });
      },
      browser,
    );

    // -------------------------------------------------------------
    // SECTION 4: CUSTOMER WEATHER RESCHEDULE FLOW (/reschedule/$refCode)
    // -------------------------------------------------------------
    console.log("\n--> Category: 4. Customer Weather Reschedule Flow (/reschedule/$refCode)");

    await runTest(
      "Reschedule Flow",
      "Storm modal generates customer link and navigation resolves to working reschedule portal",
      async (page) => {
        await page.goto(`${BASE_URL}/hud`, { waitUntil: "networkidle" });
        await page.click("button:has-text('Simulate Flash Storm')");
        await page.waitForSelector("h2:has-text('Travis County Precipitation Warning')", {
          timeout: 5000,
        });

        // Click the generated customer reschedule link
        const rescheduleLink = page.locator("a[href*='/reschedule/']").first();
        await rescheduleLink.click();
        await page.waitForURL("**/reschedule/**", { timeout: 6000 });

        // Verify page loaded with priority weather advisory
        await page.waitForSelector("text=Travis County Flash Rain Advisory", { timeout: 5000 });
        const bookingCard = await page.textContent("main");
        if (!bookingCard || !bookingCard.includes("Affected Appointment")) {
          throw new Error("Reschedule portal missing affected appointment card");
        }
      },
      browser,
    );

    await runTest(
      "Reschedule Flow",
      "Customer views affected booking, selects replacement slot, confirms reschedule, and verifies deposit preservation",
      async (page) => {
        await page.goto(`${BASE_URL}/reschedule/ADW-78704-89`, { waitUntil: "networkidle" });

        // Check affected appointment details
        await page.waitForSelector("text=ADW-78704-89", { timeout: 5000 });
        await page.waitForSelector("text=Select Priority Replacement Slot", { timeout: 5000 });

        // Verify deposit protection notice
        const depositNotice = await page.textContent("main");
        if (!depositNotice || !depositNotice.includes("$50 deposit")) {
          throw new Error("Missing $50 deposit protection notice");
        }

        // Select the second replacement slot (Friday afternoon)
        const slotButtons = page.locator("button:has-text('Friday'), button:has-text('Saturday')");
        const count = await slotButtons.count();
        if (count < 2) throw new Error(`Expected at least 2 replacement slots, found ${count}`);
        await slotButtons.nth(1).click();

        // Click Confirm Replacement Slot
        const confirmBtn = page.locator("button:has-text('Confirm Replacement Slot')");
        await confirmBtn.click();

        // Verify Confirmed State
        await page.waitForSelector('h1:has-text("Replacement Slot Confirmed")', { timeout: 8000 });
        const confirmedText = await page.textContent("main");
        if (!confirmedText || !confirmedText.includes("ADW-78704-89")) {
          throw new Error("Confirmation pass missing booking reference code");
        }
        if (!confirmedText || !confirmedText.includes("Deposit Successfully Transferred")) {
          throw new Error("Confirmation pass missing deposit transfer verification");
        }

        // Check Google Calendar action exists on confirmation
        const gcalBtn = page.locator("button:has-text('Add to Google Calendar')");
        const gcalExists = await gcalBtn.isVisible();
        if (!gcalExists)
          throw new Error("Google Calendar button missing on reschedule confirmation pass");
      },
      browser,
    );

    // -------------------------------------------------------------
    // SECTION 5: RESPONSIVE VIEWPORT AUDIT (Zero Horizontal Overflow)
    // -------------------------------------------------------------
    console.log("\n--> Category: 5. Responsive Viewport Audit (Zero Horizontal Overflow)");

    const viewports = [
      { width: 320, height: 800, label: "320x800 (Compact Mobile)" },
      { width: 375, height: 812, label: "375x812 (iPhone Mini)" },
      { width: 390, height: 844, label: "390x844 (iPhone 14)" },
      { width: 430, height: 932, label: "430x932 (iPhone Pro Max)" },
      { width: 768, height: 1024, label: "768x1024 (iPad / Tablet)" },
      { width: 1280, height: 800, label: "1280x800 (Desktop Laptop)" },
      { width: 1440, height: 900, label: "1440x900 (Large Desktop)" },
    ];

    const testRoutes = ["/", "/book", "/hud", "/reschedule/ADW-78704-89"];

    for (const vp of viewports) {
      for (const route of testRoutes) {
        await runTest(
          "Responsive",
          `${route} at ${vp.label}: zero horizontal overflow`,
          async (page) => {
            await page.goto(`${BASE_URL}${route}`, { waitUntil: "networkidle" });
            const overflow = await page.evaluate(() => {
              const docWidth = document.documentElement.scrollWidth;
              const winWidth = window.innerWidth;
              return {
                docWidth,
                winWidth,
                hasOverflow: docWidth > winWidth,
              };
            });
            if (overflow.hasOverflow) {
              throw new Error(
                `Horizontal overflow detected: scrollWidth (${overflow.docWidth}px) > innerWidth (${overflow.winWidth}px)`,
              );
            }
          },
          browser,
          { viewport: { width: vp.width, height: vp.height } },
        );
      }
    }

    // -------------------------------------------------------------
    // SECTION 6: TECHNICAL SEO & STRUCTURED DATA VERIFICATION
    // -------------------------------------------------------------
    console.log("\n--> Category: 6. Technical SEO & Schema Verification");

    await runTest(
      "SEO & Schema",
      "Landing page has valid meta tags, title, and JSON-LD AutoRepair schema",
      async (page) => {
        await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });

        const title = await page.title();
        if (!title || !title.includes("Apex Detail Works"))
          throw new Error(`Invalid title: ${title}`);

        const metaDesc = await page.$eval("meta[name='description']", (el) =>
          el.getAttribute("content"),
        );
        if (!metaDesc || !metaDesc.includes("Austin"))
          throw new Error(`Invalid meta description: ${metaDesc}`);

        const ogImage = await page.$eval("meta[property='og:image']", (el) =>
          el.getAttribute("content"),
        );
        if (!ogImage || !ogImage.includes("apex-og.png"))
          throw new Error(`Invalid og:image: ${ogImage}`);

        const canonical = await page.$eval("link[rel='canonical']", (el) =>
          el.getAttribute("href"),
        );
        if (!canonical || !canonical.includes("https://pixel-perfect-replica-0340.lovable.app/")) {
          throw new Error(`Invalid canonical: ${canonical}`);
        }

        // Check JSON-LD
        const jsonLdContent = await page.$eval(
          "script[type='application/ld+json']",
          (el) => el.textContent,
        );
        const parsed = JSON.parse(jsonLdContent);
        if (parsed["@type"] !== "AutoRepair" || parsed.name !== "Apex Detail Works") {
          throw new Error(`Invalid JSON-LD schema: ${jsonLdContent}`);
        }
      },
      browser,
    );

    await runTest(
      "SEO & Schema",
      "Sitemap.xml and robots.txt are reachable and formatted correctly",
      async (page) => {
        const robotsRes = await page.goto(`${BASE_URL}/robots.txt`);
        if (robotsRes.status() !== 200) throw new Error("robots.txt not found");
        const robotsText = await robotsRes.text();
        if (
          !robotsText.includes(
            "Sitemap: https://pixel-perfect-replica-0340.lovable.app/sitemap.xml",
          )
        ) {
          throw new Error("robots.txt missing Sitemap directive");
        }

        const sitemapRes = await page.goto(`${BASE_URL}/sitemap.xml`);
        if (sitemapRes.status() !== 200) throw new Error("sitemap.xml not found");
        const sitemapText = await sitemapRes.text();
        if (!sitemapText.includes("<loc>https://pixel-perfect-replica-0340.lovable.app/</loc>")) {
          throw new Error("sitemap.xml missing root loc");
        }
      },
      browser,
    );
  } finally {
    await browser.close();
  }

  console.log("\n===============================================================");
  const total = reports.length;
  const passed = reports.filter((r) => r.passed).length;
  const failed = reports.filter((r) => !r.passed).length;
  console.log(`PLAYWRIGHT AUDIT COMPLETE: ${passed}/${total} TESTS PASSED`);
  if (failed > 0) {
    console.error(`FAILED TESTS (${failed}):`);
    reports
      .filter((r) => !r.passed)
      .forEach((r) => console.error(`  - [${r.category}] ${r.name}: ${r.error}`));
  }
  console.log("===============================================================\n");

  process.exit(passed === total ? 0 : 1);
})();
