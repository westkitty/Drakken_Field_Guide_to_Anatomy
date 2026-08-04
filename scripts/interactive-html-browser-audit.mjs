import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import puppeteer from 'puppeteer';

const projectRoot = process.env.GITHUB_WORKSPACE ?? process.cwd();
const htmlFile = path.resolve(
  projectRoot,
  process.env.DRAKKEN_INTERACTIVE_HTML ?? 'dist-interactive-html/Drakken_Field_Guide_Interactive.html',
);
const outputRoot = path.resolve(
  projectRoot,
  process.env.DRAKKEN_AUDIT_OUTPUT ?? 'polish-browser-audit-output',
);

if (!fs.existsSync(htmlFile)) {
  throw new Error(`Interactive HTML package is missing: ${htmlFile}`);
}
fs.mkdirSync(outputRoot, { recursive: true });

const browser = await puppeteer.launch({
  headless: true,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--allow-file-access-from-files',
    '--use-gl=swiftshader',
  ],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

const remoteRequests = [];
const pageErrors = [];
const consoleErrors = [];
page.on('request', (request) => {
  const url = request.url();
  if (/^https?:/i.test(url)) remoteRequests.push(url);
});
page.on('pageerror', (error) => pageErrors.push(error.message));
page.on('console', (message) => {
  if (message.type() === 'error') consoleErrors.push(message.text());
});

const fileUrl = new URL(pathToFileURL(htmlFile));
fileUrl.searchParams.set('audit', '1');
await page.goto(fileUrl.toString(), { waitUntil: 'load', timeout: 45_000 });
await page.waitForSelector('#registry-drawer', { timeout: 30_000 });
await page.waitForSelector('canvas', { timeout: 30_000 });

const deliveryState = await page.evaluate(() => ({
  delivery: document.body.dataset.drakkenDelivery,
  sourceRevision: document.querySelector('meta[name="drakken-source-revision"]')?.getAttribute('content') ?? null,
  canvasCount: document.querySelectorAll('canvas').length,
  drawerCount: document.querySelectorAll('.drawer-panel').length,
  rootChildren: document.querySelector('#root')?.children.length ?? 0,
}));

if (deliveryState.delivery !== 'single-file-interactive-html') {
  throw new Error(`Delivery marker missing or incorrect: ${JSON.stringify(deliveryState)}.`);
}
if (deliveryState.canvasCount !== 1 || deliveryState.drawerCount < 4 || deliveryState.rootChildren < 1) {
  throw new Error(`Interactive application did not mount completely: ${JSON.stringify(deliveryState)}.`);
}

await page.keyboard.press('g');
await page.waitForFunction(() => document.querySelector('#registry-drawer')?.classList.contains('is-open'), { timeout: 10_000 });
const registryState = await page.evaluate(() => ({
  open: document.querySelector('#registry-drawer')?.classList.contains('is-open') ?? false,
  visibleCards: document.querySelectorAll('#registry-drawer .specimen-card').length,
  searchLabel: document.querySelector('#registry-drawer .search-field > label')?.textContent?.trim() ?? '',
}));
if (!registryState.open || registryState.visibleCards < 1 || !registryState.searchLabel) {
  throw new Error(`Registry interaction failed: ${JSON.stringify(registryState)}.`);
}
await page.keyboard.press('Escape');

await page.keyboard.press('t');
await page.waitForFunction(() => document.querySelector('#tools-drawer')?.classList.contains('is-open'), { timeout: 10_000 });
const toolsState = await page.evaluate(() => ({
  open: document.querySelector('#tools-drawer')?.classList.contains('is-open') ?? false,
  buttons: document.querySelectorAll('#tools-drawer button').length,
  ranges: document.querySelectorAll('#tools-drawer input[type="range"]').length,
}));
if (!toolsState.open || toolsState.buttons < 8 || toolsState.ranges < 1) {
  throw new Error(`Tools interaction failed: ${JSON.stringify(toolsState)}.`);
}

await page.screenshot({
  path: path.join(outputRoot, 'interactive-html-file-launch.png'),
  fullPage: true,
});
await browser.close();

const ignoredConsolePatterns = [/Failed to load resource.*404/i, /THREE\.WebGLRenderer/i, /DevTools/i];
const ignoredPageErrorPatterns = [/^THREE\.WebGLRenderer: Error creating WebGL context\.$/i];
const actionableConsoleErrors = consoleErrors.filter((message) => !ignoredConsolePatterns.some((pattern) => pattern.test(message)));
const actionablePageErrors = pageErrors.filter((message) => !ignoredPageErrorPatterns.some((pattern) => pattern.test(message)));

if (remoteRequests.length) {
  throw new Error(`Interactive HTML attempted remote runtime requests: ${JSON.stringify(remoteRequests)}.`);
}
if (actionablePageErrors.length || actionableConsoleErrors.length) {
  throw new Error(`Interactive HTML produced browser errors: ${JSON.stringify({ actionablePageErrors, actionableConsoleErrors })}.`);
}

const report = {
  htmlFile: path.basename(htmlFile),
  deliveryState,
  registryState,
  toolsState,
  remoteRequests,
  actionablePageErrors,
  actionableConsoleErrors,
};
fs.writeFileSync(
  path.join(outputRoot, 'interactive-html-browser-audit.json'),
  JSON.stringify(report, null, 2),
);
fs.writeFileSync(
  path.join(outputRoot, 'interactive-html-browser-audit.md'),
  [
    '# Interactive HTML Browser Audit',
    '',
    '- Opened directly from a local `file://` URL: PASS',
    '- Application root and 3D canvas mounted: PASS',
    '- Registry opened from the `G` keyboard shortcut: PASS',
    '- Tools opened from the `T` keyboard shortcut: PASS',
    '- Remote runtime requests: 0',
    '- Actionable browser errors: 0',
    '',
  ].join('\n'),
);
console.log('Interactive HTML browser audit passed.');
