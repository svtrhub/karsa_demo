import { spawn } from "node:child_process";
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import assert from "node:assert";

const PORT = 3007;
const BASE_URL = `http://localhost:${PORT}`;

async function startServer() {
  console.log(`[TEST-SERVER] Spawning Next.js production server ('next start') on port ${PORT}...`);
  const serverProc = spawn(
    "C:\\Program Files\\nodejs\\node.exe",
    ["node_modules/next/dist/bin/next", "start", "-p", String(PORT)],
    {
      cwd: process.cwd(),
      env: { ...process.env, PATH: "C:\\Program Files\\nodejs;" + process.env.PATH },
    }
  );

  serverProc.stdout.on("data", (d) => {
    const s = d.toString();
    if (s.includes("Ready") || s.includes("Ready in") || s.includes("Started server")) {
      process.stdout.write(`[SERVER] ${s.trim()}\n`);
    }
  });

  serverProc.stderr.on("data", (d) => {
    const s = d.toString();
    if (!s.includes("ExperimentalWarning")) {
      process.stderr.write(`[SERVER STDERR] ${s}`);
    }
  });

  for (let attempt = 1; attempt <= 30; attempt++) {
    await new Promise((r) => setTimeout(r, 1000));
    try {
      const res = await fetch(BASE_URL);
      if (res.status === 200) {
        console.log(`[TEST-SERVER] Production server ready at ${BASE_URL} (attempt ${attempt})`);
        return serverProc;
      }
    } catch {}
  }
  serverProc.kill();
  throw new Error("Server failed to start within timeout");
}

async function runChallengerSuite() {
  let serverProc;
  let browser;

  const results = {
    test1_ssr_raw_html: null,
    test2_fresh_hydration: null,
    test3_completed_profile_hydration: null,
    test4_camera_viewport_invariants: null,
    test5_cls_across_viewports: {},
    test6_onboarding_completion_transition: null,
  };

  try {
    serverProc = await startServer();
    console.log("[PLAYWRIGHT] Launching Chromium browser...");
    browser = await chromium.launch({ headless: true });

    // =========================================================================
    // CHALLENGE 1: SSR Raw HTML Inspection (Before Client JS Execution)
    // =========================================================================
    console.log("\n========================================================");
    console.log("CHALLENGE 1: SSR Raw HTML Inspection");
    console.log("========================================================");
    const ssrResponse = await fetch(BASE_URL);
    const ssrHtml = await ssrResponse.text();

    const hasSplashOverlayInSSR = ssrHtml.includes('data-testid="app-splash-screen"');
    const hasLogoInSSR = ssrHtml.includes('data-testid="splash-logo"');
    const hasKarsaTextInSSR = ssrHtml.includes("KARSA");
    const hasExteriorImageInSSR = ssrHtml.includes("rumah_karsa_exterior.webp") || ssrHtml.includes("Rumah%20Karsa%20Exterior") || ssrHtml.includes("Rumah Karsa Exterior");
    const hasOnboardingInSSR = ssrHtml.includes("Mulai perjalanan!");
    const hasRoomInSSR = ssrHtml.includes("room-master");

    console.log(`[SSR] AppSplashScreen in SSR HTML: ${hasSplashOverlayInSSR}`);
    console.log(`[SSR] Splash Logo in SSR HTML: ${hasLogoInSSR}`);
    console.log(`[SSR] 'KARSA' text in SSR HTML: ${hasKarsaTextInSSR}`);
    console.log(`[SSR] Exterior image in SSR HTML: ${hasExteriorImageInSSR}`);
    console.log(`[SSR] OnboardingFlow in SSR HTML: ${hasOnboardingInSSR}`);
    console.log(`[SSR] RumahKarsaRoom in SSR HTML: ${hasRoomInSSR}`);

    results.test1_ssr_raw_html = {
      hasSplashOverlayInSSR,
      hasLogoInSSR,
      hasKarsaTextInSSR,
      hasExteriorImageInSSR,
      hasOnboardingInSSR,
      hasRoomInSSR,
    };

    assert(hasSplashOverlayInSSR, "SSR HTML must contain AppSplashScreen");
    assert(hasLogoInSSR, "SSR HTML must contain splash logo element");
    assert(hasKarsaTextInSSR, "SSR HTML must contain 'KARSA'");
    assert(hasOnboardingInSSR, "SSR HTML must contain pre-rendered OnboardingFlow");
    assert(!hasRoomInSSR, "SSR HTML must NOT contain RumahKarsaRoom on default state");

    // =========================================================================
    // CHALLENGE 2: Fresh Client Hydration & Console Verification (Clean State)
    // =========================================================================
    console.log("\n========================================================");
    console.log("CHALLENGE 2: Fresh Client Hydration (Clean LocalStorage)");
    console.log("========================================================");
    {
      const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      const page = await context.newPage();

      const consoleMessages = [];
      const pageErrors = [];
      page.on("console", (msg) => {
        consoleMessages.push({ type: msg.type(), text: msg.text() });
      });
      page.on("pageerror", (err) => {
        pageErrors.push(err.message);
      });

      await page.goto(BASE_URL, { waitUntil: "networkidle" });
      await page.evaluate(() => localStorage.clear());
      await page.reload({ waitUntil: "networkidle" });

      // Wait for splash screen to complete exit
      await page.waitForSelector('[data-testid="app-splash-screen"]', { state: "detached", timeout: 8000 });

      const hydrationErrors = consoleMessages.filter(
        (m) =>
          m.type === "error" &&
          (m.text.toLowerCase().includes("hydration") ||
            m.text.toLowerCase().includes("did not match") ||
            m.text.toLowerCase().includes("mismatch"))
      );

      console.log(`[HYDRATION-FRESH] Total console messages: ${consoleMessages.length}`);
      console.log(`[HYDRATION-FRESH] Total page errors: ${pageErrors.length}`);
      console.log(`[HYDRATION-FRESH] Hydration errors: ${hydrationErrors.length}`);

      results.test2_fresh_hydration = {
        consoleMessageCount: consoleMessages.length,
        pageErrors,
        hydrationErrors,
      };

      assert.strictEqual(hydrationErrors.length, 0, "Zero hydration errors on fresh state");
      assert.strictEqual(pageErrors.length, 0, "Zero unhandled page errors on fresh state");
      await context.close();
    }

    // =========================================================================
    // CHALLENGE 3: Returning User with Completed Onboarding in LocalStorage
    // Flash & Desync Stress Test
    // =========================================================================
    console.log("\n========================================================");
    console.log("CHALLENGE 3: Completed Profile LocalStorage Flash & Desync");
    console.log("========================================================");
    {
      const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      const page = await context.newPage();

      const consoleMessages = [];
      const pageErrors = [];
      page.on("console", (msg) => consoleMessages.push({ type: msg.type(), text: msg.text() }));
      page.on("pageerror", (err) => pageErrors.push(err.message));

      // Navigate and pre-seed completed state in localStorage
      await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
      await page.evaluate(() => {
        const completedState = {
          profile: {
            nama: "Budi Santoso",
            jenjangKelas: "SMA/SMK Kelas 11",
            keahlian: ["Sains & Riset (OSN / OPSI: Eksperimen & Penelitian)"],
            ritme: "30-45 Menit (Fokus)",
            target: "Menang OSN/OPSI",
            isCompleted: true,
          },
          onboardingStep: 4,
          ftuxCompleted: true,
          activePersona: null,
          chatThreads: {},
          celebratingPersona: null,
          activeComingSoon: null,
        };
        localStorage.setItem("karsa_demo_state_v1", JSON.stringify(completedState));
      });

      // Now install observer via addInitScript before reloading
      await page.addInitScript(() => {
        window.__onboardingFlashDetected = false;
        window.__onboardingVisibleWithoutSplash = false;
        window.__events = [];
        const start = performance.now();

        const observer = new MutationObserver(() => {
          const onboarding = document.querySelector('[role="progressbar"]') || 
            Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Mulai'));
          const splash = document.querySelector('[data-testid="app-splash-screen"]');
          const room = document.querySelector(".room-master");
          const t = Math.round(performance.now() - start);

          if (onboarding && !splash) {
            window.__onboardingVisibleWithoutSplash = true;
          }
          window.__events.push({
            t,
            hasSplash: !!splash,
            hasOnboarding: !!onboarding,
            hasRoom: !!room,
          });
        });

        observer.observe(document, { childList: true, subtree: true });
      });

      console.log("[STORAGE-TEST] Reloading with completed profile in localStorage...");
      await page.reload({ waitUntil: "networkidle" });

      // Wait for splash screen up-slide exit
      await page.waitForSelector('[data-testid="app-splash-screen"]', { state: "detached", timeout: 8000 });

      // Assert Room is visible
      const roomMaster = await page.waitForSelector(".room-master", { state: "visible", timeout: 5000 });
      assert(roomMaster, "RumahKarsaRoom must be visible after splash exit for returning user");

      // Verify Onboarding was NOT visibly flashed without splash overlay
      const timingReport = await page.evaluate(() => ({
        onboardingVisibleWithoutSplash: window.__onboardingVisibleWithoutSplash,
        eventCount: window.__events.length,
        firstRoomEvent: window.__events.find(e => e.hasRoom),
        anyOnboardingWithoutSplash: window.__events.some(e => e.hasOnboarding && !e.hasSplash),
      }));

      console.log("[STORAGE-TEST] Onboarding exposed without splash:", timingReport.anyOnboardingWithoutSplash);
      console.log(`[STORAGE-TEST] Total DOM mutation events captured: ${timingReport.eventCount}`);
      console.log(`[STORAGE-TEST] First room event:`, timingReport.firstRoomEvent);

      // Verify localStorage state was preserved and not overwritten
      const persistedState = await page.evaluate(() => {
        const s = localStorage.getItem("karsa_demo_state_v1");
        return s ? JSON.parse(s) : null;
      });

      console.log("[STORAGE-TEST] Persisted profile nama:", persistedState?.profile?.nama);
      console.log("[STORAGE-TEST] Persisted profile isCompleted:", persistedState?.profile?.isCompleted);

      assert.strictEqual(persistedState?.profile?.isCompleted, true, "isCompleted must remain true");
      assert.strictEqual(persistedState?.profile?.nama, "Budi Santoso", "User profile data must be preserved");
      assert.strictEqual(timingReport.anyOnboardingWithoutSplash, false, "Onboarding must NEVER be visibly exposed without splash overlay");

      const hydrationErrors = consoleMessages.filter(
        (m) =>
          m.type === "error" &&
          (m.text.toLowerCase().includes("hydration") ||
            m.text.toLowerCase().includes("did not match") ||
            m.text.toLowerCase().includes("mismatch"))
      );
      console.log(`[STORAGE-TEST] Hydration errors on returning user: ${hydrationErrors.length}`);
      assert.strictEqual(hydrationErrors.length, 0, "Zero hydration errors on returning user");

      results.test3_completed_profile_hydration = {
        timingReport,
        persistedStateValid: persistedState?.profile?.isCompleted === true,
        hydrationErrors,
      };

      await context.close();
    }

    // =========================================================================
    // CHALLENGE 4: Viewport & Camera Invariants during Splash Up-Slide Exit
    // =========================================================================
    console.log("\n========================================================");
    console.log("CHALLENGE 4: Camera Viewport Recalculation & Jump Invariants");
    console.log("========================================================");
    {
      const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      const page = await context.newPage();

      // Ensure profile is completed so RumahKarsaRoom is mounted behind splash
      await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
      await page.evaluate(() => {
        const completedState = {
          profile: {
            nama: "Budi Santoso",
            jenjangKelas: "SMA/SMK Kelas 11",
            keahlian: ["Sains & Riset (OSN / OPSI: Eksperimen & Penelitian)"],
            ritme: "30-45 Menit (Fokus)",
            target: "Menang OSN/OPSI",
            isCompleted: true,
          },
          onboardingStep: 4,
          ftuxCompleted: true,
          activePersona: null,
          chatThreads: {},
          celebratingPersona: null,
          activeComingSoon: null,
        };
        localStorage.setItem("karsa_demo_state_v1", JSON.stringify(completedState));
      });

      // Record continuous camera telemetry from page load through splash exit via addInitScript
      await page.addInitScript(() => {
        window.__cameraTelemetry = [];
        window.__startTime = performance.now();

        function sample() {
          const room = document.querySelector(".room-master");
          const splash = document.querySelector('[data-testid="app-splash-screen"]');
          const t = performance.now() - window.__startTime;

          let splashY = null;
          if (splash) {
            const rect = splash.getBoundingClientRect();
            splashY = rect.top;
          }

          let transform = null;
          if (room) {
            transform = room.style.transform;
          }

          window.__cameraTelemetry.push({
            t: Math.round(t),
            splashPresent: !!splash,
            splashY: splashY !== null ? Math.round(splashY) : null,
            transform,
          });

          if (t < 3500) {
            requestAnimationFrame(sample);
          }
        }
        requestAnimationFrame(sample);
      });

      await page.reload({ waitUntil: "networkidle" });
      await page.waitForTimeout(3500);

      const telemetry = await page.evaluate(() => window.__cameraTelemetry);

      console.log(`[CAMERA-TELEMETRY] Collected ${telemetry.length} telemetry frames over 3.5s`);

      // Analyze telemetry:
      // Find when splash starts moving up (splashY < 0)
      const splashExitStart = telemetry.find((f) => f.splashPresent && f.splashY !== null && f.splashY < -5);
      const splashDetached = telemetry.find((f) => !f.splashPresent);

      console.log(
        `[CAMERA-TELEMETRY] Splash exit animation started at t ~ ${splashExitStart ? splashExitStart.t : "unknown"}ms`
      );
      console.log(
        `[CAMERA-TELEMETRY] Splash detached from DOM at t ~ ${splashDetached ? splashDetached.t : "unknown"}ms`
      );

      // Check transform stability after t = 800ms (after initial 700ms mount transition settles)
      const samplesAfter800ms = telemetry.filter((f) => f.t >= 800 && f.transform);
      const uniqueTransformsAfter800ms = [...new Set(samplesAfter800ms.map((f) => f.transform))];

      console.log(`[CAMERA-TELEMETRY] Unique room transforms after t >= 800ms:`, uniqueTransformsAfter800ms);

      // Check if transform changed at all during or after splash exit
      const exitStartTime = splashExitStart ? splashExitStart.t : 1200;
      const samplesDuringAndAfterExit = telemetry.filter(
        (f) => f.t >= exitStartTime && f.transform
      );
      const uniqueExitTransforms = [...new Set(samplesDuringAndAfterExit.map((f) => f.transform))];

      console.log(
        `[CAMERA-TELEMETRY] Unique room transforms DURING and AFTER splash exit:`,
        uniqueExitTransforms
      );

      results.test4_camera_viewport_invariants = {
        splashExitStartMs: splashExitStart?.t,
        splashDetachedMs: splashDetached?.t,
        uniqueTransformsAfter800ms,
        uniqueExitTransforms,
        hasJumpDuringExit: uniqueExitTransforms.length > 1,
      };

      assert(uniqueExitTransforms.length > 0, "Must record at least one transform during/after exit");
      assert.strictEqual(
        uniqueExitTransforms.length,
        1,
        `Camera transform must remain completely rock-solid during and after splash exit! Observed: ${JSON.stringify(
          uniqueExitTransforms
        )}`
      );
      console.log("✅ PASS: Zero camera recalculation or dimension jump observed during splash exit.");

      await context.close();
    }

    // =========================================================================
    // CHALLENGE 5: Cumulative Layout Shift (CLS) Across Viewports
    // =========================================================================
    console.log("\n========================================================");
    console.log("CHALLENGE 5: Cumulative Layout Shift (CLS) Across Viewports");
    console.log("========================================================");
    const viewports = [
      { name: "Desktop 1920x1080", width: 1920, height: 1080 },
      { name: "Laptop 1440x900", width: 1440, height: 900 },
      { name: "Tablet 768x1024", width: 768, height: 1024 },
      { name: "Mobile 390x844", width: 390, height: 844 },
    ];

    for (const vp of viewports) {
      const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
      const page = await context.newPage();

      // Clear localStorage
      await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
      await page.evaluate(() => localStorage.clear());

      await page.addInitScript(() => {
        window.__cls = 0;
        window.__clsEntries = [];
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              window.__cls += entry.value;
              window.__clsEntries.push({
                value: entry.value,
                sources: entry.sources?.map((s) => s.node?.nodeName || "unknown"),
              });
            }
          }
        }).observe({ type: "layout-shift", buffered: true });
      });

      await page.reload({ waitUntil: "networkidle" });
      await page.waitForSelector('[data-testid="app-splash-screen"]', { state: "detached", timeout: 8000 });
      await page.waitForTimeout(600);

      const clsData = await page.evaluate(() => ({
        cls: window.__cls || 0,
        entries: window.__clsEntries || [],
      }));

      console.log(`[CLS-TEST] Viewport ${vp.name}: CLS = ${clsData.cls} (entries: ${clsData.entries.length})`);
      results.test5_cls_across_viewports[vp.name] = clsData;

      assert(clsData.cls < 0.05, `CLS for ${vp.name} must be < 0.05, observed: ${clsData.cls}`);
      await context.close();
    }

    // =========================================================================
    // CHALLENGE 6: Initial Mount Dimension Drift in useCameraViewport
    // (Stress-test 1200x800 initial state vs actual viewport)
    // =========================================================================
    console.log("\n========================================================");
    console.log("CHALLENGE 6: Initial Mount Dimension Drift Analysis");
    console.log("========================================================");
    {
      const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
      const page = await context.newPage();

      await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
      await page.evaluate(() => {
        const completedState = {
          profile: {
            nama: "Budi Santoso",
            jenjangKelas: "SMA/SMK Kelas 11",
            keahlian: ["Sains & Riset (OSN / OPSI: Eksperimen & Penelitian)"],
            ritme: "30-45 Menit (Fokus)",
            target: "Menang OSN/OPSI",
            isCompleted: true,
          },
          onboardingStep: 4,
          ftuxCompleted: true,
          activePersona: null,
          chatThreads: {},
          celebratingPersona: null,
          activeComingSoon: null,
        };
        localStorage.setItem("karsa_demo_state_v1", JSON.stringify(completedState));
      });

      // Track transforms from frame 0 via addInitScript
      await page.addInitScript(() => {
        window.__frameTransforms = [];
        const start = performance.now();
        function check() {
          const room = document.querySelector(".room-master");
          if (room && room.style.transform) {
            window.__frameTransforms.push({
              time: Math.round(performance.now() - start),
              transform: room.style.transform,
            });
          }
          if (performance.now() - start < 2000) {
            requestAnimationFrame(check);
          }
        }
        requestAnimationFrame(check);
      });

      await page.reload({ waitUntil: "networkidle" });
      await page.waitForTimeout(2200);

      const frameTransforms = await page.evaluate(() => window.__frameTransforms);
      console.log(`[DRIFT-TEST] Recorded ${frameTransforms.length} frames of room transform`);
      if (frameTransforms.length > 0) {
        console.log(`[DRIFT-TEST] Frame 0 transform: ${frameTransforms[0]?.transform} at ${frameTransforms[0]?.time}ms`);
        const finalTransform = frameTransforms[frameTransforms.length - 1]?.transform;
        console.log(`[DRIFT-TEST] Settled transform: ${finalTransform}`);

        const distinctTransforms = [...new Set(frameTransforms.map((f) => f.transform))];
        console.log(`[DRIFT-TEST] Total distinct transforms recorded during initial mount: ${distinctTransforms.length}`);

        // Check if all changes settled before splash screen begins to dismiss (t = 1200ms)
        const transformsAfter1200 = frameTransforms.filter(f => f.time >= 1200);
        const uniqueAfter1200 = [...new Set(transformsAfter1200.map(f => f.transform))];
        console.log(`[DRIFT-TEST] Unique transforms after t >= 1200ms (splash dismiss threshold):`, uniqueAfter1200);

        results.test6_onboarding_completion_transition = {
          frame0Transform: frameTransforms[0]?.transform,
          settledTransform: finalTransform,
          distinctTransformCount: distinctTransforms.length,
          uniqueAfter1200Count: uniqueAfter1200.length,
          settledBeforeDismiss: uniqueAfter1200.length === 1,
        };

        assert.strictEqual(
          uniqueAfter1200.length,
          1,
          "Room transform must be 100% settled and identical before splash screen dismisses at 1200ms"
        );
      }

      await context.close();
    }

    console.log("\n========================================================");
    console.log("ALL EMPIRICAL CHALLENGER TESTS COMPLETED SUCCESSFULLY!");
    console.log("========================================================");

    fs.writeFileSync("tests/challenger_results.json", JSON.stringify(results, null, 2));
    console.log("Results saved to tests/challenger_results.json");
    return results;
  } finally {
    if (browser) await browser.close();
    if (serverProc) {
      console.log("[TEST-SERVER] Terminating test server process...");
      serverProc.kill();
    }
  }
}

runChallengerSuite().catch((err) => {
  console.error("Challenger suite failed:", err);
  process.exit(1);
});
