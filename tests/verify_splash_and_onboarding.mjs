import { spawn } from "node:child_process";
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import assert from "node:assert";

const PORT = 3006;
const BASE_URL = `http://localhost:${PORT}`;

const OUT_DIR = path.resolve("audit_screenshots");
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function startServer() {
  console.log(`[TEST-SERVER] Spawning Next.js dev server on port ${PORT}...`);
  const serverProc = spawn(
    "C:\\Program Files\\nodejs\\node.exe",
    ["node_modules/next/dist/bin/next", "dev", "-p", String(PORT)],
    {
      cwd: process.cwd(),
      env: { ...process.env, PATH: "C:\\Program Files\\nodejs;" + process.env.PATH },
    }
  );

  serverProc.stdout.on("data", (d) => {
    const s = d.toString();
    if (s.includes("Ready in") || s.includes("Compiled")) {
      process.stdout.write(`[SERVER] ${s.trim()}\n`);
    }
  });

  serverProc.stderr.on("data", (d) => {
    const s = d.toString();
    if (!s.includes("ExperimentalWarning")) {
      process.stderr.write(`[SERVER STDERR] ${s}`);
    }
  });

  for (let attempt = 1; attempt <= 35; attempt++) {
    await new Promise((r) => setTimeout(r, 1000));
    try {
      const res = await fetch(BASE_URL);
      if (res.status === 200) {
        console.log(`[TEST-SERVER] Dev server ready at ${BASE_URL} (attempt ${attempt})`);
        return serverProc;
      }
    } catch {}
  }
  serverProc.kill();
  throw new Error("Dev server failed to start within timeout");
}

async function run() {
  let serverProc;
  let browser;

  try {
    serverProc = await startServer();

    console.log("[PLAYWRIGHT] Launching Chromium browser...");
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();

    const consoleErrors = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    // ── PHASE 1: Capture Splash Loading Screen ──────────────────────────────
    console.log("\n[PHASE 1] Navigating to ?splash=hold to capture splash loading screen...");
    await page.goto(`${BASE_URL}?splash=hold`, { waitUntil: "networkidle" });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: "networkidle" });

    // Assert Splash Screen is visible
    const splashEl = await page.waitForSelector('[data-testid="app-splash-screen"]', {
      state: "visible",
      timeout: 6000,
    });
    assert(splashEl, "Splash screen overlay [data-testid='app-splash-screen'] must be visible");

    // Assert Brand Logo KARSA is present
    const logoEl = await page.waitForSelector('[data-testid="splash-logo"]', { state: "visible" });
    const logoText = (await logoEl.innerText()).trim();
    console.log(`[VERIFY] Brand logo text found: "${logoText}"`);
    assert.strictEqual(logoText, "KARSA", 'Brand logo text must be "KARSA"');

    // Wait for image decode paint
    await page.waitForTimeout(600);

    const splashImgPath = path.join(OUT_DIR, "splash_loading_screen.png");
    const rootSplashImgPath = path.resolve("splash_loading_screen.png");
    await page.screenshot({ path: splashImgPath });
    fs.copyFileSync(splashImgPath, rootSplashImgPath);
    console.log(`✅ [1/2] Saved splash screenshot to:\n  - ${splashImgPath}\n  - ${rootSplashImgPath}`);

    // ── PHASE 2: Test Slide-Up Exit Transition, CLS, & Darkened Onboarding Background ──
    console.log("\n[PHASE 2] Testing up-slide exit transition & darkened onboarding background...");
    
    // Track Cumulative Layout Shift (CLS)
    await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
    await page.evaluate(() => {
      window.__cls = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) window.__cls += entry.value;
        }
      }).observe({ type: "layout-shift", buffered: true });
    });

    // Wait for splash screen up-slide exit animation to finish and unmount
    console.log("Waiting for splash screen exit animation to complete and detach...");
    await page.waitForSelector('[data-testid="app-splash-screen"]', {
      state: "detached",
      timeout: 8000,
    });
    console.log("✅ Splash screen successfully completed up-slide exit and detached from DOM.");

    const clsValue = await page.evaluate(() => window.__cls || 0);
    console.log(`[PERF] Cumulative Layout Shift (CLS) during transition: ${clsValue}`);
    assert(clsValue < 0.05, `CLS must be negligible (<0.05), observed: ${clsValue}`);

    // Verify Onboarding Screen is revealed and active
    const onboardingWelcome = await page.waitForSelector("text=Mulai perjalanan!", {
      state: "visible",
      timeout: 6000,
    });
    assert(onboardingWelcome, "OnboardingFlow welcome gate button must be visible after splash exit");

    // Wait 600ms for background render and spotlight animation stabilization
    await page.waitForTimeout(600);

    const onboardingImgPath = path.join(OUT_DIR, "onboarding_darkened_bg.png");
    const rootOnboardingImgPath = path.resolve("onboarding_darkened_bg.png");
    await page.screenshot({ path: onboardingImgPath });
    fs.copyFileSync(onboardingImgPath, rootOnboardingImgPath);
    console.log(`✅ [2/2] Saved onboarding screenshot to:\n  - ${onboardingImgPath}\n  - ${rootOnboardingImgPath}`);

    // Check for hydration errors in console
    const hydrationErrors = consoleErrors.filter(
      (e) => e.toLowerCase().includes("hydration") || e.toLowerCase().includes("did not match")
    );
    assert.strictEqual(
      hydrationErrors.length,
      0,
      `Hydration errors detected in console: ${JSON.stringify(hydrationErrors)}`
    );
    console.log("✅ Zero hydration errors detected in browser console.");

    console.log("\n========================================================");
    console.log("All Splash & Onboarding Visual Checks PASSED with 100%!");
    console.log("========================================================");
  } finally {
    if (browser) await browser.close();
    if (serverProc) {
      console.log("[TEST-SERVER] Terminating test server process...");
      serverProc.kill();
    }
  }
}

run().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
