# Interactive HTML Delivery Contract

## Purpose

The Drakken Field Anatomy Archive must be deliverable as one browser-openable HTML file without reducing the product to screenshots, static documentation, a partial demo, or an interface shell.

## Output

```text
dist-interactive-html/Drakken_Field_Guide_Interactive.html
```

Build and validate it with:

```bash
npm run build:html
npm run validate:html
```

The packager inlines the production JavaScript, compiled CSS, and any referenced local build assets. The delivered file contains no external script tag, stylesheet link, module preload, source-map dependency, remote runtime URL, or unresolved Vite asset path.

## Feature-parity contract

The downloadable HTML is rejected unless it preserves:

1. A live React Three Fiber / Three.js examination canvas.
2. Orbit and zoom interaction.
3. Exactly 59 canonical Registry records.
4. Record switching while retaining one canvas.
5. Perspective and orthographic cameras.
6. Front, side, dorsal, ventral, and three-quarter presets.
7. Camera reset.
8. Silhouette and wireframe modes.
9. Standard and reduced renderer quality.
10. Surface, structure, internal, and functional anatomy layers.
11. Layer presets.
12. Sectioning enablement, X/Y/Z axes, inversion, and plane position.
13. Animation selection, play/pause, restart, looping, and playback speed.
14. Measurement mode and measurement-point clearing.
15. Scale references.
16. Annotation inspection and export selection.
17. Registry search and evidence filters.
18. Five Record dossier tabs.
19. Markdown dossier export.
20. JSON dossier export.
21. Diagnostics.
22. Examiner Orientation Briefing.
23. G/T/I/D, Escape, Space, and R keyboard controls.
24. Hidden-at-rest model-first presentation.
25. Responsive drawer containment at desktop and mobile sizes.
26. Zero remote runtime requests after download.

## Automated proof

`scripts/interactive-html-parity-v2.mjs` opens the generated artifact directly through a local `file://` URL and exercises the parity contract. It uses separate desktop and mobile pages so responsive verification is not contaminated by a desktop WebGL or layout state.

The audit verifies:

- direct local launch;
- one live 3D canvas;
- all 59 records and first/last record switching;
- keyboard drawer controls;
- camera, rendering, layer, clipping, animation, measurement, and scale controls;
- reset behavior;
- complete dossier tabs and both exports;
- Diagnostics and briefing;
- fresh-page 390 × 844 mobile containment;
- zero remote runtime requests;
- zero actionable browser errors.

The existing desktop/mobile polish audits run afterward as an independent regression gate.

## Delivery limitations that remain honest

The single HTML preserves application functionality but does not convert automated evidence into:

- human approval of every model's artistic quality;
- physical-device touch or screen-reader approval;
- native reduced-transparency, increased-contrast, forced-colors, or safe-area approval;
- target-MacBook GPU, memory, load-time, or thermal approval.

The single-file package is necessarily large because it contains the complete 59-record application and its runtime libraries. Bundle-size performance remains a measured optimization task; functionality may not be removed merely to silence the size warning.
