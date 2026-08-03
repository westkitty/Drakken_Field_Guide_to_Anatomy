import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ExaminationChamber } from './components/ExaminationChamber';
import {
  beginLoad,
  distanceMeters,
  downloadText,
  exportRecordJson,
  exportRecordMarkdown,
  findSpecimen,
  formatMeters,
  isCurrentLoad,
  specimens,
} from './lib/archive';
import type {
  AnimationState,
  CameraMode,
  CameraPreset,
  ClipState,
  DiagnosticsSnapshot,
  LayerId,
  SpecimenCategory,
} from './types';
import './styles.css';

const layerOrder: LayerId[] = ['surface', 'structure', 'internal', 'functional'];
const cameraPresets: CameraPreset[] = ['front', 'side', 'dorsal', 'ventral', 'three-quarter'];
const categoryFilters: Array<'all' | SpecimenCategory> = [
  'all',
  'mobile organism',
  'siege or processing entity',
  'planetary infrastructure',
];
const evidenceFilters = ['all', 'confirmed', 'reconstructed', 'non-canon prototype'] as const;

function EvidenceBadge({ state }: { state: string }) {
  return <span className={`evidence-badge evidence-${state.toLowerCase().replaceAll(' ', '-')}`}>{state}</span>;
}

function ToggleButton({
  active,
  children,
  onClick,
  label,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      className={`toggle-button ${active ? 'is-active' : ''}`}
      aria-pressed={active}
      aria-label={label}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default function App() {
  const [activeSpecimenId, setActiveSpecimenId] = useState('skymourn');
  const [pendingSpecimenId, setPendingSpecimenId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const loadGate = useRef({ requestId: 0, activeId: 'skymourn' });
  const activeRecord = findSpecimen(activeSpecimenId);

  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<(typeof categoryFilters)[number]>('all');
  const [evidenceFilter, setEvidenceFilter] = useState<(typeof evidenceFilters)[number]>('all');
  const [layers, setLayers] = useState<Record<LayerId, boolean>>({
    surface: true,
    structure: false,
    internal: false,
    functional: false,
  });
  const [animation, setAnimation] = useState<AnimationState>({
    name: activeRecord.animations[0],
    playing: true,
    speed: 1,
    loop: true,
    restartToken: 0,
  });
  const [animationTime, setAnimationTime] = useState(0);
  const [cameraMode, setCameraMode] = useState<CameraMode>('perspective');
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('three-quarter');
  const [cameraCommandToken, setCameraCommandToken] = useState(0);
  const [resetCameraToken, setResetCameraToken] = useState(0);
  const [clip, setClip] = useState<ClipState>({ enabled: false, axis: 'x', position: 0, inverted: false });
  const [wireframe, setWireframe] = useState(false);
  const [silhouette, setSilhouette] = useState(false);
  const [qualityTier, setQualityTier] = useState<'standard' | 'reduced'>('standard');
  const [measurementMode, setMeasurementMode] = useState(false);
  const [measurementPoints, setMeasurementPoints] = useState<[number, number, number][]>([]);
  const [scaleReference, setScaleReference] = useState<'none' | 'human' | 'vehicle' | 'building'>('human');
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>('sky-face');
  const [selectedAnnotationIds, setSelectedAnnotationIds] = useState<string[]>(['sky-face']);
  const [recordTab, setRecordTab] = useState<'record' | 'incident' | 'military' | 'civic' | 'sources'>('record');
  const [diagnosticsOpen, setDiagnosticsOpen] = useState(false);
  const [registryOpen, setRegistryOpen] = useState(false);
  const [recordOpen, setRecordOpen] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [diagnostics, setDiagnostics] = useState<DiagnosticsSnapshot>({
    specimenId: 'skymourn',
    activeAnimation: activeRecord.animations[0],
    geometries: 0,
    textures: 0,
    drawCalls: 0,
    triangles: 0,
    cameraMode: 'perspective',
    qualityTier: 'standard',
    clipping: 'Disabled',
  });

  const selectedAnnotation = activeRecord.annotations.find((item) => item.id === selectedAnnotationId) ?? null;

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  const chooseSpecimen = useCallback((id: string) => {
    if (id === activeSpecimenId) return;
    const nextGate = beginLoad(loadGate.current, id);
    loadGate.current = nextGate;
    setPendingSpecimenId(id);
    setLoadError(null);
    window.setTimeout(() => {
      if (!isCurrentLoad(loadGate.current, nextGate.requestId, id)) return;
      try {
        const record = findSpecimen(id);
        setActiveSpecimenId(id);
        setAnimation({
          name: record.animations[0],
          playing: true,
          speed: 1,
          loop: true,
          restartToken: 0,
        });
        setLayers({ surface: true, structure: false, internal: false, functional: false });
        setMeasurementPoints([]);
        setMeasurementMode(false);
        setClip({ enabled: false, axis: 'x', position: 0, inverted: false });
        setSelectedAnnotationId(record.annotations[0]?.id ?? null);
        setSelectedAnnotationIds(record.annotations[0] ? [record.annotations[0].id] : []);
        setPendingSpecimenId(null);
        setRegistryOpen(false);
      } catch (error) {
        setLoadError(error instanceof Error ? error.message : 'Specimen failed to load.');
        setPendingSpecimenId(null);
      }
    }, reducedMotion ? 0 : 120);
  }, [activeSpecimenId, reducedMotion]);

  const filteredRecords = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return specimens.filter((record) => {
      const queryMatch = !normalized ||
        [record.designation, record.archiveId, record.archetype, record.operationalRole, ...record.evidenceTags]
          .join(' ')
          .toLowerCase()
          .includes(normalized);
      const categoryMatch = categoryFilter === 'all' || record.category === categoryFilter;
      const evidenceMatch =
        evidenceFilter === 'all' ||
        record.evidenceStatus.toLowerCase() === evidenceFilter ||
        (evidenceFilter === 'reconstructed' && record.annotations.some((item) => item.evidence === 'Reconstructed'));
      return queryMatch && categoryMatch && evidenceMatch;
    });
  }, [categoryFilter, evidenceFilter, query]);

  const addMeasurementPoint = useCallback((point: [number, number, number]) => {
    setMeasurementPoints((current) => (current.length >= 2 ? [point] : [...current, point]));
  }, []);

  const handleAnnotationSelect = useCallback((id: string) => {
    setSelectedAnnotationId(id);
    setSelectedAnnotationIds((current) => (current.includes(id) ? current : [...current, id]));
    setRecordOpen(true);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const editable = target?.matches('input, textarea, select, [contenteditable="true"]');
      if (event.key === 'Escape') {
        setMeasurementMode(false);
        setRegistryOpen(false);
        setRecordOpen(false);
        setDiagnosticsOpen(false);
        return;
      }
      if (editable) return;
      if (event.key.toLowerCase() === 'r') {
        setResetCameraToken((value) => value + 1);
      }
      if (event.code === 'Space') {
        event.preventDefault();
        setAnimation((current) => ({ ...current, playing: !current.playing }));
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const exportMarkdown = () => {
    downloadText(
      `${activeRecord.id}-${activeRecord.recordRevision}.md`,
      exportRecordMarkdown(activeRecord, selectedAnnotationIds),
      'text/markdown;charset=utf-8',
    );
  };
  const exportJson = () => {
    downloadText(
      `${activeRecord.id}-${activeRecord.recordRevision}.json`,
      exportRecordJson(activeRecord, selectedAnnotationIds),
      'application/json;charset=utf-8',
    );
  };

  return (
    <div className={`archive-app ${reducedMotion ? 'reduced-motion' : ''}`}>
      <a className="skip-link" href="#examination-chamber">Skip to examination chamber</a>
      <header className="archive-header">
        <div>
          <p className="eyebrow">Zentrum Vault 9 / Recovered intelligence interface</p>
          <h1>Drakken Field Anatomy Archive</h1>
        </div>
        <div className="header-status">
          <span>{specimens.length} records</span>
          <span>One meter per world unit</span>
          <EvidenceBadge state={activeRecord.evidenceStatus} />
        </div>
      </header>

      <div className="mobile-toolbar">
        <button type="button" onClick={() => setRegistryOpen(true)}>Registry</button>
        <button type="button" onClick={() => setRecordOpen(true)}>Record</button>
        <button type="button" onClick={() => setDiagnosticsOpen((value) => !value)}>Diagnostics</button>
      </div>

      <main className="archive-layout">
        <aside className={`registry-panel ${registryOpen ? 'is-open' : ''}`} aria-label="Specimen registry">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Registry</p>
              <h2>Specimen index</h2>
            </div>
            <button className="mobile-close" type="button" onClick={() => setRegistryOpen(false)} aria-label="Close registry">X</button>
          </div>
          <label className="search-field">
            <span>Search records</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Designation, role, archive ID" />
          </label>
          <div className="filter-block">
            <span>Category</span>
            <div className="filter-row">
              {categoryFilters.map((filter) => (
                <button
                  type="button"
                  key={filter}
                  className={categoryFilter === filter ? 'is-active' : ''}
                  onClick={() => setCategoryFilter(filter)}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
          <div className="filter-block">
            <span>Evidence</span>
            <div className="filter-row">
              {evidenceFilters.map((filter) => (
                <button
                  type="button"
                  key={filter}
                  className={evidenceFilter === filter ? 'is-active' : ''}
                  onClick={() => setEvidenceFilter(filter)}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
          <div className="registry-results" aria-live="polite">
            {filteredRecords.map((record) => (
              <button
                type="button"
                key={record.id}
                className={`specimen-card ${record.id === activeSpecimenId ? 'is-active' : ''}`}
                onClick={() => chooseSpecimen(record.id)}
              >
                <span className="specimen-card-topline">
                  <strong>{record.designation}</strong>
                  <small>{record.archiveId}</small>
                </span>
                <span className="specimen-archetype">{record.archetype}</span>
                <span className="specimen-metadata">
                  <span>{record.category}</span>
                  <span>{record.threatClassification}</span>
                </span>
                <span className="specimen-metadata">
                  <span>{record.dimensions.canon}</span>
                  <span>{record.modelAvailability}</span>
                </span>
                <EvidenceBadge state={record.evidenceStatus} />
                <small className="source-status">{record.sourceStatus}</small>
              </button>
            ))}
            {filteredRecords.length === 0 && <p className="empty-state">No record matches the current filters.</p>}
          </div>
        </aside>

        <section id="examination-chamber" className="examination-section" aria-label="Examination chamber">
          <div className="specimen-titlebar">
            <div>
              <p className="eyebrow">Active record / {activeRecord.archiveId}</p>
              <h2>{activeRecord.designation}</h2>
              <p>{activeRecord.archetype}</p>
            </div>
            <div className="specimen-title-actions">
              <button type="button" onClick={() => setResetCameraToken((value) => value + 1)}>Reset camera <kbd>R</kbd></button>
              <button type="button" onClick={() => setRecordOpen(true)}>Open record</button>
            </div>
          </div>

          <div className="primary-tools" aria-label="Primary chamber tools">
            <div className="tool-cluster">
              <span>Camera</span>
              <ToggleButton active={cameraMode === 'perspective'} onClick={() => setCameraMode('perspective')}>Perspective</ToggleButton>
              <ToggleButton active={cameraMode === 'orthographic'} onClick={() => setCameraMode('orthographic')}>Orthographic</ToggleButton>
              {cameraPresets.map((preset) => (
                <button
                  type="button"
                  key={preset}
                  className={cameraPreset === preset ? 'is-active' : ''}
                  onClick={() => {
                    setCameraPreset(preset);
                    setCameraCommandToken((value) => value + 1);
                  }}
                >
                  {preset}
                </button>
              ))}
            </div>
            <div className="tool-cluster">
              <span>Render</span>
              <ToggleButton active={silhouette} onClick={() => setSilhouette((value) => !value)}>Silhouette</ToggleButton>
              <ToggleButton active={wireframe} onClick={() => setWireframe((value) => !value)}>Wireframe</ToggleButton>
              <ToggleButton active={qualityTier === 'reduced'} onClick={() => setQualityTier((value) => value === 'standard' ? 'reduced' : 'standard')}>Reduced quality</ToggleButton>
            </div>
          </div>

          <div className="chamber-frame">
            <ExaminationChamber
              record={activeRecord}
              layers={layers}
              animation={animation}
              cameraMode={cameraMode}
              cameraPreset={cameraPreset}
              cameraCommandToken={cameraCommandToken}
              resetCameraToken={resetCameraToken}
              clip={clip}
              wireframe={wireframe}
              silhouette={silhouette}
              qualityTier={qualityTier}
              measurementMode={measurementMode}
              measurementPoints={measurementPoints}
              onMeasurePoint={addMeasurementPoint}
              scaleReference={scaleReference}
              selectedAnnotationId={selectedAnnotationId}
              onSelectAnnotation={handleAnnotationSelect}
              onDiagnostics={setDiagnostics}
              onAnimationTime={setAnimationTime}
            />
            {pendingSpecimenId && <div className="loading-overlay" role="status">Loading {findSpecimen(pendingSpecimenId).designation}...</div>}
            {loadError && <div className="error-overlay" role="alert">{loadError}</div>}
          </div>

          <div className="secondary-tools">
            <section className="tool-panel" aria-labelledby="layers-heading">
              <div className="tool-panel-heading">
                <h3 id="layers-heading">Anatomy layers</h3>
                <small>Independent visibility</small>
              </div>
              <div className="layer-grid">
                {layerOrder.map((layer) => (
                  <ToggleButton
                    key={layer}
                    active={layers[layer]}
                    onClick={() => setLayers((current) => ({ ...current, [layer]: !current[layer] }))}
                  >
                    <strong>{layer}</strong>
                    <small>{activeRecord.layers[layer]}</small>
                  </ToggleButton>
                ))}
              </div>
            </section>

            <section className="tool-panel" aria-labelledby="sectioning-heading">
              <div className="tool-panel-heading">
                <h3 id="sectioning-heading">Sectioning</h3>
                <ToggleButton active={clip.enabled} onClick={() => setClip((current) => ({ ...current, enabled: !current.enabled }))}>Enabled</ToggleButton>
              </div>
              <div className="axis-row">
                {(['x', 'y', 'z'] as const).map((axis) => (
                  <button
                    type="button"
                    key={axis}
                    className={clip.axis === axis ? 'is-active' : ''}
                    onClick={() => setClip((current) => ({ ...current, axis }))}
                  >
                    {axis.toUpperCase()}
                  </button>
                ))}
                <ToggleButton active={clip.inverted} onClick={() => setClip((current) => ({ ...current, inverted: !current.inverted }))}>Invert</ToggleButton>
              </div>
              <label className="range-field">
                <span>Plane position <output>{clip.position.toFixed(1)} m</output></span>
                <input
                  type="range"
                  min="-8"
                  max="8"
                  step="0.1"
                  value={clip.position}
                  onChange={(event) => setClip((current) => ({ ...current, position: Number(event.target.value) }))}
                  onKeyDown={(event) => {
                    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
                    event.preventDefault();
                    setClip((current) => ({
                      ...current,
                      position: Math.max(-8, Math.min(8, current.position + (event.key === 'ArrowRight' ? 0.1 : -0.1))),
                    }));
                  }}
                />
              </label>
            </section>

            <section className="tool-panel" aria-labelledby="animation-heading">
              <div className="tool-panel-heading">
                <h3 id="animation-heading">Animation viewer</h3>
                <output>{animationTime.toFixed(2)} s / 6.00 s</output>
              </div>
              <label>
                <span>Operational state</span>
                <select value={animation.name} onChange={(event) => setAnimation((current) => ({ ...current, name: event.target.value, restartToken: current.restartToken + 1 }))}>
                  {activeRecord.animations.map((name) => <option key={name}>{name}</option>)}
                </select>
              </label>
              <div className="button-row">
                <button type="button" onClick={() => setAnimation((current) => ({ ...current, playing: !current.playing }))}>
                  {animation.playing ? 'Pause' : 'Play'} <kbd>Space</kbd>
                </button>
                <button type="button" onClick={() => setAnimation((current) => ({ ...current, restartToken: current.restartToken + 1 }))}>Restart</button>
                <ToggleButton active={animation.loop} onClick={() => setAnimation((current) => ({ ...current, loop: !current.loop }))}>Loop</ToggleButton>
              </div>
              <label className="range-field">
                <span>Playback speed <output>{animation.speed.toFixed(2)}x</output></span>
                <input type="range" min="0.25" max="2" step="0.25" value={animation.speed} onChange={(event) => setAnimation((current) => ({ ...current, speed: Number(event.target.value) }))} />
              </label>
            </section>

            <section className="tool-panel" aria-labelledby="measurement-heading">
              <div className="tool-panel-heading">
                <h3 id="measurement-heading">Measurement and scale</h3>
                <ToggleButton active={measurementMode} onClick={() => setMeasurementMode((value) => !value)}>Measure</ToggleButton>
              </div>
              <p className="tool-note">Activate measurement, then select two points on the specimen.</p>
              <div className="button-row">
                <button type="button" onClick={() => setMeasurementPoints([])}>Clear measurement</button>
                <select aria-label="Scale comparison" value={scaleReference} onChange={(event) => setScaleReference(event.target.value as typeof scaleReference)}>
                  <option value="none">No scale reference</option>
                  <option value="human">Human figure - 1.8 m</option>
                  <option value="vehicle">Ground vehicle - 1.5 m</option>
                  <option value="building">Ten-meter building marker</option>
                </select>
              </div>
              <p className="measurement-summary">
                {measurementPoints.length === 2
                  ? `Measured distance: ${formatMeters(distanceMeters(measurementPoints[0], measurementPoints[1]))}`
                  : `${measurementPoints.length}/2 points selected`}
              </p>
            </section>
          </div>
        </section>

        <aside className={`record-panel ${recordOpen ? 'is-open' : ''}`} aria-label="Specimen record">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Archive record</p>
              <h2>{activeRecord.designation}</h2>
            </div>
            <button className="mobile-close" type="button" onClick={() => setRecordOpen(false)} aria-label="Close record">X</button>
          </div>
          <div className="record-summary">
            <EvidenceBadge state={activeRecord.evidenceStatus} />
            <p>{activeRecord.description}</p>
          </div>
          <nav className="record-tabs" aria-label="Record sections">
            {(['record', 'incident', 'military', 'civic', 'sources'] as const).map((tab) => (
              <button type="button" key={tab} className={recordTab === tab ? 'is-active' : ''} onClick={() => setRecordTab(tab)}>{tab}</button>
            ))}
          </nav>

          <div className="record-content">
            {recordTab === 'record' && (
              <dl className="record-grid">
                <div><dt>Archive ID</dt><dd>{activeRecord.archiveId}</dd></div>
                <div><dt>Category</dt><dd>{activeRecord.category}</dd></div>
                <div><dt>Archetype</dt><dd>{activeRecord.archetype}</dd></div>
                <div><dt>Canon status</dt><dd>{activeRecord.canonStatus}</dd></div>
                <div><dt>Dimensions</dt><dd>{activeRecord.dimensions.canon}</dd></div>
                <div><dt>Estimated mass</dt><dd>{activeRecord.estimatedMass}</dd></div>
                <div><dt>Environment</dt><dd>{activeRecord.environment}</dd></div>
                <div><dt>Operational role</dt><dd>{activeRecord.operationalRole}</dd></div>
                <div><dt>Threat</dt><dd>{activeRecord.threatClassification}</dd></div>
                <div><dt>Asset</dt><dd>{activeRecord.modelAssetRef}</dd></div>
                <div><dt>Record revision</dt><dd>{activeRecord.recordRevision}</dd></div>
                <div><dt>Asset version</dt><dd>{activeRecord.assetVersion}</dd></div>
              </dl>
            )}
            {recordTab === 'incident' && activeRecord.incidents.map((incident) => (
              <article key={incident.title} className="record-article">
                <EvidenceBadge state={incident.evidence} />
                <h3>{incident.title}</h3>
                <p>{incident.summary}</p>
                <small>{incident.sourceRef}</small>
              </article>
            ))}
            {recordTab === 'military' && <article className="record-article"><h3>Military interpretation</h3><p>{activeRecord.militaryInterpretation}</p></article>}
            {recordTab === 'civic' && (
              <div className="civic-grid">
                <article><h3>Field evidence</h3><p>{activeRecord.civicResponse.fieldEvidence}</p></article>
                <article><h3>Official Administration guidance</h3><p>{activeRecord.civicResponse.administrationGuidance}</p></article>
                <article><h3>Suspected propaganda</h3><p>{activeRecord.civicResponse.suspectedPropaganda}</p></article>
                <article><h3>Archive interpretation</h3><p>{activeRecord.civicResponse.archiveInterpretation}</p></article>
              </div>
            )}
            {recordTab === 'sources' && (
              <div className="source-list">
                {activeRecord.sources.map((source) => (
                  <article key={source.id}>
                    <EvidenceBadge state={source.reliability} />
                    <h3>{source.id}</h3>
                    <p>{source.title}</p>
                    <small>{source.location}</small>
                  </article>
                ))}
              </div>
            )}
          </div>

          <section className="annotation-section" aria-labelledby="annotations-heading">
            <div className="tool-panel-heading">
              <h3 id="annotations-heading">Anchored annotations</h3>
              <small>{selectedAnnotationIds.length} selected for export</small>
            </div>
            <div className="annotation-list">
              {activeRecord.annotations.map((annotation) => (
                <button
                  type="button"
                  key={annotation.id}
                  className={selectedAnnotationId === annotation.id ? 'is-active' : ''}
                  onClick={() => handleAnnotationSelect(annotation.id)}
                >
                  <span><strong>{annotation.title}</strong><small>{annotation.layer}</small></span>
                  <EvidenceBadge state={annotation.evidence} />
                </button>
              ))}
            </div>
            {selectedAnnotation && (
              <article className="annotation-detail">
                <h3>{selectedAnnotation.title}</h3>
                <p>{selectedAnnotation.description}</p>
                <dl>
                  <div><dt>Layer</dt><dd>{selectedAnnotation.layer}</dd></div>
                  <div><dt>Evidence</dt><dd>{selectedAnnotation.evidence}</dd></div>
                  <div><dt>Source</dt><dd>{selectedAnnotation.sourceRef}</dd></div>
                  <div><dt>Animation timestamp</dt><dd>{selectedAnnotation.animationTimestamp !== undefined ? `${selectedAnnotation.animationTimestamp.toFixed(1)} s` : 'Not applicable'}</dd></div>
                </dl>
              </article>
            )}
          </section>

          <div className="export-row">
            <button type="button" onClick={exportMarkdown}>Export Markdown</button>
            <button type="button" onClick={exportJson}>Export JSON</button>
          </div>
        </aside>
      </main>

      <section className={`diagnostics-panel ${diagnosticsOpen ? 'is-open' : ''}`} aria-label="Runtime diagnostics">
        <button type="button" className="diagnostics-toggle" onClick={() => setDiagnosticsOpen((value) => !value)} aria-expanded={diagnosticsOpen}>
          Diagnostics {diagnosticsOpen ? '-' : '+'}
        </button>
        {diagnosticsOpen && (
          <dl>
            <div><dt>Active specimen</dt><dd>{diagnostics.specimenId}</dd></div>
            <div><dt>Animation</dt><dd>{diagnostics.activeAnimation}</dd></div>
            <div><dt>Geometries</dt><dd>{diagnostics.geometries}</dd></div>
            <div><dt>Textures</dt><dd>{diagnostics.textures}</dd></div>
            <div><dt>Draw calls</dt><dd>{diagnostics.drawCalls}</dd></div>
            <div><dt>Triangles</dt><dd>{diagnostics.triangles.toLocaleString()}</dd></div>
            <div><dt>Camera</dt><dd>{diagnostics.cameraMode}</dd></div>
            <div><dt>Quality</dt><dd>{diagnostics.qualityTier}</dd></div>
            <div><dt>Clipping</dt><dd>{diagnostics.clipping}</dd></div>
          </dl>
        )}
      </section>
    </div>
  );
}
