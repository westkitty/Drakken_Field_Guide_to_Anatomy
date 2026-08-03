# Drakken Field Anatomy Archive — Design System & Visual Specification

## 1. Aesthetic Direction & POV
The **Drakken Field Anatomy Archive** is a classified, high-density forensic workstation set in **Zentrum Vault 9**. Its aesthetic balances **Classified Archival Editorial** typography with **3D Containment Grid Visualization**.

- **Primary Canvas**: Deep near-black navy (`#05080f`) with radial ambient lighting.
- **Surface Elevation**: Semi-transparent dark glass panels (`rgba(10, 15, 25, 0.88)` with `18px` backdrop blur).
- **Hairline Framing**: 1px subtle borders (`rgba(162, 176, 188, 0.14)`) with high-contrast active states (`#7ed6f8`).

---

## 2. Typography Hierarchy

| Role | Font Family | Spec / Weight | Letter Spacing | Usage |
|---|---|---|---|---|
| **Editorial Serif** | `Cinzel`, Georgia, serif | 600 SemiBold / 700 Bold | `0.08em` uppercase | Primary Headings (`h1`, `h2`), Archive Titles, Specimen Designations |
| **Interface Sans** | `Outfit`, system-ui, sans-serif | 400 Regular / 500 Medium / 600 SemiBold | Standard | Body text, incident descriptions, tab navigation, buttons |
| **Technical Mono** | `JetBrains Mono`, monospace | 400 Regular / 500 Medium / 600 SemiBold | `0.05em` | Metadata fields, archive IDs, status badges, diagnostics metrics, `<kbd>` hints |

---

## 3. Color Tokens & Palette

### Core Archival Theme
- `--bg`: `#05080f` (Vault depth background)
- `--bg-subtle`: `#080c14` (Sub-surface layer)
- `--panel`: `rgba(10, 15, 25, 0.88)` (Glassmorphism backdrop)
- `--panel-solid`: `#0b111d` (Opaque fallback panel)
- `--panel-accent`: `#121929` (Interactive surface)
- `--line`: `rgba(162, 176, 188, 0.14)` (Hairline grid border)
- `--line-strong`: `rgba(162, 176, 188, 0.28)` (Focus outline)
- `--line-glow`: `rgba(126, 214, 248, 0.35)` (Selection aura)

### Archetype & Specimen Accents
- `--cyan-frost`: `#7ed6f8` (Atmos-Engines / Default containment)
- `--ember-orange`: `#e05a2b` (Crust-Binders / Magma core)
- `--crimson-heat`: `#9e2626` (Civiformers / Furnace maws)
- `--moon-gold`: `#c4a359` (Orbital-Wyrms / Archival badges)
- `--soft-violet`: `#8a85b6` (Noosphere-Cantors / Telepathic fields)
- `--bio-green`: `#4a6b38` (Seedcarriers / Organic spores)
- `--saline-blue`: `#1e405b` (Fluxborne / Deep sea trench)

---

## 4. UI Components & Layout Blueprint

### Header Masthead
- **Left**: Eyebrow badge `Zentrum Vault 9 / Recovered intelligence interface` + `Drakken Field Anatomy Archive` (`h1` in Cinzel).
- **Right**: Dynamic specimen count (`59 records`), world scale calibration (`1m per unit`), active specimen evidence badge.

### Primary Examination Chamber (`#examination-chamber`)
- **Viewport**: Three.js WebGL canvas with dynamic point lights, ambient fog (`#05080f`), shadow mapping, and `ArchivalContainmentPlatform`.
- **Top Controls**: Camera perspective/orthographic toggle, 5 preset camera positions (`Front`, `Side`, `Dorsal`, `Ventral`, `3/4`), wireframe/silhouette toggles, and quality scaling.
- **Bottom HUD**: Interactive Keyboard Shortcut pill bar (`R`, `Space`, `Esc`, `Click+Drag`).

### Sidebar Panels
- **Registry Drawer** (`.registry-panel`): Search input, category filter buttons, evidence status filter buttons, scrollable specimen card list with threat levels and dimensions.
- **Record Drawer** (`.record-panel`): Tabbed dossier (`record`, `incident`, `military`, `civic`, `sources`), anchored 3D annotations, and Markdown/JSON export buttons.
- **Diagnostics Overlay** (`.diagnostics-panel`): Real-time WebGL memory statistics (geometries, textures, draw calls, triangles, rendering tier).

---

## 5. Accessibility & Motion Rules
- **Reduced Motion**: Automatically disables non-essential rotation animations when `(prefers-reduced-motion: reduce)` is detected.
- **Keyboard Navigation**: Full `aria-pressed`, `aria-expanded`, and `aria-live` regions. `Esc` closes all drawers, `Space` toggles playback, `R` resets camera.
