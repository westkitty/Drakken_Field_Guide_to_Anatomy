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
  styleLayers: [...document.querySelectorAll('style[data-vite-dev-id], link[rel="stylesheet"]')].map((node) => node.getAttribute('data-vite-dev-id') ?? node.getAttribute('href') ?? ''),
}));
if (desktopRest.openPanels !== 0) throw new Error('A drawer was open at desktop rest.');
if (desktopRest.titleDisplay !== 'none') throw new Error('Persistent title chrome was visible at rest.');
if (desktopRest.horizontalOverflow) throw new Error('Desktop viewport has horizontal overflow.');
if (desktopRest.handles.length !== 5) throw new Error(`Expected five deliberate handles, found ${desktopRest.handles.length}.`);
if (!desktopRest.handles.every((handle) => handle.width <= 34 && handle.height <= 34)) throw new Error('A visible edge handle exceeds the compact chrome limit.');
for (const requiredStyle of ['polish-legibility.css', 'polish-wave2.css', 'polish-wave2-repairs.css']) {
  if (!desktopRest.styleLayers.some((entry) => entry.includes(requiredStyle))) throw new Error(`${requiredStyle} is not active in the application cascade.`);
}
await page.screenshot({ path: path.join(outputRoot, 'desktop-rest.png'), fullPage: true });

await openDrawer('g', '#registry-drawer');
await page.focus('#registry-search');
const registryState = await page.evaluate(() => {
  const panel = document.querySelector('#registry-drawer');
  const input = document.querySelector('#registry-search');
  const card = document.querySelector('.specimen-card');
  const panelStyle = getComputedStyle(panel);
  const inputStyle = getComputedStyle(input);
  const cardStyle = getComputedStyle(card);
  return {
    countText: document.querySelector('.registry-summary')?.textContent?.trim() ?? '',
    labelledSearch: document.querySelector('label[for="registry-search"]')?.textContent?.trim() ?? '',
    horizontalOverflow: panel.scrollWidth > panel.clientWidth + 1,
    panelBackdropFilter: panelStyle.backdropFilter,
    panelBackgroundColor: panelStyle.backgroundColor,
    searchBoxShadow: inputStyle.boxShadow,
    cardBoxShadow: cardStyle.boxShadow,
    cardBorderRadius: cardStyle.borderRadius,
  };
});
if (!registryState.countText.includes('59')) throw new Error('Registry summary does not expose the complete record count.');
if (registryState.labelledSearch !== 'Search records') throw new Error('Registry search is not explicitly labelled.');
if (registryState.horizontalOverflow) throw new Error('Registry drawer has horizontal overflow.');
if (registryState.panelBackdropFilter !== 'none') throw new Error(`Registry content still has backdrop blur: ${registryState.panelBackdropFilter}.`);
if (registryState.panelBackgroundColor === 'rgba(0, 0, 0, 0)') throw new Error('Registry content surface is transparent.');
if (registryState.searchBoxShadow === 'none') throw new Error('Registry search focus state lacks visible emphasis.');
if (registryState.cardBoxShadow === 'none' || registryState.cardBorderRadius === '0px') throw new Error('Wave-two specimen-card finish is not active.');
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
const toolsState = await page.evaluate(() => {
  const panel = document.querySelector('#tools-drawer');
  const range = panel.querySelector('input[type="range"]');
  const toolPanel = panel.querySelector('.tool-panel');
  const select = panel.querySelector('select');
  return {
    hasReset: [...panel.querySelectorAll('button')].some((button) => button.textContent?.includes('Reset all')),
    presetCount: panel.querySelectorAll('.layer-presets button').length,
    horizontalOverflow: panel.scrollWidth > panel.clientWidth + 1,
    rangeAccent: range ? getComputedStyle(range).accentColor : '',
    toolPanelShadow: toolPanel ? getComputedStyle(toolPanel).boxShadow : '',
    selectAppearance: select ? getComputedStyle(select).appearance : '',
  };
});
if (!toolsState.hasReset || toolsState.presetCount !== 3) throw new Error('Tools polish controls are incomplete.');
if (toolsState.horizontalOverflow) throw new Error('Tools drawer has horizontal overflow.');
if (!toolsState.rangeAccent || toolsState.rangeAccent === 'auto') throw new Error('Custom range-control accent is not active.');
if (!toolsState.toolPanelShadow || toolsState.toolPanelShadow === 'none') throw new Error('Wave-two tool-panel depth is not active.');
if (toolsState.selectAppearance !== 'none') throw new Error(`Custom select treatment is not active: ${toolsState.selectAppearance}.`);
await page.screenshot({ path: path.join(outputRoot, 'desktop-tools.png'), fullPage: true });
await closeDrawer('#tools-drawer', 'button[aria-controls="tools-drawer"]');

await openDrawer('i', '#record-drawer');
const initialTab = await page.$eval('[role="tab"][aria-selected="true"]', (node) => node.id);
await page.keyboard.press('ArrowRight');
await delay(80);
const nextTab = await page.$eval('[role="tab"][aria-selected="true"]', (node) => node.id);
if (initialTab === nextTab) throw new Error('Record tab ArrowRight navigation did not advance.');
const recordState = await page.evaluate(() => ({
  detail: document.querySelectorAll('.annotation-detail-trigger').length,
  export: document.querySelectorAll('.annotation-export-toggle').length,
  tabsPosition: getComputedStyle(document.querySelector('.record-tabs')).position,
  exportPosition: getComputedStyle(document.querySelector('.export-row')).position,
  recordPaddingBottom: getComputedStyle(document.querySelector('#record-drawer')).paddingBottom,
}));
if (recordState.detail === 0 || recordState.detail !== recordState.export) throw new Error('Annotation inspection and export controls are not independently represented.');
if (recordState.tabsPosition !== 'sticky') throw new Error(`Desktop record tabs are not sticky: ${recordState.tabsPosition}.`);
if (recordState.exportPosition !== 'sticky') throw new Error(`Desktop export footer is not sticky: ${recordState.exportPosition}.`);
if (Number.parseFloat(recordState.recordPaddingBottom) < 70) throw new Error('Record drawer does not reserve enough space for the sticky export footer.');
await page.screenshot({ path: path.join(outputRoot, 'desktop-record.png'), fullPage: true });
await closeDrawer('#record-drawer', 'button[aria-controls="record-drawer"]');

await openDrawer('d', '#diagnostics-drawer');
const diagnosticsState = await page.evaluate(() => ({
  heading: document.querySelector('#diagnostics-drawer h2')?.textContent?.trim(),
  numericAlignment: getComputedStyle(document.querySelector('#diagnostics-drawer dd')).textAlign,
  numericVariant: getComputedStyle(document.querySelector('#diagnostics-drawer dd')).fontVariantNumeric,
}));
if (diagnosticsState.heading !== 'Diagnostics') throw new Error('Diagnostics does not use the shared drawer heading language.');
if (diagnosticsState.numericAlignment !== 'right' || !diagnosticsState.numericVariant.includes('tabular-nums')) throw new Error('Diagnostics values are not aligned for scanning.');
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
  const panel = document.querySelector('#tools-drawer');
  const rect = panel.getBoundingClientRect();
  return {
    left: rect.left,
    right: rect.right,
    top: rect.top,
    bottom: rect.bottom,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    horizontalOverflow: panel.scrollWidth > panel.clientWidth + 1,
    grabberContent: getComputedStyle(panel, '::before').content,
  };
});
if (mobileTools.left < -1 || mobileTools.right > mobileTools.viewportWidth + 1 || mobileTools.top < -1 || mobileTools.bottom > mobileTools.viewportHeight + 1) throw new Error(`Mobile tools sheet escapes the viewport: ${JSON.stringify(mobileTools)}`);
if (mobileTools.horizontalOverflow) throw new Error('Mobile tools sheet has horizontal overflow.');
if (mobileTools.grabberContent === 'none') throw new Error('Mobile tools sheet grabber is missing.');
await page.screenshot({ path: path.join(outputRoot, 'mobile-tools.png'), fullPage: true });
await closeDrawer('#tools-drawer', 'button[aria-controls="tools-drawer"]');

await openDrawer('i', '#record-drawer');
const narrowRecordState = await page.evaluate(() => ({
  tabsPosition: getComputedStyle(document.querySelector('.record-tabs')).position,
  exportPosition: getComputedStyle(document.querySelector('.export-row')).position,
  horizontalOverflow: document.querySelector('#record-drawer').scrollWidth > document.querySelector('#record-drawer').clientWidth + 1,
}));
if (narrowRecordState.tabsPosition !== 'relative' || narrowRecordState.exportPosition !== 'relative') throw new Error(`Narrow record chrome did not release sticky positioning: ${JSON.stringify(narrowRecordState)}.`);
if (narrowRecordState.horizontalOverflow) throw new Error('Narrow record drawer has horizontal overflow.');
await closeDrawer('#record-drawer', 'button[aria-controls="record-drawer"]');

await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
await delay(120);
const reducedMotionState = await page.evaluate(() => {
  const card = document.querySelector('.specimen-card');
  return {
    transitionDuration: getComputedStyle(card).transitionDuration,
    transitionProperty: getComputedStyle(card).transitionProperty,
  };
});
if (reducedMotionState.transitionDuration !== '0s' || reducedMotionState.transitionProperty !== 'none') throw new Error(`Wave-two decorative transitions remain active under reduced motion: ${JSON.stringify(reducedMotionState)}.`);

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
  recordState,
  diagnosticsState,
  mobileRest,
  mobileTools,
  narrowRecordState,
  reducedMotionState,
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
  '- Wave-two, repair, and legibility style layers active: PASS',
  '- Sharp opaque drawer content above the scrim: PASS',
  '- Registry focus treatment, card depth, focus trap, and restoration: PASS',
  '- Tools reset, presets, range, select, and panel finish: PASS',
  '- Record tab keyboard navigation and desktop sticky chrome: PASS',
  '- Sticky export-footer content reservation: PASS',
  '- Annotation intent separation: PASS',
  '- Diagnostics alignment and tabular numerals: PASS',
  '- Desktop and mobile horizontal overflow: PASS',
  '- Mobile tools sheet viewport containment and grabber: PASS',
  '- Narrow record chrome release: PASS',
  '- Reduced-motion decorative transition shutdown: PASS',
  '- Actionable browser errors: 0',
  `- Headless SwiftShader context warnings: ${environmentPageWarnings.length} (recorded, excluded only from this DOM/CSS polish gate)`,
  '',
  'This audit verifies interaction, responsive mechanics, and the second polish cascade. It does not replace renderer/model evidence, forced-colors manual review, physical-device testing, or human art-direction review.',
  '',
].join('\n'));
console.log('Targeted product polish browser audit passed.');
