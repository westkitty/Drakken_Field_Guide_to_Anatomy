# Architecture

## Classification

- Framework: React 19 + TypeScript + React Three Fiber
- Renderer: one Three.js WebGLRenderer owned by R3F
- Product: interactive forensic visualization
- UI owner: semantic DOM and CSS
- Runtime models: project-owned deterministic procedural geometry routed by stable record ID

## State and frame ownership

React owns record selection, layers, tools, camera commands, annotations, exports, drawers, and diagnostics snapshots. Per-frame transforms and animation clocks remain in refs updated by `useFrame`; React is not updated every frame.

## Model routing and lifecycle

All 59 registry records have an explicit record-specific route. Record switches use a monotonic request gate, and reselecting the active record cancels a different pending selection. The specimen component is keyed by record ID. R3F owns disposal of component-created geometries and materials.

## Sectioning

One Three.js clipping plane is derived from axis, position, and inversion state. It is supplied to specimen materials and Drei line materials so visible anatomy and functional overlays section together.

## Renderer quality and context lifecycle

The Canvas is keyed by quality tier because antialiasing is a WebGL context-creation option. Standard quality caps DPR at 1.6 with antialiasing and shadows; reduced quality uses DPR 1 without them. WebGL context event listeners are registered inside an effect and removed during Canvas disposal or quality remount.

## Measurement and scale

Pointer intersections are measured in chamber world coordinates and reported as reconstruction units. Record visualization-height values remain metadata. The current archive does not establish a validated physical meter calibration between procedural models, reference silhouettes, and chamber coordinates.

## Assets and evidence

The registry, assets ledger, provenance ledger, and license ledger each cover the same 59 stable `modelAssetRef` values. No remote runtime model, texture, font, audio, or shader dependency is permitted.

## Validation boundary

Typecheck, lint, unit/integrity tests, static audit, and production build are automated. Browser behavior, visual canon fidelity, responsive layout, target-device performance, context restoration, and long-session resource stabilization require direct runtime evidence.
