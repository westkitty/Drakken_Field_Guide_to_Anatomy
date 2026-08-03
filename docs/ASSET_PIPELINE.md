# Asset Pipeline

## Current route

No approved GLB files were supplied. The prototype therefore uses deterministic procedural geometry behind the same stable asset contract intended for future GLB replacement.

The three runtime asset IDs are:

- `proc-skymourn-v1`
- `proc-gorevault-v1`
- `proc-blood-ring-v1`

## Canon and visualization boundary

The source dossier defines appearance, operational role, threat, capabilities, incidents, and selected anatomical features. It does not define canonical dimensions, mass, rigging, exact internal anatomy, mesh topology, pivots, or animation clip data.

The application therefore distinguishes:

- confirmed surface features and named operational states;
- reconstructed structural and internal layers;
- demonstration-only functional overlays;
- visualization scale from canonical dimensions.

## Production replacement contract

A future production GLB must preserve:

- stable asset ID;
- meters as runtime units;
- Y-up orientation;
- forward direction of positive Z;
- ground or orbital-center pivot policy from the manifest;
- stable mesh names for all four layers;
- stable animation names already exposed by the interface;
- local runtime URI with no external glTF references;
- declared decoder requirements;
- source hash, runtime hash, ownership evidence, and attribution state;
- explicit unload and AnimationMixer disposal behavior.

Untouched supplied source files must remain outside the public runtime tree.

## Disposal

Procedural geometries and materials are component-owned. Specimen switching unmounts the old keyed specimen and allows React Three Fiber to dispose it. Renderer diagnostics expose geometry, texture, draw-call, and triangle counts so repeated switching can be checked for monotonic growth.

## Known limitations

- No GLB hash exists because no binary runtime asset exists.
- No canonical dimensions or masses are documented.
- Internal anatomy is reconstruction, not canon.
- Browser lifecycle behavior remains unverified until dependencies are installed and the smoke path is run.
