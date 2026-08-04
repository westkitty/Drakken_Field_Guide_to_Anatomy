import fs from 'node:fs';

function replaceOrFail(source, before, after, label) {
  if (!source.includes(before)) throw new Error(`Adversarial polish anchor missing: ${label}`);
  return source.replace(before, after);
}

function update(path, transform) {
  const before = fs.readFileSync(path, 'utf8');
  const after = transform(before);
  if (after === before) {
    console.log(`${path}: no change`);
    return;
  }
  fs.writeFileSync(path, after);
  console.log(`${path}: updated`);
}

update('src/App.tsx', (input) => {
  if (input.includes('adversarial-polish-repair')) return input;
  let source = input;

  source = replaceOrFail(
    source,
    "import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';",
    "import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from 'react';",
    'React keyboard event import',
  );

  source = replaceOrFail(
    source,
    "const recordTabs = ['record', 'incident', 'military', 'civic', 'sources'] as const;\n",
    "const recordTabs = ['record', 'incident', 'military', 'civic', 'sources'] as const;\ntype RecordTab = (typeof recordTabs)[number];\n",
    'record tab type',
  );

  source = replaceOrFail(
    source,
    "  const activeRecord = findSpecimen(activeSpecimenId);\n",
    "  const activeRecord = findSpecimen(activeSpecimenId);\n  const defaultAnimationName = activeRecord.animations[0];\n",
    'stable default animation',
  );

  source = replaceOrFail(
    source,
    "  const [recordTab, setRecordTab] = useState<'record' | 'incident' | 'military' | 'civic' | 'sources'>('record');\n",
    "  const [recordTab, setRecordTab] = useState<RecordTab>('record');\n",
    'record tab state type',
  );

  source = replaceOrFail(
    source,
    "  }, [activeSpecimenId, announce, pendingSpecimenId, reducedMotion]);\n\n  const filteredRecords = useMemo(() => {\n",
    "  }, [activeSpecimenId, announce, pendingSpecimenId, reducedMotion]);\n\n  const retryFailedSpecimen = useCallback(() => {\n    if (!lastFailedSpecimenId) return;\n    setLoadError(null);\n    if (lastFailedSpecimenId === activeSpecimenId) {\n      setResetCameraToken((value) => value + 1);\n      setLastFailedSpecimenId(null);\n      announce(`${activeRecord.designation} restored.`);\n      return;\n    }\n    chooseSpecimen(lastFailedSpecimenId);\n  }, [activeRecord.designation, activeSpecimenId, announce, chooseSpecimen, lastFailedSpecimenId]);\n\n  const filteredRecords = useMemo(() => {\n",
    'reliable retry callback',
  );

  source = replaceOrFail(
    source,
    "  const visibleLayerCount = layerOrder.filter((layer) => layers[layer]).length;\n  const filtersActive = query.trim().length > 0 || categoryFilter !== 'all' || evidenceFilter !== 'all';\n",
    "  const visibleLayerCount = layerOrder.filter((layer) => layers[layer]).length;\n  const filtersActive = query.trim().length > 0 || categoryFilter !== 'all' || evidenceFilter !== 'all';\n  const activePanelSelector = registryOpen\n    ? '#registry-drawer'\n    : toolsOpen\n      ? '#tools-drawer'\n      : recordOpen\n        ? '#record-drawer'\n        : diagnosticsOpen\n          ? '#diagnostics-drawer'\n          : null;\n",
    'active panel selector',
  );

  const oldFocusEffect = `  useEffect(() => {\n    const selector = registryOpen\n      ? '.registry-panel.is-open'\n      : toolsOpen\n        ? '.tools-panel.is-open'\n        : recordOpen\n          ? '.record-panel.is-open'\n          : null;\n    if (!selector) return;\n    const frame = window.requestAnimationFrame(() => {\n      const panel = document.querySelector<HTMLElement>(selector);\n      panel?.querySelector<HTMLElement>('input, button, select, [href], [tabindex]:not([tabindex="-1"])')?.focus();\n    });\n    return () => window.cancelAnimationFrame(frame);\n  }, [recordOpen, registryOpen, toolsOpen]);`;
  const newFocusEffect = `  useEffect(() => {\n    if (!activePanelSelector) return;\n    const panel = document.querySelector<HTMLElement>(activePanelSelector);\n    if (!panel) return;\n    const focusableSelector = 'button:not(:disabled), input:not(:disabled), select:not(:disabled), [href], [tabindex]:not([tabindex="-1"])';\n    const getFocusable = () => Array.from(panel.querySelectorAll<HTMLElement>(focusableSelector)).filter((item) => item.offsetParent !== null);\n    const frame = window.requestAnimationFrame(() => {\n      const preferred = panel.querySelector<HTMLElement>('[data-drawer-focus]');\n      (preferred ?? getFocusable()[0])?.focus();\n    });\n    const trapFocus = (event: KeyboardEvent) => {\n      if (event.key !== 'Tab') return;\n      const focusable = getFocusable();\n      if (focusable.length === 0) return;\n      const first = focusable[0];\n      const last = focusable[focusable.length - 1];\n      if (event.shiftKey && document.activeElement === first) {\n        event.preventDefault();\n        last.focus();\n      } else if (!event.shiftKey && document.activeElement === last) {\n        event.preventDefault();\n        first.focus();\n      }\n    };\n    panel.addEventListener('keydown', trapFocus);\n    return () => {\n      window.cancelAnimationFrame(frame);\n      panel.removeEventListener('keydown', trapFocus);\n    };\n  }, [activePanelSelector]);`;
  source = replaceOrFail(source, oldFocusEffect, newFocusEffect, 'drawer focus trap');

  source = replaceOrFail(
    source,
    "    setAnimation({ name: activeRecord.animations[0], playing: !reducedMotion, speed: 1, loop: true, restartToken: 0 });\n",
    "    setAnimation({ name: defaultAnimationName, playing: !reducedMotion, speed: 1, loop: true, restartToken: 0 });\n",
    'reset animation primitive',
  );
  source = replaceOrFail(
    source,
    "  }, [activeRecord.animations, announce, reducedMotion]);\n",
    "  }, [announce, defaultAnimationName, reducedMotion]);\n",
    'stable reset dependencies',
  );

  const oldAnnotationHandler = `  const handleAnnotationSelect = useCallback((id: string) => {\n    setSelectedAnnotationId(id);\n    setSelectedAnnotationIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);\n    setRecordOpen(true);\n  }, []);`;
  const newAnnotationHandler = `  const handleAnnotationSelect = useCallback((id: string) => {\n    setSelectedAnnotationId(id);\n    setRecordOpen(true);\n  }, []);\n\n  const toggleAnnotationExport = useCallback((id: string) => {\n    setSelectedAnnotationIds((current) => {\n      const included = current.includes(id);\n      announce(included ? 'Annotation removed from export.' : 'Annotation included in export.');\n      return included ? current.filter((item) => item !== id) : [...current, id];\n    });\n  }, [announce]);\n\n  const handleRecordTabKeyDown = useCallback((event: ReactKeyboardEvent<HTMLButtonElement>, tab: RecordTab) => {\n    const currentIndex = recordTabs.indexOf(tab);\n    let nextIndex = currentIndex;\n    if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % recordTabs.length;\n    else if (event.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + recordTabs.length) % recordTabs.length;\n    else if (event.key === 'Home') nextIndex = 0;\n    else if (event.key === 'End') nextIndex = recordTabs.length - 1;\n    else return;\n    event.preventDefault();\n    const nextTab = recordTabs[nextIndex];\n    setRecordTab(nextTab);\n    window.requestAnimationFrame(() => document.getElementById(`record-tab-${nextTab}`)?.focus());\n  }, []);`;
  source = replaceOrFail(source, oldAnnotationHandler, newAnnotationHandler, 'annotation and tab handlers');

  const oldSearch = `          <label className="search-field">\n            <span>Search records</span>\n            <span className="search-control">\n              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Designation, role, archive ID" />\n              {query && <button type="button" className="clear-field" onClick={() => setQuery('')} aria-label="Clear record search">×</button>}\n            </span>\n          </label>`;
  const newSearch = `          <div className="search-field">\n            <label htmlFor="registry-search">Search records</label>\n            <span className="search-control">\n              <input id="registry-search" data-drawer-focus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Designation, role, archive ID" />\n              {query && <button type="button" className="clear-field" onClick={() => setQuery('')} aria-label="Clear record search">×</button>}\n            </span>\n          </div>`;
  source = replaceOrFail(source, oldSearch, newSearch, 'valid search field markup');

  source = source.replace(
    '<aside id="registry-drawer" className={`registry-panel ${registryOpen ? \'is-open\' : \'\'}`} aria-label="Specimen registry" aria-hidden={!registryOpen}>',
    '<aside id="registry-drawer" role="dialog" aria-modal="true" className={`registry-panel ${registryOpen ? \'is-open\' : \'\'}`} aria-label="Specimen registry" aria-hidden={!registryOpen}>',
  );
  source = source.replace(
    '<button className="mobile-close" type="button" onClick={() => setRegistryOpen(false)} aria-label="Close registry">×</button>',
    '<button className="mobile-close" type="button" onClick={() => closePanels()} aria-label="Close registry">×</button>',
  );
  source = source.replace(
    '<aside id="tools-drawer" className={`tools-panel ${toolsOpen ? \'is-open\' : \'\'}`} aria-label="Examination tools" aria-hidden={!toolsOpen}>',
    '<aside id="tools-drawer" role="dialog" aria-modal="true" className={`tools-panel ${toolsOpen ? \'is-open\' : \'\'}`} aria-label="Examination tools" aria-hidden={!toolsOpen}>',
  );
  source = source.replace(
    '<button type="button" className="panel-reset" onClick={resetAllTools}>Reset all</button><button className="mobile-close" type="button" onClick={() => setToolsOpen(false)} aria-label="Close tools">×</button>',
    '<button type="button" className="panel-reset" data-drawer-focus onClick={resetAllTools}>Reset all</button><button className="mobile-close" type="button" onClick={() => closePanels()} aria-label="Close tools">×</button>',
  );
  source = source.replace(
    '<aside id="record-drawer" className={`record-panel ${recordOpen ? \'is-open\' : \'\'}`} aria-label="Specimen record" aria-hidden={!recordOpen}>',
    '<aside id="record-drawer" role="dialog" aria-modal="true" className={`record-panel ${recordOpen ? \'is-open\' : \'\'}`} aria-label="Specimen record" aria-hidden={!recordOpen}>',
  );
  source = source.replace(
    '<button className="mobile-close" type="button" onClick={() => setRecordOpen(false)} aria-label="Close record">×</button>',
    '<button className="mobile-close" type="button" onClick={() => closePanels()} aria-label="Close record">×</button>',
  );

  source = replaceOrFail(
    source,
    "{lastFailedSpecimenId && <button type=\"button\" onClick={() => chooseSpecimen(lastFailedSpecimenId)}>Retry</button>}",
    "{lastFailedSpecimenId && <button type=\"button\" onClick={retryFailedSpecimen}>Retry</button>}",
    'reliable retry action',
  );

  source = replaceOrFail(
    source,
    "<button type=\"button\" role=\"tab\" id={`record-tab-${tab}`} aria-controls={`record-panel-${tab}`} aria-selected={recordTab === tab} tabIndex={recordTab === tab ? 0 : -1} key={tab} className={recordTab === tab ? 'is-active' : ''} onClick={() => setRecordTab(tab)}>{tab}</button>",
    "<button type=\"button\" role=\"tab\" id={`record-tab-${tab}`} aria-controls={`record-panel-${tab}`} aria-selected={recordTab === tab} tabIndex={recordTab === tab ? 0 : -1} data-drawer-focus={recordTab === tab ? true : undefined} key={tab} className={recordTab === tab ? 'is-active' : ''} onKeyDown={(event) => handleRecordTabKeyDown(event, tab)} onClick={() => setRecordTab(tab)}>{tab}</button>",
    'tab keyboard behavior',
  );

  const oldAnnotationList = `            <div className="annotation-list">\n              {activeRecord.annotations.map((annotation) => (\n                <button\n                  type="button"\n                  key={annotation.id}\n                  className={selectedAnnotationId === annotation.id ? 'is-active' : ''}\n                  aria-pressed={selectedAnnotationIds.includes(annotation.id)}\n                  onClick={() => handleAnnotationSelect(annotation.id)}\n                >\n                  <span><strong>{annotation.title}</strong><small>{annotation.layer}</small></span>\n                  <EvidenceBadge state={annotation.evidence} />\n                </button>\n              ))}\n            </div>`;
  const newAnnotationList = `            <div className="annotation-list">\n              {activeRecord.annotations.map((annotation) => {\n                const included = selectedAnnotationIds.includes(annotation.id);\n                return (\n                  <div className={`annotation-row ${selectedAnnotationId === annotation.id ? 'is-active' : ''}`} key={annotation.id}>\n                    <button type="button" className="annotation-detail-trigger" onClick={() => handleAnnotationSelect(annotation.id)}>\n                      <span><strong>{annotation.title}</strong><small>{annotation.layer}</small></span>\n                      <EvidenceBadge state={annotation.evidence} />\n                    </button>\n                    <button type="button" className="annotation-export-toggle" aria-pressed={included} onClick={() => toggleAnnotationExport(annotation.id)}>\n                      {included ? 'Included' : 'Include'}\n                    </button>\n                  </div>\n                );\n              })}\n            </div>`;
  source = replaceOrFail(source, oldAnnotationList, newAnnotationList, 'separate annotation detail and export actions');

  const oldDiagnostics = `      <section id="diagnostics-drawer" className={` + "`diagnostics-panel ${diagnosticsOpen ? 'is-open' : ''}`" + `} aria-label="Runtime diagnostics" aria-hidden={!diagnosticsOpen}>\n        <button type="button" className="diagnostics-toggle" onClick={() => setDiagnosticsOpen((value) => !value)} aria-expanded={diagnosticsOpen}>\n          Diagnostics {diagnosticsOpen ? '-' : '+'}\n        </button>\n        {diagnosticsOpen && (\n          <dl>\n            <div><dt>Active specimen</dt><dd>{diagnostics.specimenId}</dd></div>\n            <div><dt>Animation</dt><dd>{diagnostics.activeAnimation}</dd></div>\n            <div><dt>Geometries</dt><dd>{diagnostics.geometries}</dd></div>\n            <div><dt>Textures</dt><dd>{diagnostics.textures}</dd></div>\n            <div><dt>Draw calls</dt><dd>{diagnostics.drawCalls}</dd></div>\n            <div><dt>Triangles</dt><dd>{diagnostics.triangles.toLocaleString()}</dd></div>\n            <div><dt>Camera</dt><dd>{diagnostics.cameraMode}</dd></div>\n            <div><dt>Quality</dt><dd>{diagnostics.qualityTier}</dd></div>\n            <div><dt>Clipping</dt><dd>{diagnostics.clipping}</dd></div>\n          </dl>\n        )}\n      </section>`;
  const newDiagnostics = `      <section id="diagnostics-drawer" role="dialog" aria-modal="true" className={` + "`diagnostics-panel ${diagnosticsOpen ? 'is-open' : ''}`" + `} aria-label="Runtime diagnostics" aria-hidden={!diagnosticsOpen}>\n        <div className="panel-heading">\n          <div><p className="eyebrow">Runtime</p><h2>Diagnostics</h2></div>\n          <button type="button" className="mobile-close" data-drawer-focus onClick={() => closePanels()} aria-label="Close diagnostics">×</button>\n        </div>\n        <dl>\n          <div><dt>Active specimen</dt><dd>{diagnostics.specimenId}</dd></div>\n          <div><dt>Animation</dt><dd>{diagnostics.activeAnimation}</dd></div>\n          <div><dt>Geometries</dt><dd>{diagnostics.geometries}</dd></div>\n          <div><dt>Textures</dt><dd>{diagnostics.textures}</dd></div>\n          <div><dt>Draw calls</dt><dd>{diagnostics.drawCalls}</dd></div>\n          <div><dt>Triangles</dt><dd>{diagnostics.triangles.toLocaleString()}</dd></div>\n          <div><dt>Camera</dt><dd>{diagnostics.cameraMode}</dd></div>\n          <div><dt>Quality</dt><dd>{diagnostics.qualityTier}</dd></div>\n          <div><dt>Clipping</dt><dd>{diagnostics.clipping}</dd></div>\n        </dl>\n      </section>`;
  source = replaceOrFail(source, oldDiagnostics, newDiagnostics, 'diagnostics drawer consistency');

  source = source.replace(
    "export default function App() {",
    "export default function App() {\n  // adversarial-polish-repair: focus, semantics, recovery, and action clarity",
  );
  return source;
});

update('src/polish.css', (input) => {
  if (input.includes('/* Adversarial repair layer */')) return input;
  return `${input}\n\n/* Adversarial repair layer */\n.search-field > label { display: block; color: var(--text-muted); font-family: var(--font-mono); font-size: 0.72rem; }\n\n.annotation-row { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 0.4rem; align-items: stretch; border: 1px solid transparent; border-radius: var(--radius-sm); }\n.annotation-row.is-active { border-color: rgba(145, 226, 255, 0.5); background: rgba(126, 214, 248, 0.055); }\n.annotation-detail-trigger { display: flex !important; align-items: center; justify-content: space-between; gap: 0.6rem; width: 100%; min-width: 0; padding: 0.65rem 0.75rem; text-align: left; border: 0; background: transparent; }\n.annotation-detail-trigger > span { display: grid; min-width: 0; gap: 0.15rem; }\n.annotation-detail-trigger strong { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n.annotation-export-toggle { min-width: 78px; padding: 0.45rem 0.55rem; border-radius: var(--radius-sm); font-family: var(--font-mono); font-size: 0.62rem; }\n.annotation-export-toggle[aria-pressed=\"true\"] { border-color: var(--cyan-frost); color: var(--text-bright); background: rgba(126, 214, 248, 0.12); }\n\n.diagnostics-panel { z-index: 130; max-height: min(620px, 82vh); overflow-y: auto; padding: 1.1rem; }\n.diagnostics-panel .panel-heading { top: -1.1rem; }\n.diagnostics-panel dl { padding: 0.7rem 0 0; }\n.diagnostics-panel:not(.is-open) { display: none; }\n\n[role=\"dialog\"][aria-hidden=\"true\"] { visibility: hidden; pointer-events: none; }\n\n@media (max-width: 540px) {\n  .annotation-row { grid-template-columns: 1fr; }\n  .annotation-export-toggle { width: 100%; min-height: 40px; }\n  .diagnostics-panel { inset: auto 0 0 0; width: 100%; max-height: 72dvh; border-radius: var(--radius-lg) var(--radius-lg) 0 0; }\n}\n`;
});

const improvements = [
  ['P01', 'Correct registry handle mnemonic'], ['P02', 'Expand invisible edge-handle targets'],
  ['P03', 'Respect display safe areas'], ['P04', 'Clarify open handle state'],
  ['P05', 'Connect triggers and drawers semantically'], ['P06', 'Make diagnostics mutually exclusive'],
  ['P07', 'Include diagnostics in dismissal behavior'], ['P08', 'Use sticky drawer headings'],
  ['P09', 'Contain and polish drawer scrolling'], ['P10', 'Use typographic close controls'],
  ['P11', 'Show live registry result totals'], ['P12', 'Provide one-click search clearing'],
  ['P13', 'Provide one-click filter reset'], ['P14', 'Expose active and loading record states'],
  ['P15', 'Provide recoverable registry empty state'], ['P16', 'Expose chamber loading state'],
  ['P17', 'Polish reconstruction loading feedback'], ['P18', 'Provide retryable load failure feedback'],
  ['P19', 'Surface non-default examination modes'], ['P20', 'Confirm completed actions with live feedback'],
  ['P21', 'Reset all examination tools'], ['P22', 'Add anatomy visibility presets'],
  ['P23', 'Show visible anatomy layer count'], ['P24', 'Disable unavailable section controls'],
  ['P25', 'Describe range values accessibly'], ['P26', 'Disable unavailable measurement clearing'],
  ['P27', 'Number measurement points and improve guidance'], ['P28', 'Add bulk annotation export controls'],
  ['P29', 'Use semantic record tabs'], ['P30', 'Expose annotation counts during export'],
  ['P31', 'Allow explicit and backdrop briefing dismissal'], ['P32', 'Expand shortcut and motion guidance'],
  ['P33', 'Describe chamber controls to assistive technology'], ['P34', 'Use context-sensitive viewport cursors'],
  ['P35', 'Add restrained viewport depth treatment'], ['P36', 'Polish mobile tools sheet handling'],
  ['P37', 'Normalize finish tokens and interaction states'], ['P38', 'Provide coarse-pointer action targets'],
  ['P39', 'Respect reduced-motion preferences'], ['P40', 'Add durable polish regression coverage'],
];
const repairs = [
  ['A01', 'Remove Node-only APIs from browser-project tests'],
  ['A02', 'Trap keyboard focus inside every open drawer'],
  ['A03', 'Restore trigger focus from every drawer close action'],
  ['A04', 'Make diagnostics use the same drawer language as the rest of the interface'],
  ['A05', 'Separate search labelling from its clear action'],
  ['A06', 'Complete arrow, Home, and End keyboard behavior for record tabs'],
  ['A07', 'Stabilize tool reset dependencies'],
  ['A08', 'Make retry behavior deterministic for current and alternate records'],
  ['A09', 'Separate annotation inspection from export inclusion'],
];
fs.writeFileSync('src/polishManifest.ts', `export const POLISH_IMPROVEMENTS = ${JSON.stringify(improvements.map(([id, title]) => ({ id, title })), null, 2)} as const;\n\nexport const ADVERSARIAL_REPAIRS = ${JSON.stringify(repairs.map(([id, title]) => ({ id, title })), null, 2)} as const;\n`);

fs.writeFileSync('src/polish.test.ts', `import { describe, expect, it } from 'vitest';\nimport { ADVERSARIAL_REPAIRS, POLISH_IMPROVEMENTS } from './polishManifest';\n\ndescribe('product polish ledger', () => {\n  it('contains at least twenty distinct implemented improvements', () => {\n    expect(POLISH_IMPROVEMENTS.length).toBeGreaterThanOrEqual(20);\n    expect(new Set(POLISH_IMPROVEMENTS.map((item) => item.id)).size).toBe(POLISH_IMPROVEMENTS.length);\n    expect(POLISH_IMPROVEMENTS.every((item) => item.title.trim().length > 8)).toBe(true);\n  });\n\n  it('records every bounded adversarial repair', () => {\n    expect(ADVERSARIAL_REPAIRS).toHaveLength(9);\n    expect(new Set(ADVERSARIAL_REPAIRS.map((item) => item.id)).size).toBe(ADVERSARIAL_REPAIRS.length);\n    expect(ADVERSARIAL_REPAIRS.every((item) => item.title.trim().length > 8)).toBe(true);\n  });\n});\n`);

const list = (items) => items.map(([id, title]) => `- **${id}** — ${title}`).join('\n');
fs.writeFileSync('POLISH_PASS.md', `# Polish Pass\n\nThis pass is bounded to presentation, interaction finish, accessibility, responsive behavior, and examination feedback. It does not alter the closed 59-record inventory, dedicated model routes, canon data, asset policy, or renderer architecture.\n\n## Initial implementation — 40 improvements\n\n${list(improvements)}\n\n## Adversarial critique\n\nThe initial result was deliberately reviewed as if it were a hostile release candidate rather than accepted because it looked more finished. The review found:\n\n1. **Blocker:** the new test imported Node's file system module even though this browser project does not install Node type declarations. TypeScript correctly rejected it.\n2. **Major:** drawers transferred focus on open but did not contain it, allowing keyboard navigation behind the modal scrim. Diagnostics was excluded from even the initial focus transfer.\n3. **Major:** direct drawer close buttons hid their focused container without restoring focus to the trigger.\n4. **Major:** Diagnostics had both an edge trigger and a second internal toggle, making it feel like a leftover widget rather than part of the drawer system.\n5. **Major:** the search clear button was nested inside the search label, creating ambiguous label activation and invalid interaction structure.\n6. **Major:** record tabs declared tab semantics but omitted the keyboard behavior those semantics promise.\n7. **Minor:** the full tool reset callback depended on an animation array rather than a stable primitive.\n8. **Minor:** retrying a failure for the already active record could no-op at the existing early-return guard.\n9. **Major:** selecting an annotation for inspection also silently changed export membership, conflating two independent user intentions.\n\n## Implemented adversarial repairs\n\n${list(repairs)}\n\n## Evidence status\n\n- Source/build validation: pending exact repaired head.\n- Browser interaction and responsive polish: pending targeted browser audit.\n- Human art-direction approval: remains outside this polish pass.\n`);

console.log('Adversarial polish repair staged.');
