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
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--allow-file-access-from-files',
    '--enable-webgl',
    '--ignore-gpu-blocklist',
    '--use-angle=swiftshader',
  ],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

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

await page.goto(pathToFileURL(htmlFile).toString(), { waitUntil: 'load', timeout: 45_000 });
await page.waitForSelector('canvas[data-interaction-ready="true"]', { visible: true, timeout: 30_000 });
await page.waitForFunction(() => {
  const canvas = document.querySelector('canvas');
  return Boolean(canvas?.dataset.cameraState && canvas.dataset.fittedRecord === 'skymourn');
}, { timeout: 30_000 });
await new Promise((resolve) => setTimeout(resolve, 800));

const initial = await page.evaluate(() => {
  const canvas = document.querySelector('canvas');
  const rect = canvas.getBoundingClientRect();
  return {
    activeRecord: document.querySelector('.specimen-titlebar h2')?.textContent?.trim() ?? '',
    viewport: { width: window.innerWidth, height: window.innerHeight },
    canvas: { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom, width: rect.width, height: rect.height },
    fittedRecord: canvas.dataset.fittedRecord,
    cameraState: canvas.dataset.cameraState,
    interactionCount: Number(canvas.dataset.cameraInteractionCount ?? '0'),
    handles: [...document.querySelectorAll('.global-hud button')].map((button) => {
      const box = button.getBoundingClientRect();
      const style = getComputedStyle(button);
      return {
        controls: button.getAttribute('aria-controls'),
        label: button.getAttribute('aria-label'),
        left: box.left,
        top: box.top,
        right: box.right,
        bottom: box.bottom,
        width: box.width,
        height: box.height,
        opacity: Number.parseFloat(style.opacity),
        visibility: style.visibility,
        display: style.display,
        pointerEvents: style.pointerEvents,
      };
    }),
  };
});

if (initial.activeRecord !== 'Skymourn' || initial.fittedRecord !== 'skymourn') throw new Error(`Skymourn did not mount and fit: ${JSON.stringify(initial)}.`);
if (initial.canvas.width < initial.viewport.width * 0.96 || initial.canvas.height < initial.viewport.height * 0.96) throw new Error(`Canvas is not full viewport: ${JSON.stringify(initial.canvas)}.`);
if (initial.handles.length !== 5) throw new Error(`Expected five visible edge controls, received ${initial.handles.length}.`);
for (const handle of initial.handles) {
  if (handle.opacity < 0.65 || handle.visibility !== 'visible' || handle.display === 'none' || handle.pointerEvents !== 'auto') throw new Error(`Edge control is not discoverable: ${JSON.stringify(handle)}.`);
  if (handle.width < 30 || handle.height < 30 || handle.left < -1 || handle.top < -1 || handle.right > initial.viewport.width + 1 || handle.bottom > initial.viewport.height + 1) throw new Error(`Edge control is not physically usable: ${JSON.stringify(handle)}.`);
}

async function clickHandle(controls, drawerSelector) {
  const handle = await page.$(`[aria-controls="${controls}"]`);
  const box = await handle?.boundingBox();
  if (!box) throw new Error(`Missing physical handle for ${controls}.`);
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await page.waitForFunction((selector) => {
    const drawer = document.querySelector(selector);
    if (!(drawer instanceof HTMLElement) || !drawer.classList.contains('is-open')) return false;
    const style = getComputedStyle(drawer);
    const rect = drawer.getBoundingClientRect();
    return style.visibility === 'visible'
      && style.pointerEvents === 'auto'
      && Number.parseFloat(style.opacity) > 0.9
      && rect.width >= 200
      && rect.height >= 200;
  }, { timeout: 10_000 }, drawerSelector);
  await page.keyboard.press('Escape');
  await page.waitForFunction((selector) => !document.querySelector(selector)?.classList.contains('is-open'), { timeout: 10_000 }, drawerSelector);
  await new Promise((resolve) => setTimeout(resolve, 220));
}

await clickHandle('registry-drawer', '#registry-drawer');
await clickHandle('tools-drawer', '#tools-drawer');
await clickHandle('record-drawer', '#record-drawer');
await clickHandle('diagnostics-drawer', '#diagnostics-drawer');

const canvas = await page.$('canvas');
const box = await canvas?.boundingBox();
if (!box) throw new Error('Canvas lost its physical bounding box.');
const start = await page.evaluate(() => ({
  state: document.querySelector('canvas')?.dataset.cameraState ?? '',
  count: Number(document.querySelector('canvas')?.dataset.cameraInteractionCount ?? '0'),
}));
const x = box.x + box.width * 0.52;
const y = box.y + box.height * 0.48;
await page.mouse.move(x, y);
await page.mouse.down({ button: 'left' });
await page.mouse.move(x + 260, y + 95, { steps: 18 });
await page.mouse.up({ button: 'left' });
await page.waitForFunction(({ state, count }) => {
  const target = document.querySelector('canvas');
  return Boolean(target?.dataset.cameraState && target.dataset.cameraState !== state && Number(target.dataset.cameraInteractionCount ?? '0') > count);
}, { timeout: 10_000 }, start);
await new Promise((resolve) => setTimeout(resolve, 900));
const afterOrbit = await page.evaluate(() => ({
  state: document.querySelector('canvas')?.dataset.cameraState ?? '',
  count: Number(document.querySelector('canvas')?.dataset.cameraInteractionCount ?? '0'),
}));

await page.mouse.move(x, y);
await page.mouse.wheel({ deltaY: -420 });
await page.waitForFunction((state) => document.querySelector('canvas')?.dataset.cameraState !== state, { timeout: 10_000 }, afterOrbit.state);
await new Promise((resolve) => setTimeout(resolve, 700));
const afterZoom = await page.evaluate(() => ({
  state: document.querySelector('canvas')?.dataset.cameraState ?? '',
  count: Number(document.querySelector('canvas')?.dataset.cameraInteractionCount ?? '0'),
}));

if (afterOrbit.state === start.state || afterOrbit.count <= start.count) throw new Error(`Physical drag did not orbit: ${JSON.stringify({ start, afterOrbit })}.`);
if (afterZoom.state === afterOrbit.state || afterZoom.count <= afterOrbit.count) throw new Error(`Physical wheel did not zoom: ${JSON.stringify({ afterOrbit, afterZoom })}.`);

await page.screenshot({ path: path.join(outputRoot, 'interactive-html-physical-input.png'), fullPage: true });
await browser.close();

if (remoteRequests.length) throw new Error(`Direct HTML made remote requests: ${JSON.stringify(remoteRequests)}.`);
if (pageErrors.length || consoleErrors.length) throw new Error(`Direct HTML raised runtime errors: ${JSON.stringify({ pageErrors, consoleErrors })}.`);

fs.writeFileSync(path.join(outputRoot, 'interactive-html-physical-input.json'), JSON.stringify({ initial, start, afterOrbit, afterZoom }, null, 2));
console.log('Interactive HTML physical pointer, orbit, zoom, and handle audit passed.');
