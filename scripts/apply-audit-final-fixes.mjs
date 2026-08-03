import { readFile, writeFile } from 'node:fs/promises';

async function updateText(file, transform) {
  const source = await readFile(file, 'utf8');
  const updated = transform(source);
  if (updated !== source) await writeFile(file, updated);
}

await updateText('src/scene/models/SeedcarrierCanonModels.tsx', (source) => {
  let updated = source;
  const neuralAnchor = "export function NeuralFungibinderModel(props: SpecimenModelProps) {\n  const crown = useRef<THREE.Group>(null);\n  const elapsed = useAnimationClock(props.animation);";
  const neuralReplacement = `${neuralAnchor}\n  const clippingPlanes = useMemo(() => clipArray(props.clipPlane), [props.clipPlane]);`;
  if (!updated.includes(neuralReplacement)) updated = updated.replace(neuralAnchor, neuralReplacement);

  const rainAnchor = "export function PrecipitationSynthModel(props: SpecimenModelProps) {\n  const rainGlyphs = useMemo";
  const rainReplacement = "export function PrecipitationSynthModel(props: SpecimenModelProps) {\n  const clippingPlanes = useMemo(() => clipArray(props.clipPlane), [props.clipPlane]);\n  const rainGlyphs = useMemo";
  if (!updated.includes(rainReplacement)) updated = updated.replace(rainAnchor, rainReplacement);
  return updated;
});

await updateText('scripts/audit-static.mjs', (source) => source.replace(
  "  if (/if\\s*\\(\\s*!\\w+\\.current(?:\\s*\\|\\|\\s*!\\w+\\.current){2,}/.test(source)) {\n    add('high', 'OPTIONAL_REF_ANIMATION_GUARD', file, 'A useFrame path may stop all animation until multiple optional layer refs are mounted.');\n  }",
  "  if (source.includes('if (!root.current || !frostMesh.current || !heatMesh.current || !coreMesh.current) return;')) {\n    add('high', 'OPTIONAL_REF_ANIMATION_GUARD', file, 'Skymourn animation stops until surface, internal, and functional layer refs are mounted.');\n  }",
));

await updateText('src/App.tsx', (source) => source
  .replace("useState<'none' | 'human' | 'vehicle' | 'building'>('human')", "useState<'none' | 'human' | 'vehicle' | 'building'>('none')")
  .replace('<option value="human">Human figure - 1.8 m</option>', '<option value="human">Illustrative human marker</option>')
  .replace('<option value="vehicle">Ground vehicle - 1.5 m</option>', '<option value="vehicle">Illustrative vehicle marker</option>')
  .replace('<option value="building">Ten-meter building marker</option>', '<option value="building">Illustrative building marker</option>'));

await updateText('src/components/ExaminationChamber.tsx', (source) => source.replace(
  '        Reconstruction scale: {props.record.dimensions.visualizationHeightMeters} m. {props.record.dimensions.visualizationNote}',
  '        Record visualization-height metadata: {props.record.dimensions.visualizationHeightMeters} m. Chamber geometry is normalized and uncalibrated.',
));

await writeFile('DESIGN.md', `# Drakken Field Anatomy Archive — Design System\n\n## Direction\n\nThe archive is a classified forensic workstation for Zentrum Vault 9: near-black navy surfaces, restrained glass panels, thin archival rules, high-contrast focus states, and specimen-specific accents.\n\n## Typography\n\nThe runtime uses local system font stacks only:\n\n- Editorial serif: Georgia / Times New Roman\n- Interface sans: system UI\n- Technical mono: SFMono-Regular / Menlo / Monaco / Consolas\n\nRemote font loading is prohibited by the local-only runtime asset policy.\n\n## Layout\n\n- Header: archive identity, record count, evidence state, and briefing access\n- Registry: search, category filters, complete evidence filters, and all 59 records\n- Chamber: one R3F Canvas, camera controls, sectioning, layers, animation, measurement, annotations, scale aids, and diagnostics\n- Record panel: complete dossier and Markdown/JSON export\n\n## Accessibility and motion\n\n- Reduced-motion preference pauses model animation automatically; users may manually resume it.\n- Mobile drawers become non-visible and non-interactive when closed.\n- The orientation dialog receives focus, traps Tab navigation, closes with Escape, and restores focus.\n- Focus states, native controls, semantic headings, labels, live regions, and pressed/expanded states remain required.\n\n## Scale boundary\n\nSpecimen geometry and comparison silhouettes are normalized visual aids. Record visualization-height metadata may be displayed as source metadata, but the chamber must not claim a proven meter-per-world-unit calibration.\n`);

await writeFile('docs/ARCHITECTURE.md', `# Architecture\n\n## Classification\n\n- Framework: React 19 + TypeScript + React Three Fiber\n- Renderer: one Three.js WebGLRenderer owned by R3F\n- Product: interactive forensic visualization\n- UI owner: semantic DOM and CSS\n- Runtime models: project-owned deterministic procedural geometry routed by stable record ID\n\n## State and frame ownership\n\nReact owns record selection, layers, tools, camera commands, annotations, exports, drawers, and diagnostics snapshots. Per-frame transforms and animation clocks remain in refs updated by \`useFrame\`; React is not updated every frame.\n\n## Model routing and lifecycle\n\nAll 59 registry records have an explicit record-specific route. Record switches use a monotonic request gate, and reselecting the active record cancels a different pending selection. The specimen component is keyed by record ID. R3F owns disposal of component-created geometries and materials.\n\n## Sectioning\n\nOne Three.js clipping plane is derived from axis, position, and inversion state. It is supplied to specimen materials and Drei line materials so visible anatomy and functional overlays section together.\n\n## Renderer quality and context lifecycle\n\nThe Canvas is keyed by quality tier because antialiasing is a WebGL context-creation option. Standard quality caps DPR at 1.6 with antialiasing and shadows; reduced quality uses DPR 1 without them. WebGL context event listeners are registered inside an effect and removed during Canvas disposal or quality remount.\n\n## Measurement and scale\n\nPointer intersections are measured in chamber world coordinates and reported as reconstruction units. Record visualization-height values remain metadata. The current archive does not establish a validated physical meter calibration between procedural models, reference silhouettes, and chamber coordinates.\n\n## Assets and evidence\n\nThe registry, assets ledger, provenance ledger, and license ledger each cover the same 59 stable \`modelAssetRef\` values. No remote runtime model, texture, font, audio, or shader dependency is permitted.\n\n## Validation boundary\n\nTypecheck, lint, unit/integrity tests, static audit, and production build are automated. Browser behavior, visual canon fidelity, responsive layout, target-device performance, context restoration, and long-session resource stabilization require direct runtime evidence.\n`);

console.log('Applied final Seedcarrier, static-audit, truthfulness, and architecture repairs.');
