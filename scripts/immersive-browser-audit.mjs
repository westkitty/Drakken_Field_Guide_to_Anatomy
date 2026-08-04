import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer';

const baseUrl = process.env.DRAKKEN_AUDIT_URL ?? 'http://127.0.0.1:4173';
const outputRoot = process.env.DRAKKEN_AUDIT_OUTPUT ?? path.resolve('browser-audit-output');
const startIndex = Number(process.env.DRAKKEN_AUDIT_START ?? 0);
const count = Number(process.env.DRAKKEN_AUDIT_COUNT ?? 10);
const screenshots = path.join(outputRoot, 'screenshots');
fs.mkdirSync(screenshots, { recursive: true });

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--enable-precise-memory-info'],
});
const page = await browser.newPage();
page.setDefaultTimeout(15_000);
const consoleErrors = [];
const pageErrors = [];
page.on('console', (message) => {
  if (message.type() === 'error') consoleErrors.push(message.text());
});
page.on('pageerror', (error) => pageErrors.push(error.message));
const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 30_000 });
await page.waitForSelector('canvas', { visible: true, timeout: 30_000 });
await delay(400);

const restState = await page.evaluate(() => {
  const title = document.querySelector('.specimen-titlebar');
  const panels = [...document.querySelectorAll('.registry-panel, .record-panel, .tools-panel')];
  const handles = [...document.querySelectorAll('.global-hud button')];
  const canvas = document.querySelector('canvas')?.getBoundingClientRect();
  return {
    titleDisplay: title ? getComputedStyle(title).display : 'missing',
    openPanels: panels.filter((panel) => panel.classList.contains('is-open')).length,
    handleBoxes: handles.map((handle) => {
      const rect = handle.getBoundingClientRect();
      return { width: rect.width, height: rect.height, opacity: Number(getComputedStyle(handle).opacity) };
    }),
    canvas: canvas ? { width: canvas.width, height: canvas.height } : null,
  };
});
if (restState.titleDisplay !== 'none') throw new Error(`Specimen title remains visible at rest: ${restState.titleDisplay}`);
if (restState.openPanels !== 0) throw new Error(`Expected no open drawers at rest, found ${restState.openPanels}.`);
if (restState.handleBoxes.length !== 5) throw new Error(`Expected five deliberate handles, found ${restState.handleBoxes.length}.`);
if (restState.handleBoxes.some((box) => box.width > 34 || box.height > 34)) throw new Error(`Reveal handle exceeds 34px: ${JSON.stringify(restState.handleBoxes)}`);
if (!restState.canvas || restState.canvas.width < 1350 || restState.canvas.height < 820) throw new Error(`Canvas does not dominate 1440x900: ${JSON.stringify(restState.canvas)}`);

if (startIndex === 0) {
  await page.screenshot({ path: path.join(screenshots, 'viewport-1440x900.png') });
  await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 });
  await delay(150);
  await page.screenshot({ path: path.join(screenshots, 'viewport-1280x800.png') });
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
  await delay(150);
  await page.screenshot({ path: path.join(screenshots, 'viewport-390x844.png') });
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await delay(150);
}

await page.keyboard.press('g');
await page.waitForSelector('.registry-panel.is-open', { visible: true });
const records = await page.$$eval('.registry-panel .specimen-card', (cards) => cards.map((card) => ({
  designation: card.querySelector('strong')?.textContent?.trim() ?? 'Unknown',
  archiveId: card.querySelector('small')?.textContent?.trim() ?? 'Unknown',
})));
if (records.length !== 59) throw new Error(`Expected 59 registry cards, found ${records.length}.`);
await page.keyboard.press('Escape');

// Use reduced renderer quality for exhaustive software-rendered CI without changing application defaults.
await page.keyboard.press('t');
await page.waitForSelector('.tools-panel.is-open', { visible: true });
await page.$$eval('.tools-panel button', (buttons) => {
  const reduced = buttons.find((button) => button.textContent?.includes('Reduced quality'));
  if (reduced?.getAttribute('aria-pressed') !== 'true') reduced?.click();
});
await page.keyboard.press('Escape');
await delay(120);

const endIndex = Math.min(records.length, startIndex + count);
const results = [];
const startHeap = await page.evaluate(() => performance.memory?.usedJSHeapSize ?? null);

for (let index = startIndex; index < endIndex; index += 1) {
  const record = records[index];
  console.log(`Auditing ${index + 1}/59 ${record.designation}`);
  await page.keyboard.press('g');
  await page.waitForSelector('.registry-panel.is-open', { visible: true });
  await page.$$eval('.registry-panel .specimen-card', (cards, targetIndex) => cards[targetIndex]?.click(), index);
  await page.waitForFunction(
    (designation) => document.querySelector('.specimen-titlebar h2')?.textContent?.trim() === designation && !document.querySelector('.loading-overlay'),
    { timeout: 15_000 },
    record.designation,
  );
  await delay(100);

  const mounted = await page.evaluate(() => ({
    error: document.querySelector('.error-overlay')?.textContent?.trim() ?? null,
    canvasCount: document.querySelectorAll('canvas').length,
  }));
  if (mounted.error) throw new Error(`${record.designation} reported: ${mounted.error}`);
  if (mounted.canvasCount !== 1) throw new Error(`${record.designation} has ${mounted.canvasCount} canvases.`);

  await page.keyboard.press('t');
  await page.waitForSelector('.tools-panel.is-open', { visible: true });
  const layerCount = await page.$$eval('.tools-panel .layer-grid .toggle-button', (buttons) => {
    for (const button of buttons) {
      if (button.getAttribute('aria-pressed') !== 'true') button.click();
    }
    return buttons.length;
  });
  if (layerCount !== 4) throw new Error(`${record.designation} exposed ${layerCount} layer controls.`);
  await delay(120);
  await page.keyboard.press('Escape');

  if (index === startIndex || index === endIndex - 1) {
    const safeName = record.designation.replaceAll(/[^a-z0-9]+/gi, '-').replaceAll(/^-|-$/g, '').toLowerCase();
    await page.screenshot({ path: path.join(screenshots, `${String(index + 1).padStart(2, '0')}-${safeName}.png`) });
  }
  results.push({ index: index + 1, ...record, mounted: true, fourLayersEnabled: true });
}

const endHeap = await page.evaluate(() => performance.memory?.usedJSHeapSize ?? null);
const finalState = await page.evaluate(() => ({
  openPanels: [...document.querySelectorAll('.registry-panel, .record-panel, .tools-panel')].filter((panel) => panel.classList.contains('is-open')).length,
  canvasCount: document.querySelectorAll('canvas').length,
}));
await browser.close();

const ignoredConsolePatterns = [/THREE\.WebGLRenderer/i, /DevTools/i];
const actionableConsoleErrors = consoleErrors.filter((message) => !ignoredConsolePatterns.some((pattern) => pattern.test(message)));
if (pageErrors.length > 0 || actionableConsoleErrors.length > 0) throw new Error(`Browser errors: ${JSON.stringify({ pageErrors, actionableConsoleErrors })}`);
if (finalState.openPanels !== 0) throw new Error('A drawer remained open after the shard.');
if (finalState.canvasCount !== 1) throw new Error(`Expected one WebGL canvas, found ${finalState.canvasCount}.`);

const report = {
  baseUrl,
  startIndex,
  endIndex,
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
  '# Drakken Immersive Browser Audit Shard',
  '',
  `- Registry range: ${startIndex + 1}-${endIndex} of 59`,
  `- Records mounted with all four layers: ${results.length}`,
  `- Closed-at-rest title: ${restState.titleDisplay === 'none' ? 'PASS' : 'FAIL'}`,
  `- Closed-at-rest drawers: ${restState.openPanels === 0 ? 'PASS' : 'FAIL'}`,
  `- Reveal handles <=34px: ${restState.handleBoxes.every((box) => box.width <= 34 && box.height <= 34) ? 'PASS' : 'FAIL'}`,
  `- Browser page errors: ${pageErrors.length}`,
  `- Browser console errors: ${actionableConsoleErrors.length}`,
  `- Heap growth: ${report.heapGrowth ?? 'unavailable'} bytes`,
  '',
  'Automated mount/layer checks are not human canon or art-direction approval.',
  '',
].join('\n'));
console.log(`Browser audit shard passed for records ${startIndex + 1}-${endIndex}.`);
