# Operational State — Drakken Field Anatomy Archive

<!-- operational-state:metadata
{
  "schema_version": 1,
  "project_id": "drakken-field-anatomy-archive",
  "project_name": "Drakken Field Anatomy Archive",
  "project_root": ".",
  "artifact_path": "",
  "state_revision": 11,
  "last_updated": "2026-08-03T12:59:00Z",
  "current_baseline": {
    "identity": "build-skymourn commit 11a431c9bfc081c9353c533c7b8765e013ded792",
    "state": "implemented-unverified",
    "last_verified": "Current model-batch commits have not received dependency-backed or browser validation"
  },
  "scope_boundaries": [
    "Single browser archive at repository root",
    "All 59 canonical Drakken records in src/data/specimens.json",
    "Canon governed by docs/drakken_compendium_full_blood_eclipse_visual_integrated.md",
    "Procedural model improvement occurs in batches of no more than five records",
    "No deployment, backend, authentication, database, external asset sourcing, or unrelated feature work"
  ],
  "linked_parent_state": null
}
-->

## 1. Project Identity and Scope

Drakken Field Anatomy Archive is a responsive React Three Fiber forensic compendium containing 59 Drakken records across nine classifications. The central examination chamber remains the primary product surface. The current milestone is record-level improvement of each procedural model without reducing the archive, inventing canon, or replacing distinct records with generic archetype clones.

## 2. Current Baseline

The active baseline is `build-skymourn` at commit `11a431c9bfc081c9353c533c7b8765e013ded792`.

Current source includes:

- all 59 records;
- three original dedicated models for Skymourn, Gorevault, and Blood Ring;
- Batch 1 dedicated Crust-Binder work;
- Batch 2 dedicated Atmos-Engine work;
- Batch 3 canon-correct Seedcarrier routing;
- shared parametric fallback models for records not yet given dedicated passes.

The current model-batch commits have not been run through TypeScript, lint, tests, production build, or browser inspection in the connector-only environment. They remain implemented but unverified.

## 3. Artifact Contract

Maintain one usable forensic archive containing the full 59-record collection. Every record must remain discoverable and inspectable. Model work must preserve the four examination layers, clipping, animation, measurement, annotations, scale context, record switching, and fallback routing.

A record is not complete merely because it has a unique configuration. It counts as individually improved only when it receives meaningful record-specific form, anatomy, material organization, animation, or presentation grounded in the canon dossier.

The obsolete initial three-record prototype contract is retained only as project history and is superseded by the current 59-record archive requirement.

## 4. Active Invariants

<!-- operational-state:entry
{
  "id": "INV-001",
  "title": "Preserve the complete 59-record archive",
  "state": "requested",
  "rule": "All 59 current Drakken records remain present, selectable, and routed. Do not restore the superseded three-record limit or replace current records with samples.",
  "scope": "Registry, manifests, models, routes, exports, tests, and navigation",
  "authority": "Latest explicit user correction and current repository baseline",
  "evidence": "src/data/specimens.json and current branch routing",
  "validation_method": "Record-count tests plus rendered archive navigation inspection",
  "last_checked": "2026-08-03 source inspection",
  "status": "active",
  "recheck_trigger": "Any registry, manifest, route, model, export, or test-data change"
}
-->
### INV-001 — Preserve the complete 59-record archive

- **State:** `requested`
- **Rule:** All 59 current Drakken records remain present, selectable, and routed. Do not restore the superseded three-record limit or replace current records with samples.
- **Scope:** Registry, manifests, models, routes, exports, tests, and navigation
- **Authority:** Latest explicit user correction and current repository baseline
- **Evidence:** `src/data/specimens.json` and current branch routing
- **Validation method:** Record-count tests plus rendered archive navigation inspection
- **Last checked:** 2026-08-03 source inspection
- **Status:** active
- **Recheck trigger:** Any registry, manifest, route, model, export, or test-data change
<!-- /operational-state:entry -->

<!-- operational-state:entry
{
  "id": "INV-002",
  "title": "Canon claims require dossier evidence",
  "state": "requested",
  "rule": "Do not invent Drakken anatomy, dimensions, incidents, capabilities, terminology, or citations. Significant model features must derive from the canon dossier or be clearly restrained reconstruction conventions.",
  "scope": "Model geometry, materials, animations, annotations, content panels, exports, documentation, and UI copy",
  "authority": "User-supplied full working-canon dossier",
  "evidence": "docs/drakken_compendium_full_blood_eclipse_visual_integrated.md",
  "validation_method": "Record-by-record dossier comparison",
  "last_checked": "2026-08-03 Batch 3 canon audit",
  "status": "active",
  "recheck_trigger": "Any model, content, annotation, source, export, or copy change"
}
-->
### INV-002 — Canon claims require dossier evidence

- **State:** `requested`
- **Rule:** Do not invent Drakken anatomy, dimensions, incidents, capabilities, terminology, or citations. Significant model features must derive from the canon dossier or be clearly restrained reconstruction conventions.
- **Scope:** Model geometry, materials, animations, annotations, content panels, exports, documentation, and UI copy
- **Authority:** User-supplied full working-canon dossier
- **Evidence:** `docs/drakken_compendium_full_blood_eclipse_visual_integrated.md`
- **Validation method:** Record-by-record dossier comparison
- **Last checked:** 2026-08-03 Batch 3 canon audit
- **Status:** active
- **Recheck trigger:** Any model, content, annotation, source, export, or copy change
<!-- /operational-state:entry -->

<!-- operational-state:entry
{
  "id": "INV-003",
  "title": "Protect the examination workflow",
  "state": "requested",
  "rule": "The central chamber remains primary and retains orbit, pan, zoom, reset, anatomy layers, clipping, animations, measurement, scale comparison, annotations, evidence, diagnostics, and export behavior.",
  "scope": "Application user journey",
  "authority": "Current archive purpose and accepted implementation",
  "evidence": "Existing application source",
  "validation_method": "Full browser smoke path across changed and fallback records",
  "last_checked": "Source presence only; runtime unverified",
  "status": "active",
  "recheck_trigger": "Any scene, camera, model, control, routing, layout, or responsive change"
}
-->
### INV-003 — Protect the examination workflow

- **State:** `requested`
- **Rule:** The central chamber remains primary and retains orbit, pan, zoom, reset, anatomy layers, clipping, animations, measurement, scale comparison, annotations, evidence, diagnostics, and export behavior.
- **Scope:** Application user journey
- **Authority:** Current archive purpose and accepted implementation
- **Evidence:** Existing application source
- **Validation method:** Full browser smoke path across changed and fallback records
- **Last checked:** Source presence only; runtime unverified
- **Status:** active
- **Recheck trigger:** Any scene, camera, model, control, routing, layout, or responsive change
<!-- /operational-state:entry -->

<!-- operational-state:entry
{
  "id": "INV-004",
  "title": "Individual configuration is not model completion",
  "state": "requested",
  "rule": "A record cannot be marked complete solely because it has unique configuration values, colors, scales, primitive counts, or an archetype route. Completion requires meaningful record-specific rendered construction and validation.",
  "scope": "Model-quality passes and completion reports",
  "authority": "Explicit user correction after false all-model completion claims",
  "evidence": "Batch workflow correction accepted in current project",
  "validation_method": "Dedicated construction inspection and sibling comparison",
  "last_checked": "2026-08-03",
  "status": "active",
  "recheck_trigger": "Any model-completion or batch-completion claim"
}
-->
### INV-004 — Individual configuration is not model completion

- **State:** `requested`
- **Rule:** A record cannot be marked complete solely because it has unique configuration values, colors, scales, primitive counts, or an archetype route. Completion requires meaningful record-specific rendered construction and validation.
- **Scope:** Model-quality passes and completion reports
- **Authority:** Explicit user correction after false all-model completion claims
- **Evidence:** Batch workflow correction accepted in current project
- **Validation method:** Dedicated construction inspection and sibling comparison
- **Last checked:** 2026-08-03
- **Status:** active
- **Recheck trigger:** Any model-completion or batch-completion claim
<!-- /operational-state:entry -->

## 5. Verified Working Behavior

No current-commit behavior is promoted to verified. The earlier GitHub Actions run `30788228054` proved the historical bootstrap revision only; later model and routing changes invalidate it as current evidence.

## 6. Known Not Working

None observed through a current runtime. Absence of runtime evidence is recorded below as unknown rather than mislabeled as success or failure.

## 7. Implemented but Unverified

<!-- operational-state:entry
{
  "id": "UNV-001",
  "title": "Full interactive archive source",
  "state": "implemented-unverified",
  "implementation": "The source contains the 59-record archive, R3F examination chamber, controls, four anatomical layers, clipping, animations, measurement, scale references, annotations, evidence panels, diagnostics, responsive drawers, keyboard controls, and exports.",
  "missing_evidence": "Current dependency-backed checks and direct browser exercise across the current branch",
  "status": "active"
}
-->
### UNV-001 — Full interactive archive source

- **State:** `implemented-unverified`
- **Implementation:** The source contains the 59-record archive, R3F examination chamber, controls, four anatomical layers, clipping, animations, measurement, scale references, annotations, evidence panels, diagnostics, responsive drawers, keyboard controls, and exports.
- **Missing evidence:** Current dependency-backed checks and direct browser exercise across the current branch
- **Status:** active
<!-- /operational-state:entry -->

<!-- operational-state:entry
{
  "id": "UNV-002",
  "title": "Batch 1 Crust-Binder dedicated models",
  "state": "implemented-unverified",
  "implementation": "Dedicated source models exist for Fault-Tongue, Obsidian Gul, Tremorhound, Magma Pleuron, and Granithelion in src/scene/models/CrustBinderModels.tsx.",
  "missing_evidence": "Current-branch build and browser sibling comparison",
  "status": "active"
}
-->
### UNV-002 — Batch 1 Crust-Binder dedicated models

- **State:** `implemented-unverified`
- **Implementation:** Dedicated source models exist for Fault-Tongue, Obsidian Gul, Tremorhound, Magma Pleuron, and Granithelion in `src/scene/models/CrustBinderModels.tsx`.
- **Missing evidence:** Current-branch build and browser sibling comparison
- **Status:** active
<!-- /operational-state:entry -->

<!-- operational-state:entry
{
  "id": "UNV-003",
  "title": "Batch 2 Atmos-Engine dedicated models",
  "state": "implemented-unverified",
  "implementation": "Dedicated source models and routing exist for Aerokarst, Hydrostatic Renderer, Stratos Chorister, Balance Engine, and Stormmind Tactician.",
  "missing_evidence": "TypeScript, lint, tests, build, browser rendering, interaction checks, and sibling comparison",
  "status": "active"
}
-->
### UNV-003 — Batch 2 Atmos-Engine dedicated models

- **State:** `implemented-unverified`
- **Implementation:** Dedicated source models and routing exist for Aerokarst, Hydrostatic Renderer, Stratos Chorister, Balance Engine, and Stormmind Tactician.
- **Missing evidence:** TypeScript, lint, tests, build, browser rendering, interaction checks, and sibling comparison
- **Status:** active
<!-- /operational-state:entry -->

<!-- operational-state:entry
{
  "id": "UNV-004",
  "title": "Batch 3 Seedcarrier canon-correct models",
  "state": "implemented-unverified",
  "implementation": "Commit 11a431c9bfc081c9353c533c7b8765e013ded792 routes Macroflora Colossus, Sporesphere Archivist, Neural Fungibinder, Precipitation Synth, and Soil Rewriter through canon-correct constructions in src/scene/models/SeedcarrierCanonModels.tsx.",
  "missing_evidence": "Repository TypeScript, lint, tests, production build, direct rendering, clipping, measurement, animation, camera, and repeated-switch checks",
  "status": "active"
}
-->
### UNV-004 — Batch 3 Seedcarrier canon-correct models

- **State:** `implemented-unverified`
- **Implementation:** Commit `11a431c9bfc081c9353c533c7b8765e013ded792` routes Macroflora Colossus, Sporesphere Archivist, Neural Fungibinder, Precipitation Synth, and Soil Rewriter through canon-correct constructions in `src/scene/models/SeedcarrierCanonModels.tsx`.
- **Missing evidence:** Repository TypeScript, lint, tests, production build, direct rendering, clipping, measurement, animation, camera, and repeated-switch checks
- **Status:** active
<!-- /operational-state:entry -->

## 8. Unknown or Evidence-Stale State

<!-- operational-state:entry
{
  "id": "UNK-001",
  "title": "Current browser and device behavior",
  "state": "unknown",
  "unknown": "Pointer, touch, keyboard, screen-reader, narrow viewport, reduced-motion, WebGL clipping, measurement picking, failed-load recovery, and repeated specimen-switch behavior have not been exercised on the current model-batch baseline.",
  "decisive_check": "Run the documented browser smoke path on the current branch.",
  "status": "active"
}
-->
### UNK-001 — Current browser and device behavior

- **State:** `unknown`
- **Unknown:** Pointer, touch, keyboard, screen-reader, narrow viewport, reduced-motion, WebGL clipping, measurement picking, failed-load recovery, and repeated specimen-switch behavior have not been exercised on the current model-batch baseline.
- **Decisive check:** Run the documented browser smoke path on the current branch.
- **Status:** active
<!-- /operational-state:entry -->

<!-- operational-state:entry
{
  "id": "UNK-002",
  "title": "Current dependency-backed build state",
  "state": "evidence-stale",
  "unknown": "The last successful Actions evidence predates the dedicated Atmos-Engine and Seedcarrier model commits. No status checks are attached to commit 11a431c9bfc081c9353c533c7b8765e013ded792.",
  "decisive_check": "Run npm run typecheck, npm run lint, npm test, and npm run build against the current branch.",
  "status": "active"
}
-->
### UNK-002 — Current dependency-backed build state

- **State:** `evidence-stale`
- **Unknown:** The last successful Actions evidence predates the dedicated Atmos-Engine and Seedcarrier model commits. No status checks are attached to commit `11a431c9bfc081c9353c533c7b8765e013ded792`.
- **Decisive check:** Run `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build` against the current branch.
- **Status:** active
<!-- /operational-state:entry -->

## 9. Pending Work

<!-- operational-state:entry
{
  "id": "PND-001",
  "title": "Validate current branch",
  "state": "pending",
  "task": "Run TypeScript, zero-warning lint, focused tests, and production build for the current branch.",
  "reason_pending": "The connector environment cannot clone or execute the GitHub repository and no CI status is attached to the latest commit.",
  "dependency": "Local checkout or GitHub Actions",
  "priority": "critical",
  "validation_needed": "npm run typecheck && npm run lint && npm test && npm run build",
  "blocks_completion": true
}
-->
### PND-001 — Validate current branch

- **State:** `pending`
- **Task:** Run TypeScript, zero-warning lint, focused tests, and production build for the current branch.
- **Reason pending:** The connector environment cannot clone or execute the GitHub repository and no CI status is attached to the latest commit.
- **Dependency:** Local checkout or GitHub Actions
- **Priority:** critical
- **Validation needed:** `npm run typecheck && npm run lint && npm test && npm run build`
- **Blocks completion:** true
<!-- /operational-state:entry -->

<!-- operational-state:entry
{
  "id": "PND-002",
  "title": "Perform browser model smoke and lifecycle checks",
  "state": "pending",
  "task": "Exercise the ten Batch 2 and Batch 3 records plus representative fallback records through camera, layers, clipping, animations, measurement, annotations, and repeated switching.",
  "reason_pending": "No interactive browser runtime is available in the connector environment",
  "dependency": "Installed application and browser",
  "priority": "critical",
  "validation_needed": "Documented browser checklist with visual sibling comparison",
  "blocks_completion": true
}
-->
### PND-002 — Perform browser model smoke and lifecycle checks

- **State:** `pending`
- **Task:** Exercise the ten Batch 2 and Batch 3 records plus representative fallback records through camera, layers, clipping, animations, measurement, annotations, and repeated switching.
- **Reason pending:** No interactive browser runtime is available in the connector environment
- **Dependency:** Installed application and browser
- **Priority:** critical
- **Validation needed:** Documented browser checklist with visual sibling comparison
- **Blocks completion:** true
<!-- /operational-state:entry -->

<!-- operational-state:entry
{
  "id": "PND-003",
  "title": "Continue bounded record-level model batches",
  "state": "pending",
  "task": "After validation, select the next weakest family and improve no more than five records in one batch.",
  "reason_pending": "Batch 3 source is implemented and requires validation before further expansion",
  "dependency": "PND-001 and PND-002",
  "priority": "high",
  "validation_needed": "Record-level canon audit, implementation, build, browser inspection, and sibling comparison",
  "blocks_completion": false
}
-->
### PND-003 — Continue bounded record-level model batches

- **State:** `pending`
- **Task:** After validation, select the next weakest family and improve no more than five records in one batch.
- **Reason pending:** Batch 3 source is implemented and requires validation before further expansion
- **Dependency:** PND-001 and PND-002
- **Priority:** high
- **Validation needed:** Record-level canon audit, implementation, build, browser inspection, and sibling comparison
- **Blocks completion:** false
<!-- /operational-state:entry -->

## 10. Active Decisions, Defaults, and Prohibitions

<!-- operational-state:entry
{
  "id": "DEC-001",
  "title": "Technical stack",
  "state": "requested",
  "decision": "Use npm, Vite, React, TypeScript, Three.js, React Three Fiber, Drei, Vitest, ESLint, and plain CSS with one WebGL canvas.",
  "authority": "Accepted project implementation",
  "status": "active"
}
-->
### DEC-001 — Technical stack

- **State:** `requested`
- **Decision:** Use npm, Vite, React, TypeScript, Three.js, React Three Fiber, Drei, Vitest, ESLint, and plain CSS with one WebGL canvas.
- **Authority:** Accepted project implementation
- **Status:** active
<!-- /operational-state:entry -->

<!-- operational-state:entry
{
  "id": "DEC-002",
  "title": "Canon-grounded procedural model route",
  "state": "requested",
  "decision": "Use deterministic local procedural geometry while approved GLBs are absent. Preserve canon form and function while treating unsupported internal arrangement, animation staging, and numeric chamber scale as reconstruction.",
  "authority": "Current user instruction and canon dossier",
  "status": "active"
}
-->
### DEC-002 — Canon-grounded procedural model route

- **State:** `requested`
- **Decision:** Use deterministic local procedural geometry while approved GLBs are absent. Preserve canon form and function while treating unsupported internal arrangement, animation staging, and numeric chamber scale as reconstruction.
- **Authority:** Current user instruction and canon dossier
- **Status:** active
<!-- /operational-state:entry -->

<!-- operational-state:entry
{
  "id": "DEC-003",
  "title": "Bound model passes to five records",
  "state": "requested",
  "decision": "Implement model-quality work in batches of no more than five records and stop each batch for validation before broadening scope.",
  "authority": "Accepted correction workflow",
  "status": "active"
}
-->
### DEC-003 — Bound model passes to five records

- **State:** `requested`
- **Decision:** Implement model-quality work in batches of no more than five records and stop each batch for validation before broadening scope.
- **Authority:** Accepted correction workflow
- **Status:** active
<!-- /operational-state:entry -->

<!-- operational-state:entry
{
  "id": "DEC-004",
  "title": "No false visual or build claims",
  "state": "requested",
  "decision": "Do not claim a model was rendered, visually compared, runtime-tested, typechecked, linted, tested, or built unless that exact check was executed against the current revision.",
  "authority": "Explicit user correction and operational evidence policy",
  "status": "active"
}
-->
### DEC-004 — No false visual or build claims

- **State:** `requested`
- **Decision:** Do not claim a model was rendered, visually compared, runtime-tested, typechecked, linted, tested, or built unless that exact check was executed against the current revision.
- **Authority:** Explicit user correction and operational evidence policy
- **Status:** active
<!-- /operational-state:entry -->

## 11. Validation and Evidence Matrix

| ID | Claim | State | Current evidence | Required validation | Recheck trigger |
|---|---|---|---|---|---|
| INV-001 | Full 59-record archive remains intact | requested | Current registry and routing source | Record-count tests and rendered navigation | Registry, route, manifest, or model change |
| INV-002 | Model features remain canon-grounded | requested | Full dossier and Batch 3 source audit | Record-by-record content and visual audit | Model or canon change |
| INV-003 | Examination workflow remains functional | requested | Source presence only | Full browser smoke path | Scene, model, routing, control, or layout change |
| INV-004 | Config does not equal completion | requested | Bounded dedicated-model workflow | Dedicated construction and sibling comparison | Any completion claim |
| UNV-001 | Full archive source exists | implemented-unverified | Current branch source | Build and browser inspection | Application change |
| UNV-002 | Batch 1 dedicated models exist | implemented-unverified | CrustBinderModels source | Current build and browser comparison | Model change |
| UNV-003 | Batch 2 dedicated models exist | implemented-unverified | AtmosEngineModels and router source | Current build and browser comparison | Model or route change |
| UNV-004 | Batch 3 canon-correct models exist | implemented-unverified | SeedcarrierCanonModels and router source | Current build and browser comparison | Model or route change |
| UNK-001 | Browser and device behavior | unknown | No current runtime evidence | Browser checklist | Runtime change |
| UNK-002 | Current build state | evidence-stale | Historical Actions run only | Full npm validation suite | Source or dependency change |
| PND-001 | Validate current branch | pending | No status checks on latest commit | Full npm validation suite | Latest commit change |
| PND-002 | Browser model checks | pending | No browser runtime | Direct model journey checks | Model or UI change |

## 12. Current Change Scope and Impact Radius

The completed change scope is Batch 3 only: five Seedcarrier records and their router imports. `src/scene/models/SeedcarrierCanonModels.tsx` supersedes the earlier incorrect routed forms for those five records while retaining the older file as a reusable base for three compatible constructions. The impact radius includes model rendering, clipping, layer visibility, measurement event handling, annotations, camera framing, performance, and record switching.

## 13. Compact Revision Log

- **Revision 1 — 2026-08-03:** Initialized state for an empty repository.
- **Revision 2 — 2026-08-03:** Established the original Skymourn-centered three-record prototype.
- **Revision 3 — 2026-08-03:** Recorded successful bootstrap Actions validation for the historical prototype revision.
- **Revision 4 — 2026-08-03:** Added the initial visual and interaction overhaul and original dedicated models.
- **Revision 8 — 2026-08-03:** Expanded the archive to all 59 records using nine shared archetype foundations; later completion claims were rejected because archetype routing did not prove individual model quality.
- **Revision 9 — 2026-08-03:** Added Batch 1 Crust-Binder dedicated models.
- **Revision 10 — 2026-08-03:** Added Batch 2 Atmos-Engine dedicated model source and routing; current build and browser validation remain pending.
- **Revision 11 — 2026-08-03:** Reconciled the obsolete three-record state, established the full 59-record contract, and corrected Batch 3 against the full canon dossier. Verdgorge is now an antlered root-rib quadruped; Pollenvault gains a gaping flower underside, pollenglyphs, and coded mist; Mycethron gains a brainlike tendril crown and dendritic web; Raintaster gains pale-script and patterned rain overlays; Terragullet is replaced by a jawless grinder-worm with compost chambers and glowing loam glyph trails. Current revision remains implemented-unverified.
