import fs from 'node:fs';

const path = 'scripts/immersive-browser-audit.mjs';
const before = fs.readFileSync(path, 'utf8');
const after = before.replace(
  "await page.goto(baseUrl, { waitUntil: 'networkidle0', timeout: 60_000 });",
  "await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 30_000 });",
);
if (after === before && !before.includes("waitUntil: 'domcontentloaded'")) {
  throw new Error('Navigation wait mode could not be updated.');
}
fs.writeFileSync(path, after);
console.log('Browser audit now waits for DOM readiness and the explicit canvas selector.');
