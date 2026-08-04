import { describe, expect, it } from 'vitest';
import { specimens } from './lib/archive';
import { recordEnhancementSpecs } from './scene/recordEnhancementData';

const validLayers = new Set(['surface', 'structure', 'internal', 'functional']);
const rejectedBoilerplate = [
  'record-specific procedural geometry added',
  'custom animated parts via useanimationclock',
  'material uniqueness applied',
  'pass',
];

describe('record enhancement specifications', () => {
  it('covers the closed 59-record registry exactly', () => {
    const registryIds = specimens.map((record) => record.id).sort();
    const enhancementIds = Object.keys(recordEnhancementSpecs).sort();

    expect(registryIds).toHaveLength(59);
    expect(enhancementIds).toHaveLength(59);
    expect(enhancementIds).toEqual(registryIds);
  });

  it('provides two distinct, explicit and layer-owned improvements per record', () => {
    for (const record of specimens) {
      const specification = recordEnhancementSpecs[record.id];
      expect(specification, record.id).toBeDefined();
      expect(validLayers.has(specification.primary.layer), `${record.id} primary layer`).toBe(true);
      expect(validLayers.has(specification.secondary.layer), `${record.id} secondary layer`).toBe(true);
      expect(specification.primary.label.trim().length, `${record.id} primary label`).toBeGreaterThan(12);
      expect(specification.secondary.label.trim().length, `${record.id} secondary label`).toBeGreaterThan(12);
      expect(specification.primary.label, `${record.id} duplicate improvements`).not.toBe(specification.secondary.label);
      expect(specification.basis.trim().length, `${record.id} canon basis`).toBeGreaterThan(24);

      const normalizedClaims = [
        specification.primary.label,
        specification.secondary.label,
        specification.basis,
      ].map((claim) => claim.trim().toLowerCase());

      for (const boilerplate of rejectedBoilerplate) {
        expect(normalizedClaims, `${record.id} repeats rejected boilerplate`).not.toContain(boilerplate);
      }
    }
  });
});
