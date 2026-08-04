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
  return `${value.toFixed(value < 10 ? 2 : 1)} reconstruction units`;
}

function selectedAnnotations(record: SpecimenRecord, selectedAnnotationIds: string[]) {
  return record.annotations.filter((annotation) => selectedAnnotationIds.includes(annotation.id));
}

export function exportRecordJson(record: SpecimenRecord, selectedAnnotationIds: string[]): string {
  const selected = selectedAnnotations(record, selectedAnnotationIds);
  return JSON.stringify(
    {
      ...record,
      selectedAnnotations: selected,
      exportMetadata: {
        exportTimestamp: new Date().toISOString(),
        selectedAnnotationIds,
        selectedAnnotations: selected,
        scaleNotice:
          'Procedural chamber geometry is normalized for examination. Visualization-height metadata is not a proven world-unit calibration.',
      },
    },
    null,
    2,
  );
}

export function exportRecordMarkdown(record: SpecimenRecord, selectedAnnotationIds: string[]): string {
  const selected = selectedAnnotations(record, selectedAnnotationIds);
  const sourceLines = record.sources.length
    ? record.sources.map((source) => `- **${source.id}** — ${source.title}; ${source.location}; reliability: ${source.reliability}`).join('\n')
    : '- Source unavailable';
  const annotationLines = selected.length
    ? selected
        .map(
          (annotation) =>
            `- **${annotation.title}** [${annotation.layer}; ${annotation.evidence}] — ${annotation.description} (${annotation.sourceRef})`,
        )
        .join('\n')
    : '- None selected';
  const incidentLines = record.incidents.length
    ? record.incidents
        .map((incident) => `### ${incident.title}\n\n${incident.summary}\n\n- Evidence: ${incident.evidence}\n- Source: ${incident.sourceRef}`)
        .join('\n\n')
    : 'No incident is recorded.';
  const layerLines = (Object.entries(record.layers) as Array<[keyof SpecimenRecord['layers'], string]>)
    .map(([layer, description]) => `- **${layer}:** ${description}`)
    .join('\n');
  const civicLines = [
    `- **Field evidence:** ${record.civicResponse.fieldEvidence}`,
    `- **Administration guidance:** ${record.civicResponse.administrationGuidance}`,
    `- **Suspected propaganda:** ${record.civicResponse.suspectedPropaganda}`,
    `- **Archive interpretation:** ${record.civicResponse.archiveInterpretation}`,
  ].join('\n');

  return `# ${record.designation}\n\n` +
    `- Archive ID: ${record.archiveId}\n` +
    `- Record revision: ${record.recordRevision}\n` +
    `- Asset version: ${record.assetVersion}\n` +
    `- Canon status: ${record.canonStatus}\n` +
    `- Evidence status: ${record.evidenceStatus}\n` +
    `- Category: ${record.category}\n` +
    `- Archetype: ${record.archetype}\n` +
    `- Threat classification: ${record.threatClassification}\n` +
    `- Canon dimensions: ${record.dimensions.canon}\n` +
    `- Visualization metadata: ${record.dimensions.visualizationHeightMeters} m; ${record.dimensions.visualizationNote}\n` +
    `- Estimated mass: ${record.estimatedMass}\n` +
    `- Environment: ${record.environment}\n` +
    `- Model asset reference: ${record.modelAssetRef}\n` +
    `- Model availability: ${record.modelAvailability}\n` +
    `- Source status: ${record.sourceStatus}\n` +
    `- Export timestamp: ${new Date().toISOString()}\n\n` +
    `> Scale notice: procedural chamber geometry is normalized for examination. Visualization-height metadata is not a proven world-unit calibration.\n\n` +
    `## Description\n\n${record.description}\n\n` +
    `## Operational role\n\n${record.operationalRole}\n\n` +
    `## Anatomy layers\n\n${layerLines}\n\n` +
    `## Operational animations\n\n${record.animations.map((animation) => `- ${animation}`).join('\n')}\n\n` +
    `## Selected annotations\n\n${annotationLines}\n\n` +
    `## Incidents\n\n${incidentLines}\n\n` +
    `## Military interpretation\n\n${record.militaryInterpretation}\n\n` +
    `## Civic response\n\n${civicLines}\n\n` +
    `## Evidence tags\n\n${record.evidenceTags.map((tag) => `- ${tag}`).join('\n')}\n\n` +
    `## Sources\n\n${sourceLines}\n`;
}

export function downloadText(filename: string, text: string, mime: string): void {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.hidden = true;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
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
