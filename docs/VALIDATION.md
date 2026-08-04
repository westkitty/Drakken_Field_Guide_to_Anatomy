# Validation

## Automated checks

Run:

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run build:html
npm run validate:html
node scripts/audit-static.mjs --strict
```

The integrity audit checks the 59-record registry, route coverage, source references, asset/provenance/license ledgers, remote runtime references, clipping coverage, exports, and known accessibility regressions.

The interactive HTML build creates:

```text
dist-interactive-html/Drakken_Field_Guide_Interactive.html
```

Static validation rejects external scripts, stylesheets, module preloads, unresolved Vite assets, source-map dependencies, and remote runtime URLs.

## Direct-file feature-parity gate

`scripts/interactive-html-parity-v2.mjs` opens the generated file directly through `file://` and validates the user path rather than merely checking that HTML exists.

It exercises:

1. The live React Three Fiber canvas, orbit input, and zoom input.
2. All 59 Registry records and first/last record switching.
3. G/T/I/D, Escape, Space, and R keyboard controls.
4. Perspective and orthographic cameras plus presets.
5. Silhouette, wireframe, and renderer-quality controls.
6. All four anatomy layers and layer presets.
7. Sectioning enablement, axis, inversion, and plane position.
8. Animation selection, transport, loop, and speed.
9. Measurement mode, reset, and scale references.
10. All five dossier tabs, annotations, Markdown export, and JSON export.
11. Diagnostics and the Examiner Orientation Briefing.
12. A fresh 390 × 844 local-file page for mobile containment.
13. Zero remote runtime requests and zero actionable browser errors.

The established desktop/mobile polish audits run afterward as an independent regression check.

## Browser checks still requiring human or physical-device evidence

For representative records from every family and for all repaired paths:

1. Switch records repeatedly and cancel a pending switch by reselecting the active record.
2. Exercise orbit, pan, zoom, camera presets, and both projection modes on the target browser/device.
3. Toggle every anatomy layer independently.
4. Move and invert all three section planes; verify meshes and functional lines section together.
5. Run both animations, pause, restart, loop, and change speed.
6. Use measurement, annotations, evidence filters, exports, diagnostics, mobile drawers, and the orientation dialog with keyboard and touch as applicable.
7. Verify reduced-motion startup, native preference modes, WebGL context loss/restoration messaging, and standard/reduced renderer recreation.
8. Repeat record switching while observing renderer memory, GPU load, and thermal stabilization.

Do not promote browser behavior to verified from build output alone, and do not promote automated direct-file parity to human art-direction or physical-device approval.
