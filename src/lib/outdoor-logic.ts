import type { WardrobeItem, WeatherData, Layer } from './types';

export type OutdoorResult =
  | { kind: 'no-items' }
  | { kind: 'no-jacket'; temperature_2m: number; apparent_temperature: number }
  | { kind: 'rain'; item: WardrobeItem; temperature_2m: number; apparent_temperature: number }
  | { kind: 'normal'; item: WardrobeItem; temperature_2m: number; apparent_temperature: number }
  | { kind: 'no-match' };

function targetLayer(apparent: number): Layer | 'none' {
  if (apparent < 2) return 'heavy';
  if (apparent < 10) return 'mid';
  if (apparent < 18) return 'light-layer';
  return 'none';
}

// Fallback chain — "err warmer": when no match in current layer, prefer the warmer direction first.
// This prevents showing a light-layer suggestion when mid was expected — better to be too warm than cold.
const FALLBACK: Record<Exclude<Layer, 'unknown'>, Array<Exclude<Layer, 'unknown'>>> = {
  'heavy': ['mid', 'light-layer'],
  'mid': ['heavy', 'light-layer'],       // try heavy first (warmer)
  'light-layer': ['mid', 'heavy'],       // try mid first (warmer)
};

function firstItemOfLayer(items: WardrobeItem[], layer: Layer): WardrobeItem | undefined {
  return items.find(i => i.layer === layer);
}

export function recommendOutfit(
  items: WardrobeItem[],
  weather: WeatherData,
): OutdoorResult {
  const { temperature_2m, apparent_temperature, precipitation } = weather;

  if (items.length === 0) return { kind: 'no-items' };

  const layer = targetLayer(apparent_temperature);
  if (layer === 'none') {
    return { kind: 'no-jacket', temperature_2m, apparent_temperature };
  }

  // Precipitation filter: prefer waterproof items regardless of layer.
  if (precipitation > 0.1) {
    const waterproofItem = items.find(i => i.waterproof);
    if (waterproofItem) {
      return { kind: 'rain', item: waterproofItem, temperature_2m, apparent_temperature };
    }
    // No waterproof item — fall through to temperature-based selection.
  }

  // Temperature-based selection with fallback chain.
  const primary = firstItemOfLayer(items, layer);
  if (primary) return { kind: 'normal', item: primary, temperature_2m, apparent_temperature };

  const fallbackLayers = FALLBACK[layer as Exclude<Layer, 'unknown'>];
  for (const fallbackLayer of fallbackLayers) {
    const fallbackItem = firstItemOfLayer(items, fallbackLayer);
    if (fallbackItem) return { kind: 'normal', item: fallbackItem, temperature_2m, apparent_temperature };
  }

  return { kind: 'no-match' };
}

export function formatOutdoorResult(result: OutdoorResult): string {
  switch (result.kind) {
    case 'no-items':
      return 'まずセットアップで持っている服を登録してください';
    case 'no-jacket':
      return `上着いらない。${result.temperature_2m}°C（体感${result.apparent_temperature}°C）`;
    case 'rain':
      return `${result.item.name}で出かけよう — 雨予報。${result.temperature_2m}°C（体感${result.apparent_temperature}°C）`;
    case 'normal':
      return `${result.item.name}を着ていこう。${result.temperature_2m}°C（体感${result.apparent_temperature}°C）`;
    case 'no-match':
      return '登録アイテムなし — セットアップで追加してください';
  }
}
