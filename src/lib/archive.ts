import rawSpecimens from '../data/specimens.json';
import type { EvidenceState, SpecimenRecord } from '../types';

export const specimens = rawSpecimens as SpecimenRecord[];

export const evidenceStates: EvidenceState[] = [
  'Confirmed',
  'Corroborated',
  'Reconstructed',
  'Inferred',
  'Disputed',
  'Propagandized',
  'Non-canon prototype',
  'Unknown',
];

export function findSpecimen(id: string): SpecimenRecord {
  const record = specimens.find((item) => item.id === id);
  if (!record) {
    throw new Error(`Unknown specimen: ${id}`);
  }
  return record;
}


export function resolveAnimationName(record: SpecimenRecord, requested: string): string {
  return record.animations.includes(requested) ? requested : record.animations[0];
}

export function distanceMeters(a: [number, number, number], b: [number, number, number]): number {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const dz = b[2] - a[2];
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

export function formatMeters(value: number): string {
  if (!Number.isFinite(value)) {
    return 'Unknown';
  }
  return `${value.toFixed(value < 10 ? 2 : 1)} m`;
}

export function exportRecordJson(record: SpecimenRecord, selectedAnnotationIds: string[]): string {
  const selectedAnnotations = record.annotations.filter((annotation) =>
    selectedAnnotationIds.includes(annotation.id),
  );

  return JSON.stringify(
    {
      archiveId: record.archiveId,
      designation: record.designation,
      revision: record.recordRevision,
      evidenceStatus: record.evidenceStatus,
      dimensions: record.dimensions,
      selectedAnnotations,
      sources: record.sources,
      canonStatus: record.canonStatus,
      assetVersion: record.assetVersion,
      exportTimestamp: new Date().toISOString(),
    },
    null,
    2,
  );
}

export function exportRecordMarkdown(record: SpecimenRecord, selectedAnnotationIds: string[]): string {
  const selectedAnnotations = record.annotations.filter((annotation) =>
    selectedAnnotationIds.includes(annotation.id),
  );
  const sourceLines = record.sources.length
    ? record.sources.map((source) => `- ${source.id}: ${source.title} (${source.location})`).join('\n')
    : '- Source unavailable';
  const annotationLines = selectedAnnotations.length
    ? selectedAnnotations
        .map(
          (annotation) =>
            `- **${annotation.title}** [${annotation.evidence}] - ${annotation.description} (${annotation.sourceRef})`,
        )
        .join('\n')
    : '- None selected';

  return `# ${record.designation}\n\n` +
    `- Archive ID: ${record.archiveId}\n` +
    `- Record revision: ${record.recordRevision}\n` +
    `- Evidence status: ${record.evidenceStatus}\n` +
    `- Canon status: ${record.canonStatus}\n` +
    `- Canon dimensions: ${record.dimensions.canon}\n` +
    `- Visualization scale: ${record.dimensions.visualizationHeightMeters} m (${record.dimensions.visualizationNote})\n` +
    `- Asset version: ${record.assetVersion}\n` +
    `- Export timestamp: ${new Date().toISOString()}\n\n` +
    `## Selected annotations\n\n${annotationLines}\n\n` +
    `## Sources\n\n${sourceLines}\n`;
}

export function downloadText(filename: string, text: string, mime: string): void {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export interface LoadGate {
  requestId: number;
  activeId: string;
}

export function beginLoad(gate: LoadGate, nextId: string): LoadGate {
  return { requestId: gate.requestId + 1, activeId: nextId };
}

export function isCurrentLoad(gate: LoadGate, requestId: number, id: string): boolean {
  return gate.requestId === requestId && gate.activeId === id;
}
