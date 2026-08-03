# Architecture

## Classification

- Framework: React + TypeScript + React Three Fiber.
- Renderer: Three.js WebGLRenderer through one R3F Canvas.
- Product type: interactive forensic visualization.
- Frame-loop owner: React Three Fiber.
- UI owner: semantic DOM and CSS.
- Runtime asset route: deterministic procedural models selected by stable manifest ID.

## State ownership

React owns specimen selection, layer visibility, clipping controls, camera mode, tool state, annotation selection, export selection, responsive drawers, and diagnostics snapshots.

Per-frame transforms and animation clocks remain inside refs updated by `useFrame`. The runtime probe samples renderer information at a bounded interval and does not call React setters every frame.

## Scene lifecycle

Specimen selection uses a monotonic request token. A superseded request is ignored before it can replace the active specimen. The active specimen component is keyed by stable specimen ID, causing the previous procedural geometry and materials to unmount before the new specimen is attached. React Three Fiber then disposes owned geometry and materials.

No shared external textures, animation mixers, loaders, or decoder caches exist in this prototype. Future GLB integration must retain the same stable asset IDs and add explicit loader cancellation, animation mixer cleanup, cache release, and hash verification.

## Camera and input

Perspective and orthographic cameras share the same preset positions. OrbitControls provides orbit, pan, zoom, pointer, trackpad, and touch input. Camera presets are immediate under reduced motion.

Keyboard actions are normalized at the application boundary:

- reset camera
- animation play or pause
- escape active tools and drawers
- clipping range adjustment through native range semantics

## Measurement

Pointer intersections are captured in world coordinates. Distance is calculated directly from two world-space vectors, so results remain valid under model, camera, and orbit-control changes.

## Sectioning

A single Three.js Plane is derived from axis, position, and inversion state. The same plane is passed to every specimen-owned material. A PlaneHelper displays the active orientation.

## Quality policy

Standard quality caps device pixel ratio at 1.6 and enables antialiasing and shadows. Reduced quality fixes pixel ratio at 1 and disables antialiasing and shadows while preserving all functional tools.
