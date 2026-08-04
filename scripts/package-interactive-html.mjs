import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();
const inputDirectory = path.resolve(projectRoot, process.argv[2] ?? 'dist-interactive-html');
const outputFile = path.resolve(
  projectRoot,
  process.argv[3] ?? 'dist-interactive-html/Drakken_Field_Guide_Interactive.html',
);
const sourceIndex = path.join(inputDirectory, 'index.html');

if (!fs.existsSync(sourceIndex)) {
  throw new Error(`Interactive HTML source index is missing: ${sourceIndex}`);
}

const mimeTypes = new Map([
  ['.avif', 'image/avif'],
  ['.gif', 'image/gif'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml'],
  ['.webp', 'image/webp'],
  ['.woff', 'font/woff'],
  ['.woff2', 'font/woff2'],
  ['.ttf', 'font/ttf'],
  ['.otf', 'font/otf'],
  ['.mp3', 'audio/mpeg'],
  ['.ogg', 'audio/ogg'],
  ['.wav', 'audio/wav'],
  ['.mp4', 'video/mp4'],
  ['.webm', 'video/webm'],
  ['.wasm', 'application/wasm'],
]);

function resolveLocalAsset(reference, relativeToDirectory) {
  const cleanReference = reference.split(/[?#]/, 1)[0];
  if (!cleanReference || /^(?:data:|https?:|blob:|#|var\()/i.test(cleanReference)) return null;
  const decoded = decodeURIComponent(cleanReference);
  const resolved = decoded.startsWith('/')
    ? path.resolve(inputDirectory, `.${decoded}`)
    : path.resolve(relativeToDirectory, decoded);
  if (!resolved.startsWith(inputDirectory)) {
    throw new Error(`Refusing to inline an asset outside the build directory: ${reference}`);
  }
  return resolved;
}

function asDataUri(assetPath) {
  if (!fs.existsSync(assetPath) || !fs.statSync(assetPath).isFile()) {
    throw new Error(`Referenced build asset is missing: ${assetPath}`);
  }
  const mimeType = mimeTypes.get(path.extname(assetPath).toLowerCase()) ?? 'application/octet-stream';
  return `data:${mimeType};base64,${fs.readFileSync(assetPath).toString('base64')}`;
}

function inlineCssAssets(css, cssDirectory) {
  return css.replace(/url\(\s*(["']?)([^"')]+)\1\s*\)/g, (match, quote, reference) => {
    const assetPath = resolveLocalAsset(reference.trim(), cssDirectory);
    return assetPath ? `url("${asDataUri(assetPath)}")` : match;
  });
}

function escapeInlineScript(source) {
  return source
    .replace(/^\/\/# sourceMappingURL=.*$/gm, '')
    .replace(/<\/script/gi, '<\\/script');
}

function escapeInlineStyle(source) {
  return source.replace(/<\/style/gi, '<\\/style');
}

let html = fs.readFileSync(sourceIndex, 'utf8');
let scriptCount = 0;
let stylesheetCount = 0;

html = html.replace(
  /<link\b([^>]*\brel=["']stylesheet["'][^>]*)>/gi,
  (fullTag, attributes) => {
    const hrefMatch = attributes.match(/\bhref=["']([^"']+)["']/i);
    if (!hrefMatch) throw new Error(`Stylesheet link has no href: ${fullTag}`);
    const stylesheetPath = resolveLocalAsset(hrefMatch[1], inputDirectory);
    if (!stylesheetPath) throw new Error(`Stylesheet is not local and cannot be packaged: ${hrefMatch[1]}`);
    const css = inlineCssAssets(fs.readFileSync(stylesheetPath, 'utf8'), path.dirname(stylesheetPath));
    stylesheetCount += 1;
    return `<style data-drakken-inline="${path.basename(stylesheetPath)}">\n${escapeInlineStyle(css)}\n</style>`;
  },
);

html = html.replace(
  /<script\b([^>]*?)\bsrc=["']([^"']+)["']([^>]*)><\/script>/gi,
  (fullTag, beforeSource, reference, afterSource) => {
    const scriptPath = resolveLocalAsset(reference, inputDirectory);
    if (!scriptPath) throw new Error(`Script is not local and cannot be packaged: ${reference}`);
    const source = escapeInlineScript(fs.readFileSync(scriptPath, 'utf8'));
    const preservedAttributes = `${beforeSource} ${afterSource}`
      .replace(/\bcrossorigin(?:=["'][^"']*["'])?/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
    scriptCount += 1;
    return `<script ${preservedAttributes} data-drakken-inline="${path.basename(scriptPath)}">\n${source}\n</script>`;
  },
);

html = html.replace(/<link\b[^>]*\brel=["']modulepreload["'][^>]*>/gi, '');

const sourceRevision = process.env.GITHUB_SHA ?? process.env.DRAKKEN_SOURCE_REVISION ?? 'local-build';
const packageMetadata = [
  '<meta name="drakken-delivery-format" content="single-file-interactive-html" />',
  `<meta name="drakken-source-revision" content="${sourceRevision}" />`,
].join('\n    ');
html = html.replace('</head>', `    ${packageMetadata}\n  </head>`);
html = html.replace(
  '<body>',
  '<body data-drakken-delivery="single-file-interactive-html">',
);

if (scriptCount !== 1) {
  throw new Error(`Expected exactly one bundled module script, found ${scriptCount}.`);
}
if (stylesheetCount !== 1) {
  throw new Error(`Expected exactly one bundled stylesheet, found ${stylesheetCount}.`);
}

fs.mkdirSync(path.dirname(outputFile), { recursive: true });
fs.writeFileSync(outputFile, html);

const size = fs.statSync(outputFile).size;
console.log(`Created ${path.relative(projectRoot, outputFile)} (${size.toLocaleString('en-US')} bytes).`);
