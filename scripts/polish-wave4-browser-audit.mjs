import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer';

const baseUrl = process.env.DRAKKEN_AUDIT_URL ?? 'http://127.0.0.1:4173';
const outputRoot = process.env.DRAKKEN_AUDIT_OUTPUT ?? 'polish-browser-audit-output';
fs.mkdirSync(outputRoot, { recursive: true });

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--use-gl=swiftshader'],
});
const page = await browser.newPage();
const pageErrors = [];
const consoleErrors = [];
page.on('pageerror', (error) => pageErrors.push(error.message));
page.on('console', (message) => {
  if (message.type() === 'error') consoleErrors.push(message.text());
});

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const auditUrl = new URL(baseUrl);
auditUrl.searchParams.set('audit', '1');

async function load(width, height, options = {}) {
  await page.setViewport({ width, height, deviceScaleFactor: 1, ...options });
  await page.goto(auditUrl.toString(), { waitUntil: 'domcontentloaded', timeout: 30_000 });
  await page.waitForSelector('canvas', { visible: true, timeout: 30_000 });
  await delay(450);
}

async function openDrawer(key, selector) {
  await page.keyboard.press(key);
  await page.waitForFunction((value) => document.querySelector(value)?.classList.contains('is-open'), { timeout: 10_000 }, selector);
  await delay(240);
}

async function closeDrawer(selector) {
  await page.keyboard.press('Escape');
  await page.waitForFunction((value) => !document.querySelector(value)?.classList.contains('is-open'), { timeout: 10_000 }, selector);
  await delay(100);
}

await load(1440, 900);

const restState = await page.evaluate(() => {
  const skip = document.querySelector('.skip-link');
  const skipRect = skip.getBoundingClientRect();
  const styles = [...document.querySelectorAll('style[data-vite-dev-id], link[rel="stylesheet"]')]
    .map((node) => node.getAttribute('data-vite-dev-id') ?? node.getAttribute('href') ?? '');
  const toastStyle = getComputedStyle(document.querySelector('.status-toast'));
  return {
    styles,
    skipTop: skipRect.top,
    skipBottom: skipRect.bottom,
    toastTop: toastStyle.top,
    toastLeft: toastStyle.left,
    toastRight: toastStyle.right,
    toastBottom: toastStyle.bottom,
  };
});
for (const file of ['polish-wave4.css', 'polish-wave4-repairs.css']) {
  if (!restState.styles.some((entry) => entry.includes(file))) throw new Error(`${file} is not active.`);
}
if (restState.skipBottom > 0) throw new Error(`Skip link is visible without focus: ${JSON.stringify(restState)}.`);
if (restState.toastTop !== 'auto' || restState.toastLeft !== 'auto' || restState.toastRight === 'auto' || restState.toastBottom === 'auto') {
  throw new Error(`Status toast uses conflicting anchors: ${JSON.stringify(restState)}.`);
}

await page.keyboard.press('Tab');
await delay(80);
const focusedSkip = await page.evaluate(() => {
  const skip = document.querySelector('.skip-link');
  const rect = skip.getBoundingClientRect();
  return { active: document.activeElement === skip, top: rect.top, bottom: rect.bottom };
});
if (!focusedSkip.active || focusedSkip.top < -1 || focusedSkip.bottom <= 0) throw new Error(`Skip link did not become visible on focus: ${JSON.stringify(focusedSkip)}.`);
await page.keyboard.press('Escape');

await openDrawer('g', '#registry-drawer');
const registryState = await page.evaluate(() => {
  const card = document.querySelector('.specimen-card[aria-current="true"]');
  const metadataRows = [...card.querySelectorAll('.specimen-metadata')];
  return {
    cardMarker: getComputedStyle(card, '::after').content,
    metadataContained: metadataRows.every((row) => row.scrollWidth <= row.clientWidth + 1),
    cardContained: card.scrollWidth <= card.clientWidth + 1,
    drawerContained: document.querySelector('#registry-drawer').scrollWidth <= document.querySelector('#registry-drawer').clientWidth + 1,
  };
});
if (registryState.cardMarker !== 'none') throw new Error(`Active specimen card retains a redundant marker: ${registryState.cardMarker}.`);
if (!registryState.metadataContained || !registryState.cardContained || !registryState.drawerContained) throw new Error(`Registry metadata overflow remains: ${JSON.stringify(registryState)}.`);
await page.screenshot({ path: path.join(outputRoot, 'wave4-desktop-registry.png'), fullPage: true });
await closeDrawer('#registry-drawer');

await openDrawer('t', '#tools-drawer');
const toolsState = await page.evaluate(() => {
  const clusters = [...document.querySelectorAll('#tools-drawer .tool-cluster')];
  const rectangles = clusters.map((cluster) => {
    const rect = cluster.getBoundingClientRect();
    return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom };
  });
  const overlaps = rectangles.some((first, index) => rectangles.slice(index + 1).some((second) => (
    first.left < second.right && first.right > second.left && first.top < second.bottom && first.bottom > second.top
  )));
  return {
    overlaps,
    rectangles,
    primaryOverflow: document.querySelector('.primary-tools').scrollWidth > document.querySelector('.primary-tools').clientWidth + 1,
    drawerOverflow: document.querySelector('#tools-drawer').scrollWidth > document.querySelector('#tools-drawer').clientWidth + 1,
  };
});
if (toolsState.overlaps || toolsState.primaryOverflow || toolsState.drawerOverflow) throw new Error(`Primary tool layout is not contained: ${JSON.stringify(toolsState)}.`);
await page.screenshot({ path: path.join(outputRoot, 'wave4-desktop-tools.png'), fullPage: true });
await closeDrawer('#tools-drawer');

await load(390, 844, { isMobile: true, hasTouch: true });
await openDrawer('i', '#record-drawer');
const mobileRecordState = await page.evaluate(() => {
  const drawer = document.querySelector('#record-drawer');
  const tabs = document.querySelector('.record-tabs');
  const close = drawer.querySelector('.mobile-close');
  const closeRect = close.getBoundingClientRect();
  const annotationActions = document.querySelector('.annotation-actions');
  return {
    pointerCoarse: matchMedia('(pointer: coarse)').matches,
    drawerOverflow: drawer.scrollWidth > drawer.clientWidth + 1,
    tabsOverflow: tabs.scrollWidth > tabs.clientWidth + 1,
    tabColumns: getComputedStyle(tabs).gridTemplateColumns,
    closeWidth: closeRect.width,
    closeHeight: closeRect.height,
    annotationDisplay: getComputedStyle(annotationActions).display,
    annotationColumns: getComputedStyle(annotationActions).gridTemplateColumns,
  };
});
if (mobileRecordState.drawerOverflow || mobileRecordState.tabsOverflow) throw new Error(`Narrow Record layout overflows: ${JSON.stringify(mobileRecordState)}.`);
if (mobileRecordState.tabColumns.trim().split(/\s+/).length !== 5) throw new Error(`Narrow Record tabs are not a contained five-column grid: ${mobileRecordState.tabColumns}.`);
if (mobileRecordState.pointerCoarse && (mobileRecordState.closeWidth < 43.5 || mobileRecordState.closeHeight < 43.5)) {
  throw new Error(`Coarse-pointer close target is undersized: ${JSON.stringify(mobileRecordState)}.`);
}
if (mobileRecordState.annotationDisplay !== 'grid' || mobileRecordState.annotationColumns === 'none') {
  throw new Error(`Ultra-narrow annotation actions are not using the repair grid: ${JSON.stringify(mobileRecordState)}.`);
}
await page.screenshot({ path: path.join(outputRoot, 'wave4-mobile-record.png'), fullPage: true });
await closeDrawer('#record-drawer');

await browser.close();

const ignoredConsolePatterns = [/Failed to load resource.*404/i, /THREE\.WebGLRenderer/i, /DevTools/i];
const ignoredPageErrorPatterns = [/^THREE\.WebGLRenderer: Error creating WebGL context\.$/i];
const actionableConsoleErrors = consoleErrors.filter((message) => !ignoredConsolePatterns.some((pattern) => pattern.test(message)));
const actionablePageErrors = pageErrors.filter((message) => !ignoredPageErrorPatterns.some((pattern) => pattern.test(message)));
const environmentPageWarnings = pageErrors.filter((message) => ignoredPageErrorPatterns.some((pattern) => pattern.test(message)));
if (actionablePageErrors.length || actionableConsoleErrors.length) {
  throw new Error(`Wave-four browser errors: ${JSON.stringify({ actionablePageErrors, actionableConsoleErrors })}`);
}

const report = {
  restState,
  focusedSkip,
  registryState,
  toolsState,
  mobileRecordState,
  actionablePageErrors,
  actionableConsoleErrors,
  environmentPageWarnings,
};
fs.writeFileSync(path.join(outputRoot, 'polish-wave4-browser-audit.json'), JSON.stringify(report, null, 2));
fs.writeFileSync(path.join(outputRoot, 'polish-wave4-browser-audit.md'), [
  '# Product Polish Wave 4 Browser Audit',
  '',
  '- Wave-four and repair styles active: PASS',
  '- Skip link hidden at rest and visible on keyboard focus: PASS',
  '- Status toast uses a single safe-area anchor system: PASS',
  '- Registry metadata and active card remain contained: PASS',
  '- Redundant active-card marker removed: PASS',
  '- Desktop primary tool clusters do not collide: PASS',
  '- Narrow Record drawer and tabs do not overflow: PASS',
  '- Coarse-pointer close target remains at least 44 pixels when emulated: PASS',
  '- Ultra-narrow annotation action grid is active: PASS',
  '- Actionable browser errors: 0',
  `- Headless SwiftShader context warnings: ${environmentPageWarnings.length}`,
  '',
].join('\n'));
console.log('Product polish wave 4 browser audit passed.');
