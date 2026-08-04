# Operational State — Drakken Field Anatomy Archive

<!-- operational-state:metadata
{
  "schema_version": 1,
  "project_id": "drakken-field-anatomy-archive",
  "project_name": "Drakken Field Anatomy Archive",
  "project_root": ".",
  "artifact_path": "",
  "state_revision": 20,
  "last_updated": "2026-08-03T22:26:00-04:00",
  "current_baseline": {
    "identity": "repair/immersive-ui-model-quality-20260803, PR #4, source through 7de33f65bd8081257a5d065fabbb01785cb747a0 plus this state revision",
    "state": "partially-verified",
    "last_verified": "GitHub Actions run 30876070337 passed strict static audit, typecheck, zero-warning lint, tests, and production build; normal-runtime browser shards in run 30875253098 completed all 59 record mounts and four-layer interactions before a known generic Vite 404 false-positive"
  },
  "scope_boundaries": [
    "Single browser archive at repository root",
    "Exactly 59 canonical Drakken records",
    "Canon governed by docs/drakken_compendium_full_blood_eclipse_visual_integrated.md and src/data/specimens.json",
    "No fabricated, duplicate, or wrapped records",
    "No backend, authentication, database, deployment, framework migration, or remote runtime asset work",
    "Automated mount evidence does not equal human art-direction or canon approval"
  ],
  "linked_parent_state": null
}
-->

## 1. Project Purpose

The Drakken Field Anatomy Archive is a React Three Fiber forensic compendium for 59 canonical records. The model is the primary product surface. Users must be able to select a record, inspect a record-specific reconstruction, manipulate the camera, toggle surface/structure/internal/functional anatomy, section the model, use animation and measurement tools, review evidence, and export the dossier.

## 2. Current Baseline

PR #4 repairs the rejected dashboard-like presentation and replaces the former boilerplate model-completion claim with explicit record-level work.

Implemented UI behavior:

- full-window examination canvas;
- no persistent title bar, camera strip, bottom tool grid, chamber HUD, or scale note at rest;
- five faint 30-pixel deliberate reveal handles;
- left Registry drawer, right Record drawer, bottom Tools drawer, and compact Diagnostics control;
- `G`, `T`, `I`, and `D` shortcuts plus `Escape` to close;
- one primary drawer at a time, scrim closure, focus transfer, and focus restoration;
- hidden drawers are noninteractive;
- bounds-owned initial and reset framing;
- dimmer floor, grid, exposure, and lights so pale/transmissive models retain contour.

Implemented model behavior:

- all 59 records retain their dedicated base routes;
- every route is wrapped by `RecordEnhancementLayer`;
- `recordEnhancementData.ts` defines exactly two explicit, canon-backed additions for every record;
- every addition belongs to a surface, structure, internal, or functional layer;
- additions honor clipping, silhouette, wireframe, measurement interaction, and animation timing;
- `MODEL_IMPROVEMENTS_LEDGER.md` records the exact additions and canon basis for every record;
- `modelEnhancements.test.ts` prevents missing records, duplicate claims, invalid layers, and the rejected generic PASS language.

## 3. Active Invariants

### INV-001 — Closed registry

- Exactly 59 unique records remain present.
- No record may be invented, duplicated, or wrapped.

### INV-002 — Dedicated routes remain intact

- Every canonical record keeps its dedicated model route.
- The enhancement layer supplements rather than replaces the record-specific base model.

### INV-003 — Model-first presentation

- At rest, the canvas fills the useful window.
- Persistent interface bars are prohibited.
- Controls appear only through deliberate edge handles or keyboard shortcuts.
- Pointer movement used for orbiting must not reveal interface chrome.

### INV-004 — Two explicit additions per record

- Every record must have two distinct additions.
- At least one must materially affect visible geometry, anatomy, proportion, or silhouette.
- Color-only, shared-lighting-only, generic root motion, route wiring, or boilerplate ledger text do not count.

### INV-005 — Canon and evidence honesty

- Additions derive from the specimen registry or governing dossier.
- Reconstructive interpretation must not be described as confirmed anatomy.
- Automated source/build/mount evidence must not be promoted to human visual approval.

### INV-006 — Preserve examination tools

- Orbit, pan, zoom, perspective/orthographic modes, presets, reset, four anatomy layers, clipping, animation, measurement, annotations, diagnostics, and exports remain protected.

### INV-007 — Local runtime assets

- Do not add remote fonts, models, textures, environment maps, audio, or shaders.
- Existing asset, provenance, and license ledgers remain complete.

### INV-008 — Scale honesty

- Chamber measurements remain reconstruction units.
- Visualization-height metadata is not a proven world-unit calibration.

## 4. Verified Evidence

### Source and build

GitHub Actions run `30876070337` passed on the repair head:

- locked dependency installation;
- strict static audit;
- TypeScript;
- ESLint with zero warnings;
- Vitest, including exact 59-record enhancement coverage;
- production build.

Previously verified source contracts remain intact:

- 59 registry entries;
- 59 dedicated routes;
- zero fallback record IDs;
- complete clipping assignments;
- no remote application runtime references;
- complete asset, provenance, and license ledgers.

### Browser interaction

Normal-runtime browser run `30875253098` executed twelve five-record shards covering records 1–59. Every shard reached the end of its assigned range, mounted each record, enabled all four anatomy layers, retained one canvas, and produced screenshot artifacts. The jobs were marked failed only after those checks because the harness treated one generic Vite development-server 404 as an application console failure. There were no page exceptions or record error overlays in the completed ranges.

The captured 1440×900, 1280×800, and 390×844 views demonstrate:

- persistent bars removed;
- canvas occupying the full window;
- drawers closed at rest;
- only faint edge handles visible;
- Skymourn fully framed;
- floor/grid substantially subdued.

## 5. Implemented but Still Requiring Human Review

The following are implemented and automated-mount tested, but not approved as final art:

- artistic quality and anatomy of each of the 59 complete compositions;
- fidelity of every addition to the intended visual canon;
- whether any procedural detail should be remodeled rather than supplemented;
- final material balance on Andrew's MacBook display;
- animation quality and functional readability for every record;
- touch ergonomics and screen-reader behavior on physical devices;
- long-session thermal and GPU behavior.

## 6. Known Risks

### RISK-001 — Bundle size

The main production JavaScript chunk remains above Vite's 500 kB warning threshold. Meaningful repair requires measured dynamic loading; warning suppression is prohibited.

### RISK-002 — Procedural enhancement ceiling

The new layer gives every record two explicit, canon-backed forms, but a procedural addition is not automatically equivalent to a bespoke artist-authored reconstruction. Human review may still classify individual records for moderate or replacement-level remodeling.

### RISK-003 — Software-rendered browser cost

Continuous animation, physical materials, and shadows make full 59-record headless WebGL sweeps expensive. The repository contains a query-gated `?audit=1` mode that renders on demand with reduced test-only effects; normal runtime behavior is unchanged.

## 7. Pending Work

### PND-001 — Human 59-record art-direction review

Review every record in the running application and mark it accepted, moderate-repair, or replacement-level. This blocks any claim that all models are artistically final.

### PND-002 — Physical-device interaction review

Verify pointer, keyboard, touch, drawer focus, clipping, measurement, exports, and responsive behavior on target devices.

### PND-003 — Performance profile

Measure first load, record switching, memory stabilization, GPU load, and thermals on the MacBook. Compare any code-splitting candidate against the measured baseline.

## 8. Prohibitions

- Do not restore persistent dashboard chrome.
- Do not reveal controls on ordinary pointer movement.
- Do not replace precise ledger entries with generic PASS wording.
- Do not describe automated mounting as human canon or art approval.
- Do not suppress the bundle warning instead of measuring performance.
- Do not add dependencies or remote runtime assets without a demonstrated requirement.
- Do not expand the closed registry without an explicit canon decision.

## 9. Validation Matrix

| Claim | State | Evidence | Remaining proof |
|---|---|---|---|
| 59 unique records | verified | static audit and tests | none |
| 59 dedicated routes | verified | static audit | rendered spot review |
| Two explicit additions per record | verified at source level | `recordEnhancementData.ts`, ledger, tests | human visual approval |
| Source compiles | verified | run `30876070337` | none |
| Lint is clean | verified | run `30876070337` | none |
| Tests pass | verified | run `30876070337` | none |
| Production build succeeds | verified | run `30876070337` | deployment/browser load |
| UI is hidden at rest | verified in automated screenshots | browser artifacts | physical-device confirmation |
| All 59 records mount and expose four layers | verified by completed shard loops | run `30875253098` logs/artifacts | human interaction review |
| All 59 models are artistically final | unverified | not established | full human review |
| Performance readiness | at risk / unverified | bundle warning | target-device profile |

## 10. Revision Log

- **Revisions 1–16:** Bootstrap and dedicated-model source expansion across the closed 59-record inventory.
- **Revision 17:** Exhaustive repository bug sweep and automated source/build verification.
- **Revision 18:** Bug-sweep merge into `build-skymourn`.
- **Revision 19:** Brighter chamber and model-first viewport attempt; user rejected remaining persistent UI and model quality.
- **Revision 20 — 2026-08-03:** Implemented deliberate hidden-at-rest drawers, bounds framing, subdued chamber presentation, two explicit canon-backed additions for all 59 records, a precise durable ledger, regression tests, and 59-record browser mount/layer evidence. Human art-direction, physical-device, and performance approval remain pending.
