import { spawn } from "node:child_process";
import { chromium } from "playwright";

const PORT = 3009;
const BASE_URL = `http://localhost:${PORT}`;

async function run() {
  console.log("Spawning server...");
  const proc = spawn("node", ["node_modules/next/dist/bin/next", "dev", "-p", String(PORT)], {
    env: { ...process.env },
  });

  proc.stdout.on("data", (d) => {
    const s = d.toString();
    if (s.includes("Ready") || s.includes("Compiled")) console.log("[SERVER]", s.trim());
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

  for (const vp of [
    { name: "mobile_375x667", width: 375, height: 667 },
    { name: "tablet_768x1024", width: 768, height: 1024 },
    { name: "desktop_1440x900", width: 1440, height: 900 },
  ]) {
    console.log(`\n--- Inspecting ${vp.name} ---`);
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    await page.goto(`${BASE_URL}?splash=hold`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000); // let styles settle

    const data = await page.evaluate(({ w, h }) => {
      const splash = document.querySelector('[data-testid="app-splash-screen"]');
      const logo = document.querySelector('[data-testid="splash-logo"]');
      const img = splash ? splash.querySelector('img[alt="Rumah Karsa Exterior"]') : null;

      const logoRect = logo ? logo.getBoundingClientRect() : null;
      const imgRect = img ? img.getBoundingClientRect() : null;

      return {
        logoText: logo ? logo.textContent.trim() : null,
        logoRect,
        logoCenter: logoRect ? { x: logoRect.x + logoRect.width / 2, y: logoRect.y + logoRect.height / 2 } : null,
        vpCenter: { x: w / 2, y: h / 2 },
        delta: logoRect
          ? {
              x: Math.abs(logoRect.x + logoRect.width / 2 - w / 2),
              y: Math.abs(logoRect.y + logoRect.height / 2 - h / 2),
            }
          : null,
        logoStyles: logo
          ? {
              fontSize: window.getComputedStyle(logo).fontSize,
              opacity: window.getComputedStyle(logo).opacity,
              fontWeight: window.getComputedStyle(logo).fontWeight,
              letterSpacing: window.getComputedStyle(logo).letterSpacing,
            }
          : null,
        imgStyles: img
          ? {
              opacity: window.getComputedStyle(img).opacity,
              objectFit: window.getComputedStyle(img).objectFit,
              rect: imgRect,
            }
          : null,
      };
    }, { w: vp.width, h: vp.height });

    console.log(JSON.stringify(data, null, 2));
    await page.close();
  }

  await browser.close();
  proc.kill();
}

run().catch(console.error);
