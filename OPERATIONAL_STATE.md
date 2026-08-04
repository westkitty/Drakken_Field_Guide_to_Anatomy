# Operational State — Drakken Field Anatomy Archive

<!-- operational-state:metadata
{
  "schema_version": 1,
  "project_id": "drakken-field-anatomy-archive",
  "project_name": "Drakken Field Anatomy Archive",
  "project_root": ".",
  "artifact_path": "dist-interactive-html/Drakken_Field_Guide_Interactive.html",
  "state_revision": 29,
  "last_updated": "2026-08-04T12:30:00-04:00",
  "current_baseline": {
    "identity": "repair/immersive-ui-model-quality-20260803, PR #4; runtime repair product head 9561e9a7ec33ccde4aa4a5686f30f04a85854994; delivery correction through 387d31611f92f2538b7e5450f0628d19061a315d; plus this state revision",
    "state": "technically-verified-user-acceptance-pending",
    "last_verified": "GitHub Actions run 30928483024 passed source/build/static HTML validation, physical local-file pointer interaction, direct-file feature state, and wave-four browser validation. The remaining failure in that run was an obsolete legacy assertion requiring all edge handles to remain under 34 pixels; that contradictory path has been retired."
  },
  "scope_boundaries": [
    "Single browser archive at repository root",
    "Exactly 59 canonical Drakken records",
    "Canon governed by docs/drakken_compendium_full_blood_eclipse_visual_integrated.md and src/data/specimens.json",
    "No fabricated, duplicate, or wrapped records",
    "No backend, authentication, database, deployment, framework migration, or remote runtime asset work",
    "The interactive HTML must preserve physical pointer interaction and the complete protected product path",
    "Andrew's direct Brave retest is required before user-facing completion"
  ],
  "linked_parent_state": null
}
-->

## 1. Purpose

The Drakken Field Anatomy Archive is a React Three Fiber forensic compendium containing exactly 59 canonical Drakken records. The model is the primary surface. Users must be able to select records, physically orbit/pan/zoom the live reconstruction, control cameras and rendering, toggle four anatomy layers, section and animate the model, measure points, inspect annotations and evidence, review diagnostics, and export the dossier.

## 2. Authoritative Runtime Rejection

The first delivered single-file HTML was rejected by Andrew during direct Brave testing. His screenshot and report are controlling runtime evidence.

Observed failures:

- physical drag, wheel, and adjustment controls did not function as expected;
- the interface appeared absent even though React state and DOM nodes existed;
- Skymourn rendered as an overexposed, poorly framed loop rather than a readable specimen;
- the earlier audit incorrectly promoted DOM state and programmatic control activation to feature parity.

All Revision 28 claims that the first HTML was feature-complete are superseded.

## 3. Current Runtime Repair

### 3.1 Canvas input ownership

`src/components/ExaminationChamber.tsx` now:

- explicitly enables orbit, zoom, and pan;
- maps left mouse to rotate, middle mouse to dolly, and right mouse to pan;
- maps touch gestures to rotate and dolly/pan;
- enables screen-space panning and zoom-to-cursor;
- uses a full-size canvas with `touch-action: none`;
- publishes actual camera position, target, zoom, mode, interaction count, and fitted-record state for verification;
- fits record bounds after two animation frames rather than relying on a perpetually observing bounds wrapper.

`src/runtime-interaction-repair.css` now:

- gives the WebGL canvas the full viewport;
- makes decorative chamber overlays noninteractive;
- makes the React Three Fiber wrapper transparent to pointer input;
- leaves the canvas as the sole examination hit target.

### 3.2 Drawer visibility and control discovery

The actual defect was reproduced in the packaged HTML: React added `is-open`, while the final CSS cascade still computed `opacity: 0` and translated the drawer off-screen.

`src/runtime-drawer-fix.css` now:

- removes the broken drawer transition path;
- forces ID-specific open drawers to be visible, opaque, interactive, and on-screen;
- restores the HUD and all reveal controls after drawer closure.

`src/runtime-interaction-repair.css` now presents five visible controls:

- Registry on the left;
- Tools at the bottom;
- Record on the right;
- Diagnostics at the upper right;
- Briefing at the upper left.

The retired legacy 34 × 34-pixel maximum is prohibited because it made the controls too difficult to discover.

### 3.3 Skymourn reconstruction

`src/scene/models/SkymournRepairModel.tsx` replaces the rejected initial Skymourn presentation with a dedicated stable reconstruction containing:

- a controlled closed frost-body curve;
- darker material separation and reduced transmission;
- an enlarged readable mask face;
- a cold seam and distributed frost crystals;
- structural circulation ribs;
- an internal thermal conduit and paired thermal sacs;
- restrained functional field rings;
- layer, clipping, wireframe, silhouette, measurement, annotation, and animation support.

`src/scene/SpecimenRouter.tsx` routes `skymourn` explicitly through this model while preserving the other dedicated routes and enhancement layer.

## 4. Physical Runtime Evidence

GitHub Actions run `30928483024` opened the generated HTML directly through `file://` without `?audit=1` and passed the focused physical runtime gate.

Verified:

- Skymourn mounted and completed bounds fitting;
- the canvas measured exactly 1440 × 900 inside a 1440 × 900 viewport;
- all five controls were visible, targetable, and unobstructed;
- Registry opened at `[0, 0, 380, 900]`;
- Tools opened at `[-40, 198, 720, 900]`;
- Record opened at `[1010, 0, 1440, 900]`;
- Diagnostics opened at `[1090, 462.875, 1440, 900]`;
- each drawer was closed through its actual visible close control;
- the viewport center hit target was `CANVAS`;
- physical left-drag changed camera position and target;
- physical right-drag changed camera position and target;
- physical wheel input changed camera state;
- remote runtime requests were zero;
- actionable page and console errors were zero.

The direct-file feature-state gate in the same run independently passed all 59 records, record switching, tools, layers, sectioning, animation, measurement, dossier tabs, exports, Diagnostics, briefing, shortcuts, and isolated mobile containment.

## 5. Protected Invariants

### INV-001 — Closed registry

Exactly 59 unique canonical records. Do not invent, duplicate, wrap, or silently replace records.

### INV-002 — Dedicated model routes

Every canonical record keeps its dedicated route. Shared enhancement layers may supplement but not replace record-specific models.

### INV-003 — Physical model interaction

A mounted canvas or programmatic state change is insufficient. The downloadable artifact must pass real pointer orbit, pan, wheel zoom, physical edge-control clicks, and physical drawer closure.

### INV-004 — Model-first presentation

No persistent dashboard bars. The canvas owns the useful viewport. Controls remain deliberately discoverable without covering substantial model space.

### INV-005 — Open drawers must actually appear

An `is-open` class is not proof. Open drawers must compute as visible, opaque, interactive, and inside the viewport.

### INV-006 — Examination capabilities

Preserve camera modes and presets, reset, four anatomy layers, clipping, animation, measurement, annotations, diagnostics, evidence filters, and exports.

### INV-007 — Self-contained delivery

The HTML may not depend on a server, `node_modules`, remote scripts, remote styles, remote assets, or runtime network access.

### INV-008 — Evidence honesty

Automated evidence does not equal Andrew's Brave acceptance, human art-direction approval, physical-device accessibility approval, or target-MacBook performance approval.

## 6. Existing Project Work Preserved

The repair branch still contains:

- hidden-at-rest shell and responsive drawers;
- two explicit canon-backed additions for every record;
- precise model improvement ledger;
- four product-polish waves totaling 171 improvements;
- 40 prior adversarial and screenshot-driven repairs;
- regression tests for the 59-record boundary and polish contracts;
- source/build/static HTML validation and browser audit tooling.

Durable ledgers:

- `MODEL_IMPROVEMENTS_LEDGER.md`
- `POLISH_PASS.md`
- `POLISH_WAVE_2.md`
- `POLISH_WAVE_3.md`
- `POLISH_WAVE_4.md`
- `INTERACTIVE_HTML_DELIVERY.md`

## 7. Remaining Risks

### RISK-001 — User acceptance

Andrew has not yet tested the repaired artifact in his Brave installation. This is the immediate completion gate.

### RISK-002 — Artistic quality

The new Skymourn model is technically readable and fitted, but Andrew must judge whether it is artistically acceptable. The same remains true for the complete 59-record set.

### RISK-003 — Physical-device accessibility

Native touch, screen-reader, forced-colors, reduced-transparency, increased-contrast, and notched safe-area behavior remain unapproved on physical devices.

### RISK-004 — Performance

The single-file artifact is roughly 1.78 MB and the standard JavaScript bundle remains above Vite's warning threshold. Performance must be measured on Andrew's MacBook; functionality may not be removed merely to silence a warning.

### RISK-005 — Layered CSS history

Several additive repair stylesheets remain. Consolidation is forbidden until Andrew approves the repaired runtime and visual regression evidence is preserved.

## 8. Immediate Next Step

Build, validate, and download the latest `drakken-interactive-html` artifact from the exact final branch head. Andrew must open the newly named repaired HTML rather than the superseded file and test, in this order:

1. click Registry, Tools, Record, and Diagnostics;
2. left-drag the model;
3. right-drag to pan;
4. scroll to zoom;
5. switch away from Skymourn and back;
6. inspect Skymourn's framing and readability.

Do not claim user-facing completion until that retest succeeds.

## 9. Revision Log

- **Revisions 1–18:** Bootstrap, dedicated-model expansion, exhaustive source/build audit, and merge preparation.
- **Revision 19:** Brighter chamber/model-first attempt rejected for persistent UI and model quality.
- **Revision 20:** Hidden-at-rest drawers, framing, and two explicit additions for all 59 records.
- **Revisions 21–27:** Four polish waves, adversarial repairs, browser gates, and exact-head reconciliation.
- **Revision 28:** First self-contained HTML delivery; later invalidated by Andrew's direct Brave test.
- **Revision 29 — 2026-08-04:** Recorded the authoritative runtime rejection, repaired physical canvas input, drawer visibility/restoration, control discoverability, and Skymourn, added a genuine physical local-file gate, and set state to technically verified with user acceptance pending.
