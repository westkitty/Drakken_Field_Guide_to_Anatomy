import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();
const htmlFile = path.resolve(
  projectRoot,
  process.argv[2] ?? 'dist-interactive-html/Drakken_Field_Guide_Interactive.html',
);

if (!fs.existsSync(htmlFile)) {
  throw new Error(`Interactive HTML package is missing: ${htmlFile}`);
}

const html = fs.readFileSync(htmlFile, 'utf8');
const failures = [];

const requiredFragments = [
  '<!doctype html>',
  'id="root"',
  'data-drakken-delivery="single-file-interactive-html"',
  'name="drakken-delivery-format" content="single-file-interactive-html"',
  '<style data-drakken-inline=',
  '<script type="module"',
  'data-drakken-inline=',
];

for (const fragment of requiredFragments) {
  if (!html.includes(fragment)) failures.push(`Missing required fragment: ${fragment}`);
}

const forbiddenPatterns = [
  { label: 'external script source', pattern: /<script\b[^>]*\bsrc=["'][^"']+["']/i },
  { label: 'external stylesheet link', pattern: /<link\b[^>]*\brel=["']stylesheet["']/i },
  { label: 'module preload dependency', pattern: /<link\b[^>]*\brel=["']modulepreload["']/i },
  { label: 'remaining Vite asset path', pattern: /(?:src|href)=["'][^"']*assets\//i },
  { label: 'remote HTTP runtime reference', pattern: /(?:src|href)=["']https?:\/\//i },
  { label: 'source-map dependency', pattern: /sourceMappingURL=/i },
];

for (const { label, pattern } of forbiddenPatterns) {
  if (pattern.test(html)) failures.push(`Found ${label}.`);
}

const inlineScripts = html.match(/<script\b[^>]*data-drakken-inline=["'][^"']+["'][^>]*>/gi) ?? [];
const inlineStyles = html.match(/<style\b[^>]*data-drakken-inline=["'][^"']+["'][^>]*>/gi) ?? [];
if (inlineScripts.length !== 1) failures.push(`Expected one inline application script, found ${inlineScripts.length}.`);
if (inlineStyles.length !== 1) failures.push(`Expected one inline application stylesheet, found ${inlineStyles.length}.`);

const minimumUsefulSize = 500_000;
const size = fs.statSync(htmlFile).size;
if (size < minimumUsefulSize) failures.push(`Package is unexpectedly small: ${size} bytes.`);

if (failures.length) {
  throw new Error(`Interactive HTML validation failed:\n- ${failures.join('\n- ')}`);
}

console.log(`Interactive HTML package passed static validation (${size.toLocaleString('en-US')} bytes).`);
