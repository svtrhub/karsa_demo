import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runCompleteForensicAudit() {
  console.log("===============================================================");
  console.log("RUNNING COMPLETE EMPIRICAL FORENSIC AUDIT (PORT 3000)");
  console.log("===============================================================");

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  const auditResults = [];
  function record(name, passed, details) {
    auditResults.push({ name, passed, details });
    console.log(`${passed ? "✅ PASS" : "❌ FAIL"}: [${name}] - ${details}`);
  }

  try {
    // 1. Reset state
    await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded" });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: "domcontentloaded" });
    await wait(1000);

    // =========================================================================
    // CHECK 1: Top-Left Logo Complete Removal
    // =========================================================================
    console.log("\n--- AUDIT ITEM 1: Redundant Top-Left Logo Removal ---");
    const karsaTextElements = await page.$$eval('*', (els) => {
      const matches = [];
      for (const el of els) {
        if (el.children.length === 0 && el.textContent && el.textContent.trim().toUpperCase() === 'KARSA') {
          const rect = el.getBoundingClientRect();
          const comp = window.getComputedStyle(el);
          matches.push({
            tagName: el.tagName,
            className: el.className,
            x: rect.x,
            y: rect.y,
            w: rect.width,
            h: rect.height,
            display: comp.display,
            visibility: comp.visibility,
            opacity: comp.opacity,
          });
        }
      }
      return matches;
    });

    record(
      "Single Centered KARSA Logo on Step 0",
      karsaTextElements.length === 1,
      `Detected ${karsaTextElements.length} KARSA wordmark elements in DOM (Expected 1). Position: x=${karsaTextElements[0]?.x}, y=${karsaTextElements[0]?.y}`
    );

    const isCentered = karsaTextElements[0] && karsaTextElements[0].x > 500 && karsaTextElements[0].x < 900;
    record(
      "Logo is Centered inside Modal Card",
      Boolean(isCentered),
      `Logo x-coord: ${karsaTextElements[0]?.x}px (centered in 1440px viewport)`
    );

    const topLeftHacks = await page.evaluate(() => {
      const els = Array.from(document.querySelectorAll('*'));
      return els.filter((el) => {
        const cls = typeof el.className === 'string' ? el.className : '';
        return (cls.includes('top-6') && cls.includes('left-6')) ||
               (cls.includes('invisible') && el.textContent?.includes('KARSA')) ||
               (cls.includes('opacity-0') && el.textContent?.includes('KARSA'));
      }).map(el => el.outerHTML);
    });

    record(
      "Absence of CSS-hidden / orphaned Top-Left Logo",
      topLeftHacks.length === 0,
      `Found ${topLeftHacks.length} hidden or absolute top-6 left-6 elements`
    );

    // =========================================================================
    // CHECK 2: Spotlight Reveal Beam Genuine CSS Layers
    // =========================================================================
    console.log("\n--- AUDIT ITEM 2: Spotlight Reveal Beam CSS Layers ---");
    const spotlightLayers = await page.evaluate(() => {
      const divs = Array.from(document.querySelectorAll('div'));
      const relevant = divs.filter((d) => {
        const s = window.getComputedStyle(d);
        const inline = d.getAttribute('style') || '';
        return (
          inline.includes('polygon') ||
          s.clipPath.includes('polygon') ||
          inline.includes('radial-gradient') ||
          d.className.includes('animate-pulse-glow')
        );
      });

      return relevant.map((el) => {
        const s = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        return {
          inlineStyle: el.getAttribute('style') || '',
          className: el.className,
          clipPath: s.clipPath,
          mixBlendMode: s.mixBlendMode,
          filter: s.filter,
          pointerEvents: s.pointerEvents,
          zIndex: s.zIndex,
          rect: { x: rect.x, y: rect.y, w: rect.width, h: rect.height },
        };
      });
    });

    record(
      "Spotlight Beam Layers Rendered in DOM",
      spotlightLayers.length >= 3,
      `Found ${spotlightLayers.length} distinct optical layers in DOM`
    );

    const godRayShaft = spotlightLayers.find((l) =>
      l.inlineStyle.includes('polygon(100% 0%, 72% 0%, 15% 100%, 72% 100%)')
    );
    record(
      "God-Ray Core Shaft Polygon & mix-blend-screen",
      Boolean(godRayShaft && (godRayShaft.mixBlendMode === 'screen' || godRayShaft.className.includes('mix-blend-screen'))),
      `Shaft filter: ${godRayShaft?.filter}, mixBlendMode: ${godRayShaft?.mixBlendMode}`
    );

    const softWash = spotlightLayers.find((l) =>
      l.inlineStyle.includes('polygon(100% 0%, 55% 0%, 0% 100%, 85% 100%)')
    );
    record(
      "Secondary Soft Wash Beam Polygon & mix-blend-screen",
      Boolean(softWash && (softWash.mixBlendMode === 'screen' || softWash.className.includes('mix-blend-screen'))),
      `Soft wash filter: ${softWash?.filter}, mixBlendMode: ${softWash?.mixBlendMode}`
    );

    const stageHalo = spotlightLayers.find((l) =>
      l.inlineStyle.includes('radial-gradient') || l.className.includes('w-[700px]')
    );
    record(
      "Modal Stage Bounce Halo Radial Gradient",
      Boolean(stageHalo && (stageHalo.mixBlendMode === 'screen' || stageHalo.className.includes('mix-blend-screen'))),
      `Stage halo filter: ${stageHalo?.filter}, mixBlendMode: ${stageHalo?.mixBlendMode}`
    );

    const apexEmitter = spotlightLayers.find((l) =>
      l.className.includes('animate-pulse-glow')
    );
    record(
      "Apex Luminaire Emitter with animate-pulse-glow",
      Boolean(apexEmitter),
      `Apex emitter class: ${apexEmitter?.className}`
    );

    // =========================================================================
    // CHECK 3: 2-Tier Segmented Class Selector & State Management
    // =========================================================================
    console.log("\n--- AUDIT ITEM 3: 2-Tier Segmented Control & React State ---");
    // Click "Mulai perjalanan!"
    await page.click("text=Mulai perjalanan!");
    await wait(300);

    // Submit name "Budi"
    await page.click("text=Mulai Perjalanan");
    await wait(800);

    // Verify on Step 1
    const headingText = await page.textContent("h2");
    record(
      "Step 1 Navigation Success",
      headingText.includes("kelas berapa"),
      `Heading: "${headingText}"`
    );

    // Verify Tablist and Tabs
    const roleTablist = await page.$('[role="tablist"]');
    const tabSmp = await page.$('#tab-smp');
    const tabSma = await page.$('#tab-sma');
    record(
      "Tier 1 ARIA Tablist & Tabs Present",
      Boolean(roleTablist && tabSmp && tabSma),
      `tablist: ${Boolean(roleTablist)}, #tab-smp: ${Boolean(tabSmp)}, #tab-sma: ${Boolean(tabSma)}`
    );

    // Check default selection is SMA/SMK
    const smaSelected = await page.getAttribute('#tab-sma', 'aria-selected');
    const smpSelected = await page.getAttribute('#tab-smp', 'aria-selected');
    record(
      "Default Category is SMA/SMK",
      smaSelected === 'true' && smpSelected === 'false',
      `tab-sma: ${smaSelected}, tab-smp: ${smpSelected}`
    );

    // Verify initial Tier 2 options in DOM (Kelas 10, 11, 12)
    const initialRadios = await page.$$eval('[role="radio"]', (radios) =>
      radios.map((r) => r.textContent.replace(/\s+/g, ' ').trim())
    );
    record(
      "Tier 2 Initial Sub-Classes are SMA (Kelas 10, 11, 12)",
      initialRadios.some((t) => t.includes("Kelas 10")) &&
        initialRadios.some((t) => t.includes("Kelas 11")) &&
        initialRadios.some((t) => t.includes("Kelas 12")) &&
        !initialRadios.some((t) => t.includes("Kelas 7")),
      `Rendered radios: ${JSON.stringify(initialRadios)}`
    );

    // Check localStorage state
    let state = await page.evaluate(() => JSON.parse(localStorage.getItem('karsa_demo_state_v1') || '{}'));
    record(
      "DemoContext State in localStorage (SMA/SMK Kelas 10)",
      state?.profile?.jenjangKelas === "SMA/SMK Kelas 10",
      `localStorage jenjangKelas: "${state?.profile?.jenjangKelas}"`
    );

    // Click #tab-smp
    console.log("Switching Tier 1 to SMP...");
    await page.click('#tab-smp');
    await wait(600);

    const smpSelectedNow = await page.getAttribute('#tab-smp', 'aria-selected');
    record(
      "Tier 1 Switch Updates aria-selected to SMP",
      smpSelectedNow === 'true',
      `tab-smp aria-selected: ${smpSelectedNow}`
    );

    // Verify Tier 2 re-rendered with SMP sub-classes
    const smpRadios = await page.$$eval('[role="radio"]', (radios) =>
      radios.map((r) => r.textContent.replace(/\s+/g, ' ').trim())
    );
    record(
      "Tier 2 Re-renders SMP Sub-Classes (Kelas 7, 8, 9)",
      smpRadios.some((t) => t.includes("Kelas 7")) &&
        smpRadios.some((t) => t.includes("Kelas 8")) &&
        smpRadios.some((t) => t.includes("Kelas 9")) &&
        !smpRadios.some((t) => t.includes("Kelas 10")),
      `Rendered radios: ${JSON.stringify(smpRadios)}`
    );

    state = await page.evaluate(() => JSON.parse(localStorage.getItem('karsa_demo_state_v1') || '{}'));
    record(
      "DemoContext State Updates to 'SMP Kelas 7' on Category Switch",
      state?.profile?.jenjangKelas === "SMP Kelas 7",
      `localStorage profile.jenjangKelas: "${state?.profile?.jenjangKelas}"`
    );

    // Click "Kelas 8"
    console.log("Selecting Kelas 8 in SMP...");
    await page.click('button[role="radio"]:has-text("Kelas 8")');
    await wait(400);

    state = await page.evaluate(() => JSON.parse(localStorage.getItem('karsa_demo_state_v1') || '{}'));
    record(
      "DemoContext State Updates to 'SMP Kelas 8'",
      state?.profile?.jenjangKelas === "SMP Kelas 8",
      `localStorage profile.jenjangKelas: "${state?.profile?.jenjangKelas}"`
    );

    const kelas8RadioChecked = await page.getAttribute(
      'button[role="radio"]:has-text("Kelas 8")',
      'aria-checked'
    );
    record(
      "Kelas 8 aria-checked is 'true'",
      kelas8RadioChecked === 'true',
      `aria-checked: ${kelas8RadioChecked}`
    );

    // Test Category Memory Pattern
    console.log("Testing Category Memory: switching to SMA and back to SMP...");
    await page.click('#tab-sma');
    await wait(600);

    state = await page.evaluate(() => JSON.parse(localStorage.getItem('karsa_demo_state_v1') || '{}'));
    record(
      "Switch to SMA restores SMA selection",
      state?.profile?.jenjangKelas === "SMA/SMK Kelas 10",
      `localStorage profile.jenjangKelas: "${state?.profile?.jenjangKelas}"`
    );

    await page.click('#tab-smp');
    await wait(600);

    state = await page.evaluate(() => JSON.parse(localStorage.getItem('karsa_demo_state_v1') || '{}'));
    record(
      "Switch to SMP restores previously selected 'SMP Kelas 8' (Category Memory)",
      state?.profile?.jenjangKelas === "SMP Kelas 8",
      `localStorage profile.jenjangKelas: "${state?.profile?.jenjangKelas}"`
    );

    // =========================================================================
    // CHECK 4: Touch Targets & Accessibility Compliance
    // =========================================================================
    console.log("\n--- AUDIT ITEM 4: Touch Targets & UI/UX Pro Max Accessibility ---");
    const touchTargets = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.map((b) => {
        const rect = b.getBoundingClientRect();
        return {
          text: b.textContent.replace(/\s+/g, ' ').trim().slice(0, 30),
          role: b.getAttribute('role'),
          w: Math.round(rect.width),
          h: Math.round(rect.height),
        };
      });
    });

    const tier1Tabs = touchTargets.filter((t) => t.role === 'tab');
    const tier1HeightsPass = tier1Tabs.every((t) => t.h >= 48);
    record(
      "Tier 1 Tab Touch Targets (height >= 48px)",
      tier1HeightsPass,
      `Tab heights: ${tier1Tabs.map((t) => `${t.text}: ${t.h}px`).join(', ')}`
    );

    const tier2Radios = touchTargets.filter((t) => t.role === 'radio');
    const tier2HeightsPass = tier2Radios.every((t) => t.h >= 56);
    record(
      "Tier 2 Radio Touch Targets (height >= 56px)",
      tier2HeightsPass,
      `Radio heights: ${tier2Radios.map((t) => `${t.text}: ${t.h}px`).join(', ')}`
    );

    // =========================================================================
    // CHECK 5: Full Downstream Propagation to Step 4 Summary
    // =========================================================================
    console.log("\n--- AUDIT ITEM 5: Propagation to Summary & Completion ---");
    // Step 1 to Step 2
    console.log("Navigating Step 1 -> Step 2...");
    await page.getByRole('button', { name: 'Lanjut', exact: true }).click();
    await page.waitForSelector('text=Bidang apa yang ingin kamu coba?', { timeout: 10000 });
    await wait(600);

    // Step 2 to Step 3
    console.log("Navigating Step 2 -> Step 3...");
    await page.getByRole('button', { name: 'Lanjut', exact: true }).click();
    await page.waitForSelector('text=Berapa waktu luangmu per hari?', { timeout: 10000 });
    await wait(600);

    // Step 3 to Step 4
    console.log("Navigating Step 3 -> Step 4...");
    await page.getByRole('button', { name: 'Ringkasan', exact: true }).click();
    await page.waitForSelector('text=Profil belajarmu sudah siap', { timeout: 10000 });
    await wait(800);

    // Check summary card text for Jenjang & Kelas
    const summaryJenjang = await page.evaluate(() => {
      const spans = Array.from(document.querySelectorAll('span'));
      const label = spans.find((s) => s.textContent?.includes("Jenjang & Kelas:"));
      return label?.nextElementSibling?.textContent?.trim();
    });

    record(
      "Step 4 Summary Displays Selected 'SMP Kelas 8'",
      summaryJenjang === "SMP Kelas 8",
      `Step 4 Jenjang & Kelas text: "${summaryJenjang}"`
    );

    // Check consent checkbox and complete
    await page.click('input[type="checkbox"]');
    await wait(300);
    await page.click('button:has-text("Masuk ke Rumah Karsa")');
    await wait(2000);

    state = await page.evaluate(() => JSON.parse(localStorage.getItem('karsa_demo_state_v1') || '{}'));
    record(
      "Onboarding Completed & Persisted (isCompleted=true, jenjangKelas='SMP Kelas 8')",
      state?.profile?.isCompleted === true && state?.profile?.jenjangKelas === "SMP Kelas 8",
      `Final state: isCompleted=${state?.profile?.isCompleted}, jenjangKelas="${state?.profile?.jenjangKelas}"`
    );

    await browser.close();

    const failed = auditResults.filter((r) => !r.passed);
    console.log("\n===============================================================");
    console.log(`COMPLETE FORENSIC AUDIT FINISHED: ${auditResults.length} checks run.`);
    console.log(`PASSED: ${auditResults.length - failed.length}`);
    console.log(`FAILED: ${failed.length}`);
    console.log("===============================================================");

    const outPath = path.resolve(".agents/auditor_m1/empirical_results.json");
    fs.writeFileSync(
      outPath,
      JSON.stringify({ total: auditResults.length, passed: auditResults.length - failed.length, failed: failed.length, checks: auditResults }, null, 2)
    );

    process.exit(failed.length > 0 ? 1 : 0);
  } catch (err) {
    console.error("Forensic audit error:", err);
    await browser.close();
    process.exit(1);
  }
}

runCompleteForensicAudit();
