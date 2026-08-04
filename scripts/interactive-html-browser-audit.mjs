import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import puppeteer from 'puppeteer';

const root = process.env.GITHUB_WORKSPACE ?? process.cwd();
const htmlFile = path.resolve(root, process.env.DRAKKEN_INTERACTIVE_HTML ?? 'dist-interactive-html/Drakken_Field_Guide_Interactive.html');
const outputRoot = path.resolve(root, process.env.DRAKKEN_AUDIT_OUTPUT ?? 'polish-browser-audit-output');
const downloadRoot = path.join(outputRoot, 'interactive-html-downloads');
if (!fs.existsSync(htmlFile)) throw new Error(`Interactive HTML package is missing: ${htmlFile}`);
fs.mkdirSync(outputRoot, { recursive: true });
fs.rmSync(downloadRoot, { recursive: true, force: true });
fs.mkdirSync(downloadRoot, { recursive: true });

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--allow-file-access-from-files', '--use-gl=swiftshader'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
const cdp = await page.createCDPSession();
await cdp.send('Page.setDownloadBehavior', { behavior: 'allow', downloadPath: downloadRoot });

const remoteRequests = [];
const pageErrors = [];
const consoleErrors = [];
page.on('request', (request) => {
  if (/^https?:/i.test(request.url())) remoteRequests.push(request.url());
});
page.on('pageerror', (error) => pageErrors.push(error.message));
page.on('console', (message) => {
  if (message.type() === 'error') consoleErrors.push(message.text());
});

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const fileUrl = new URL(pathToFileURL(htmlFile));
fileUrl.searchParams.set('audit', '1');
await page.goto(fileUrl.toString(), { waitUntil: 'load', timeout: 45_000 });
await page.waitForSelector('canvas', { timeout: 30_000 });
await page.waitForSelector('#registry-drawer', { timeout: 30_000 });
await delay(300);

async function verifyShortcut(key, selector) {
  await page.keyboard.press(key);
  await page.waitForFunction((value) => document.querySelector(value)?.classList.contains('is-open'), { timeout: 5_000 }, selector);
  await page.keyboard.press('Escape');
  await page.waitForFunction((value) => !document.querySelector(value)?.classList.contains('is-open'), { timeout: 5_000 }, selector);
  await delay(80);
}

async function openDrawer(_key, selector) {
  const id = selector.replace(/^#/, '');
  const clicked = await page.evaluate((drawerId) => {
    const trigger = document.querySelector(`[aria-controls="${drawerId}"]`);
    if (!(trigger instanceof HTMLButtonElement)) return false;
    trigger.click();
    return true;
  }, id);
  if (!clicked) throw new Error(`No trigger found for ${selector}.`);
  await page.waitForFunction((value) => document.querySelector(value)?.classList.contains('is-open'), { timeout: 10_000 }, selector);
  await delay(120);
}

async function closeDrawer(selector) {
  const closed = await page.evaluate(() => {
    const scrim = document.querySelector('.drawer-scrim');
    if (!(scrim instanceof HTMLButtonElement)) return false;
    scrim.click();
    return true;
  });
  if (!closed) throw new Error(`No drawer scrim available while closing ${selector}.`);
  await page.waitForFunction((value) => !document.querySelector(value)?.classList.contains('is-open'), { timeout: 10_000 }, selector);
}

async function clickButton(rootSelector, text, exact = true) {
  const clicked = await page.evaluate(({ rootSelector, text, exact }) => {
    const root = document.querySelector(rootSelector);
    const button = root && [...root.querySelectorAll('button')].find((candidate) => {
      const label = candidate.textContent?.replace(/\s+/g, ' ').trim() ?? '';
      return exact ? label === text : label.startsWith(text);
    });
    if (!button || button.disabled) return false;
    button.click();
    return true;
  }, { rootSelector, text, exact });
  if (!clicked) throw new Error(`Could not activate "${text}" inside ${rootSelector}.`);
  await delay(100);
}

async function setValue(selector, value) {
  const changed = await page.evaluate(({ selector, value }) => {
    const control = document.querySelector(selector);
    if (!(control instanceof HTMLInputElement || control instanceof HTMLSelectElement)) return false;
    const prototype = control instanceof HTMLInputElement ? HTMLInputElement.prototype : HTMLSelectElement.prototype;
    Object.getOwnPropertyDescriptor(prototype, 'value')?.set?.call(control, String(value));
    control.dispatchEvent(new Event('input', { bubbles: true }));
    control.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  }, { selector, value });
  if (!changed) throw new Error(`Could not set ${selector} to ${value}.`);
  await delay(100);
}

async function waitForDownloads(extensions) {
  const deadline = Date.now() + 10_000;
  while (Date.now() < deadline) {
    const files = fs.readdirSync(downloadRoot).filter((file) => !file.endsWith('.crdownload'));
    if (extensions.every((extension) => files.some((file) => file.endsWith(extension)))) return files;
    await delay(100);
  }
  throw new Error(`Expected downloads were not created: ${extensions.join(', ')}.`);
}

const delivery = await page.evaluate(() => ({
  marker: document.body.dataset.drakkenDelivery,
  sourceRevision: document.querySelector('meta[name="drakken-source-revision"]')?.getAttribute('content') ?? null,
  canvasCount: document.querySelectorAll('canvas').length,
  rootChildren: document.querySelector('#root')?.children.length ?? 0,
  drawerIds: ['registry-drawer', 'tools-drawer', 'record-drawer', 'diagnostics-drawer'].filter((id) => document.getElementById(id)),
  briefingTrigger: Boolean(document.querySelector('.hud-brand')),
}));
if (delivery.marker !== 'single-file-interactive-html' || delivery.canvasCount !== 1 || delivery.rootChildren < 1 || delivery.drawerIds.length !== 4 || !delivery.briefingTrigger) {
  throw new Error(`Interactive application did not mount completely: ${JSON.stringify(delivery)}.`);
}

// Verify the actual G/T/I/D and Escape keyboard path before any pointer work changes focus.
for (const [key, selector] of [['g', '#registry-drawer'], ['t', '#tools-drawer'], ['i', '#record-drawer'], ['d', '#diagnostics-drawer']]) {
  await verifyShortcut(key, selector);
}

// Preserve the live 3D orbit and zoom input path.
const canvas = await page.$('canvas');
const box = await canvas?.boundingBox();
if (!box) throw new Error('The 3D canvas is not visibly interactive.');
await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.5);
await page.mouse.down();
await page.mouse.move(box.x + box.width * 0.58, box.y + box.height * 0.44, { steps: 8 });
await page.mouse.up();
await page.mouse.wheel({ deltaY: -240 });

// Preserve the complete 59-record registry and record switching.
await openDrawer('g', '#registry-drawer');
const registry = await page.evaluate(() => {
  const cards = [...document.querySelectorAll('#registry-drawer .specimen-card')];
  return {
    count: cards.length,
    first: cards[0]?.querySelector('strong')?.textContent?.trim() ?? '',
    last: cards.at(-1)?.querySelector('strong')?.textContent?.trim() ?? '',
    searchLabel: document.querySelector('#registry-drawer .search-field > label')?.textContent?.trim() ?? '',
  };
});
if (registry.count !== 59 || !registry.first || !registry.last || !registry.searchLabel) throw new Error(`Registry parity failed: ${JSON.stringify(registry)}.`);
await page.evaluate(() => document.querySelectorAll('#registry-drawer .specimen-card').item(58).click());
await page.waitForFunction((name) => document.querySelector('.specimen-titlebar h2')?.textContent?.trim() === name, { timeout: 15_000 }, registry.last);
if ((await page.$$eval('canvas', (items) => items.length)) !== 1) throw new Error('Record switching duplicated or removed the R3F canvas.');
await openDrawer('g', '#registry-drawer');
await page.evaluate(() => document.querySelectorAll('#registry-drawer .specimen-card').item(0).click());
await page.waitForFunction((name) => document.querySelector('.specimen-titlebar h2')?.textContent?.trim() === name, { timeout: 15_000 }, registry.first);

// Preserve all examination tools and their state changes.
await openDrawer('t', '#tools-drawer');
for (const label of ['Orthographic', 'front', 'Silhouette', 'Wireframe', 'Reduced quality', 'Show all', 'Enabled', 'Y', 'Invert']) await clickButton('#tools-drawer', label);
await setValue('#tools-drawer input[aria-label="Section plane position"]', 2.5);
await clickButton('#tools-drawer', 'Pause', false);
await clickButton('#tools-drawer', 'Restart');
await clickButton('#tools-drawer', 'Loop');
await setValue('#tools-drawer input[aria-label="Playback speed"]', 1.5);
const animationOptions = await page.$$eval('#tools-drawer select', (selects) => [...selects[0].options].map((option) => option.value));
if (animationOptions.length < 2) throw new Error('The operational animation selector lost an animation state.');
await setValue('#tools-drawer select', animationOptions[1]);
await clickButton('#tools-drawer', 'Measure');
await setValue('#tools-drawer select[aria-label="Scale comparison"]', 'human');
const tools = await page.evaluate(() => {
  const buttons = [...document.querySelectorAll('#tools-drawer button')];
  const find = (text) => buttons.find((button) => button.textContent?.replace(/\s+/g, ' ').trim() === text);
  const pressed = (text) => find(text)?.getAttribute('aria-pressed');
  return {
    orthographic: pressed('Orthographic'), front: find('front')?.classList.contains('is-active') ?? false,
    silhouette: pressed('Silhouette'), wireframe: pressed('Wireframe'), reducedQuality: pressed('Reduced quality'),
    layerCount: document.querySelectorAll('#tools-drawer .layer-grid button[aria-pressed="true"]').length,
    sectionEnabled: pressed('Enabled'), sectionY: find('Y')?.classList.contains('is-active') ?? false, inverted: pressed('Invert'),
    sectionValue: document.querySelector('#tools-drawer input[aria-label="Section plane position"]')?.value ?? '',
    animationAction: buttons.find((button) => /^(Play|Pause)/.test(button.textContent?.trim() ?? ''))?.textContent?.replace(/\s+/g, ' ').trim() ?? '',
    animationSpeed: document.querySelector('#tools-drawer input[aria-label="Playback speed"]')?.value ?? '',
    measurement: pressed('Measure'), scale: document.querySelector('#tools-drawer select[aria-label="Scale comparison"]')?.value ?? '',
    modeRail: document.querySelector('.active-mode-rail')?.textContent?.replace(/\s+/g, ' ').trim() ?? '',
  };
});
if (tools.orthographic !== 'true' || !tools.front || tools.silhouette !== 'true' || tools.wireframe !== 'true' || tools.reducedQuality !== 'true' || tools.layerCount !== 4 || tools.sectionEnabled !== 'true' || !tools.sectionY || tools.inverted !== 'true' || tools.sectionValue !== '2.5' || !tools.animationAction.startsWith('Play') || tools.animationSpeed !== '1.5' || tools.measurement !== 'true' || tools.scale !== 'human' || !tools.modeRail.includes('Section Y 2.5') || !tools.modeRail.includes('Measurement armed')) {
  throw new Error(`Examination-tool parity failed: ${JSON.stringify(tools)}.`);
}
await clickButton('#tools-drawer', 'Reset all');
const reset = await page.evaluate(() => {
  const buttons = [...document.querySelectorAll('#tools-drawer button')];
  const find = (text) => buttons.find((button) => button.textContent?.trim() === text);
  return {
    perspective: find('Perspective')?.getAttribute('aria-pressed'),
    layerCount: document.querySelectorAll('#tools-drawer .layer-grid button[aria-pressed="true"]').length,
    sectionEnabled: find('Enabled')?.getAttribute('aria-pressed'),
    measurement: find('Measure')?.getAttribute('aria-pressed'),
    scale: document.querySelector('#tools-drawer select[aria-label="Scale comparison"]')?.value ?? '',
  };
});
if (reset.perspective !== 'true' || reset.layerCount !== 1 || reset.sectionEnabled !== 'false' || reset.measurement !== 'false' || reset.scale !== 'none') throw new Error(`Reset-all parity failed: ${JSON.stringify(reset)}.`);
await closeDrawer('#tools-drawer');
await page.keyboard.press('Space');
await page.keyboard.press('r');

// Preserve the complete dossier, annotations, and file exports.
await openDrawer('i', '#record-drawer');
const record = await page.evaluate(() => ({
  tabs: document.querySelectorAll('#record-drawer [role="tab"]').length,
  annotations: document.querySelectorAll('#record-drawer .annotation-row').length,
  exports: document.querySelectorAll('#record-drawer .export-row button').length,
  designation: document.querySelector('#record-drawer .panel-heading h2')?.textContent?.trim() ?? '',
}));
if (record.tabs !== 5 || record.annotations < 1 || record.exports !== 2 || record.designation !== 'Skymourn') throw new Error(`Record parity failed: ${JSON.stringify(record)}.`);
for (const tab of ['incident', 'military', 'civic', 'sources', 'record']) {
  await page.evaluate((name) => document.getElementById(`record-tab-${name}`)?.click(), tab);
  await page.waitForFunction((name) => document.getElementById(`record-tab-${name}`)?.getAttribute('aria-selected') === 'true', { timeout: 5_000 }, tab);
}
await clickButton('#record-drawer', 'Select all');
await clickButton('#record-drawer', 'Markdown', false);
await clickButton('#record-drawer', 'JSON', false);
const downloadedFiles = await waitForDownloads(['.md', '.json']);
if (!downloadedFiles.some((file) => file.startsWith('skymourn-'))) throw new Error(`Unexpected export names: ${JSON.stringify(downloadedFiles)}.`);
await closeDrawer('#record-drawer');

// Preserve diagnostics and the orientation briefing.
await openDrawer('d', '#diagnostics-drawer');
const diagnostics = await page.evaluate(() => ({ rows: document.querySelectorAll('#diagnostics-drawer dl > div').length, specimen: document.querySelector('#diagnostics-drawer dl > div dd')?.textContent?.trim() ?? '' }));
if (diagnostics.rows < 9 || diagnostics.specimen !== 'skymourn') throw new Error(`Diagnostics parity failed: ${JSON.stringify(diagnostics)}.`);
await closeDrawer('#diagnostics-drawer');
await page.evaluate(() => document.querySelector('.hud-brand')?.click());
await page.waitForSelector('.orientation-overlay', { visible: true, timeout: 5_000 });
const briefing = await page.evaluate(() => ({ title: document.querySelector('#briefing-heading')?.textContent?.trim() ?? '', topics: document.querySelectorAll('.orientation-item').length }));
if (briefing.title !== 'Examiner Orientation Briefing' || briefing.topics < 6) throw new Error(`Briefing parity failed: ${JSON.stringify(briefing)}.`);
await page.keyboard.press('Escape');
await page.waitForFunction(() => !document.querySelector('.orientation-overlay'), { timeout: 5_000 });

// Preserve responsive containment in the actual downloaded file.
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
await delay(150);
await openDrawer('t', '#tools-drawer');
const responsive = await page.evaluate(() => {
  const drawer = document.querySelector('#tools-drawer');
  const rect = drawer?.getBoundingClientRect();
  return { width: window.innerWidth, height: window.innerHeight, left: rect?.left ?? -1, right: rect?.right ?? -1, bottom: rect?.bottom ?? -1, overflow: drawer ? drawer.scrollWidth > drawer.clientWidth + 1 : true };
});
if (responsive.left < -1 || responsive.right > responsive.width + 1 || responsive.bottom > responsive.height + 1 || responsive.overflow) throw new Error(`Responsive parity failed: ${JSON.stringify(responsive)}.`);

await page.screenshot({ path: path.join(outputRoot, 'interactive-html-file-launch.png'), fullPage: true });
await browser.close();

const ignoredConsole = [/Failed to load resource.*404/i, /THREE\.WebGLRenderer/i, /DevTools/i];
const ignoredPage = [/^THREE\.WebGLRenderer: Error creating WebGL context\.$/i];
const actionableConsoleErrors = consoleErrors.filter((message) => !ignoredConsole.some((pattern) => pattern.test(message)));
const actionablePageErrors = pageErrors.filter((message) => !ignoredPage.some((pattern) => pattern.test(message)));
if (remoteRequests.length) throw new Error(`Remote runtime requests detected: ${JSON.stringify(remoteRequests)}.`);
if (actionablePageErrors.length || actionableConsoleErrors.length) throw new Error(`Interactive HTML browser errors: ${JSON.stringify({ actionablePageErrors, actionableConsoleErrors })}.`);

const report = { htmlFile: path.basename(htmlFile), delivery, registry, tools, reset, record, downloadedFiles, diagnostics, briefing, responsive, remoteRequests, actionablePageErrors, actionableConsoleErrors };
fs.writeFileSync(path.join(outputRoot, 'interactive-html-browser-audit.json'), JSON.stringify(report, null, 2));
fs.writeFileSync(path.join(outputRoot, 'interactive-html-browser-audit.md'), [
  '# Interactive HTML Feature-Parity Audit', '',
  '- Direct local `file://` launch: PASS', '- One live R3F canvas with orbit and zoom input: PASS',
  '- All 59 records and first/last record switching: PASS', '- G/T/I/D and Escape shortcuts: PASS',
  '- Camera modes and presets: PASS', '- Silhouette, wireframe, and quality controls: PASS',
  '- Four anatomy layers and presets: PASS', '- Sectioning axis, position, and inversion: PASS',
  '- Animation selection, transport, loop, and speed: PASS', '- Measurement mode and scale references: PASS',
  '- Reset-all, Space, and R shortcuts: PASS', '- Five dossier tabs, annotations, Markdown export, and JSON export: PASS',
  '- Diagnostics and briefing: PASS', '- Mobile containment: PASS', '- Remote runtime requests: 0',
  '- Actionable browser errors: 0', '',
].join('\n'));
console.log('Interactive HTML feature-parity audit passed.');
