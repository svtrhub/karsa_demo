import { spawn } from "child_process";
import { chromium } from "playwright";

async function run() {
  const PORT = 3009;
  const BASE_URL = `http://localhost:${PORT}`;

  console.log("Starting server on port", PORT);
  const server = spawn("C:\\Program Files\\nodejs\\node.exe", ["node_modules/next/dist/bin/next", "dev", "-p", String(PORT)], {
    cwd: process.cwd(),
    env: { ...process.env, PATH: "C:\\Program Files\\nodejs;" + process.env.PATH },
  });

  for (let i = 0; i < 30; i++) {
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
  const context = await browser.newContext({ viewport: { width: 375, height: 667 } });
  const page = await context.newPage();

  try {
    await page.goto(BASE_URL, { waitUntil: "networkidle" });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForTimeout(600);

    // Click Mulai perjalanan!
    await page.click("text=Mulai perjalanan!");
    await page.waitForTimeout(300);
    await page.click("button:has-text('Mulai Perjalanan')");
    await page.waitForTimeout(600);

    // On Step 1: inspect card bounding box and button positions
    const diagnostics = await page.evaluate(() => {
      const card = document.querySelector(".liquid-glass-modal");
      const cardRect = card ? card.getBoundingClientRect() : null;
      const lanjutBtn = Array.from(document.querySelectorAll("button")).find((b) => b.textContent.includes("Lanjut"));
      const lanjutRect = lanjutBtn ? lanjutBtn.getBoundingClientRect() : null;
      const kembaliBtn = Array.from(document.querySelectorAll("button")).find((b) => b.textContent.includes("Kembali"));
      const kembaliRect = kembaliBtn ? kembaliBtn.getBoundingClientRect() : null;

      return {
        windowHeight: window.innerHeight,
        windowWidth: window.innerWidth,
        cardRect: cardRect ? { top: Math.round(cardRect.top), bottom: Math.round(cardRect.bottom), height: Math.round(cardRect.height) } : null,
        lanjutRect: lanjutRect ? { top: Math.round(lanjutRect.top), bottom: Math.round(lanjutRect.bottom), height: Math.round(lanjutRect.height) } : null,
        kembaliRect: kembaliRect ? { top: Math.round(kembaliRect.top), bottom: Math.round(kembaliRect.bottom), height: Math.round(kembaliRect.height) } : null,
        isLanjutOffScreen: lanjutRect ? lanjutRect.bottom > window.innerHeight : null,
        isKembaliOffScreen: kembaliRect ? kembaliRect.bottom > window.innerHeight : null,
        documentScrollHeight: document.documentElement.scrollHeight,
        documentClientHeight: document.documentElement.clientHeight,
        bodyOverflow: window.getComputedStyle(document.body).overflow,
        htmlOverflow: window.getComputedStyle(document.documentElement).overflow,
      };
    });

    console.log("MOBILE 375x667 DIAGNOSTICS:", JSON.stringify(diagnostics, null, 2));

    await page.screenshot({ path: "audit_screenshots/stress_test/mobile_375x667_viewport_clipped.png" });
  } finally {
    await browser.close();
    server.kill();
  }
}

run().catch(console.error);
