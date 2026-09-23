import { chromium } from "playwright";

async function testK8() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();
  await page.goto("http://localhost:3000");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForTimeout(600);
  await page.click("text=Mulai perjalanan!");
  await page.waitForTimeout(300);
  await page.click("button:has-text('Mulai Perjalanan')");
  await page.waitForTimeout(600);

  console.log("Switching to SMP...");
  await page.click("#tab-smp");
  await page.waitForTimeout(500);

  console.log("Clicking Kelas 8...");
  await page.click("button:has-text('Kelas 8')");
  await page.waitForTimeout(500);

  let k8 = await page.evaluate(() => {
    const chips = Array.from(document.querySelectorAll('[role="radio"]'));
    const btn = chips.find((c) => c.textContent.includes("Kelas 8"));
    return btn ? btn.getAttribute("aria-checked") : "not found";
  });
  console.log("After click, Kelas 8 aria-checked:", k8);

  console.log("Switching to SMA...");
  await page.click("#tab-sma");
  await page.waitForTimeout(500);

  console.log("Switching back to SMP...");
  await page.click("#tab-smp");
  await page.waitForTimeout(500);

  k8 = await page.evaluate(() => {
    const chips = Array.from(document.querySelectorAll('[role="radio"]'));
    const btn = chips.find((c) => c.textContent.includes("Kelas 8"));
    return btn ? btn.getAttribute("aria-checked") : "not found";
  });
  console.log("After switching back, Kelas 8 aria-checked:", k8);

  await browser.close();
}

testK8().catch(console.error);
