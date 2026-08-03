# Operational State — Drakken Field Anatomy Archive

<!-- operational-state:metadata
{
  "schema_version": 1,
  "project_id": "drakken-field-anatomy-archive",
  "project_name": "Drakken Field Anatomy Archive",
  "project_root": ".",
  "artifact_path": "",
  "state_revision": 19,
  "last_updated": "2026-08-03T12:24:00-04:00",
  "current_baseline": {
    "identity": "build-skymourn model-first viewport source through commit ada1257453d228ef9d5e6c8d85a27aadf39c0bc0; validated by PR #3 run 30831484791",
    "state": "partially-verified",
    "last_verified": "GitHub Actions run 30831484791: strict static audit, typecheck, zero-warning lint, 17 tests, and production build passed"
  },
  "scope_boundaries": [
    "Single browser archive at repository root",
    "All 59 canonical Drakken records remain present",
    "Canon governed by docs/drakken_compendium_full_blood_eclipse_visual_integrated.md",
    "The 59-record inventory is closed; do not fabricate, duplicate, or wrap records",
    "No deployment, backend, authentication, database, external asset sourcing, framework migration, or unrelated feature work",
    "Automated verification does not substitute for browser, visual-canon, device, or long-session performance evidence",
    "Global lighting and layout polish must not be misrepresented as record-level model reconstruction"
  ],
  "linked_parent_state": null
}
-->

## 1. Project Identity and Purpose

The Drakken Field Anatomy Archive is a React Three Fiber forensic compendium for 59 canonical records. Its protected user journey is: find a record, inspect a record-specific 3D reconstruction, manipulate the camera, toggle four anatomy layers, section the reconstruction, use animation and measurement tools, review evidence and incidents, and export the complete dossier.

The model is the primary product surface. Registry, record text, diagnostics, and technical controls must support examination rather than permanently consume most of the window.

## 2. Current Baseline

The active source baseline is `build-skymourn` through commit `ada1257453d228ef9d5e6c8d85a27aadf39c0bc0`.

The model-first presentation pass added:

- a full-height examination viewport;
- off-canvas registry and record drawers instead of permanent desktop columns;
- compact translucent title, camera, render, anatomy, sectioning, animation, and measurement overlays;
- a brighter neutral chamber background and floor;
- closer camera presets and narrower perspective field of view;
- ACES filmic tone mapping and increased exposure;
- hemisphere, key, fill, rim, front, and low warm illumination;
- local light-former reflections for physical and transmissive materials;
- soft contact shadows and higher-resolution standard-tier shadows;
- brighter containment grid and family accent rings;
- local-only source with no new runtime dependency or remote asset.

PR #3 exists only to run the permanent pull-request validation workflow against this exact updated tree and carry the presentation-pass report. GitHub Actions run `30831484791` passed.

## 3. Artifact Contract

Maintain one usable archive containing all 59 canonical records. Every record must remain searchable, selectable, and explicitly routed. Each model must preserve surface, structure, internal, and functional examination layers; section clipping; animation; measurement; annotations; evidence status; camera controls; diagnostics; and complete dossier export.

The chamber must prioritize model visibility. Persistent interface chrome must not reduce the model to a secondary dashboard tile.

Procedural chamber geometry is normalized for examination. Record visualization-height fields are metadata and are not a proven meter-per-world-unit calibration.

## 4. Active Invariants

### INV-001 — Preserve the closed 59-record registry

- **State:** `verified` at registry/source level
- **Rule:** Keep exactly 59 unique record IDs, archive IDs, and model asset IDs. Do not invent additional records.
- **Evidence:** strict static audit and integrity tests
- **Runtime gap:** browser navigation through all 59 remains unverified

### INV-002 — Every record has a dedicated route

- **State:** `verified` at source/build level
- **Rule:** No canonical record may rely on the generic parametric fallback as its active route.
- **Evidence:** static audit reports 59 dedicated routes and zero fallback IDs

### INV-003 — Canon governs model identity

- **State:** `implemented-unverified`
- **Rule:** Significant form and function derive from the dossier or remain explicitly reconstructive.
- **Missing proof:** visual sibling comparison and rendered canon audit

### INV-004 — Protect the examination workflow

- **State:** `partially-verified`
- **Rule:** Preserve orbit, pan, zoom, reset, projection modes, layers, clipping, animations, measurement, annotations, diagnostics, exports, and responsive access.
- **Evidence:** typecheck, lint, tests, build, and static source checks
- **Missing proof:** direct browser journey across pointer, keyboard, touch, and narrow layouts

### INV-005 — Keep runtime assets local and governed

- **State:** `verified` at source/ledger level
- **Rule:** No remote runtime fonts, models, textures, audio, shaders, or environment maps. Every `modelAssetRef` must have asset, provenance, and license entries.
- **Evidence:** zero remote application references; 59/59/59 ledger coverage

### INV-006 — Do not overclaim scale

- **State:** `verified` at source/copy level
- **Rule:** Measurements use reconstruction units. Visualization-height metadata does not establish physical calibration.

### INV-007 — Completion claims require current evidence

- **State:** `active`
- **Rule:** Source presence and successful builds are not visual, interaction, performance, lifecycle, or model-quality proof.

### INV-008 — Model-first viewport

- **State:** `implemented-unverified`
- **Rule:** At ordinary desktop widths, the chamber occupies nearly the entire working window; registry and dossier remain accessible as temporary drawers.
- **Evidence:** layout source and successful build
- **Missing proof:** rendered desktop and laptop viewport inspection

### INV-009 — Presentation is not anatomy quality

- **State:** `active`
- **Rule:** Lighting, tone mapping, shadows, camera framing, and interface reduction may improve readability but cannot be counted as record-level model reconstruction.

## 5. Verified Automated Behavior

GitHub Actions run `30831484791` passed against the model-first viewport tree:

- locked dependency installation;
- strict static audit: zero issues;
- TypeScript project build;
- ESLint with `--max-warnings 0`;
- Vitest: 17/17 tests across two files;
- Vite production build.

Previously verified source contracts remain intact:

- 59 specimen records;
- 59 dedicated routes;
- zero fallback record IDs;
- zero missing line or material clipping assignments;
- zero remote application runtime references;
- 59 asset entries;
- 59 provenance entries;
- 59 license entries.

## 6. Known Problems and Risks

### KNOWN-001 — Rendered model quality was rejected by the user

- **State:** `known-broken` for the pre-pass browser presentation; current pass requires re-evaluation
- **User evidence:** the running archive was described as too dark, dominated by UI, and containing very poor models
- **Interpretation:** darkness and framing were shared presentation failures; record anatomy and silhouette quality may also be independently weak
- **Guardrail:** do not close this issue based only on CI or shared lighting changes

### RISK-001 — Oversized production JavaScript chunk

- **State:** `known-risk`
- **Evidence:** the production bundle remains above Vite's 500 kB warning threshold
- **Impact:** initial parsing and loading may be expensive on lower-tier hardware
- **Required repair method:** measured lazy loading, not warning suppression

### RISK-002 — Brighter presentation may expose weak geometry more clearly

- **State:** `known-risk`
- **Meaning:** the new studio rig improves inspection truthfulness; models with weak silhouettes, generic primitives, poor topology, or inadequate detail may look worse rather than better
- **Required response:** record-level visual audit and bounded reconstruction

## 7. Implemented but Unverified Runtime Behavior

- model-first desktop layout and off-canvas drawers;
- compact viewport overlays at laptop and mobile breakpoints;
- brighter background, floor, lighting, reflections, shadows, and closer cameras;
- Skymourn material readability under the new studio rig;
- reduced-motion startup and manual resume;
- pending record-switch cancellation;
- keyboard focus trapping and restoration;
- mobile drawer visibility and focus behavior;
- renderer recreation between quality tiers;
- WebGL context loss and restoration handling;
- rendered sectioning of all functional lines;
- measurement interactions and file downloads;
- repeated switching and resource stabilization;
- visual framing and canon fidelity for all 59 models.

## 8. Pending Work

### PND-001 — Immediate browser re-evaluation

Reload the merged source locally and inspect the default Skymourn record at the actual MacBook window size.

Required observations:

- model is clearly visible without squinting;
- model occupies the majority of the window;
- registry and record drawers open and close correctly;
- tool overlays remain usable without dominating the chamber;
- transparent and emissive surfaces remain distinguishable;
- camera reset and preset views frame Skymourn adequately.

- **Priority:** critical
- **Blocks presentation completion claim:** yes

### PND-002 — Record-level model quality audit

Review all 59 rendered models by family. Classify each as pass, presentation-only repair, moderate reconstruction, or replacement-level reconstruction.

- **Priority:** critical
- **Blocks full model-quality claim:** yes

### PND-003 — Performance and lifecycle profile

Measure first load, record switching, `renderer.info` stabilization, memory growth, and target-device responsiveness under the richer chamber lighting.

- **Priority:** high

### PND-004 — Visual canon review

Rotate and compare every record against its dossier and closest sibling, including hidden-layer combinations and section planes.

- **Priority:** high

### PND-005 — Delete validation branch after PR #3 closes

Delete `qa/model-first-viewport-20260803` after the presentation-pass record is merged or otherwise reconciled.

- **Priority:** low repository hygiene

## 9. Active Decisions and Prohibitions

- Keep React 19, Vite, TypeScript, Three.js, R3F, Drei, Vitest, ESLint, and plain CSS.
- Keep one WebGL canvas and DOM-owned interface controls.
- Keep dependencies pinned.
- Do not restore remote font or environment-map loading.
- Do not claim meter calibration without a proven bounds-normalization system.
- Do not suppress the chunk warning as a substitute for performance work.
- Do not describe the archive as visually repaired until the user rechecks the running browser.
- Do not count shared lighting or CSS as completed model reconstruction.
- Do not begin new canon records unless the registry is intentionally expanded.

## 10. Validation Matrix

| Claim | State | Evidence | Missing proof |
|---|---|---|---|
| Registry contains 59 unique records | verified | static audit + integrity tests | browser navigation |
| Every record has a dedicated source route | verified | 59 routes, zero fallback IDs | rendered route exercise |
| Source compiles | verified | TypeScript pass | none |
| Lint is clean | verified | zero-warning ESLint pass | none |
| Tests pass | verified | 17/17 Vitest | browser E2E |
| Production bundle builds | verified | Vite build pass | browser load |
| No remote runtime references | verified at source level | strict static audit | network-panel confirmation |
| Model-first layout is usable | implemented-unverified | source + build | actual browser inspection |
| Chamber is bright enough | implemented-unverified | new studio source | user/browser confirmation |
| Skymourn presentation is improved | implemented-unverified | camera and lighting source | rendered comparison |
| All model anatomy is good | known false / unverified | user rejection | 59-record model audit |
| Performance readiness | unverified / at risk | bundle warning and richer lighting | target-device profile |

## 11. Compact Revision Log

- **Revision 1–8:** Bootstrap, prototype, archive expansion, and rejection of shared-archetype completion claims.
- **Revision 9–16:** Bounded dedicated-model batches completed the closed 59-record source inventory.
- **Revision 17:** Exhaustive repository bug sweep and automated source/build verification.
- **Revision 18:** Squash-merged the bug-sweep repairs into `build-skymourn` and preserved runtime evidence gaps.
- **Revision 19 — 2026-08-03:** Recorded the user's visual rejection and implemented the model-first viewport and brighter studio chamber. Automated validation passed in run `30831484791`; browser presentation and record-level model quality remain unverified.
