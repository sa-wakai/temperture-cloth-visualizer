import { describe, it, expect } from 'vitest';
import { getCacheFreshness } from './weather-cache';
import type { WeatherData } from './types';

const mkWeatherData = (fetchedAt: number): WeatherData => ({
  temperature_2m: 10,
  apparent_temperature: 8,
  precipitation: 0,
  fetchedAt,
  lat: 35.6,
  lon: 139.7,
});

const ONE_HOUR = 60 * 60 * 1000;

describe('getCacheFreshness', () => {
  it('< 1 hour → fresh', () => {
    const now = Date.now();
    expect(getCacheFreshness(mkWeatherData(now - 30 * 60 * 1000), now)).toBe('fresh');
  });

  it('exactly 1 hour → stale', () => {
    const now = Date.now();
    expect(getCacheFreshness(mkWeatherData(now - ONE_HOUR), now)).toBe('stale');
  });

  it('1–2 hours → stale', () => {
    const now = Date.now();
    expect(getCacheFreshness(mkWeatherData(now - 90 * 60 * 1000), now)).toBe('stale');
  });

  it('exactly 2 hours → very-stale', () => {
    const now = Date.now();
    expect(getCacheFreshness(mkWeatherData(now - 2 * ONE_HOUR), now)).toBe('very-stale');
  });

  it('> 2 hours → very-stale', () => {
    const now = Date.now();
    expect(getCacheFreshness(mkWeatherData(now - 3 * ONE_HOUR), now)).toBe('very-stale');
  });
});
