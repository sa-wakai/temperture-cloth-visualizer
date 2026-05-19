import { describe, it, expect } from 'vitest';
import { matchIndoorPattern, detectOverlap } from './indoor-logic';
import type { ChildPattern } from './types';

const mkPattern = (
  id: string,
  name: string,
  tempMin: number,
  tempMax: number,
  humidityMin = 0,
  humidityMax = 100,
): ChildPattern => ({ id, name, description: '', tempMin, tempMax, humidityMin, humidityMax });

describe('matchIndoorPattern', () => {
  const patterns: ChildPattern[] = [
    mkPattern('p1', '暑い日', 28, 99, 0, 100),
    mkPattern('p2', '夏普通', 24, 28, 0, 70),
    mkPattern('p3', '蒸し暑い', 24, 28, 70, 100),
    mkPattern('p4', '快適', 20, 24, 0, 100),
  ];

  it('returns no-patterns when list is empty', () => {
    expect(matchIndoorPattern([], 25, 50).kind).toBe('no-patterns');
  });

  it('returns no-match when no pattern fits', () => {
    expect(matchIndoorPattern(patterns, 10, 50).kind).toBe('no-match');
  });

  it('matches exact pattern', () => {
    const r = matchIndoorPattern(patterns, 26, 60);
    expect(r.kind).toBe('match');
    if (r.kind === 'match') expect(r.pattern.id).toBe('p2');
  });

  it('upper bound is exclusive: roomTemp == tempMax does NOT match', () => {
    // p1 tempMin=28 — at exactly 28, p2/p3 have tempMax=28 so they DON'T match, p1 does
    const r = matchIndoorPattern(patterns, 28, 50);
    expect(r.kind).toBe('match');
    if (r.kind === 'match') expect(r.pattern.id).toBe('p1');
  });

  it('lower bound is inclusive: roomTemp == tempMin does match', () => {
    const r = matchIndoorPattern(patterns, 24, 50);
    expect(r.kind).toBe('match');
    if (r.kind === 'match') expect(r.pattern.id).toBe('p2');
  });

  it('humidity upper bound is exclusive', () => {
    // at humidity=70, p3 humidityMin=70 matches, p2 humidityMax=70 does NOT
    const r = matchIndoorPattern(patterns, 26, 70);
    expect(r.kind).toBe('match');
    if (r.kind === 'match') expect(r.pattern.id).toBe('p3');
  });

  it('multiple matches: picks narrowest temp range', () => {
    const wide = mkPattern('wide', '広い', 20, 30, 0, 100);
    const narrow = mkPattern('narrow', '狭い', 24, 27, 0, 100);
    const r = matchIndoorPattern([wide, narrow], 25, 50);
    expect(r.kind).toBe('match');
    if (r.kind === 'match') expect(r.pattern.id).toBe('narrow');
  });

  it('multiple matches with equal range: first in registration order wins', () => {
    const a = mkPattern('a', 'A', 20, 25, 0, 100);
    const b = mkPattern('b', 'B', 20, 25, 0, 100);
    const r = matchIndoorPattern([a, b], 22, 50);
    expect(r.kind).toBe('match');
    if (r.kind === 'match') expect(r.pattern.id).toBe('a');
  });
});

describe('detectOverlap', () => {
  const existing: ChildPattern[] = [
    mkPattern('e1', '既存1', 20, 25, 50, 80),
  ];

  it('no overlap when temp ranges do not intersect', () => {
    expect(detectOverlap(existing, mkPattern('n', 'new', 25, 30, 50, 80))).toBeNull();
  });

  it('no overlap when humidity ranges do not intersect', () => {
    expect(detectOverlap(existing, mkPattern('n', 'new', 20, 25, 80, 100))).toBeNull();
  });

  it('no overlap when only temp intersects', () => {
    expect(detectOverlap(existing, mkPattern('n', 'new', 22, 27, 80, 100))).toBeNull();
  });

  it('no overlap when only humidity intersects', () => {
    expect(detectOverlap(existing, mkPattern('n', 'new', 15, 20, 60, 90))).toBeNull();
  });

  it('detects overlap when both dimensions intersect', () => {
    const overlap = detectOverlap(existing, mkPattern('n', 'new', 22, 27, 60, 90));
    expect(overlap).not.toBeNull();
    expect(overlap?.id).toBe('e1');
  });

  it('skips pattern with excludeId (edit mode)', () => {
    expect(detectOverlap(existing, mkPattern('e1', 'same', 22, 27, 60, 90), 'e1')).toBeNull();
  });
});
