import { chromium } from "playwright";

async function measure() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 375, height: 667 } });
  const page = await context.newPage();
  await page.goto("http://localhost:3000");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForTimeout(600);
  await page.click("text=Mulai perjalanan!");
  await page.waitForTimeout(300);
  await page.click("button:has-text('Mulai Perjalanan')");
  await page.waitForTimeout(600);

  const chips = await page.evaluate(() => {
    const radioBtns = Array.from(document.querySelectorAll('button[role="radio"]'));
    return radioBtns.map((b) => ({
      text: b.innerText.split("\n"),
      offsetHeight: b.offsetHeight,
      children: Array.from(b.children).map((c) => ({
        tag: c.tagName,
        className: c.className,
        offsetHeight: c.offsetHeight,
      })),
    }));
  });
  console.log("CHIP DETAILS:", JSON.stringify(chips, null, 2));

  const cardDetails = await page.evaluate(() => {
    const card = document.querySelector(".liquid-glass-modal");
    const lanjut = Array.from(document.querySelectorAll("button")).find((b) => b.textContent.includes("Lanjut"));
    return {
      windowHeight: window.innerHeight,
      cardRect: card ? card.getBoundingClientRect() : null,
      cardScrollHeight: card ? card.scrollHeight : null,
      cardClientHeight: card ? card.clientHeight : null,
      lanjutRect: lanjut ? lanjut.getBoundingClientRect() : null,
    };
  });
  console.log("CARD DETAILS:", JSON.stringify(cardDetails, null, 2));

  await browser.close();
}

measure().catch(console.error);
