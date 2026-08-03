import { access, readFile, readdir, writeFile } from 'node:fs/promises';
import { glob } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';

async function exists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

function replaceOnce(source, before, after, label) {
  if (source.includes(after)) return source;
  if (!source.includes(before)) throw new Error(`Cannot apply ${label}: source pattern not found.`);
  return source.replace(before, after);
}

async function updateText(file, transform) {
  const source = await readFile(file, 'utf8');
  const updated = transform(source);
  if (updated !== source) await writeFile(file, updated);
}

const seedcarrierPath = 'src/scene/models/SeedcarrierModels.tsx';
if (!(await exists(seedcarrierPath))) {
  const source = execFileSync('git', ['show', `origin/build-skymourn:${seedcarrierPath}`], { encoding: 'utf8' });
  await writeFile(seedcarrierPath, source);
}

const curvePattern = /(class\s+\w+\s+extends\s+THREE\.Curve<THREE\.Vector3>\s*\{\n)(\s*getPoint\s*\()/g;
for await (const file of glob('src/scene/**/*.tsx')) {
  await updateText(file, (source) => source.replace(curvePattern, (_match, declaration, getPoint) =>
    `${declaration}  constructor() {\n    super();\n  }\n\n  ${getPoint}`));
}

await updateText('package.json', (source) => {
  const packageJson = JSON.parse(source);
  packageJson.engines = { ...packageJson.engines, node: '>=22.13.0' };
  return `${JSON.stringify(packageJson, null, 2)}\n`;
});

await updateText('src/scene/Specimens.tsx', (source) => {
  let updated = source;
  updated = replaceOnce(updated, "    if (!root.current || !frostMesh.current || !heatMesh.current || !coreMesh.current) return;", "    if (!root.current) return;", 'Skymourn optional layer animation guard');
  updated = replaceOnce(updated, "    frostMesh.current.scale.setScalar(frostPulse);", "    if (frostMesh.current) {\n      frostMesh.current.scale.setScalar(frostPulse);\n    }", 'Skymourn optional frost mesh animation');
  return updated;
});

const modelFiles = [
  'src/scene/Specimens.tsx',
  ...(await readdir('src/scene/models')).filter((name) => name.endsWith('.tsx')).map((name) => `src/scene/models/${name}`),
];
for (const file of modelFiles) {
  await updateText(file, (source) => source.replace(/<Line\b([\s\S]*?)\/>/g, (tag, attributes) => {
    if (attributes.includes('clippingPlanes=')) return tag;
    return `<Line${attributes} clippingPlanes={clippingPlanes} />`;
  }));
}

await updateText('src/App.tsx', (source) => {
  let updated = source;
  updated = replaceOnce(updated, '  distanceMeters,\n  downloadText,', '  distanceMeters,\n  downloadText,\n  evidenceStates,', 'evidence-state import');
  updated = replaceOnce(updated, "const evidenceFilters = ['all', 'confirmed', 'reconstructed', 'non-canon prototype'] as const;", "const evidenceFilters = ['all', ...evidenceStates.map((state) => state.toLowerCase())];", 'complete evidence filters');
  updated = replaceOnce(updated, "  const loadGate = useRef({ requestId: 0, activeId: 'skymourn' });\n  const activeRecord = findSpecimen(activeSpecimenId);", "  const loadGate = useRef({ requestId: 0, activeId: 'skymourn' });\n  const briefingTriggerRef = useRef<HTMLButtonElement>(null);\n  const briefingCloseRef = useRef<HTMLButtonElement>(null);\n  const orientationPreviousFocus = useRef<HTMLElement | null>(null);\n  const activeRecord = findSpecimen(activeSpecimenId);", 'dialog focus refs');
  const reducedMotionEffect = `\n  useEffect(() => {\n    if (!reducedMotion) return;\n    setAnimation((current) => current.playing ? { ...current, playing: false } : current);\n  }, [reducedMotion]);\n\n  useEffect(() => {\n    if (!orientationOpen) return;\n    orientationPreviousFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;\n    const frame = window.requestAnimationFrame(() => briefingCloseRef.current?.focus());\n    const trapFocus = (event: KeyboardEvent) => {\n      if (event.key !== 'Tab') return;\n      const card = briefingCloseRef.current?.closest<HTMLElement>('.orientation-card');\n      const focusable = card ? Array.from(card.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex=\"-1\"])')).filter((item) => !item.hasAttribute('disabled')) : [];\n      if (focusable.length === 0) return;\n      const first = focusable[0];\n      const last = focusable[focusable.length - 1];\n      if (event.shiftKey && document.activeElement === first) {\n        event.preventDefault();\n        last.focus();\n      } else if (!event.shiftKey && document.activeElement === last) {\n        event.preventDefault();\n        first.focus();\n      }\n    };\n    document.addEventListener('keydown', trapFocus);\n    return () => {\n      window.cancelAnimationFrame(frame);\n      document.removeEventListener('keydown', trapFocus);\n      orientationPreviousFocus.current?.focus();\n    };\n  }, [orientationOpen]);\n`;
  if (!updated.includes('orientationPreviousFocus.current =')) {
    updated = replaceOnce(updated, '  }, []);\n\n  const chooseSpecimen', `  }, []);${reducedMotionEffect}\n  const chooseSpecimen`, 'reduced motion and dialog focus effects');
  }
  updated = replaceOnce(updated, "    if (id === activeSpecimenId) return;", "    if (id === activeSpecimenId) {\n      if (pendingSpecimenId) {\n        loadGate.current = beginLoad(loadGate.current, activeSpecimenId);\n        setPendingSpecimenId(null);\n        setLoadError(null);\n      }\n      return;\n    }", 'pending load cancellation');
  updated = replaceOnce(updated, '          playing: true,', '          playing: !reducedMotion,', 'new-record reduced-motion state');
  updated = replaceOnce(updated, '  }, [activeSpecimenId, reducedMotion]);', '  }, [activeSpecimenId, pendingSpecimenId, reducedMotion]);', 'selection callback dependencies');
  updated = replaceOnce(updated, '    setSelectedAnnotationIds((current) => (current.includes(id) ? current : [...current, id]));', '    setSelectedAnnotationIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);', 'annotation export toggle');
  updated = replaceOnce(updated, '<button type="button" onClick={() => setOrientationOpen(true)}>Briefing</button>', '<button ref={briefingTriggerRef} type="button" onClick={() => setOrientationOpen(true)}>Briefing</button>', 'briefing trigger ref');
  updated = replaceOnce(updated, '<span>One meter per world unit</span>', '<span>Normalized reconstruction geometry</span>', 'false meter calibration claim');
  updated = replaceOnce(updated, 'Plane position <output>{clip.position.toFixed(1)} m</output>', 'Plane position <output>{clip.position.toFixed(1)} units</output>', 'section plane unit label');
  updated = replaceOnce(updated, "                  className={selectedAnnotationId === annotation.id ? 'is-active' : ''}\n                  onClick={() => handleAnnotationSelect(annotation.id)}", "                  className={selectedAnnotationId === annotation.id ? 'is-active' : ''}\n                  aria-pressed={selectedAnnotationIds.includes(annotation.id)}\n                  onClick={() => handleAnnotationSelect(annotation.id)}", 'annotation selection state');
  updated = replaceOnce(updated, '<small>Compare colossal specimen heights against 1.8m Human, 1.5m Vehicle, and 10m markers.</small>', '<small>Reference silhouettes are normalized visual aids. They do not establish canon dimensions or a proven world-unit calibration.</small>', 'scale-reference briefing truthfulness');
  updated = replaceOnce(updated, '<button type="button" onClick={() => setOrientationOpen(false)}>Acknowledge & Proceed</button>', '<button ref={briefingCloseRef} type="button" onClick={() => setOrientationOpen(false)}>Acknowledge & Proceed</button>', 'dialog close focus ref');
  return updated;
});

await updateText('src/styles.css', (source) => {
  let updated = source.replace(/^@import url\([^\n]+\);\n\n/, '');
  updated = updated.replace('--font-serif: "Cinzel", Georgia, "Times New Roman", serif;', '--font-serif: Georgia, "Times New Roman", serif;');
  updated = updated.replace('--font-sans: "Outfit", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;', '--font-sans: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;');
  updated = updated.replace('--font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace;', '--font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;');
  if (!updated.includes('visibility: hidden;\n    pointer-events: none;')) {
    updated = replaceOnce(updated, '    transform: translateX(-104%);\n    transition: transform 180ms ease-out;', '    transform: translateX(-104%);\n    visibility: hidden;\n    pointer-events: none;\n    transition: transform 180ms ease-out, visibility 0s linear 180ms;', 'mobile drawer hidden state');
    updated = replaceOnce(updated, '  .registry-panel.is-open,\n  .record-panel.is-open {\n    transform: translateX(0);\n  }', '  .registry-panel.is-open,\n  .record-panel.is-open {\n    transform: translateX(0);\n    visibility: visible;\n    pointer-events: auto;\n    transition-delay: 0s;\n  }', 'mobile drawer open state');
  }
  return updated;
});

await updateText('src/components/ExaminationChamber.tsx', (source) => {
  let updated = source;
  if (!updated.includes('function ContextLifecycle()')) {
    const contextComponent = `\nfunction ContextLifecycle() {\n  const { gl } = useThree();\n\n  useEffect(() => {\n    const canvas = gl.domElement;\n    const handleContextLost = (event: Event) => {\n      event.preventDefault();\n      console.warn('[Vault 9 Examination System] WebGL context lost; awaiting browser restoration.');\n    };\n    const handleContextRestored = () => {\n      console.info('[Vault 9 Examination System] WebGL context restored.');\n    };\n    canvas.addEventListener('webglcontextlost', handleContextLost, false);\n    canvas.addEventListener('webglcontextrestored', handleContextRestored, false);\n    return () => {\n      canvas.removeEventListener('webglcontextlost', handleContextLost, false);\n      canvas.removeEventListener('webglcontextrestored', handleContextRestored, false);\n    };\n  }, [gl]);\n\n  return null;\n}\n`;
    updated = replaceOnce(updated, '\nexport function ExaminationChamber(props: ChamberProps) {', `${contextComponent}\nexport function ExaminationChamber(props: ChamberProps) {`, 'WebGL context lifecycle component');
  }
  updated = replaceOnce(updated, '      <Canvas\n        shadows=', '      <Canvas\n        key={props.qualityTier}\n        shadows=', 'quality renderer remount');
  const oldCreated = `        onCreated={({ gl }) => {\n          gl.localClippingEnabled = true;\n          gl.setClearColor('#05080f');\n          const canvas = gl.domElement;\n          const handleContextLost = (event: Event) => {\n            event.preventDefault();\n            console.warn('[Vault 9 Examination System] WebGL Context Lost. Retaining state for restoration...');\n          };\n          const handleContextRestored = () => {\n            console.info('[Vault 9 Examination System] WebGL Context Restored successfully.');\n          };\n          canvas.addEventListener('webglcontextlost', handleContextLost, false);\n          canvas.addEventListener('webglcontextrestored', handleContextRestored, false);\n        }}`;
  const newCreated = `        onCreated={({ gl }) => {\n          gl.localClippingEnabled = true;\n          gl.setClearColor('#05080f');\n        }}`;
  updated = replaceOnce(updated, oldCreated, newCreated, 'context-listener cleanup');
  if (!updated.includes('<ContextLifecycle />')) {
    updated = replaceOnce(updated, "        <color attach=\"background\" args={['#05080f']} />", "        <ContextLifecycle />\n        <color attach=\"background\" args={['#05080f']} />", 'context lifecycle mount');
  }
  updated = updated.replace("clipping: clip.enabled ? `${clip.axis.toUpperCase()} ${clip.position.toFixed(1)} m` : 'Disabled',", "clipping: clip.enabled ? `${clip.axis.toUpperCase()} ${clip.position.toFixed(1)} units` : 'Disabled',");
  return updated;
});

const specimens = JSON.parse(await readFile('src/data/specimens.json', 'utf8'));
const sourceFile = 'docs/drakken_compendium_full_blood_eclipse_visual_integrated.md';
const assets = {
  schemaVersion: 2,
  units: 'normalized reconstruction units',
  calibrationStatus: 'Visualization-height metadata is not a proven world-unit calibration.',
  assets: specimens.map((record) => ({
    assetId: record.modelAssetRef,
    runtimeUri: `procedural://${record.id}/${record.assetVersion}`,
    sourceIdentity: record.sourceStatus,
    version: record.assetVersion,
    sha256: null,
    units: 'normalized reconstruction units',
    orientation: 'Y-up; presentation orientation defined by the dedicated procedural model',
    pivotPolicy: 'Model-local origin; chamber presentation is normalized and record-specific',
    bounds: null,
    meshNames: ['surface', 'structure', 'internal', 'functional'],
    materialInventory: Object.values(record.layers),
    textureInventory: [],
    animationNames: record.animations,
    lodVariants: ['procedural-standard', 'procedural-reduced-render-tier'],
    evidenceOrOwnershipState: 'Project-owned procedural reconstruction from supplied canon',
    attributionRequirement: 'Retain record source citations and working-canon status',
    decoderRequirements: [],
    disposalPolicy: 'React Three Fiber disposes component-owned geometry and materials on keyed unmount',
    knownDefects: [record.dimensions.canon === 'Unknown' ? 'Canonical dimensions unknown' : `Canon dimensions: ${record.dimensions.canon}`, 'Procedural visualization is not a production GLB', 'Browser rendering and long-session resource stability require direct validation'],
  })),
};
const provenance = {
  schemaVersion: 2,
  records: specimens.map((record) => ({
    assetId: record.modelAssetRef,
    sourceFiles: [sourceFile],
    sourceLocations: record.sources.map((source) => source.location),
    sourceIds: record.sources.map((source) => source.id),
    processing: [`Mapped ${record.designation} surface, structure, internal, and functional record layers to local procedural geometry`, 'Preserved confirmed, reconstructed, and unknown evidence labels from the specimen record', 'Retained normalized chamber presentation without asserting unverified canon scale'],
    runtimeOutput: 'Generated at runtime through src/scene/SpecimenRouter.tsx and project-owned model modules',
    sourceHash: null,
    runtimeHash: null,
  })),
};
const licenses = {
  schemaVersion: 2,
  releaseIntent: 'Interactive archive under active validation',
  records: specimens.map((record) => ({
    assetId: record.modelAssetRef,
    owner: 'Stinky Weasel Productions / project owner supplied canon',
    license: 'Project-owned content; external asset license not applicable',
    commercialUse: 'Owner-controlled',
    modification: 'Owner-controlled',
    rawRedistribution: 'Not applicable; runtime procedural source is repository code',
    attribution: `Retain ${record.archiveId} canon source references`,
    reviewState: 'Owner-supplied canon; procedural implementation pending browser QA',
  })),
};
await writeFile('public/data/assets.json', `${JSON.stringify(assets, null, 2)}\n`);
await writeFile('public/data/provenance.json', `${JSON.stringify(provenance, null, 2)}\n`);
await writeFile('public/data/licenses.json', `${JSON.stringify(licenses, null, 2)}\n`);

await writeFile('README.md', `# Drakken Field Anatomy Archive\n\nA React Three Fiber forensic archive containing all 59 canonical Drakken records. Each record is selectable and routes to a record-specific procedural reconstruction with surface, structure, internal, and functional examination layers.\n\n## Commands\n\n- \`npm run dev\`\n- \`npm run typecheck\`\n- \`npm run lint\`\n- \`npm test\`\n- \`npm run build\`\n\n## Evidence state\n\nSource compilation, lint, tests, and production build are validated in GitHub Actions. Browser interaction, visual canon fidelity, device behavior, performance, and long-session lifecycle stability remain separate validation requirements. Procedural chamber geometry is normalized and must not be interpreted as proven canon scale.\n\nSee \`OPERATIONAL_STATE.md\`, \`PRODUCT.md\`, \`DESIGN.md\`, \`docs/ARCHITECTURE.md\`, and \`docs/VALIDATION.md\`.\n`);
await writeFile('PRODUCT.md', `# Product Definition\n\nThe Drakken Field Anatomy Archive is a single-browser forensic compendium for all 59 canonical Drakken records. Its primary journey is: find a record, inspect a record-specific 3D reconstruction, toggle four evidence layers, section the model, review annotations and incidents, compare stated evidence, and export the complete record.\n\n## Current scope\n\n- 59 searchable records across the complete registry\n- record-specific procedural model routing\n- surface, structure, internal, and functional layers\n- camera presets and perspective/orthographic modes\n- animation states, sectioning, measurement points, annotations, diagnostics, and exports\n- local project-owned runtime geometry with no remote asset dependency\n\n## Evidence boundary\n\nA passing build proves source integration, not browser usability, visual fidelity, physical scale, target-device performance, or long-session resource stability. Those remain release gates.\n`);
await writeFile('docs/VALIDATION.md', `# Validation\n\n## Automated checks\n\nRun:\n\n\`\`\`bash\nnpm run typecheck\nnpm run lint\nnpm test\nnpm run build\nnode scripts/audit-static.mjs --strict\n\`\`\`\n\nThe integrity audit checks the 59-record registry, route coverage, source references, asset/provenance/license ledgers, remote runtime references, clipping coverage, exports, and known accessibility regressions.\n\n## Browser checks still required\n\nFor representative records from every family and for all repaired paths:\n\n1. Switch records repeatedly and cancel a pending switch by reselecting the active record.\n2. Exercise orbit, pan, zoom, camera presets, and both projection modes.\n3. Toggle every anatomy layer independently.\n4. Move and invert all three section planes; verify meshes and functional lines section together.\n5. Run both animations, pause, restart, loop, and change speed.\n6. Use measurement, annotations, evidence filters, exports, diagnostics, mobile drawers, and the orientation dialog with keyboard only.\n7. Verify reduced-motion startup, WebGL context loss/restoration messaging, and standard/reduced renderer recreation.\n8. Repeat record switching while observing renderer memory for stabilization.\n\nDo not promote browser behavior to verified from build output alone.\n`);
await writeFile('docs/ASSET_PIPELINE.md', `# Procedural Asset Pipeline\n\nAll 59 active specimen assets are project-owned deterministic procedural reconstructions. Their stable IDs come from \`src/data/specimens.json\` and are recorded in:\n\n- \`public/data/assets.json\`\n- \`public/data/provenance.json\`\n- \`public/data/licenses.json\`\n\nThe ledgers are generated from the canonical record registry and must retain one entry per \`modelAssetRef\`. Runtime source is routed through \`src/scene/SpecimenRouter.tsx\` and the dedicated model modules.\n\nExternal GLB, texture, audio, font, or shader assets must not be added without exact provenance, license, local runtime paths, technical inspection, and disposal validation. Remote hotlinks are prohibited.\n\nProcedural geometry is normalized for chamber inspection. Canon dimensions and visualization metadata must not be silently converted into a physical meter calibration.\n`);
await writeFile('ATTRIBUTION.md', `# Attribution and Ownership\n\nThe archive contains 59 project-owned procedural reconstructions derived from the supplied Drakken working-canon dossier and the source references preserved in each specimen record. No external runtime models, textures, fonts, audio, or remotely hosted visual assets are required.\n\nPer-record ownership, provenance, and source locations are recorded in \`public/data/assets.json\`, \`public/data/provenance.json\`, \`public/data/licenses.json\`, and \`src/data/specimens.json\`.\n\nThird-party code dependencies remain governed by their package licenses. This file does not replace dependency license notices.\n`);

console.log('Applied bounded build, accessibility, export, clipping, manifest, and documentation repairs.');
