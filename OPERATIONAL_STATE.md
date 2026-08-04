# Operational State — Drakken Field Anatomy Archive

<!-- operational-state:metadata
{
  "schema_version": 1,
  "project_id": "drakken-field-anatomy-archive",
  "project_name": "Drakken Field Anatomy Archive",
  "project_root": ".",
  "artifact_path": "",
  "state_revision": 22,
  "last_updated": "2026-08-04T01:12:00-04:00",
  "current_baseline": {
    "identity": "repair/immersive-ui-model-quality-20260803, PR #4; application and permanent audit source through 51fb122fef485e97f22744e377f39c95a67cd8f5; durable second-wave evidence through dcc0e50800ce5e8d69b0feda12aee0c89dee3050; plus this state revision",
    "state": "technically-verified-human-review-pending",
    "last_verified": "GitHub Actions run 30880875699 passed strict static audit, typecheck, zero-warning lint, tests, production build, and the expanded desktop/mobile product-polish browser audit on application head 51fb122fef485e97f22744e377f39c95a67cd8f5"
  },
  "scope_boundaries": [
    "Single browser archive at repository root",
    "Exactly 59 canonical Drakken records",
    "Canon governed by docs/drakken_compendium_full_blood_eclipse_visual_integrated.md and src/data/specimens.json",
    "No fabricated, duplicate, or wrapped records",
    "No backend, authentication, database, deployment, framework migration, or remote runtime asset work",
    "Automated source, browser, and screenshot evidence does not equal human art-direction, physical-device, or canon approval"
  ],
  "linked_parent_state": null
}
-->

## 1. Project Purpose

The Drakken Field Anatomy Archive is a React Three Fiber forensic compendium for 59 canonical records. The model is the primary product surface. Users can select a record, inspect a record-specific reconstruction, manipulate the camera, toggle surface/structure/internal/functional anatomy, section the model, use animation and measurement tools, review evidence, and export the dossier.

## 2. Current Baseline

PR #4 now contains four bounded bodies of work:

1. a hidden-at-rest model-first interface;
2. two explicit canon-backed additions for every one of the 59 records;
3. the first verified product-polish pass: 40 improvements plus 11 adversarial repairs;
4. the second verified product-polish pass: 39 new improvements plus 11 adversarial and screenshot-driven repairs.

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

### Product polish wave 1

The first durable ledger is `POLISH_PASS.md`; its machine-readable contract is `src/polishManifest.ts`.

Wave 1 implemented 40 improvements across:

- handle discoverability, safe areas, and target sizing;
- drawer semantics, scrolling, headings, focus and dismissal;
- Registry search, filtering, counts, empty states, and loading state;
- reconstruction loading and error recovery;
- live mode and action feedback;
- complete tool reset, anatomy presets, disabled-state honesty, and accessible range values;
- numbered measurement points and better guidance;
- independent annotation inspection and export selection;
- semantic keyboard-operable tabs;
- export counts and confirmation;
- briefing dismissal and guidance;
- responsive mobile containment;
- visual finish tokens, reduced-motion support, and regression tests.

Wave 1 adversarial review produced 11 repairs, including focus containment/restoration, valid search semantics, complete tab keyboard behavior, deterministic retry, annotation intent separation, measured mobile sheet containment, and corrected scrim/drawer stacking contexts.

### Product polish wave 2

The second durable ledger is `POLISH_WAVE_2.md`; its machine-readable contract is `src/polishWave2Manifest.ts`.

Wave 2 implemented 39 additional improvements across:

- text selection, balanced headings, and improved long-form wrapping;
- raised surfaces, inner edges, scrollbar finish, and sticky-heading depth;
- close-control, search, filter, Registry summary, card, loading, and empty-state polish;
- compact tool grouping, panel hierarchy, custom ranges and selects, disabled-state clarity, and non-color active markers;
- mode-rail, record-tab, dossier-card, annotation, export-footer, diagnostics, toast, loading, error, and briefing finish;
- mobile tab snapping, card compaction, and Tools spacing.

Wave 2 adversarial and screenshot review produced 11 repairs:

- load the previously orphaned `polish-legibility.css` layer;
- reserve space under the first sticky export footer;
- prevent active-marker width jitter;
- remove hover lift and enlarge micro-controls on coarse pointers;
- release sticky record chrome on narrow screens;
- add reduced-motion, reduced-transparency, increased-contrast, and forced-colors fallbacks;
- replace the still-overlapping sticky export footer with an in-flow footer;
- wrap mobile camera/render controls and use a contained two-column anatomy grid.

## 3. Active Invariants

### INV-001 — Closed registry

- Exactly 59 unique records remain present.
- No record may be invented, duplicated, or wrapped.

### INV-002 — Dedicated routes remain intact

- Every canonical record keeps its dedicated model route.
- Enhancement layers supplement rather than replace record-specific base models.

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

- Polish claims require inspectable behavior or presentation changes, not renamed PASS rows.
- Modal drawers must contain focus and restore it on closure.
- Mobile sheets must remain inside measured viewport bounds.
- Scrim effects must remain behind readable drawer content.
- Reduced-motion and coarse-pointer behavior remain protected.

### INV-010 — Finish must not conceal content

- Drawer content must remain sharp and opaque above the scrim.
- Export actions may not cover annotation or dossier content.
- Mobile tool groups may not depend on clipped or undiscoverable horizontal overflow.
- Active-state affordances may not cause layout jitter.
- System accessibility preferences must retain usable controls and content.

## 4. Verified Evidence

### Source and build

GitHub Actions run `30880875699` passed on application head `51fb122fef485e97f22744e377f39c95a67cd8f5`:

- locked dependency installation;
- strict static audit;
- TypeScript;
- ESLint with zero warnings;
- Vitest, including exact 59-record enhancement coverage, the first 40-improvement/11-repair contract, and the second 39-improvement/11-repair contract;
- production build.

Previously verified source contracts remain intact:

- 59 registry entries;
- 59 dedicated routes;
- zero fallback record IDs;
- complete clipping assignments;
- no remote application runtime references;
- complete asset, provenance, and license ledgers.

### Expanded product-polish browser audit

Run `30880875699` also passed the permanent expanded browser audit at desktop and mobile sizes. It verified:

- closed-at-rest presentation and five compact reveal handles;
- active loading of `polish-legibility.css`, `polish-wave2.css`, and `polish-wave2-repairs.css`;
- sharp, opaque drawer surfaces with no content-level backdrop blur;
- Registry count, labelled search, visible search focus, card depth, focus trapping, and focus restoration;
- Tools reset, three anatomy presets, custom range treatment, custom select treatment, and panel depth;
- record-tab keyboard navigation;
- independent annotation inspection and export controls;
- an in-flow export footer with zero measured annotation overlap;
- aligned Diagnostics values using tabular numerals;
- no desktop or mobile horizontal overflow;
- a 390 × 844 Tools sheet fully inside the viewport;
- no internal camera/render group overflow;
- no anatomy-grid overflow and exactly two mobile layer columns;
- narrow record tabs and export actions in normal flow;
- decorative transition shutdown under reduced motion;
- zero actionable page or console errors.

The audit recorded twenty exact SwiftShader `THREE.WebGLRenderer: Error creating WebGL context.` environment warnings. Those are excluded only from this DOM/CSS gate. They do not replace or invalidate separate renderer/model evidence.

### Visual screenshot review

The final generated screenshots were inspected after the automated audit. They show:

- a sharp Registry surface with focused search, segmented filters, and elevated record cards;
- a contained desktop Tools surface with clear grouping and custom controls;
- a complete annotation detail placed above an in-flow export footer, with no overlay;
- a 390-pixel mobile Tools sheet where camera controls wrap and all four anatomy controls fit in a two-column grid.

The screenshot review found no remaining defect within this bounded second-wave polish scope.

### 59-record browser evidence

Normal-runtime browser run `30875253098` executed twelve five-record shards covering records 1–59. Every shard reached the end of its range, mounted each record, enabled all four anatomy layers, retained one canvas, and produced artifacts. Those older jobs were marked failed only after the checks because the prior harness treated a generic Vite development-server 404 as an application failure.

## 5. Implemented but Still Requiring Human Review

The following remain outside automated approval:

- artistic quality and anatomy of each complete 59-record composition;
- final canon fidelity of every reconstructive addition;
- whether individual procedural details need bespoke remodeling;
- final material balance on Andrew's MacBook display;
- animation quality and functional readability for every record;
- physical-device touch and screen-reader behavior;
- manual reduced-transparency, increased-contrast, and forced-colors review;
- long-session thermal and GPU behavior.

## 6. Known Risks

### RISK-001 — Bundle size

The main production JavaScript chunk remains above Vite's 500 kB warning threshold. Meaningful repair requires measured dynamic loading; warning suppression is prohibited.

### RISK-002 — Procedural enhancement ceiling

Two explicit canon-backed additions per record do not automatically equal bespoke artist-authored reconstructions. Human review may still classify records for moderate or replacement-level remodeling.

### RISK-003 — Software-rendered browser limits

Continuous animation, physical materials, and shadows make exhaustive headless WebGL sweeps expensive. The query-gated `?audit=1` mode renders on demand with reduced test-only effects; normal runtime behavior is unchanged. SwiftShader context availability is not treated as proof of real-device renderer failure.

### RISK-004 — Preference emulation coverage

Reduced motion is automated. Reduced transparency, increased contrast, and forced colors are implemented at source level but still require physical or native-browser manual review because Chromium automation support is incomplete for those modes.

## 7. Pending Work

### PND-001 — Human 59-record art-direction review

Review every record in the running application and mark it accepted, moderate-repair, or replacement-level. This blocks any claim that all models are artistically final.

### PND-002 — Physical-device interaction review

Verify pointer, keyboard, touch, screen-reader output, drawer focus, clipping, measurement, exports, responsive behavior, and accessibility preference modes on target devices.

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
- Do not place visual effects above drawer content.
- Do not allow mobile sheets or internal tool groups to exceed viewport bounds.
- Do not pin action surfaces over dossier or annotation content.

## 9. Validation Matrix

| Claim | State | Evidence | Remaining proof |
|---|---|---|---|
| 59 unique records | verified | static audit and tests | none |
| 59 dedicated routes | verified | static audit | rendered human spot review |
| Two explicit additions per record | verified at source level | enhancement data, ledger, tests | human visual approval |
| First 40 polish improvements | verified | wave-1 manifest, tests, source, browser audit | physical-device review |
| First 11 adversarial repairs | verified | wave-1 critique, source, tests, browser audit | physical-device review |
| Second 39 polish improvements | verified | wave-2 manifest, source, tests, expanded browser audit | physical-device review |
| Second 11 adversarial repairs | verified | wave-2 critique, source, tests, expanded browser audit, screenshots | preference/device review |
| Source compiles | verified | run `30880875699` | none |
| Lint is clean | verified | run `30880875699` | none |
| Tests pass | verified | run `30880875699` | none |
| Production build succeeds | verified | run `30880875699` | deployment/browser load |
| UI is hidden at rest | verified | expanded browser audit and screenshots | physical-device confirmation |
| Drawer focus and keyboard tabs | verified | expanded browser audit | screen-reader/physical-device confirmation |
| Desktop/mobile containment and overflow | verified | expanded browser audit | additional real-device sizes |
| Export footer does not cover annotation content | verified | zero-overlap geometry and final screenshot | cross-browser human check |
| Mobile Tools controls do not clip | verified | internal overflow checks and final screenshot | physical-device touch check |
| Reduced-motion fallback | verified | media emulation and computed styles | physical-device confirmation |
| Reduced-transparency/contrast/forced-colors fallbacks | implemented, unverified manually | source inspection | native preference review |
| All 59 records mount and expose four layers | verified by completed shard loops | run `30875253098` logs/artifacts | human interaction review |
| All 59 models are artistically final | unverified | not established | full human review |
| Performance readiness | at risk / unverified | bundle warning | target-device profile |

## 10. Revision Log

- **Revisions 1–16:** Bootstrap and dedicated-model source expansion across the closed 59-record inventory.
- **Revision 17:** Exhaustive repository bug sweep and automated source/build verification.
- **Revision 18:** Bug-sweep merge into `build-skymourn`.
- **Revision 19:** Brighter chamber and model-first viewport attempt; user rejected remaining persistent UI and model quality.
- **Revision 20 — 2026-08-03:** Implemented deliberate hidden-at-rest drawers, bounds framing, subdued chamber presentation, two explicit canon-backed additions for all 59 records, a precise durable ledger, regression tests, and 59-record browser mount/layer evidence.
- **Revision 21 — 2026-08-04:** Implemented 40 product-polish improvements, conducted a hostile release-candidate critique, implemented 11 resulting repairs, added durable polish contracts and a targeted desktop/mobile browser audit, corrected mobile containment and nested stacking-context blur, and passed source/build/browser validation.
- **Revision 22 — 2026-08-04:** Implemented 39 additional polish improvements, conducted source, accessibility-preference, and screenshot adversarial review, implemented 11 resulting repairs, activated the orphaned legibility layer, eliminated export-content overlap and mobile tool clipping, expanded the permanent browser audit, and passed source/build/browser validation. Human art direction, native preference modes, physical-device behavior, and performance approval remain pending.
