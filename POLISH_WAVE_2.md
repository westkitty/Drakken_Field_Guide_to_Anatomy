# Product Polish Wave 2

This second pass is additive. It does not repeat the first 40-item polish ledger, change the closed 59-record registry, alter canon, replace dedicated model routes, add dependencies, or modify renderer architecture.

## Initial implementation — 39 new improvements

1. High-legibility archive text selection.
2. Restrained raised-surface and glow tokens.
3. Balanced display headings.
4. Improved dossier paragraph wrapping.
5. Precise drawer inner edges.
6. Refined scrollbar tracks and thumbs.
7. Stronger sticky-heading depth boundary.
8. Polished close controls.
9. Visual registry-search affordance.
10. Strong registry focus-within feedback.
11. Clear-search micro-control finish.
12. Quiet filter-group dividers.
13. Segmented filter chips.
14. Registry-summary depth boundary.
15. Improved registry-result rhythm.
16. Elevated specimen-card surfaces.
17. Luminous active-record marker.
18. Stable card metadata truncation.
19. Refined pending-record pulse.
20. Purposeful empty-state visual anchor.
21. Refined tools-sheet grab handle.
22. Compact primary control surfaces.
23. Stronger tool-panel hierarchy.
24. Custom range tracks and thumbs.
25. Consistent select chevrons.
26. Intentional disabled-control treatment.
27. Non-color active-state markers.
28. Refined active-mode rail.
29. Segmented record-tab navigator.
30. Card surfaces for record content.
31. Stronger annotation row and detail hierarchy.
32. Clearly separated dossier export footer.
33. Aligned diagnostics values.
34. Status-toast lifetime indicator.
35. Loading shimmer and error severity accent.
36. Refined orientation briefing surfaces.
37. Mobile record-tab scroll snapping.
38. Compact mobile specimen cards.
39. Refined mobile tools spacing.

## Adversarial critique

The initial wave passed the existing static, build, test, and browser gates on commit `5d394a2c26cdcf640dff864d222ac626c1364f9c`. It was then reviewed against the actual stylesheet cascade, narrow/mobile/accessibility conditions, and generated screenshots rather than accepted on those passes alone. The review found eleven actionable problems:

1. **Blocker:** `polish-legibility.css` existed and contained the verified scrim/drawer stacking repair, but `main.tsx` did not load it at the current PR head. The repository narrative therefore outran the active cascade.
2. **Major:** the first sticky export footer could cover final annotation content because the record drawer did not reserve footer space.
3. **Major:** active-state marker dots participated in inline layout and could change button width when toggled.
4. **Major:** hover elevation was inappropriate on coarse pointers and the smallest close/search controls remained too small for direct touch.
5. **Major:** sticky record tabs and a sticky export footer consumed too much vertical space on very narrow screens.
6. **Major:** card pulse, panel shimmer, hover lift, and toast lifetime animation needed an explicit reduced-motion repair.
7. **Major:** translucent surfaces and backdrop blur needed an opaque reduced-transparency path.
8. **Moderate:** borders and muted copy remained too soft for users requesting increased contrast.
9. **Major:** custom gradients, select arrows, pseudo-elements, and shadows needed a forced-colors fallback rather than fighting system colors.
10. **Major, screenshot-discovered:** even with reserved space, the sticky export footer visibly covered the annotation-detail surface in the captured record drawer. The approach itself was wrong and had to be revised rather than padded further.
11. **Major, screenshot-discovered:** the mobile Tools sheet clipped camera controls and the functional anatomy control at the right edge. Internal horizontal scrolling technically existed but did not produce a polished or discoverable result.

## Implemented adversarial repairs

- **W2-A01** — Load the orphaned legibility layer.
- **W2-A02** — Reserve content space beneath the initial sticky export footer.
- **W2-A03** — Absolutely anchor active-state dots.
- **W2-A04** — Remove hover lift and enlarge micro-controls on coarse pointers.
- **W2-A05** — Release sticky record chrome below 520 px.
- **W2-A06** — Disable decorative motion under reduced-motion preferences.
- **W2-A07** — Provide opaque reduced-transparency surfaces.
- **W2-A08** — Increase border and muted-text contrast when requested.
- **W2-A09** — Restore native system presentation in forced-colors mode.
- **W2-A10** — Replace the overlapping sticky export footer with an in-flow footer.
- **W2-A11** — Wrap mobile tool groups and use a two-column anatomy layer grid.

## Validation evidence

Application source through `51fb122fef485e97f22744e377f39c95a67cd8f5` passed GitHub Actions run `30880875699`:

- locked dependency installation;
- strict static audit;
- TypeScript;
- zero-warning ESLint;
- Vitest, including the 39-improvement and 11-repair contract;
- production build;
- expanded desktop/mobile product-polish browser audit.

The expanded browser audit verified:

- all wave-two, repair, and legibility stylesheets are active;
- the interface remains hidden at rest with five compact reveal handles;
- Registry and Tools surfaces are sharp, opaque, contained, and free of horizontal overflow;
- Registry search focus, specimen-card depth, focus trapping, and trigger restoration remain intact;
- custom range, select, panel, and diagnostics treatments are active;
- record-tab keyboard behavior remains intact;
- the export footer is in normal document flow with **zero annotation overlap**;
- the 390 × 844 Tools sheet remains inside the viewport;
- camera/render groups have no internal horizontal overflow;
- the anatomy layer grid uses two contained mobile columns;
- narrow record chrome uses normal flow;
- decorative transitions shut down under reduced motion;
- actionable page and console errors are zero.

The headless runner emitted twenty instances of its known exact SwiftShader WebGL-context warning. Those are recorded and excluded only from this DOM/CSS audit; separate renderer/model evidence remains governing for WebGL behavior.

## Screenshot review

The final evidence screenshots were inspected after the automated checks. They show:

- a sharp Registry surface with focused search, segmented filters, and elevated record cards;
- a contained desktop Tools sheet with clear control grouping and custom ranges;
- a Record drawer where the complete annotation detail is visible before the in-flow export footer, with no overlay;
- a 390-pixel mobile Tools sheet where camera controls wrap, render controls remain visible, and all four anatomy controls fit in a two-column grid.

No further screenshot-discovered polish defect was found in this bounded pass.

## Remaining limits

This technical polish pass does not establish:

- human art-direction approval for all 59 models;
- physical-device touch, screen-reader, reduced-transparency, increased-contrast, or forced-colors approval;
- target-MacBook load, memory, GPU, or thermal readiness.
