import { spawn } from "child_process";
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const PORT = 3010;
const BASE_URL = `http://localhost:${PORT}`;

const VIEWPORTS = [
  { name: "mobile_375x667", width: 375, height: 667, deviceType: "mobile" },
  { name: "tablet_768x1024", width: 768, height: 1024, deviceType: "tablet" },
  { name: "desktop_1280x800", width: 1280, height: 800, deviceType: "desktop" },
  { name: "large_desktop_1920x1080", width: 1920, height: 1080, deviceType: "large_desktop" },
];

const OUT_DIR = path.resolve("audit_screenshots/stress_test");
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function startServer() {
  console.log(`[SERVER] Spawning Next.js dev server on port ${PORT}...`);
  const serverProc = spawn(
    "C:\\Program Files\\nodejs\\node.exe",
    ["node_modules/next/dist/bin/next", "dev", "-p", String(PORT)],
    {
      cwd: process.cwd(),
      env: { ...process.env, PATH: "C:\\Program Files\\nodejs;" + process.env.PATH },
    }
  );

  serverProc.stdout.on("data", (d) => {
    const str = d.toString();
    if (str.includes("Ready in") || str.includes("Compiled")) {
      process.stdout.write(`[SERVER] ${str.trim()}\n`);
    }
  });

  serverProc.stderr.on("data", (d) => {
    process.stderr.write(`[SERVER STDERR] ${d.toString()}`);
  });

  console.log("[SERVER] Waiting for server readiness...");
  for (let attempt = 1; attempt <= 30; attempt++) {
    await new Promise((r) => setTimeout(r, 1200));
    try {
      const res = await fetch(BASE_URL);
      if (res.status === 200) {
        console.log(`[SERVER] Ready and serving HTTP 200 (attempt ${attempt})!`);
        return serverProc;
      }
    } catch {}
  }
  serverProc.kill();
  throw new Error("Server failed to start within timeout");
}

async function runEmpiricalStressTest() {
  let serverProc = null;
  let browser = null;

  const summaryResults = {
    timestamp: new Date().toISOString(),
    port: PORT,
    viewports: {},
    allPassed: true,
    findings: [],
  };

  try {
    serverProc = await startServer();

    console.log("\n[PLAYWRIGHT] Launching Chromium headless browser...");
    browser = await chromium.launch({ headless: true });

    for (const vp of VIEWPORTS) {
      console.log(`\n==================================================================`);
      console.log(`STRESS TESTING VIEWPORT: ${vp.name} (${vp.width}x${vp.height} - ${vp.deviceType})`);
      console.log(`==================================================================`);

      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        deviceScaleFactor: 1,
      });
      const page = await context.newPage();

      const vpData = {
        viewport: vp,
        step0Layout: {},
        step0LogoCheck: {},
        step0Interactivity: {},
        step1SmaLayout: {},
        step1SmaLogoCheck: {},
        step1Interactivity: {},
        step1SmpLayout: {},
        step1SmpKelas8: {},
        step2Reached: false,
        backNavigationSuccess: false,
        failures: [],
      };

      try {
        // Navigate
        await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
        await page.evaluate(() => localStorage.clear());
        await page.reload({ waitUntil: "domcontentloaded" });
        await page.waitForTimeout(1000);

        // --- 1. Step 0 Layout & Scrollbars ---
        console.log(`[${vp.name}] Evaluating Step 0 layout metrics & overflow...`);
        const s0Layout = await page.evaluate(() => {
          const doc = document.documentElement;
          const body = document.body;
          return {
            windowInnerWidth: window.innerWidth,
            windowInnerHeight: window.innerHeight,
            htmlScrollWidth: doc.scrollWidth,
            htmlScrollHeight: doc.scrollHeight,
            bodyScrollWidth: body.scrollWidth,
            bodyScrollHeight: body.scrollHeight,
            hasHorizontalOverflow: doc.scrollWidth > window.innerWidth,
            horizontalOverflowPx: Math.max(0, doc.scrollWidth - window.innerWidth),
            hasVerticalOverflow: doc.scrollHeight > window.innerHeight,
            verticalOverflowPx: Math.max(0, doc.scrollHeight - window.innerHeight),
          };
        });
        vpData.step0Layout = s0Layout;

        if (s0Layout.hasHorizontalOverflow) {
          vpData.failures.push(
            `Step 0 horizontal scrollbar: scrollWidth (${s0Layout.htmlScrollWidth}px) > innerWidth (${s0Layout.windowInnerWidth}px) by ${s0Layout.horizontalOverflowPx}px`
          );
        }

        // --- 2. Step 0 Top-Left Duplicate Logo Check ---
        console.log(`[${vp.name}] Verifying Step 0 logo placement & duplicates...`);
        const s0Logos = await page.evaluate(() => {
          const all = Array.from(document.querySelectorAll("*"));
          return all
            .filter((el) => el.children.length === 0 && el.textContent && el.textContent.trim().toUpperCase() === "KARSA")
            .map((el) => {
              const rect = el.getBoundingClientRect();
              return {
                tag: el.tagName,
                text: el.textContent.trim(),
                x: Math.round(rect.x),
                y: Math.round(rect.y),
                width: Math.round(rect.width),
                height: Math.round(rect.height),
                isTopLeft: rect.x < 250 && rect.y < 150,
              };
            });
        });
        vpData.step0LogoCheck = {
          totalKarsaElements: s0Logos.length,
          logos: s0Logos,
          hasTopLeftLogo: s0Logos.some((l) => l.isTopLeft),
        };

        if (s0Logos.some((l) => l.isTopLeft)) {
          vpData.failures.push(`Duplicate/orphaned KARSA logo detected in top-left region: ${JSON.stringify(s0Logos.filter((l) => l.isTopLeft))}`);
        }
        if (s0Logos.length !== 1) {
          vpData.failures.push(`Expected exactly 1 central KARSA logo on Step 0, found ${s0Logos.length}`);
        }

        // Capture Step 0 Screenshot
        const shotStep0 = path.join(OUT_DIR, `${vp.name}_step0.png`);
        await page.screenshot({ path: shotStep0 });
        console.log(`[${vp.name}] Saved screenshot: ${shotStep0}`);

        // --- 3. Step 0 Pointer-Events & Interaction ---
        console.log(`[${vp.name}] Testing Step 0 pointer-events pass-through & input typing...`);
        const btnStart = await page.$("text=Mulai perjalanan!");
        if (!btnStart) {
          vpData.failures.push("Missing 'Mulai perjalanan!' button on Step 0");
        } else {
          const bbox = await btnStart.boundingBox();
          const topEl = await page.evaluate(
            ({ x, y }) => {
              const el = document.elementFromPoint(x, y);
              return {
                tag: el?.tagName,
                id: el?.id,
                className: el?.className,
                text: el?.textContent?.trim().slice(0, 30),
              };
            },
            { x: bbox.x + bbox.width / 2, y: bbox.y + bbox.height / 2 }
          );

          vpData.step0Interactivity.buttonElementAtPoint = topEl;
          if (!topEl.text?.includes("Mulai perjalanan")) {
            vpData.failures.push(`'Mulai perjalanan!' button obscured by element: ${JSON.stringify(topEl)}`);
          }

          // Click to reveal name input
          await page.click("text=Mulai perjalanan!");
          await page.waitForTimeout(400);

          // Verify name input
          const nameInput = await page.$("#input-nama-panggilan");
          if (!nameInput) {
            vpData.failures.push("Name input '#input-nama-panggilan' failed to render after clicking 'Mulai perjalanan!'");
          } else {
            const inputBbox = await nameInput.boundingBox();
            const topElInput = await page.evaluate(
              ({ x, y }) => {
                const el = document.elementFromPoint(x, y);
                return { tag: el?.tagName, id: el?.id };
              },
              { x: inputBbox.x + inputBbox.width / 2, y: inputBbox.y + inputBbox.height / 2 }
            );

            vpData.step0Interactivity.inputElementAtPoint = topElInput;
            if (topElInput.id !== "input-nama-panggilan" && topElInput.tag !== "INPUT") {
              vpData.failures.push(`Name input obscured at center coordinates: ${JSON.stringify(topElInput)}`);
            }

            // Type custom name
            await page.fill("#input-nama-panggilan", "");
            await page.type("#input-nama-panggilan", "EmpiricalChallenger", { delay: 10 });
            const val = await page.$eval("#input-nama-panggilan", (el) => el.value);
            vpData.step0Interactivity.typedValue = val;
            if (val !== "EmpiricalChallenger") {
              vpData.failures.push(`Input typing mismatch: expected 'EmpiricalChallenger', got '${val}'`);
            }

            // Click submit to Step 1
            await page.click("button:has-text('Mulai Perjalanan')");
            await page.waitForTimeout(700);
          }
        }

        // --- 4. Step 1 (SMA/SMK Tier Active) ---
        console.log(`[${vp.name}] Evaluating Step 1 (SMA Tier) layout & logo check...`);
        const s1SmaLayout = await page.evaluate(() => {
          const doc = document.documentElement;
          const card = document.querySelector(".liquid-glass-modal");
          const cardRect = card ? card.getBoundingClientRect() : null;
          const lanjutBtn = Array.from(document.querySelectorAll("button")).find((b) => b.textContent.includes("Lanjut"));
          const lanjutRect = lanjutBtn ? lanjutBtn.getBoundingClientRect() : null;

          return {
            windowInnerWidth: window.innerWidth,
            windowInnerHeight: window.innerHeight,
            htmlScrollWidth: doc.scrollWidth,
            htmlScrollHeight: doc.scrollHeight,
            hasHorizontalOverflow: doc.scrollWidth > window.innerWidth,
            horizontalOverflowPx: Math.max(0, doc.scrollWidth - window.innerWidth),
            hasVerticalOverflow: doc.scrollHeight > window.innerHeight,
            verticalOverflowPx: Math.max(0, doc.scrollHeight - window.innerHeight),
            cardHeight: cardRect ? Math.round(cardRect.height) : null,
            cardBottom: cardRect ? Math.round(cardRect.bottom) : null,
            isLanjutClipped: lanjutRect ? lanjutRect.bottom > window.innerHeight : false,
          };
        });
        vpData.step1SmaLayout = s1SmaLayout;

        if (s1SmaLayout.hasHorizontalOverflow) {
          vpData.failures.push(
            `Step 1 SMA horizontal scrollbar: scrollWidth (${s1SmaLayout.htmlScrollWidth}px) > innerWidth (${s1SmaLayout.windowInnerWidth}px) by ${s1SmaLayout.horizontalOverflowPx}px`
          );
        }

        // Logo check on Step 1
        const s1Logos = await page.evaluate(() => {
          const all = Array.from(document.querySelectorAll("*"));
          return all
            .filter((el) => el.children.length === 0 && el.textContent && el.textContent.trim().toUpperCase() === "KARSA")
            .map((el) => {
              const rect = el.getBoundingClientRect();
              return {
                tag: el.tagName,
                x: Math.round(rect.x),
                y: Math.round(rect.y),
                isTopLeft: rect.x < 250 && rect.y < 150,
              };
            });
        });
        vpData.step1SmaLogoCheck = {
          totalKarsaElements: s1Logos.length,
          logos: s1Logos,
          hasTopLeftLogo: s1Logos.some((l) => l.isTopLeft),
        };

        if (s1Logos.some((l) => l.isTopLeft)) {
          vpData.failures.push(`Duplicate/orphaned KARSA logo detected in top-left region on Step 1: ${JSON.stringify(s1Logos)}`);
        }

        // Screenshot Step 1 SMA
        const shotStep1Sma = path.join(OUT_DIR, `${vp.name}_step1_sma.png`);
        await page.screenshot({ path: shotStep1Sma });
        console.log(`[${vp.name}] Saved screenshot: ${shotStep1Sma}`);

        // --- 5. Step 1 Interaction: Tier 1 Switch to SMP & Sub-Class Chips ---
        console.log(`[${vp.name}] Testing Tier 1 tab switch to SMP and sub-class selection...`);
        const tabSmp = await page.$("#tab-smp");
        const tabSma = await page.$("#tab-sma");
        if (!tabSmp || !tabSma) {
          vpData.failures.push("Missing #tab-smp or #tab-sma");
        } else {
          // Test elementFromPoint on SMP Tab
          const smpBbox = await tabSmp.boundingBox();
          const topElSmp = await page.evaluate(
            ({ x, y }) => {
              const el = document.elementFromPoint(x, y);
              return { id: el?.id, tag: el?.tagName, text: el?.textContent?.trim().slice(0, 20) };
            },
            { x: smpBbox.x + smpBbox.width / 2, y: smpBbox.y + smpBbox.height / 2 }
          );

          vpData.step1Interactivity.tabSmpTopElement = topElSmp;
          if (!topElSmp.id?.includes("tab-smp") && !topElSmp.text?.includes("SMP")) {
            vpData.failures.push(`SMP tab obstructed: ${JSON.stringify(topElSmp)}`);
          }

          // Switch to SMP
          await page.click("#tab-smp");
          await page.waitForTimeout(500);

          // Measure Step 1 SMP Layout
          const s1SmpLayout = await page.evaluate(() => {
            const doc = document.documentElement;
            return {
              windowInnerWidth: window.innerWidth,
              windowInnerHeight: window.innerHeight,
              htmlScrollWidth: doc.scrollWidth,
              htmlScrollHeight: doc.scrollHeight,
              hasHorizontalOverflow: doc.scrollWidth > window.innerWidth,
              horizontalOverflowPx: Math.max(0, doc.scrollWidth - window.innerWidth),
              hasVerticalOverflow: doc.scrollHeight > window.innerHeight,
              verticalOverflowPx: Math.max(0, doc.scrollHeight - window.innerHeight),
            };
          });
          vpData.step1SmpLayout = s1SmpLayout;

          if (s1SmpLayout.hasHorizontalOverflow) {
            vpData.failures.push(`Step 1 SMP horizontal scrollbar: scrollWidth > innerWidth (+${s1SmpLayout.horizontalOverflowPx}px)`);
          }

          // Screenshot Step 1 SMP
          const shotStep1Smp = path.join(OUT_DIR, `${vp.name}_step1_smp.png`);
          await page.screenshot({ path: shotStep1Smp });

          // Click Kelas 8 Chip
          console.log(`[${vp.name}] Clicking 'Kelas 8' chip in SMP Tier...`);
          const k8Btn = await page.$("button:has-text('Kelas 8')");
          if (!k8Btn) {
            vpData.failures.push("Missing 'Kelas 8' button under SMP tier");
          } else {
            const k8Bbox = await k8Btn.boundingBox();
            const topElK8 = await page.evaluate(
              ({ x, y }) => {
                const el = document.elementFromPoint(x, y);
                return { tag: el?.tagName, text: el?.textContent?.trim().slice(0, 30) };
              },
              { x: k8Bbox.x + k8Bbox.width / 2, y: k8Bbox.y + k8Bbox.height / 2 }
            );

            vpData.step1Interactivity.kelas8TopElement = topElK8;
            if (!topElK8.text?.includes("Kelas 8")) {
              vpData.failures.push(`'Kelas 8' chip obstructed: ${JSON.stringify(topElK8)}`);
            }

            await page.click("button:has-text('Kelas 8')");
            await page.waitForTimeout(400);

            const isK8Checked = await page.evaluate(() => {
              const chips = Array.from(document.querySelectorAll('[role="radio"]'));
              const k8 = chips.find((c) => c.textContent.includes("Kelas 8"));
              return k8 ? k8.getAttribute("aria-checked") === "true" : false;
            });

            vpData.step1SmpKelas8.isK8Selected = isK8Checked;
            if (!isK8Checked) {
              vpData.failures.push("'Kelas 8' aria-checked was not set to true after click");
            }

            // Screenshot Step 1 SMP Kelas 8
            const shotStep1SmpK8 = path.join(OUT_DIR, `${vp.name}_step1_smp_kelas8.png`);
            await page.screenshot({ path: shotStep1SmpK8 });

            // Test Category Memory: Switch to SMA then back to SMP
            await page.click("#tab-sma");
            await page.waitForTimeout(400);
            await page.click("#tab-smp");
            await page.waitForTimeout(400);

            const isK8Remembered = await page.evaluate(() => {
              const chips = Array.from(document.querySelectorAll('[role="radio"]'));
              const k8 = chips.find((c) => c.textContent.includes("Kelas 8"));
              return k8 ? k8.getAttribute("aria-checked") === "true" : false;
            });
            vpData.step1SmpKelas8.isK8Remembered = isK8Remembered;
            if (!isK8Remembered) {
              vpData.failures.push("Category Memory failed: 'Kelas 8' was forgotten after toggling tabs");
            }
          }
        }

        // --- 6. Navigation: Lanjut to Step 2 and Back to Step 0 ---
        console.log(`[${vp.name}] Testing forward and back navigation buttons...`);
        const lanjutBtn = await page.$("button:has-text('Lanjut')");
        if (lanjutBtn) {
          await lanjutBtn.scrollIntoViewIfNeeded();
          await lanjutBtn.click();
          await page.waitForTimeout(600);

          const isStep2 = await page.evaluate(() => {
            return (
              document.body.textContent.includes("Bidang apa yang ingin kamu coba") ||
              document.body.textContent.includes("Keahlian yang Sudah Dimiliki")
            );
          });
          vpData.step2Reached = isStep2;
          if (!isStep2) {
            vpData.failures.push("Failed to advance to Step 2 upon clicking 'Lanjut'");
          } else {
            const shotStep2 = path.join(OUT_DIR, `${vp.name}_step2.png`);
            await page.screenshot({ path: shotStep2 });
            console.log(`[${vp.name}] Saved screenshot: ${shotStep2}`);

            // Click Kembali from Step 2 to Step 1
            const kembaliBtnStep2 = await page.$("button:has-text('Kembali')");
            if (kembaliBtnStep2) {
              await kembaliBtnStep2.scrollIntoViewIfNeeded();
              await kembaliBtnStep2.click();
              await page.waitForTimeout(500);

              // Click Kembali from Step 1 to Step 0
              const kembaliBtnStep1 = await page.$("button:has-text('Kembali')");
              if (kembaliBtnStep1) {
                await kembaliBtnStep1.scrollIntoViewIfNeeded();
                await kembaliBtnStep1.click();
                await page.waitForTimeout(500);

                const returnedToStep0 = await page.evaluate(() => {
                  return document.body.textContent.includes("Mulai perjalanan");
                });
                vpData.backNavigationSuccess = returnedToStep0;
                if (!returnedToStep0) {
                  vpData.failures.push("Failed to return to Step 0 via 'Kembali' button from Step 1");
                }
              } else {
                vpData.failures.push("Missing 'Kembali' button on Step 1");
              }
            } else {
              vpData.failures.push("Missing 'Kembali' button on Step 2");
            }
          }
        } else {
          vpData.failures.push("Missing 'Lanjut' button on Step 1");
        }

      } catch (err) {
        console.error(`[${vp.name}] Error during execution:`, err.message);
        vpData.failures.push(`Execution error: ${err.message}`);
      } finally {
        vpData.passed = vpData.failures.length === 0;
        if (!vpData.passed) {
          summaryResults.allPassed = false;
          summaryResults.findings.push(...vpData.failures.map((f) => `[${vp.name}] ${f}`));
        }
        summaryResults.viewports[vp.name] = vpData;
        console.log(`[${vp.name}] Viewport Verdict: ${vpData.passed ? "PASS ✅" : "FAIL ❌"}`);
        if (vpData.failures.length > 0) {
          console.log(`[${vp.name}] Failures:\n  - ${vpData.failures.join("\n  - ")}`);
        }
        await context.close();
      }
    }
  } catch (fatalErr) {
    console.error("[FATAL ERROR in stress test]:", fatalErr);
    summaryResults.allPassed = false;
    summaryResults.findings.push(`Fatal test runner error: ${fatalErr.message}`);
  } finally {
    if (browser) await browser.close();
    if (serverProc) {
      console.log("[SERVER] Shutting down dev server...");
      serverProc.kill();
    }
  }

  // Save metrics to JSON
  const metricsFile = path.join(OUT_DIR, "stress_test_metrics.json");
  fs.writeFileSync(metricsFile, JSON.stringify(summaryResults, null, 2), "utf-8");
  console.log(`\n==================================================================`);
  console.log(`ALL TESTS FINISHED. Overall: ${summaryResults.allPassed ? "PASS ✅" : "FAIL ❌"}`);
  console.log(`Metrics written to: ${metricsFile}`);
  console.log(`==================================================================\n`);

  return summaryResults;
}

runEmpiricalStressTest().catch((e) => {
  console.error("Top-level execution error:", e);
  process.exit(1);
});
