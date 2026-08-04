import fs from 'node:fs';
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
