# Operational State — Drakken Field Anatomy Archive

<!-- operational-state:metadata
{
  "schema_version": 1,
  "project_id": "drakken-field-anatomy-archive",
  "project_name": "Drakken Field Anatomy Archive",
  "project_root": ".",
  "artifact_path": "",
  "state_revision": 17,
  "last_updated": "2026-08-03T10:50:00-04:00",
  "current_baseline": {
    "identity": "audit/exhaustive-bug-sweep-20260803 PR #2",
    "state": "partially-verified",
    "last_verified": "GitHub Actions run 30824468370: strict static audit, typecheck, zero-warning lint, 17 tests, and production build passed"
  },
  "scope_boundaries": [
    "Single browser archive at repository root",
    "All 59 canonical Drakken records remain present",
    "Canon governed by docs/drakken_compendium_full_blood_eclipse_visual_integrated.md",
    "The 59-record inventory is closed; do not fabricate, duplicate, or wrap records",
    "No deployment, backend, authentication, database, external asset sourcing, framework migration, or unrelated feature work",
    "Automated verification does not substitute for browser, visual-canon, device, or long-session performance evidence"
  ],
  "linked_parent_state": null
}
-->

## 1. Project Identity and Purpose

The Drakken Field Anatomy Archive is a React Three Fiber forensic compendium for 59 canonical records. Its protected user journey is: find a record, inspect a record-specific 3D reconstruction, manipulate the camera, toggle four anatomy layers, section the reconstruction, use animation and measurement tools, review evidence and incidents, and export the complete dossier.

## 2. Current Baseline

The current repair candidate is draft PR #2 from `audit/exhaustive-bug-sweep-20260803` into `build-skymourn`.

The exhaustive sweep established and repaired:

- explicit dedicated routing for all 59 records;
- four previously omitted models: Glassspine, Quarrymind, Toxic Veil Engine, and Hive Floramother;
- build-blocking Three.js curve constructors and Node engine metadata;
- section clipping across meshes and functional Drei line overlays;
- Skymourn animation ownership when optional layers are hidden;
- reduced-motion playback behavior;
- pending record-switch cancellation;
- modal focus containment and restoration;
- hidden mobile drawer interaction state;
- remote runtime font removal;
- complete Markdown and JSON exports;
- WebGL quality remount and context-listener cleanup;
- honest reconstruction-unit and scale language;
- complete 59-entry asset, provenance, and license ledgers;
- current project, design, architecture, pipeline, and validation documentation;
- permanent registry, source-reference, export, and governance tests;
- permanent strict static auditing in CI.

## 3. Artifact Contract

Maintain one usable archive containing all 59 canonical records. Every record must remain searchable, selectable, and explicitly routed. Each model must preserve surface, structure, internal, and functional examination layers; section clipping; animation; measurement; annotations; evidence status; camera controls; diagnostics; and complete dossier export.

Procedural chamber geometry is normalized for examination. Record visualization-height fields are metadata and are not a proven meter-per-world-unit calibration.

## 4. Active Invariants

### INV-001 — Preserve the closed 59-record registry

- **State:** `verified` at registry/source level
- **Rule:** Keep exactly 59 unique record IDs, archive IDs, and model asset IDs. Do not invent additional records.
- **Evidence:** strict static audit and integrity tests in run `30824468370`
- **Runtime gap:** browser navigation through all 59 remains unverified

### INV-002 — Every record has a dedicated route

- **State:** `verified` at source/build level
- **Rule:** No canonical record may rely on the generic parametric fallback as its active route.
- **Evidence:** static audit reports 59 dedicated routes and zero fallback IDs

### INV-003 — Canon governs model identity

- **State:** `implemented-unverified`
- **Rule:** Significant form and function derive from the dossier or remain explicitly reconstructive.
- **Evidence:** dedicated source components and record source references
- **Missing proof:** visual sibling comparison and rendered canon audit

### INV-004 — Protect the examination workflow

- **State:** `partially-verified`
- **Rule:** Preserve orbit, pan, zoom, reset, projection modes, layers, clipping, animations, measurement, annotations, diagnostics, exports, and responsive access.
- **Evidence:** typecheck, lint, tests, build, static source checks
- **Missing proof:** direct browser journey across pointer, keyboard, touch, and narrow layouts

### INV-005 — Keep runtime assets local and governed

- **State:** `verified` at source/ledger level
- **Rule:** No remote runtime fonts, models, textures, audio, or shaders. Every `modelAssetRef` must have asset, provenance, and license entries.
- **Evidence:** zero remote application references; 59/59/59 ledger coverage

### INV-006 — Do not overclaim scale

- **State:** `verified` at source/copy level
- **Rule:** Measurements use reconstruction units. Visualization-height metadata does not establish physical calibration.
- **Evidence:** UI, exports, manifests, design, architecture, and validation documentation

### INV-007 — Completion claims require current evidence

- **State:** `active`
- **Rule:** Source presence is not browser proof. A successful build is not visual, interaction, performance, or lifecycle verification.

## 5. Verified Automated Behavior

GitHub Actions run `30824468370` passed on the cleaned audit branch:

- locked dependency installation: 253 packages, zero reported vulnerabilities;
- strict static audit: zero issues;
- TypeScript project build;
- ESLint with `--max-warnings 0`;
- Vitest: 17/17 tests across two files;
- Vite production build: 592 transformed modules.

The strict audit specifically verified:

- 59 specimen records;
- 59 dedicated routes;
- zero fallback record IDs;
- zero missing line clipping assignments;
- zero missing material clipping assignments;
- zero remote application runtime references;
- 59 asset entries;
- 59 provenance entries;
- 59 license entries.

## 6. Known Remaining Risk

### RISK-001 — Oversized production JavaScript chunk

- **State:** `known-risk`
- **Evidence:** production build emitted a 1,574.68 kB minified / 389.13 kB gzip main JavaScript chunk and Vite's `>500 kB` warning
- **Impact:** initial parsing and loading may be expensive, especially on lower-tier mobile hardware
- **Why not blindly repaired:** meaningful improvement likely requires record-family or per-model dynamic loading and browser performance comparison; suppressing the warning or arbitrary manual chunking would not prove a faster user path

## 7. Implemented but Unverified Runtime Behavior

The following repairs compile and pass source-level checks but still require direct browser observation:

- reduced-motion startup and manual resume;
- cancellation of a pending record switch by reselecting the active record;
- keyboard focus trapping and restoration for the briefing dialog;
- mobile drawer visibility and focus behavior;
- quality-tier renderer recreation;
- WebGL context loss and restoration handling;
- sectioning of all functional lines in rendered models;
- measurement interactions and reconstruction-unit labels;
- complete file downloads across supported browsers;
- repeated model switching and resource stabilization;
- visual framing and canon fidelity for all 59 models.

## 8. Pending Work

### PND-001 — Browser acceptance sweep

Exercise representative records from every family and every repaired path using mouse, keyboard, touch, a narrow viewport, and reduced motion.

- **Priority:** critical before release
- **Blocks source handoff:** no
- **Blocks runtime completion claim:** yes

### PND-002 — Performance and lifecycle profile

Measure first load, record switching, `renderer.info` stabilization, memory growth, and target-device responsiveness. Compare any code-splitting candidate against this baseline.

- **Priority:** high
- **Blocks source correctness claim:** no
- **Blocks performance readiness claim:** yes

### PND-003 — Visual canon review

Rotate and compare every record against its dossier and closest sibling, including hidden-layer combinations and section planes.

- **Priority:** high
- **Blocks build claim:** no
- **Blocks full model-quality completion claim:** yes

## 9. Active Decisions and Prohibitions

- Keep React 19, Vite, TypeScript, Three.js, R3F, Drei, Vitest, ESLint, and plain CSS.
- Keep one WebGL canvas and DOM-owned interface controls.
- Keep dependencies pinned.
- Do not restore remote font loading.
- Do not claim meter calibration without a real model-bounds normalization system and evidence.
- Do not suppress the chunk warning as a substitute for performance work.
- Do not merge PR #2 as a verified runtime release without browser evidence.
- Do not begin another specimen batch unless the canon registry is intentionally expanded.

## 10. Validation Matrix

| Claim | State | Evidence | Missing proof |
|---|---|---|---|
| Registry contains 59 unique records | verified | static audit + integrity tests | browser navigation |
| Every record has a dedicated source route | verified | 59 routes, zero fallback IDs | rendered route exercise |
| Source compiles | verified | TypeScript pass | none |
| Lint is clean | verified | zero-warning ESLint pass | none |
| Tests pass | verified | 17/17 Vitest | browser E2E |
| Production bundle builds | verified | Vite build pass | deployment/browser load |
| No remote runtime references | verified at source level | strict static audit | network-panel confirmation |
| Section clipping is assigned consistently | verified at source level | zero clipping gaps | rendered clipping behavior |
| Examination workflow is usable | unverified | source and build evidence only | complete browser journey |
| Visual canon fidelity | unverified | dossier-grounded source | rendered comparison |
| Performance readiness | unverified / at risk | chunk warning | target-device profile |

## 11. Compact Revision Log

- **Revision 1–8:** Bootstrap, prototype, archive expansion, and rejection of shared-archetype completion claims.
- **Revision 9–16:** Bounded dedicated-model batches completed the closed 59-record source inventory.
- **Revision 17 — 2026-08-03:** Exhaustive repository bug sweep. Repaired build blockers, four missing model routes, cross-cutting interaction/accessibility/export/lifecycle defects, clipping consistency, governance ledgers, documentation, and automated integrity coverage. Promoted automated source/build claims to verified. Browser, visual-canon, device, lifecycle, and performance claims remain explicitly unverified.
