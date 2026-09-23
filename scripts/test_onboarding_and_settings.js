const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  // 1. Test Onboarding Step 0 (Spotlight reveal beam + Single logo)
  await page.goto('http://localhost:3000');
  await page.evaluate(() => localStorage.clear());
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'C:/Users/laptop~1/.gemini/antigravity/brain/0ee2fdb3-c39f-4720-b06f-3673e621ad0c/onboarding_step0_spotlight.png' });

  // Advance to Step 1 (Click Mulai Perjalanan)
  await page.click('button:has-text("Mulai perjalanan")');
  await page.waitForTimeout(1000);

  // Take screenshot of 2-tier Segmented Class Selector (Step 1)
  await page.screenshot({ path: 'C:/Users/laptop~1/.gemini/antigravity/brain/0ee2fdb3-c39f-4720-b06f-3673e621ad0c/onboarding_step1_class_selector.png' });

  // 2. Test Main Dashboard with Settings Dropdown Open
  const fullState = {
    profile: {
      nama: "Budi",
      jenjangKelas: "SMA/SMK Kelas 10",
      keahlianSudah: ["Teknologi & Coding"],
      keahlianIngin: ["Sains & Riset (OPSI/OSN)"],
      ritmeBelajar: "30–45 Menit (Fokus)",
      targetTujuan: ["Menang OSN/OPSI"],
      isConsentGiven: true,
      isCompleted: true,
    },
    onboardingStep: 5,
    ftuxCompleted: true,
    ftuxPhase: "done",
    ftuxTourIndex: 0,
    koinBalance: 250,
    hasClaimedBonusCoin: true,
    hasIncrementedFirstChatCoin: false,
    activePersona: null,
    pendingInitialText: null,
    activeComingSoon: null,
    chatThreads: { karsa: [], ara: [], radit: [], sekar: [], arka: [] },
  };

  await page.evaluate((st) => {
    localStorage.setItem('karsa_demo_state_v1', JSON.stringify(st));
  }, fullState);

  await page.reload();
  await page.waitForTimeout(2000);

  // Click Settings button top-right using title selector
  await page.click('button[title="Pengaturan & Menu"]');
  await page.waitForTimeout(1000);

  await page.screenshot({ path: 'C:/Users/laptop~1/.gemini/antigravity/brain/0ee2fdb3-c39f-4720-b06f-3673e621ad0c/dashboard_settings_open_stable.png' });

  await browser.close();
  console.log('All verification screenshots saved successfully!');
})();
