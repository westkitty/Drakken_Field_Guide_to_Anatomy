# Interactive HTML Delivery Contract

## Status correction

The first single-file delivery was rejected during direct user testing in Brave. It rendered a canvas, but that was not sufficient proof of a usable application. The rejected file exhibited three material failures:

- physical pointer interaction could not reliably rotate, pan, or adjust the examination camera;
- React drawer state changed while the final CSS cascade left drawers invisible and translated off-screen;
- the Skymourn reconstruction rendered as an overexposed, poorly framed loop rather than a readable specimen.

That file is superseded. DOM presence, programmatic `.click()`, keyboard-only state changes, and a mounted canvas are no longer accepted as feature-parity proof.

## Required output

```text
dist-interactive-html/Drakken_Field_Guide_Interactive.html
```

Build and statically validate it with:

```bash
npm run build:html
npm run validate:html
```

The packager must inline production JavaScript, compiled CSS, archive data, and referenced local build assets. The delivered file may not contain an external script, stylesheet link, module preload, source-map dependency, remote runtime URL, or unresolved Vite asset path.

## Protected functionality

The downloadable HTML is rejected unless it preserves:

1. A live React Three Fiber / Three.js examination canvas.
2. Physical left-drag orbit interaction.
3. Physical right-drag pan interaction.
4. Physical wheel zoom interaction.
5. A full-viewport canvas that owns the examination hit target.
6. Five visible and targetable edge controls.
7. Physical pointer opening and closing of Registry, Tools, Record, and Diagnostics.
8. Exactly 59 canonical Registry records.
9. Record switching while retaining one canvas.
10. Perspective and orthographic cameras.
11. Front, side, dorsal, ventral, and three-quarter presets.
12. Camera reset.
13. Silhouette and wireframe modes.
14. Standard and reduced renderer quality.
15. Surface, structure, internal, and functional anatomy layers.
16. Layer presets.
17. Sectioning enablement, X/Y/Z axes, inversion, and plane position.
18. Animation selection, play/pause, restart, looping, and playback speed.
19. Measurement mode and measurement-point clearing.
20. Scale references.
21. Annotation inspection and export selection.
22. Registry search and evidence filters.
23. Five Record dossier tabs.
24. Markdown dossier export.
25. JSON dossier export.
26. Diagnostics.
27. Examiner Orientation Briefing.
28. G/T/I/D, Escape, Space, and R keyboard controls.
29. Responsive drawer containment at desktop and mobile sizes.
30. Zero remote runtime requests after download.

## Runtime repairs controlling the current delivery

- `src/components/ExaminationChamber.tsx` explicitly maps mouse and touch gestures and publishes actual camera-state changes for runtime verification.
- `src/runtime-interaction-repair.css` makes the canvas the sole full-screen examination pointer target and keeps decorative overlays noninteractive.
- `src/runtime-drawer-fix.css` removes the broken drawer transition path, forces genuinely open drawers on-screen, and restores edge controls after closure.
- `src/scene/models/SkymournRepairModel.tsx` replaces the rejected Skymourn rendering with a readable dedicated reconstruction using stable closed curves, stronger material separation, clearer facial architecture, structural ribs, internal thermal anatomy, and controlled bounds fitting.

## Automated proof

### Physical runtime gate

`scripts/interactive-html-physical-runtime-fast.mjs` opens the generated artifact through a local `file://` URL without an audit query and performs the same physical path expected from a user:

- confirms Skymourn mounts and completes bounds fitting;
- confirms the canvas occupies the viewport;
- measures all five edge-control boxes and computed visibility;
- uses `elementFromPoint` to ensure each control is not blocked;
- physically clicks Registry, Tools, Record, and Diagnostics;
- confirms each drawer is opaque, interactive, and inside the viewport;
- physically closes each drawer using its visible close control;
- confirms the center examination hit target is the WebGL canvas;
- left-drags the canvas and requires a changed OrbitControls camera state;
- right-drags the canvas and requires a changed camera target/state;
- wheels the canvas and requires a changed camera state;
- rejects remote requests and actionable browser errors.

GitHub Actions run `30928483024` passed this physical runtime gate on product head `9561e9a7ec33ccde4aa4a5686f30f04a85854994`. The recorded state changed from:

```text
perspective|9.4000,7.2000,11.2000|0.0000,0.5500,0.0000|1.0000
```

to distinct orbit, pan, and wheel-adjusted camera states. The same run physically opened all four drawers and measured them on-screen.

### Feature-state gate

`scripts/interactive-html-parity-v2.mjs` independently verifies all 59 records, record switching, camera/render/layer/section/animation/measurement controls, dossier tabs, exports, Diagnostics, briefing, keyboard controls, and isolated mobile containment.

### Polish gates

The current wave-three and wave-four browser audits verify the active responsive and accessibility repair layers. The retired legacy assertion that every handle must be no larger than 34 × 34 pixels is no longer controlling: it directly conflicted with the user requirement that controls be visible and usable.

## Honest completion boundary

Automated physical input is stronger than DOM-state testing, but Andrew's next Brave retest remains the final acceptance check for his actual browser, display, and input hardware. Until that retest succeeds, the delivery state is **technically verified, user acceptance pending**.

The single-file package is necessarily large because it contains the complete 59-record application and runtime libraries. Functionality may not be removed merely to suppress the bundle-size warning.
