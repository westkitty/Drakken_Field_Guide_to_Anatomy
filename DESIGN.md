# Drakken Field Anatomy Archive — Design System

## Direction

The archive is a classified forensic workstation for Zentrum Vault 9: near-black navy surfaces, restrained glass panels, thin archival rules, high-contrast focus states, and specimen-specific accents.

## Typography

The runtime uses local system font stacks only:

- Editorial serif: Georgia / Times New Roman
- Interface sans: system UI
- Technical mono: SFMono-Regular / Menlo / Monaco / Consolas

Remote font loading is prohibited by the local-only runtime asset policy.

## Layout

- Header: archive identity, record count, evidence state, and briefing access
- Registry: search, category filters, complete evidence filters, and all 59 records
- Chamber: one R3F Canvas, camera controls, sectioning, layers, animation, measurement, annotations, scale aids, and diagnostics
- Record panel: complete dossier and Markdown/JSON export

## Accessibility and motion

- Reduced-motion preference pauses model animation automatically; users may manually resume it.
- Mobile drawers become non-visible and non-interactive when closed.
- The orientation dialog receives focus, traps Tab navigation, closes with Escape, and restores focus.
- Focus states, native controls, semantic headings, labels, live regions, and pressed/expanded states remain required.

## Scale boundary

Specimen geometry and comparison silhouettes are normalized visual aids. Record visualization-height metadata may be displayed as source metadata, but the chamber must not claim a proven meter-per-world-unit calibration.
