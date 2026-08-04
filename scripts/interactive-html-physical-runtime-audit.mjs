import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import puppeteer from 'puppeteer';

const root = process.env.GITHUB_WORKSPACE ?? process.cwd();
const htmlFile = path.resolve(root, process.env.DRAKKEN_INTERACTIVE_HTML ?? 'dist-interactive-html/Drakken_Field_Guide_Interactive.html');
const outputRoot = path.resolve(root, process.env.DRAKKEN_AUDIT_OUTPUT ?? 'polish-browser-audit-output');
if (!fs.existsSync(htmlFile)) throw new Error(`Missing interactive HTML: ${htmlFile}`);
fs.mkdirSync(outputRoot, { recursive: true });

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--allow-file-access-from-files', '--enable-webgl', '--ignore-gpu-blocklist', '--use-angle=swiftshader'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

const remoteRequests = [];
const pageErrors = [];
const consoleErrors = [];
page.on('request', (request) => { if (/^https?:/i.test(request.url())) remoteRequests.push(request.url()); });
page.on('pageerror', (error) => pageErrors.push(error.message));
page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
await page.goto(pathToFileURL(htmlFile).toString(), { waitUntil: 'load', timeout: 45_000 });
await page.waitForSelector('canvas[data-interaction-ready="true"]', { visible: true, timeout: 30_000 });
await page.waitForFunction(() => {
  const canvas = document.querySelector('canvas');
  return Boolean(canvas?.dataset.cameraState && canvas.dataset.fittedRecord === 'skymourn');
}, { timeout: 30_000 });
await delay(900);

const initial = await page.evaluate(() => {
  const canvas = document.querySelector('canvas');
  const canvasRect = canvas.getBoundingClientRect();
  return {
    activeRecord: document.querySelector('.specimen-titlebar h2')?.textContent?.trim() ?? '',
    fittedRecord: canvas.dataset.fittedRecord,
    viewport: [window.innerWidth, window.innerHeight],
    canvas: [canvasRect.left, canvasRect.top, canvasRect.right, canvasRect.bottom],
    handles: [...document.querySelectorAll('.global-hud button')].map((button) => {
      const rect = button.getBoundingClientRect();
      const style = getComputedStyle(button);
      return {
        controls: button.getAttribute('aria-controls'),
        label: button.getAttribute('aria-label'),
        rect: [rect.left, rect.top, rect.right, rect.bottom],
        opacity: Number.parseFloat(style.opacity),
        visibility: style.visibility,
        pointerEvents: style.pointerEvents,
      };
    }),
  };
});
if (initial.activeRecord !== 'Skymourn' || initial.fittedRecord !== 'skymourn') throw new Error(`Skymourn did not mount and fit: ${JSON.stringify(initial)}.`);
if (initial.canvas[0] > 1 || initial.canvas[1] > 1 || initial.canvas[2] < initial.viewport[0] - 1 || initial.canvas[3] < initial.viewport[1] - 1) throw new Error(`Canvas is not full viewport: ${JSON.stringify(initial)}.`);
if (initial.handles.length !== 5) throw new Error(`Expected five handles, received ${initial.handles.length}.`);
for (const handle of initial.handles) {
  const [left, top, right, bottom] = handle.rect;
  if (handle.opacity < 0.65 || handle.visibility !== 'visible' || handle.pointerEvents !== 'auto' || right - left < 30 || bottom - top < 30) throw new Error(`Handle is not discoverable: ${JSON.stringify(handle)}.`);
}

const handleCases = [
  ['registry-drawer', '#registry-drawer'],
  ['tools-drawer', '#tools-drawer'],
  ['record-drawer', '#record-drawer'],
  ['diagnostics-drawer', '#diagnostics-drawer'],
];
const handleResults = [];
for (const [controls, drawerSelector] of handleCases) {
  await page.waitForFunction((value) => {
    const button = document.querySelector(`[aria-controls="${value}"]`);
    if (!(button instanceof HTMLElement)) return false;
    const style = getComputedStyle(button);
    return style.visibility === 'visible' && style.pointerEvents === 'auto' && Number.parseFloat(style.opacity) >= 0.65;
  }, { timeout: 10_000 }, controls);
  const handle = await page.$(`[aria-controls="${controls}"]`);
  const box = await handle?.boundingBox();
  if (!box) throw new Error(`No physical box for ${controls}.`);
  const point = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  const hit = await page.evaluate(({ x, y }) => {
    const node = document.elementFromPoint(x, y);
    return { controls: node?.getAttribute?.('aria-controls') ?? '', label: node?.getAttribute?.('aria-label') ?? '', tag: node?.tagName ?? '' };
  }, point);
  console.log(`HANDLE_START ${controls} ${JSON.stringify({ point, hit })}`);
  if (hit.controls !== controls) throw new Error(`${controls} is blocked: ${JSON.stringify(hit)}.`);
  await page.mouse.click(point.x, point.y);
  await delay(350);
  const opened = await page.evaluate((selector) => {
    const drawer = document.querySelector(selector);
    const rect = drawer.getBoundingClientRect();
    const style = getComputedStyle(drawer);
    return {
      className: drawer.className,
      ariaHidden: drawer.getAttribute('aria-hidden'),
      inert: drawer.hasAttribute('inert'),
      opacity: style.opacity,
      visibility: style.visibility,
      pointerEvents: style.pointerEvents,
      transform: style.transform,
      rect: [rect.left, rect.top, rect.right, rect.bottom],
    };
  }, drawerSelector);
  console.log(`HANDLE_STATE ${controls} ${JSON.stringify(opened)}`);
  const [left, top, right, bottom] = opened.rect;
  const visible = opened.className.includes('is-open')
    && opened.ariaHidden === 'false'
    && !opened.inert
    && opened.opacity === '1'
    && opened.visibility === 'visible'
    && opened.pointerEvents === 'auto'
    && right > 0
    && left < initial.viewport[0]
    && bottom > 0
    && top < initial.viewport[1];
  if (!visible) throw new Error(`${controls} failed physical opening: ${JSON.stringify(opened)}.`);
  handleResults.push({ controls, hit, opened });
  if (controls === 'registry-drawer' || controls === 'record-drawer') await page.screenshot({ path: path.join(outputRoot, `physical-${controls}.png`), fullPage: true });

  const closeButton = await page.$(`${drawerSelector} .mobile-close`);
  const closeBox = await closeButton?.boundingBox();
  if (!closeBox) throw new Error(`${controls} opened but its close control has no physical box.`);
  const closePoint = { x: closeBox.x + closeBox.width / 2, y: closeBox.y + closeBox.height / 2 };
  const closeHit = await page.evaluate(({ x, y }) => {
    const node = document.elementFromPoint(x, y);
    return { label: node?.getAttribute?.('aria-label') ?? '', tag: node?.tagName ?? '', className: typeof node?.className === 'string' ? node.className : '' };
  }, closePoint);
  if (!closeHit.label.startsWith('Close ')) throw new Error(`${controls} close button is blocked: ${JSON.stringify(closeHit)}.`);
  await page.mouse.click(closePoint.x, closePoint.y);
  await page.waitForFunction((selector) => !document.querySelector(selector)?.classList.contains('is-open'), { timeout: 10_000 }, drawerSelector);
  await delay(150);
}

const canvas = await page.$('canvas');
const canvasBox = await canvas?.boundingBox();
if (!canvasBox) throw new Error('Canvas has no physical box.');
const x = canvasBox.x + canvasBox.width * 0.52;
const y = canvasBox.y + canvasBox.height * 0.48;
const readCamera = () => page.evaluate(() => ({
  state: document.querySelector('canvas')?.dataset.cameraState ?? '',
  count: Number(document.querySelector('canvas')?.dataset.cameraInteractionCount ?? '0'),
}));

const beforeOrbit = await readCamera();
await page.mouse.move(x, y);
await page.mouse.down({ button: 'left' });
await page.mouse.move(x + 260, y + 95, { steps: 18 });
await page.mouse.up({ button: 'left' });
await delay(900);
const afterOrbit = await readCamera();
if (afterOrbit.state === beforeOrbit.state || afterOrbit.count <= beforeOrbit.count) throw new Error(`Left-drag did not orbit: ${JSON.stringify({ beforeOrbit, afterOrbit })}.`);

const beforePan = afterOrbit;
await page.mouse.move(x, y);
await page.mouse.down({ button: 'right' });
await page.mouse.move(x - 150, y + 80, { steps: 14 });
await page.mouse.up({ button: 'right' });
await delay(900);
const afterPan = await readCamera();
if (afterPan.state === beforePan.state || afterPan.count <= beforePan.count) throw new Error(`Right-drag did not pan: ${JSON.stringify({ beforePan, afterPan })}.`);

const beforeWheel = afterPan;
await page.mouse.move(x, y);
await page.mouse.wheel({ deltaY: 480 });
await delay(1000);
let afterWheel = await readCamera();
let wheelDirection = 'out';
if (afterWheel.state === beforeWheel.state || afterWheel.count <= beforeWheel.count) {
  await page.mouse.wheel({ deltaY: -960 });
  await delay(1000);
  afterWheel = await readCamera();
  wheelDirection = 'in';
}
if (afterWheel.state === beforeWheel.state || afterWheel.count <= beforeWheel.count) throw new Error(`Neither physical wheel direction changed the camera: ${JSON.stringify({ beforeWheel, afterWheel })}.`);

await page.screenshot({ path: path.join(outputRoot, 'physical-camera-after-input.png'), fullPage: true });
await browser.close();
if (remoteRequests.length) throw new Error(`Direct HTML made remote requests: ${JSON.stringify(remoteRequests)}.`);
if (pageErrors.length || consoleErrors.length) throw new Error(`Direct HTML raised runtime errors: ${JSON.stringify({ pageErrors, consoleErrors })}.`);

const report = { initial, handleResults, beforeOrbit, afterOrbit, beforePan, afterPan, beforeWheel, afterWheel, wheelDirection };
fs.writeFileSync(path.join(outputRoot, 'interactive-html-physical-runtime.json'), JSON.stringify(report, null, 2));
fs.writeFileSync(path.join(outputRoot, 'interactive-html-physical-runtime.md'), [
  '# Interactive HTML Physical Runtime Audit',
  '',
  '- Normal local file launch and Skymourn bounds fit: PASS',
  '- Five visible edge controls: PASS',
  '- Registry, Tools, Record, and Diagnostics opened through real pointer clicks: PASS',
  '- Each drawer closed through its real visible close control: PASS',
  '- Left-drag orbit changed camera state: PASS',
  '- Right-drag pan changed camera state: PASS',
  `- Physical wheel zoom changed camera state (${wheelDirection}): PASS`,
  '- Remote runtime requests: 0',
  '- Actionable browser errors: 0',
  '',
].join('\n'));
console.log('Interactive HTML physical runtime audit passed.');
