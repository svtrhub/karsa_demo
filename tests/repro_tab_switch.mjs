import { chromium } from "playwright";

async function testTabSwitch() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto("http://localhost:3000");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForTimeout(500);

  // Step 0 -> Step 1
  await page.click("text=Mulai perjalanan!");
  await page.waitForTimeout(300);
  await page.click("text=Mulai Perjalanan");
  await page.waitForTimeout(500);

  console.log("\n1. Initial state (SMA):");
  let radios = await page.locator("button[role='radio'][aria-checked='true']").allInnerTexts();
  console.log("Checked radios in DOM:", radios);

  console.log("\n2. Clicking SMP tab...");
  await page.click("#tab-smp");

  // Sample at 100ms intervals
  for (let t = 100; t <= 800; t += 100) {
    await page.waitForTimeout(100);
    const checked = await page.locator("button[role='radio'][aria-checked='true']").allInnerTexts();
    const radiogroup = await page.locator("div[role='radiogroup']").getAttribute("aria-label");
    const state = await page.evaluate(() => JSON.parse(localStorage.getItem("karsa_demo_state_v1")));
    console.log(`[t=${t}ms] radiogroup: ${radiogroup} | checked: ${checked.map(c => c.split("\n")[1]).join(", ")} | profile: ${state.profile.jenjangKelas}`);
  }

  await browser.close();
}

testTabSwitch().catch(console.error);
