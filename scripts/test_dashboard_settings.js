const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

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

  await page.addInitScript((st) => {
    localStorage.setItem('karsa_demo_state_v1', JSON.stringify(st));
  }, fullState);

  await page.goto('http://localhost:3000');
  await page.waitForTimeout(2000);

  // Take closed screenshot
  await page.screenshot({ path: 'C:/Users/laptop~1/.gemini/antigravity/brain/0ee2fdb3-c39f-4720-b06f-3673e621ad0c/dashboard_settings_closed.png' });

  // Click Settings button in header
  await page.evaluate(() => {
    const btn = document.querySelector('button[title="Pengaturan & Menu"]');
    if (btn) btn.click();
  });
  await page.waitForTimeout(1000);

  // Take open dropdown screenshot
  await page.screenshot({ path: 'C:/Users/laptop~1/.gemini/antigravity/brain/0ee2fdb3-c39f-4720-b06f-3673e621ad0c/dashboard_settings_open_stable.png' });

  await browser.close();
  console.log('Dashboard screenshots saved!');
})();
