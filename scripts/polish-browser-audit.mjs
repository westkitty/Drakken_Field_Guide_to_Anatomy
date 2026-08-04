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

async function loadAt(width, height) {
  await page.setViewport({ width, height, deviceScaleFactor: 1 });
  await page.goto(auditUrl.toString(), { waitUntil: 'domcontentloaded', timeout: 30_000 });
  await page.waitForSelector('canvas', { visible: true, timeout: 30_000 });
  await delay(500);
}

async function openDrawer(key, selector) {
  await page.keyboard.press(key);
  await page.waitForFunction(
    (value) => document.querySelector(value)?.classList.contains('is-open'),
    { timeout: 10_000 },
    selector,
  );
  await delay(240);
  const focusInside = await page.evaluate((value) => document.querySelector(value)?.contains(document.activeElement) ?? false, selector);
  if (!focusInside) throw new Error(`${selector} did not receive focus.`);
}

async function closeDrawer(selector, triggerSelector) {
  await page.keyboard.press('Escape');
  await page.waitForFunction(
    (value) => !document.querySelector(value)?.classList.contains('is-open'),
    { timeout: 10_000 },
    selector,
  );
  await delay(80);
  const focusRestored = await page.evaluate((value) => document.activeElement === document.querySelector(value), triggerSelector);
  if (!focusRestored) throw new Error(`Focus did not return to ${triggerSelector}.`);
}

await loadAt(1440, 900);
const desktopRest = await page.evaluate(() => ({
  openPanels: document.querySelectorAll('.registry-panel.is-open, .record-panel.is-open, .tools-panel.is-open, .diagnostics-panel.is-open').length,
  titleDisplay: getComputedStyle(document.querySelector('.specimen-titlebar')).display,
  horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
  handles: [...document.querySelectorAll('.global-hud button')].map((button) => {
    const rect = button.getBoundingClientRect();
    return { width: rect.width, height: rect.height, label: button.getAttribute('aria-label') };
  }),
}));
if (desktopRest.openPanels !== 0) throw new Error('A drawer was open at desktop rest.');
if (desktopRest.titleDisplay !== 'none') throw new Error('Persistent title chrome was visible at rest.');
if (desktopRest.horizontalOverflow) throw new Error('Desktop viewport has horizontal overflow.');
if (desktopRest.handles.length !== 5) throw new Error(`Expected five deliberate handles, found ${desktopRest.handles.length}.`);
if (!desktopRest.handles.every((handle) => handle.width <= 34 && handle.height <= 34)) throw new Error('A visible edge handle exceeds the compact chrome limit.');
await page.screenshot({ path: path.join(outputRoot, 'desktop-rest.png'), fullPage: true });

await openDrawer('g', '#registry-drawer');
const registryState = await page.evaluate(() => ({
  countText: document.querySelector('.registry-summary')?.textContent?.trim() ?? '',
  labelledSearch: document.querySelector('label[for="registry-search"]')?.textContent?.trim() ?? '',
  horizontalOverflow: document.querySelector('#registry-drawer').scrollWidth > document.querySelector('#registry-drawer').clientWidth + 1,
}));
if (!registryState.countText.includes('59')) throw new Error('Registry summary does not expose the complete record count.');
if (registryState.labelledSearch !== 'Search records') throw new Error('Registry search is not explicitly labelled.');
if (registryState.horizontalOverflow) throw new Error('Registry drawer has horizontal overflow.');
await page.evaluate(() => {
  const panel = document.querySelector('#registry-drawer');
  const focusable = [...panel.querySelectorAll('button:not(:disabled), input:not(:disabled), select:not(:disabled), [href], [tabindex]:not([tabindex="-1"])')].filter((item) => item.offsetParent !== null);
  focusable.at(-1)?.focus();
});
await page.keyboard.press('Tab');
const registryTrap = await page.evaluate(() => document.querySelector('#registry-drawer')?.contains(document.activeElement) ?? false);
if (!registryTrap) throw new Error('Registry focus escaped its modal drawer.');
await page.screenshot({ path: path.join(outputRoot, 'desktop-registry.png'), fullPage: true });
await closeDrawer('#registry-drawer', 'button[aria-controls="registry-drawer"]');

await openDrawer('t', '#tools-drawer');
const toolsState = await page.evaluate(() => ({
  hasReset: [...document.querySelectorAll('#tools-drawer button')].some((button) => button.textContent?.includes('Reset all')),
  presetCount: document.querySelectorAll('#tools-drawer .layer-presets button').length,
  horizontalOverflow: document.querySelector('#tools-drawer').scrollWidth > document.querySelector('#tools-drawer').clientWidth + 1,
}));
if (!toolsState.hasReset || toolsState.presetCount !== 3) throw new Error('Tools polish controls are incomplete.');
if (toolsState.horizontalOverflow) throw new Error('Tools drawer has horizontal overflow.');
await page.screenshot({ path: path.join(outputRoot, 'desktop-tools.png'), fullPage: true });
await closeDrawer('#tools-drawer', 'button[aria-controls="tools-drawer"]');

await openDrawer('i', '#record-drawer');
const initialTab = await page.$eval('[role="tab"][aria-selected="true"]', (node) => node.id);
await page.keyboard.press('ArrowRight');
await delay(80);
const nextTab = await page.$eval('[role="tab"][aria-selected="true"]', (node) => node.id);
if (initialTab === nextTab) throw new Error('Record tab ArrowRight navigation did not advance.');
const annotationControls = await page.evaluate(() => ({
  detail: document.querySelectorAll('.annotation-detail-trigger').length,
  export: document.querySelectorAll('.annotation-export-toggle').length,
}));
if (annotationControls.detail === 0 || annotationControls.detail !== annotationControls.export) throw new Error('Annotation inspection and export controls are not independently represented.');
await closeDrawer('#record-drawer', 'button[aria-controls="record-drawer"]');

await openDrawer('d', '#diagnostics-drawer');
const diagnosticsHeading = await page.$eval('#diagnostics-drawer h2', (node) => node.textContent?.trim());
if (diagnosticsHeading !== 'Diagnostics') throw new Error('Diagnostics does not use the shared drawer heading language.');
await closeDrawer('#diagnostics-drawer', 'button[aria-controls="diagnostics-drawer"]');

await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
await delay(500);
const mobileRest = await page.evaluate(() => ({
  horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
  handleCount: document.querySelectorAll('.global-hud button').length,
}));
if (mobileRest.horizontalOverflow) throw new Error('Mobile viewport has horizontal overflow at rest.');
if (mobileRest.handleCount !== 5) throw new Error('Mobile viewport lost a deliberate edge handle.');
await openDrawer('t', '#tools-drawer');
const mobileTools = await page.evaluate(() => {
  const rect = document.querySelector('#tools-drawer').getBoundingClientRect();
  return {
    left: rect.left,
    right: rect.right,
    top: rect.top,
    bottom: rect.bottom,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    horizontalOverflow: document.querySelector('#tools-drawer').scrollWidth > document.querySelector('#tools-drawer').clientWidth + 1,
  };
});
if (mobileTools.left < -1 || mobileTools.right > mobileTools.viewportWidth + 1 || mobileTools.top < -1 || mobileTools.bottom > mobileTools.viewportHeight + 1) throw new Error(`Mobile tools sheet escapes the viewport: ${JSON.stringify(mobileTools)}`);
if (mobileTools.horizontalOverflow) throw new Error('Mobile tools sheet has horizontal overflow.');
await page.screenshot({ path: path.join(outputRoot, 'mobile-tools.png'), fullPage: true });

await browser.close();
const ignoredConsolePatterns = [/Failed to load resource.*404/i, /THREE\.WebGLRenderer/i, /DevTools/i];
const ignoredPageErrorPatterns = [/^THREE\.WebGLRenderer: Error creating WebGL context\.$/i];
const actionableConsoleErrors = consoleErrors.filter((message) => !ignoredConsolePatterns.some((pattern) => pattern.test(message)));
const actionablePageErrors = pageErrors.filter((message) => !ignoredPageErrorPatterns.some((pattern) => pattern.test(message)));
const environmentPageWarnings = pageErrors.filter((message) => ignoredPageErrorPatterns.some((pattern) => pattern.test(message)));
if (actionablePageErrors.length || actionableConsoleErrors.length) throw new Error(`Browser errors: ${JSON.stringify({ actionablePageErrors, actionableConsoleErrors })}`);

const report = {
  desktopRest,
  registryState,
  toolsState,
  annotationControls,
  mobileRest,
  mobileTools,
  actionablePageErrors,
  actionableConsoleErrors,
  environmentPageWarnings,
};
fs.writeFileSync(path.join(outputRoot, 'polish-browser-audit.json'), JSON.stringify(report, null, 2));
fs.writeFileSync(path.join(outputRoot, 'polish-browser-audit.md'), [
  '# Targeted Product Polish Browser Audit',
  '',
  '- Desktop hidden-at-rest state: PASS',
  '- Five compact deliberate handles: PASS',
  '- Registry focus trap and restoration: PASS',
  '- Tools reset and layer presets: PASS',
  '- Record tab keyboard navigation: PASS',
  '- Annotation intent separation: PASS',
  '- Diagnostics drawer consistency: PASS',
  '- Desktop and mobile horizontal overflow: PASS',
  '- Mobile tools sheet viewport containment: PASS',
  '- Actionable browser errors: 0',
  `- Headless SwiftShader context warnings: ${environmentPageWarnings.length} (recorded, excluded only from this DOM/CSS polish gate)`,
  '',
  'This audit verifies interaction and responsive mechanics. It does not replace the separate renderer/model evidence or human art-direction review.',
  '',
].join('\n'));
console.log('Targeted product polish browser audit passed.');
