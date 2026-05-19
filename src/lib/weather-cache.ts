import type { WeatherData, CacheFreshness } from './types';
import { storageGet, storageSet } from './storage';

const CACHE_KEY = 'weatherCache';
const ONE_HOUR = 60 * 60 * 1000;
const TWO_HOURS = 2 * ONE_HOUR;

export function getCachedWeather(): WeatherData | null {
  return storageGet<WeatherData>(CACHE_KEY);
}

export function setCachedWeather(data: WeatherData): void {
  storageSet(CACHE_KEY, data);
}

export function getCacheFreshness(data: WeatherData, now = Date.now()): CacheFreshness {
  const age = now - data.fetchedAt;
  if (age < ONE_HOUR) return 'fresh';
  if (age < TWO_HOURS) return 'stale';
  return 'very-stale';
}
