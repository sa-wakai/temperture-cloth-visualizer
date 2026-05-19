import { describe, it, expect } from 'vitest';
import { recommendOutfit, formatOutdoorResult } from './outdoor-logic';
import type { WardrobeItem, WeatherData } from './types';

const mkItem = (id: string, name: string, layer: WardrobeItem['layer'], waterproof = false): WardrobeItem =>
  ({ id, name, layer, waterproof });

const mkWeather = (apparent: number, precip = 0, temp?: number): WeatherData => ({
  temperature_2m: temp ?? apparent,
  apparent_temperature: apparent,
  precipitation: precip,
  fetchedAt: Date.now(),
  lat: 35.6,
  lon: 139.7,
});

const allItems: WardrobeItem[] = [
  mkItem('1', 'ダウン', 'heavy'),
  mkItem('2', 'フリース', 'mid'),
  mkItem('3', 'デニムジャケット', 'light-layer'),
  mkItem('4', 'レインコート', 'heavy', true),
];

describe('recommendOutfit — temperature ranges', () => {
  it('< 2°C → heavy', () => {
    const r = recommendOutfit(allItems, mkWeather(1));
    expect(r.kind).toBe('normal');
    if (r.kind === 'normal') expect(r.item.layer).toBe('heavy');
  });

  it('2°C (boundary, inclusive) → mid', () => {
    const r = recommendOutfit(allItems, mkWeather(2));
    expect(r.kind).toBe('normal');
    if (r.kind === 'normal') expect(r.item.layer).toBe('mid');
  });

  it('10°C (boundary, inclusive) → light-layer', () => {
    const r = recommendOutfit(allItems, mkWeather(10));
    expect(r.kind).toBe('normal');
    if (r.kind === 'normal') expect(r.item.layer).toBe('light-layer');
  });

  it('18°C (boundary, inclusive) → no jacket', () => {
    const r = recommendOutfit(allItems, mkWeather(18));
    expect(r.kind).toBe('no-jacket');
  });

  it('> 18°C → no jacket', () => {
    expect(recommendOutfit(allItems, mkWeather(25)).kind).toBe('no-jacket');
  });
});

describe('recommendOutfit — precipitation', () => {
  it('precip > 0.1 + waterproof item → rain result', () => {
    const r = recommendOutfit(allItems, mkWeather(5, 0.5));
    expect(r.kind).toBe('rain');
    if (r.kind === 'rain') expect(r.item.waterproof).toBe(true);
  });

  it('precip > 0.1 + no waterproof item → falls back to temp selection', () => {
    const noRain = allItems.filter(i => !i.waterproof);
    const r = recommendOutfit(noRain, mkWeather(5, 0.5));
    // should still give a result from temp-based logic, not no-match
    expect(r.kind).toBe('normal');
  });

  it('precip <= 0.1 → normal temp logic', () => {
    const r = recommendOutfit(allItems, mkWeather(5, 0.1));
    expect(r.kind).toBe('normal');
    if (r.kind === 'normal') expect(r.item.layer).toBe('mid');
  });
});

describe('recommendOutfit — fallback chain', () => {
  it('no heavy items → falls back to mid', () => {
    const items = [mkItem('1', 'フリース', 'mid'), mkItem('2', 'デニム', 'light-layer')];
    const r = recommendOutfit(items, mkWeather(0));
    expect(r.kind).toBe('normal');
    if (r.kind === 'normal') expect(r.item.layer).toBe('mid');
  });

  it('no mid items → falls back to heavy (warmer first)', () => {
    const items = [mkItem('1', 'ダウン', 'heavy'), mkItem('2', 'デニム', 'light-layer')];
    const r = recommendOutfit(items, mkWeather(5));
    expect(r.kind).toBe('normal');
    if (r.kind === 'normal') expect(r.item.layer).toBe('heavy');
  });

  it('no light-layer items → falls back to mid', () => {
    const items = [mkItem('1', 'ダウン', 'heavy'), mkItem('2', 'フリース', 'mid')];
    const r = recommendOutfit(items, mkWeather(12));
    expect(r.kind).toBe('normal');
    if (r.kind === 'normal') expect(r.item.layer).toBe('mid');
  });

  it('fallback chain exhausted → no-match', () => {
    const items: WardrobeItem[] = [];
    expect(recommendOutfit(items, mkWeather(5)).kind).toBe('no-items');
  });

  it('no-match when only unknown items exist', () => {
    const items = [mkItem('1', 'なんか', 'unknown')];
    expect(recommendOutfit(items, mkWeather(5)).kind).toBe('no-match');
  });
});

describe('recommendOutfit — empty wardrobe', () => {
  it('no items → no-items', () => {
    expect(recommendOutfit([], mkWeather(5)).kind).toBe('no-items');
  });
});

describe('formatOutdoorResult', () => {
  it('formats normal output correctly', () => {
    const r = recommendOutfit(allItems, mkWeather(5, 0, 7));
    expect(r.kind).toBe('normal');
    const s = formatOutdoorResult(r);
    expect(s).toContain('着ていこう');
    expect(s).toContain('7°C');
    expect(s).toContain('体感');
  });

  it('formats rain output', () => {
    const r = recommendOutfit(allItems, mkWeather(5, 1, 6));
    expect(r.kind).toBe('rain');
    const s = formatOutdoorResult(r);
    expect(s).toContain('雨予報');
  });

  it('formats no-jacket output', () => {
    const s = formatOutdoorResult({ kind: 'no-jacket', temperature_2m: 22, apparent_temperature: 20 });
    expect(s).toContain('上着いらない');
  });

  it('formats no-match output', () => {
    expect(formatOutdoorResult({ kind: 'no-match' })).toContain('登録アイテムなし');
  });
});
