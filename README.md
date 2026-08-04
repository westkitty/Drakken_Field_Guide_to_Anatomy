# Drakken Field Anatomy Archive

A React Three Fiber forensic archive containing all 59 canonical Drakken records. Each record is selectable and routes to a record-specific procedural reconstruction with surface, structure, internal, and functional examination layers.

## Run the project

- `npm run dev`
- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run build`

## Build the engageable HTML

Run:

```bash
npm run build:html
npm run validate:html
```

The output is:

```text
dist-interactive-html/Drakken_Field_Guide_Interactive.html
```

That file is a self-contained interactive delivery. Open it directly in a modern browser; it does not require the Vite development server, `node_modules`, or a network connection after download.

The HTML delivery is required to preserve the complete product path:

- all 59 records and record switching;
- one live Three.js examination canvas with orbit, pan, and zoom;
- perspective and orthographic cameras, presets, and reset;
- silhouette, wireframe, and quality controls;
- surface, structure, internal, and functional anatomy layers;
- clipping, animation, measurement, scale references, and annotations;
- Registry, Tools, Record, Diagnostics, and briefing surfaces;
- Markdown and JSON dossier exports;
- keyboard shortcuts and responsive mobile containment.

CI builds the single-file HTML, statically verifies that it has no external runtime asset dependencies, opens it directly through a local `file://` URL, exercises the complete feature-parity matrix, and uploads the resulting HTML as the `drakken-interactive-html` artifact.

## Evidence state

Source compilation, lint, tests, production build, the self-contained HTML package, direct-file feature parity, and targeted desktop/mobile browser behavior are validated in GitHub Actions. Human art-direction approval, physical-device accessibility, native preference modes, and target-MacBook performance remain separate validation requirements. Procedural chamber geometry is normalized and must not be interpreted as proven canon scale.

See `OPERATIONAL_STATE.md`, `INTERACTIVE_HTML_DELIVERY.md`, `PRODUCT.md`, `DESIGN.md`, `docs/ARCHITECTURE.md`, and `docs/VALIDATION.md`.
