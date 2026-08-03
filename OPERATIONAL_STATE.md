# Operational State — Drakken Field Anatomy Archive

<!-- operational-state:metadata
{
  "schema_version": 1,
  "project_id": "drakken-field-anatomy-archive",
  "project_name": "Drakken Field Anatomy Archive",
  "project_root": ".",
  "artifact_path": "",
  "state_revision": 2,
  "last_updated": "2026-08-03T05:56:00Z",
  "current_baseline": {
    "identity": "build-skymourn source tree",
    "state": "implemented-unverified",
    "last_verified": null
  },
  "scope_boundaries": [
    "Single browser prototype at repository root",
    "Exactly three specimen records",
    "Skymourn is the primary mobile specimen",
    "No deployment, backend, authentication, database, external asset sourcing, or unrelated features"
  ],
  "linked_parent_state": null
}
-->

## 1. Project Identity and Scope

Drakken Field Anatomy Archive is a responsive browser-based Three.js forensic compendium. The current build centers Skymourn and retains exactly two supporting records required by the archive contract: Gorevault as a siege or processing entity and a Blood Ring as fixed planetary infrastructure.

## 2. Current Baseline

A complete Vite, React, TypeScript, Three.js, React Three Fiber source tree now exists. The browser application, focused tests, procedural models, asset records, documentation, and CI workflow are implemented. Dependency-backed checks and real browser validation remain pending until the branch workflow runs.

## 3. Artifact Contract

Produce one runnable forensic archive with exactly three canon-grounded specimen records. Skymourn must be the primary specimen and must preserve the documented Atmos-Engine, Temperature Griever, thermal/memory, grief-tied, frost-and-burning, looping steam-and-snow, blank-face, and cold-data-lace characteristics. Gorevault and Blood Ring records must remain grounded in the supplied integrated working-canon dossier. Canon dimensions remain unknown; every numeric chamber scale is visibly labeled as reconstruction scale.

## 4. Active Invariants

<!-- operational-state:entry
{
  "id": "INV-001",
  "title": "Exactly three specimen records",
  "state": "requested",
  "rule": "The registry and manifest contain exactly Skymourn, Gorevault, and Blood Ring, with one record in each required category and no additional specimens.",
  "scope": "Registry, manifest, models, records, exports, tests",
  "authority": "Current task and original archive contract",
  "evidence": "src/data/specimens.json and asset manifest",
  "validation_method": "Manifest count, unique-ID, category, and rendered registry checks",
  "last_checked": "2026-08-03 source validation",
  "status": "active",
  "recheck_trigger": "Any specimen, manifest, registry, export, or test-data change"
}
-->
### INV-001 — Exactly three specimen records

- **State:** `requested`
- **Rule:** The registry and manifest contain exactly Skymourn, Gorevault, and Blood Ring, with one record in each required category and no additional specimens.
- **Scope:** Registry, manifest, models, records, exports, tests
- **Authority:** Current task and original archive contract
- **Evidence:** `src/data/specimens.json` and asset manifest
- **Validation method:** Manifest count, unique-ID, category, and rendered registry checks
- **Last checked:** 2026-08-03 source validation
- **Status:** active
- **Recheck trigger:** Any specimen, manifest, registry, export, or test-data change
<!-- /operational-state:entry -->

<!-- operational-state:entry
{
  "id": "INV-002",
  "title": "Canon claims require supplied evidence",
  "state": "requested",
  "rule": "Do not invent Drakken anatomy, dimensions, incidents, capabilities, citations, or civic guidance. Separate confirmed source content from reconstructed visualization layers.",
  "scope": "All specimen content, annotations, panels, exports, documentation, and UI copy",
  "authority": "Current task, supplied working-canon dossier, and original canon-safety requirement",
  "evidence": "Skymourn, Gorevault, and corrected Blood Ring source passages supplied by the user",
  "validation_method": "Content-source comparison and missing-source tests",
  "last_checked": "2026-08-03 source validation",
  "status": "active",
  "recheck_trigger": "Any content, source, specimen, annotation, export, or copy change"
}
-->
### INV-002 — Canon claims require supplied evidence

- **State:** `requested`
- **Rule:** Do not invent Drakken anatomy, dimensions, incidents, capabilities, citations, or civic guidance. Separate confirmed source content from reconstructed visualization layers.
- **Scope:** All specimen content, annotations, panels, exports, documentation, and UI copy
- **Authority:** Current task, supplied working-canon dossier, and original canon-safety requirement
- **Evidence:** Skymourn, Gorevault, and corrected Blood Ring source passages supplied by the user
- **Validation method:** Content-source comparison and missing-source tests
- **Last checked:** 2026-08-03 source validation
- **Status:** active
- **Recheck trigger:** Any content, source, specimen, annotation, export, or copy change
<!-- /operational-state:entry -->

<!-- operational-state:entry
{
  "id": "INV-003",
  "title": "Interactive forensic archive purpose",
  "state": "requested",
  "rule": "The central 3D chamber remains the primary surface and supports genuine rotation, pan, zoom, sectioning, animation, measurement, scale comparison, anchored annotations, evidence inspection, diagnostics, and citation-ready export.",
  "scope": "Application user journey",
  "authority": "Original task objective and acceptance criteria",
  "evidence": "Implemented application source",
  "validation_method": "Browser smoke path across all three specimens",
  "last_checked": "source implementation only",
  "status": "active",
  "recheck_trigger": "Any layout, camera, controls, scene, interaction, state, or responsive change"
}
-->
### INV-003 — Interactive forensic archive purpose

- **State:** `requested`
- **Rule:** The central 3D chamber remains the primary surface and supports genuine rotation, pan, zoom, sectioning, animation, measurement, scale comparison, anchored annotations, evidence inspection, diagnostics, and citation-ready export.
- **Scope:** Application user journey
- **Authority:** Original task objective and acceptance criteria
- **Evidence:** Implemented application source
- **Validation method:** Browser smoke path across all three specimens
- **Last checked:** source implementation only
- **Status:** active
- **Recheck trigger:** Any layout, camera, controls, scene, interaction, state, or responsive change
<!-- /operational-state:entry -->

## 5. Verified Working Behavior

<!-- operational-state:entry
{
  "id": "VER-001",
  "title": "Three-record manifest structure",
  "state": "verified",
  "capability": "The source manifest contains exactly three unique records and one of each required category, with four anatomy layers and at least two stable animation names per record.",
  "scope": "Source data only",
  "verification_method": "Node JSON parsing and deterministic manifest assertions",
  "evidence": "Local source validation on 2026-08-03",
  "artifact_revision": "build-skymourn pre-CI source tree",
  "last_verified": "2026-08-03T05:55:00Z",
  "dependencies": "None",
  "freshness": "current source tree",
  "recheck_trigger": "Any specimen or asset manifest change"
}
-->
### VER-001 — Three-record manifest structure

- **State:** `verified`
- **Capability:** The source manifest contains exactly three unique records and one of each required category, with four anatomy layers and at least two stable animation names per record.
- **Scope:** Source data only
- **Verification method:** Node JSON parsing and deterministic manifest assertions
- **Evidence:** Local source validation on 2026-08-03
- **Artifact revision:** build-skymourn pre-CI source tree
- **Last verified:** 2026-08-03T05:55:00Z
- **Dependencies:** None
- **Freshness:** current source tree
- **Recheck trigger:** Any specimen or asset manifest change
<!-- /operational-state:entry -->

<!-- operational-state:entry
{
  "id": "VER-002",
  "title": "Runtime asset policy is local",
  "state": "verified",
  "capability": "The source tree contains no HTTP or HTTPS runtime asset URLs and all three assets use stable procedural manifest IDs.",
  "scope": "Source and asset records",
  "verification_method": "Repository source scan and manifest parsing",
  "evidence": "Local source validation on 2026-08-03",
  "artifact_revision": "build-skymourn pre-CI source tree",
  "last_verified": "2026-08-03T05:55:00Z",
  "dependencies": "None",
  "freshness": "current source tree",
  "recheck_trigger": "Any loader, URI, asset, or manifest change"
}
-->
### VER-002 — Runtime asset policy is local

- **State:** `verified`
- **Capability:** The source tree contains no HTTP or HTTPS runtime asset URLs and all three assets use stable procedural manifest IDs.
- **Scope:** Source and asset records
- **Verification method:** Repository source scan and manifest parsing
- **Evidence:** Local source validation on 2026-08-03
- **Artifact revision:** build-skymourn pre-CI source tree
- **Last verified:** 2026-08-03T05:55:00Z
- **Dependencies:** None
- **Freshness:** current source tree
- **Recheck trigger:** Any loader, URI, asset, or manifest change
<!-- /operational-state:entry -->

## 6. Known Not Working

None observed. Unavailable validation is recorded below rather than converted into a defect claim.

## 7. Implemented but Unverified

<!-- operational-state:entry
{
  "id": "UNV-001",
  "title": "Interactive browser archive",
  "state": "implemented-unverified",
  "implementation": "One R3F canvas, three procedural models, camera tools, anatomy layers, clipping, animations, measurement, scale references, annotations, evidence panels, diagnostics, responsive drawers, keyboard controls, reduced-motion handling, and Markdown/JSON export are present in source.",
  "missing_evidence": "Installed dependency checks and real browser smoke validation",
  "status": "active"
}
-->
### UNV-001 — Interactive browser archive

- **State:** `implemented-unverified`
- **Implementation:** One R3F canvas, three procedural models, camera tools, anatomy layers, clipping, animations, measurement, scale references, annotations, evidence panels, diagnostics, responsive drawers, keyboard controls, reduced-motion handling, and Markdown/JSON export are present in source.
- **Missing evidence:** Installed dependency checks and real browser smoke validation
- **Status:** active
<!-- /operational-state:entry -->

<!-- operational-state:entry
{
  "id": "UNV-002",
  "title": "Focused automated checks",
  "state": "implemented-unverified",
  "implementation": "Vitest coverage exists for schema validity, exact count, unique IDs, asset references, evidence states, measurement, exports, missing sources, animation fallback, and stale specimen requests.",
  "missing_evidence": "Vitest must execute with installed dependencies",
  "status": "active"
}
-->
### UNV-002 — Focused automated checks

- **State:** `implemented-unverified`
- **Implementation:** Vitest coverage exists for schema validity, exact count, unique IDs, asset references, evidence states, measurement, exports, missing sources, animation fallback, and stale specimen requests.
- **Missing evidence:** Vitest must execute with installed dependencies
- **Status:** active
<!-- /operational-state:entry -->

## 8. Unknown or Evidence-Stale State

<!-- operational-state:entry
{
  "id": "UNK-001",
  "title": "Browser and device behavior",
  "state": "unknown",
  "unknown": "Pointer, touch, keyboard, screen-reader, narrow viewport, reduced-motion, WebGL clipping, measurement picking, and repeated specimen-switch behavior have not been exercised in a real browser.",
  "decisive_check": "Run the required browser smoke path and repeated specimen-switch lifecycle checks.",
  "status": "active"
}
-->
### UNK-001 — Browser and device behavior

- **State:** `unknown`
- **Unknown:** Pointer, touch, keyboard, screen-reader, narrow viewport, reduced-motion, WebGL clipping, measurement picking, and repeated specimen-switch behavior have not been exercised in a real browser.
- **Decisive check:** Run the required browser smoke path and repeated specimen-switch lifecycle checks.
- **Status:** active
<!-- /operational-state:entry -->

<!-- operational-state:entry
{
  "id": "UNK-002",
  "title": "Installed dependency compatibility",
  "state": "unknown",
  "unknown": "Real TypeScript, ESLint, Vitest, and Vite production-build results are unavailable until dependencies install in CI or a networked development environment.",
  "decisive_check": "Run npm install, npm run typecheck, npm run lint, npm test, and npm run build.",
  "status": "active"
}
-->
### UNK-002 — Installed dependency compatibility

- **State:** `unknown`
- **Unknown:** Real TypeScript, ESLint, Vitest, and Vite production-build results are unavailable until dependencies install in CI or a networked development environment.
- **Decisive check:** Run `npm install`, `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build`.
- **Status:** active
<!-- /operational-state:entry -->

## 9. Pending Work

<!-- operational-state:entry
{
  "id": "PND-001",
  "title": "Run branch validation",
  "state": "pending",
  "task": "Execute dependency-backed typecheck, lint, Vitest, and production build through the validation workflow.",
  "reason_pending": "Local execution environment cannot reach the npm registry",
  "dependency": "Networked GitHub Actions runner or local npm access",
  "priority": "critical",
  "validation_needed": "All four package scripts pass",
  "blocks_completion": true
}
-->
### PND-001 — Run branch validation

- **State:** `pending`
- **Task:** Execute dependency-backed typecheck, lint, Vitest, and production build through the validation workflow.
- **Reason pending:** Local execution environment cannot reach the npm registry
- **Dependency:** Networked GitHub Actions runner or local npm access
- **Priority:** critical
- **Validation needed:** All four package scripts pass
- **Blocks completion:** true
<!-- /operational-state:entry -->

<!-- operational-state:entry
{
  "id": "PND-002",
  "title": "Perform browser smoke and lifecycle checks",
  "state": "pending",
  "task": "Exercise all three specimens, tools, exports, keyboard navigation, responsive layout, reduced motion, failure recovery, and repeated switching in a real browser.",
  "reason_pending": "No browser runtime is available in the authoring environment",
  "dependency": "Installed application and browser",
  "priority": "critical",
  "validation_needed": "Original 17-step browser checklist",
  "blocks_completion": true
}
-->
### PND-002 — Perform browser smoke and lifecycle checks

- **State:** `pending`
- **Task:** Exercise all three specimens, tools, exports, keyboard navigation, responsive layout, reduced motion, failure recovery, and repeated switching in a real browser.
- **Reason pending:** No browser runtime is available in the authoring environment
- **Dependency:** Installed application and browser
- **Priority:** critical
- **Validation needed:** Original 17-step browser checklist
- **Blocks completion:** true
<!-- /operational-state:entry -->

## 10. Active Decisions, Defaults, and Prohibitions

<!-- operational-state:entry
{
  "id": "DEC-001",
  "title": "Greenfield technical stack",
  "state": "requested",
  "decision": "Use npm, Vite, React, TypeScript, Three.js, React Three Fiber, Drei, Vitest, ESLint, and plain CSS. Use WebGLRenderer and one canvas.",
  "authority": "Original task default stack",
  "status": "active"
}
-->
### DEC-001 — Greenfield technical stack

- **State:** `requested`
- **Decision:** Use npm, Vite, React, TypeScript, Three.js, React Three Fiber, Drei, Vitest, ESLint, and plain CSS. Use WebGLRenderer and one canvas.
- **Authority:** Original task default stack
- **Status:** active
<!-- /operational-state:entry -->

<!-- operational-state:entry
{
  "id": "DEC-002",
  "title": "Canon-grounded procedural asset route",
  "state": "requested",
  "decision": "Use deterministic local procedural geometry because approved GLBs are absent. Treat Skymourn, Gorevault, and Blood Ring as canon records while labeling geometry, internal arrangements, animation staging, and numeric chamber scale as reconstruction where unsupported.",
  "authority": "Current user request and supplied canon sources",
  "status": "active"
}
-->
### DEC-002 — Canon-grounded procedural asset route

- **State:** `requested`
- **Decision:** Use deterministic local procedural geometry because approved GLBs are absent. Treat Skymourn, Gorevault, and Blood Ring as canon records while labeling geometry, internal arrangements, animation staging, and numeric chamber scale as reconstruction where unsupported.
- **Authority:** Current user request and supplied canon sources
- **Status:** active
<!-- /operational-state:entry -->

<!-- operational-state:entry
{
  "id": "DEC-003",
  "title": "Skymourn is the primary specimen",
  "state": "requested",
  "decision": "The application opens on Skymourn, uses its archive record as the primary visual and interaction focus, and preserves the supplied double-loop frost-and-fire silhouette without converting it into a generic ice creature.",
  "authority": "Latest explicit user instruction",
  "status": "active"
}
-->
### DEC-003 — Skymourn is the primary specimen

- **State:** `requested`
- **Decision:** The application opens on Skymourn, uses its archive record as the primary visual and interaction focus, and preserves the supplied double-loop frost-and-fire silhouette without converting it into a generic ice creature.
- **Authority:** Latest explicit user instruction
- **Status:** active
<!-- /operational-state:entry -->

## 11. Validation and Evidence Matrix

| ID | Claim | State | Current evidence | Required validation | Recheck trigger |
|---|---|---|---|---|---|
| INV-001 | Exactly three records | requested | Manifest and source assertions | Vitest and rendered registry | Specimen or manifest change |
| INV-002 | Canon claims remain sourced | requested | Source comparison and explicit reconstruction labels | Content audit | Content or source change |
| INV-003 | Interactive forensic archive | requested | Complete source implementation | Full browser smoke path | UI or interaction change |
| VER-001 | Three-record manifest structure | verified | Node JSON/manifest assertions | Recheck after manifest change | Specimen or asset change |
| VER-002 | Runtime assets are local | verified | Source URL scan and manifest parsing | Recheck after loader change | Loader or URI change |
| UNV-001 | Browser archive implementation | implemented-unverified | Source presence | Typecheck, build, browser smoke | Application change |
| UNV-002 | Focused automated checks | implemented-unverified | Test source presence | Vitest execution | Test or logic change |
| UNK-001 | Browser/device behavior | unknown | No runtime evidence | Browser checklist | Runtime change |
| UNK-002 | Installed dependency compatibility | unknown | No installed packages | CI scripts | Dependency/config change |
| PND-001 | Branch validation | pending | Workflow source present | Passing workflow | Source or dependency change |
| PND-002 | Browser and lifecycle checks | pending | Checklist documented | Direct browser evidence | Runtime change |

## 12. Current Change Scope and Impact Radius

Current scope is the complete greenfield archive source tree on the `build-skymourn` branch. The impact radius includes application architecture, specimen data, procedural geometry, interaction controls, asset ledgers, documentation, tests, and validation workflow. No unrelated repository content exists.

## 13. Compact Revision Log

- **Revision 1 — 2026-08-03:** Initialized operational state for an empty repository.
- **Revision 2 — 2026-08-03:** Replaced neutral surrogate planning with a canon-grounded implementation centered on Skymourn; added Gorevault and Blood Ring as the two required supporting categories; recorded source-level verification and pending dependency/browser validation.
