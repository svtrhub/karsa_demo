import { chromium } from "playwright";
import fs from "node:fs";

async function diag() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on("console", msg => console.log("PAGE LOG:", msg.text()));
  page.on("pageerror", err => console.log("PAGE ERROR:", err.message));

  await page.goto("http://localhost:3000");
  await page.waitForTimeout(1000);

  const html = await page.locator("body").innerHTML();
  console.log("BODY HTML SNIPPET:", html.slice(0, 500));
  await page.screenshot({ path: "audit_screenshots/diag_full.png" });

  await browser.close();
}

diag().catch(console.error);
