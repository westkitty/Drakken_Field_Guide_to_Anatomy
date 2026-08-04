# Operational State — Drakken Field Anatomy Archive

<!-- operational-state:metadata
{
  "schema_version": 1,
  "project_id": "drakken-field-anatomy-archive",
  "project_name": "Drakken Field Anatomy Archive",
  "project_root": ".",
  "artifact_path": "",
  "state_revision": 21,
  "last_updated": "2026-08-04T00:10:00-04:00",
  "current_baseline": {
    "identity": "repair/immersive-ui-model-quality-20260803, PR #4; application polish source through a21d0b02d580776fb9a6f8092d282e8facbb062b; durable polish ledger/test evidence through 345d92588512bc6f66b07f8aeaa27449b5663d41; plus this state revision",
    "state": "technically-verified-human-review-pending",
    "last_verified": "GitHub Actions run 30878949026 passed strict static audit, typecheck, zero-warning lint, tests, production build, and the targeted desktop/mobile product-polish browser audit on evidence head 345d92588512bc6f66b07f8aeaa27449b5663d41"
  },
  "scope_boundaries": [
    "Single browser archive at repository root",
    "Exactly 59 canonical Drakken records",
    "Canon governed by docs/drakken_compendium_full_blood_eclipse_visual_integrated.md and src/data/specimens.json",
    "No fabricated, duplicate, or wrapped records",
    "No backend, authentication, database, deployment, framework migration, or remote runtime asset work",
    "Automated source, browser, and screenshot evidence does not equal human art-direction or canon approval"
  ],
  "linked_parent_state": null
}
-->

## 1. Project Purpose

The Drakken Field Anatomy Archive is a React Three Fiber forensic compendium for 59 canonical records. The model is the primary product surface. Users can select a record, inspect a record-specific reconstruction, manipulate the camera, toggle surface/structure/internal/functional anatomy, section the model, use animation and measurement tools, review evidence, and export the dossier.

## 2. Current Baseline

PR #4 contains three bounded bodies of work:

1. a hidden-at-rest model-first interface;
2. two explicit canon-backed additions for every one of the 59 records;
3. a verified product-polish pass consisting of 40 initial improvements plus 11 repairs produced by adversarial review and browser evidence.

### Model-first interface

- full-window examination canvas;
- no persistent title bar, camera strip, bottom tool grid, chamber HUD, or scale note at rest;
- five faint deliberate reveal handles;
- Registry, Record, Tools, and Diagnostics drawers;
- `G`, `T`, `I`, and `D` shortcuts plus `Escape` closure;
- mutually exclusive drawers with scrim closure;
- focus entry, focus trapping, and trigger-focus restoration;
- hidden drawers are noninteractive;
- bounds-owned initial and reset framing;
- subdued floor, grid, exposure, and lights.

### Record-specific model work

- all 59 records retain dedicated base routes;
- every route is supplemented by `RecordEnhancementLayer`;
- `recordEnhancementData.ts` defines exactly two explicit canon-backed additions per record;
- additions belong to surface, structure, internal, or functional layers;
- additions honor clipping, silhouette, wireframe, measurement interaction, and animation timing;
- `MODEL_IMPROVEMENTS_LEDGER.md` records every addition and canon basis;
- regression tests prevent missing records, duplicate claims, invalid layers, and generic PASS language.

### Product polish

The durable implementation ledger is `POLISH_PASS.md`; the machine-readable contract is `src/polishManifest.ts`.

The 40 initial improvements cover:

- handle discoverability, safe areas, and target sizing;
- drawer semantics, scrolling, headings, focus and dismissal;
- registry search, filtering, counts, empty states, and loading state;
- reconstruction loading and error recovery;
- live mode and action feedback;
- complete tool reset, anatomy presets, disabled-state honesty, and accessible range values;
- numbered measurement points and better measurement guidance;
- independent annotation inspection and export selection;
- semantic keyboard-operable tabs;
- export counts and confirmation;
- briefing dismissal and guidance;
- responsive mobile-sheet containment;
- visual finish tokens, reduced-motion support, and regression tests.

Adversarial review produced 11 implemented repairs:

- Node-free browser-project tests;
- focus containment and restoration for every drawer;
- consistent Diagnostics drawer behavior;
- valid search labelling;
- complete tab keyboard behavior;
- stable reset dependencies;
- deterministic retry behavior;
- separate annotation inspection/export intent;
- measured mobile tools-sheet containment;
- corrected drawer/scrim stacking contexts;
- sharp drawer content with blur restricted to the background scrim.

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
- Ordinary pointer movement must not reveal interface chrome.

### INV-004 — Two explicit additions per record

- Every record has two distinct additions.
- At least one materially affects visible geometry, anatomy, proportion, or silhouette.
- Color-only, shared-lighting-only, generic root motion, route wiring, or boilerplate ledger text do not count.

### INV-005 — Canon and evidence honesty

- Additions derive from the specimen registry or governing dossier.
- Reconstructive interpretation must not be described as confirmed anatomy.
- Automated source/build/browser evidence must not be promoted to human visual approval.

### INV-006 — Preserve examination tools

- Orbit, pan, zoom, perspective/orthographic modes, presets, reset, four anatomy layers, clipping, animation, measurement, annotations, diagnostics, and exports remain protected.

### INV-007 — Local runtime assets

- Do not add remote fonts, models, textures, environment maps, audio, or shaders.
- Existing asset, provenance, and license ledgers remain complete.

### INV-008 — Scale honesty

- Chamber measurements remain reconstruction units.
- Visualization-height metadata is not a proven world-unit calibration.

### INV-009 — Polish must remain behavioral

- Polish claims require inspectable behavior or presentation changes, not a renamed PASS row.
- Modal drawers must contain focus and restore it on closure.
- Mobile sheets must remain inside measured viewport bounds.
- Scrim effects must remain behind readable drawer content.
- Reduced-motion and coarse-pointer behavior remain protected.

## 4. Verified Evidence

### Source and build

GitHub Actions run `30878949026` passed on evidence head `345d92588512bc6f66b07f8aeaa27449b5663d41`:

- locked dependency installation;
- strict static audit;
- TypeScript;
- ESLint with zero warnings;
- Vitest, including 59-record enhancement coverage and the 40-improvement/11-repair polish contract;
- production build.

Previously verified source contracts remain intact:

- 59 registry entries;
- 59 dedicated routes;
- zero fallback record IDs;
- complete clipping assignments;
- no remote application runtime references;
- complete asset, provenance, and license ledgers.

### Targeted product-polish browser audit

Run `30878949026` also passed the permanent targeted browser audit at desktop and mobile sizes. It verified:

- closed-at-rest presentation;
- five compact reveal handles;
- drawer focus entry, trapping, and restoration;
- Registry count and labelled search;
- Tools reset and three anatomy presets;
- keyboard tab navigation;
- independent annotation inspection and export controls;
- consistent Diagnostics drawer language;
- no desktop or mobile horizontal overflow;
- mobile tools-sheet viewport containment;
- no actionable DOM/CSS browser errors.

The audit records and excludes only the runner's exact SwiftShader `THREE.WebGLRenderer: Error creating WebGL context.` environment warning. It does not suppress any other page exception or console error and does not replace the separate renderer/model evidence.

### Visual screenshot review

Desktop Registry, desktop Tools, and mobile Tools screenshots were inspected after the mechanical audit. That review exposed two defects that the first assertions missed: mobile sheet geometry during transition and scrim blur composited across drawer content. Both were repaired. Final screenshots show sharp, contained drawer surfaces above the blurred background scrim.

### 59-record browser evidence

Normal-runtime browser run `30875253098` executed twelve five-record shards covering records 1–59. Every shard reached the end of its range, mounted each record, enabled all four anatomy layers, retained one canvas, and produced artifacts. Those jobs were marked failed only after the checks because the older harness treated a generic Vite development-server 404 as an application failure.

## 5. Implemented but Still Requiring Human Review

The following remain outside automated approval:

- artistic quality and anatomy of each complete 59-record composition;
- final canon fidelity of every reconstructive addition;
- whether individual procedural details need bespoke remodeling;
- final material balance on Andrew's MacBook display;
- animation quality and functional readability for every record;
- touch and screen-reader behavior on physical devices;
- long-session thermal and GPU behavior.

## 6. Known Risks

### RISK-001 — Bundle size

The main production JavaScript chunk remains above Vite's 500 kB warning threshold. Meaningful repair requires measured dynamic loading; warning suppression is prohibited.

### RISK-002 — Procedural enhancement ceiling

Two explicit canon-backed additions per record do not automatically equal bespoke artist-authored reconstructions. Human review may still classify records for moderate or replacement-level remodeling.

### RISK-003 — Software-rendered browser limits

Continuous animation, physical materials, and shadows make exhaustive headless WebGL sweeps expensive. The query-gated `?audit=1` mode renders on demand with reduced test-only effects; normal runtime behavior is unchanged. SwiftShader context availability is not treated as proof of real-device renderer failure.

## 7. Pending Work

### PND-001 — Human 59-record art-direction review

Review every record in the running application and mark it accepted, moderate-repair, or replacement-level. This blocks any claim that all models are artistically final.

### PND-002 — Physical-device interaction review

Verify pointer, keyboard, touch, screen-reader output, drawer focus, clipping, measurement, exports, and responsive behavior on target devices.

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
- Do not place visual effects above drawer content or allow mobile sheets to exceed viewport bounds.

## 9. Validation Matrix

| Claim | State | Evidence | Remaining proof |
|---|---|---|---|
| 59 unique records | verified | static audit and tests | none |
| 59 dedicated routes | verified | static audit | rendered human spot review |
| Two explicit additions per record | verified at source level | enhancement data, ledger, tests | human visual approval |
| 40 initial polish improvements | verified | polish manifest, tests, source inspection | physical-device review |
| 11 adversarial repairs | verified | critique ledger, source, tests, browser audit | physical-device review |
| Source compiles | verified | run `30878949026` | none |
| Lint is clean | verified | run `30878949026` | none |
| Tests pass | verified | run `30878949026` | none |
| Production build succeeds | verified | run `30878949026` | deployment/browser load |
| UI is hidden at rest | verified | targeted browser audit and screenshots | physical-device confirmation |
| Drawer focus and keyboard tabs | verified | targeted browser audit | screen-reader/physical-device confirmation |
| Desktop/mobile containment and overflow | verified | targeted browser audit | additional real-device sizes |
| Drawer content is visually sharp above scrim | verified in final screenshots | final visual evidence | cross-browser human check |
| All 59 records mount and expose four layers | verified by completed shard loops | run `30875253098` logs/artifacts | human interaction review |
| All 59 models are artistically final | unverified | not established | full human review |
| Performance readiness | at risk / unverified | bundle warning | target-device profile |

## 10. Revision Log

- **Revisions 1–16:** Bootstrap and dedicated-model source expansion across the closed 59-record inventory.
- **Revision 17:** Exhaustive repository bug sweep and automated source/build verification.
- **Revision 18:** Bug-sweep merge into `build-skymourn`.
- **Revision 19:** Brighter chamber and model-first viewport attempt; user rejected remaining persistent UI and model quality.
- **Revision 20 — 2026-08-03:** Implemented deliberate hidden-at-rest drawers, bounds framing, subdued chamber presentation, two explicit canon-backed additions for all 59 records, a precise durable ledger, regression tests, and 59-record browser mount/layer evidence.
- **Revision 21 — 2026-08-04:** Implemented 40 product-polish improvements, conducted a hostile release-candidate critique, implemented 11 resulting repairs, added durable polish contracts and a targeted desktop/mobile browser audit, corrected mobile containment and nested stacking-context blur, and passed source/build/browser validation. Human art-direction, physical-device, and performance approval remain pending.
