export type Layer = 'heavy' | 'mid' | 'light-layer' | 'unknown';

export interface WardrobeItem {
  id: string;
  name: string;
  layer: Layer;
  waterproof: boolean;
}

export interface ChildPattern {
  id: string;
  name: string;
  description: string;
  tempMin: number;
  tempMax: number;
  humidityMin: number;
  humidityMax: number;
}

export interface WeatherData {
  temperature_2m: number;
  apparent_temperature: number;
  precipitation: number;
  fetchedAt: number;
  lat: number;
  lon: number;
}

export type CacheFreshness = 'fresh' | 'stale' | 'very-stale';

export interface GeoLocation {
  lat: number;
  lon: number;
  fetchedAt: number;
}
