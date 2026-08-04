# Validation

## Automated checks

Run:

```bash
npm run typecheck
npm run lint
npm test
npm run build
node scripts/audit-static.mjs --strict
```

The integrity audit checks the 59-record registry, route coverage, source references, asset/provenance/license ledgers, remote runtime references, clipping coverage, exports, and known accessibility regressions.

## Browser checks still required

For representative records from every family and for all repaired paths:

1. Switch records repeatedly and cancel a pending switch by reselecting the active record.
2. Exercise orbit, pan, zoom, camera presets, and both projection modes.
3. Toggle every anatomy layer independently.
4. Move and invert all three section planes; verify meshes and functional lines section together.
5. Run both animations, pause, restart, loop, and change speed.
6. Use measurement, annotations, evidence filters, exports, diagnostics, mobile drawers, and the orientation dialog with keyboard only.
7. Verify reduced-motion startup, WebGL context loss/restoration messaging, and standard/reduced renderer recreation.
8. Repeat record switching while observing renderer memory for stabilization.

Do not promote browser behavior to verified from build output alone.
