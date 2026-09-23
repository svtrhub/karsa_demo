import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const VIEWPORTS = [
  { name: "mobile_375x667", width: 375, height: 667, deviceType: "mobile" },
  { name: "tablet_768x1024", width: 768, height: 1024, deviceType: "tablet" },
  { name: "desktop_1280x800", width: 1280, height: 800, deviceType: "desktop" },
  { name: "large_desktop_1920x1080", width: 1920, height: 1080, deviceType: "large_desktop" },
];

const OUT_DIR = path.resolve("audit_screenshots/stress_test");
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function runStressTests() {
  console.log("==================================================================");
  console.log("STARTING PLAYWRIGHT EMPIRICAL STRESS TEST (MILESTONE 1)");
  console.log("==================================================================");

  const browser = await chromium.launch({ headless: true });
  const results = {
    timestamp: new Date().toISOString(),
    viewportsTested: VIEWPORTS.length,
    resultsByViewport: {},
    overallPass: true,
  };

  for (const vp of VIEWPORTS) {
    console.log(`\n--------------------------------------------------------------`);
    console.log(`Testing Viewport: ${vp.name} (${vp.width}x${vp.height} - ${vp.deviceType})`);
    console.log(`--------------------------------------------------------------`);

    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();

    const vpMetrics = {
      viewport: vp,
      step0: {},
      step1_sma: {},
      step1_smp: {},
      step1_smp_kelas8: {},
      pointerInteractivity: {},
      topLeftDuplicateCheck: {},
      passedAllChecks: true,
      failures: [],
    };

    try {
      // 1. Navigate and clean state
      await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
      await page.evaluate(() => localStorage.clear());
      await page.reload({ waitUntil: "networkidle" });
      await page.waitForTimeout(600);

      // ==========================================
      // STEP 0: MEASUREMENTS & CHECKS
      // ==========================================
      console.log(`[${vp.name}] Checking Step 0 Layout & Overflow...`);
      const step0Metrics = await page.evaluate(() => {
        const docEl = document.documentElement;
        const body = document.body;
        return {
          innerWidth: window.innerWidth,
          innerHeight: window.innerHeight,
          htmlScrollWidth: docEl.scrollWidth,
          htmlScrollHeight: docEl.scrollHeight,
          bodyScrollWidth: body.scrollWidth,
          bodyScrollHeight: body.scrollHeight,
          hasHorizontalScrollbar: docEl.scrollWidth > window.innerWidth,
          horizontalOverflowPixels: Math.max(0, docEl.scrollWidth - window.innerWidth),
          hasVerticalScrollbar: docEl.scrollHeight > window.innerHeight,
          verticalOverflowPixels: Math.max(0, docEl.scrollHeight - window.innerHeight),
        };
      });
      vpMetrics.step0 = step0Metrics;

      // Duplicate KARSA Text Check on Step 0
      console.log(`[${vp.name}] Checking Top-Left Area for Duplicate KARSA on Step 0...`);
      const karsaInstancesStep0 = await page.evaluate(() => {
        // Collect all text nodes or elements containing "KARSA"
        const elements = Array.from(document.querySelectorAll("*"));
        const matches = [];
        for (const el of elements) {
          // Check direct text or specific logo containers
          if (el.children.length === 0 && el.textContent && el.textContent.trim().toUpperCase() === "KARSA") {
            const rect = el.getBoundingClientRect();
            matches.push({
              tag: el.tagName,
              text: el.textContent.trim(),
              x: rect.x,
              y: rect.y,
              width: rect.width,
              height: rect.height,
              isTopLeft: rect.x < 250 && rect.y < 150,
            });
          }
        }
        return matches;
      });

      const topLeftKarsaStep0 = karsaInstancesStep0.filter((k) => k.isTopLeft);
      vpMetrics.topLeftDuplicateCheck.step0 = {
        totalInstances: karsaInstancesStep0.length,
        instances: karsaInstancesStep0,
        hasTopLeftDuplicate: topLeftKarsaStep0.length > 0,
      };

      if (topLeftKarsaStep0.length > 0) {
        vpMetrics.failures.push(`Step 0 has duplicate KARSA logo in top-left region: ${JSON.stringify(topLeftKarsaStep0)}`);
      }

      // Check Spotlight Reveal Beam Presence & Properties
      const spotlightBeamCheck = await page.evaluate(() => {
        const godRay = document.querySelector('div[style*="polygon(100% 0%"]');
        const bounceHalo = document.querySelector('div[style*="radial-gradient(ellipse"]');
        const container = godRay?.parentElement;
        return {
          containerExists: !!container,
          isPointerEventsNone: container ? window.getComputedStyle(container).pointerEvents === "none" : false,
          isOverflowHidden: container ? window.getComputedStyle(container).overflow === "hidden" : false,
          godRayExists: !!godRay,
          bounceHaloExists: !!bounceHalo,
        };
      });
      vpMetrics.spotlightBeam = spotlightBeamCheck;

      if (!spotlightBeamCheck.containerExists || !spotlightBeamCheck.isPointerEventsNone) {
        vpMetrics.failures.push("Spotlight container missing or not pointer-events: none");
      }

      // Screenshot Step 0
      const step0ShotPath = path.join(OUT_DIR, `${vp.name}_step0.png`);
      await page.screenshot({ path: step0ShotPath, fullPage: false });

      // ==========================================
      // STEP 0 INTERACTIVITY & POINTER EVENTS
      // ==========================================
      console.log(`[${vp.name}] Testing Step 0 Pointer-Events & Interaction...`);
      // 1. Test elementFromPoint for "Mulai perjalanan!" button
      const step0BtnHandle = await page.$("text=Mulai perjalanan!");
      if (!step0BtnHandle) {
        vpMetrics.failures.push("Could not find 'Mulai perjalanan!' button on Step 0");
      } else {
        const btnBox = await step0BtnHandle.boundingBox();
        const topElementAtBtn = await page.evaluate(({ x, y }) => {
          const el = document.elementFromPoint(x, y);
          return {
            tagName: el?.tagName,
            id: el?.id,
            className: el?.className,
            text: el?.textContent?.trim().slice(0, 30),
          };
        }, { x: btnBox.x + btnBox.width / 2, y: btnBox.y + btnBox.height / 2 });

        vpMetrics.pointerInteractivity.step0Button = {
          buttonBox: btnBox,
          topElementAtPoint: topElementAtBtn,
          isObstructed: !topElementAtBtn.text?.includes("Mulai perjalanan"),
        };

        if (vpMetrics.pointerInteractivity.step0Button.isObstructed) {
          vpMetrics.failures.push(`'Mulai perjalanan!' button obstructed by ${JSON.stringify(topElementAtBtn)}`);
        }

        // Click "Mulai perjalanan!"
        await page.click("text=Mulai perjalanan!");
        await page.waitForTimeout(400);

        // Check name input visibility & type text
        const nameInputHandle = await page.$("#input-nama-panggilan");
        if (!nameInputHandle) {
          vpMetrics.failures.push("Name input '#input-nama-panggilan' did not appear after clicking 'Mulai perjalanan!'");
        } else {
          // Check elementFromPoint on input
          const inputBBox = await nameInputHandle.boundingBox();
          const topElementAtInput = await page.evaluate(({ x, y }) => {
            const el = document.elementFromPoint(x, y);
            return {
              tagName: el?.tagName,
              id: el?.id,
              text: el?.textContent?.trim().slice(0, 30),
            };
          }, { x: inputBBox.x + inputBBox.width / 2, y: inputBBox.y + inputBBox.height / 2 });

          vpMetrics.pointerInteractivity.nameInput = {
            inputBBox,
            topElementAtPoint: topElementAtInput,
            isObstructed: topElementAtInput.id !== "input-nama-panggilan" && topElementAtInput.tagName !== "INPUT",
          };

          // Fill and type name
          await page.fill("#input-nama-panggilan", "");
          await page.type("#input-nama-panggilan", "EmpiricalTester", { delay: 20 });
          const typedVal = await page.$eval("#input-nama-panggilan", (el) => el.value);
          vpMetrics.pointerInteractivity.nameInput.typedValue = typedVal;
          if (typedVal !== "EmpiricalTester") {
            vpMetrics.failures.push(`Typing in name input failed. Expected 'EmpiricalTester', got '${typedVal}'`);
          }

          // Advance to Step 1
          await page.click("button:has-text('Mulai Perjalanan')");
          await page.waitForTimeout(600);
        }
      }

      // ==========================================
      // STEP 1: SMA/SMK (DEFAULT) CHECKS
      // ==========================================
      console.log(`[${vp.name}] Checking Step 1 Layout & Overflow (SMA Tier)...`);
      const step1SmaMetrics = await page.evaluate(() => {
        const docEl = document.documentElement;
        const body = document.body;
        return {
          innerWidth: window.innerWidth,
          innerHeight: window.innerHeight,
          htmlScrollWidth: docEl.scrollWidth,
          htmlScrollHeight: docEl.scrollHeight,
          bodyScrollWidth: body.scrollWidth,
          bodyScrollHeight: body.scrollHeight,
          hasHorizontalScrollbar: docEl.scrollWidth > window.innerWidth,
          horizontalOverflowPixels: Math.max(0, docEl.scrollWidth - window.innerWidth),
          hasVerticalScrollbar: docEl.scrollHeight > window.innerHeight,
          verticalOverflowPixels: Math.max(0, docEl.scrollHeight - window.innerHeight),
        };
      });
      vpMetrics.step1_sma = step1SmaMetrics;

      // Duplicate KARSA Text Check on Step 1
      const karsaInstancesStep1 = await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll("*"));
        const matches = [];
        for (const el of elements) {
          if (el.children.length === 0 && el.textContent && el.textContent.trim().toUpperCase() === "KARSA") {
            const rect = el.getBoundingClientRect();
            matches.push({
              tag: el.tagName,
              text: el.textContent.trim(),
              x: rect.x,
              y: rect.y,
              width: rect.width,
              height: rect.height,
              isTopLeft: rect.x < 250 && rect.y < 150,
            });
          }
        }
        return matches;
      });

      const topLeftKarsaStep1 = karsaInstancesStep1.filter((k) => k.isTopLeft);
      vpMetrics.topLeftDuplicateCheck.step1 = {
        totalInstances: karsaInstancesStep1.length,
        instances: karsaInstancesStep1,
        hasTopLeftDuplicate: topLeftKarsaStep1.length > 0,
      };

      if (topLeftKarsaStep1.length > 0) {
        vpMetrics.failures.push(`Step 1 has duplicate KARSA logo in top-left region: ${JSON.stringify(topLeftKarsaStep1)}`);
      }

      // Check Tier 1 & Tier 2 Accessibility and Layout
      const selectorLayoutMetrics = await page.evaluate(() => {
        const tabList = document.querySelector('[role="tablist"]');
        const tabSma = document.getElementById("tab-sma");
        const tabSmp = document.getElementById("tab-smp");
        const tabPanel = document.getElementById("tier2-subclasses-panel");
        const chips = Array.from(document.querySelectorAll('[role="radio"]'));

        return {
          tabListBBox: tabList ? tabList.getBoundingClientRect() : null,
          tabSmaBBox: tabSma ? tabSma.getBoundingClientRect() : null,
          tabSmpBBox: tabSmp ? tabSmp.getBoundingClientRect() : null,
          tabPanelBBox: tabPanel ? tabPanel.getBoundingClientRect() : null,
          chipCount: chips.length,
          chipHeights: chips.map((c) => c.getBoundingClientRect().height),
          allChipsMeetTouchTarget: chips.every((c) => c.getBoundingClientRect().height >= 44),
        };
      });
      vpMetrics.step1_selectorLayout = selectorLayoutMetrics;

      if (!selectorLayoutMetrics.allChipsMeetTouchTarget) {
        vpMetrics.failures.push(`Some Tier 2 chips violate 44px touch target minimum: ${JSON.stringify(selectorLayoutMetrics.chipHeights)}`);
      }

      // Screenshot Step 1 SMA
      const step1SmaShotPath = path.join(OUT_DIR, `${vp.name}_step1_sma.png`);
      await page.screenshot({ path: step1SmaShotPath, fullPage: false });

      // ==========================================
      // STEP 1 INTERACTION: TAB SWITCHING TO SMP
      // ==========================================
      console.log(`[${vp.name}] Testing Tier 1 Tab Switch to SMP...`);
      // Test elementFromPoint on SMP Tab
      const tabSmpHandle = await page.$("#tab-smp");
      const tabSmpBBox = await tabSmpHandle.boundingBox();
      const topElAtSmpTab = await page.evaluate(({ x, y }) => {
        const el = document.elementFromPoint(x, y);
        return {
          id: el?.id,
          tagName: el?.tagName,
          text: el?.textContent?.trim().slice(0, 20),
        };
      }, { x: tabSmpBBox.x + tabSmpBBox.width / 2, y: tabSmpBBox.y + tabSmpBBox.height / 2 });

      vpMetrics.pointerInteractivity.tabSmp = {
        bbox: tabSmpBBox,
        topElementAtPoint: topElAtSmpTab,
        isObstructed: !topElAtSmpTab.id?.includes("tab-smp") && !topElAtSmpTab.text?.includes("SMP"),
      };

      if (vpMetrics.pointerInteractivity.tabSmp.isObstructed) {
        vpMetrics.failures.push(`SMP Tab is obstructed by ${JSON.stringify(topElAtSmpTab)}`);
      }

      // Click SMP Tab
      await page.click("#tab-smp");
      await page.waitForTimeout(500);

      // Measure layout on SMP Tier
      const step1SmpMetrics = await page.evaluate(() => {
        const docEl = document.documentElement;
        return {
          innerWidth: window.innerWidth,
          innerHeight: window.innerHeight,
          htmlScrollWidth: docEl.scrollWidth,
          htmlScrollHeight: docEl.scrollHeight,
          hasHorizontalScrollbar: docEl.scrollWidth > window.innerWidth,
          horizontalOverflowPixels: Math.max(0, docEl.scrollWidth - window.innerWidth),
          hasVerticalScrollbar: docEl.scrollHeight > window.innerHeight,
          verticalOverflowPixels: Math.max(0, docEl.scrollHeight - window.innerHeight),
        };
      });
      vpMetrics.step1_smp = step1SmpMetrics;

      // Screenshot Step 1 SMP
      const step1SmpShotPath = path.join(OUT_DIR, `${vp.name}_step1_smp.png`);
      await page.screenshot({ path: step1SmpShotPath, fullPage: false });

      // Click Kelas 8 Chip
      console.log(`[${vp.name}] Clicking Kelas 8 Chip in SMP Tier...`);
      const kelas8Handle = await page.$("text=Kelas 8");
      const kelas8BBox = await kelas8Handle.boundingBox();
      const topElAtKelas8 = await page.evaluate(({ x, y }) => {
        const el = document.elementFromPoint(x, y);
        return {
          tagName: el?.tagName,
          text: el?.textContent?.trim().slice(0, 30),
        };
      }, { x: kelas8BBox.x + kelas8BBox.width / 2, y: kelas8BBox.y + kelas8BBox.height / 2 });

      vpMetrics.pointerInteractivity.kelas8Chip = {
        bbox: kelas8BBox,
        topElementAtPoint: topElAtKelas8,
        isObstructed: !topElAtKelas8.text?.includes("Kelas 8"),
      };

      await page.click("text=Kelas 8");
      await page.waitForTimeout(400);

      // Verify Kelas 8 is selected
      const isKelas8Selected = await page.evaluate(() => {
        const chips = Array.from(document.querySelectorAll('[role="radio"]'));
        const k8 = chips.find((c) => c.textContent.includes("Kelas 8"));
        return k8 ? k8.getAttribute("aria-checked") === "true" : false;
      });
      vpMetrics.pointerInteractivity.kelas8Selected = isKelas8Selected;
      if (!isKelas8Selected) {
        vpMetrics.failures.push("Selecting 'Kelas 8' failed to set aria-checked='true'");
      }

      // Screenshot Step 1 SMP Kelas 8
      const step1SmpK8ShotPath = path.join(OUT_DIR, `${vp.name}_step1_smp_kelas8.png`);
      await page.screenshot({ path: step1SmpK8ShotPath, fullPage: false });

      // Test Category Memory Pattern: Switch back to SMA, then back to SMP
      console.log(`[${vp.name}] Verifying Category Memory across tabs...`);
      await page.click("#tab-sma");
      await page.waitForTimeout(400);
      await page.click("#tab-smp");
      await page.waitForTimeout(400);

      const isKelas8Remembered = await page.evaluate(() => {
        const chips = Array.from(document.querySelectorAll('[role="radio"]'));
        const k8 = chips.find((c) => c.textContent.includes("Kelas 8"));
        return k8 ? k8.getAttribute("aria-checked") === "true" : false;
      });
      vpMetrics.pointerInteractivity.kelas8Remembered = isKelas8Remembered;
      if (!isKelas8Remembered) {
        vpMetrics.failures.push("Category memory failed: 'Kelas 8' was not retained after toggling tabs");
      }

      // Test Next and Back Navigation
      console.log(`[${vp.name}] Testing Next (Lanjut) and Back (Kembali) buttons...`);
      await page.click("button:has-text('Lanjut')");
      await page.waitForTimeout(500);

      // Verify Step 2 reached
      const isStep2 = await page.evaluate(() => {
        return !!document.querySelector("text=Bidang apa yang ingin kamu coba?") || !!document.querySelector('label:has-text("Keahlian")') || document.body.textContent.includes("Bidang apa yang ingin kamu coba");
      });
      vpMetrics.pointerInteractivity.step2Reached = isStep2;

      // Click Kembali to return to Step 1
      await page.click("button:has-text('Kembali')");
      await page.waitForTimeout(400);

      // Click Kembali again to return to Step 0
      await page.click("button:has-text('Kembali')");
      await page.waitForTimeout(400);

      const returnedToStep0 = await page.evaluate(() => {
        return !!document.querySelector("text=Mulai perjalanan!") || document.body.textContent.includes("Mulai perjalanan");
      });
      vpMetrics.pointerInteractivity.returnedToStep0 = returnedToStep0;

      // Check overflow summary
      if (vpMetrics.step0.hasHorizontalScrollbar) {
        vpMetrics.failures.push(`Step 0 has horizontal scrollbar: scrollWidth ${vpMetrics.step0.htmlScrollWidth}px > innerWidth ${vpMetrics.step0.innerWidth}px (+${vpMetrics.step0.horizontalOverflowPixels}px)`);
      }
      if (vpMetrics.step1_sma.hasHorizontalScrollbar) {
        vpMetrics.failures.push(`Step 1 SMA has horizontal scrollbar: scrollWidth ${vpMetrics.step1_sma.htmlScrollWidth}px > innerWidth ${vpMetrics.step1_sma.innerWidth}px (+${vpMetrics.step1_sma.horizontalOverflowPixels}px)`);
      }
      if (vpMetrics.step1_smp.hasHorizontalScrollbar) {
        vpMetrics.failures.push(`Step 1 SMP has horizontal scrollbar: scrollWidth ${vpMetrics.step1_smp.htmlScrollWidth}px > innerWidth ${vpMetrics.step1_smp.innerWidth}px (+${vpMetrics.step1_smp.horizontalOverflowPixels}px)`);
      }

    } catch (err) {
      console.error(`Error testing viewport ${vp.name}:`, err);
      vpMetrics.failures.push(`Unhandled execution error: ${err.message}`);
    } finally {
      vpMetrics.passedAllChecks = vpMetrics.failures.length === 0;
      if (!vpMetrics.passedAllChecks) {
        results.overallPass = false;
      }
      results.resultsByViewport[vp.name] = vpMetrics;
      await context.close();
    }
  }

  await browser.close();

  // Write metrics JSON
  const metricsPath = path.join(OUT_DIR, "stress_test_metrics.json");
  fs.writeFileSync(metricsPath, JSON.stringify(results, null, 2), "utf-8");
  console.log(`\n==================================================================`);
  console.log(`STRESS TEST COMPLETED. Overall Verdict: ${results.overallPass ? "ALL PASS ✅" : "FAILURES DETECTED ❌"}`);
  console.log(`Metrics written to: ${metricsPath}`);
  console.log(`==================================================================\n`);

  return results;
}

runStressTests().catch((err) => {
  console.error("FATAL ERROR in stress test runner:", err);
  process.exit(1);
});
