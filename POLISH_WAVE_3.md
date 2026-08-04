# Product Polish Wave 3

This third pass is additive. It does not recount the first 79 polish improvements or 22 adversarial repairs. It preserves the closed 59-record registry, canon, dedicated model routes, renderer architecture, hidden-at-rest shell, and examination tools.

## Initial implementation — 32 new improvements

1. Coherent dark native-control color scheme.
2. Consistent accent and caret color.
3. Removed distracting tap flashes.
4. Selectable archive content separated from nonselectable control chrome.
5. Standardized keyboard focus treatment.
6. Refined keyboard shortcut keycaps.
7. Stable tabular numerals for identifiers, metrics, and outputs.
8. Consistent archive-identifier typography.
9. Non-color evidence-state markers.
10. Better long-copy wrapping and hyphenation.
11. Controlled long-form reading width.
12. Readable and safely wrappable source references.
13. Improved record-grid scan rhythm.
14. Stronger annotation-detail evidence rail.
15. Keyboard-focus parity for annotation rows.
16. Useful scroll margins for selected content.
17. Drawer scroll padding around sticky chrome.
18. Refined sticky-heading edge separation.
19. Consistent specimen-card focus elevation.
20. More scannable active-mode chips.
21. Better status-toast wrapping.
22. Clearer loading progress treatment.
23. Primary and secondary error-action hierarchy.
24. Numbered orientation topics.
25. Equalized orientation-item height and rhythm.
26. Refined record-tab overflow and selected depth.
27. Compact technical output readouts.
28. Safer select truncation and width behavior.
29. Responsible short-desktop compaction.
30. Landscape-mobile tools-sheet adaptation.
31. Ultra-narrow control clipping protection.
32. Reduced-data surface simplification.

## Adversarial critique

The initial implementation passed static audit, TypeScript, lint, tests, production build, and the established desktop/mobile browser audit in GitHub Actions run `30881577215`. It was then reviewed against the live CSS cascade and generated Registry, Tools, Record, and mobile screenshots rather than accepted because CI was green.

The review found eight actionable defects:

1. **Major, screenshot-discovered:** all five edge handles remained visible above the modal scrim and intruded over Registry filters, the Record drawer, and the mobile Tools sheet.
2. **Moderate:** the generic non-color active marker leaked into selected record tabs even though tabs already had an underline and selected border.
3. **Major, screenshot-discovered:** automatic hyphenation split ordinary dossier words in the narrow Record drawer and reduced readability.
4. **Moderate:** the global focus outline stacked with the Registry search component’s focus-within shadow, producing a visually excessive double focus treatment.
5. **Moderate:** the record-tab edge mask faded labels even when all labels fit without overflow.
6. **Major:** mobile record term/value pairs retained a desktop two-column layout and became unnecessarily cramped.
7. **Moderate:** numbered orientation items consumed too much copy width below 360 pixels.
8. **Major, evidence defect:** the existing browser audit did not prove that `polish-wave3.css`, its repair layer, or any third-wave behavior was active.

## Implemented adversarial repairs

- **W3-A01** — Hide all global edge handles whenever a drawer or briefing is open; restore them after closure.
- **W3-A02** — Remove the generic active-state dot from selected Record tabs.
- **W3-A03** — Disable automatic hyphenation in dossier, annotation, civic, and source copy.
- **W3-A04** — Preserve component-owned Registry search focus styling without a doubled outline.
- **W3-A05** — Remove the permanent Record-tab mask.
- **W3-A06** — Stack mobile record terms and values into readable single-column cards.
- **W3-A07** — Remove orientation numbering below 360 pixels.
- **W3-A08** — Preserve explicit focus outlines in increased-contrast and forced-colors modes.

## Validation evidence

Application and repair source through `51844ee6d54741206dd01f8dc11a7bf9d914c0c3` passed GitHub Actions run `30881813041`:

- locked dependency installation;
- strict static audit;
- TypeScript;
- zero-warning ESLint;
- Vitest, including the 32-improvement and 8-repair wave-three contract;
- production build;
- the established desktop/mobile browser audit;
- a new dedicated wave-three browser audit.

The exact current branch head `14c009bfa1a7b9281f29c13bd51cd5289fbe2fe5`, including the final ledger and Operational State update, passed the same complete gate in GitHub Actions run `30882190842`.

The dedicated browser audit verifies:

- `polish-wave3.css` and `polish-wave3-repairs.css` are active;
- dark native controls and refined keycaps are active;
- global edge handles are hidden above every open modal surface;
- Registry search retains its component focus treatment without a second outline;
- evidence badges include non-color markers;
- selected Record tabs do not inherit the generic active dot;
- dossier copy avoids automatic hyphenation;
- 390-pixel mobile record fields stack without horizontal overflow;
- actionable page and console errors are zero.

## Screenshot review

The final generated screenshots were reviewed after the automated audit. They show:

- a clean Registry drawer with no handles crossing filters or cards;
- a Record drawer with an undisturbed selected tab, unsplit prose, and clear term/value rhythm;
- a 390-pixel Record drawer with stacked field cards and no hidden global controls;
- preserved hidden-at-rest model-first behavior when drawers are closed.

No additional screenshot-discovered defect remained inside this bounded wave-three scope.

## Remaining limits

This pass does not establish:

- human art-direction approval for all 59 models;
- native physical-device touch or screen-reader approval;
- manual reduced-data, increased-contrast, forced-colors, or sub-360-pixel device approval;
- target-MacBook load, memory, GPU, or thermal readiness.
