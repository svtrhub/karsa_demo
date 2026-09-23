import { chromium } from "playwright";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";

console.log("================================================================================");
console.log("KARSA DEMO MILESTONE 1 - EMPIRICAL STRESS TEST SUITE");
console.log("Target: 2-Tier Segmented Class Selector, Category Memory & State Sync");
console.log("================================================================================");

const CANONICAL_JENJANG = [
  "SMP Kelas 7",
  "SMP Kelas 8",
  "SMP Kelas 9",
  "SMA/SMK Kelas 10",
  "SMA/SMK Kelas 11",
  "SMA/SMK Kelas 12",
];

const results = {
  passed: 0,
  failed: 0,
  tests: [],
  findings: [],
};

function recordResult(testName, status, details = "") {
  if (status) {
    results.passed++;
    console.log(`  ✅ [PASS] ${testName}`);
  } else {
    results.failed++;
    console.error(`  ❌ [FAIL] ${testName}: ${details}`);
    results.findings.push({ testName, details });
  }
  results.tests.push({ testName, status: status ? "PASS" : "FAIL", details });
}

async function runEmpiricalStressTests() {
  console.log("\n[SETUP] Launching Chromium browser via Playwright...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const consoleErrors = [];
  const consoleWarnings = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      consoleErrors.push(msg.text());
    } else if (msg.type() === "warning") {
      consoleWarnings.push(msg.text());
    }
  });

  page.on("pageerror", (err) => {
    consoleErrors.push(`Uncaught Page Error: ${err.message}`);
  });

  const screenshotDir = path.resolve("audit_screenshots/stress_test");
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  try {
    // -------------------------------------------------------------------------
    // TEST SUITE 1: Clean Onboarding Entry & Initial State Verification
    // -------------------------------------------------------------------------
    console.log("\n----------------------------------------------------------------");
    console.log("SUITE 1: Clean Onboarding & Initial State Machine Invariants");
    console.log("----------------------------------------------------------------");

    await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForTimeout(600);

    // Verify Step 0
    const step0Button = await page.locator("text=Mulai perjalanan!").first();
    assert(await step0Button.isVisible(), "Step 0 'Mulai perjalanan!' button must be visible");
    await step0Button.click();
    await page.waitForTimeout(300);

    // Advance to Step 1
    const submitNameBtn = await page.locator("button:has-text('Mulai Perjalanan')").first();
    await submitNameBtn.click();
    await page.waitForTimeout(600);

    // Verify on Step 1
    const step1Heading = await page.locator("h2:has-text('Kamu kelas berapa sekarang?')").first();
    recordResult("Step 1 Transition Successful", await step1Heading.isVisible());

    // Check default Tier 1 tab
    const smaTab = page.locator("#tab-sma");
    const smpTab = page.locator("#tab-smp");
    const smaSelected = await smaTab.getAttribute("aria-selected");
    const smpSelected = await smpTab.getAttribute("aria-selected");

    recordResult(
      "Default Tier 1 Tab is SMA/SMK",
      smaSelected === "true" && smpSelected === "false",
      `Expected SMA=true, SMP=false. Got SMA=${smaSelected}, SMP=${smpSelected}`
    );

    // Check default Tier 2 radio button
    const defaultRadioChecked = await page.locator("button[role='radio'][aria-checked='true']").innerText();
    recordResult(
      "Default Tier 2 Radio Selection is Kelas 10",
      defaultRadioChecked.includes("Kelas 10"),
      `Got text: ${defaultRadioChecked}`
    );

    // Check localStorage profile.jenjangKelas
    const initialStorage = await page.evaluate(() => {
      const item = localStorage.getItem("karsa_demo_state_v1");
      return item ? JSON.parse(item) : null;
    });
    recordResult(
      "Profile state persistence contains canonical 'SMA/SMK Kelas 10'",
      initialStorage?.profile?.jenjangKelas === "SMA/SMK Kelas 10",
      `Stored jenjangKelas: ${initialStorage?.profile?.jenjangKelas}`
    );

    await page.screenshot({ path: path.join(screenshotDir, "01_initial_step1.png") });

    // -------------------------------------------------------------------------
    // TEST SUITE 2: Category Memory Stress-Test (Canonical Scenario)
    // -------------------------------------------------------------------------
    console.log("\n----------------------------------------------------------------");
    console.log("SUITE 2: Category Memory & State Preservation");
    console.log("----------------------------------------------------------------");

    // 1. Switch to SMP tab
    await smpTab.click();
    await page.locator("div[role='radiogroup'][aria-label='Pilih Kelas SMP']").waitFor({ state: "visible", timeout: 4000 });

    // Verify SMP tab active
    const smpActive1 = await smpTab.getAttribute("aria-selected");
    recordResult("SMP Tab Active after click", smpActive1 === "true");

    // Default SMP subclass should be Kelas 7
    let checkedRadio = await page.locator("div[role='radiogroup'][aria-label='Pilih Kelas SMP'] button[role='radio'][aria-checked='true']").innerText();
    recordResult("Default SMP sub-class initialized to Kelas 7", checkedRadio.includes("Kelas 7"), checkedRadio);

    // Select SMP Kelas 8
    const kelas8Btn = page.locator("button[role='radio']:has-text('Kelas 8')");
    await kelas8Btn.click();
    await page.waitForTimeout(300);

    checkedRadio = await page.locator("button[role='radio'][aria-checked='true']").innerText();
    recordResult("Selected SMP Kelas 8", checkedRadio.includes("Kelas 8"), checkedRadio);

    let storage = await page.evaluate(() => JSON.parse(localStorage.getItem("karsa_demo_state_v1")));
    recordResult("LocalStorage updated to 'SMP Kelas 8'", storage.profile.jenjangKelas === "SMP Kelas 8", storage.profile.jenjangKelas);

    // 2. Switch to SMA tab
    await smaTab.click();
    await page.waitForTimeout(400);

    const smaActive1 = await smaTab.getAttribute("aria-selected");
    recordResult("Switched to SMA/SMK Tab", smaActive1 === "true");

    // Select SMA Kelas 11
    const kelas11Btn = page.locator("button[role='radio']:has-text('Kelas 11')");
    await kelas11Btn.click();
    await page.waitForTimeout(300);

    checkedRadio = await page.locator("button[role='radio'][aria-checked='true']").innerText();
    recordResult("Selected SMA/SMK Kelas 11", checkedRadio.includes("Kelas 11"), checkedRadio);

    storage = await page.evaluate(() => JSON.parse(localStorage.getItem("karsa_demo_state_v1")));
    recordResult("LocalStorage updated to 'SMA/SMK Kelas 11'", storage.profile.jenjangKelas === "SMA/SMK Kelas 11", storage.profile.jenjangKelas);

    // 3. Switch BACK to SMP tab -> MUST PRESERVE KELAS 8
    await smpTab.click();
    await page.waitForTimeout(400);

    checkedRadio = await page.locator("button[role='radio'][aria-checked='true']").innerText();
    const isKelas8Preserved = checkedRadio.includes("Kelas 8");
    recordResult("Category Memory: SMP Kelas 8 preserved upon return to SMP", isKelas8Preserved, `Active radio: ${checkedRadio}`);

    storage = await page.evaluate(() => JSON.parse(localStorage.getItem("karsa_demo_state_v1")));
    recordResult("Profile jenjangKelas preserved as 'SMP Kelas 8'", storage.profile.jenjangKelas === "SMP Kelas 8", storage.profile.jenjangKelas);

    // 4. Switch BACK to SMA tab -> MUST PRESERVE KELAS 11
    await smaTab.click();
    await page.waitForTimeout(400);

    checkedRadio = await page.locator("button[role='radio'][aria-checked='true']").innerText();
    const isKelas11Preserved = checkedRadio.includes("Kelas 11");
    recordResult("Category Memory: SMA Kelas 11 preserved upon return to SMA", isKelas11Preserved, `Active radio: ${checkedRadio}`);

    storage = await page.evaluate(() => JSON.parse(localStorage.getItem("karsa_demo_state_v1")));
    recordResult("Profile jenjangKelas preserved as 'SMA/SMK Kelas 11'", storage.profile.jenjangKelas === "SMA/SMK Kelas 11", storage.profile.jenjangKelas);

    await page.screenshot({ path: path.join(screenshotDir, "02_category_memory_verified.png") });

    // -------------------------------------------------------------------------
    // TEST SUITE 3: Rapid Tab Switching Hammer (Stress & Concurrency)
    // -------------------------------------------------------------------------
    console.log("\n----------------------------------------------------------------");
    console.log("SUITE 3: Rapid Tab Switching Hammer (Race Condition Stress-Test)");
    console.log("----------------------------------------------------------------");

    // Rapid alternating clicks 20 times with force: true
    console.log("  Executing 20 rapid alternating clicks between SMP and SMA tabs...");
    for (let i = 0; i < 20; i++) {
      const target = i % 2 === 0 ? smpTab : smaTab;
      await target.click({ force: true });
      await page.waitForTimeout(30);
    }


    // Wait for Framer Motion exit/enter animations to fully settle
    await page.waitForTimeout(800);

    // Verify final state consistency
    const finalSmpSelected = (await smpTab.getAttribute("aria-selected")) === "true";
    const finalSmaSelected = (await smaTab.getAttribute("aria-selected")) === "true";

    recordResult(
      "Rapid Switching: Exactly one tab is selected after burst",
      (finalSmpSelected && !finalSmaSelected) || (!finalSmpSelected && finalSmaSelected),
      `SMP=${finalSmpSelected}, SMA=${finalSmaSelected}`
    );

    const activeTabCategory = finalSmpSelected ? "SMP" : "SMA";
    const panelAriaLabel = await page.locator("div[role='radiogroup']").getAttribute("aria-label");
    recordResult(
      "Rapid Switching: Tier 2 radiogroup matches active tab category",
      panelAriaLabel === `Pilih Kelas ${activeTabCategory}`,
      `Active tab: ${activeTabCategory}, Radiogroup label: ${panelAriaLabel}`
    );

    const activeRadioAfterBurst = await page.locator("button[role='radio'][aria-checked='true']").count();
    recordResult(
      "Rapid Switching: Exactly one sub-class radio chip is checked",
      activeRadioAfterBurst === 1,
      `Checked count: ${activeRadioAfterBurst}`
    );

    const activeRadioText = await page.locator("button[role='radio'][aria-checked='true']").innerText();
    storage = await page.evaluate(() => JSON.parse(localStorage.getItem("karsa_demo_state_v1")));
    recordResult(
      "Rapid Switching: Storage state matches DOM active chip",
      CANONICAL_JENJANG.includes(storage.profile.jenjangKelas) &&
        activeRadioText.includes(storage.profile.jenjangKelas.replace("SMP ", "").replace("SMA/SMK ", "")),
      `DOM: ${activeRadioText.split("\n")[1]}, Storage: ${storage.profile.jenjangKelas}`
    );

    await page.screenshot({ path: path.join(screenshotDir, "03_after_rapid_switching.png") });

    // -------------------------------------------------------------------------
    // TEST SUITE 4: Step 4 Summary Synchronization (End-to-End Flow)
    // -------------------------------------------------------------------------
    console.log("\n----------------------------------------------------------------");
    console.log("SUITE 4: Step 4 Summary Synchronization");
    console.log("----------------------------------------------------------------");

    // Select a deterministic target in Step 1: SMP Kelas 9
    await smpTab.click();
    await page.waitForTimeout(300);
    const kelas9Btn = page.locator("button[role='radio']:has-text('Kelas 9')");
    await kelas9Btn.click();
    await page.waitForTimeout(300);

    const expectedCanonicalClass = "SMP Kelas 9";
    storage = await page.evaluate(() => JSON.parse(localStorage.getItem("karsa_demo_state_v1")));
    assert.strictEqual(storage.profile.jenjangKelas, expectedCanonicalClass);

    // Advance to Step 2
    await page.locator("button:has(span:text-is('Lanjut'))").click();
    const step2Heading = page.locator("h2:has-text('Bidang apa yang ingin kamu coba?')");
    await step2Heading.waitFor({ state: "visible", timeout: 5000 });
    recordResult("Advance to Step 2", await step2Heading.isVisible());

    // Advance to Step 3
    await page.locator("button:has(span:text-is('Lanjut'))").click();
    const step3Heading = page.locator("h2:has-text('Berapa waktu luangmu per hari?')");
    await step3Heading.waitFor({ state: "visible", timeout: 5000 });
    recordResult("Advance to Step 3", await step3Heading.isVisible());

    // Advance to Step 4 (Summary)
    await page.click("button:has-text('Ringkasan')");
    const step4Heading = page.locator("h2:has-text('Profil belajarmu sudah siap')");
    await step4Heading.waitFor({ state: "visible", timeout: 5000 });
    recordResult("Advance to Step 4 (Summary)", await step4Heading.isVisible());

    // Inspect Step 4 Summary Box for "Jenjang & Kelas"
    const summaryJenjangRow = page.locator("div.flex.justify-between:has-text('Jenjang & Kelas:')");
    const summaryJenjangValue = await summaryJenjangRow.locator("span.font-semibold").innerText();

    recordResult(
      "Step 4 Summary: Displays exact canonical class string",
      summaryJenjangValue.trim() === expectedCanonicalClass,
      `Expected '${expectedCanonicalClass}', got '${summaryJenjangValue}'`
    );

    recordResult(
      "Step 4 Summary: No undefined, null, or NaN present",
      !summaryJenjangValue.includes("undefined") &&
        !summaryJenjangValue.includes("null") &&
        !summaryJenjangValue.includes("NaN"),
      `Value: '${summaryJenjangValue}'`
    );

    await page.screenshot({ path: path.join(screenshotDir, "04_step4_summary_sync.png") });

    // -------------------------------------------------------------------------
    // TEST SUITE 5: Reverse Navigation & Live Update Synchronization
    // -------------------------------------------------------------------------
    console.log("\n----------------------------------------------------------------");
    console.log("SUITE 5: Reverse Navigation & Live Update Synchronization");
    console.log("----------------------------------------------------------------");

    // Click "Kembali" 3 times back to Step 1
    await page.click("button:has-text('Kembali')");
    await page.locator("h2:has-text('Berapa waktu luangmu per hari?')").waitFor({ state: "visible", timeout: 5000 });
    await page.click("button:has-text('Kembali')");
    await page.locator("h2:has-text('Bidang apa yang ingin kamu coba?')").waitFor({ state: "visible", timeout: 5000 });
    await page.click("button:has-text('Kembali')");
    const step1ReturnHeading = page.locator("h2:has-text('Kamu kelas berapa sekarang?')");
    await step1ReturnHeading.waitFor({ state: "visible", timeout: 5000 });

    // Verify back on Step 1
    recordResult("Navigated back to Step 1 successfully", await step1ReturnHeading.isVisible());

    // Verify SMP tab still active and Kelas 9 still checked
    const smpActiveReturn = (await smpTab.getAttribute("aria-selected")) === "true";
    const kelas9ActiveReturn = await page.locator("button[role='radio']:has-text('Kelas 9')").getAttribute("aria-checked");
    recordResult(
      "Step 1 State Intact after reverse navigation",
      smpActiveReturn && kelas9ActiveReturn === "true",
      `SMP Active=${smpActiveReturn}, Kelas 9 Checked=${kelas9ActiveReturn}`
    );

    // Now change to SMA/SMK Kelas 12
    await smaTab.click();
    await page.waitForTimeout(400);
    const kelas12Btn = page.locator("button[role='radio']:has-text('Kelas 12')");
    await kelas12Btn.click();
    await page.waitForTimeout(300);

    const newTargetClass = "SMA/SMK Kelas 12";

    // Fast-forward back to Step 4
    await page.locator("button:has(span:text-is('Lanjut'))").click();
    await page.locator("h2:has-text('Bidang apa yang ingin kamu coba?')").waitFor({ state: "visible", timeout: 5000 });
    await page.locator("button:has(span:text-is('Lanjut'))").click();
    await page.locator("h2:has-text('Berapa waktu luangmu per hari?')").waitFor({ state: "visible", timeout: 5000 });
    await page.click("button:has-text('Ringkasan')");
    await page.locator("h2:has-text('Profil belajarmu sudah siap')").waitFor({ state: "visible", timeout: 5000 });


    // Check Step 4 summary updated dynamically
    const updatedSummaryValue = await page.locator("div.flex.justify-between:has-text('Jenjang & Kelas:') span.font-semibold").innerText();
    recordResult(
      "Step 4 Summary: Dynamically re-synchronized to 'SMA/SMK Kelas 12'",
      updatedSummaryValue.trim() === newTargetClass,
      `Expected '${newTargetClass}', got '${updatedSummaryValue}'`
    );

    await page.screenshot({ path: path.join(screenshotDir, "05_step4_resync_kelas12.png") });

    // -------------------------------------------------------------------------
    // TEST SUITE 6: Adversarial Edge Cases (Page Reload & Rehydration Invariant)
    // -------------------------------------------------------------------------
    console.log("\n----------------------------------------------------------------");
    console.log("SUITE 6: Adversarial Edge Cases: Page Reload & Rehydration");
    console.log("----------------------------------------------------------------");

    // Reload page while in Step 4
    console.log("  Testing rehydration from localStorage upon page reload on Step 4...");
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForTimeout(800);

    // Check if Step 4 is still shown and profile is preserved
    const step4AfterReload = await page.locator("h2:has-text('Profil belajarmu sudah siap')").isVisible();
    const jenjangAfterReload = await page.locator("div.flex.justify-between:has-text('Jenjang & Kelas:') span.font-semibold").innerText();

    recordResult(
      "Page Reload on Step 4: Step 4 rehydrates correctly",
      step4AfterReload,
      `Visible: ${step4AfterReload}`
    );
    recordResult(
      "Page Reload on Step 4: 'SMA/SMK Kelas 12' persisted across reload",
      jenjangAfterReload.trim() === newTargetClass,
      `Expected '${newTargetClass}', got '${jenjangAfterReload}'`
    );

    // Now test navigating back to Step 1 after page reload
    console.log("  Navigating back to Step 1 after reload to test component state rehydration...");
    await page.click("button:has-text('Kembali')");
    await page.locator("h2:has-text('Berapa waktu luangmu per hari?')").waitFor({ state: "visible", timeout: 5000 });
    await page.click("button:has-text('Kembali')");
    await page.locator("h2:has-text('Bidang apa yang ingin kamu coba?')").waitFor({ state: "visible", timeout: 5000 });
    await page.click("button:has-text('Kembali')");
    await page.locator("h2:has-text('Kamu kelas berapa sekarang?')").waitFor({ state: "visible", timeout: 5000 });


    // Check Tier 1 active tab: profile has "SMA/SMK Kelas 12", so SMA tab should be active
    const smaTabAfterReload = (await smaTab.getAttribute("aria-selected")) === "true";
    const kelas12CheckedAfterReload = await page.locator("button[role='radio']:has-text('Kelas 12')").getAttribute("aria-checked");

    recordResult(
      "Rehydrated Step 1: Active Tab matches profile category (SMA)",
      smaTabAfterReload,
      `SMA Tab Selected: ${smaTabAfterReload}`
    );
    recordResult(
      "Rehydrated Step 1: Correct sub-class (Kelas 12) is checked",
      kelas12CheckedAfterReload === "true",
      `Kelas 12 aria-checked: ${kelas12CheckedAfterReload}`
    );

    // Now let's test reload specifically while on Step 1 with SMP selected!
    console.log("  Switching to SMP Kelas 8 and reloading directly on Step 1...");
    await smpTab.click();
    await page.waitForTimeout(300);
    await page.locator("button[role='radio']:has-text('Kelas 8')").click();
    await page.waitForTimeout(300);

    // Reload page while directly on Step 1 with SMP selected
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForTimeout(800);

    const smpSelectedOnReload = (await smpTab.getAttribute("aria-selected")) === "true";
    const kelas8Visible = await page.locator("button[role='radio']:has-text('Kelas 8')").isVisible();
    const smpRadioCheckedOnReload = kelas8Visible
      ? await page.locator("button[role='radio']:has-text('Kelas 8')").getAttribute("aria-checked")
      : "MISSING_FROM_DOM";
    const anyRadioChecked = await page.locator("button[role='radio'][aria-checked='true']").count();
    const activeRadiogroupLabel = await page.locator("div[role='radiogroup']").getAttribute("aria-label");

    recordResult(
      "Direct Step 1 Reload: SMP tab remains active after reload",
      smpSelectedOnReload,
      `Expected SMP active=true, got SMP=${smpSelectedOnReload}. Active radiogroup label: '${activeRadiogroupLabel}'`
    );

    recordResult(
      "Direct Step 1 Reload: Kelas 8 remains checked after reload",
      smpRadioCheckedOnReload === "true",
      `Kelas 8 aria-checked: '${smpRadioCheckedOnReload}', Total checked count: ${anyRadioChecked}`
    );

    await page.screenshot({ path: path.join(screenshotDir, "06_step1_direct_reload.png") });

    // Recover tab state to SMP if it was desynchronized by reload so Suite 7 can proceed cleanly
    if (!smpSelectedOnReload) {
      console.log("  [RECOVERY] Recovering from reload desync bug by clicking SMP tab before Suite 7...");
      await smpTab.click();
      await page.waitForTimeout(400);
    }

    // -------------------------------------------------------------------------
    // TEST SUITE 7: Exhaustive Combinatorial Matrix (All 6 Classes)
    // -------------------------------------------------------------------------
    console.log("\n----------------------------------------------------------------");
    console.log("SUITE 7: Exhaustive Combinatorial Category Memory Matrix");
    console.log("----------------------------------------------------------------");

    const smpClasses = ["Kelas 7", "Kelas 8", "Kelas 9"];
    const smaClasses = ["Kelas 10", "Kelas 11", "Kelas 12"];

    let combinatorialSuccess = true;
    const matrixDetails = [];

    for (const smpTarget of smpClasses) {
      for (const smaTarget of smaClasses) {
        // 1. Select smpTarget
        await smpTab.click();
        await page.waitForTimeout(100);
        await page.locator(`button[role='radio']:has-text('${smpTarget}')`).click();
        await page.waitForTimeout(100);

        // 2. Switch to SMA, select smaTarget
        await smaTab.click();
        await page.waitForTimeout(100);
        await page.locator(`button[role='radio']:has-text('${smaTarget}')`).click();
        await page.waitForTimeout(100);

        // 3. Switch back to SMP -> verify smpTarget preserved
        await smpTab.click();
        await page.waitForTimeout(100);
        const smpChecked = await page.locator(`button[role='radio']:has-text('${smpTarget}')`).getAttribute("aria-checked");

        // 4. Switch back to SMA -> verify smaTarget preserved
        await smaTab.click();
        await page.waitForTimeout(100);
        const smaChecked = await page.locator(`button[role='radio']:has-text('${smaTarget}')`).getAttribute("aria-checked");

        const pairOk = smpChecked === "true" && smaChecked === "true";
        if (!pairOk) {
          combinatorialSuccess = false;
        }
        matrixDetails.push(`[${smpTarget} <-> ${smaTarget}]: SMP_OK=${smpChecked === "true"}, SMA_OK=${smaChecked === "true"}`);
      }
    }

    recordResult(
      "Exhaustive 3x3 Combinatorial Category Memory Matrix (9 pairs)",
      combinatorialSuccess,
      matrixDetails.join("; ")
    );

    // -------------------------------------------------------------------------
    // TEST SUITE 8: Console Integrity & DOM NaN/Undefined Scan
    // -------------------------------------------------------------------------
    console.log("\n----------------------------------------------------------------");
    console.log("SUITE 8: Console Integrity & DOM Corruption Scan");
    console.log("----------------------------------------------------------------");

    const bodyText = await page.evaluate(() => document.body.innerText);
    const hasNaN = /\bNaN\b/.test(bodyText);
    const hasUndefined = /\bundefined\b/.test(bodyText);
    const hasNull = /\bnull\b/.test(bodyText);

    recordResult("DOM Scan: No 'NaN' in rendered text", !hasNaN);
    recordResult("DOM Scan: No 'undefined' in rendered text", !hasUndefined);
    recordResult("DOM Scan: No 'null' in rendered text", !hasNull);

    const criticalErrors = consoleErrors.filter((e) => !e.includes("favicon") && !e.includes("font"));
    recordResult(
      "Browser Console: Zero uncaught runtime errors",
      criticalErrors.length === 0,
      criticalErrors.join(" | ")
    );

  } catch (err) {
    recordResult("Test Suite Execution Fatal Crash", false, err.stack || err.message);
  } finally {
    await browser.close();
  }

  console.log("\n================================================================================");
  console.log("STRESS TEST SUMMARY");
  console.log(`Passed: ${results.passed} / ${results.passed + results.failed}`);
  console.log(`Failed: ${results.failed}`);
  console.log(`Verdict: ${results.failed === 0 ? "PASSED (ALL VERIFIED)" : "FAILED (BUGS DETECTED)"}`);
  console.log("================================================================================");

  // Write results JSON for audit trail
  fs.writeFileSync(
    path.resolve("tests/stress_test_m1_results.json"),
    JSON.stringify(results, null, 2),
    "utf-8"
  );

  return results;
}

runEmpiricalStressTests();
