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

await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
await page.goto(auditUrl.toString(), { waitUntil: 'domcontentloaded', timeout: 30_000 });
await page.waitForSelector('canvas', { visible: true, timeout: 30_000 });
await delay(400);

const restState = await page.evaluate(() => ({
  colorScheme: getComputedStyle(document.documentElement).colorScheme,
  styleLayers: [...document.querySelectorAll('style[data-vite-dev-id], link[rel="stylesheet"]')]
    .map((node) => node.getAttribute('data-vite-dev-id') ?? node.getAttribute('href') ?? ''),
  keycapBorder: getComputedStyle(document.querySelector('kbd')).borderTopStyle,
}));
for (const requiredStyle of ['polish-wave3.css', 'polish-wave3-repairs.css']) {
  if (!restState.styleLayers.some((entry) => entry.includes(requiredStyle))) throw new Error(`${requiredStyle} is not active.`);
}
if (!restState.colorScheme.includes('dark')) throw new Error(`Dark native-control scheme is not active: ${restState.colorScheme}.`);
if (restState.keycapBorder === 'none') throw new Error('Wave-three keycap treatment is not active.');

await page.keyboard.press('g');
await page.waitForFunction(() => document.querySelector('#registry-drawer')?.classList.contains('is-open'));
await delay(220);
await page.focus('#registry-search');
const registryState = await page.evaluate(() => {
  const hud = document.querySelector('.global-hud');
  const input = document.querySelector('#registry-search');
  const badge = document.querySelector('.evidence-badge');
  return {
    hudVisibility: getComputedStyle(hud).visibility,
    hudOpacity: getComputedStyle(hud).opacity,
    inputOutline: getComputedStyle(input).outlineStyle,
    inputShadow: getComputedStyle(input).boxShadow,
    evidenceMarker: getComputedStyle(badge, '::before').content,
  };
});
if (registryState.hudVisibility !== 'hidden' && registryState.hudOpacity !== '0') throw new Error('Edge handles remain visible over the Registry drawer.');
if (registryState.inputOutline !== 'none') throw new Error(`Registry search has a doubled outline: ${registryState.inputOutline}.`);
if (registryState.inputShadow === 'none') throw new Error('Registry search lost its component-owned focus treatment.');
if (!registryState.evidenceMarker || registryState.evidenceMarker === 'none') throw new Error('Evidence badges lack non-color state markers.');
await page.screenshot({ path: path.join(outputRoot, 'wave3-desktop-registry.png'), fullPage: true });

await page.keyboard.press('Escape');
await page.keyboard.press('i');
await page.waitForFunction(() => document.querySelector('#record-drawer')?.classList.contains('is-open'));
await delay(220);
const recordState = await page.evaluate(() => {
  const selectedTab = document.querySelector('.record-tabs [aria-selected="true"]');
  const paragraph = document.querySelector('.record-article p, .record-summary p, .annotation-detail p');
  return {
    hudVisibility: getComputedStyle(document.querySelector('.global-hud')).visibility,
    tabMarker: selectedTab ? getComputedStyle(selectedTab, '::after').content : '',
    paragraphHyphens: paragraph ? getComputedStyle(paragraph).hyphens : '',
  };
});
if (recordState.hudVisibility !== 'hidden') throw new Error('Edge handles remain visible over the Record drawer.');
if (recordState.tabMarker !== 'none') throw new Error(`A generic active marker leaked into the selected record tab: ${recordState.tabMarker}.`);
if (recordState.paragraphHyphens !== 'none' && recordState.paragraphHyphens !== 'manual') throw new Error(`Dossier copy still uses automatic hyphenation: ${recordState.paragraphHyphens}.`);
await page.screenshot({ path: path.join(outputRoot, 'wave3-desktop-record.png'), fullPage: true });

await page.keyboard.press('Escape');
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
await delay(180);
await page.keyboard.press('i');
await page.waitForFunction(() => document.querySelector('#record-drawer')?.classList.contains('is-open'));
await delay(220);
const mobileRecordState = await page.evaluate(() => {
  const entry = document.querySelector('.record-grid > div');
  return {
    columns: entry ? getComputedStyle(entry).gridTemplateColumns : '',
    hudVisibility: getComputedStyle(document.querySelector('.global-hud')).visibility,
    horizontalOverflow: document.querySelector('#record-drawer').scrollWidth > document.querySelector('#record-drawer').clientWidth + 1,
  };
});
if (mobileRecordState.columns.trim().split(/\s+/).length !== 1) throw new Error(`Mobile record terms did not stack: ${mobileRecordState.columns}.`);
if (mobileRecordState.hudVisibility !== 'hidden') throw new Error('Edge handles remain visible over the mobile Record drawer.');
if (mobileRecordState.horizontalOverflow) throw new Error('Wave-three mobile record layout has horizontal overflow.');
await page.screenshot({ path: path.join(outputRoot, 'wave3-mobile-record.png'), fullPage: true });

await browser.close();

const ignoredConsolePatterns = [/Failed to load resource.*404/i, /THREE\.WebGLRenderer/i, /DevTools/i];
const ignoredPageErrorPatterns = [/^THREE\.WebGLRenderer: Error creating WebGL context\.$/i];
const actionableConsoleErrors = consoleErrors.filter((message) => !ignoredConsolePatterns.some((pattern) => pattern.test(message)));
const actionablePageErrors = pageErrors.filter((message) => !ignoredPageErrorPatterns.some((pattern) => pattern.test(message)));
const environmentPageWarnings = pageErrors.filter((message) => ignoredPageErrorPatterns.some((pattern) => pattern.test(message)));
if (actionablePageErrors.length || actionableConsoleErrors.length) {
  throw new Error(`Wave-three browser errors: ${JSON.stringify({ actionablePageErrors, actionableConsoleErrors })}`);
}

const report = {
  restState,
  registryState,
  recordState,
  mobileRecordState,
  actionablePageErrors,
  actionableConsoleErrors,
  environmentPageWarnings,
};
fs.writeFileSync(path.join(outputRoot, 'polish-wave3-browser-audit.json'), JSON.stringify(report, null, 2));
fs.writeFileSync(path.join(outputRoot, 'polish-wave3-browser-audit.md'), [
  '# Product Polish Wave 3 Browser Audit',
  '',
  '- Wave-three and repair styles active: PASS',
  '- Dark native-control scheme and keycap finish: PASS',
  '- Edge handles hidden over open modal surfaces: PASS',
  '- Registry focus treatment has no doubled outline: PASS',
  '- Evidence badges include non-color markers: PASS',
  '- Record tabs exclude the generic active-state dot: PASS',
  '- Narrow dossier copy avoids automatic hyphenation: PASS',
  '- Mobile record terms stack without horizontal overflow: PASS',
  '- Actionable browser errors: 0',
  `- Headless SwiftShader context warnings: ${environmentPageWarnings.length}`,
  '',
].join('\n'));
console.log('Product polish wave 3 browser audit passed.');
