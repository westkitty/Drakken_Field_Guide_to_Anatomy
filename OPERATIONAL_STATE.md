# Operational State — Drakken Field Anatomy Archive

<!-- operational-state:metadata
{
  "schema_version": 1,
  "project_id": "drakken-field-anatomy-archive",
  "project_name": "Drakken Field Anatomy Archive",
  "project_root": ".",
  "artifact_path": "",
  "state_revision": 14,
  "last_updated": "2026-08-03T09:26:00-04:00",
  "current_baseline": {
    "identity": "build-skymourn source commit 6959c889528bff22b897636394d45939bb5a48f8",
    "state": "implemented-unverified",
    "last_verified": "No retrievable current-branch build or browser evidence"
  },
  "scope_boundaries": [
    "Single browser archive at repository root",
    "All 59 canonical Drakken records remain present",
    "Canon governed by docs/drakken_compendium_full_blood_eclipse_visual_integrated.md",
    "Record-level procedural model improvements use bounded explicit-count batches",
    "No deployment, backend, authentication, database, external asset sourcing, dependency migration, or unrelated feature work"
  ],
  "linked_parent_state": null
}
-->

## 1. Project Identity and Scope

The Drakken Field Anatomy Archive is a responsive React Three Fiber forensic compendium containing 59 Drakken records. The central examination chamber remains the primary product surface. The active milestone is record-level model improvement without reducing the archive, inventing canon, or counting shared configuration as finished modeling.

## 2. Current Baseline

The active model-source baseline is `build-skymourn` commit `6959c889528bff22b897636394d45939bb5a48f8`.

Current source includes:

- all 59 records and the legacy fallback router;
- original dedicated models for Skymourn, Gorevault, and Blood Ring;
- Batches 1–5 recorded below;
- Batch 6 containing exactly ten newly routed dedicated models;
- a repaired split between industrial and occupation Civiformer model modules;
- branch-scoped GitHub Actions validation configuration.

The connector reports no status checks for the current source commit. Browser execution is unavailable. Batch 6 is implemented but unverified.

## 3. Artifact Contract

Maintain one usable forensic archive containing the full 59-record collection. Every record remains discoverable and inspectable. Model work must preserve surface, structure, internal, and functional layers; clipping; animation; measurement; annotations; scale context; record switching; and fallback routing.

A record is not complete merely because it has unique configuration values. It requires meaningful record-specific construction grounded in the governing dossier and appropriate runtime validation before promotion to verified.

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

### INV-006 — Batch 6 contains exactly ten records

- **State:** `requested`
- **Rule:** Batch 6 begins immediately after `data-core-unbinder`, starts with `foundry-cantor`, ends with `sovereignty-eater`, and must not begin `hymnlock`.
- **Evidence:** `src/scene/SpecimenRouter.tsx`
- **Validation:** Exact route-case and diff inspection.
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

Source commit `6959c889528bff22b897636394d45939bb5a48f8` routes exactly these ten records to dedicated models:

1. `foundry-cantor` — Ironcant
2. `power-lattice-regulator` — Gridsaint
3. `skyline-moulter` — Spiremolt
4. `transit-impaler` — Roadthorn
5. `demographic-planner` — Habitarch
6. `record-devourer` — Archivore
7. `syntax-breaker` — Lexiclast
8. `civic-time-rewriter` — Calendarion
9. `oneiric-ecologist` — Dreamtaxon
10. `sovereignty-eater` — Crownmute

Implementation files:

- `src/scene/models/CiviformerIndustrialModels.tsx`
- `src/scene/models/CiviformerOccupationModels.tsx`
- `src/scene/models/NoosphereBatchModels.tsx`
- `src/scene/SpecimenRouter.tsx`

The initial combined Civiformer module was superseded and removed during one bounded repair pass after source inspection identified an avoidable callback/lint risk. The final split preserves the same six model routes while keeping file ownership clearer.

Missing evidence: TypeScript, lint, tests, production build, browser rendering, layer and clipping behavior, measurement, animations, camera framing, sibling comparison, and repeated switching.

## 8. Unknown or Evidence-Stale State

### UNK-001 — Browser and device behavior

Pointer, touch, keyboard, narrow viewport, reduced motion, WebGL clipping, measurement picking, context recovery, and repeated switching have not been exercised against the current source baseline.

### UNK-002 — Current dependency-backed build state

A validation workflow exists, but no status is attached or retrievable for source commit `6959c889528bff22b897636394d45939bb5a48f8`.

## 9. Pending Work

### PND-001 — Validate the current branch

- **Priority:** critical
- **Required:** `npm run typecheck && npm run lint && npm test && npm run build`
- **Blocks verified completion:** yes

### PND-002 — Perform browser model and lifecycle checks

Exercise the 35 records from Batches 2–6 plus representative fallback records through camera controls, layers, clipping, animations, measurement, annotations, and repeated switching.

- **Priority:** critical
- **Blocks verified completion:** yes

### PND-003 — Continue bounded model batches

The next archive record after Batch 6 is `hymnlock`. Do not treat it as part of Batch 6.

- **Priority:** high
- **Blocks Batch 6 source implementation:** no

## 10. Active Decisions and Prohibitions

- Use npm, Vite, React, TypeScript, Three.js, React Three Fiber, Drei, Vitest, ESLint, and plain CSS with one WebGL canvas.
- Use deterministic local procedural geometry while approved GLBs are absent.
- Preserve dossier body plans even when older `specimens.json` summaries are generic or contradictory.
- Do not claim rendering, visual comparison, typechecking, linting, testing, or building without direct current-revision evidence.
- Do not deploy, install speculative dependencies, replace frameworks, source external assets, or perform destructive Git operations.

## 11. Validation and Evidence Matrix

| Claim | State | Evidence | Required proof |
|---|---|---|---|
| Full 59-record archive remains intact | requested | Registry and fallback route retained | Record-count test and browser navigation |
| Batch 6 has exactly ten sequential routes | implemented-unverified | Router and compare inspection | Build plus direct route exercise |
| Batch 6 models are dossier-grounded | implemented-unverified | Dossier comparison and dedicated source | Visual canon audit |
| No Batch 6 spillover into Hymnlock | implemented-unverified | Router ends at `sovereignty-eater` | Direct route exercise |
| Examination workflow remains functional | unknown | Source compatibility retained | Browser smoke path |
| Current branch compiles and builds | evidence-stale | No retrievable current status | Full npm suite |

## 12. Current Change Scope and Impact Radius

Batch 6 changes three new final model modules and the model router. The impact radius includes Three.js geometry ownership, transparent and emissive materials, frame animation transforms, clipping, layer visibility, measurement events, annotations, camera framing, performance, and record switching. No dependencies, application UI, archive records, or post-`sovereignty-eater` routes changed.

## 13. Compact Revision Log

- **Revision 1–8:** Bootstrap, prototype, archive expansion, and rejected shared-archetype completion claims.
- **Revision 9:** Added Batch 1 Crust-Binder dedicated models.
- **Revision 10:** Added Batch 2 Atmos-Engine dedicated models.
- **Revision 11:** Reconciled the 59-record contract and corrected Batch 3 Seedcarriers.
- **Revision 12:** Added Batch 4 Fluxborne models and branch validation workflow.
- **Revision 13:** Added Batch 5: exactly ten sequential Fluxborne and Orbital-Wyrm models ending at Singulararch.
- **Revision 14:** Added Batch 6: exactly ten sequential Civiformer and Noosphere-Cantor models ending at Crownmute. Performed one bounded repair by splitting the Civiformer source and removing the superseded combined module. Current state remains implemented-unverified pending build and browser evidence.
