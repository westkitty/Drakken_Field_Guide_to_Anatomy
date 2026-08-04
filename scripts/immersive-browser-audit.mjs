import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer';

const baseUrl = process.env.DRAKKEN_AUDIT_URL ?? 'http://127.0.0.1:4173';
const outputRoot = process.env.DRAKKEN_AUDIT_OUTPUT ?? path.resolve('browser-audit-output');
const screenshots = path.join(outputRoot, 'screenshots');
fs.mkdirSync(screenshots, { recursive: true });

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--enable-precise-memory-info'],
});

const page = await browser.newPage();
const consoleErrors = [];
const pageErrors = [];
page.on('console', (message) => {
  if (message.type() === 'error') consoleErrors.push(message.text());
});
page.on('pageerror', (error) => pageErrors.push(error.message));

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const click = async (selector) => {
  const element = await page.waitForSelector(selector, { visible: true, timeout: 10_000 });
  if (!element) throw new Error(`Missing visible control: ${selector}`);
  await element.click();
};

await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 30_000 });
await page.waitForSelector('canvas', { visible: true, timeout: 30_000 });
await delay(500);

const restState = await page.evaluate(() => {
  const title = document.querySelector('.specimen-titlebar');
  const panels = [...document.querySelectorAll('.registry-panel, .record-panel, .tools-panel')];
  const handles = [...document.querySelectorAll('.global-hud button')];
  return {
    titleDisplay: title ? getComputedStyle(title).display : 'missing',
    openPanels: panels.filter((panel) => panel.classList.contains('is-open')).length,
    handleBoxes: handles.map((handle) => {
      const rect = handle.getBoundingClientRect();
      return { width: rect.width, height: rect.height, opacity: Number(getComputedStyle(handle).opacity) };
    }),
    canvas: (() => {
      const canvas = document.querySelector('canvas');
      const rect = canvas?.getBoundingClientRect();
      return rect ? { width: rect.width, height: rect.height } : null;
    })(),
  };
});

if (restState.titleDisplay !== 'none') throw new Error(`Specimen title remains visible at rest: ${restState.titleDisplay}`);
if (restState.openPanels !== 0) throw new Error(`Expected no open drawers at rest, found ${restState.openPanels}.`);
if (restState.handleBoxes.length !== 5) throw new Error(`Expected five deliberate handles, found ${restState.handleBoxes.length}.`);
if (restState.handleBoxes.some((box) => box.width > 34 || box.height > 34)) throw new Error(`One or more reveal handles exceed 34px: ${JSON.stringify(restState.handleBoxes)}`);
if (!restState.canvas || restState.canvas.width < 1350 || restState.canvas.height < 820) throw new Error(`Canvas does not dominate 1440x900 viewport: ${JSON.stringify(restState.canvas)}`);

await page.screenshot({ path: path.join(screenshots, 'viewport-1440x900.png'), fullPage: false });
await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 });
await delay(250);
await page.screenshot({ path: path.join(screenshots, 'viewport-1280x800.png'), fullPage: false });
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
await delay(250);
await page.screenshot({ path: path.join(screenshots, 'viewport-390x844.png'), fullPage: false });
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
await delay(250);

await page.keyboard.press('g');
await page.waitForSelector('.registry-panel.is-open', { visible: true });
const records = await page.$$eval('.registry-panel .specimen-card', (cards) => cards.map((card) => ({
  designation: card.querySelector('strong')?.textContent?.trim() ?? 'Unknown',
  archiveId: card.querySelector('small')?.textContent?.trim() ?? 'Unknown',
})));
if (records.length !== 59) throw new Error(`Expected 59 registry cards, found ${records.length}.`);
await page.keyboard.press('Escape');
await delay(100);

const samples = new Set([0, 9, 19, 29, 39, 49, 58]);
const results = [];
const startHeap = await page.evaluate(() => performance.memory?.usedJSHeapSize ?? null);

for (let index = 0; index < records.length; index += 1) {
  await page.keyboard.press('g');
  await page.waitForSelector('.registry-panel.is-open', { visible: true });
  const cards = await page.$$('.registry-panel .specimen-card');
  if (!cards[index]) throw new Error(`Registry card ${index} disappeared.`);
  await cards[index].click();
  await delay(260);

  const state = await page.evaluate(() => ({
    error: document.querySelector('.error-overlay')?.textContent?.trim() ?? null,
    activeName: document.querySelector('.specimen-titlebar h2')?.textContent?.trim() ?? null,
    canvasVisible: (() => {
      const canvas = document.querySelector('canvas');
      if (!canvas) return false;
      const rect = canvas.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    })(),
  }));
  if (state.error) throw new Error(`${records[index].designation} reported: ${state.error}`);
  if (!state.canvasVisible) throw new Error(`${records[index].designation} lost the WebGL canvas.`);

  await page.keyboard.press('t');
  await page.waitForSelector('.tools-panel.is-open', { visible: true });
  const layerCount = await page.$$eval('.tools-panel .layer-grid .toggle-button', (buttons) => {
    for (const button of buttons) {
      if (button.getAttribute('aria-pressed') !== 'true') button.click();
    }
    return buttons.length;
  });
  if (layerCount !== 4) throw new Error(`${records[index].designation} exposed ${layerCount} anatomy layer controls.`);
  await delay(80);
  await page.keyboard.press('Escape');
  await delay(80);

  if (samples.has(index)) {
    const safeName = records[index].designation.replaceAll(/[^a-z0-9]+/gi, '-').replaceAll(/^-|-$/g, '').toLowerCase();
    await page.screenshot({ path: path.join(screenshots, `${String(index + 1).padStart(2, '0')}-${safeName}.png`), fullPage: false });
  }

  results.push({ index: index + 1, ...records[index], mounted: true, layersEnabled: true });
}

const endHeap = await page.evaluate(() => performance.memory?.usedJSHeapSize ?? null);
const finalState = await page.evaluate(() => ({
  openPanels: [...document.querySelectorAll('.registry-panel, .record-panel, .tools-panel')].filter((panel) => panel.classList.contains('is-open')).length,
  canvasCount: document.querySelectorAll('canvas').length,
}));

await browser.close();

const ignoredConsolePatterns = [/THREE\.WebGLRenderer/i, /DevTools/i];
const actionableConsoleErrors = consoleErrors.filter((message) => !ignoredConsolePatterns.some((pattern) => pattern.test(message)));
if (pageErrors.length > 0 || actionableConsoleErrors.length > 0) {
  throw new Error(`Browser errors detected. Page errors: ${JSON.stringify(pageErrors)} Console errors: ${JSON.stringify(actionableConsoleErrors)}`);
}
if (finalState.openPanels !== 0) throw new Error(`A drawer remained open after the sweep.`);
if (finalState.canvasCount !== 1) throw new Error(`Expected one WebGL canvas, found ${finalState.canvasCount}.`);

const report = {
  baseUrl,
  recordsTested: results.length,
  restState,
  startHeap,
  endHeap,
  heapGrowth: startHeap !== null && endHeap !== null ? endHeap - startHeap : null,
  pageErrors,
  consoleErrors: actionableConsoleErrors,
  results,
};
fs.writeFileSync(path.join(outputRoot, 'browser-audit-report.json'), JSON.stringify(report, null, 2));
fs.writeFileSync(path.join(outputRoot, 'browser-audit-report.md'), [
  '# Drakken Immersive Browser Audit',
  '',
  `- Records mounted: ${results.length}/59`,
  `- Closed-at-rest title: ${restState.titleDisplay === 'none' ? 'PASS' : 'FAIL'}`,
  `- Closed-at-rest drawers: ${restState.openPanels === 0 ? 'PASS' : 'FAIL'}`,
  `- Reveal handle size: ${restState.handleBoxes.every((box) => box.width <= 34 && box.height <= 34) ? 'PASS' : 'FAIL'}`,
  `- Canvas at 1440x900: ${restState.canvas?.width ?? 0} x ${restState.canvas?.height ?? 0}`,
  `- Browser page errors: ${pageErrors.length}`,
  `- Browser console errors: ${actionableConsoleErrors.length}`,
  `- Heap growth: ${report.heapGrowth ?? 'unavailable'} bytes`,
  '',
  'Automated mounting and layout checks are not human canon or art-direction approval.',
  '',
].join('\n'));

console.log(`Browser audit passed for ${results.length} records.`);
