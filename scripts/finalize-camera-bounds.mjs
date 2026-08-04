import fs from 'node:fs';

const path = 'src/components/ExaminationChamber.tsx';
let source = fs.readFileSync(path, 'utf8');

source = source.replace(
  `function FitToSpecimen({ recordId, resetToken }: { recordId: string; resetToken: number }) {`,
  `function FitToSpecimen({ recordId, resetToken, mode }: { recordId: string; resetToken: number; mode: CameraMode }) {`,
);
source = source.replace(
  `  }, [bounds, recordId, resetToken]);`,
  `  }, [bounds, mode, recordId, resetToken]);`,
);
source = source.replace(
  `  useEffect(() => {\n    const camera = mode === 'perspective' ? perspective.current : orthographic.current;`,
  `  useEffect(() => {\n    if (commandToken === 0) return;\n    const camera = mode === 'perspective' ? perspective.current : orthographic.current;`,
);
source = source.replace(
  `<FitToSpecimen recordId={props.record.id} resetToken={props.resetCameraToken} />`,
  `<FitToSpecimen recordId={props.record.id} resetToken={props.resetCameraToken} mode={props.cameraMode} />`,
);
source = source.replace('margin={1.38}', 'margin={1.32}');

fs.writeFileSync(path, source);
console.log('Initial and reset framing now belong to bounds; explicit presets remain command-driven.');
