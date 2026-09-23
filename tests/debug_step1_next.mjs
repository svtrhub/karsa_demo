import { spawn } from "child_process";
import { chromium } from "playwright";

async function run() {
  const PORT = 3011;
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
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  try {
    await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForTimeout(600);

    // Step 0 -> Step 1
    await page.click("text=Mulai perjalanan!");
    await page.waitForTimeout(300);
    await page.click("button:has-text('Mulai Perjalanan')");
    await page.waitForTimeout(800);

    console.log("On Step 1. Checking 'Lanjut' button...");
    const lanjutBtn = await page.$("button:has-text('Lanjut')");
    console.log("Lanjut button found:", !!lanjutBtn);
    const bbox = await lanjutBtn.boundingBox();
    console.log("Lanjut bounding box:", bbox);

    const topEl = await page.evaluate(({ x, y }) => {
      const el = document.elementFromPoint(x, y);
      return { tag: el?.tagName, text: el?.textContent?.trim().slice(0, 30) };
    }, { x: bbox.x + bbox.width / 2, y: bbox.y + bbox.height / 2 });
    console.log("Top element at Lanjut center:", topEl);

    // Click Lanjut
    console.log("Clicking Lanjut...");
    await lanjutBtn.click();

    for (let i = 1; i <= 6; i++) {
      await page.waitForTimeout(500);
      const textSnippet = await page.evaluate(() => document.body.textContent.slice(0, 250));
      console.log(`Poll ${i * 500}ms:`, textSnippet.replace(/\s+/g, " "));
    }

    await page.screenshot({ path: "audit_screenshots/stress_test/debug_lanjut_result.png" });
  } finally {
    await browser.close();
    server.kill();
  }
}

run().catch(console.error);
