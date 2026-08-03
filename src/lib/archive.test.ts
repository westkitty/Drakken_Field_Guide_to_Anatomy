import { describe, expect, it } from 'vitest';
import {
  beginLoad,
  distanceMeters,
  evidenceStates,
  exportRecordJson,
  exportRecordMarkdown,
  isCurrentLoad,
  resolveAnimationName,
  specimens,
} from './archive';

const validCategories = new Set([
  'mobile organism',
  'siege or processing entity',
  'planetary infrastructure',
]);

function recordShapeIsValid(record: (typeof specimens)[number]): boolean {
  return Boolean(
    record.id &&
      record.archiveId &&
      record.designation &&
      validCategories.has(record.category) &&
      record.modelAssetRef.startsWith('proc-') &&
      record.animations.length >= 2 &&
      record.layers.surface &&
      record.layers.structure &&
      record.layers.internal &&
      record.layers.functional,
  );
}

describe('specimen manifest', () => {
  it('contains specimen records covering all required categories', () => {
    expect(specimens.length).toBe(59);
    expect(new Set(specimens.map((record) => record.category))).toEqual(validCategories);
  });

  it('uses unique stable IDs and valid asset references', () => {
    expect(new Set(specimens.map((record) => record.id)).size).toBe(specimens.length);
    expect(new Set(specimens.map((record) => record.archiveId)).size).toBe(specimens.length);
    expect(specimens.every((record) => record.modelAssetRef.startsWith('proc-'))).toBe(true);
  });

  it('satisfies the specimen layer and animation schema', () => {
    expect(specimens.every(recordShapeIsValid)).toBe(true);
  });

  it('uses recognized evidence states', () => {
    expect(
      specimens.every((record) =>
        [record.evidenceStatus, ...record.annotations.map((annotation) => annotation.evidence)].every(
          (state) => evidenceStates.includes(state),
        ),
      ),
    ).toBe(true);
  });
});

describe('measurement', () => {
  it('calculates a world-space 3-4-5 distance', () => {
    expect(distanceMeters([0, 0, 0], [3, 4, 0])).toBe(5);
  });
});

describe('citation-ready export', () => {
  it('exports JSON with selected annotations and sources', () => {
    const output = JSON.parse(exportRecordJson(specimens[0], ['sky-face']));
    expect(output.archiveId).toBe('DFA-ATM-001');
    expect(output.selectedAnnotations).toHaveLength(1);
    expect(output.sources.length).toBeGreaterThan(0);
  });

  it('exports Markdown without inventing missing citations', () => {
    const output = exportRecordMarkdown(specimens[0], []);
    expect(output).toContain('# Skymourn');
    expect(output).toContain('None selected');
    expect(output).toContain('SRC-SKY-001');
  });

  it('uses an honest empty source state', () => {
    const record = { ...specimens[0], sources: [] };
    expect(exportRecordMarkdown(record, [])).toContain('Source unavailable');
  });
});

describe('animation fallback', () => {
  it('falls back to the first stable animation name', () => {
    expect(resolveAnimationName(specimens[0], 'Unsupported Clip')).toBe('Melancholy Drift');
  });
});

describe('specimen request lifecycle', () => {
  it('rejects stale specimen results', () => {
    const first = beginLoad({ requestId: 0, activeId: 'skymourn' }, 'gorevault');
    const second = beginLoad(first, 'blood-ring');
    expect(isCurrentLoad(second, first.requestId, first.activeId)).toBe(false);
    expect(isCurrentLoad(second, second.requestId, second.activeId)).toBe(true);
  });
});
