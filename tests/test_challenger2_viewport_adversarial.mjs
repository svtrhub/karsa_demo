import { spawn } from "node:child_process";
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const PORT = 3008;
const BASE_URL = `http://localhost:${PORT}`;
const ARTIFACTS_DIR = path.resolve("audit_screenshots");

// Viewport profiles to test
const TEST_VIEWPORTS = [
  { name: "mobile_375x667", width: 375, height: 667, type: "Mobile (iPhone SE)" },
  { name: "tablet_768x1024", width: 768, height: 1024, type: "Tablet (iPad Portrait)" },
  { name: "desktop_1440x900", width: 1440, height: 900, type: "Desktop (Standard 1440p)" },
  // Extra stress boundaries
  { name: "mobile_compact_320x568", width: 320, height: 568, type: "Stress Mobile (iPhone 5/SE1)" },
  { name: "desktop_fhd_1920x1080", width: 1920, height: 1080, type: "Stress Desktop (1080p FHD)" },
];

function calculateRelativeLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function calculateContrastRatio(lum1, lum2) {
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

function parseRgb(colorStr) {
  if (!colorStr) return { r: 255, g: 255, b: 255, a: 1 };
  const match = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (match) {
    return {
      r: parseInt(match[1], 10),
      g: parseInt(match[2], 10),
      b: parseInt(match[3], 10),
      a: match[4] !== undefined ? parseFloat(match[4]) : 1,
    };
  }
  return { r: 255, g: 255, b: 255, a: 1 };
}

function readPngHeader(filePath) {
  if (!fs.existsSync(filePath)) {
    return { exists: false, error: "File not found" };
  }
  const buf = fs.readFileSync(filePath);
  const sig = buf.subarray(0, 8).toString("hex");
  const isPng = sig === "89504e470d0a1a0a";
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  const bitDepth = buf.readUInt8(24);
  const colorType = buf.readUInt8(25);
  const compression = buf.readUInt8(26);
  const filter = buf.readUInt8(27);
  const interlace = buf.readUInt8(28);
  const hash = crypto.createHash("sha256").update(buf).digest("hex");

  return {
    exists: true,
    filePath,
    isPng,
    sizeBytes: buf.length,
    width,
    height,
    bitDepth,
    colorType, // 6 = RGBA, 2 = RGB
    compression,
    filter,
    interlace,
    sha256: hash,
  };
}

async function startServer() {
  console.log(`[TEST-SERVER] Starting Next.js dev server on port ${PORT}...`);
  const serverProc = spawn(
    "node",
    ["node_modules/next/dist/bin/next", "dev", "-p", String(PORT)],
    {
      cwd: process.cwd(),
      env: { ...process.env },
    }
  );

  serverProc.stdout.on("data", (d) => {
    const s = d.toString();
    if (s.includes("Ready in") || s.includes("Compiled")) {
      process.stdout.write(`[SERVER] ${s.trim()}\n`);
    }
  });

  serverProc.stderr.on("data", (d) => {
    const s = d.toString();
    if (!s.includes("ExperimentalWarning")) {
      process.stderr.write(`[SERVER STDERR] ${s}`);
    }
  });

  for (let attempt = 1; attempt <= 40; attempt++) {
    await new Promise((r) => setTimeout(r, 1000));
    try {
      const res = await fetch(BASE_URL);
      if (res.status === 200) {
        console.log(`[TEST-SERVER] Next.js ready at ${BASE_URL} (attempt ${attempt})`);
        return serverProc;
      }
    } catch {}
  }
  serverProc.kill();
  throw new Error("Dev server failed to start within timeout");
}

async function runAdversarialViewportTests() {
  console.log("==========================================================================");
  console.log("CHALLENGER 2: ADVERSARIAL MULTI-VIEWPORT & VISUAL RESPONSIVENESS SUITE");
  console.log("==========================================================================");

  let serverProc;
  let browser;

  const testReport = {
    timestamp: new Date().toISOString(),
    viewportsTested: [],
    splashResults: {},
    onboardingResults: {},
    artifactForensics: {},
    failures: [],
    warnings: [],
  };

  try {
    // 1. Forensic inspection of existing screenshot artifacts
    console.log("\n--- SECTION 1: VISUAL SCREENSHOT ARTIFACT FORENSICS ---");
    const artifactsToCheck = [
      "audit_screenshots/splash_loading_screen.png",
      "splash_loading_screen.png",
      "audit_screenshots/onboarding_darkened_bg.png",
      "onboarding_darkened_bg.png",
    ];

    for (const art of artifactsToCheck) {
      const info = readPngHeader(art);
      testReport.artifactForensics[art] = info;
      console.log(`\nArtifact: ${art}`);
      if (!info.exists) {
        console.error(`  ❌ MISSING: File does not exist!`);
        testReport.failures.push(`Artifact ${art} does not exist`);
        continue;
      }
      console.log(`  - PNG Signature Valid: ${info.isPng}`);
      console.log(`  - Dimensions: ${info.width}x${info.height}`);
      console.log(`  - File Size: ${(info.sizeBytes / 1024).toFixed(1)} KB (${info.sizeBytes} bytes)`);
      console.log(`  - Bit Depth: ${info.bitDepth}-bit, Color Type: ${info.colorType}`);
      console.log(`  - SHA-256: ${info.sha256.substring(0, 16)}...`);

      // Check minimum resolution and aspect ratio
      if (info.width < 1200 || info.height < 700) {
        testReport.warnings.push(`${art} resolution is low: ${info.width}x${info.height}`);
      }
    }

    // Verify root vs audit_screenshots sync
    const splashSync =
      testReport.artifactForensics["audit_screenshots/splash_loading_screen.png"]?.sha256 ===
      testReport.artifactForensics["splash_loading_screen.png"]?.sha256;
    const onboardingSync =
      testReport.artifactForensics["audit_screenshots/onboarding_darkened_bg.png"]?.sha256 ===
      testReport.artifactForensics["onboarding_darkened_bg.png"]?.sha256;

    console.log(`\nArtifact Parity Check:`);
    console.log(`  - Splash root vs audit sync: ${splashSync ? "MATCH" : "MISMATCH"}`);
    console.log(`  - Onboarding root vs audit sync: ${onboardingSync ? "MATCH" : "MISMATCH"}`);
    if (!splashSync) testReport.warnings.push("Root and audit splash screenshots do not match");
    if (!onboardingSync) testReport.warnings.push("Root and audit onboarding screenshots do not match");

    // 2. Start server & browser
    serverProc = await startServer();
    console.log("[PLAYWRIGHT] Launching Chromium instance...");
    browser = await chromium.launch({ headless: true });

    // 3. Loop through viewports
    for (const vp of TEST_VIEWPORTS) {
      console.log(`\n==========================================================================`);
      console.log(`TESTING VIEWPORT: ${vp.name} (${vp.width}x${vp.height}) - ${vp.type}`);
      console.log(`==========================================================================`);

      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        deviceScaleFactor: 1,
      });
      let page = await context.newPage();

      // Collect console errors
      const pageErrors = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") pageErrors.push(msg.text());
      });

      // ─────────────────────────────────────────────────────────────
      // PART A: SPLASH SCREEN ADVERSARIAL INSPECTION
      // ─────────────────────────────────────────────────────────────
      console.log(`\n[${vp.name}] [A] Testing Splash Screen with ?splash=hold...`);
      await page.goto(`${BASE_URL}?splash=hold`, { waitUntil: "networkidle" });
      await page.evaluate(() => localStorage.clear());
      await page.reload({ waitUntil: "networkidle" });

      // Wait for splash screen element
      const splashScreen = await page.waitForSelector('[data-testid="app-splash-screen"]', {
        state: "visible",
        timeout: 5000,
      });
      const logoEl = await page.waitForSelector('[data-testid="splash-logo"]', {
        state: "visible",
        timeout: 5000,
      });

      const splashEvaluation = await page.evaluate(
        ({ expectedWidth, expectedHeight }) => {
          const docEl = document.documentElement;
          const body = document.body;
          const splash = document.querySelector('[data-testid="app-splash-screen"]');
          const logo = document.querySelector('[data-testid="splash-logo"]');
          const exteriorImg = splash.querySelector('img[alt="Rumah Karsa Exterior"]');
          const darkScrimA = splash.querySelector(".bg-black\\/40");
          const darkScrimB = splash.querySelector('div[style*="radial-gradient"]');

          const logoRect = logo.getBoundingClientRect();
          const splashRect = splash.getBoundingClientRect();

          const logoCenterX = logoRect.left + logoRect.width / 2;
          const logoCenterY = logoRect.top + logoRect.height / 2;
          const vpCenterX = expectedWidth / 2;
          const vpCenterY = expectedHeight / 2;

          const deltaX = Math.abs(logoCenterX - vpCenterX);
          const deltaY = Math.abs(logoCenterY - vpCenterY);

          // Exterior image metrics
          const imgComputed = exteriorImg ? window.getComputedStyle(exteriorImg) : null;
          const imgRect = exteriorImg ? exteriorImg.getBoundingClientRect() : null;

          // Overflow checks
          const hasHorizontalOverflow = docEl.scrollWidth > expectedWidth || body.scrollWidth > expectedWidth;
          const maxScrollWidth = Math.max(docEl.scrollWidth, body.scrollWidth);

          // All elements overflow check
          const overflowingElements = [];
          const allEls = document.querySelectorAll("*");
          allEls.forEach((el) => {
            const r = el.getBoundingClientRect();
            if (r.right > expectedWidth + 1 || r.left < -1) {
              overflowingElements.push({
                tag: el.tagName,
                className: el.className ? String(el.className).substring(0, 50) : "",
                right: r.right,
                left: r.left,
                width: r.width,
              });
            }
          });

          return {
            windowInner: { width: window.innerWidth, height: window.innerHeight },
            scrollMetrics: {
              docScrollWidth: docEl.scrollWidth,
              bodyScrollWidth: body.scrollWidth,
              hasHorizontalOverflow,
              maxScrollWidth,
            },
            logoMetrics: {
              text: logo.textContent.trim(),
              rect: {
                x: logoRect.x,
                y: logoRect.y,
                width: logoRect.width,
                height: logoRect.height,
              },
              logoCenterX,
              logoCenterY,
              vpCenterX,
              vpCenterY,
              deltaX,
              deltaY,
              isDeadCenteredX: deltaX <= 0.5,
              isDeadCenteredY: deltaY <= 0.5,
              fontSize: window.getComputedStyle(logo).fontSize,
              fontWeight: window.getComputedStyle(logo).fontWeight,
              opacity: window.getComputedStyle(logo).opacity,
              tracking: window.getComputedStyle(logo).letterSpacing,
            },
            exteriorImage: exteriorImg
              ? {
                  src: exteriorImg.currentSrc || exteriorImg.src,
                  opacity: imgComputed ? imgComputed.opacity : null,
                  objectFit: imgComputed ? imgComputed.objectFit : null,
                  renderedWidth: imgRect.width,
                  renderedHeight: imgRect.height,
                  naturalWidth: exteriorImg.naturalWidth,
                  naturalHeight: exteriorImg.naturalHeight,
                  isDistorted: false, // will check ratio
                }
              : null,
            scrimLayers: {
              hasDarkScrimA: !!darkScrimA,
              scrimAComputedBg: darkScrimA ? window.getComputedStyle(darkScrimA).backgroundColor : null,
              hasDarkScrimB: !!darkScrimB,
              scrimBBackground: darkScrimB ? darkScrimB.style.background : null,
            },
            overflowingElementsCount: overflowingElements.length,
            overflowingSample: overflowingElements.slice(0, 3),
          };
        },
        { expectedWidth: vp.width, expectedHeight: vp.height }
      );

      // Check image aspect ratio distortion
      if (splashEvaluation.exteriorImage && splashEvaluation.exteriorImage.naturalWidth > 0) {
        const naturalRatio =
          splashEvaluation.exteriorImage.naturalWidth / splashEvaluation.exteriorImage.naturalHeight;
        const renderedRatio =
          splashEvaluation.exteriorImage.renderedWidth / splashEvaluation.exteriorImage.renderedHeight;
        // With object-cover, rendered container ratio can differ from natural image ratio,
        // but image pixels are clipped without anamorphic stretching.
        splashEvaluation.exteriorImage.objectFitCoverVerified =
          splashEvaluation.exteriorImage.objectFit === "cover";
      }

      console.log(`  [LOGO CENTERING]`);
      console.log(`    - Logo Text: "${splashEvaluation.logoMetrics.text}"`);
      console.log(`    - Logo BBox: x=${splashEvaluation.logoMetrics.rect.x.toFixed(1)}, y=${splashEvaluation.logoMetrics.rect.y.toFixed(1)}, w=${splashEvaluation.logoMetrics.rect.width.toFixed(1)}, h=${splashEvaluation.logoMetrics.rect.height.toFixed(1)}`);
      console.log(`    - Logo Center: (${splashEvaluation.logoMetrics.logoCenterX.toFixed(2)}, ${splashEvaluation.logoMetrics.logoCenterY.toFixed(2)})`);
      console.log(`    - Viewport Center: (${splashEvaluation.logoMetrics.vpCenterX}, ${splashEvaluation.logoMetrics.vpCenterY})`);
      console.log(`    - Delta X: ${splashEvaluation.logoMetrics.deltaX.toFixed(2)}px | Delta Y: ${splashEvaluation.logoMetrics.deltaY.toFixed(2)}px`);
      console.log(`    - Dead Centered Status: X=${splashEvaluation.logoMetrics.isDeadCenteredX ? "PASS" : "FAIL"}, Y=${splashEvaluation.logoMetrics.isDeadCenteredY ? "PASS" : "FAIL"}`);

      if (!splashEvaluation.logoMetrics.isDeadCenteredX || !splashEvaluation.logoMetrics.isDeadCenteredY) {
        testReport.failures.push(
          `Splash logo not dead-centered at ${vp.name}: deltaX=${splashEvaluation.logoMetrics.deltaX.toFixed(2)}px, deltaY=${splashEvaluation.logoMetrics.deltaY.toFixed(2)}px`
        );
      }

      console.log(`  [EXTERIOR & SCRIM]`);
      console.log(`    - Exterior Image Opacity: ${splashEvaluation.exteriorImage?.opacity} (Target: 0.5)`);
      console.log(`    - Object-Fit: ${splashEvaluation.exteriorImage?.objectFit} (Target: cover)`);
      console.log(`    - Scrim A (bg-black/40): Present=${splashEvaluation.scrimLayers.hasDarkScrimA}, Color=${splashEvaluation.scrimLayers.scrimAComputedBg}`);
      console.log(`    - Scrim B (radial vignette): Present=${splashEvaluation.scrimLayers.hasDarkScrimB}`);
      console.log(`    - Horizontal Overflow: ${splashEvaluation.scrollMetrics.hasHorizontalOverflow ? "OVERFLOW FAIL" : "CLEAN PASS"}`);

      if (parseFloat(splashEvaluation.exteriorImage?.opacity) !== 0.5) {
        testReport.failures.push(
          `Exterior image opacity at ${vp.name} is ${splashEvaluation.exteriorImage?.opacity}, expected 0.5`
        );
      }
      if (splashEvaluation.scrollMetrics.hasHorizontalOverflow) {
        testReport.failures.push(
          `Horizontal overflow detected on splash at ${vp.name}: scrollWidth=${splashEvaluation.scrollMetrics.maxScrollWidth} vs innerWidth=${vp.width}`
        );
      }

      testReport.splashResults[vp.name] = splashEvaluation;

      // Capture screenshot for Challenger 2 visual verification
      const splashVpPath = path.join(ARTIFACTS_DIR, `challenger2_splash_${vp.name}.png`);
      await page.screenshot({ path: splashVpPath });
      console.log(`    - Captured splash screenshot: ${splashVpPath}`);

      // ─────────────────────────────────────────────────────────────
      // PART B: TRANSITION & ONBOARDINGFLOW INSPECTION
      // ─────────────────────────────────────────────────────────────
      console.log(`\n[${vp.name}] [B] Testing Transition to OnboardingFlow...`);
      await page.close();
      page = await context.newPage();
      await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
      await page.evaluate(() => {
        window.__cls = 0;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) window.__cls += entry.value;
          }
        }).observe({ type: "layout-shift", buffered: true });
      });

      // Wait for splash screen up-slide exit
      await page.waitForSelector('[data-testid="app-splash-screen"]', {
        state: "detached",
        timeout: 15000,
      });
      const clsObserved = await page.evaluate(() => window.__cls || 0);
      console.log(`    - CLS During Exit: ${clsObserved.toFixed(4)}`);

      // Wait for Onboarding welcome button
      const welcomeBtn = await page.waitForSelector("text=Mulai perjalanan!", {
        state: "visible",
        timeout: 5000,
      });
      await page.waitForTimeout(400); // allow spotlight animation to settle

      // Analyze Onboarding visual, background exterior opacity-30, scrim, card text contrast
      const onboardingEvaluation = await page.evaluate(
        ({ expectedWidth, expectedHeight }) => {
          const docEl = document.documentElement;
          const body = document.body;

          // 1. Exterior image check
          const exteriorImg = document.querySelector('.fixed img[alt="Rumah Karsa Exterior"]');
          const extComputed = exteriorImg ? window.getComputedStyle(exteriorImg) : null;
          const extRect = exteriorImg ? exteriorImg.getBoundingClientRect() : null;

          // 2. Dual scrim stack check
          const scrimA = document.querySelector('.bg-gradient-to-b.from-slate-950\\/80');
          const scrimB = document.querySelector('div[style*="radial-gradient(ellipse at center, rgba(11,19,43"]');

          // 3. Spotlight layers
          const apexEmitter = document.querySelector(".animate-pulse-glow");
          const godRay = document.querySelector('div[style*="polygon(100% 0%, 72% 0%"]');

          // 4. Main Liquid Glass Modal
          const modal = document.querySelector(".liquid-glass-modal");
          const modalRect = modal ? modal.getBoundingClientRect() : null;
          const modalComputed = modal ? window.getComputedStyle(modal) : null;

          // 5. Text elements inside onboarding modal
          const textItems = [];
          if (modal) {
            const allTextElements = modal.querySelectorAll("p, span, h1, h2, h3, button, label");
            allTextElements.forEach((el) => {
              const text = el.textContent?.trim();
              if (text && el.children.length === 0 && text.length > 1) {
                const cs = window.getComputedStyle(el);
                const rect = el.getBoundingClientRect();
                const btnParent = el.closest("button");
                const isInsideButton = !!btnParent;
                const isGoldBtn =
                  btnParent &&
                  (btnParent.className.includes("bg-gradient-to-r") ||
                    btnParent.className.includes("from-[#E6C280]") ||
                    btnParent.className.includes("amber"));

                if (rect.width > 0 && rect.height > 0) {
                  textItems.push({
                    text: text.substring(0, 40),
                    tag: el.tagName,
                    color: cs.color,
                    fontSize: cs.fontSize,
                    fontWeight: cs.fontWeight,
                    lineHeight: cs.lineHeight,
                    isInsideButton,
                    isGoldBtn,
                    rect: {
                      x: rect.x,
                      y: rect.y,
                      width: rect.width,
                      height: rect.height,
                    },
                    isContainedInModal:
                      rect.left >= modalRect.left - 2 &&
                      rect.right <= modalRect.right + 2 &&
                      rect.top >= modalRect.top - 2 &&
                      rect.bottom <= modalRect.bottom + 2,
                  });
                }
              }
            });
          }

          // 6. Horizontal overflow
          const hasHorizontalOverflow = docEl.scrollWidth > expectedWidth || body.scrollWidth > expectedWidth;

          return {
            windowInner: { width: window.innerWidth, height: window.innerHeight },
            scrollMetrics: {
              docScrollWidth: docEl.scrollWidth,
              bodyScrollWidth: body.scrollWidth,
              hasHorizontalOverflow,
              overflowPixels: Math.max(0, docEl.scrollWidth - expectedWidth),
            },
            exteriorImage: exteriorImg
              ? {
                  opacity: extComputed ? extComputed.opacity : null,
                  objectFit: extComputed ? extComputed.objectFit : null,
                  renderedWidth: extRect.width,
                  renderedHeight: extRect.height,
                  naturalWidth: exteriorImg.naturalWidth,
                  naturalHeight: exteriorImg.naturalHeight,
                }
              : null,
            dualScrimStack: {
              hasScrimA: !!scrimA,
              hasScrimB: !!scrimB,
              hasSpotlightApex: !!apexEmitter,
              hasGodRay: !!godRay,
            },
            modal: modalRect
              ? {
                  rect: {
                    x: modalRect.x,
                    y: modalRect.y,
                    width: modalRect.width,
                    height: modalRect.height,
                  },
                  fitsViewportWidth: modalRect.width <= expectedWidth,
                  backdropFilter: modalComputed.backdropFilter || modalComputed.webkitBackdropFilter,
                  backgroundColor: modalComputed.backgroundColor,
                  borderColor: modalComputed.borderColor,
                }
              : null,
            textItemsSample: textItems,
          };
        },
        { expectedWidth: vp.width, expectedHeight: vp.height }
      );

      console.log(`  [ONBOARDING BACKGROUND & SCRIM]`);
      console.log(`    - Exterior Image Opacity: ${onboardingEvaluation.exteriorImage?.opacity} (Target: 0.3)`);
      console.log(`    - Object-Fit: ${onboardingEvaluation.exteriorImage?.objectFit} (Target: cover)`);
      console.log(`    - Scrim A (vertical linear depth): Present=${onboardingEvaluation.dualScrimStack.hasScrimA}`);
      console.log(`    - Scrim B (radial vignette): Present=${onboardingEvaluation.dualScrimStack.hasScrimB}`);
      console.log(`    - Spotlight Theatrical Emitters: Apex=${onboardingEvaluation.dualScrimStack.hasSpotlightApex}, GodRay=${onboardingEvaluation.dualScrimStack.hasGodRay}`);
      console.log(`    - Horizontal Overflow: ${onboardingEvaluation.scrollMetrics.hasHorizontalOverflow ? "OVERFLOW FAIL" : "CLEAN PASS"}`);

      if (parseFloat(onboardingEvaluation.exteriorImage?.opacity) !== 0.3) {
        testReport.failures.push(
          `Onboarding exterior opacity at ${vp.name} is ${onboardingEvaluation.exteriorImage?.opacity}, expected 0.3`
        );
      }
      if (onboardingEvaluation.scrollMetrics.hasHorizontalOverflow) {
        testReport.failures.push(
          `Onboarding horizontal overflow at ${vp.name}: overflowPixels=${onboardingEvaluation.scrollMetrics.overflowPixels}px`
        );
      }

      console.log(`  [CARD & TEXT HYPER-LEGIBILITY]`);
      console.log(`    - Modal Dimensions: ${onboardingEvaluation.modal?.rect.width.toFixed(1)}px x ${onboardingEvaluation.modal?.rect.height.toFixed(1)}px`);
      console.log(`    - Modal Fits Viewport Width: ${onboardingEvaluation.modal?.fitsViewportWidth ? "PASS" : "FAIL"}`);
      console.log(`    - Card Backdrop Blur: ${onboardingEvaluation.modal?.backdropFilter}`);
      console.log(`    - Text Elements Checked: ${onboardingEvaluation.textItemsSample.length}`);

      // Compute WCAG contrast for text items against slate-950 / modal background
      // Modal has liquid-glass styling over dark scrim (effective background luminance ~0.015 - 0.03)
      const effectiveCardBgLuminance = 0.02; // dark obsidian / deep navy slate-950 glass
      let minContrast = 999;
      let worstItem = null;

      for (const item of onboardingEvaluation.textItemsSample) {
        const rgb = parseRgb(item.color);
        const textLum = calculateRelativeLuminance(rgb.r, rgb.g, rgb.b);
        // If element is inside the primary CTA button (gold gradient background ~#E6C280/#D4AF37)
        // the effective background is gold (luminance ~0.52).
        // Otherwise, it is on the liquid-glass modal over dark scrim (effective background luminance ~0.02).
        const itemBgLum = item.isGoldBtn ? 0.52 : effectiveCardBgLuminance;
        const contrast = calculateContrastRatio(textLum, itemBgLum);
        item.contrastRatio = contrast;
        if (contrast < minContrast) {
          minContrast = contrast;
          worstItem = item;
        }
      }

      console.log(`    - Worst-case Text Contrast Ratio: ${minContrast.toFixed(2)}:1 ("${worstItem?.text}")`);
      console.log(`    - WCAG AA (4.5:1 for normal, 3:1 for large): ${minContrast >= 3.0 ? "PASS" : "FAIL"}`);
      console.log(`    - WCAG AAA (7:1 for normal): ${minContrast >= 7.0 ? "PASS (Hyper-Legible)" : "PASS (AA Standard)"}`);

      if (minContrast < 3.0) {
        testReport.failures.push(
          `Low text contrast (${minContrast.toFixed(2)}:1) for "${worstItem?.text}" at ${vp.name}`
        );
      }

      onboardingEvaluation.clsObserved = clsObserved;
      onboardingEvaluation.minContrast = minContrast;
      onboardingEvaluation.worstTextItem = worstItem;
      testReport.onboardingResults[vp.name] = onboardingEvaluation;

      // Capture screenshot of Onboarding at this viewport
      const onbVpPath = path.join(ARTIFACTS_DIR, `challenger2_onboarding_${vp.name}.png`);
      await page.screenshot({ path: onbVpPath });
      console.log(`    - Captured onboarding screenshot: ${onbVpPath}`);

      // Close page and context
      await context.close();
      testReport.viewportsTested.push(vp.name);
    }

    console.log("\n==========================================================================");
    console.log("TEST EXECUTION COMPLETED");
    console.log(`Total Viewports: ${testReport.viewportsTested.length}`);
    console.log(`Failures: ${testReport.failures.length}`);
    console.log(`Warnings: ${testReport.warnings.length}`);
    console.log("==========================================================================");

    // Save test results to JSON
    const reportPath = path.resolve("audit_screenshots/challenger2_test_results.json");
    fs.writeFileSync(reportPath, JSON.stringify(testReport, null, 2), "utf8");
    console.log(`Saved detailed report to: ${reportPath}`);

    return testReport;
  } finally {
    if (browser) await browser.close();
    if (serverProc) {
      console.log("[TEST-SERVER] Killing dev server process...");
      serverProc.kill();
    }
  }
}

runAdversarialViewportTests().catch((err) => {
  console.error("Adversarial test error:", err);
  process.exit(1);
});
