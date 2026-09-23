const playwright = require('playwright');

(async () => {
  const browser = await playwright.chromium.launch();
  const context = await browser.newContext();
  
  // Pre-seed localStorage before page load
  await context.addInitScript(() => {
    window.localStorage.setItem('karsa_demo_state_v1', JSON.stringify({
      onboardingStep: 4,
      profile: { name: 'Student', targetPTN: 'ITB', targetMajor: 'STEI', classLevel: '12', isCompleted: true },
      ftuxPhase: 'completed',
      ftuxCompleted: true,
      activePersona: null,
      activeComingSoon: null,
      pendingInitialText: null,
      celebratingPersona: null
    }));
  });

  const page = await context.newPage();
  
  // Set Desktop Viewport
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'verify_desktop_dashboard.png' });
  console.log('Desktop dashboard screenshot saved!');

  // Set Mobile Viewport
  await page.setViewportSize({ width: 375, height: 812 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'verify_mobile_dashboard.png' });
  console.log('Mobile dashboard screenshot saved!');

  await browser.close();
})();
