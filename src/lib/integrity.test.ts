import { describe, expect, it } from 'vitest';

import assetLedger from '../../public/data/assets.json';
import licenseLedger from '../../public/data/licenses.json';
import provenanceLedger from '../../public/data/provenance.json';
import { evidenceStates, exportRecordJson, exportRecordMarkdown, specimens } from './archive';

function sorted(values: Iterable<string>): string[] {
  return [...values].sort((a, b) => a.localeCompare(b));
}

describe('59-record registry integrity', () => {
  it('keeps IDs, archive IDs, and asset IDs unique', () => {
    expect(specimens).toHaveLength(59);
    expect(new Set(specimens.map((record) => record.id)).size).toBe(59);
    expect(new Set(specimens.map((record) => record.archiveId)).size).toBe(59);
    expect(new Set(specimens.map((record) => record.modelAssetRef)).size).toBe(59);
  });

  it('keeps every annotation and incident attached to a declared source', () => {
    for (const record of specimens) {
      const sourceIds = new Set(record.sources.map((source) => source.id));
      expect(sourceIds.size, `${record.id}: duplicate source IDs`).toBe(record.sources.length);
      for (const annotation of record.annotations) {
        expect(sourceIds.has(annotation.sourceRef), `${record.id}/${annotation.id}`).toBe(true);
      }
      for (const incident of record.incidents) {
        expect(sourceIds.has(incident.sourceRef), `${record.id}/${incident.title}`).toBe(true);
      }
    }
  });

  it('keeps valid evidence, dimensions, layers, and operational states', () => {
    for (const record of specimens) {
      expect(evidenceStates).toContain(record.evidenceStatus);
      expect(record.dimensions.visualizationHeightMeters).toBeGreaterThan(0);
      expect(record.animations.length).toBeGreaterThanOrEqual(2);
      expect(Object.values(record.layers).every((description) => description.trim().length > 0)).toBe(true);
      expect(record.annotations.every((annotation) => evidenceStates.includes(annotation.evidence))).toBe(true);
    }
  });
});

describe('asset governance integrity', () => {
  const expected = new Set(specimens.map((record) => record.modelAssetRef));

  it('has one asset, provenance, and license entry for every specimen asset ID', () => {
    expect(sorted(assetLedger.assets.map((entry) => entry.assetId))).toEqual(sorted(expected));
    expect(sorted(provenanceLedger.records.map((entry) => entry.assetId))).toEqual(sorted(expected));
    expect(sorted(licenseLedger.records.map((entry) => entry.assetId))).toEqual(sorted(expected));
  });

  it('does not claim calibrated physical units for procedural chamber geometry', () => {
    expect(assetLedger.units).toBe('normalized reconstruction units');
    expect(assetLedger.calibrationStatus.toLowerCase()).toContain('not a proven world-unit calibration');
    expect(assetLedger.assets.every((entry) => entry.units === 'normalized reconstruction units')).toBe(true);
  });
});

describe('complete dossier exports', () => {
  const record = specimens[0];

  it('retains the complete record and selected annotation compatibility in JSON', () => {
    const output = JSON.parse(exportRecordJson(record, [record.annotations[0].id]));
    expect(output.description).toBe(record.description);
    expect(output.layers).toEqual(record.layers);
    expect(output.animations).toEqual(record.animations);
    expect(output.incidents).toEqual(record.incidents);
    expect(output.militaryInterpretation).toBe(record.militaryInterpretation);
    expect(output.civicResponse).toEqual(record.civicResponse);
    expect(output.selectedAnnotations).toHaveLength(1);
    expect(output.exportMetadata.scaleNotice).toContain('not a proven world-unit calibration');
  });

  it('retains every major dossier section in Markdown', () => {
    const output = exportRecordMarkdown(record, [record.annotations[0].id]);
    for (const heading of [
      '## Description',
      '## Operational role',
      '## Anatomy layers',
      '## Operational animations',
      '## Selected annotations',
      '## Incidents',
      '## Military interpretation',
      '## Civic response',
      '## Evidence tags',
      '## Sources',
    ]) {
      expect(output).toContain(heading);
    }
  });
});
