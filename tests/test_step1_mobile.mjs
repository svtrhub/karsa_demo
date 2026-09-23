import { spawn } from "node:child_process";
import { chromium } from "playwright";

const PORT = 3010;
const BASE_URL = `http://localhost:${PORT}`;

async function run() {
  console.log("Starting server for Step 1 Mobile Test...");
  const proc = spawn("node", ["node_modules/next/dist/bin/next", "dev", "-p", String(PORT)], {
    env: { ...process.env },
  });

  for (let i = 0; i < 35; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    try {
      const res = await fetch(BASE_URL);
      if (res.status === 200) {
        console.log("Server ready!");
        break;
      }
    } catch {}
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 375, height: 667 } });

  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "networkidle" });

  // Wait for splash screen to exit
  await page.waitForSelector('[data-testid="app-splash-screen"]', { state: "detached", timeout: 8000 });

  // Click "Mulai perjalanan!"
  console.log("Clicking 'Mulai perjalanan!'...");
  await page.click("text=Mulai perjalanan!");
  await page.waitForTimeout(300);

  // Click "Lanjut" to move to Step 1
  console.log("Submitting name to advance to Step 1...");
  const nextBtn = await page.waitForSelector('button:has-text("Lanjut")', { timeout: 4000 });
  await nextBtn.click();
  await page.waitForTimeout(500);

  // Check Step 1 rendering on Mobile 375x667
  const step1Metrics = await page.evaluate(() => {
    const docEl = document.documentElement;
    const modal = document.querySelector(".liquid-glass-modal");
    const modalRect = modal ? modal.getBoundingClientRect() : null;

    // Check all interactive elements
    const tabs = Array.from(document.querySelectorAll('button[role="tab"]')).map((b) => ({
      text: b.textContent.trim(),
      rect: b.getBoundingClientRect(),
    }));

    const cards = Array.from(document.querySelectorAll(".grid > div, .space-y-2 > div")).map((c) => ({
      text: c.textContent.trim().substring(0, 30),
      rect: c.getBoundingClientRect(),
    }));

    return {
      docScrollWidth: docEl.scrollWidth,
      hasHorizontalOverflow: docEl.scrollWidth > 375,
      modalRect,
      modalFitsWidth: modalRect ? modalRect.width <= 375 : false,
      modalIsScrollable: modal ? modal.scrollHeight > modal.clientHeight : false,
      modalScrollHeight: modal ? modal.scrollHeight : 0,
      modalClientHeight: modal ? modal.clientHeight : 0,
      tabs,
      cardsCount: cards.length,
    };
  });

  console.log("STEP 1 MOBILE 375x667 METRICS:", JSON.stringify(step1Metrics, null, 2));

  await page.screenshot({ path: "audit_screenshots/challenger2_step1_mobile_375.png" });
  console.log("Saved Step 1 screenshot: audit_screenshots/challenger2_step1_mobile_375.png");

  await browser.close();
  proc.kill();
}

run().catch(console.error);
