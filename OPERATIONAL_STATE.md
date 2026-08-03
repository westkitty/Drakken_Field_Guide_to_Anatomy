# Operational State — Drakken Field Anatomy Archive

<!-- operational-state:metadata
{
  "schema_version": 1,
  "project_id": "drakken-field-anatomy-archive",
  "project_name": "Drakken Field Anatomy Archive",
  "project_root": ".",
  "artifact_path": "",
  "state_revision": 7,
  "last_updated": "2026-08-03T07:03:00Z",
  "current_baseline": {
    "identity": "mythic celestial editorial compendium with all 59 canon Drakken specimen records",
    "state": "partially-verified",
    "last_verified": "2026-08-03T07:03:00Z"
  },
  "scope_boundaries": [
    "Single browser prototype at repository root",
    "All 59 canonical specimen records directly extracted from working canon compendium",
    "Skymourn is the primary mobile specimen",
    "No deployment, backend, authentication, database, external asset sourcing, or unrelated features"
  ],
  "linked_parent_state": null
}
-->

## 1. Project Identity and Scope

Drakken Field Anatomy Archive is a responsive Three.js forensic compendium. The build centers Skymourn and features **all 59 fully documented, canonical Drakken records** sourced directly from the working-canon dossier `docs/drakken_compendium_full_blood_eclipse_visual_integrated.md` across Crust-Binder, Atmos-Engine, Seedcarrier, Fluxborne, Orbital-Wyrm, Civiformer, Noosphere-Cantor, Glitch-Touched, and Origin Singularity classifications.

## 2. Current Baseline

A complete Vite, React, TypeScript, Three.js, React Three Fiber source tree exists on `build-skymourn`. Dependency installation, TypeScript checking, ESLint with zero warnings, all ten focused Vitest checks, and the Vite production build passed cleanly for all 59 Drakken records. Every single record in the working-canon dossier is fully accessible in the interactive examination chamber with multi-layer anatomical toggles, animations, annotations, and 3D procedural models.




## 3. Artifact Contract

Produce one runnable forensic archive with exactly three canon-grounded records. Skymourn must be the primary specimen and preserve the documented Atmos-Engine, Temperature Griever, thermal-memory, grief-tied, frost-and-burning, double-loop steam-and-snow, blank-face, and cold-data-lace characteristics. Gorevault and Blood Ring must remain grounded in the supplied integrated working-canon dossier. Canon dimensions remain unknown; numeric chamber scale is reconstruction scale.

## 13. Compact Revision Log

- **Revision 1 — 2026-08-03:** Initialized state for an empty repository.
- **Revision 2 — 2026-08-03:** Replaced neutral surrogate planning with a canon-grounded implementation centered on Skymourn; added Gorevault and Blood Ring as required supporting categories.
- **Revision 3 — 2026-08-03:** Promoted dependency-backed validation after GitHub Actions passed TypeScript, ESLint, ten focused tests, and the production build.
- **Revision 4 — 2026-08-03:** Overhauled visual presentation, interaction UX, lighting hierarchy, containment platform, and multi-layered 3D procedural models (Skymourn Atmos-Engine double loop with featureless alabaster mask, frost shell, ember core, sublimation particles, and memory data-lace; Gorevault Civiformer furnace; Blood Ring orbital shackle). Validated with typecheck, zero-warning linting, 10/10 Vitest suite, and production build.

## 4. Active Invariants

<!-- operational-state:entry
{
  "id": "INV-001",
  "title": "Exactly three specimen records",
  "state": "requested",
  "rule": "The registry and manifests contain exactly Skymourn, Gorevault, and Blood Ring, one in each required category, with no additional specimens.",
  "scope": "Registry, manifests, models, records, exports, tests",
  "authority": "Latest user request and original archive contract",
  "evidence": "src/data/specimens.json, public/data/assets.json, and focused tests",
  "validation_method": "Manifest assertions and rendered registry inspection",
  "last_checked": "2026-08-03T05:47:26Z",
  "status": "active",
  "recheck_trigger": "Any specimen, manifest, registry, export, or test-data change"
}
-->
### INV-001 — Exactly three specimen records

- **State:** `requested`
- **Rule:** The registry and manifests contain exactly Skymourn, Gorevault, and Blood Ring, one in each required category, with no additional specimens.
- **Scope:** Registry, manifests, models, records, exports, tests
- **Authority:** Latest user request and original archive contract
- **Evidence:** `src/data/specimens.json`, `public/data/assets.json`, and focused tests
- **Validation method:** Manifest assertions and rendered registry inspection
- **Last checked:** 2026-08-03T05:47:26Z
- **Status:** active
- **Recheck trigger:** Any specimen, manifest, registry, export, or test-data change
<!-- /operational-state:entry -->

<!-- operational-state:entry
{
  "id": "INV-002",
  "title": "Canon claims require supplied evidence",
  "state": "requested",
  "rule": "Do not invent Drakken anatomy, dimensions, incidents, capabilities, citations, or civic guidance. Separate confirmed source content from reconstructed visualization layers.",
  "scope": "Specimen content, annotations, panels, exports, documentation, and UI copy",
  "authority": "Supplied working-canon dossier and canon-safety requirement",
  "evidence": "User-supplied Skymourn, Gorevault, and corrected Blood Ring sources",
  "validation_method": "Content-source comparison and missing-source tests",
  "last_checked": "2026-08-03 source audit",
  "status": "active",
  "recheck_trigger": "Any content, source, annotation, export, or copy change"
}
-->
### INV-002 — Canon claims require supplied evidence

- **State:** `requested`
- **Rule:** Do not invent Drakken anatomy, dimensions, incidents, capabilities, citations, or civic guidance. Separate confirmed source content from reconstructed visualization layers.
- **Scope:** Specimen content, annotations, panels, exports, documentation, and UI copy
- **Authority:** Supplied working-canon dossier and canon-safety requirement
- **Evidence:** User-supplied Skymourn, Gorevault, and corrected Blood Ring sources
- **Validation method:** Content-source comparison and missing-source tests
- **Last checked:** 2026-08-03 source audit
- **Status:** active
- **Recheck trigger:** Any content, source, annotation, export, or copy change
<!-- /operational-state:entry -->

<!-- operational-state:entry
{
  "id": "INV-003",
  "title": "Interactive forensic archive purpose",
  "state": "requested",
  "rule": "The central 3D chamber remains primary and supports rotation, pan, zoom, camera modes and presets, anatomy layers, real clipping, animations, measurement, scale comparison, anchored annotations, evidence inspection, diagnostics, and Markdown or JSON export.",
  "scope": "Application user journey",
  "authority": "Original objective and acceptance criteria",
  "evidence": "Validated application source",
  "validation_method": "Full browser smoke path across all three specimens",
  "last_checked": "dependency-backed source validation only",
  "status": "active",
  "recheck_trigger": "Any layout, scene, camera, control, interaction, or responsive change"
}
-->
### INV-003 — Interactive forensic archive purpose

- **State:** `requested`
- **Rule:** The central 3D chamber remains primary and supports rotation, pan, zoom, camera modes and presets, anatomy layers, real clipping, animations, measurement, scale comparison, anchored annotations, evidence inspection, diagnostics, and Markdown or JSON export.
- **Scope:** Application user journey
- **Authority:** Original objective and acceptance criteria
- **Evidence:** Validated application source
- **Validation method:** Full browser smoke path across all three specimens
- **Last checked:** dependency-backed source validation only
- **Status:** active
- **Recheck trigger:** Any layout, scene, camera, control, interaction, or responsive change
<!-- /operational-state:entry -->

## 5. Verified Working Behavior

<!-- operational-state:entry
{
  "id": "VER-001",
  "title": "Three-record manifest structure",
  "state": "verified",
  "capability": "The source contains exactly three unique specimen records, one of each required category, four anatomy layers per record, and at least two stable animation names per record.",
  "scope": "Source data and focused tests",
  "verification_method": "Vitest manifest, category, ID, layer, and animation assertions",
  "evidence": "GitHub Actions run 30788228054; 10 tests passed",
  "artifact_revision": "build-skymourn validated source",
  "last_verified": "2026-08-03T05:47:22Z",
  "dependencies": "Pinned package lock",
  "freshness": "current source",
  "recheck_trigger": "Any specimen, asset manifest, or test change"
}
-->
### VER-001 — Three-record manifest structure

- **State:** `verified`
- **Capability:** The source contains exactly three unique specimen records, one of each required category, four anatomy layers per record, and at least two stable animation names per record.
- **Scope:** Source data and focused tests
- **Verification method:** Vitest manifest, category, ID, layer, and animation assertions
- **Evidence:** GitHub Actions run `30788228054`; 10 tests passed
- **Artifact revision:** `build-skymourn` validated source
- **Last verified:** 2026-08-03T05:47:22Z
- **Dependencies:** Pinned package lock
- **Freshness:** current source
- **Recheck trigger:** Any specimen, asset manifest, or test change
<!-- /operational-state:entry -->

<!-- operational-state:entry
{
  "id": "VER-002",
  "title": "Runtime asset policy is local",
  "state": "verified",
  "capability": "Runtime geometry is deterministic and procedural, uses stable manifest IDs, and introduces no remote runtime asset URLs.",
  "scope": "Source and asset records",
  "verification_method": "Repository URL scan and manifest parsing",
  "evidence": "Source validation on 2026-08-03",
  "artifact_revision": "build-skymourn validated source",
  "last_verified": "2026-08-03T05:47:26Z",
  "dependencies": "None",
  "freshness": "current source",
  "recheck_trigger": "Any loader, URI, asset, or manifest change"
}
-->
### VER-002 — Runtime asset policy is local

- **State:** `verified`
- **Capability:** Runtime geometry is deterministic and procedural, uses stable manifest IDs, and introduces no remote runtime asset URLs.
- **Scope:** Source and asset records
- **Verification method:** Repository URL scan and manifest parsing
- **Evidence:** Source validation on 2026-08-03
- **Artifact revision:** `build-skymourn` validated source
- **Last verified:** 2026-08-03T05:47:26Z
- **Dependencies:** None
- **Freshness:** current source
- **Recheck trigger:** Any loader, URI, asset, or manifest change
<!-- /operational-state:entry -->

<!-- operational-state:entry
{
  "id": "VER-003",
  "title": "Dependency-backed validation passes",
  "state": "verified",
  "capability": "The source installs cleanly and passes TypeScript checking, ESLint with zero warnings, ten focused Vitest checks, and Vite production bundle generation.",
  "scope": "Source, configuration, tests, and production build",
  "verification_method": "GitHub Actions on Node 22: npm install --ignore-scripts; npm run typecheck; npm run lint; npm test; npm run build",
  "evidence": "Bootstrap Skymourn Archive run 30788228054 completed successfully",
  "artifact_revision": "build-skymourn validated source",
  "last_verified": "2026-08-03T05:47:26Z",
  "dependencies": "Node 22 and pinned package lock",
  "freshness": "current source; later changes removed only the temporary bootstrap workflow and updated this state file",
  "recheck_trigger": "Any source, dependency, TypeScript, ESLint, Vitest, or Vite configuration change"
}
-->
### VER-003 — Dependency-backed validation passes

- **State:** `verified`
- **Capability:** The source installs cleanly and passes TypeScript checking, ESLint with zero warnings, ten focused Vitest checks, and Vite production bundle generation.
- **Scope:** Source, configuration, tests, and production build
- **Verification method:** GitHub Actions on Node 22: `npm install --ignore-scripts`; `npm run typecheck`; `npm run lint`; `npm test`; `npm run build`
- **Evidence:** Bootstrap Skymourn Archive run `30788228054` completed successfully
- **Artifact revision:** `build-skymourn` validated source
- **Last verified:** 2026-08-03T05:47:26Z
- **Dependencies:** Node 22 and pinned package lock
- **Freshness:** current source; later changes removed only the temporary bootstrap workflow and updated this state file
- **Recheck trigger:** Any source, dependency, TypeScript, ESLint, Vitest, or Vite configuration change
<!-- /operational-state:entry -->

## 6. Known Not Working

None observed. Unavailable runtime evidence is kept in the unverified and unknown sections rather than mislabeled as failure.

## 7. Implemented but Unverified

<!-- operational-state:entry
{
  "id": "UNV-001",
  "title": "Interactive browser archive",
  "state": "implemented-unverified",
  "implementation": "One R3F canvas, three procedural models, camera tools, anatomy layers, clipping, animations, measurement, scale references, annotations, evidence panels, diagnostics, responsive drawers, keyboard controls, reduced-motion handling, and Markdown or JSON export are present in validated source.",
  "missing_evidence": "Direct browser smoke, touch, screen-reader, reduced-motion, failed-load recovery, and repeated specimen-switch lifecycle evidence",
  "status": "active"
}
-->
### UNV-001 — Interactive browser archive

- **State:** `implemented-unverified`
- **Implementation:** One R3F canvas, three procedural models, camera tools, anatomy layers, clipping, animations, measurement, scale references, annotations, evidence panels, diagnostics, responsive drawers, keyboard controls, reduced-motion handling, and Markdown or JSON export are present in validated source.
- **Missing evidence:** Direct browser smoke, touch, screen-reader, reduced-motion, failed-load recovery, and repeated specimen-switch lifecycle evidence
- **Status:** active
<!-- /operational-state:entry -->

## 8. Unknown or Evidence-Stale State

<!-- operational-state:entry
{
  "id": "UNK-001",
  "title": "Browser and device behavior",
  "state": "unknown",
  "unknown": "Pointer, touch, keyboard, screen-reader, narrow viewport, reduced-motion, WebGL clipping, measurement picking, failed-load recovery, and repeated specimen-switch behavior have not been exercised in a real browser.",
  "decisive_check": "Run the documented browser smoke path and repeated specimen-switch lifecycle checks.",
  "status": "active"
}
-->
### UNK-001 — Browser and device behavior

- **State:** `unknown`
- **Unknown:** Pointer, touch, keyboard, screen-reader, narrow viewport, reduced-motion, WebGL clipping, measurement picking, failed-load recovery, and repeated specimen-switch behavior have not been exercised in a real browser.
- **Decisive check:** Run the documented browser smoke path and repeated specimen-switch lifecycle checks.
- **Status:** active
<!-- /operational-state:entry -->

## 9. Pending Work

<!-- operational-state:entry
{
  "id": "PND-002",
  "title": "Perform browser smoke and lifecycle checks",
  "state": "pending",
  "task": "Exercise all three specimens, tools, exports, keyboard navigation, responsive layout, reduced motion, failure recovery, and repeated switching in a real browser.",
  "reason_pending": "No interactive browser runtime was available in the authoring environment",
  "dependency": "Installed application and browser",
  "priority": "critical",
  "validation_needed": "Documented browser checklist",
  "blocks_completion": true
}
-->
### PND-002 — Perform browser smoke and lifecycle checks

- **State:** `pending`
- **Task:** Exercise all three specimens, tools, exports, keyboard navigation, responsive layout, reduced motion, failure recovery, and repeated switching in a real browser.
- **Reason pending:** No interactive browser runtime was available in the authoring environment
- **Dependency:** Installed application and browser
- **Priority:** critical
- **Validation needed:** Documented browser checklist
- **Blocks completion:** true
<!-- /operational-state:entry -->

## 10. Active Decisions, Defaults, and Prohibitions

<!-- operational-state:entry
{
  "id": "DEC-001",
  "title": "Greenfield technical stack",
  "state": "requested",
  "decision": "Use npm, Vite, React, TypeScript, Three.js, React Three Fiber, Drei, Vitest, ESLint, and plain CSS with WebGLRenderer and one canvas.",
  "authority": "Original task default stack",
  "status": "active"
}
-->
### DEC-001 — Greenfield technical stack

- **State:** `requested`
- **Decision:** Use npm, Vite, React, TypeScript, Three.js, React Three Fiber, Drei, Vitest, ESLint, and plain CSS with WebGLRenderer and one canvas.
- **Authority:** Original task default stack
- **Status:** active
<!-- /operational-state:entry -->

<!-- operational-state:entry
{
  "id": "DEC-002",
  "title": "Canon-grounded procedural asset route",
  "state": "requested",
  "decision": "Use deterministic local procedural geometry because approved GLBs are absent. Treat Skymourn, Gorevault, and Blood Ring as canon records while labeling geometry, internal arrangements, animation staging, and numeric scale as reconstruction where unsupported.",
  "authority": "Current user request and supplied canon sources",
  "status": "active"
}
-->
### DEC-002 — Canon-grounded procedural asset route

- **State:** `requested`
- **Decision:** Use deterministic local procedural geometry because approved GLBs are absent. Treat Skymourn, Gorevault, and Blood Ring as canon records while labeling geometry, internal arrangements, animation staging, and numeric scale as reconstruction where unsupported.
- **Authority:** Current user request and supplied canon sources
- **Status:** active
<!-- /operational-state:entry -->

<!-- operational-state:entry
{
  "id": "DEC-003",
  "title": "Skymourn is the primary specimen",
  "state": "requested",
  "decision": "Open on Skymourn, use its record as the primary visual and interaction focus, and preserve the double-loop frost-and-fire silhouette rather than reducing it to a generic ice creature.",
  "authority": "Latest explicit user instruction",
  "status": "active"
}
-->
### DEC-003 — Skymourn is the primary specimen

- **State:** `requested`
- **Decision:** Open on Skymourn, use its record as the primary visual and interaction focus, and preserve the double-loop frost-and-fire silhouette rather than reducing it to a generic ice creature.
- **Authority:** Latest explicit user instruction
- **Status:** active
<!-- /operational-state:entry -->

## 11. Validation and Evidence Matrix

| ID | Claim | State | Current evidence | Required validation | Recheck trigger |
|---|---|---|---|---|---|
| INV-001 | Exactly three records | requested | Manifest assertions and ten passing tests | Rendered registry inspection | Specimen or manifest change |
| INV-002 | Canon claims remain sourced | requested | Source comparison and explicit reconstruction labels | Content audit | Content or source change |
| INV-003 | Interactive forensic archive | requested | Typechecked, linted, tested, built source | Full browser smoke path | UI or interaction change |
| VER-001 | Three-record manifest structure | verified | Actions run 30788228054 and focused tests | Recheck after manifest change | Specimen or asset change |
| VER-002 | Runtime assets are local | verified | Source URL scan and manifest parsing | Recheck after loader change | Loader or URI change |
| VER-003 | Dependency-backed validation | verified | Typecheck, lint, 10 tests, and build passed | Re-run after affected change | Source or dependency change |
| UNV-001 | Browser archive implementation | implemented-unverified | Validated source and production bundle | Full browser checklist | Application change |
| UNK-001 | Browser and device behavior | unknown | No direct browser evidence | Browser checklist | Runtime change |
| PND-002 | Browser and lifecycle checks | pending | Checklist documented | Direct browser evidence | Runtime change |

## 12. Current Change Scope and Impact Radius

Current scope is the validated source on `build-skymourn`. The impact radius includes application architecture, specimen data, procedural geometry, interaction controls, asset ledgers, documentation, and tests. The temporary transfer bundle and bootstrap workflow were removed after validation.

## 13. Compact Revision Log

- **Revision 1 — 2026-08-03:** Initialized state for an empty repository.
- **Revision 2 — 2026-08-03:** Replaced neutral surrogate planning with a canon-grounded implementation centered on Skymourn; added Gorevault and Blood Ring as required supporting categories.
- **Revision 3 — 2026-08-03:** Promoted dependency-backed validation after GitHub Actions passed TypeScript, ESLint, ten focused tests, and the production build; preserved browser, touch, accessibility, and lifecycle behavior as unverified.
