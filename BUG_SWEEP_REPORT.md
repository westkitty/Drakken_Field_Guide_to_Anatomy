# Drakken Field Anatomy Archive — Exhaustive Bug Sweep

**Audit date:** 2026-08-03  
**Audit branch:** `audit/exhaustive-bug-sweep-20260803`  
**Target branch:** `build-skymourn`  
**Pull request:** #2  
**Audit status:** Automated source and build sweep passed; browser/runtime acceptance remains unverified

## 1. Audit scope

The sweep covered every repository-controlled surface available through GitHub:

- all application TypeScript and React source;
- all Three.js and React Three Fiber scene/model modules;
- exact routing for the closed 59-record registry;
- specimen content, sources, annotations, incidents, evidence states, and IDs;
- state transitions, selection races, animation ownership, and tool controls;
- section clipping, renderer quality, context lifecycle, measurement, diagnostics, and export behavior;
- responsive CSS, modal behavior, keyboard/focus paths, reduced motion, and remote dependencies;
- package, lockfile, TypeScript, ESLint, Vite, Vitest, and GitHub Actions configuration;
- asset, provenance, license, attribution, product, design, architecture, pipeline, and validation documents;
- clean dependency installation, strict static checks, typecheck, lint, tests, and production build.

Direct browser rendering, target-device performance, visual canon comparison, touch behavior, and long-session GPU/resource evidence were not available in this connector-backed environment and remain explicitly outside the verified set.

## 2. Method

The sweep used repeated independent passes:

1. Repository inventory and purpose reconstruction.
2. Contract comparison against `OPERATIONAL_STATE.md`, product, design, architecture, validation, asset policy, and the canon dossier.
3. Static source inspection of application, chamber, shared utilities, every model module, registry, tests, manifests, and documentation.
4. First dependency-backed validation to expose the earliest build failure.
5. Bounded root-cause repairs, never broad framework replacement.
6. Deterministic static auditing of route coverage, source integrity, clipping, local-only runtime references, exports, and ledgers.
7. Expanded integrity tests.
8. Full post-repair validation.
9. Independent diff and cleanup resweep.

A passing build was never treated as proof of browser usability, visual fidelity, performance, or resource stability.

## 3. Confirmed defect ledger

| ID | Severity | Defect | Evidence | Repair | Verification state |
|---|---|---|---|---|---|
| BUG-001 | Critical | Custom `THREE.Curve` subclasses inherited protected constructors and blocked TypeScript compilation. | First Actions typecheck reported 14 `TS2674` failures. | Added explicit public constructors to active and compatibility curve classes. | Typecheck passed. |
| BUG-002 | High | Workflow and declared Node floor were 22.12 while a locked ESLint dependency required at least 22.13. | Install emitted engine mismatch; lock/package metadata diverged. | Raised workflow, package, and lockfile root engine to 22.13. | Clean install and full workflow passed. |
| BUG-003 | Critical | Four canonical records had no dedicated model route despite the project claiming all 59 were individually modeled. | Static audit found 55 dedicated routes and fallback IDs `glassspine`, `quarrymind`, `toxic-veil-engine`, `hive-floramother`. | Added four dossier-grounded model components and exact routes. | Static audit reports 59 routes, zero fallback IDs. |
| BUG-004 | High | Skymourn animation stopped unless surface, internal, and functional refs were all mounted. | `useFrame` returned when optional hidden-layer refs were null. | Root animation now requires only the root ref; optional refs are guarded individually. | Static regression detector is clean; typecheck/build pass. Browser motion remains unverified. |
| BUG-005 | High | Functional Drei line overlays ignored section clipping across many models. | Initial audit found 103 `<Line>` elements without clipping planes. | Added the active clipping plane to all model line materials and repaired wrapper scope errors. | Static audit reports zero missing line or material clipping assignments. Rendered clipping remains unverified. |
| BUG-006 | High | `prefers-reduced-motion` was detected but did not stop Three.js animation. | Preference state existed without playback correction. | Preference now pauses active playback and new records start paused under reduced motion. | Source/typecheck verified; browser behavior unverified. |
| BUG-007 | Medium | Reselecting the active record could not cancel a different pending record load. | Early return occurred before advancing the load gate. | Active reselect now invalidates the pending request and clears pending/error state. | Source/tests/build verified; timed browser behavior unverified. |
| BUG-008 | High | Orientation dialog lacked initial focus, focus containment, and focus restoration. | Dialog source had no focus lifecycle. | Added initial close-button focus, Tab containment, Escape support preservation, and prior-focus restoration. | Source/typecheck/lint verified; keyboard browser journey unverified. |
| BUG-009 | High | Closed mobile drawers were translated off-screen but remained available to pointer/focus/accessibility paths. | CSS lacked hidden visibility and pointer suppression. | Closed drawers use `visibility: hidden` and `pointer-events: none`; open drawers restore them. | Static CSS check and build pass; mobile/AT behavior unverified. |
| BUG-010 | High | Google Fonts created a remote runtime dependency despite the local-only asset policy. | CSS contained a remote `@import`. | Removed the import and replaced font tokens with local system stacks. | Static audit reports zero remote application HTTP(S) references. |
| BUG-011 | High | Markdown and JSON exports omitted major dossier fields. | Exports excluded description, role, layers, animations, incidents, military interpretation, civic response, and full metadata. | Exports now retain the complete record, selected annotations, sources, evidence, and scale notice. | Seven new integrity/export tests pass. |
| BUG-012 | Medium | Download helper clicked a detached anchor and revoked the object URL immediately. | Source used fragile browser behavior. | Anchor is appended, clicked, removed, and URL revocation is deferred. | Typecheck/build pass; cross-browser download still unverified. |
| BUG-013 | Medium | Quality-tier antialias changes could not affect an already-created WebGL context. | `gl.antialias` was treated like a mutable renderer prop. | Canvas is keyed by quality tier so the renderer is recreated. | Source/build pass; rendered transition and state retention unverified. |
| BUG-014 | High | WebGL context listeners were installed without cleanup. | `onCreated` attached listeners with no removal lifecycle. | Added an effect-owned context lifecycle component with cleanup. | Source/build pass; actual loss/restoration unverified. |
| BUG-015 | High | UI and documentation asserted or implied a physical meter-per-world-unit calibration that did not exist. | Chamber copy, measurement labels, references, exports, manifests, design, and architecture conflicted with normalized procedural geometry. | Replaced claims with reconstruction units and explicit uncalibrated metadata; default scale aid is off and remaining aids are illustrative. | Static copy/config audit and build pass. |
| BUG-016 | High | Asset, provenance, and license ledgers covered only three assets. | Initial audit expected 59 but found 3/3/3. | Generated one governed entry for every stable `modelAssetRef`. | Static audit and tests report 59/59/59 coverage. |
| BUG-017 | Medium | Project documentation still described obsolete three-record and nine-archetype prototypes. | README, product, attribution, pipeline, validation, design, and architecture contradicted current source. | Reconciled documents with the 59-record archive and evidence boundaries. | Static stale-document checks pass. |
| BUG-018 | Medium | Evidence filters exposed only a subset of valid evidence states. | UI hard-coded four options despite eight supported states. | Filters derive from the authoritative evidence-state list. | Typecheck/build pass. |
| BUG-019 | Medium | Annotation export selection could only add IDs, never remove them. | Selection handler returned the unchanged list when already selected. | Selection now toggles and exposes `aria-pressed`. | Typecheck/lint/build pass; interaction unverified. |
| BUG-020 | High | Existing tests could not detect missing routes, orphaned sources, incomplete ledgers, false scale claims, or incomplete exports. | Ten narrow archive tests all passed while major defects remained. | Added deterministic static audit and seven registry/governance/export integrity tests. | 17/17 tests and strict audit pass. |
| BUG-021 | Medium | Workflow used older Node 20-based action releases and emitted deprecation warnings. | Actions logs warned that checkout/setup-node v4 were being forced onto Node 24. | Permanent validator now uses official `actions/checkout@v7` and `actions/setup-node@v7`; temporary write jobs were removed. | Final post-documentation workflow pending at report commit. |

## 4. Repaired canonical omissions

The following were not cosmetic variants. They were missing record-specific source paths:

### Glassspine

- segmented quartz-glass axial construction;
- refractive fins and optical channels;
- internal prism core;
- refracted-fog and light-spindle fields.

### Quarrymind

- slow quadrupedal quarry chassis;
- dorsal quarry-brain and cutting ring;
- coordinated excavation drones;
- excavation-vector field and quarry-zone overlays.

### Toxic Veil Engine

- bloated atmospheric-processing leviathan;
- chimney-backed smog vents;
- lateral chemical sacs and distillation core;
- toxic shroud and aerosol field overlays.

### Hive Floramother

- stationary colossal flower body;
- glowing ovary hive and petal structure;
- orbiting seed-drone swarm;
- swarm flight paths and colonization-radius overlays.

## 5. Final automated evidence

GitHub Actions run `30824468370` passed after temporary repair machinery was removed:

- `npm ci --ignore-scripts`: 253 packages installed, zero reported vulnerabilities;
- strict static audit: zero issues;
- TypeScript project build: pass;
- ESLint `--max-warnings 0`: pass;
- Vitest: 17/17 tests across two files;
- Vite production build: pass;
- transformed modules: 592;
- output CSS: 18.21 kB minified / 4.62 kB gzip;
- output JavaScript: 1,574.68 kB minified / 389.13 kB gzip.

The strict audit reported:

- 59 specimen records;
- 59 dedicated routes;
- zero fallback IDs;
- 17 model modules;
- zero line clipping gaps;
- zero material clipping gaps;
- zero remote application runtime references;
- 59 asset entries;
- 59 provenance entries;
- 59 license entries;
- zero critical, high, medium, or low static issues in its defined rule set.

## 6. Remaining defects, risks, and unknowns

### RISK-001 — Oversized main JavaScript chunk

- **Severity:** Medium performance risk
- **Evidence:** Vite warns because the main minified chunk is 1,574.68 kB, above 500 kB.
- **Potential impact:** slower parsing/startup on weaker mobile devices.
- **Not falsely repaired:** raising the warning threshold or arbitrary manual chunking would conceal the symptom. A proper repair should lazy-load record families or model modules and compare real loading behavior against a baseline.

### UNK-001 — Browser interaction

Not directly exercised:

- orbit, pan, zoom, reset, camera presets, and projection switching;
- record-switch timing and cancellation;
- layer toggles and all three clipping axes;
- animation pause/restart/loop/speed;
- measurement and annotation selection;
- file downloads;
- mobile drawers and modal keyboard behavior;
- reduced-motion startup and manual resume.

### UNK-002 — Visual canon fidelity

All 59 routes compile and are dossier-grounded at source level, but the final rendered forms have not been rotated and compared from all angles against their records and closest siblings.

### UNK-003 — Renderer lifecycle and performance

Not directly measured:

- WebGL context loss/restoration;
- `renderer.info` stabilization after repeated record switches;
- memory and GPU-resource growth;
- target-device frame rate and thermals;
- transparent-material sorting and overdraw;
- initial bundle loading on slower networks/devices.

### UNK-004 — Assistive technology

Semantic and focus-path defects were repaired in source, but screen-reader announcements, mobile accessibility services, and real keyboard focus order still require browser/device validation.

## 7. Protected capabilities preserved

The sweep did not:

- reduce the 59-record registry;
- invent new canon records;
- replace React Three Fiber or Three.js;
- add runtime dependencies;
- deploy the application;
- change the canon dossier;
- remove the legacy fallback safety path;
- remove camera, layer, clipping, animation, measurement, evidence, diagnostic, or export controls;
- claim browser or visual verification from source checks.

## 8. Recommended next bounded action

Run a browser acceptance and performance sweep against PR #2 before merging it as a runtime-ready release. That pass should capture screenshots or recordings for representative records from every family, exercise all repaired interactions, repeat record switching while monitoring `renderer.info`, and collect first-load and target-device evidence. The bundle warning should then be addressed through measured lazy loading rather than warning suppression.

## 9. Final verdict

**Automated source/build sweep: PASS.**  
**Repository correctness improved materially: YES.**  
**All 59 records have dedicated routes: YES.**  
**Safe to call browser/runtime behavior fully verified: NO.**  
**PR merge recommendation:** keep draft until browser, visual-canon, device, and lifecycle acceptance evidence is collected.
