import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import puppeteer from 'puppeteer';

const root = process.env.GITHUB_WORKSPACE ?? process.cwd();
const htmlFile = path.resolve(root, process.env.DRAKKEN_INTERACTIVE_HTML ?? 'dist-interactive-html/Drakken_Field_Guide_Interactive.html');
if (!fs.existsSync(htmlFile)) throw new Error(`Missing HTML: ${htmlFile}`);

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--allow-file-access-from-files', '--enable-webgl', '--ignore-gpu-blocklist', '--use-angle=swiftshader'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
await page.goto(pathToFileURL(htmlFile).toString(), { waitUntil: 'load', timeout: 45_000 });
await page.waitForSelector('canvas[data-interaction-ready="true"]', { visible: true, timeout: 30_000 });
await new Promise((resolve) => setTimeout(resolve, 800));

const handle = await page.$('[aria-controls="registry-drawer"]');
const box = await handle?.boundingBox();
if (!box) throw new Error('Registry handle has no box.');
const hitBefore = await page.evaluate(({ x, y }) => {
  const node = document.elementFromPoint(x, y);
  return { tag: node?.tagName, className: node?.className, label: node?.getAttribute?.('aria-label') };
}, { x: box.x + box.width / 2, y: box.y + box.height / 2 });
await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
await new Promise((resolve) => setTimeout(resolve, 1000));

const state = await page.evaluate(() => {
  const drawer = document.querySelector('#registry-drawer');
  const style = getComputedStyle(drawer);
  const rect = drawer.getBoundingClientRect();
  return {
    className: drawer.className,
    ariaHidden: drawer.getAttribute('aria-hidden'),
    inert: drawer.hasAttribute('inert'),
    opacity: style.opacity,
    visibility: style.visibility,
    display: style.display,
    pointerEvents: style.pointerEvents,
    transform: style.transform,
    zIndex: style.zIndex,
    width: rect.width,
    height: rect.height,
    left: rect.left,
    right: rect.right,
    activeTag: document.activeElement?.tagName,
    activeClass: document.activeElement?.className,
    bodyClass: document.body.className,
  };
});
console.log(`DRAWER_STATE ${JSON.stringify({ hitBefore, state })}`);
await browser.close();
if (!state.className.includes('is-open') || state.visibility !== 'visible' || state.pointerEvents !== 'auto' || Number.parseFloat(state.opacity) < 0.9) process.exitCode = 1;
