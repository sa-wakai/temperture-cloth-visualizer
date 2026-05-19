import type { GeoLocation } from './types';
import { storageGet, storageSet } from './storage';

const GEO_KEY = 'cachedGeo';
const GEO_TIMEOUT_MS = 3000;

export function getCachedGeo(): GeoLocation | null {
  return storageGet<GeoLocation>(GEO_KEY);
}

export function setCachedGeo(lat: number, lon: number): void {
  storageSet(GEO_KEY, { lat, lon, fetchedAt: Date.now() });
}

export function getCurrentPosition(): Promise<{ lat: number; lon: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('geolocation-unavailable'));
      return;
    }
    const timer = setTimeout(() => {
      reject(new Error('geolocation-timeout'));
    }, GEO_TIMEOUT_MS);

    navigator.geolocation.getCurrentPosition(
      pos => {
        clearTimeout(timer);
        resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude });
      },
      err => {
        clearTimeout(timer);
        reject(err);
      },
    );
  });
}

export async function geocodeCity(city: string): Promise<{ lat: number; lon: number }> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('geocode-fetch-failed');
  const data = await res.json() as { results?: Array<{ latitude: number; longitude: number }> };
  const result = data.results?.[0];
  if (!result) throw new Error('geocode-no-results');
  return { lat: result.latitude, lon: result.longitude };
}
