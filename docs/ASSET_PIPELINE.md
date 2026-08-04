# Procedural Asset Pipeline

All 59 active specimen assets are project-owned deterministic procedural reconstructions. Their stable IDs come from `src/data/specimens.json` and are recorded in:

- `public/data/assets.json`
- `public/data/provenance.json`
- `public/data/licenses.json`

The ledgers are generated from the canonical record registry and must retain one entry per `modelAssetRef`. Runtime source is routed through `src/scene/SpecimenRouter.tsx` and the dedicated model modules.

External GLB, texture, audio, font, or shader assets must not be added without exact provenance, license, local runtime paths, technical inspection, and disposal validation. Remote hotlinks are prohibited.

Procedural geometry is normalized for chamber inspection. Canon dimensions and visualization metadata must not be silently converted into a physical meter calibration.
