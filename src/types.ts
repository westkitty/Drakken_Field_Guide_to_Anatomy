export type LayerId = 'surface' | 'structure' | 'internal' | 'functional';
export type CameraMode = 'perspective' | 'orthographic';
export type CameraPreset = 'front' | 'side' | 'dorsal' | 'ventral' | 'three-quarter';
export type EvidenceState =
  | 'Confirmed'
  | 'Corroborated'
  | 'Reconstructed'
  | 'Inferred'
  | 'Disputed'
  | 'Propagandized'
  | 'Non-canon prototype'
  | 'Unknown';

export type SpecimenCategory =
  | 'mobile organism'
  | 'siege or processing entity'
  | 'planetary infrastructure';

export interface SourceReference {
  id: string;
  title: string;
  location: string;
  reliability: EvidenceState;
}

export interface SpecimenAnnotation {
  id: string;
  title: string;
  description: string;
  layer: LayerId;
  evidence: EvidenceState;
  sourceRef: string;
  position: [number, number, number];
  animationTimestamp?: number;
}

export interface SpecimenRecord {
  id: string;
  archiveId: string;
  designation: string;
  category: SpecimenCategory;
  archetype: string;
  canonStatus: 'Working canon' | 'Reconstructed working canon';
  evidenceStatus: EvidenceState;
  description: string;
  dimensions: {
    canon: string;
    visualizationHeightMeters: number;
    visualizationNote: string;
  };
  estimatedMass: string;
  environment: string;
  operationalRole: string;
  threatClassification: string;
  modelAssetRef: string;
  layers: Record<LayerId, string>;
  animations: string[];
  annotations: SpecimenAnnotation[];
  incidents: Array<{
    title: string;
    summary: string;
    evidence: EvidenceState;
    sourceRef: string;
  }>;
  militaryInterpretation: string;
  civicResponse: {
    fieldEvidence: string;
    administrationGuidance: string;
    suspectedPropaganda: string;
    archiveInterpretation: string;
  };
  sources: SourceReference[];
  recordRevision: string;
  assetVersion: string;
  evidenceTags: string[];
  sourceStatus: string;
  modelAvailability: string;
}

export interface AnimationState {
  name: string;
  playing: boolean;
  speed: number;
  loop: boolean;
  restartToken: number;
}

export interface ClipState {
  enabled: boolean;
  axis: 'x' | 'y' | 'z';
  position: number;
  inverted: boolean;
}

export interface DiagnosticsSnapshot {
  specimenId: string;
  activeAnimation: string;
  geometries: number;
  textures: number;
  drawCalls: number;
  triangles: number;
  cameraMode: CameraMode;
  qualityTier: 'standard' | 'reduced';
  clipping: string;
}
