# Drakken Field Anatomy Archive — Exhaustive Bug Sweep

**Audit date:** 2026-08-03  
**Audit branch:** `audit/exhaustive-bug-sweep-20260803`  
**Target branch:** `build-skymourn`  
**Status:** Final automated validation in progress

## Scope

The sweep covers all repository-controlled application source, model modules, routing, specimen data, tests, build and lint configuration, workflow configuration, runtime manifests, documentation, accessibility paths, Three.js lifecycle behavior, export behavior, responsive UI, and validation evidence.

## Evidence rules

- Confirmed bugs require direct source contradiction, deterministic validation failure, or reproducible runtime evidence.
- Suspected risks remain separate until verified.
- A successful build does not prove browser interaction, accessibility, visual correctness, or resource stabilization.
- The audit uses one bounded repair pass per defect cluster, followed by an independent resweep.

## Coverage state

- [x] Repository and branch identity
- [x] Operational state and project contract
- [x] Complete repository file inventory
- [x] Package, TypeScript, ESLint, workflow, and dependency installation checks
- [x] Application state, controls, exports, responsive UI, and accessibility source
- [x] Examination chamber, renderer lifecycle, and shared model utilities
- [x] All procedural model modules and exact 59-record routing coverage
- [x] Specimen registry, source-reference, asset, provenance, and license reconciliation
- [x] Documentation and local-only runtime policy reconciliation
- [x] First and intermediate automated validation passes
- [ ] Final strict static audit, typecheck, lint, tests, and production build
- [ ] Browser, visual-canon, device, and long-session performance validation
- [ ] Final independent resweep and operational-state reconciliation

## Confirmed repaired defect clusters

1. Protected `THREE.Curve` constructors blocked TypeScript compilation.
2. The workflow Node version was below a locked dependency's supported floor.
3. Four canonical records had no dedicated model route: Glassspine, Quarrymind, Toxic Veil Engine, and Hive Floramother.
4. Skymourn animation incorrectly required hidden-layer refs before any movement could run.
5. Functional Drei line overlays did not participate consistently in section clipping.
6. Reduced-motion preference was detected but not applied to model playback.
7. Reselecting the active record could not cancel a different pending record switch.
8. The orientation dialog lacked initial focus, focus containment, and focus restoration.
9. Closed mobile drawers remained in the interaction and focus path.
10. Google Fonts introduced a prohibited remote runtime dependency.
11. Markdown and JSON exports omitted major dossier fields and used fragile download cleanup.
12. The render-quality toggle could not actually change WebGL antialiasing without renderer recreation.
13. WebGL context listeners were installed without lifecycle cleanup.
14. UI and documentation asserted an unverified meter-per-world-unit calibration.
15. Asset, provenance, and license ledgers covered only three of 59 record assets.
16. Project documentation still described superseded three-record and nine-archetype prototypes.
17. Evidence filters omitted valid evidence states, and annotation export selection could not be toggled off.
18. Static and integrity tests did not enforce full route, source, export, and ledger coverage.

## Evidence obtained so far

- Locked dependency installation: 253 packages, zero reported vulnerabilities.
- Static route coverage after repair: 59 dedicated routes, zero fallback IDs.
- Sectioning audit after repair: zero missing model-line or model-material clipping assignments.
- Runtime reference audit after repair: zero remote HTTP(S) dependencies in application source.
- Governance ledgers after repair: 59 asset entries, 59 provenance entries, and 59 license entries.
- Earlier corrected branch passed TypeScript, zero-warning lint, 10 tests, and production build before the final cross-cutting repair cluster. A fresh full run is required for the current revision.

## Known unverified areas

Browser rendering, camera behavior, touch/keyboard journeys, visual canon fidelity, responsive layout, WebGL context restoration, target-device performance, bundle loading behavior, and long-session renderer-memory stabilization still require direct runtime evidence.
