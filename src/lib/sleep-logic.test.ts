import { describe, it, expect } from 'vitest';
import { getAcRecommendation, AC_HOT_THRESHOLD, AC_COLD_THRESHOLD } from './sleep-logic';

describe('getAcRecommendation', () => {
  it('returns hot at threshold', () => {
    expect(getAcRecommendation(AC_HOT_THRESHOLD)).toBe('hot');
  });

  it('returns hot above threshold', () => {
    expect(getAcRecommendation(30)).toBe('hot');
    expect(getAcRecommendation(35)).toBe('hot');
  });

  it('returns cold at threshold', () => {
    expect(getAcRecommendation(AC_COLD_THRESHOLD)).toBe('cold');
  });

  it('returns cold below threshold', () => {
    expect(getAcRecommendation(15)).toBe('cold');
    expect(getAcRecommendation(0)).toBe('cold');
  });

  it('returns null in comfortable range', () => {
    expect(getAcRecommendation(20)).toBeNull();
    expect(getAcRecommendation(23)).toBeNull();
    expect(getAcRecommendation(26)).toBeNull();
    expect(getAcRecommendation(26.9)).toBeNull();
  });

  it('boundary: 26 is comfortable, 27 is hot', () => {
    expect(getAcRecommendation(26)).toBeNull();
    expect(getAcRecommendation(27)).toBe('hot');
  });

  it('boundary: 20 is comfortable, 19 is cold', () => {
    expect(getAcRecommendation(20)).toBeNull();
    expect(getAcRecommendation(19)).toBe('cold');
  });
});
