import fs from 'node:fs';

const source = fs.readFileSync('src/scene/recordEnhancementData.ts', 'utf8');
const pattern = /  '([^']+)': \{ primary: d\('([^']+)', '((?:\\'|[^'])*)', '([^']+)'\), secondary: d\('([^']+)', '((?:\\'|[^'])*)', '([^']+)'\), basis: '((?:\\'|[^'])*)' \},/g;
const records = [];
let match;
while ((match = pattern.exec(source)) !== null) {
  records.push({
    id: match[1],
    primaryKind: match[2],
    primary: match[3].replaceAll("\\'", "'"),
    primaryLayer: match[4],
    secondaryKind: match[5],
    secondary: match[6].replaceAll("\\'", "'"),
    secondaryLayer: match[7],
    basis: match[8].replaceAll("\\'", "'"),
  });
}

if (records.length !== 59) throw new Error(`Expected 59 enhancement records, found ${records.length}.`);

const escapeCell = (value) => value.replaceAll('|', '\\|').replaceAll('\n', ' ');
const output = [
  '# Model Improvements Ledger',
  '',
  'This ledger replaces the prior boilerplate PASS table. Each row records two explicit, inspectable, canon-backed additions rendered by `src/scene/RecordEnhancementLayer.tsx` from `src/scene/recordEnhancementData.ts`.',
  '',
  '| Record ID | Improvement 1 | Layer | Improvement 2 | Layer | Canon basis | Source | Render evidence |',
  '|---|---|---|---|---|---|---|---|',
  ...records.map((record) => `| \`${record.id}\` | ${escapeCell(record.primary)} | ${record.primaryLayer} | ${escapeCell(record.secondary)} | ${record.secondaryLayer} | ${escapeCell(record.basis)} | \`recordEnhancementData.ts\` + \`RecordEnhancementLayer.tsx\` | Implemented; automated browser sweep pending |`),
  '',
  '## Validation status',
  '',
  '- Registry entries covered: 59/59.',
  '- Explicit enhancement pairs: 59/59.',
  '- Source/build gate: pending current-head validation.',
  '- Human visual/canon approval: pending.',
  '',
];

fs.writeFileSync('MODEL_IMPROVEMENTS_LEDGER.md', output.join('\n'));
console.log('Wrote MODEL_IMPROVEMENTS_LEDGER.md for 59 records.');
