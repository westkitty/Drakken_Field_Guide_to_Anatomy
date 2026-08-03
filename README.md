# Drakken Field Anatomy Archive

A browser-based Three.js forensic compendium centered on a complete procedural reconstruction of Skymourn, with Gorevault and a Blood Ring providing the two other required archive categories.

The archive is designed for examination rather than selection. Every record can be rotated, sectioned, animated, measured, compared against generic scale references, annotated, inspected through four anatomy layers, and exported as Markdown or JSON.

## Canon authority

The specimen records are grounded in the supplied `drakken_compendium_full_blood_eclipse_visual_integrated.md` working-canon dossier. Skymourn also uses the supplied archive contact-sheet plate as a visual reference. The application does not invent canon dimensions. Each procedural model uses a clearly labeled visualization scale that is not presented as a canonical measurement.

Exactly three records are present:

1. Skymourn - mobile organism / Atmos-Engine
2. Gorevault - siege or processing entity / Civiformer
3. Blood Ring - fixed planetary infrastructure

## Run locally

```bash
npm install
npm run dev
```

Then open the local URL printed by Vite.

## Validation commands

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

The repository was authored in an environment without npm registry or browser access. Source-level checks were performed, but dependency-backed type checking, Vitest, Vite production build, and browser smoke validation must be run after installing dependencies.

## Keyboard controls

- `R` resets the camera.
- `Space` plays or pauses the current animation when focus is not inside a form field.
- `Escape` exits measurement mode and closes open drawers or diagnostics.
- Arrow keys adjust the clipping plane when its range control has focus.
- Tab order follows the visible DOM interface.

## Architecture

- One React Three Fiber canvas and one render-loop owner.
- DOM controls and accessibility surfaces.
- Procedural specimen models routed through stable asset IDs.
- React state for ordinary interface state; refs for per-frame animation.
- Renderer diagnostics sampled four times per second rather than every frame.
- React Three Fiber owns scene attachment and disposal on specimen unmount.
- Local clipping uses WebGLRenderer clipping planes.
- No remote runtime assets, hotlinks, backend, database, authentication, or deployment configuration.

See `docs/ARCHITECTURE.md` and `docs/ASSET_PIPELINE.md` for details.
