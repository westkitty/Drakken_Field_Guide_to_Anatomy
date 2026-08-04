import fs from 'node:fs';

const patch = (path, transform) => {
  const before = fs.readFileSync(path, 'utf8');
  const after = transform(before);
  if (after === before) return false;
  fs.writeFileSync(path, after);
  return true;
};

const changes = [];

if (patch('src/scene/SpecimenRouter.tsx', (source) => {
  let next = source;
  if (!next.includes("import { RecordEnhancementLayer }")) {
    next = next.replace(
      "import type { SpecimenModelProps } from './SpecimenCommon';",
      "import type { SpecimenModelProps } from './SpecimenCommon';\nimport { RecordEnhancementLayer } from './RecordEnhancementLayer';",
    );
  }
  if (next.includes('export function SpecimenModel(props: SpecimenModelProps) {')) {
    next = next.replace('export function SpecimenModel(props: SpecimenModelProps) {', 'function ResolvedSpecimenModel(props: SpecimenModelProps) {');
  }
  if (!next.includes('function EnhancedSpecimenModel')) {
    next += `\n\nfunction EnhancedSpecimenModel(props: SpecimenModelProps) {\n  return (\n    <group>\n      <ResolvedSpecimenModel {...props} />\n      <RecordEnhancementLayer {...props} />\n    </group>\n  );\n}\n\nexport { EnhancedSpecimenModel as SpecimenModel };\n`;
  }
  return next;
})) changes.push('src/scene/SpecimenRouter.tsx');

if (patch('src/App.tsx', (source) => {
  let next = source;
  if (!next.includes('registryTriggerRef')) {
    next = next.replace(
      "  const orientationPreviousFocus = useRef<HTMLElement | null>(null);",
      "  const orientationPreviousFocus = useRef<HTMLElement | null>(null);\n  const registryTriggerRef = useRef<HTMLButtonElement>(null);\n  const toolsTriggerRef = useRef<HTMLButtonElement>(null);\n  const recordTriggerRef = useRef<HTMLButtonElement>(null);\n  const diagnosticsTriggerRef = useRef<HTMLButtonElement>(null);\n  const lastPanelTriggerRef = useRef<HTMLButtonElement | null>(null);",
    );
  }

  if (!next.includes('const closePanels = useCallback')) {
    next = next.replace(
      "  const selectedAnnotation = activeRecord.annotations.find((item) => item.id === selectedAnnotationId) ?? null;",
      `  const selectedAnnotation = activeRecord.annotations.find((item) => item.id === selectedAnnotationId) ?? null;\n\n  const closePanels = useCallback((restoreFocus = true) => {\n    setRegistryOpen(false);\n    setRecordOpen(false);\n    setToolsOpen(false);\n    setDiagnosticsOpen(false);\n    if (restoreFocus) window.requestAnimationFrame(() => lastPanelTriggerRef.current?.focus());\n  }, []);`,
    );
  }

  if (!next.includes("document.querySelector<HTMLElement>('.registry-panel.is-open")) {
    const anchor = "  const addMeasurementPoint = useCallback((point: [number, number, number]) => {";
    next = next.replace(anchor, `  useEffect(() => {\n    const selector = registryOpen\n      ? '.registry-panel.is-open'\n      : toolsOpen\n        ? '.tools-panel.is-open'\n        : recordOpen\n          ? '.record-panel.is-open'\n          : null;\n    if (!selector) return;\n    const frame = window.requestAnimationFrame(() => {\n      const panel = document.querySelector<HTMLElement>(selector);\n      panel?.querySelector<HTMLElement>('input, button, select, [href], [tabindex]:not([tabindex="-1"])')?.focus();\n    });\n    return () => window.cancelAnimationFrame(frame);\n  }, [recordOpen, registryOpen, toolsOpen]);\n\n${anchor}`);
  }

  next = next.replace(
    `      if (event.key === 'Escape') {\n        setMeasurementMode(false);\n        setRegistryOpen(false);\n        setRecordOpen(false);\n        setToolsOpen(false);\n        setDiagnosticsOpen(false);\n        setOrientationOpen(false);\n        return;\n      }`,
    `      if (event.key === 'Escape') {\n        setMeasurementMode(false);\n        closePanels();\n        setOrientationOpen(false);\n        return;\n      }`,
  );

  if (!next.includes("if (key === 'g')")) {
    next = next.replace(
      "      if (editable) return;\n      if (event.key.toLowerCase() === 'r') {",
      `      if (editable) return;\n      const key = event.key.toLowerCase();\n      if (key === 'g') {\n        lastPanelTriggerRef.current = registryTriggerRef.current;\n        setRegistryOpen((value) => !value);\n        setToolsOpen(false);\n        setRecordOpen(false);\n        setDiagnosticsOpen(false);\n        return;\n      }\n      if (key === 't') {\n        lastPanelTriggerRef.current = toolsTriggerRef.current;\n        setToolsOpen((value) => !value);\n        setRegistryOpen(false);\n        setRecordOpen(false);\n        setDiagnosticsOpen(false);\n        return;\n      }\n      if (key === 'i') {\n        lastPanelTriggerRef.current = recordTriggerRef.current;\n        setRecordOpen((value) => !value);\n        setRegistryOpen(false);\n        setToolsOpen(false);\n        setDiagnosticsOpen(false);\n        return;\n      }\n      if (key === 'd') {\n        lastPanelTriggerRef.current = diagnosticsTriggerRef.current;\n        setDiagnosticsOpen((value) => !value);\n        return;\n      }\n      if (key === 'r') {`,
    );
  }

  next = next.replace('  }, []);\n\n  const exportMarkdown', '  }, [closePanels]);\n\n  const exportMarkdown');

  next = next.replace(
    '<button type="button" className="hud-brand" onClick={() => setOrientationOpen(true)}>',
    '<button type="button" className="hud-brand" aria-label="Open archive briefing" title="Briefing" onClick={() => setOrientationOpen(true)}>',
  );
  next = next.replace(
    '<button type="button" aria-pressed={registryOpen} onClick={() => { setRegistryOpen((v) => !v); setRecordOpen(false); setToolsOpen(false); }}>Registry</button>',
    '<button ref={registryTriggerRef} type="button" aria-label="Open specimen registry" aria-keyshortcuts="G" title="Registry (G)" aria-pressed={registryOpen} onClick={(event) => { lastPanelTriggerRef.current = event.currentTarget; setRegistryOpen((v) => !v); setRecordOpen(false); setToolsOpen(false); setDiagnosticsOpen(false); }}>Registry</button>',
  );
  next = next.replace(
    '<button type="button" aria-pressed={toolsOpen} onClick={() => { setToolsOpen((v) => !v); setRegistryOpen(false); setRecordOpen(false); }}>Tools</button>',
    '<button ref={toolsTriggerRef} type="button" aria-label="Open examination tools" aria-keyshortcuts="T" title="Tools (T)" aria-pressed={toolsOpen} onClick={(event) => { lastPanelTriggerRef.current = event.currentTarget; setToolsOpen((v) => !v); setRegistryOpen(false); setRecordOpen(false); setDiagnosticsOpen(false); }}>Tools</button>',
  );
  next = next.replace(
    '<button type="button" aria-pressed={recordOpen} onClick={() => { setRecordOpen((v) => !v); setRegistryOpen(false); setToolsOpen(false); }}>Record</button>',
    '<button ref={recordTriggerRef} type="button" aria-label="Open specimen record" aria-keyshortcuts="I" title="Record (I)" aria-pressed={recordOpen} onClick={(event) => { lastPanelTriggerRef.current = event.currentTarget; setRecordOpen((v) => !v); setRegistryOpen(false); setToolsOpen(false); setDiagnosticsOpen(false); }}>Record</button>',
  );
  next = next.replace(
    '<button type="button" aria-pressed={diagnosticsOpen} onClick={() => setDiagnosticsOpen((v) => !v)}>Diag</button>',
    '<button ref={diagnosticsTriggerRef} type="button" aria-label="Open diagnostics" aria-keyshortcuts="D" title="Diagnostics (D)" aria-pressed={diagnosticsOpen} onClick={(event) => { lastPanelTriggerRef.current = event.currentTarget; setDiagnosticsOpen((v) => !v); }}>Diag</button>',
  );

  if (!next.includes('className="drawer-scrim"')) {
    next = next.replace(
      '      </nav>\n\n      <main className="archive-layout">',
      '      </nav>\n\n      {(registryOpen || toolsOpen || recordOpen) && <button type="button" className="drawer-scrim" aria-label="Close open panel" onClick={() => closePanels()} />}\n\n      <main className="archive-layout">',
    );
  }

  return next;
})) changes.push('src/App.tsx');

if (patch('src/components/ExaminationChamber.tsx', (source) => {
  let next = source;
  if (!next.includes('  Bounds,')) {
    next = next.replace('  ContactShadows,', '  Bounds,\n  ContactShadows,');
    next = next.replace('  PerspectiveCamera,', '  PerspectiveCamera,\n  useBounds,');
  }

  if (!next.includes('function FitToSpecimen')) {
    next = next.replace(
      'function CameraController({',
      `function FitToSpecimen({ recordId, resetToken }: { recordId: string; resetToken: number }) {\n  const bounds = useBounds();\n  useEffect(() => {\n    const frame = window.requestAnimationFrame(() => bounds.refresh().clip().fit());\n    return () => window.cancelAnimationFrame(frame);\n  }, [bounds, recordId, resetToken]);\n  return null;\n}\n\nfunction CameraController({`,
    );
  }

  next = next.replace("<meshStandardMaterial color=\"#3a4650\" roughness={0.88} metalness={0.06} />", "<meshStandardMaterial color=\"#171d22\" roughness={0.92} metalness={0.04} />");
  next = next.replace("<gridHelper args={[52, 52, '#8aa2b1', '#526570']}", "<gridHelper args={[52, 52, '#34434d', '#28343c']}");
  next = next.replace('intensity={2.25}', 'intensity={1.15}');
  next = next.replace('<ambientLight intensity={0.85} />', '<ambientLight intensity={0.38} />');
  next = next.replace('intensity={4.4}', 'intensity={2.55}');
  next = next.replace('color="#b9e9ff" intensity={2.4}', 'color="#b9e9ff" intensity={1.15}');
  next = next.replace('intensity={3.2} angle={0.52}', 'intensity={1.7} angle={0.52}');
  next = next.replace('intensity={2.1} distance={24}', 'intensity={0.95} distance={24}');
  next = next.replace('intensity={1.25} distance={18}', 'intensity={0.65} distance={18}');
  next = next.replace("gl.setClearColor('#26343f');", "gl.setClearColor('#1b2329');");
  next = next.replace('gl.toneMappingExposure = 1.22;', 'gl.toneMappingExposure = 1.02;');
  next = next.replace("<color attach=\"background\" args={['#26343f']} />", "<color attach=\"background\" args={['#1b2329']} />");
  next = next.replace("<fog attach=\"fog\" args={['#26343f', 38, 92]} />", "<fog attach=\"fog\" args={['#1b2329', 42, 96]} />");
  next = next.replace('opacity={0.5}\n            scale={28}', 'opacity={0.28}\n            scale={28}');

  if (!next.includes('<Bounds fit clip observe margin={1.14}>')) {
    next = next.replace(
      `          <SpecimenModel\n            key={props.record.id}\n            record={props.record}`,
      `          <Bounds fit clip observe margin={1.14}>\n          <SpecimenModel\n            key={props.record.id}\n            record={props.record}`,
    );
    next = next.replace(
      `            onSelectAnnotation={props.onSelectAnnotation}\n          />\n          <ContactShadows`,
      `            onSelectAnnotation={props.onSelectAnnotation}\n          />\n          <FitToSpecimen recordId={props.record.id} resetToken={props.resetCameraToken} />\n          </Bounds>\n          <ContactShadows`,
    );
  }

  return next;
})) changes.push('src/components/ExaminationChamber.tsx');

if (patch('src/immersive-shell.css', (source) => {
  if (source.includes('.drawer-scrim')) return source;
  return `${source}\n.drawer-scrim {\n  position: fixed;\n  inset: 0;\n  z-index: 90;\n  width: 100vw;\n  height: 100vh;\n  padding: 0;\n  border: 0;\n  border-radius: 0;\n  background: rgba(0, 0, 0, 0.2);\n  backdrop-filter: blur(1px);\n}\n`;
})) changes.push('src/immersive-shell.css');

console.log(changes.length ? `Applied: ${changes.join(', ')}` : 'No changes required.');
