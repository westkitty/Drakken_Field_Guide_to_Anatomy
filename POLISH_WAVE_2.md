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

## Validation contract

The permanent browser audit must prove:

- the wave-two, repair, and legibility stylesheets are active;
- the drawer content surface is opaque and has no backdrop blur;
- the registry search focus surface has a visible emphasis treatment;
- record tabs retain their desktop navigation treatment;
- the export footer remains in normal document flow and does not overlap the annotation detail;
- the mobile Tools sheet remains inside the viewport;
- mobile camera/render groups and the anatomy layer grid do not clip horizontally;
- narrow/mobile record tabs release sticky positioning;
- reduced-motion disables the new decorative transitions;
- no actionable page or console error is introduced.

Human art direction, physical-device accessibility, and target-device performance remain separate approvals.
