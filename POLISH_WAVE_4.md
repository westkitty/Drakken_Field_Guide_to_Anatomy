# Product Polish Wave 4

This fourth pass is additive. It does not recount the first 111 polish improvements or 30 adversarial repairs. It preserves the closed 59-record registry, canon, dedicated model routes, renderer architecture, hidden-at-rest shell, and all examination tools.

## Initial implementation — 60 new improvements

### Control precision and feedback

1. Standardized transition rhythm across compact controls.
2. Added tactile pressed feedback without moving surrounding layout.
3. Added honest disabled cursor treatment.
4. Added pointer affordance to enabled controls.
5. Unified component focus halos.
6. Rebuilt the skip link as a clear keyboard escape route.
7. Clarified the drawer scrim as a dismiss surface.
8. Standardized modal close-control geometry.
9. Improved panel-heading action alignment.
10. Added restrained drawer-heading depth separation.
11. Strengthened Registry field-label hierarchy.
12. Improved Registry placeholder contrast.
13. Differentiated idle and focused search borders.
14. Enlarged the clear-search hit area.
15. Normalized filter-row wrap rhythm.
16. Stabilized filter-chip height and padding.
17. Added non-color active-filter treatment.
18. Separated Registry count from reset action.
19. Improved specimen-card internal spacing.
20. Added an active-specimen inner frame.

### Registry, Tools, and dossier hierarchy

21. Separated specimen designation from archive ID.
22. Presented archive IDs as technical capsules.
23. Aligned metadata as paired rows.
24. Strengthened threat and availability emphasis.
25. Separated evidence from source-status copy.
26. Strengthened the empty-state recovery action.
27. Refined the Tools reset control.
28. Arranged primary tool clusters in a responsive grid.
29. Added a technical rail to tool-cluster headings.
30. Stabilized tool-control heights.
31. Made active toggles appear physically engaged.
32. Refined axis controls as a segmented group.
33. Presented layer toggles as anatomy cards.
34. Protected secondary layer descriptions from overflow.
35. Added a non-color active rail to visible anatomy layers.
36. Aligned range labels with live outputs.
37. Improved slider manipulation feedback.
38. Unified select focus with Registry focus.
39. Normalized action-row wrapping.
40. Presented measurement guidance as a technical readout.
41. Contained the active-mode rail without creating another toolbar.
42. Separated record evidence from descriptive prose.
43. Strengthened selected record-tab hierarchy.
44. Added reliable record-content opening rhythm.
45. Standardized term/value card alignment.
46. Strengthened record-value typography.
47. Normalized article heading and ending rhythm.
48. Added restrained civic-response accents.
49. Numbered source cards for scan order.
50. Established a clear annotation-section boundary.
51. Refined annotation utility actions.
52. Made export inclusion unambiguous.
53. Structured annotation metadata as a readable grid.
54. Presented export actions as the dossier completion group.
55. Added subtle Diagnostics row striping.
56. Added a classified-document briefing accent.
57. Strengthened the briefing acknowledgement action.
58. Clarified loading and error action hierarchy.
59. Kept status feedback clear of viewport safe areas.
60. Added constrained-device, coarse-pointer, motion, transparency, contrast, and forced-colors protections.

## Adversarial critique

The initial 60-item wave passed the source/build gate but failed the existing narrow-screen browser audit. Source inspection and generated Registry, Tools, Record, and mobile screenshots then identified ten actionable defects:

1. **Major, screenshot-discovered:** the skip link was permanently visible and covered the upper-left viewport instead of appearing only on keyboard focus.
2. **Major, screenshot-discovered:** the desktop Camera and Render tool clusters collided because a two-column grid conflicted with inherited minimum-content sizing.
3. **Major, measured:** the narrow Record drawer retained five pixels of horizontal overflow from negative-edge heading and export treatments.
4. **Major:** late fourth-wave close-control sizing overrode the existing 44-pixel coarse-pointer target.
5. **Moderate, screenshot-discovered:** the generic active-state marker added a redundant dot to the already framed active specimen card.
6. **Major, screenshot-discovered:** long paired specimen metadata values exceeded their available card width.
7. **Major, source and browser-discovered:** the status toast inherited competing anchor rules and its hidden entrance offset left only four pixels of viewport clearance.
8. **Moderate, source-discovered:** mobile right padding incorrectly reused the left safe-area inset.
9. **Moderate, source-discovered:** the ultra-narrow annotation layout declared grid columns without actually switching the container to grid.
10. **Moderate:** export actions retained minimum-content pressure capable of widening narrow drawers.

## Implemented adversarial repairs

- **W4-A01** — Keep the skip link off-screen at rest and reveal it immediately on keyboard focus.
- **W4-A02** — Collapse primary tool clusters into a contained non-colliding grid and permit internal wrapping.
- **W4-A03** — Remove measured negative-edge overflow from narrow Record headings and export actions while retaining a five-column contained tab strip.
- **W4-A04** — Restore 44-pixel close targets for coarse pointers after the full cascade.
- **W4-A05** — Remove the redundant generic active-card marker.
- **W4-A06** — Constrain paired specimen metadata with shrinkable columns and deliberate narrow-screen wrapping.
- **W4-A07** — Use one lower-right toast anchor system and preserve safe-area clearance through entrance motion.
- **W4-A08** — Apply left and right physical safe-area insets directionally.
- **W4-A09** — Activate a real two-column annotation action grid, collapsing to one column below 340 pixels.
- **W4-A10** — Allow export actions to shrink without forcing horizontal overflow.

## Validation evidence

Application and repair source through `a49bc91cb6f389edff562389e4b1951087419078` passed GitHub Actions run `30883838602`:

- locked dependency installation;
- strict static audit;
- TypeScript;
- zero-warning ESLint;
- Vitest, including the 60-improvement and 10-repair fourth-wave contract;
- production build;
- the established desktop/mobile product-polish browser audit;
- the dedicated wave-three browser audit;
- the new dedicated wave-four browser audit.

The wave-four browser audit verifies:

- `polish-wave4.css` and `polish-wave4-repairs.css` are active;
- the skip link is off-screen at rest and immediately visible on keyboard focus;
- the status toast remains inside the lower-right viewport safe area;
- active Registry cards and paired metadata remain contained;
- the redundant active-card marker is absent;
- desktop Camera and Render clusters do not collide or overflow;
- the narrow Record drawer and five-tab strip do not overflow;
- coarse-pointer close targets retain at least 44 × 44 pixels when emulated;
- ultra-narrow annotation actions use the intended grid;
- actionable page and console errors are zero.

## Screenshot review

The final generated screenshots were inspected after all automated checks. They show:

- a contained Registry with stronger labels, filter hierarchy, technical ID capsules, and no active-card marker noise;
- a desktop Tools sheet with non-colliding Camera and Render groups, stable control geometry, anatomy cards, and clearer technical readouts;
- a 390-pixel Record drawer with contained tabs, full-width term/value cards, readable long values, and no horizontal leak;
- no visible skip link at rest and no controls or feedback surfaces touching viewport edges.

No additional screenshot-discovered defect remained inside this bounded fourth-wave scope.

## Remaining limits

This pass does not establish:

- human art-direction approval for all 59 models;
- native physical-device touch or screen-reader approval;
- manual reduced-data, reduced-transparency, increased-contrast, forced-colors, or safe-area approval;
- target-MacBook load, memory, GPU, or thermal readiness.
