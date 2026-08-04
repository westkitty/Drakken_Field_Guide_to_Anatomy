import puppeteer from 'puppeteer';

const baseUrl = process.env.DRAKKEN_AUDIT_URL ?? 'http://127.0.0.1:4173';
const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--use-gl=swiftshader'],
});
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
const url = new URL(baseUrl);
url.searchParams.set('audit', '1');
await page.goto(url.toString(), { waitUntil: 'domcontentloaded', timeout: 30_000 });
await page.waitForSelector('canvas', { visible: true, timeout: 30_000 });
await page.keyboard.press('t');
await page.waitForFunction(() => document.querySelector('#tools-drawer')?.classList.contains('is-open'));
await new Promise((resolve) => setTimeout(resolve, 250));
const geometry = await page.evaluate(() => {
  const panel = document.querySelector('#tools-drawer');
  const rect = panel.getBoundingClientRect();
  const style = getComputedStyle(panel);
  return {
    rect: { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, width: rect.width, height: rect.height },
    viewport: { innerWidth: window.innerWidth, innerHeight: window.innerHeight, clientWidth: document.documentElement.clientWidth, clientHeight: document.documentElement.clientHeight },
    computed: { top: style.top, right: style.right, bottom: style.bottom, left: style.left, width: style.width, height: style.height, transform: style.transform, boxSizing: style.boxSizing, padding: style.padding, border: style.border },
  };
});
console.log(`MOBILE_TOOLS_GEOMETRY=${JSON.stringify(geometry)}`);
await browser.close();
