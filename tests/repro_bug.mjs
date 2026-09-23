import { chromium } from "playwright";

async function repro() {
  console.log("Starting reproduction of Reload Desynchronization Bug...");
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto("http://localhost:3000");

  // Step 1: Set localStorage with onboardingStep 1 and SMP Kelas 8
  await page.evaluate(() => {
    localStorage.setItem("karsa_demo_state_v1", JSON.stringify({
      onboardingStep: 1,
      profile: {
        nama: "Budi",
        jenjangKelas: "SMP Kelas 8",
        keahlianSudah: [],
        keahlianIngin: [],
        ritmeBelajar: "30-45 Menit (Fokus)",
        targetTujuan: [],
        isConsentGiven: false,
        isCompleted: false
      }
    }));
  });

  // Step 2: Reload page
  console.log("Reloading page with 'SMP Kelas 8' in localStorage...");
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  // Step 3: Inspect active tab vs profile.jenjangKelas
  const smpTabSelected = await page.locator("#tab-smp").getAttribute("aria-selected");
  const smaTabSelected = await page.locator("#tab-sma").getAttribute("aria-selected");
  const radioGroupLabel = await page.locator("div[role='radiogroup']").getAttribute("aria-label");
  const checkedRadios = await page.locator("button[role='radio'][aria-checked='true']").count();
  const visibleRadios = await page.locator("button[role='radio']").allInnerTexts();
  const contextState = await page.evaluate(() => JSON.parse(localStorage.getItem("karsa_demo_state_v1")));

  console.log("\n--- EMPIRICAL BUG REPRODUCTION RESULTS ---");
  console.log("Context profile.jenjangKelas:", contextState?.profile?.jenjangKelas);
  console.log("Tab SMP aria-selected:", smpTabSelected);
  console.log("Tab SMA aria-selected:", smaTabSelected);
  console.log("Radiogroup label:", radioGroupLabel);
  console.log("Visible radio options:", visibleRadios.map(r => r.split("\n")[1]));
  console.log("Number of checked radio buttons:", checkedRadios);

  await page.screenshot({ path: "audit_screenshots/bug_reproduction_desync.png" });
  console.log("Saved bug screenshot to audit_screenshots/bug_reproduction_desync.png");

  await browser.close();
}

repro().catch(console.error);
