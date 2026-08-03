# Drakken Field Anatomy Archive — Exhaustive Bug Sweep

**Audit date:** 2026-08-03  
**Audit branch:** `audit/exhaustive-bug-sweep-20260803`  
**Target branch:** `build-skymourn`  
**Status:** In progress

## Scope

The sweep covers all repository-controlled application source, model modules, routing, specimen data, tests, build and lint configuration, workflow configuration, runtime manifests, documentation, accessibility paths, Three.js lifecycle behavior, export behavior, responsive UI, and validation evidence.

## Evidence rules

- Confirmed bugs require direct source contradiction, deterministic validation failure, or reproducible runtime evidence.
- Suspected risks remain separate until verified.
- A successful build does not prove browser interaction, accessibility, visual correctness, or resource stabilization.
- The audit will use at most one bounded repair pass per discovered defect cluster, followed by an independent resweep.

## Coverage state

- [x] Repository and branch identity
- [x] Operational state and project contract
- [x] File inventory
- [x] Package, TypeScript, ESLint, and workflow configuration
- [x] Application state and primary UI source
- [x] Examination chamber and shared model utilities
- [x] Archive utilities and existing tests
- [ ] All procedural model modules
- [ ] Specimen registry and configuration reconciliation
- [ ] Runtime manifests and documentation reconciliation
- [ ] Automated validation
- [ ] Browser and device validation
- [ ] Independent resweep

## Current findings

The complete defect ledger will be finalized after automated validation and the second sweep. Current confirmed clusters include reduced-motion behavior, remote runtime font loading, model animation ownership, mobile hidden-panel focusability, modal focus containment, stale three-record documentation/manifests, and missing current-revision validation evidence.
