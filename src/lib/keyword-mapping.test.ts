import { describe, it, expect } from 'vitest';
import { detectLayer } from './keyword-mapping';

describe('detectLayer', () => {
  it('detects ダウン → heavy (not waterproof)', () => {
    const r = detectLayer('ダウンジャケット');
    expect(r.layer).toBe('heavy');
    expect(r.waterproof).toBe(false);
  });

  it('detects レインコート → heavy + waterproof', () => {
    const r = detectLayer('レインコート');
    expect(r.layer).toBe('heavy');
    expect(r.waterproof).toBe(true);
  });

  it('detects パーカー → mid (not waterproof)', () => {
    const r = detectLayer('パーカー');
    expect(r.layer).toBe('mid');
    expect(r.waterproof).toBe(false);
  });

  it('detects 薄手 → light-layer', () => {
    const r = detectLayer('薄手ジャケット');
    expect(r.layer).toBe('light-layer');
    expect(r.waterproof).toBe(false);
  });

  it('detects fleece → mid', () => {
    const r = detectLayer('fleece jacket');
    expect(r.layer).toBe('mid');
    expect(r.waterproof).toBe(false);
  });

  it('is case-insensitive', () => {
    expect(detectLayer('FLEECE').layer).toBe('mid');
    expect(detectLayer('Raincoat').waterproof).toBe(true);
  });

  it('waterproof takes priority over heavy (レインコート contains コート)', () => {
    // レインコート matches waterproof rule BEFORE the generic コート (heavy) rule
    const r = detectLayer('レインコート');
    expect(r.waterproof).toBe(true);
  });

  it('returns unknown for unrecognized name', () => {
    expect(detectLayer('なんとかウェア').layer).toBe('unknown');
  });
});
