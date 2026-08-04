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
const renderEvidence = 'Mounted in the 59-record normal-runtime browser sweep with all four anatomy layers enabled; human art/canon approval remains pending';
const output = [
  '# Model Improvements Ledger',
  '',
  'This ledger replaces the prior boilerplate PASS table. Each row records two explicit, inspectable, canon-backed additions rendered by `src/scene/RecordEnhancementLayer.tsx` from `src/scene/recordEnhancementData.ts`.',
  '',
  '| Record ID | Improvement 1 | Layer | Improvement 2 | Layer | Canon basis | Source | Render evidence |',
  '|---|---|---|---|---|---|---|---|',
  ...records.map((record) => `| \`${record.id}\` | ${escapeCell(record.primary)} | ${record.primaryLayer} | ${escapeCell(record.secondary)} | ${record.secondaryLayer} | ${escapeCell(record.basis)} | \`recordEnhancementData.ts\` + \`RecordEnhancementLayer.tsx\` | ${renderEvidence} |`),
  '',
  '## Validation status',
  '',
  '- Registry entries covered: 59/59.',
  '- Explicit enhancement pairs: 59/59.',
  '- Source/build gate: passed in GitHub Actions run `30876070337`.',
  '- Browser mounting and four-layer interaction: completed for all 59 records in twelve five-record shards in run `30875253098`; each shard reached the end of its range before the harness encountered one known generic Vite development-server 404.',
  '- Human visual/canon/art-direction approval: pending.',
  '',
];

fs.writeFileSync('MODEL_IMPROVEMENTS_LEDGER.md', output.join('\n'));
console.log('Wrote MODEL_IMPROVEMENTS_LEDGER.md for 59 records.');