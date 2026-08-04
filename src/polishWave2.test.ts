import { describe, expect, it } from 'vitest';
import { POLISH_WAVE_2_IMPROVEMENTS } from './polishWave2Manifest';

describe('product polish wave 2 ledger', () => {
  it('contains at least twenty distinct new polish improvements', () => {
    expect(POLISH_WAVE_2_IMPROVEMENTS.length).toBeGreaterThanOrEqual(20);
    expect(new Set(POLISH_WAVE_2_IMPROVEMENTS.map((item) => item.id)).size).toBe(POLISH_WAVE_2_IMPROVEMENTS.length);
    expect(POLISH_WAVE_2_IMPROVEMENTS.every((item) => item.title.trim().length > 12)).toBe(true);
  });

  it('does not reuse identifiers from the first polish contract', () => {
    expect(POLISH_WAVE_2_IMPROVEMENTS.every((item) => item.id.startsWith('W2-'))).toBe(true);
  });
});
