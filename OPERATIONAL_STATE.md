# Operational State — Drakken Field Anatomy Archive

<!-- operational-state:metadata
{
  "schema_version": 1,
  "project_id": "drakken-field-anatomy-archive",
  "project_name": "Drakken Field Anatomy Archive",
  "project_root": ".",
  "artifact_path": "",
  "state_revision": 1,
  "last_updated": "2026-08-03T05:14:00Z",
  "current_baseline": {
    "identity": "empty greenfield repository",
    "state": "current-baseline",
    "last_verified": "2026-08-03T05:14:00Z"
  },
  "scope_boundaries": [
    "Single browser prototype at repository root",
    "Exactly three specimen records",
    "No deployment, backend, authentication, database, external asset sourcing, or unrelated features"
  ],
  "linked_parent_state": null
}
-->

## 1. Project Identity and Scope

Drakken Field Anatomy Archive is a responsive browser-based Three.js forensic compendium for examining exactly three Drakken-category surrogate specimens through interactive anatomy, sectioning, animation, measurement, comparison, annotation, evidence, incident, civic-response, diagnostics, and export tools.

## 2. Current Baseline

The repository is greenfield. No application files, canon files, package manifest, assets, tests, or prior verified behavior existed before initialization.

## 3. Artifact Contract

Produce one runnable Vite + React + TypeScript + React Three Fiber application at the repository root. The application must contain exactly three substantially different specimen records: one mobile organism, one siege or processing entity, and one fixed planetary structure. Because no canon or approved model sources are present, all records and geometry must use the authorized neutral surrogate names and remain prominently labeled `PROTOTYPE GEOMETRY — NON-CANON`.

## 4. Active Invariants

<!-- operational-state:entry
{
  "id": "INV-001",
  "title": "Exactly three specimen records",
  "state": "requested",
  "rule": "The registry and manifest contain exactly three specimen records, one for each required category, and no additional specimens.",
  "scope": "Registry, manifest, models, records, exports, tests",
  "authority": "Current task requirement",
  "evidence": "Attached implementation contract",
  "validation_method": "Schema and count tests plus rendered registry inspection",
  "last_checked": "initialization",
  "status": "active",
  "recheck_trigger": "Any specimen, manifest, fixture, registry, export, or test-data change"
}
-->
### INV-001 — Exactly three specimen records

- **State:** `requested`
- **Rule:** The registry and manifest contain exactly three specimen records, one for each required category, and no additional specimens.
- **Scope:** Registry, manifest, models, records, exports, tests
- **Authority:** Current task requirement
- **Evidence:** Attached implementation contract
- **Validation method:** Schema and count tests plus rendered registry inspection
- **Last checked:** initialization
- **Status:** active
- **Recheck trigger:** Any specimen, manifest, fixture, registry, export, or test-data change
<!-- /operational-state:entry -->

<!-- operational-state:entry
{
  "id": "INV-002",
  "title": "Unknown canon remains unknown",
  "state": "requested",
  "rule": "Do not invent Drakken strains, incidents, anatomy, measurements, capabilities, or citations. Unsupported material must remain Unknown, Unverified, Reconstructed, Source unavailable, or Non-canon prototype.",
  "scope": "All specimen content, annotations, panels, exports, documentation, and UI copy",
  "authority": "Current task requirement",
  "evidence": "No canon sources exist in the repository",
  "validation_method": "Content audit and missing-source tests",
  "last_checked": "initialization",
  "status": "active",
  "recheck_trigger": "Any content, source, specimen, annotation, export, or copy change"
}
-->
### INV-002 — Unknown canon remains unknown

- **State:** `requested`
- **Rule:** Do not invent Drakken strains, incidents, anatomy, measurements, capabilities, or citations. Unsupported material must remain Unknown, Unverified, Reconstructed, Source unavailable, or Non-canon prototype.
- **Scope:** All specimen content, annotations, panels, exports, documentation, and UI copy
- **Authority:** Current task requirement
- **Evidence:** No canon sources exist in the repository
- **Validation method:** Content audit and missing-source tests
- **Last checked:** initialization
- **Status:** active
- **Recheck trigger:** Any content, source, specimen, annotation, export, or copy change
<!-- /operational-state:entry -->

<!-- operational-state:entry
{
  "id": "INV-003",
  "title": "Interactive forensic archive purpose",
  "state": "requested",
  "rule": "The central 3D chamber remains the primary user surface and supports genuine rotation, pan, zoom, sectioning, animation, measurement, scale comparison, anchored annotations, and evidence inspection.",
  "scope": "Application user journey",
  "authority": "Current task objective and acceptance criteria",
  "evidence": "Attached implementation contract",
  "validation_method": "Browser smoke path across all three specimens",
  "last_checked": "initialization",
  "status": "active",
  "recheck_trigger": "Any layout, camera, controls, scene, interaction, state, or responsive change"
}
-->
### INV-003 — Interactive forensic archive purpose

- **State:** `requested`
- **Rule:** The central 3D chamber remains the primary user surface and supports genuine rotation, pan, zoom, sectioning, animation, measurement, scale comparison, anchored annotations, and evidence inspection.
- **Scope:** Application user journey
- **Authority:** Current task objective and acceptance criteria
- **Evidence:** Attached implementation contract
- **Validation method:** Browser smoke path across all three specimens
- **Last checked:** initialization
- **Status:** active
- **Recheck trigger:** Any layout, camera, controls, scene, interaction, state, or responsive change
<!-- /operational-state:entry -->

## 5. Verified Working Behavior

None. The repository began empty.

## 6. Known Not Working

None observed. No application existed to test.

## 7. Implemented but Unverified

None at initialization.

## 8. Unknown or Evidence-Stale State

<!-- operational-state:entry
{
  "id": "UNK-001",
  "title": "Browser and device behavior",
  "state": "unknown",
  "unknown": "Runtime behavior, accessibility, responsive layout, resource lifecycle, and reduced-motion handling are unverified until the application exists and can be exercised in a browser.",
  "decisive_check": "Run the required browser smoke path and repeated specimen-switch lifecycle checks.",
  "status": "active"
}
-->
### UNK-001 — Browser and device behavior

- **State:** `unknown`
- **Unknown:** Runtime behavior, accessibility, responsive layout, resource lifecycle, and reduced-motion handling are unverified until the application exists and can be exercised in a browser.
- **Decisive check:** Run the required browser smoke path and repeated specimen-switch lifecycle checks.
- **Status:** active
<!-- /operational-state:entry -->

## 9. Pending Work

<!-- operational-state:entry
{
  "id": "PND-001",
  "title": "Build the greenfield prototype",
  "state": "pending",
  "task": "Create the complete application, documentation, manifests, ledgers, tests, and diagnostics defined by the current implementation contract.",
  "reason_pending": "Repository initialization only",
  "dependency": "None",
  "priority": "critical",
  "validation_needed": "Typecheck, lint, focused tests, production build, and browser smoke checks where available",
  "blocks_completion": true
}
-->
### PND-001 — Build the greenfield prototype

- **State:** `pending`
- **Task:** Create the complete application, documentation, manifests, ledgers, tests, and diagnostics defined by the current implementation contract.
- **Reason pending:** Repository initialization only
- **Dependency:** None
- **Priority:** critical
- **Validation needed:** Typecheck, lint, focused tests, production build, and browser smoke checks where available
- **Blocks completion:** true
<!-- /operational-state:entry -->

## 10. Active Decisions, Defaults, and Prohibitions

<!-- operational-state:entry
{
  "id": "DEC-001",
  "title": "Greenfield technical stack",
  "state": "requested",
  "decision": "Use npm, Vite, React, TypeScript, Three.js, React Three Fiber, Drei where useful, Vitest, and plain CSS. Use WebGLRenderer and one canvas.",
  "authority": "Current task default greenfield stack",
  "status": "active"
}
-->
### DEC-001 — Greenfield technical stack

- **State:** `requested`
- **Decision:** Use npm, Vite, React, TypeScript, Three.js, React Three Fiber, Drei where useful, Vitest, and plain CSS. Use WebGLRenderer and one canvas.
- **Authority:** Current task default greenfield stack
- **Status:** active
<!-- /operational-state:entry -->

<!-- operational-state:entry
{
  "id": "DEC-002",
  "title": "Procedural surrogate asset route",
  "state": "requested",
  "decision": "Use deterministic local procedural geometry behind the same centralized specimen and asset manifest interfaces. Do not download third-party assets or fabricate canon.",
  "authority": "Current task asset and canon rules",
  "status": "active"
}
-->
### DEC-002 — Procedural surrogate asset route

- **State:** `requested`
- **Decision:** Use deterministic local procedural geometry behind the same centralized specimen and asset manifest interfaces. Do not download third-party assets or fabricate canon.
- **Authority:** Current task asset and canon rules
- **Status:** active
<!-- /operational-state:entry -->

## 11. Validation and Evidence Matrix

| ID | Claim | State | Current evidence | Required validation | Recheck trigger |
|---|---|---|---|---|---|
| INV-001 | Exactly three specimen records | requested | Contract only | Schema/count tests and registry inspection | Specimen or manifest change |
| INV-002 | Unknown canon remains unknown | requested | No canon sources present | Content audit and missing-source tests | Content or source change |
| INV-003 | Interactive forensic archive purpose | requested | Contract only | Browser smoke path | Layout or interaction change |
| UNK-001 | Browser and device behavior | unknown | No application | Browser and lifecycle checks | Runtime implementation change |
| PND-001 | Greenfield prototype built | pending | Repository initialized only | All supported static and runtime checks | Any implementation change |

## 12. Current Change Scope and Impact Radius

Allowed change scope: create the greenfield application and required documentation at repository root. Impact radius: the entire repository, which currently contains no protected application code. The only protected file during implementation is this operational state record, which must be updated rather than replaced or discarded.

## 13. Compact Revision Log

- **Revision 1 — 2026-08-03:** Initialized operational state for an empty repository using the attached implementation contract. No application behavior is verified.