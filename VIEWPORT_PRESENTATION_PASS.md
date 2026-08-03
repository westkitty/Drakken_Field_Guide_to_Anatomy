# Model-First Viewport Presentation Pass

## User-reported failures

1. The chamber is too dark to inspect the reconstruction reliably.
2. The interface consumes too much of the available window.
3. Model presentation quality is poor; weak model anatomy must not be disguised as a lighting-only problem.

## Implemented source changes

- Added a model-first responsive layout override loaded after the base stylesheet.
- Converted the registry and dossier from permanent desktop columns into off-canvas drawers.
- Kept the full control set while compressing it into translucent viewport overlays.
- Expanded the chamber to the full remaining browser height.
- Rebuilt the chamber presentation with a brighter neutral background, closer camera presets, ACES tone mapping, higher exposure, three-point illumination, light-former reflections, softer shadows, brighter containment geometry, and contact shadows.
- Preserved the closed 59-record registry, all explicit routes, clipping, layers, measurements, annotations, diagnostics, animation, camera modes, and exports.

## Evidence boundary

The global presentation pass can improve visibility, framing, material readability, and apparent depth. It does not prove that every procedural reconstruction has strong anatomy or silhouette. Individual model quality remains subject to a rendered canon review and record-by-record reconstruction work.

## Required validation

- Strict static audit
- TypeScript
- Zero-warning lint
- Vitest
- Production build
- Browser inspection of the default Skymourn record
- Desktop viewport dominance and drawer behavior
- Reduced-motion, clipping, and record switching smoke checks
