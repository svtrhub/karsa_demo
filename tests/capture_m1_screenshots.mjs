import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

async function run() {
  console.log("Launching Chromium via Playwright...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  console.log("Navigating to http://localhost:3000 ...");
  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });

  // Reset localStorage to ensure fresh onboarding state
  await page.evaluate(() => {
    localStorage.clear();
  });
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  const outDir = path.resolve("audit_screenshots");
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // Step 0: Welcome Gate with spotlight beam
  console.log("Capturing Step 0 (Theatrical Spotlight & Single Logo)...");
  await page.screenshot({ path: path.join(outDir, "m1_step0_spotlight.png") });

  // Click Mulai perjalanan!
  console.log("Clicking 'Mulai perjalanan!' button...");
  await page.click("text=Mulai perjalanan!");
  await page.waitForTimeout(500);

  // Submit default name
  console.log("Submitting name to advance to Step 1...");
  await page.click("text=Mulai Perjalanan");
  await page.waitForTimeout(800);

  // Step 1: Default SMA/SMK tier active
  console.log("Capturing Step 1 with SMA/SMK tier active...");
  await page.screenshot({ path: path.join(outDir, "m1_step1_sma.png") });

  // Click SMP tab
  console.log("Switching to SMP tab...");
  await page.click("#tab-smp");
  await page.waitForTimeout(800);

  // Step 1: SMP tier active
  console.log("Capturing Step 1 with SMP tier active...");
  await page.screenshot({ path: path.join(outDir, "m1_step1_smp.png") });

  // Select Kelas 8
  console.log("Selecting Kelas 8 in SMP tier...");
  await page.click("text=Kelas 8");
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(outDir, "m1_step1_smp_kelas8.png") });

  // Switch back to SMA/SMK tab to verify category memory
  console.log("Switching back to SMA tab to test category memory...");
  await page.click("#tab-sma");
  await page.waitForTimeout(500);

  // Switch back to SMP tab to verify Kelas 8 is still remembered
  console.log("Switching back to SMP tab to verify Kelas 8 retained...");
  await page.click("#tab-smp");
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(outDir, "m1_step1_smp_memory_verified.png") });

  await browser.close();
  console.log("All screenshots captured successfully in audit_screenshots/!");
}

run().catch((err) => {
  console.error("Error running visual verification:", err);
  process.exit(1);
});
