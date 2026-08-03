import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const strict = process.argv.includes('--strict');
const issues = [];

function add(severity, id, file, message, evidence = '') {
  issues.push({ severity, id, file, message, evidence });
}

async function text(relativePath) {
  return readFile(path.join(root, relativePath), 'utf8');
}

async function json(relativePath) {
  return JSON.parse(await text(relativePath));
}

async function walk(directory) {
  const entries = await readdir(path.join(root, directory), { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const relative = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(relative));
    else files.push(relative);
  }
  return files;
}

function matches(source, expression) {
  return [...source.matchAll(expression)].map((match) => match[1]);
}

const specimens = await json('src/data/specimens.json');
const ids = specimens.map((record) => record.id);
const idSet = new Set(ids);
const archiveIds = specimens.map((record) => record.archiveId);

if (specimens.length !== 59) add('critical', 'REGISTRY_COUNT', 'src/data/specimens.json', `Expected 59 records; found ${specimens.length}.`);
if (idSet.size !== ids.length) add('critical', 'DUPLICATE_RECORD_ID', 'src/data/specimens.json', 'Specimen IDs are not unique.');
if (new Set(archiveIds).size !== archiveIds.length) add('critical', 'DUPLICATE_ARCHIVE_ID', 'src/data/specimens.json', 'Archive IDs are not unique.');

for (const record of specimens) {
  const sourceIds = new Set(record.sources.map((source) => source.id));
  if (sourceIds.size !== record.sources.length) add('high', 'DUPLICATE_SOURCE_ID', 'src/data/specimens.json', `${record.id} contains duplicate source IDs.`);
  for (const annotation of record.annotations) {
    if (!sourceIds.has(annotation.sourceRef)) add('high', 'ORPHAN_ANNOTATION_SOURCE', 'src/data/specimens.json', `${record.id}/${annotation.id} references missing ${annotation.sourceRef}.`);
  }
  for (const incident of record.incidents) {
    if (!sourceIds.has(incident.sourceRef)) add('high', 'ORPHAN_INCIDENT_SOURCE', 'src/data/specimens.json', `${record.id}/${incident.title} references missing ${incident.sourceRef}.`);
  }
  if (!Number.isFinite(record.dimensions.visualizationHeightMeters) || record.dimensions.visualizationHeightMeters <= 0) {
    add('high', 'INVALID_VISUALIZATION_HEIGHT', 'src/data/specimens.json', `${record.id} has invalid visualizationHeightMeters.`);
  }
  if (record.animations.length < 2) add('medium', 'INSUFFICIENT_ANIMATIONS', 'src/data/specimens.json', `${record.id} has fewer than two animations.`);
}

const router = await text('src/scene/SpecimenRouter.tsx');
const legacy = await text('src/scene/Specimens.tsx');
const configSource = await text('src/scene/specimenConfigs.ts');
const routerIds = matches(router, /case '([^']+)'/g);
const legacyIds = matches(legacy, /props\.record\.id === '([^']+)'/g);
const dedicatedIds = new Set([...routerIds, ...legacyIds]);
const configIds = new Set(matches(configSource, /^\s{2}'([^']+)': \{/gm));

for (const routeId of dedicatedIds) {
  if (!idSet.has(routeId)) add('critical', 'UNKNOWN_ROUTE_ID', 'src/scene/SpecimenRouter.tsx', `Route references unknown record ${routeId}.`);
}
if (new Set(routerIds).size !== routerIds.length) add('critical', 'DUPLICATE_ROUTER_CASE', 'src/scene/SpecimenRouter.tsx', 'Duplicate switch cases exist.');

const fallbackIds = ids.filter((id) => !dedicatedIds.has(id));
for (const fallbackId of fallbackIds) {
  if (!configIds.has(fallbackId)) add('critical', 'UNROUTED_WITHOUT_CONFIG', 'src/scene/specimenConfigs.ts', `${fallbackId} has neither a dedicated route nor a parametric configuration.`);
}
if (fallbackIds.length > 0) {
  add('high', 'NON_DEDICATED_RECORDS', 'src/scene/SpecimenRouter.tsx', `${fallbackIds.length} records still use RecordParametricModel: ${fallbackIds.join(', ')}.`);
}

const modelFiles = (await walk('src/scene/models')).filter((file) => file.endsWith('.tsx'));
const sceneFiles = [...modelFiles, 'src/scene/Specimens.tsx'];
let missingLineClipping = 0;
let missingMaterialClipping = 0;
let remoteRuntimeReferences = 0;

for (const file of sceneFiles) {
  const source = await text(file);
  for (const opening of source.match(/<Line\b[\s\S]*?\/>/g) ?? []) {
    if (!opening.includes('clippingPlanes')) missingLineClipping += 1;
  }
  for (const opening of source.match(/<mesh(?:Basic|Standard|Physical)Material\b[\s\S]*?\/>/g) ?? []) {
    if (!opening.includes('clippingPlanes')) missingMaterialClipping += 1;
  }
  if (/if\s*\(\s*!\w+\.current(?:\s*\|\|\s*!\w+\.current){2,}/.test(source)) {
    add('high', 'OPTIONAL_REF_ANIMATION_GUARD', file, 'A useFrame path may stop all animation until multiple optional layer refs are mounted.');
  }
}

if (missingLineClipping > 0) add('high', 'LINE_CLIPPING_GAPS', 'src/scene', `${missingLineClipping} Drei Line elements omit clippingPlanes, so sectioning does not consistently affect functional overlays.`);
if (missingMaterialClipping > 0) add('medium', 'MATERIAL_CLIPPING_GAPS', 'src/scene', `${missingMaterialClipping} model material elements omit clippingPlanes.`);

const runtimeFiles = [
  ...(await walk('src')).filter((file) => /\.(?:ts|tsx|css|html)$/.test(file)),
  'index.html',
];
for (const file of runtimeFiles) {
  const source = await text(file);
  const occurrences = source.match(/https?:\/\//g)?.length ?? 0;
  if (occurrences > 0) {
    remoteRuntimeReferences += occurrences;
    add('high', 'REMOTE_RUNTIME_REFERENCE', file, `${occurrences} HTTP(S) runtime reference(s) violate the local-only asset policy.`);
  }
}

const assets = await json('public/data/assets.json');
const provenance = await json('public/data/provenance.json');
const licenses = await json('public/data/licenses.json');
const modelAssetIds = new Set(specimens.map((record) => record.modelAssetRef));
const assetIds = new Set((assets.assets ?? []).map((record) => record.assetId));
const provenanceIds = new Set((provenance.records ?? []).map((record) => record.assetId));
const licenseIds = new Set((licenses.records ?? []).map((record) => record.assetId));

for (const assetId of modelAssetIds) {
  if (!assetIds.has(assetId)) add('high', 'MISSING_ASSET_LEDGER_ENTRY', 'public/data/assets.json', `Missing ${assetId}.`);
  if (!provenanceIds.has(assetId)) add('high', 'MISSING_PROVENANCE_ENTRY', 'public/data/provenance.json', `Missing ${assetId}.`);
  if (!licenseIds.has(assetId)) add('high', 'MISSING_LICENSE_ENTRY', 'public/data/licenses.json', `Missing ${assetId}.`);
}

const staleDocumentChecks = [
  ['README.md', /Exactly three records are present|three records/i],
  ['docs/VALIDATION.md', /exactly three specimen records/i],
  ['docs/ASSET_PIPELINE.md', /three runtime asset IDs/i],
  ['ATTRIBUTION.md', /Skymourn, Gorevault, and Blood Ring records used by the prototype/i],
  ['PRODUCT.md', /9 procedural archetype models/i],
];
for (const [file, expression] of staleDocumentChecks) {
  const source = await text(file);
  if (expression.test(source)) add('medium', 'STALE_DOCUMENTATION', file, `Document still describes the obsolete three-record/archetype prototype.`);
}

const css = await text('src/styles.css');
if (!/visibility:\s*hidden/.test(css) || !/pointer-events:\s*none/.test(css)) {
  add('high', 'MOBILE_HIDDEN_FOCUS', 'src/styles.css', 'Off-canvas mobile drawers are transformed away without being removed from pointer/focus accessibility paths.');
}

const app = await text('src/App.tsx');
if (!/reducedMotion[\s\S]{0,200}setAnimation/.test(app)) {
  add('high', 'REDUCED_MOTION_NOT_APPLIED', 'src/App.tsx', 'prefers-reduced-motion is detected but does not pause Three.js animation state.');
}
if (/if \(id === activeSpecimenId\) return;/.test(app)) {
  add('medium', 'PENDING_SELECTION_NOT_CANCELLED', 'src/App.tsx', 'Selecting the active record cannot cancel a different pending record load.');
}
if (/role="dialog"/.test(app) && !/focus\(\)/.test(app)) {
  add('high', 'DIALOG_FOCUS_UNMANAGED', 'src/App.tsx', 'The modal dialog has no initial focus, focus containment, or focus restoration path.');
}

const archiveSource = await text('src/lib/archive.ts');
for (const requiredField of ['description', 'operationalRole', 'incidents', 'militaryInterpretation', 'civicResponse', 'animations', 'layers']) {
  if (!archiveSource.includes(`record.${requiredField}`)) add('medium', 'INCOMPLETE_RECORD_EXPORT', 'src/lib/archive.ts', `Record export omits ${requiredField}.`);
}

const chamber = await text('src/components/ExaminationChamber.tsx');
if (/gl=\{\{ antialias: props\.qualityTier/.test(chamber) && !/<Canvas[\s\S]{0,250}key=\{props\.qualityTier\}/.test(chamber)) {
  add('medium', 'ANTIALIAS_TOGGLE_INERT', 'src/components/ExaminationChamber.tsx', 'Changing the gl.antialias prop does not recreate the WebGLRenderer, so the quality toggle cannot change antialiasing.');
}
if (/One meter per world unit/.test(app) && /visualizationHeightMeters/.test(app)) {
  add('high', 'UNVERIFIED_METER_CALIBRATION', 'src/App.tsx', 'The UI claims one meter per world unit without a per-model bounds calibration path.');
}

const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
issues.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity] || a.id.localeCompare(b.id) || a.file.localeCompare(b.file));

const counts = issues.reduce((result, issue) => {
  result[issue.severity] = (result[issue.severity] ?? 0) + 1;
  return result;
}, {});

console.log(JSON.stringify({
  specimenCount: specimens.length,
  dedicatedRouteCount: dedicatedIds.size,
  fallbackIds,
  modelFileCount: modelFiles.length,
  missingLineClipping,
  missingMaterialClipping,
  remoteRuntimeReferences,
  ledgerCoverage: {
    expected: modelAssetIds.size,
    assets: assetIds.size,
    provenance: provenanceIds.size,
    licenses: licenseIds.size,
  },
  counts,
  issues,
}, null, 2));

if (strict && issues.some((issue) => issue.severity === 'critical' || issue.severity === 'high')) {
  process.exitCode = 1;
}
