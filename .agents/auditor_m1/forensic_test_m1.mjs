import { chromium } from "playwright";
import assert from "node:assert";

async function runForensicAudit() {
  console.log("==================================================");
  console.log("STARTING FORENSIC DOM & STATE VERIFICATION FOR M1");
  console.log("==================================================");

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  const auditLog = [];
  function logCheck(name, pass, detail) {
    auditLog.push({ name, pass, detail });
    console.log(`${pass ? "✅ PASS" : "❌ FAIL"}: [${name}] - ${detail}`);
  }

  try {
    // 1. Navigate and clean state
    await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForTimeout(1000);

    // ==========================================
    // CHECK 1: Top-Left Redundant Logo Removal
    // ==========================================
    console.log("\n--- CHECK 1: Logo Forensic Inspection ---");
    const karsaTextElements = await page.$$eval('*', (els) => {
      const results = [];
      for (const el of els) {
        if (el.children.length === 0 && el.textContent && el.textContent.trim().toUpperCase() === 'KARSA') {
          const rect = el.getBoundingClientRect();
          const computed = window.getComputedStyle(el);
          results.push({
            tagName: el.tagName,
            className: el.className,
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height,
            display: computed.display,
            visibility: computed.visibility,
            opacity: computed.opacity,
          });
        }
      }
      return results;
    });

    logCheck(
      "Logo Count on Step 0",
      karsaTextElements.length === 1,
      `Found ${karsaTextElements.length} standalone 'KARSA' text element(s) on Step 0. Details: ${JSON.stringify(karsaTextElements)}`
    );

    // Verify the single KARSA logo is centered in the card
    if (karsaTextElements.length === 1) {
      const logo = karsaTextElements[0];
      const isCenteredX = logo.x > 500 && logo.x < 900;
      logCheck(
        "Single Logo Centered Placement",
        isCenteredX,
        `Logo x-coord: ${logo.x}px (expected centered within 500-900px on 1440px viewport)`
      );
    }

    // Check if there is any hidden or offscreen logo element in top-left
    const topLeftElements = await page.evaluate(() => {
      const els = document.querySelectorAll('*');
      const suspicious = [];
      for (const el of els) {
        const cls = el.className || '';
        if (typeof cls === 'string' && (cls.includes('top-6') && cls.includes('left-6'))) {
          suspicious.push({ tag: el.tagName, className: cls, html: el.outerHTML });
        }
      }
      return suspicious;
    });

    logCheck(
      "Absence of CSS-hidden Top-Left Element",
      topLeftElements.length === 0,
      `Found ${topLeftElements.length} elements with top-6/left-6 classes in DOM`
    );

    // ==========================================
    // CHECK 2: Theatrical Spotlight Reveal CSS
    // ==========================================
    console.log("\n--- CHECK 2: Spotlight Reveal Empirical Inspection ---");
    const spotlightInfo = await page.evaluate(() => {
      // Find elements with clip-path or god-ray gradients
      const allEls = Array.from(document.querySelectorAll('div'));
      const shafts = allEls.filter((el) => {
        const style = window.getComputedStyle(el);
        const inlineStyle = el.getAttribute('style') || '';
        return (
          inlineStyle.includes('polygon') ||
          style.clipPath.includes('polygon') ||
          style.mixBlendMode === 'screen'
        );
      });

      return shafts.map((el) => {
        const style = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        return {
          inlineStyle: el.getAttribute('style'),
          clipPath: style.clipPath,
          mixBlendMode: style.mixBlendMode,
          filter: style.filter,
          pointerEvents: style.pointerEvents,
          zIndex: style.zIndex,
          rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
          className: el.className,
        };
      });
    });

    logCheck(
      "Spotlight Elements Found in DOM",
      spotlightInfo.length >= 2,
      `Detected ${spotlightInfo.length} genuine CSS shaft/halo elements with clip-path/mix-blend-screen`
    );

    const coreShaft = spotlightInfo.find(
      (s) => s.inlineStyle && s.inlineStyle.includes('polygon(100% 0%, 72% 0%, 15% 100%, 72% 100%)')
    );
    logCheck(
      "Core Theatrical God-Ray Shaft Integrity",
      Boolean(coreShaft && (coreShaft.mixBlendMode === 'screen' || coreShaft.className.includes('mix-blend-screen'))),
      `Core shaft properties: ${JSON.stringify(coreShaft)}`
    );

    const softShaft = spotlightInfo.find(
      (s) => s.inlineStyle && s.inlineStyle.includes('polygon(100% 0%, 55% 0%, 0% 100%, 85% 100%)')
    );
    logCheck(
      "Secondary Soft Wash Beam Integrity",
      Boolean(softShaft && (softShaft.mixBlendMode === 'screen' || softShaft.className.includes('mix-blend-screen'))),
      `Soft shaft properties: ${JSON.stringify(softShaft)}`
    );

    const halo = spotlightInfo.find(
      (s) => s.inlineStyle && s.inlineStyle.includes('radial-gradient')
    );
    logCheck(
      "Modal Stage Bounce Halo Integrity",
      Boolean(halo && (halo.mixBlendMode === 'screen' || halo.className.includes('mix-blend-screen'))),
      `Halo properties: ${JSON.stringify(halo)}`
    );

    // Verify pointer-events none
    const allPointerNone = spotlightInfo.every((s) => s.pointerEvents === 'none' || s.className.includes('pointer-events-none'));
    logCheck(
      "Spotlight Non-blocking (pointer-events: none)",
      allPointerNone,
      "All spotlight layers pass mouse and touch events through"
    );

    // ==========================================
    // CHECK 3: 2-Tier Segmented Class Selector & React State
    // ==========================================
    console.log("\n--- CHECK 3: 2-Tier Segmented Class Selector Empirical Test ---");
    // Advance to Step 1
    await page.click("text=Mulai perjalanan!");
    await page.waitForTimeout(300);
    await page.click("text=Mulai Perjalanan");
    await page.waitForTimeout(800);

    // Verify Step 1 is rendered
    const step1Title = await page.textContent("h2");
    logCheck(
      "Step 1 Navigation",
      step1Title.includes("kelas berapa"),
      `Step 1 heading: "${step1Title}"`
    );

    // Check Tablist and Tabs
    const tablistExists = await page.isVisible('[role="tablist"]');
    const tabSmp = await page.$('#tab-smp');
    const tabSma = await page.$('#tab-sma');
    logCheck(
      "Tier 1 ARIA Tablist & Tabs Existence",
      tablistExists && Boolean(tabSmp) && Boolean(tabSma),
      `role="tablist" present: ${tablistExists}, #tab-smp found: ${Boolean(tabSmp)}, #tab-sma found: ${Boolean(tabSma)}`
    );

    // Check default active tab
    const isSmaDefaultActive = await page.getAttribute('#tab-sma', 'aria-selected');
    const isSmpDefaultActive = await page.getAttribute('#tab-smp', 'aria-selected');
    logCheck(
      "Default Category Tab is SMA",
      isSmaDefaultActive === 'true' && isSmpDefaultActive === 'false',
      `tab-sma aria-selected: ${isSmaDefaultActive}, tab-smp aria-selected: ${isSmpDefaultActive}`
    );

    // Check default Tier 2 rendered sub-classes (should be Kelas 10, 11, 12)
    const initialRadios = await page.$$eval('[role="radio"]', (radios) =>
      radios.map((r) => r.textContent.replace(/\s+/g, ' ').trim())
    );
    logCheck(
      "Default Tier 2 Sub-Classes (SMA/SMK)",
      initialRadios.some((t) => t.includes("Kelas 10")) &&
        initialRadios.some((t) => t.includes("Kelas 11")) &&
        initialRadios.some((t) => t.includes("Kelas 12")) &&
        !initialRadios.some((t) => t.includes("Kelas 7")),
      `Rendered radios: ${JSON.stringify(initialRadios)}`
    );

    // Check state in localStorage before clicking SMP
    let storedState = await page.evaluate(() => JSON.parse(localStorage.getItem('karsa_demo_state_v1') || '{}'));
    logCheck(
      "Initial DemoContext State in localStorage",
      storedState?.profile?.jenjangKelas === "SMA/SMK Kelas 10",
      `localStorage profile.jenjangKelas: "${storedState?.profile?.jenjangKelas}"`
    );

    // CLICK #tab-smp
    console.log("Clicking #tab-smp...");
    await page.click('#tab-smp');
    await page.waitForTimeout(500);

    // Check tab aria-selected updated
    const isSmpNowActive = await page.getAttribute('#tab-smp', 'aria-selected');
    logCheck(
      "Tab Switch to SMP Updates aria-selected",
      isSmpNowActive === 'true',
      `tab-smp aria-selected after click: ${isSmpNowActive}`
    );

    // Check Tier 2 dynamically re-rendered to SMP classes
    const smpRadios = await page.$$eval('[role="radio"]', (radios) =>
      radios.map((r) => r.textContent.replace(/\s+/g, ' ').trim())
    );
    logCheck(
      "Tier 2 Dynamically Updates to SMP Sub-Classes",
      smpRadios.some((t) => t.includes("Kelas 7")) &&
        smpRadios.some((t) => t.includes("Kelas 8")) &&
        smpRadios.some((t) => t.includes("Kelas 9")) &&
        !smpRadios.some((t) => t.includes("Kelas 10")),
      `Rendered radios after SMP switch: ${JSON.stringify(smpRadios)}`
    );

    // Check state in localStorage after clicking SMP
    storedState = await page.evaluate(() => JSON.parse(localStorage.getItem('karsa_demo_state_v1') || '{}'));
    logCheck(
      "DemoContext Updated to SMP Default on Tab Switch",
      storedState?.profile?.jenjangKelas === "SMP Kelas 7",
      `localStorage profile.jenjangKelas: "${storedState?.profile?.jenjangKelas}"`
    );

    // CLICK "Kelas 8"
    console.log("Selecting Kelas 8...");
    await page.click('button[role="radio"]:has-text("Kelas 8")');
    await page.waitForTimeout(300);

    storedState = await page.evaluate(() => JSON.parse(localStorage.getItem('karsa_demo_state_v1') || '{}'));
    logCheck(
      "DemoContext Updated to SMP Kelas 8",
      storedState?.profile?.jenjangKelas === "SMP Kelas 8",
      `localStorage profile.jenjangKelas: "${storedState?.profile?.jenjangKelas}"`
    );

    // CHECK CATEGORY MEMORY PATTERN:
    // Switch to SMA tab
    console.log("Testing Category Memory: Switching to SMA tab...");
    await page.click('#tab-sma');
    await page.waitForTimeout(500);

    storedState = await page.evaluate(() => JSON.parse(localStorage.getItem('karsa_demo_state_v1') || '{}'));
    logCheck(
      "DemoContext Updated to SMA Memory on Switch",
      storedState?.profile?.jenjangKelas === "SMA/SMK Kelas 10",
      `localStorage profile.jenjangKelas: "${storedState?.profile?.jenjangKelas}"`
    );

    // Switch back to SMP tab
    console.log("Switching back to SMP tab to verify Kelas 8 remembered...");
    await page.click('#tab-smp');
    await page.waitForTimeout(500);

    storedState = await page.evaluate(() => JSON.parse(localStorage.getItem('karsa_demo_state_v1') || '{}'));
    logCheck(
      "Category Memory: Restores SMP Kelas 8",
      storedState?.profile?.jenjangKelas === "SMP Kelas 8",
      `localStorage profile.jenjangKelas: "${storedState?.profile?.jenjangKelas}"`
    );

    const kelas8RadioChecked = await page.getAttribute(
      'button[role="radio"]:has-text("Kelas 8")',
      'aria-checked'
    );
    logCheck(
      "Category Memory: Kelas 8 has aria-checked='true'",
      kelas8RadioChecked === 'true',
      `Kelas 8 radio aria-checked: ${kelas8RadioChecked}`
    );

    // ==========================================
    // CHECK 4: Propagation Through to Step 4 Summary
    // ==========================================
    console.log("\n--- CHECK 4: Step 4 Summary Propagation ---");
    // Click Lanjut from Step 1 to Step 2
    await page.click('button:has-text("Lanjut")');
    await page.waitForTimeout(400);

    // Step 2 to Step 3
    await page.click('button:has-text("Lanjut")');
    await page.waitForTimeout(400);

    // Step 3 to Step 4
    await page.click('button:has-text("Ringkasan")');
    await page.waitForTimeout(600);

    // Check Step 4 summary card text
    const summaryJenjangText = await page.evaluate(() => {
      const labels = Array.from(document.querySelectorAll('span'));
      const jenjangLabel = labels.find((l) => l.textContent?.includes("Jenjang & Kelas:"));
      if (!jenjangLabel) return null;
      const valueSpan = jenjangLabel.nextElementSibling;
      return valueSpan ? valueSpan.textContent?.trim() : null;
    });

    logCheck(
      "Step 4 Summary Displays Selected 'SMP Kelas 8'",
      summaryJenjangText === "SMP Kelas 8",
      `Step 4 summary Jenjang & Kelas text: "${summaryJenjangText}"`
    );

    // Complete Onboarding
    await page.click('input[type="checkbox"]');
    await page.waitForTimeout(200);
    await page.click('button:has-text("Masuk ke Rumah Karsa")');
    await page.waitForTimeout(1000);

    storedState = await page.evaluate(() => JSON.parse(localStorage.getItem('karsa_demo_state_v1') || '{}'));
    logCheck(
      "Onboarding Completion State Persisted to DemoContext",
      storedState?.profile?.isCompleted === true && storedState?.profile?.jenjangKelas === "SMP Kelas 8",
      `Final profile state: isCompleted=${storedState?.profile?.isCompleted}, jenjangKelas="${storedState?.profile?.jenjangKelas}"`
    );

    console.log("\n==================================================");
    const failedChecks = auditLog.filter((c) => !c.pass);
    console.log(`TOTAL CHECKS: ${auditLog.length}`);
    console.log(`PASSED: ${auditLog.length - failedChecks.length}`);
    console.log(`FAILED: ${failedChecks.length}`);
    console.log("==================================================");

    await browser.close();

    return {
      total: auditLog.length,
      passed: auditLog.length - failedChecks.length,
      failed: failedChecks.length,
      checks: auditLog,
    };
  } catch (err) {
    console.error("Forensic audit error:", err);
    await browser.close();
    throw err;
  }
}

runForensicAudit()
  .then((res) => {
    if (res.failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  })
  .catch((e) => {
    console.error("Fatal:", e);
    process.exit(1);
  });
