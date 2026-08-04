# Operational State — Drakken Field Anatomy Archive

<!-- operational-state:metadata
{
  "schema_version": 1,
  "project_id": "drakken-field-anatomy-archive",
  "project_name": "Drakken Field Anatomy Archive",
  "project_root": ".",
  "artifact_path": "",
  "state_revision": 26,
  "last_updated": "2026-08-04T02:32:00-04:00",
  "current_baseline": {
    "identity": "repair/immersive-ui-model-quality-20260803, PR #4; exact application, repair, tests, audits, ledgers, and state through f98dc2b58eeb346e06fa26dcbc0c3f66fd957d6b; plus this final validation reconciliation",
    "state": "technically-verified-human-review-pending",
    "last_verified": "GitHub Actions run 30884135982 passed strict static audit, typecheck, zero-warning lint, tests, production build, the established desktop/mobile audit, the dedicated wave-three audit, and the dedicated wave-four audit on exact documentation head f98dc2b58eeb346e06fa26dcbc0c3f66fd957d6b"
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

PR #4 now contains six bounded bodies of work:

1. a hidden-at-rest model-first interface;
2. two explicit canon-backed additions for every one of the 59 records;
3. the first verified product-polish pass: 40 improvements plus 11 adversarial repairs;
4. the second verified product-polish pass: 39 new improvements plus 11 adversarial and screenshot-driven repairs;
5. the third verified product-polish pass: 32 new improvements plus 8 adversarial and screenshot-driven repairs;
6. the fourth verified product-polish pass: 60 new improvements plus 10 adversarial, measured, and screenshot-driven repairs.

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

### Product polish wave 3

The third durable ledger is `POLISH_WAVE_3.md`; its machine-readable contract is `src/polishWave3Manifest.ts`.

Wave 3 implemented 32 additional improvements across:

- native dark controls, accent/caret treatment, tap behavior, content selection, focus, and shortcut keycaps;
- tabular metrics, archive identifiers, non-color evidence markers, copy wrapping, reading width, source references, and record-grid scanning;
- annotation hierarchy, focus parity, scroll margins, scroll padding, heading separation, card focus elevation, mode chips, and status feedback;
- loading and error hierarchy, numbered briefing topics, tab overflow treatment, technical output readouts, select truncation, short-height adaptation, landscape-mobile behavior, ultra-narrow containment, and reduced-data simplification.

Wave 3 adversarial and screenshot review produced 8 repairs:

- hide all edge handles while any modal drawer or briefing is open;
- remove the generic active-state dot from Record tabs;
- disable automatic hyphenation in dossier copy;
- prevent doubled focus rings on Registry search;
- remove permanent tab masking when labels fit;
- stack mobile record terms and values;
- remove briefing numbering below 360 pixels;
- preserve explicit focus outlines in increased-contrast and forced-colors modes.

### Product polish wave 4

The fourth durable ledger is `POLISH_WAVE_4.md`; its machine-readable contract is `src/polishWave4Manifest.ts`.

Wave 4 implemented 60 additional improvements across:

- transition and pressed-state rhythm, disabled/enabled affordances, focus halos, skip-link behavior, scrim dismissal, close controls, and heading actions;
- Registry labels, search, filters, result summary, specimen-card hierarchy, technical identifiers, metadata, evidence, source status, and empty-state recovery;
- Tools reset, tool-cluster layout, technical heading rails, stable controls, pressed toggles, axis segmentation, anatomy cards, range/select treatment, measurement guidance, and active-mode containment;
- dossier summary, Record tabs, term/value cards, article rhythm, civic accents, numbered sources, annotation controls and metadata, exports, Diagnostics, briefing, loading/error surfaces, toast safe areas, constrained devices, and accessibility preferences.

Wave 4 adversarial and screenshot review produced 10 repairs:

- keep the skip link off-screen at rest and reveal it immediately on keyboard focus;
- prevent desktop Camera and Render tool clusters from colliding;
- remove measured five-pixel narrow Record overflow from headings and export actions;
- restore 44-pixel coarse-pointer close targets after the complete cascade;
- remove the redundant generic active specimen-card marker;
- constrain long paired specimen metadata values;
- use one toast anchor system and preserve safe-area clearance through entrance motion;
- apply mobile safe-area padding directionally;
- activate the intended ultra-narrow annotation action grid;
- permit export actions to shrink without widening the drawer.

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

### INV-011 — Modal chrome exclusivity

- Global edge handles may appear only when no modal drawer or briefing is open.
- Selected Record tabs must use their dedicated selected treatment without generic active dots.
- Dossier prose must not use automatic hyphenation in narrow drawers.
- Component-owned focus states may not be doubled by global focus decoration.

### INV-012 — Precision controls and constrained-layout containment

- The skip link must remain off-screen until keyboard focus and appear immediately when focused.
- Primary tool clusters may wrap but may not collide or create horizontal overflow.
- Narrow Record headings, tabs, metadata, annotation actions, and exports must remain inside the drawer.
- Coarse-pointer close controls must remain at least 44 × 44 pixels after the complete cascade.
- Status feedback must retain lower-right safe-area clearance in hidden and visible states.

## 4. Verified Evidence

### Source and build

GitHub Actions run `30884135982` passed on exact documentation head `f98dc2b58eeb346e06fa26dcbc0c3f66fd957d6b`:

- locked dependency installation;
- strict static audit;
- TypeScript;
- ESLint with zero warnings;
- Vitest, including exact 59-record enhancement coverage and all four polish contracts: 40/11, 39/11, 32/8, and 60/10;
- production build.

Previously verified source contracts remain intact:

- 59 registry entries;
- 59 dedicated routes;
- zero fallback record IDs;
- complete clipping assignments;
- no remote application runtime references;
- complete asset, provenance, and license ledgers.

### Established product-polish browser audit

Run `30884135982` passed the permanent established browser audit at desktop and mobile sizes. It reverified:

- closed-at-rest presentation and five compact reveal handles;
- active loading of the governing polish layers;
- sharp, opaque drawer surfaces with no content-level backdrop blur;
- Registry count, labelled search, visible search focus, card depth, focus trapping, and focus restoration;
- Tools reset, anatomy presets, custom range treatment, custom select treatment, and panel depth;
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

### Dedicated wave-three browser audit

Run `30884135982` passed `scripts/polish-wave3-browser-audit.mjs`, re-verifying:

- `polish-wave3.css` and `polish-wave3-repairs.css` active in the live cascade;
- dark native-control color scheme and refined keycap treatment;
- edge handles hidden over Registry, Record, Tools, Diagnostics, and briefing modal states;
- Registry search focus without a doubled outline;
- evidence badges with non-color markers;
- selected Record tabs without generic active dots;
- dossier copy without automatic hyphenation;
- mobile Record term/value pairs stacked into one column;
- mobile Record content without horizontal overflow;
- zero actionable page or console errors.

### Dedicated wave-four browser audit

Run `30884135982` passed `scripts/polish-wave4-browser-audit.mjs`. It verified:

- `polish-wave4.css` and `polish-wave4-repairs.css` active in the live cascade;
- skip link off-screen at rest and immediately visible on keyboard focus;
- status toast inside the lower-right viewport safe area;
- active Registry card and paired metadata containment;
- redundant active-card marker absent;
- desktop primary tool clusters free of collision and overflow;
- narrow Record drawer and five-tab strip free of horizontal overflow;
- coarse-pointer close target at least 44 × 44 pixels when emulated;
- ultra-narrow annotation action grid active;
- zero actionable page or console errors.

The browser jobs record only their exact known SwiftShader `THREE.WebGLRenderer: Error creating WebGL context.` environment warning. That warning is excluded only from the DOM/CSS gates and does not replace separate renderer/model evidence.

### Visual screenshot review

The wave-four screenshots were inspected after automated validation. They show:

- a contained Registry with stronger labels, filter hierarchy, technical ID capsules, and no active-card marker noise;
- a desktop Tools sheet with non-colliding Camera and Render groups, stable control geometry, anatomy cards, and clearer readouts;
- a 390-pixel Record drawer with contained tabs, full-width term/value cards, readable long values, and no horizontal leak;
- no visible skip link at rest and no controls or feedback surfaces touching viewport edges.

No additional screenshot-discovered defect remained within the bounded fourth-wave scope.

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
- manual reduced-data, reduced-transparency, increased-contrast, forced-colors, and safe-area review;
- sub-360-pixel physical-device review;
- long-session thermal and GPU behavior.

## 6. Known Risks

### RISK-001 — Bundle size

The main production JavaScript chunk remains above Vite's 500 kB warning threshold. Meaningful repair requires measured dynamic loading; warning suppression is prohibited.

### RISK-002 — Procedural enhancement ceiling

Two explicit canon-backed additions per record do not automatically equal bespoke artist-authored reconstructions. Human review may still classify records for moderate or replacement-level remodeling.

### RISK-003 — Software-rendered browser limits

Continuous animation, physical materials, and shadows make exhaustive headless WebGL sweeps expensive. The query-gated `?audit=1` mode renders on demand with reduced test-only effects; normal runtime behavior is unchanged. SwiftShader context availability is not treated as proof of real-device renderer failure.

### RISK-004 — Preference emulation coverage

Reduced motion is automated. Reduced data, reduced transparency, increased contrast, forced colors, and physical safe areas are implemented at source level but still require physical or native-browser manual review because Chromium automation support is incomplete for those modes.

### RISK-005 — Layered polish cascade

The application intentionally loads several additive polish stylesheets. Their order is covered by browser assertions, but future consolidation must preserve visual behavior and may not occur as an unaudited cleanup.

## 7. Pending Work

### PND-001 — Human 59-record art-direction review

Review every record in the running application and mark it accepted, moderate-repair, or replacement-level. This blocks any claim that all models are artistically final.

### PND-002 — Physical-device interaction review

Verify pointer, keyboard, touch, screen-reader output, drawer focus, clipping, measurement, exports, responsive behavior, and accessibility preference modes on target devices.

### PND-003 — Performance profile

Measure first load, record switching, memory stabilization, GPU load, and thermals on the MacBook. Compare any code-splitting candidate against the measured baseline.

### PND-004 — Conditional stylesheet consolidation

After human visual approval, evaluate whether the additive polish cascade should be consolidated. Do not perform consolidation without visual regression screenshots and the full browser audit.

## 8. Prohibitions

- Do not restore persistent dashboard chrome.
- Do not reveal controls on ordinary pointer movement.
- Do not show global edge handles above an open modal drawer or briefing.
- Do not show the skip link without keyboard focus.
- Do not permit primary tool clusters to overlap or depend on clipped horizontal scrolling.
- Do not restore narrow Record negative-edge overflow.
- Do not reduce coarse-pointer close targets below 44 × 44 pixels.
- Do not replace precise ledger entries with generic PASS wording.
- Do not describe automated mounting as human canon or art approval.
- Do not suppress the bundle warning instead of measuring performance.
- Do not add dependencies or remote runtime assets without a demonstrated requirement.
- Do not expand the closed registry without an explicit canon decision.
- Do not place visual effects above drawer content.
- Do not allow mobile sheets or internal tool groups to exceed viewport bounds.
- Do not pin action surfaces over dossier or annotation content.
- Do not restore automatic dossier hyphenation or generic active dots on Record tabs or specimen cards.
- Do not consolidate polish stylesheets without screenshot and browser regression evidence.

## 9. Validation Matrix

| Claim | State | Evidence | Remaining proof |
|---|---|---|---|
| 59 unique records | verified | static audit and tests | none |
| 59 dedicated routes | verified | static audit | rendered human spot review |
| Two explicit additions per record | verified at source level | enhancement data, ledger, tests | human visual approval |
| First 40 polish improvements | verified | wave-1 manifest, tests, source, browser audit | physical-device review |
| First 11 adversarial repairs | verified | wave-1 critique, source, tests, browser audit | physical-device review |
| Second 39 polish improvements | verified | wave-2 manifest, source, tests, expanded browser audit | physical-device review |
| Second 11 adversarial repairs | verified | wave-2 critique, source, tests, browser audit, screenshots | preference/device review |
| Third 32 polish improvements | verified | wave-3 manifest, source, tests, established and dedicated browser audits | physical-device review |
| Third 8 adversarial repairs | verified | wave-3 critique, source, tests, dedicated browser audit, screenshots | preference/device review |
| Fourth 60 polish improvements | verified | wave-4 manifest, source, tests, established and dedicated browser audits | physical-device review |
| Fourth 10 adversarial repairs | verified | wave-4 critique, source, tests, measurement, dedicated browser audit, screenshots | preference/device review |
| Source compiles | verified | run `30884135982` | none |
| Lint is clean | verified | run `30884135982` | none |
| Tests pass | verified | run `30884135982` | none |
| Production build succeeds | verified | run `30884135982` | deployment/browser load |
| UI is hidden at rest | verified | browser audits and screenshots | physical-device confirmation |
| Global handles hide above modal surfaces | verified | wave-three browser audit and screenshots | cross-browser physical-device confirmation |
| Skip link hidden at rest and immediate on focus | verified | wave-four browser geometry and focus assertion | screen-reader/physical-device confirmation |
| Drawer focus and keyboard tabs | verified | established browser audit | screen-reader/physical-device confirmation |
| Desktop/mobile containment and overflow | verified | all three browser audits | additional real-device sizes |
| Primary Tools clusters do not collide | verified | wave-four rectangle intersection and overflow assertions | physical-device confirmation |
| Narrow Record chrome does not overflow | verified | established and wave-four geometry assertions | additional real-device widths |
| Coarse-pointer close target is 44 × 44 pixels | verified under emulation | wave-four browser audit | physical touch-device confirmation |
| Status toast retains safe-area clearance | verified at browser geometry level | wave-four browser audit | notched-device confirmation |
| Dossier prose avoids automatic hyphenation | verified | computed style and screenshot review | cross-browser typography review |
| Mobile record fields stack cleanly | verified | computed grid style, overflow check, screenshot | physical-device touch check |
| Export footer does not cover annotation content | verified | zero-overlap geometry and screenshot | cross-browser human check |
| Mobile Tools controls do not clip | verified | internal overflow checks and screenshot | physical-device touch check |
| Reduced-motion fallback | verified | media emulation and computed styles | physical-device confirmation |
| Reduced-data/transparency/contrast/forced-colors fallbacks | implemented, partially verified | source inspection and focused assertions | native preference review |
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
- **Revision 23 — 2026-08-04:** Implemented 32 additional polish improvements, conducted source and screenshot adversarial review, implemented 8 resulting repairs, hid global handles over modal surfaces, removed tab-marker and hyphenation noise, added a dedicated wave-three browser gate, and passed source/build/browser validation. Human art direction, native preference modes, physical-device behavior, and performance approval remain pending.
- **Revision 24 — 2026-08-04:** Revalidated the exact final documentation head `d763c1bfbc8efd47d0a4bc7b8524173e21013379` through the complete source/build and dual-browser gate in run `30882103387`; no new implementation or visual defect was introduced.
- **Revision 25 — 2026-08-04:** Implemented 60 additional polish improvements, conducted source, measured layout, browser, and screenshot adversarial review, implemented 10 resulting repairs, corrected skip-link visibility, tool-cluster collision, narrow Record overflow, coarse-pointer target regression, specimen metadata pressure, toast safe-area clearance, and mobile action layout, added a dedicated wave-four browser gate, and passed source/build plus all three browser audits in run `30883838602`. Human art direction, native preference modes, physical-device behavior, and performance approval remain pending.
- **Revision 26 — 2026-08-04:** Revalidated the exact fourth-wave documentation head `f98dc2b58eeb346e06fa26dcbc0c3f66fd957d6b` through the complete source/build and three-browser gate in run `30884135982`; no new implementation or documentation defect was introduced.
