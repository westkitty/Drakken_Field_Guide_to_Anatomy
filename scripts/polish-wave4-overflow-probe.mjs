import puppeteer from 'puppeteer';

const baseUrl = process.env.DRAKKEN_AUDIT_URL ?? 'http://127.0.0.1:4173';
const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--use-gl=swiftshader'],
});
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
const auditUrl = new URL(baseUrl);
auditUrl.searchParams.set('audit', '1');
await page.goto(auditUrl.toString(), { waitUntil: 'domcontentloaded', timeout: 30_000 });
await page.waitForSelector('canvas', { visible: true, timeout: 30_000 });
await page.keyboard.press('i');
await page.waitForFunction(() => document.querySelector('#record-drawer')?.classList.contains('is-open'), { timeout: 10_000 });
await new Promise((resolve) => setTimeout(resolve, 260));

const state = await page.evaluate(() => {
  const drawer = document.querySelector('#record-drawer');
  const drawerRect = drawer.getBoundingClientRect();
  const offenders = [...drawer.querySelectorAll('*')]
    .map((element) => {
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return {
        tag: element.tagName.toLowerCase(),
        id: element.id,
        className: typeof element.className === 'string' ? element.className : '',
        text: element.textContent?.trim().replace(/\s+/g, ' ').slice(0, 80) ?? '',
        display: style.display,
        position: style.position,
        left: Number(rect.left.toFixed(2)),
        right: Number(rect.right.toFixed(2)),
        width: Number(rect.width.toFixed(2)),
        clientWidth: element.clientWidth,
        scrollWidth: element.scrollWidth,
      };
    })
    .filter((item) => item.right > drawerRect.right + 1 || item.left < drawerRect.left - 1 || item.scrollWidth > item.clientWidth + 1)
    .slice(0, 30);
  return {
    drawer: {
      left: Number(drawerRect.left.toFixed(2)),
      right: Number(drawerRect.right.toFixed(2)),
      width: Number(drawerRect.width.toFixed(2)),
      clientWidth: drawer.clientWidth,
      scrollWidth: drawer.scrollWidth,
    },
    offenders,
  };
});

console.log(`WAVE4_OVERFLOW_PROBE ${JSON.stringify(state)}`);
await browser.close();
if (state.drawer.scrollWidth > state.drawer.clientWidth + 1) process.exitCode = 1;
