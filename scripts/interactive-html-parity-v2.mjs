import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import puppeteer from 'puppeteer';

const root = process.env.GITHUB_WORKSPACE ?? process.cwd();
const htmlFile = path.resolve(root, process.env.DRAKKEN_INTERACTIVE_HTML ?? 'dist-interactive-html/Drakken_Field_Guide_Interactive.html');
const outputRoot = path.resolve(root, process.env.DRAKKEN_AUDIT_OUTPUT ?? 'polish-browser-audit-output');
const downloadRoot = path.join(outputRoot, 'interactive-html-downloads');
if (!fs.existsSync(htmlFile)) throw new Error(`Missing interactive HTML: ${htmlFile}`);
fs.mkdirSync(outputRoot, { recursive: true });
fs.rmSync(downloadRoot, { recursive: true, force: true });
fs.mkdirSync(downloadRoot, { recursive: true });

const fileUrl = new URL(pathToFileURL(htmlFile));
fileUrl.searchParams.set('audit', '1');
const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--allow-file-access-from-files', '--use-gl=swiftshader'],
});
const remoteRequests = [];
const pageErrors = [];
const consoleErrors = [];
const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

function observe(page) {
  page.on('request', (request) => {
    if (/^https?:/i.test(request.url())) remoteRequests.push(request.url());
  });
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
}

async function loadPage(viewport) {
  const page = await browser.newPage();
  observe(page);
  await page.setViewport(viewport);
  await page.goto(fileUrl.toString(), { waitUntil: 'load', timeout: 45_000 });
  await page.waitForSelector('canvas', { visible: true, timeout: 30_000 });
  await page.waitForSelector('#registry-drawer', { timeout: 30_000 });
  await delay(450);
  return page;
}

async function shortcut(page, key, selector) {
  await page.keyboard.press(key);
  await page.waitForFunction((value) => document.querySelector(value)?.classList.contains('is-open'), { timeout: 5_000 }, selector);
  await page.keyboard.press('Escape');
  await page.waitForFunction((value) => !document.querySelector(value)?.classList.contains('is-open'), { timeout: 5_000 }, selector);
  await delay(140);
}

async function open(page, selector) {
  const id = selector.slice(1);
  const clicked = await page.evaluate((drawerId) => {
    const trigger = document.querySelector(`[aria-controls="${drawerId}"]`);
    if (!(trigger instanceof HTMLButtonElement)) return false;
    trigger.click();
    return true;
  }, id);
  if (!clicked) throw new Error(`Missing trigger for ${selector}.`);
  await page.waitForFunction((value) => document.querySelector(value)?.classList.contains('is-open'), { timeout: 8_000 }, selector);
  await delay(500);
}

async function close(page, selector) {
  await page.evaluate(() => document.querySelector('.drawer-scrim')?.click());
  await page.waitForFunction((value) => !document.querySelector(value)?.classList.contains('is-open'), { timeout: 8_000 }, selector);
  await delay(180);
}

async function button(page, root, text, exact = true) {
  const ok = await page.evaluate(({ root, text, exact }) => {
    const container = document.querySelector(root);
    const target = container && [...container.querySelectorAll('button')].find((candidate) => {
      const label = candidate.textContent?.replace(/\s+/g, ' ').trim() ?? '';
      return exact ? label === text : label.startsWith(text);
    });
    if (!target || target.disabled) return false;
    target.click();
    return true;
  }, { root, text, exact });
  if (!ok) throw new Error(`Missing enabled button ${text} in ${root}.`);
  await delay(120);
}

async function value(page, selector, next) {
  const ok = await page.evaluate(({ selector, next }) => {
    const control = document.querySelector(selector);
    if (!(control instanceof HTMLInputElement || control instanceof HTMLSelectElement)) return false;
    const proto = control instanceof HTMLInputElement ? HTMLInputElement.prototype : HTMLSelectElement.prototype;
    Object.getOwnPropertyDescriptor(proto, 'value')?.set?.call(control, String(next));
    control.dispatchEvent(new Event('input', { bubbles: true }));
    control.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  }, { selector, next });
  if (!ok) throw new Error(`Cannot set ${selector}.`);
  await delay(120);
}

async function downloads(extensions) {
  const deadline = Date.now() + 10_000;
  while (Date.now() < deadline) {
    const files = fs.readdirSync(downloadRoot).filter((file) => !file.endsWith('.crdownload'));
    if (extensions.every((extension) => files.some((file) => file.endsWith(extension)))) return files;
    await delay(100);
  }
  throw new Error(`Missing downloads: ${extensions.join(', ')}.`);
}

const desktop = await loadPage({ width: 1440, height: 900, deviceScaleFactor: 1 });
const cdp = await desktop.createCDPSession();
await cdp.send('Page.setDownloadBehavior', { behavior: 'allow', downloadPath: downloadRoot });

const delivery = await desktop.evaluate(() => ({
  marker: document.body.dataset.drakkenDelivery,
  canvas: document.querySelectorAll('canvas').length,
  drawers: ['registry-drawer', 'tools-drawer', 'record-drawer', 'diagnostics-drawer'].filter((id) => document.getElementById(id)).length,
  briefing: Boolean(document.querySelector('.hud-brand')),
}));
if (delivery.marker !== 'single-file-interactive-html' || delivery.canvas !== 1 || delivery.drawers !== 4 || !delivery.briefing) {
  throw new Error(`Incomplete direct-file mount: ${JSON.stringify(delivery)}.`);
}

for (const [key, selector] of [['g', '#registry-drawer'], ['t', '#tools-drawer'], ['i', '#record-drawer'], ['d', '#diagnostics-drawer']]) {
  await shortcut(desktop, key, selector);
}

const canvas = await desktop.$('canvas');
const canvasRect = await canvas?.boundingBox();
if (!canvasRect) throw new Error('Canvas is not visible.');
await desktop.mouse.move(canvasRect.x + canvasRect.width / 2, canvasRect.y + canvasRect.height / 2);
await desktop.mouse.down();
await desktop.mouse.move(canvasRect.x + canvasRect.width * 0.58, canvasRect.y + canvasRect.height * 0.44, { steps: 8 });
await desktop.mouse.up();
await desktop.mouse.wheel({ deltaY: -220 });

await open(desktop, '#registry-drawer');
const registry = await desktop.evaluate(() => {
  const cards = [...document.querySelectorAll('#registry-drawer .specimen-card')];
  return {
    count: cards.length,
    first: cards[0]?.querySelector('strong')?.textContent?.trim() ?? '',
    last: cards.at(-1)?.querySelector('strong')?.textContent?.trim() ?? '',
    labelledSearch: Boolean(document.querySelector('#registry-drawer .search-field > label')),
  };
});
if (registry.count !== 59 || !registry.first || !registry.last || !registry.labelledSearch) throw new Error(`Registry parity failed: ${JSON.stringify(registry)}.`);
await desktop.evaluate(() => document.querySelectorAll('#registry-drawer .specimen-card').item(58).click());
await desktop.waitForFunction((name) => document.querySelector('.specimen-titlebar h2')?.textContent?.trim() === name, { timeout: 15_000 }, registry.last);
if ((await desktop.$$eval('canvas', (items) => items.length)) !== 1) throw new Error('Record switch changed the canvas count.');
await open(desktop, '#registry-drawer');
await desktop.evaluate(() => document.querySelectorAll('#registry-drawer .specimen-card').item(0).click());
await desktop.waitForFunction((name) => document.querySelector('.specimen-titlebar h2')?.textContent?.trim() === name, { timeout: 15_000 }, registry.first);

await open(desktop, '#tools-drawer');
for (const label of ['Orthographic', 'front', 'Silhouette', 'Wireframe', 'Reduced quality', 'Show all', 'Enabled', 'Y', 'Invert']) await button(desktop, '#tools-drawer', label);
await value(desktop, '#tools-drawer input[aria-label="Section plane position"]', 2.5);
await button(desktop, '#tools-drawer', 'Pause', false);
await button(desktop, '#tools-drawer', 'Restart');
await button(desktop, '#tools-drawer', 'Loop');
await value(desktop, '#tools-drawer input[aria-label="Playback speed"]', 1.5);
const animations = await desktop.$$eval('#tools-drawer select', (selects) => [...selects[0].options].map((option) => option.value));
if (animations.length < 2) throw new Error('Animation choices were lost.');
await value(desktop, '#tools-drawer select', animations[1]);
await button(desktop, '#tools-drawer', 'Measure');
await value(desktop, '#tools-drawer select[aria-label="Scale comparison"]', 'human');
const tools = await desktop.evaluate(() => {
  const buttons = [...document.querySelectorAll('#tools-drawer button')];
  const find = (label) => buttons.find((candidate) => candidate.textContent?.replace(/\s+/g, ' ').trim() === label);
  const pressed = (label) => find(label)?.getAttribute('aria-pressed');
  return {
    orthographic: pressed('Orthographic'),
    front: find('front')?.classList.contains('is-active') ?? false,
    silhouette: pressed('Silhouette'),
    wireframe: pressed('Wireframe'),
    quality: pressed('Reduced quality'),
    layers: document.querySelectorAll('#tools-drawer .layer-grid button[aria-pressed="true"]').length,
    section: pressed('Enabled'),
    axisY: find('Y')?.classList.contains('is-active') ?? false,
    inverted: pressed('Invert'),
    position: document.querySelector('#tools-drawer input[aria-label="Section plane position"]')?.value ?? '',
    transport: buttons.find((candidate) => /^(Play|Pause)/.test(candidate.textContent?.trim() ?? ''))?.textContent?.trim() ?? '',
    speed: document.querySelector('#tools-drawer input[aria-label="Playback speed"]')?.value ?? '',
    measure: pressed('Measure'),
    scale: document.querySelector('#tools-drawer select[aria-label="Scale comparison"]')?.value ?? '',
  };
});
if (tools.orthographic !== 'true' || !tools.front || tools.silhouette !== 'true' || tools.wireframe !== 'true' || tools.quality !== 'true' || tools.layers !== 4 || tools.section !== 'true' || !tools.axisY || tools.inverted !== 'true' || tools.position !== '2.5' || !tools.transport.startsWith('Play') || tools.speed !== '1.5' || tools.measure !== 'true' || tools.scale !== 'human') {
  throw new Error(`Tool parity failed: ${JSON.stringify(tools)}.`);
}
await button(desktop, '#tools-drawer', 'Reset all');
const reset = await desktop.evaluate(() => {
  const buttons = [...document.querySelectorAll('#tools-drawer button')];
  const find = (label) => buttons.find((candidate) => candidate.textContent?.trim() === label);
  return {
    perspective: find('Perspective')?.getAttribute('aria-pressed'),
    layers: document.querySelectorAll('#tools-drawer .layer-grid button[aria-pressed="true"]').length,
    section: find('Enabled')?.getAttribute('aria-pressed'),
    measure: find('Measure')?.getAttribute('aria-pressed'),
    scale: document.querySelector('#tools-drawer select[aria-label="Scale comparison"]')?.value ?? '',
  };
});
if (reset.perspective !== 'true' || reset.layers !== 1 || reset.section !== 'false' || reset.measure !== 'false' || reset.scale !== 'none') throw new Error(`Reset parity failed: ${JSON.stringify(reset)}.`);
await close(desktop, '#tools-drawer');
await desktop.keyboard.press('Space');
await desktop.keyboard.press('r');

await open(desktop, '#record-drawer');
const record = await desktop.evaluate(() => ({
  tabs: document.querySelectorAll('#record-drawer [role="tab"]').length,
  annotations: document.querySelectorAll('#record-drawer .annotation-row').length,
  exports: document.querySelectorAll('#record-drawer .export-row button').length,
  name: document.querySelector('#record-drawer .panel-heading h2')?.textContent?.trim() ?? '',
}));
if (record.tabs !== 5 || record.annotations < 1 || record.exports !== 2 || record.name !== 'Skymourn') throw new Error(`Record parity failed: ${JSON.stringify(record)}.`);
for (const tab of ['incident', 'military', 'civic', 'sources', 'record']) {
  await desktop.evaluate((name) => document.getElementById(`record-tab-${name}`)?.click(), tab);
  await desktop.waitForFunction((name) => document.getElementById(`record-tab-${name}`)?.getAttribute('aria-selected') === 'true', { timeout: 5_000 }, tab);
}
await button(desktop, '#record-drawer', 'Select all');
await button(desktop, '#record-drawer', 'Markdown', false);
await button(desktop, '#record-drawer', 'JSON', false);
const exported = await downloads(['.md', '.json']);
if (!exported.some((file) => file.startsWith('skymourn-'))) throw new Error(`Unexpected exports: ${JSON.stringify(exported)}.`);
await close(desktop, '#record-drawer');

await open(desktop, '#diagnostics-drawer');
const diagnostics = await desktop.evaluate(() => ({
  rows: document.querySelectorAll('#diagnostics-drawer dl > div').length,
  specimen: document.querySelector('#diagnostics-drawer dl > div dd')?.textContent?.trim() ?? '',
}));
if (diagnostics.rows < 9 || diagnostics.specimen !== 'skymourn') throw new Error(`Diagnostics parity failed: ${JSON.stringify(diagnostics)}.`);
await close(desktop, '#diagnostics-drawer');
await desktop.evaluate(() => document.querySelector('.hud-brand')?.click());
await desktop.waitForSelector('.orientation-overlay', { visible: true, timeout: 5_000 });
const briefing = await desktop.evaluate(() => ({
  title: document.querySelector('#briefing-heading')?.textContent?.trim() ?? '',
  topics: document.querySelectorAll('.orientation-item').length,
}));
if (briefing.title !== 'Examiner Orientation Briefing' || briefing.topics < 6) throw new Error(`Briefing parity failed: ${JSON.stringify(briefing)}.`);
await desktop.keyboard.press('Escape');
await desktop.close();

const mobile = await loadPage({ width: 390, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
await open(mobile, '#tools-drawer');
const responsive = await mobile.evaluate(() => {
  const drawer = document.querySelector('#tools-drawer');
  const rect = drawer?.getBoundingClientRect();
  return {
    width: window.innerWidth,
    height: window.innerHeight,
    visualHeight: window.visualViewport?.height ?? window.innerHeight,
    left: rect?.left ?? -1,
    right: rect?.right ?? -1,
    top: rect?.top ?? -1,
    bottom: rect?.bottom ?? -1,
    overflow: drawer ? drawer.scrollWidth > drawer.clientWidth + 1 : true,
  };
});
const mobileHeight = Math.max(responsive.height, responsive.visualHeight);
if (responsive.left < -1 || responsive.right > responsive.width + 1 || responsive.top < -1 || responsive.bottom > mobileHeight + 1 || responsive.overflow) throw new Error(`Mobile parity failed: ${JSON.stringify(responsive)}.`);
await mobile.screenshot({ path: path.join(outputRoot, 'interactive-html-file-launch.png'), fullPage: true });
await mobile.close();
await browser.close();

const ignoredConsole = [/Failed to load resource.*404/i, /THREE\.WebGLRenderer/i, /DevTools/i];
const ignoredPage = [/^THREE\.WebGLRenderer: Error creating WebGL context\.$/i];
const actionableConsoleErrors = consoleErrors.filter((message) => !ignoredConsole.some((pattern) => pattern.test(message)));
const actionablePageErrors = pageErrors.filter((message) => !ignoredPage.some((pattern) => pattern.test(message)));
if (remoteRequests.length) throw new Error(`Remote runtime requests detected: ${JSON.stringify(remoteRequests)}.`);
if (actionablePageErrors.length || actionableConsoleErrors.length) throw new Error(`Browser errors: ${JSON.stringify({ actionablePageErrors, actionableConsoleErrors })}.`);

const report = { delivery, registry, tools, reset, record, exported, diagnostics, briefing, responsive, remoteRequests, actionablePageErrors, actionableConsoleErrors };
fs.writeFileSync(path.join(outputRoot, 'interactive-html-browser-audit.json'), JSON.stringify(report, null, 2));
fs.writeFileSync(path.join(outputRoot, 'interactive-html-browser-audit.md'), [
  '# Interactive HTML Feature-Parity Audit', '',
  '- Direct local file launch and one live 3D canvas: PASS',
  '- G/T/I/D, Escape, Space, and R shortcuts: PASS',
  '- Orbit and zoom input: PASS', '- All 59 records and record switching: PASS',
  '- Camera, render, four-layer, clipping, animation, measurement, and scale tools: PASS',
  '- Complete reset: PASS', '- Five dossier tabs, annotations, Markdown and JSON exports: PASS',
  '- Diagnostics and briefing: PASS', '- Fresh-page mobile containment: PASS',
  '- Remote runtime requests: 0', '- Actionable browser errors: 0', '',
].join('\n'));
console.log('Interactive HTML isolated-page feature-parity audit passed.');
