# Operational State — Drakken Field Anatomy Archive

<!-- operational-state:metadata
{
  "schema_version": 1,
  "project_id": "drakken-field-anatomy-archive",
  "project_name": "Drakken Field Anatomy Archive",
  "project_root": ".",
  "artifact_path": "",
  "state_revision": 16,
  "last_updated": "2026-08-03T09:59:00-04:00",
  "current_baseline": {
    "identity": "build-skymourn source commit 8a0919c697ec740042589295212eb536f31de19f",
    "state": "implemented-unverified",
    "last_verified": "No retrievable current-branch build or browser evidence"
  },
  "scope_boundaries": [
    "Single browser archive at repository root",
    "All 59 canonical Drakken records remain present",
    "Canon governed by docs/drakken_compendium_full_blood_eclipse_visual_integrated.md",
    "Record-level procedural model improvements use bounded explicit-count batches",
    "The 59-record inventory is closed; do not fabricate records to fill a requested batch count",
    "No deployment, backend, authentication, database, external asset sourcing, dependency migration, or unrelated feature work"
  ],
  "linked_parent_state": null
}
-->

## 1. Project Identity and Scope

The Drakken Field Anatomy Archive is a responsive React Three Fiber forensic compendium containing 59 Drakken records. The central examination chamber remains the primary product surface. The active milestone is record-level model improvement without reducing the archive, inventing canon, or counting shared configuration as finished modeling.

## 2. Current Baseline

The active model-source baseline is `build-skymourn` commit `8a0919c697ec740042589295212eb536f31de19f`.

Current source includes:

- all 59 records and the legacy fallback router;
- original dedicated models for Skymourn, Gorevault, and Blood Ring;
- Batches 1–7 recorded below;
- a final Batch 8 closure containing the only two records remaining after Batch 7;
- dedicated source constructions for Mother and The Egg;
- branch-scoped GitHub Actions validation configuration.

The connector reports no status checks or workflow runs for the current source commit. Browser execution is unavailable. The final two models are implemented but unverified.

## 3. Artifact Contract

Maintain one usable forensic archive containing the full 59-record collection. Every record remains discoverable and inspectable. Model work must preserve surface, structure, internal, and functional layers; clipping; animation; measurement; annotations; scale context; record switching; and fallback routing.

A record is not complete merely because it has unique configuration values. It requires meaningful record-specific construction grounded in the governing dossier and appropriate runtime validation before promotion to verified.

The record inventory is closed at 59. A requested batch larger than the remaining inventory must stop at the final canonical record rather than fabricate, duplicate, or wrap records.

## 4. Active Invariants

### INV-001 — Preserve the full archive

- **State:** `requested`
- **Rule:** Keep all 59 records present, selectable, and routed.
- **Validation:** Record-count tests and rendered navigation inspection.
- **Status:** active

### INV-002 — Canon governs model anatomy

- **State:** `requested`
- **Rule:** Significant anatomy, function, terminology, dimensions, and behavior must derive from the dossier or be clearly restrained reconstruction.
- **Authority:** `docs/drakken_compendium_full_blood_eclipse_visual_integrated.md`
- **Validation:** Record-by-record dossier comparison.
- **Status:** active

### INV-003 — Protect the examination workflow

- **State:** `requested`
- **Rule:** Preserve orbit, pan, zoom, reset, layers, clipping, animations, measurement, comparison, annotations, evidence, diagnostics, and export behavior.
- **Validation:** Browser smoke and repeated-switch lifecycle path.
- **Status:** active

### INV-004 — Configuration is not completion

- **State:** `requested`
- **Rule:** Colors, scales, primitive counts, configuration entries, and archetype routing alone do not count as individual model completion.
- **Validation:** Dedicated construction inspection and sibling comparison.
- **Status:** active

### INV-005 — Batch 5 exact boundary

- **State:** `requested`
- **Rule:** Batch 5 begins at `nebular-stream-herder` and ends at `data-core-unbinder`.
- **Status:** active

### INV-006 — Batch 6 exact boundary

- **State:** `requested`
- **Rule:** Batch 6 begins at `foundry-cantor` and ends at `sovereignty-eater`.
- **Status:** active

### INV-007 — Batch 7 exact boundary

- **State:** `requested`
- **Rule:** Batch 7 begins at `hymnlock` and ends at `viral-bastion`.
- **Status:** active

### INV-008 — Batch 8 is the final two-record closure batch

- **State:** `requested`
- **Rule:** The only records after `viral-bastion` are `mother` and `the-egg`. Batch 8 must contain exactly those two records, end the 59-record inventory, and must not fabricate or wrap eight additional records to satisfy a nominal ten-record request.
- **Evidence:** `src/data/specimens.json` and `src/scene/SpecimenRouter.tsx`
- **Validation:** Tail-of-registry and exact route-case inspection.
- **Status:** active

## 5. Verified Working Behavior

No current-commit runtime behavior is promoted to verified. Historical bootstrap validation predates the current model batches and is stale for the present baseline.

## 6. Known Not Working

No current runtime failure has been observed because the current branch has not been executed in an accessible browser runtime.

## 7. Implemented but Unverified

### UNV-001 — Full archive application source

The source contains the 59-record archive, examination chamber, controls, four anatomy layers, clipping, animations, measurement, scale references, annotations, evidence panels, diagnostics, responsive drawers, keyboard controls, and exports.

### UNV-002 — Batch 1 Crust-Binders

Dedicated source models exist for Fault-Tongue, Obsidian Gul, Tremorhound, Magma Pleuron, and Granithelion.

### UNV-003 — Batch 2 Atmos-Engines

Dedicated source models and routes exist for Aerokarst, Hydrostatic Renderer, Stratos Chorister, Balance Engine, and Stormmind Tactician.

### UNV-004 — Batch 3 Seedcarriers

Canon-correct routes exist for Macroflora Colossus, Sporesphere Archivist, Neural Fungibinder, Precipitation Synth, and Soil Rewriter.

### UNV-005 — Batch 4 Fluxborne models

Dedicated routes exist for Trench-Sovereign, Salinity Conductor, Gyre Tactician, Littoral Reformer, and Cryofluid Engine. Currenthalo uses a corrected loop assembly so its fin-ribs remain attached to the animated loops.

### UNV-006 — Batch 5 exact ten-model implementation

Dedicated routes exist for Veilcurrent, Coronaxis, Ringthroat, Solnexus, Nullthorn, Lyriboris, Helionth, Umbrakrael, Cinderverge, and Singulararch.

### UNV-007 — Batch 6 exact ten-model implementation

Dedicated routes exist for Ironcant, Gridsaint, Spiremolt, Roadthorn, Habitarch, Archivore, Lexiclast, Calendarion, Dreamtaxon, and Crownmute.

### UNV-008 — Batch 7 exact ten-model implementation

Dedicated routes exist for Hymnlock, Memorialvein, Shrinehunger, Redacted Grin, Spinal Loop, Cradle.exe, Foldhowl, Manifest.Discord, Gloryfail, and Viral Bastion.

### UNV-009 — Batch 8 final two-model implementation

Source commit `8a0919c697ec740042589295212eb536f31de19f` routes the only two records remaining after Batch 7 to dedicated models:

1. `mother` — Mother
2. `the-egg` — The Egg

Implementation files:

- `src/scene/models/OriginModels.tsx`
- `src/scene/SpecimenRouter.tsx`

Mother is represented as the living planetary codematriarch rather than a humanoid individual: bioluminescent data-veins, code-tree forests, macro-rune storm systems, concentric planetary structure, a genesis nursery core, and a trans-temporal egg corona.

The Egg is a separate fixed Origin Node: translucent breathing geode glass, barcode-light spirals, encoded self-shielding, an undifferentiated embryonic data core, and terra-emergence field roots.

Missing evidence: TypeScript, lint, tests, production build, browser rendering, layer and clipping behavior, measurement, animations, camera framing, scale presentation, lifecycle disposal, and repeated switching.

## 8. Unknown or Evidence-Stale State

### UNK-001 — Browser and device behavior

Pointer, touch, keyboard, narrow viewport, reduced motion, WebGL clipping, measurement picking, context recovery, and repeated switching have not been exercised against the current source baseline.

### UNK-002 — Current dependency-backed build state

A validation workflow exists, but no status or workflow run is attached or retrievable for source commit `8a0919c697ec740042589295212eb536f31de19f`.

## 9. Pending Work

### PND-001 — Validate the current branch

- **Priority:** critical
- **Required:** `npm run typecheck && npm run lint && npm test && npm run build`
- **Blocks verified completion:** yes

### PND-002 — Perform browser model and lifecycle checks

Exercise all record families, including Mother and The Egg, through camera controls, layers, clipping, animations, measurement, annotations, scale context, and repeated switching.

- **Priority:** critical
- **Blocks verified completion:** yes

### PND-003 — Do not begin another model batch without new canon records

The registry ends at `the-egg`. Further work on the current 59-record collection should be validation, repair, optimization, or approved asset replacement rather than inventing a Batch 9.

- **Priority:** high
- **Blocks source implementation closure:** no

## 10. Active Decisions and Prohibitions

- Use npm, Vite, React, TypeScript, Three.js, React Three Fiber, Drei, Vitest, ESLint, and plain CSS with one WebGL canvas.
- Use deterministic local procedural geometry while approved GLBs are absent.
- Preserve dossier body plans even when older `specimens.json` summaries are generic or contradictory.
- Keep Mother planetary and fixed to her stellar nursery context; do not anthropomorphize her into an ordinary creature model.
- Keep The Egg an inert fixed Origin Node rather than a combat organism.
- Do not fabricate, duplicate, or wrap records to fill an exhausted batch count.
- Do not claim rendering, visual comparison, typechecking, linting, testing, or building without direct current-revision evidence.
- Do not deploy, install speculative dependencies, replace frameworks, source external assets, or perform destructive Git operations.

## 11. Validation and Evidence Matrix

| Claim | State | Evidence | Required proof |
|---|---|---|---|
| Full 59-record archive remains intact | requested | Registry unchanged and existing routing preserved | Record-count test and browser navigation |
| Final inventory contains only Mother and The Egg after Viral Bastion | implemented-unverified | Registry tail inspection | Record-count test |
| Batch 8 routes exactly the final two records | implemented-unverified | Router and compare inspection | Build plus direct route exercise |
| Mother and The Egg are dossier-grounded | implemented-unverified | Dossier comparison and dedicated source | Visual canon audit |
| No fabricated records were added | implemented-unverified | Registry file unchanged | Record-count test and diff inspection |
| Examination workflow remains functional | unknown | Source compatibility retained | Browser smoke path |
| Current branch compiles and builds | evidence-stale | No retrievable current status or workflow run | Full npm suite |

## 12. Current Change Scope and Impact Radius

Batch 8 adds one final origin-model module and two model-router cases. The impact radius includes Three.js geometry ownership, transparent and emissive materials, planetary and geode camera framing, frame animation transforms, clipping, layer visibility, measurement events, annotations, performance, and record switching. No dependencies, application UI, archive records, or previously completed model routes changed.

## 13. Compact Revision Log

- **Revision 1–8:** Bootstrap, prototype, archive expansion, and rejected shared-archetype completion claims.
- **Revision 9:** Added Batch 1 Crust-Binder dedicated models.
- **Revision 10:** Added Batch 2 Atmos-Engine dedicated models.
- **Revision 11:** Reconciled the 59-record contract and corrected Batch 3 Seedcarriers.
- **Revision 12:** Added Batch 4 Fluxborne models and branch validation workflow.
- **Revision 13:** Added Batch 5: exactly ten sequential Fluxborne and Orbital-Wyrm models ending at Singulararch.
- **Revision 14:** Added Batch 6: exactly ten sequential Civiformer and Noosphere-Cantor models ending at Crownmute.
- **Revision 15:** Added Batch 7: exactly ten sequential Noosphere-Cantor and Glitch-Touched models ending at Viral Bastion.
- **Revision 16:** Added the final two-record Batch 8 containing Mother and The Egg. The 59-record source inventory is now exhausted. No runtime verification was promoted.
