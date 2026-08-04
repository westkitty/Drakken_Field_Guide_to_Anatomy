import fs from 'node:fs';

function replaceOrFail(source, before, after, label) {
  if (!source.includes(before)) {
    throw new Error(`Polish patch anchor missing: ${label}`);
  }
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
  if (input.includes('const [statusMessage, setStatusMessage]')) return input;
  let source = input;

  source = replaceOrFail(
    source,
    "const evidenceFilters = ['all', ...evidenceStates.map((state) => state.toLowerCase())];\n",
    "const evidenceFilters = ['all', ...evidenceStates.map((state) => state.toLowerCase())];\nconst defaultLayers: Record<LayerId, boolean> = { surface: true, structure: false, internal: false, functional: false };\nconst defaultClip: ClipState = { enabled: false, axis: 'x', position: 0, inverted: false };\nconst recordTabs = ['record', 'incident', 'military', 'civic', 'sources'] as const;\n",
    'shared defaults',
  );

  source = replaceOrFail(
    source,
    "  const [loadError, setLoadError] = useState<string | null>(null);\n",
    "  const [loadError, setLoadError] = useState<string | null>(null);\n  const [lastFailedSpecimenId, setLastFailedSpecimenId] = useState<string | null>(null);\n",
    'load state',
  );

  source = replaceOrFail(
    source,
    "  const diagnosticsTriggerRef = useRef<HTMLButtonElement>(null);\n  const lastPanelTriggerRef = useRef<HTMLButtonElement | null>(null);\n",
    "  const diagnosticsTriggerRef = useRef<HTMLButtonElement>(null);\n  const lastPanelTriggerRef = useRef<HTMLButtonElement | null>(null);\n  const statusTimerRef = useRef<number | null>(null);\n",
    'status timer ref',
  );

  source = replaceOrFail(
    source,
    "  const [orientationOpen, setOrientationOpen] = useState(false);\n  const [reducedMotion, setReducedMotion] = useState(false);\n",
    "  const [orientationOpen, setOrientationOpen] = useState(false);\n  const [reducedMotion, setReducedMotion] = useState(false);\n  const [statusMessage, setStatusMessage] = useState('');\n",
    'status state',
  );

  source = replaceOrFail(
    source,
    "  const selectedAnnotation = activeRecord.annotations.find((item) => item.id === selectedAnnotationId) ?? null;\n\n  const closePanels = useCallback((restoreFocus = true) => {\n",
    "  const selectedAnnotation = activeRecord.annotations.find((item) => item.id === selectedAnnotationId) ?? null;\n\n  const announce = useCallback((message: string) => {\n    setStatusMessage(message);\n    if (statusTimerRef.current !== null) window.clearTimeout(statusTimerRef.current);\n    statusTimerRef.current = window.setTimeout(() => setStatusMessage(''), 2600);\n  }, []);\n\n  const closePanels = useCallback((restoreFocus = true) => {\n",
    'announce callback',
  );

  source = replaceOrFail(
    source,
    "  useEffect(() => {\n    const media = window.matchMedia('(prefers-reduced-motion: reduce)');\n",
    "  useEffect(() => () => {\n    if (statusTimerRef.current !== null) window.clearTimeout(statusTimerRef.current);\n  }, []);\n\n  useEffect(() => {\n    const media = window.matchMedia('(prefers-reduced-motion: reduce)');\n",
    'timer cleanup',
  );

  source = replaceOrFail(
    source,
    "        setActiveSpecimenId(id);\n        setAnimation({\n",
    "        setActiveSpecimenId(id);\n        setLastFailedSpecimenId(null);\n        setRecordTab('record');\n        setAnimation({\n",
    'specimen load success state',
  );

  source = replaceOrFail(
    source,
    "        setRegistryOpen(false);\n        setToolsOpen(false);\n      } catch (error) {\n        setLoadError(error instanceof Error ? error.message : 'Specimen failed to load.');\n        setPendingSpecimenId(null);\n",
    "        setRegistryOpen(false);\n        setToolsOpen(false);\n        setRecordOpen(false);\n        setDiagnosticsOpen(false);\n        announce(`${record.designation} loaded.`);\n      } catch (error) {\n        setLoadError(error instanceof Error ? error.message : 'Specimen failed to load.');\n        setLastFailedSpecimenId(id);\n        setPendingSpecimenId(null);\n        announce('Specimen load failed.');\n",
    'load feedback',
  );

  source = replaceOrFail(
    source,
    "  }, [activeSpecimenId, pendingSpecimenId, reducedMotion]);\n",
    "  }, [activeSpecimenId, announce, pendingSpecimenId, reducedMotion]);\n",
    'choose specimen dependencies',
  );

  source = replaceOrFail(
    source,
    "  }, [categoryFilter, evidenceFilter, query]);\n\n  useEffect(() => {\n",
    "  }, [categoryFilter, evidenceFilter, query]);\n\n  const visibleLayerCount = layerOrder.filter((layer) => layers[layer]).length;\n  const filtersActive = query.trim().length > 0 || categoryFilter !== 'all' || evidenceFilter !== 'all';\n  const clearRegistryFilters = useCallback(() => {\n    setQuery('');\n    setCategoryFilter('all');\n    setEvidenceFilter('all');\n    announce('Registry filters cleared.');\n  }, [announce]);\n\n  useEffect(() => {\n",
    'filter summary state',
  );

  source = replaceOrFail(
    source,
    "  const addMeasurementPoint = useCallback((point: [number, number, number]) => {\n",
    "  const resetAllTools = useCallback(() => {\n    setLayers(defaultLayers);\n    setAnimation({ name: activeRecord.animations[0], playing: !reducedMotion, speed: 1, loop: true, restartToken: 0 });\n    setAnimationTime(0);\n    setCameraMode('perspective');\n    setCameraPreset('three-quarter');\n    setCameraCommandToken((value) => value + 1);\n    setResetCameraToken((value) => value + 1);\n    setClip(defaultClip);\n    setWireframe(false);\n    setSilhouette(false);\n    setQualityTier('standard');\n    setMeasurementMode(false);\n    setMeasurementPoints([]);\n    setScaleReference('none');\n    announce('Examination tools reset.');\n  }, [activeRecord.animations, announce, reducedMotion]);\n\n  const setLayerPreset = useCallback((preset: 'surface' | 'all' | 'none') => {\n    setLayers(preset === 'all'\n      ? { surface: true, structure: true, internal: true, functional: true }\n      : preset === 'none'\n        ? { surface: false, structure: false, internal: false, functional: false }\n        : defaultLayers);\n    announce(preset === 'all' ? 'All anatomy layers visible.' : preset === 'none' ? 'All anatomy layers hidden.' : 'Surface layer isolated.');\n  }, [announce]);\n\n  const addMeasurementPoint = useCallback((point: [number, number, number]) => {\n",
    'tool reset and layer presets',
  );

  source = replaceOrFail(
    source,
    "      if (key === 'd') {\n        lastPanelTriggerRef.current = diagnosticsTriggerRef.current;\n        setDiagnosticsOpen((value) => !value);\n        return;\n      }\n      if (key === 'r') {\n        setResetCameraToken((value) => value + 1);\n      }\n      if (event.code === 'Space') {\n        event.preventDefault();\n        setAnimation((current) => ({ ...current, playing: !current.playing }));\n      }\n",
    "      if (key === 'd') {\n        lastPanelTriggerRef.current = diagnosticsTriggerRef.current;\n        setDiagnosticsOpen((value) => !value);\n        setRegistryOpen(false);\n        setToolsOpen(false);\n        setRecordOpen(false);\n        return;\n      }\n      if (key === 'r') {\n        setResetCameraToken((value) => value + 1);\n        announce('Camera framing reset.');\n      }\n      if (event.code === 'Space') {\n        event.preventDefault();\n        setAnimation((current) => {\n          const next = { ...current, playing: !current.playing };\n          announce(next.playing ? 'Animation playing.' : 'Animation paused.');\n          return next;\n        });\n      }\n",
    'shortcut feedback',
  );

  source = replaceOrFail(source, "  }, [closePanels]);\n", "  }, [announce, closePanels]);\n", 'keyboard dependencies');

  source = replaceOrFail(
    source,
    "  const exportMarkdown = () => {\n    downloadText(\n",
    "  const exportMarkdown = () => {\n    downloadText(\n",
    'markdown export anchor',
  );
  source = replaceOrFail(
    source,
    "      'text/markdown;charset=utf-8',\n    );\n  };\n",
    "      'text/markdown;charset=utf-8',\n    );\n    announce(`Markdown exported with ${selectedAnnotationIds.length} annotation${selectedAnnotationIds.length === 1 ? '' : 's'}.`);\n  };\n",
    'markdown export feedback',
  );
  source = replaceOrFail(
    source,
    "      'application/json;charset=utf-8',\n    );\n  };\n",
    "      'application/json;charset=utf-8',\n    );\n    announce(`JSON exported with ${selectedAnnotationIds.length} annotation${selectedAnnotationIds.length === 1 ? '' : 's'}.`);\n  };\n",
    'json export feedback',
  );

  const oldNav = `      <nav className="global-hud" aria-label="Global controls">\n        <button type="button" className="hud-brand" aria-label="Open archive briefing" title="Briefing" onClick={() => setOrientationOpen(true)}>\n          <strong>Drakken Archive</strong>\n        </button>\n        <div className="hud-toggles">\n          <button ref={registryTriggerRef} type="button" aria-label="Open specimen registry" aria-keyshortcuts="G" title="Registry (G)" aria-pressed={registryOpen} onClick={(event) => { lastPanelTriggerRef.current = event.currentTarget; setRegistryOpen((v) => !v); setRecordOpen(false); setToolsOpen(false); setDiagnosticsOpen(false); }}>Registry</button>\n          <button ref={toolsTriggerRef} type="button" aria-label="Open examination tools" aria-keyshortcuts="T" title="Tools (T)" aria-pressed={toolsOpen} onClick={(event) => { lastPanelTriggerRef.current = event.currentTarget; setToolsOpen((v) => !v); setRegistryOpen(false); setRecordOpen(false); setDiagnosticsOpen(false); }}>Tools</button>\n          <button ref={recordTriggerRef} type="button" aria-label="Open specimen record" aria-keyshortcuts="I" title="Record (I)" aria-pressed={recordOpen} onClick={(event) => { lastPanelTriggerRef.current = event.currentTarget; setRecordOpen((v) => !v); setRegistryOpen(false); setToolsOpen(false); setDiagnosticsOpen(false); }}>Record</button>\n          <button ref={diagnosticsTriggerRef} type="button" aria-label="Open diagnostics" aria-keyshortcuts="D" title="Diagnostics (D)" aria-pressed={diagnosticsOpen} onClick={(event) => { lastPanelTriggerRef.current = event.currentTarget; setDiagnosticsOpen((v) => !v); }}>Diag</button>\n        </div>\n      </nav>`;
  const newNav = `      <nav className="global-hud" aria-label="Global controls">\n        <button type="button" className="hud-brand" aria-label="Open archive briefing" title="Briefing" onClick={() => setOrientationOpen(true)}>\n          <strong>Drakken Archive</strong>\n        </button>\n        <div className="hud-toggles">\n          <button ref={registryTriggerRef} type="button" aria-label="Open specimen registry" aria-keyshortcuts="G" aria-controls="registry-drawer" aria-expanded={registryOpen} title="Registry (G)" onClick={(event) => { lastPanelTriggerRef.current = event.currentTarget; setRegistryOpen((v) => !v); setRecordOpen(false); setToolsOpen(false); setDiagnosticsOpen(false); }}>Registry</button>\n          <button ref={toolsTriggerRef} type="button" aria-label="Open examination tools" aria-keyshortcuts="T" aria-controls="tools-drawer" aria-expanded={toolsOpen} title="Tools (T)" onClick={(event) => { lastPanelTriggerRef.current = event.currentTarget; setToolsOpen((v) => !v); setRegistryOpen(false); setRecordOpen(false); setDiagnosticsOpen(false); }}>Tools</button>\n          <button ref={recordTriggerRef} type="button" aria-label="Open specimen record" aria-keyshortcuts="I" aria-controls="record-drawer" aria-expanded={recordOpen} title="Record (I)" onClick={(event) => { lastPanelTriggerRef.current = event.currentTarget; setRecordOpen((v) => !v); setRegistryOpen(false); setToolsOpen(false); setDiagnosticsOpen(false); }}>Record</button>\n          <button ref={diagnosticsTriggerRef} type="button" aria-label="Open diagnostics" aria-keyshortcuts="D" aria-controls="diagnostics-drawer" aria-expanded={diagnosticsOpen} title="Diagnostics (D)" onClick={(event) => { lastPanelTriggerRef.current = event.currentTarget; setDiagnosticsOpen((v) => !v); setRegistryOpen(false); setRecordOpen(false); setToolsOpen(false); }}>Diagnostics</button>\n        </div>\n      </nav>`;
  source = replaceOrFail(source, oldNav, newNav, 'global HUD semantics');

  source = replaceOrFail(
    source,
    "      {(registryOpen || toolsOpen || recordOpen) && <button type=\"button\" className=\"drawer-scrim\" aria-label=\"Close open panel\" onClick={() => closePanels()} />}\n",
    "      {(registryOpen || toolsOpen || recordOpen || diagnosticsOpen) && <button type=\"button\" className=\"drawer-scrim\" aria-label=\"Close open panel\" onClick={() => closePanels()} />}\n",
    'diagnostics scrim',
  );

  source = replaceOrFail(
    source,
    "        <aside className={`registry-panel ${registryOpen ? 'is-open' : ''}`} aria-label=\"Specimen registry\">\n",
    "        <aside id=\"registry-drawer\" className={`registry-panel ${registryOpen ? 'is-open' : ''}`} aria-label=\"Specimen registry\" aria-hidden={!registryOpen}>\n",
    'registry drawer identity',
  );
  source = source.replace('aria-label="Close registry">X</button>', 'aria-label="Close registry">×</button>');

  source = replaceOrFail(
    source,
    `          <label className="search-field">\n            <span>Search records</span>\n            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Designation, role, archive ID" />\n          </label>`,
    `          <label className="search-field">\n            <span>Search records</span>\n            <span className="search-control">\n              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Designation, role, archive ID" />\n              {query && <button type="button" className="clear-field" onClick={() => setQuery('')} aria-label="Clear record search">×</button>}\n            </span>\n          </label>`,
    'search clear control',
  );

  source = replaceOrFail(
    source,
    "          <div className=\"registry-results\" aria-live=\"polite\">\n",
    "          <div className=\"registry-summary\">\n            <span aria-live=\"polite\">{filteredRecords.length} of {specimens.length} records</span>\n            {filtersActive && <button type=\"button\" onClick={clearRegistryFilters}>Clear filters</button>}\n          </div>\n          <div className=\"registry-results\" aria-live=\"polite\">\n",
    'registry result summary',
  );

  source = replaceOrFail(
    source,
    "                className={`specimen-card ${record.id === activeSpecimenId ? 'is-active' : ''}`}\n                onClick={() => chooseSpecimen(record.id)}\n",
    "                className={`specimen-card ${record.id === activeSpecimenId ? 'is-active' : ''} ${record.id === pendingSpecimenId ? 'is-loading' : ''}`}\n                aria-current={record.id === activeSpecimenId ? 'true' : undefined}\n                aria-busy={record.id === pendingSpecimenId}\n                onClick={() => chooseSpecimen(record.id)}\n",
    'specimen card state',
  );

  source = replaceOrFail(
    source,
    "            {filteredRecords.length === 0 && <p className=\"empty-state\">No record matches the current filters.</p>}\n",
    "            {filteredRecords.length === 0 && <div className=\"empty-state\"><p>No record matches the current filters.</p><button type=\"button\" onClick={clearRegistryFilters}>Reset registry</button></div>}\n",
    'empty registry recovery',
  );

  source = replaceOrFail(
    source,
    "        <section id=\"examination-chamber\" className=\"examination-section\" aria-label=\"Examination chamber\">\n",
    "        <section id=\"examination-chamber\" className=\"examination-section\" aria-label=\"Examination chamber\" aria-describedby=\"chamber-instructions\">\n          <p id=\"chamber-instructions\" className=\"sr-only\">Drag to orbit, scroll or pinch to zoom, and use the edge handles or G, T, I, and D shortcuts to open controls.</p>\n",
    'chamber instructions',
  );
  source = source.replace('<div className="chamber-frame">', '<div className="chamber-frame" aria-busy={Boolean(pendingSpecimenId)}>');

  source = replaceOrFail(
    source,
    "            {pendingSpecimenId && <div className=\"loading-overlay\" role=\"status\">Loading {findSpecimen(pendingSpecimenId).designation}...</div>}\n            {loadError && <div className=\"error-overlay\" role=\"alert\">{loadError}</div>}\n",
    "            {pendingSpecimenId && <div className=\"loading-overlay\" role=\"status\"><span className=\"loading-kicker\">Reconstructing record</span><strong>{findSpecimen(pendingSpecimenId).designation}</strong><span className=\"loading-track\"><span /></span></div>}\n            {loadError && <div className=\"error-overlay\" role=\"alert\"><strong>Record reconstruction failed</strong><span>{loadError}</span><span className=\"overlay-actions\">{lastFailedSpecimenId && <button type=\"button\" onClick={() => chooseSpecimen(lastFailedSpecimenId)}>Retry</button>}<button type=\"button\" onClick={() => setLoadError(null)}>Dismiss</button></span></div>}\n",
    'load overlays',
  );

  source = replaceOrFail(
    source,
    "          </div>\n\n          <aside className={`tools-panel ${toolsOpen ? 'is-open' : ''}`} aria-label=\"Examination tools\">\n",
    "          </div>\n\n          {(clip.enabled || measurementMode || !animation.playing || qualityTier === 'reduced' || wireframe || silhouette) && (\n            <div className=\"active-mode-rail\" aria-label=\"Active examination modes\">\n              {clip.enabled && <span>Section {clip.axis.toUpperCase()} {clip.position.toFixed(1)}</span>}\n              {measurementMode && <span>Measurement armed</span>}\n              {!animation.playing && <span>Animation paused</span>}\n              {qualityTier === 'reduced' && <span>Reduced quality</span>}\n              {wireframe && <span>Wireframe</span>}\n              {silhouette && <span>Silhouette</span>}\n            </div>\n          )}\n\n          <aside id=\"tools-drawer\" className={`tools-panel ${toolsOpen ? 'is-open' : ''}`} aria-label=\"Examination tools\" aria-hidden={!toolsOpen}>\n",
    'active mode rail and tools identity',
  );
  source = source.replace('aria-label="Close tools">X</button>', 'aria-label="Close tools">×</button>');

  source = replaceOrFail(
    source,
    "              <button className=\"mobile-close\" type=\"button\" onClick={() => setToolsOpen(false)} aria-label=\"Close tools\">×</button>\n",
    "              <span className=\"panel-heading-actions\"><button type=\"button\" className=\"panel-reset\" onClick={resetAllTools}>Reset all</button><button className=\"mobile-close\" type=\"button\" onClick={() => setToolsOpen(false)} aria-label=\"Close tools\">×</button></span>\n",
    'tools reset action',
  );

  source = replaceOrFail(
    source,
    "                <small>Independent visibility</small>\n              </div>\n              <div className=\"layer-grid\">\n",
    "                <small>{visibleLayerCount}/4 visible</small>\n              </div>\n              <div className=\"layer-presets\" aria-label=\"Layer visibility presets\"><button type=\"button\" onClick={() => setLayerPreset('surface')}>Surface only</button><button type=\"button\" onClick={() => setLayerPreset('all')}>Show all</button><button type=\"button\" onClick={() => setLayerPreset('none')}>Hide all</button></div>\n              <div className=\"layer-grid\">\n",
    'layer presets',
  );

  source = source.replace(
    "                    onClick={() => setClip((current) => ({ ...current, axis }))}\n",
    "                    disabled={!clip.enabled}\n                    onClick={() => setClip((current) => ({ ...current, axis }))}\n",
  );
  source = source.replace(
    "                <ToggleButton active={clip.inverted} onClick={() => setClip((current) => ({ ...current, inverted: !current.inverted }))}>Invert</ToggleButton>\n",
    "                <button type=\"button\" className={`toggle-button ${clip.inverted ? 'is-active' : ''}`} aria-pressed={clip.inverted} disabled={!clip.enabled} onClick={() => setClip((current) => ({ ...current, inverted: !current.inverted }))}>Invert</button>\n",
  );
  source = source.replace(
    "                  value={clip.position}\n                  onChange={(event) => setClip((current) => ({ ...current, position: Number(event.target.value) }))}\n",
    "                  value={clip.position}\n                  disabled={!clip.enabled}\n                  aria-label=\"Section plane position\"\n                  aria-valuetext={`${clip.position.toFixed(1)} reconstruction units`}\n                  onChange={(event) => setClip((current) => ({ ...current, position: Number(event.target.value) }))}\n",
  );
  source = source.replace(
    "                <input type=\"range\" min=\"0.25\" max=\"2\" step=\"0.25\" value={animation.speed} onChange={(event) => setAnimation((current) => ({ ...current, speed: Number(event.target.value) }))} />\n",
    "                <input type=\"range\" min=\"0.25\" max=\"2\" step=\"0.25\" value={animation.speed} aria-label=\"Playback speed\" aria-valuetext={`${animation.speed.toFixed(2)} times`} onChange={(event) => setAnimation((current) => ({ ...current, speed: Number(event.target.value) }))} />\n",
  );
  source = source.replace(
    "                <button type=\"button\" onClick={() => setMeasurementPoints([])}>Clear measurement</button>\n",
    "                <button type=\"button\" disabled={measurementPoints.length === 0} onClick={() => { setMeasurementPoints([]); announce('Measurement cleared.'); }}>Clear measurement</button>\n",
  );
  source = source.replace(
    "                  : `${measurementPoints.length}/2 points selected`}\n",
    "                  : measurementMode ? `${measurementPoints.length}/2 points selected — choose ${measurementPoints.length === 0 ? 'the first' : 'the second'} point` : `${measurementPoints.length}/2 points selected`}\n",
  );

  source = replaceOrFail(
    source,
    "        <aside className={`record-panel ${recordOpen ? 'is-open' : ''}`} aria-label=\"Specimen record\">\n",
    "        <aside id=\"record-drawer\" className={`record-panel ${recordOpen ? 'is-open' : ''}`} aria-label=\"Specimen record\" aria-hidden={!recordOpen}>\n",
    'record drawer identity',
  );
  source = source.replace('aria-label="Close record">X</button>', 'aria-label="Close record">×</button>');

  source = replaceOrFail(
    source,
    "          <nav className=\"record-tabs\" aria-label=\"Record sections\">\n            {(['record', 'incident', 'military', 'civic', 'sources'] as const).map((tab) => (\n              <button type=\"button\" key={tab} className={recordTab === tab ? 'is-active' : ''} onClick={() => setRecordTab(tab)}>{tab}</button>\n            ))}\n          </nav>\n\n          <div className=\"record-content\">\n",
    "          <nav className=\"record-tabs\" role=\"tablist\" aria-label=\"Record sections\">\n            {recordTabs.map((tab) => (\n              <button type=\"button\" role=\"tab\" id={`record-tab-${tab}`} aria-controls={`record-panel-${tab}`} aria-selected={recordTab === tab} tabIndex={recordTab === tab ? 0 : -1} key={tab} className={recordTab === tab ? 'is-active' : ''} onClick={() => setRecordTab(tab)}>{tab}</button>\n            ))}\n          </nav>\n\n          <div className=\"record-content\" role=\"tabpanel\" id={`record-panel-${recordTab}`} aria-labelledby={`record-tab-${recordTab}`}>\n",
    'record tabs semantics',
  );

  source = replaceOrFail(
    source,
    "              <small>{selectedAnnotationIds.length} selected for export</small>\n            </div>\n            <div className=\"annotation-list\">\n",
    "              <small>{selectedAnnotationIds.length} selected for export</small>\n            </div>\n            <div className=\"annotation-actions\"><button type=\"button\" onClick={() => { setSelectedAnnotationIds(activeRecord.annotations.map((annotation) => annotation.id)); setSelectedAnnotationId(activeRecord.annotations[0]?.id ?? null); announce('All annotations selected for export.'); }}>Select all</button><button type=\"button\" disabled={selectedAnnotationIds.length === 0} onClick={() => { setSelectedAnnotationIds([]); setSelectedAnnotationId(null); announce('Annotation export selection cleared.'); }}>Clear</button></div>\n            <div className=\"annotation-list\">\n",
    'annotation export actions',
  );

  source = replaceOrFail(
    source,
    "          <div className=\"export-row\">\n            <button type=\"button\" onClick={exportMarkdown}>Export Markdown</button>\n            <button type=\"button\" onClick={exportJson}>Export JSON</button>\n          </div>\n",
    "          <div className=\"export-row\">\n            <button type=\"button\" onClick={exportMarkdown}>Markdown <small>{selectedAnnotationIds.length}</small></button>\n            <button type=\"button\" onClick={exportJson}>JSON <small>{selectedAnnotationIds.length}</small></button>\n          </div>\n",
    'export count polish',
  );

  source = replaceOrFail(
    source,
    "      <section className={`diagnostics-panel ${diagnosticsOpen ? 'is-open' : ''}`} aria-label=\"Runtime diagnostics\">\n",
    "      <section id=\"diagnostics-drawer\" className={`diagnostics-panel ${diagnosticsOpen ? 'is-open' : ''}`} aria-label=\"Runtime diagnostics\" aria-hidden={!diagnosticsOpen}>\n",
    'diagnostics identity',
  );

  source = replaceOrFail(
    source,
    "        <div className=\"orientation-overlay\" role=\"dialog\" aria-labelledby=\"briefing-heading\" aria-modal=\"true\">\n          <div className=\"orientation-card\">\n",
    "        <div className=\"orientation-overlay\" role=\"dialog\" aria-labelledby=\"briefing-heading\" aria-modal=\"true\" onMouseDown={(event) => { if (event.target === event.currentTarget) setOrientationOpen(false); }}>\n          <div className=\"orientation-card\">\n            <button type=\"button\" className=\"orientation-close\" aria-label=\"Close briefing\" onClick={() => setOrientationOpen(false)}>×</button>\n",
    'briefing dismissal',
  );

  source = replaceOrFail(
    source,
    "              <div className=\"orientation-item\">\n                <strong>Scale References</strong>\n                <small>Reference silhouettes are normalized visual aids. They do not establish canon dimensions or a proven world-unit calibration.</small>\n              </div>\n",
    "              <div className=\"orientation-item\">\n                <strong>Scale References</strong>\n                <small>Reference silhouettes are normalized visual aids. They do not establish canon dimensions or a proven world-unit calibration.</small>\n              </div>\n              <div className=\"orientation-item\">\n                <strong>Deliberate Interface</strong>\n                <small><kbd>G</kbd> registry, <kbd>T</kbd> tools, <kbd>I</kbd> record, <kbd>D</kbd> diagnostics, and <kbd>Esc</kbd> closes the active surface.</small>\n              </div>\n              <div className=\"orientation-item\">\n                <strong>Motion Preference</strong>\n                <small>{reducedMotion ? 'Reduced motion is active; specimen animation starts paused.' : 'Specimen animation follows the selected operational state.'}</small>\n              </div>\n",
    'briefing shortcut polish',
  );

  source = replaceOrFail(
    source,
    "      )}\n    </div>\n",
    "      )}\n\n      <div className={`status-toast ${statusMessage ? 'is-visible' : ''}`} role=\"status\" aria-live=\"polite\" aria-atomic=\"true\">{statusMessage}</div>\n    </div>\n",
    'status toast',
  );

  return source;
});

update('src/components/ExaminationChamber.tsx', (input) => {
  if (input.includes('measurement-point-index')) return input;
  let source = input;
  source = replaceOrFail(
    source,
    `      {points.map((point, index) => (\n        <mesh key={\`${'${point.join(\'-\')}-${index}'}\`} position={point}>\n          <sphereGeometry args={[0.13, 18, 12]} />\n          <meshBasicMaterial color="#a6e7ff" depthTest={false} />\n        </mesh>\n      ))}`,
    `      {points.map((point, index) => (\n        <group key={\`${'${point.join(\'-\')}-${index}'}\`} position={point}>\n          <mesh>\n            <sphereGeometry args={[0.13, 18, 12]} />\n            <meshBasicMaterial color="#a6e7ff" depthTest={false} />\n          </mesh>\n          <mesh rotation={[Math.PI / 2, 0, 0]}>\n            <ringGeometry args={[0.19, 0.24, 28]} />\n            <meshBasicMaterial color="#a6e7ff" transparent opacity={0.72} depthTest={false} side={THREE.DoubleSide} />\n          </mesh>\n          <Html position={[0, 0.32, 0]} center distanceFactor={12}>\n            <span className="measurement-point-index" aria-hidden="true">{index + 1}</span>\n          </Html>\n        </group>\n      ))}`,
    'numbered measurement points',
  );
  source = replaceOrFail(
    source,
    "    <div className=\"chamber-canvas\" aria-label={`Three-dimensional examination chamber for ${props.record.designation}`}>\n",
    "    <div className={`chamber-canvas ${props.measurementMode ? 'is-measuring' : ''} ${props.clip.enabled ? 'is-sectioning' : ''}`} aria-label={`Three-dimensional examination chamber for ${props.record.designation}`}>\n",
    'chamber mode classes',
  );
  source = replaceOrFail(
    source,
    "      <div className=\"chamber-crosshair\" aria-hidden=\"true\" />\n",
    "      <div className=\"chamber-vignette\" aria-hidden=\"true\" />\n      <div className=\"chamber-crosshair\" aria-hidden=\"true\" />\n",
    'viewport vignette',
  );
  return source;
});

update('src/main.tsx', (source) => {
  if (source.includes("import './polish.css';")) return source;
  return replaceOrFail(source, "import './immersive-shell.css';\n", "import './immersive-shell.css';\nimport './polish.css';\n", 'polish stylesheet import');
});

const polishCss = `/* Final product-polish layer. Loaded after the immersive shell. */
:root {
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --elevation-panel: 0 24px 70px rgba(0, 0, 0, 0.48), 0 1px 0 rgba(255, 255, 255, 0.035) inset;
  --safe-top: max(10px, env(safe-area-inset-top));
  --safe-right: max(10px, env(safe-area-inset-right));
  --safe-bottom: max(10px, env(safe-area-inset-bottom));
  --safe-left: max(10px, env(safe-area-inset-left));
}

.sr-only {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0, 0, 0, 0) !important;
  white-space: nowrap !important;
  border: 0 !important;
}

button {
  transition: border-color 140ms ease, background-color 140ms ease, color 140ms ease, box-shadow 140ms ease, transform 140ms ease, opacity 140ms ease;
}
button:active:not(:disabled) { transform: translateY(1px); }
button:disabled { cursor: not-allowed; opacity: 0.42; }

.global-hud button {
  isolation: isolate;
  overflow: visible;
  border-radius: var(--radius-sm) !important;
}
.global-hud button::before {
  content: "";
  position: absolute;
  inset: -7px;
  z-index: -1;
  border-radius: 12px;
}
.global-hud button::after { text-shadow: 0 1px 8px rgba(0, 0, 0, 0.9); }
.global-hud button[aria-expanded="true"] {
  opacity: 1;
  border-color: rgba(145, 226, 255, 0.95) !important;
  background: rgba(18, 31, 39, 0.96) !important;
  box-shadow: 0 0 0 3px rgba(145, 226, 255, 0.12), 0 8px 24px rgba(0, 0, 0, 0.4);
}
.global-hud .hud-brand { top: var(--safe-top); left: var(--safe-left); }
.global-hud .hud-toggles button:nth-child(1)::after { content: "G"; }
.global-hud .hud-toggles button:nth-child(2) { bottom: env(safe-area-inset-bottom); }
.global-hud .hud-toggles button:nth-child(4) { top: var(--safe-top); right: var(--safe-right); }

.drawer-scrim {
  background: rgba(2, 5, 8, 0.42);
  backdrop-filter: blur(3px) saturate(0.78);
}

.registry-panel,
.record-panel,
.tools-panel,
.diagnostics-panel {
  border-color: rgba(205, 226, 236, 0.18);
  box-shadow: var(--elevation-panel);
  overscroll-behavior: contain;
  scrollbar-gutter: stable;
  scrollbar-width: thin;
  scrollbar-color: rgba(145, 226, 255, 0.35) transparent;
}
.registry-panel::-webkit-scrollbar,
.record-panel::-webkit-scrollbar,
.tools-panel::-webkit-scrollbar { width: 8px; height: 8px; }
.registry-panel::-webkit-scrollbar-thumb,
.record-panel::-webkit-scrollbar-thumb,
.tools-panel::-webkit-scrollbar-thumb { background: rgba(145, 226, 255, 0.24); border-radius: 999px; }

.panel-heading {
  position: sticky;
  top: -1.1rem;
  z-index: 6;
  margin: -1.1rem -1.1rem 0;
  padding: 1rem 1.1rem 0.85rem;
  border-bottom: 1px solid rgba(205, 226, 236, 0.12);
  background: linear-gradient(180deg, rgba(14, 22, 28, 0.995), rgba(14, 22, 28, 0.94));
  backdrop-filter: blur(22px);
}
.panel-heading-actions { display: inline-flex; align-items: center; gap: 0.45rem; }
.panel-reset { min-height: 34px; padding: 0.35rem 0.6rem; font-family: var(--font-mono); font-size: 0.68rem; }
.mobile-close {
  display: inline-grid;
  min-width: 38px;
  min-height: 38px;
  border-radius: 50%;
  font-size: 1.25rem;
  line-height: 1;
}

.search-control { position: relative; display: block; }
.search-control input { padding-right: 2.6rem; }
.clear-field {
  position: absolute;
  top: 50%;
  right: 0.35rem;
  width: 30px;
  min-width: 30px;
  height: 30px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  background: transparent;
  font-size: 1.05rem;
}
.clear-field:active:not(:disabled) { transform: translateY(-50%); }

.registry-summary {
  position: sticky;
  top: 64px;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.7rem;
  margin: 0.75rem -0.25rem 0;
  padding: 0.55rem 0.25rem;
  border-bottom: 1px solid var(--line);
  color: var(--text-muted);
  background: rgba(14, 22, 28, 0.96);
  font-family: var(--font-mono);
  font-size: 0.67rem;
}
.registry-summary button { min-height: 30px; padding: 0.25rem 0.5rem; font-size: 0.65rem; }

.specimen-card { border-radius: var(--radius-sm); }
.specimen-card[aria-current="true"] { box-shadow: inset 0 0 0 1px rgba(145, 226, 255, 0.22), inset 0 0 24px rgba(126, 214, 248, 0.08); }
.specimen-card.is-loading { opacity: 0.62; }
.specimen-card.is-loading::after {
  content: "loading";
  justify-self: end;
  color: var(--cyan-frost);
  font-family: var(--font-mono);
  font-size: 0.6rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
.empty-state { display: grid; justify-items: start; gap: 0.6rem; padding: 1rem; border: 1px dashed var(--line-strong); border-radius: var(--radius-md); }
.empty-state p { margin: 0; }

.chamber-frame { background: #151d24; }
.chamber-canvas canvas { cursor: grab; }
.chamber-canvas canvas:active { cursor: grabbing; }
.chamber-canvas.is-measuring canvas { cursor: crosshair; }
.chamber-vignette {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  background:
    radial-gradient(circle at 50% 43%, transparent 42%, rgba(4, 7, 10, 0.2) 76%, rgba(2, 4, 6, 0.46) 100%),
    linear-gradient(180deg, rgba(255,255,255,0.018), transparent 18%, transparent 82%, rgba(0,0,0,0.08));
  mix-blend-mode: multiply;
}
.chamber-crosshair { display: none; }
.chamber-canvas.is-measuring .chamber-crosshair { display: block; opacity: 0.42; }

.loading-overlay,
.error-overlay {
  inset: 50% auto auto 50%;
  width: min(420px, calc(100vw - 2rem));
  min-height: 150px;
  padding: 1.25rem 1.4rem;
  place-items: start;
  align-content: center;
  gap: 0.55rem;
  border: 1px solid var(--line-strong);
  border-radius: var(--radius-md);
  transform: translate(-50%, -50%);
  background: rgba(10, 16, 22, 0.92);
  box-shadow: var(--elevation-panel);
  backdrop-filter: blur(18px);
  text-align: left;
}
.loading-kicker { color: var(--moon-gold); font-size: 0.62rem; }
.loading-overlay strong,
.error-overlay strong { color: var(--text-bright); font-family: var(--font-serif); font-size: 1.1rem; letter-spacing: 0.04em; text-transform: none; }
.loading-track { display: block; width: 100%; height: 3px; overflow: hidden; border-radius: 999px; background: rgba(255,255,255,0.08); }
.loading-track > span { display: block; width: 42%; height: 100%; border-radius: inherit; background: var(--cyan-frost); animation: loading-sweep 1.1s ease-in-out infinite alternate; }
@keyframes loading-sweep { from { transform: translateX(-15%); } to { transform: translateX(155%); } }
.error-overlay { color: #ffd2d4; background: rgba(35, 10, 14, 0.94); }
.error-overlay > span:not(.overlay-actions) { color: #f0c7ca; line-height: 1.5; text-transform: none; letter-spacing: 0; }
.overlay-actions { display: flex; gap: 0.5rem; margin-top: 0.35rem; }

.active-mode-rail {
  position: fixed;
  left: calc(var(--safe-left) + 34px);
  bottom: var(--safe-bottom);
  z-index: 45;
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  max-width: min(70vw, 720px);
  pointer-events: none;
}
.active-mode-rail span {
  padding: 0.28rem 0.48rem;
  border: 1px solid rgba(145, 226, 255, 0.24);
  border-radius: 999px;
  color: #dceaf0;
  background: rgba(9, 15, 20, 0.72);
  backdrop-filter: blur(10px);
  font-family: var(--font-mono);
  font-size: 0.62rem;
  letter-spacing: 0.035em;
}

.tools-panel::before {
  content: "";
  position: sticky;
  top: 0;
  z-index: 8;
  display: block;
  width: 46px;
  height: 4px;
  margin: 0 auto 0.45rem;
  border-radius: 999px;
  background: rgba(225, 238, 244, 0.24);
}
.tools-content { padding-bottom: calc(1rem + env(safe-area-inset-bottom)); overflow-y: auto; }
.layer-presets,
.annotation-actions { display: flex; flex-wrap: wrap; gap: 0.35rem; margin: -0.25rem 0 0.65rem; }
.layer-presets button,
.annotation-actions button { min-height: 30px; padding: 0.25rem 0.5rem; font-family: var(--font-mono); font-size: 0.64rem; }

.record-tabs {
  position: sticky;
  top: 64px;
  z-index: 5;
  margin-inline: -0.1rem;
  background: rgba(14, 22, 28, 0.96);
  scrollbar-width: none;
}
.record-tabs::-webkit-scrollbar { display: none; }
.record-tabs button[aria-selected="true"] { border-color: var(--cyan-frost); color: var(--text-bright); background: rgba(126, 214, 248, 0.1); }
.export-row button { display: inline-flex; align-items: center; justify-content: center; gap: 0.45rem; }
.export-row button small { display: inline-grid; min-width: 20px; height: 20px; place-items: center; border-radius: 999px; color: var(--cyan-frost); background: rgba(126, 214, 248, 0.1); }

.measurement-point-index {
  display: inline-grid;
  width: 22px;
  height: 22px;
  place-items: center;
  border: 1px solid var(--cyan-frost);
  border-radius: 50%;
  color: #071015;
  background: var(--cyan-frost);
  box-shadow: 0 0 14px rgba(126, 214, 248, 0.42);
  font-family: var(--font-mono);
  font-size: 0.66rem;
  font-weight: 800;
}

.status-toast {
  position: fixed;
  top: calc(var(--safe-top) + 36px);
  left: 50%;
  z-index: 300;
  max-width: min(520px, calc(100vw - 2rem));
  padding: 0.55rem 0.8rem;
  border: 1px solid rgba(145, 226, 255, 0.28);
  border-radius: 999px;
  color: var(--text-bright);
  background: rgba(8, 14, 19, 0.9);
  box-shadow: 0 10px 34px rgba(0, 0, 0, 0.38);
  backdrop-filter: blur(16px);
  font-family: var(--font-mono);
  font-size: 0.7rem;
  text-align: center;
  opacity: 0;
  pointer-events: none;
  transform: translate(-50%, -8px);
  transition: opacity 160ms ease, transform 180ms ease;
}
.status-toast.is-visible { opacity: 1; transform: translate(-50%, 0); }

.orientation-card { position: relative; border-radius: var(--radius-lg); }
.orientation-close {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  width: 36px !important;
  min-width: 36px;
  height: 36px;
  padding: 0 !important;
  border-radius: 50%;
  font-size: 1.2rem !important;
}
.orientation-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }

@media (max-width: 720px) {
  .global-hud button { width: 30px; min-width: 30px; height: 30px; min-height: 30px; }
  .global-hud button::before { inset: -9px; }
  .registry-panel,
  .record-panel { padding-bottom: calc(1rem + env(safe-area-inset-bottom)); }
  .tools-panel { height: min(84dvh, 760px); }
  .panel-heading { top: -1.1rem; }
  .active-mode-rail { left: var(--safe-left); right: var(--safe-right); bottom: calc(var(--safe-bottom) + 34px); max-width: none; justify-content: center; }
  .status-toast { top: calc(var(--safe-top) + 34px); }
  .orientation-overlay { align-items: flex-end; padding: 0.7rem; }
  .orientation-card { max-height: calc(100dvh - 1.4rem); overflow-y: auto; padding: 1.35rem; }
  .orientation-grid { grid-template-columns: 1fr; }
}

@media (hover: none) and (pointer: coarse) {
  .filter-row button,
  .record-tabs button,
  .axis-row button,
  .button-row button,
  .export-row button,
  .layer-presets button,
  .annotation-actions button,
  .panel-reset { min-height: 44px; }
}

@media (prefers-reduced-motion: reduce) {
  .loading-track > span { animation: none; width: 100%; opacity: 0.65; }
  .status-toast { transition: none; }
}
`;
fs.writeFileSync('src/polish.css', polishCss);

const polishTest = `import fs from 'node:fs';
import { describe, expect, it } from 'vitest';

const app = fs.readFileSync('src/App.tsx', 'utf8');
const chamber = fs.readFileSync('src/components/ExaminationChamber.tsx', 'utf8');
const css = fs.readFileSync('src/polish.css', 'utf8');

const requiredAppSignals = [
  'aria-controls="registry-drawer"',
  'aria-expanded={registryOpen}',
  'role="tablist"',
  'resetAllTools',
  'clearRegistryFilters',
  'active-mode-rail',
  'status-toast',
  'Select all',
  'Clear filters',
  'aria-busy={Boolean(pendingSpecimenId)}',
];

const requiredCssSignals = [
  'env(safe-area-inset-top)',
  'overscroll-behavior: contain',
  '.global-hud button::before',
  '.panel-heading',
  '.registry-summary',
  '.status-toast',
  '.chamber-vignette',
  '@media (hover: none) and (pointer: coarse)',
];

describe('polish pass contracts', () => {
  it('keeps the interface hidden at rest while adding deliberate polished controls', () => {
    for (const signal of requiredAppSignals) expect(app).toContain(signal);
    for (const signal of requiredCssSignals) expect(css).toContain(signal);
  });

  it('adds visual measurement and chamber polish without replacing the model route', () => {
    expect(chamber).toContain('measurement-point-index');
    expect(chamber).toContain('chamber-vignette');
    expect(chamber).toContain("props.measurementMode ? 'is-measuring' : ''");
    expect(chamber).toContain('<SpecimenModel');
  });
});
`;
fs.writeFileSync('src/polish.test.ts', polishTest);

const ledger = `# Polish Pass — Initial Implementation

This pass is bounded to presentation, interaction finish, accessibility, responsive behavior, and examination feedback. It does not alter the closed 59-record inventory, dedicated model routes, canon data, asset policy, or renderer architecture.

## Implemented improvements

1. Corrected the Registry edge handle mnemonic to G.
2. Expanded edge-handle hit areas without enlarging the visible chrome.
3. Added safe-area-aware handle placement.
4. Added clearer active/open handle treatment.
5. Added aria-controls and aria-expanded drawer relationships.
6. Made Diagnostics mutually exclusive with the primary drawers.
7. Added Diagnostics to scrim and Escape closure behavior.
8. Added sticky, translucent drawer headings.
9. Added contained scrolling, stable gutters, and polished scrollbars.
10. Replaced ASCII X close labels with typographic close glyphs.
11. Added a live registry result count.
12. Added one-click search clearing.
13. Added one-click registry filter reset.
14. Added active and loading semantics to specimen cards.
15. Added a recoverable empty registry state.
16. Added chamber aria-busy state during record loading.
17. Rebuilt loading feedback as a compact reconstruction card.
18. Added retry and dismiss actions to load errors.
19. Added a mode rail that appears only while non-default modes are active.
20. Added timed live feedback for load, camera, playback, reset, measurement, selection, and export actions.
21. Added a complete examination-tool reset action.
22. Added Surface only, Show all, and Hide all anatomy presets.
23. Added a live visible-layer count.
24. Disabled sectioning controls until sectioning is enabled.
25. Added accessible value text to sectioning and playback ranges.
26. Disabled measurement clearing when no measurement exists.
27. Improved measurement instructions and numbered 3D points.
28. Added Select all and Clear actions for annotation export.
29. Converted record navigation to a semantic tablist/tabpanel relationship.
30. Added annotation counts to export buttons and export confirmation.
31. Added backdrop dismissal and an explicit close control to the briefing.
32. Expanded the briefing with deliberate-interface and motion-preference guidance.
33. Added a screen-reader chamber instruction description.
34. Added context-sensitive grab, grabbing, and measurement cursors.
35. Added a restrained viewport vignette and measurement-only crosshair.
36. Added a mobile tools-sheet grab handle and safe-area padding.
37. Added consistent radii, elevation, button-state, and disabled-state tokens.
38. Added coarse-pointer 44px action targets.
39. Added reduced-motion handling for new transitions and loading feedback.
40. Added regression tests for the polish contracts.

## Adversarial review

Pending after source validation and browser evidence.
`;
fs.writeFileSync('POLISH_PASS.md', ledger);

console.log('Initial polish pass staged.');
