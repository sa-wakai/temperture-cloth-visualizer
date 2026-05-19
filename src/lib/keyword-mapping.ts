import type { Layer } from './types';

interface KeywordRule {
  keywords: string[];
  layer: Layer;
  waterproof: boolean;
}

// Precedence order: waterproof → heavy → mid → light-layer (first match wins)
const RULES: KeywordRule[] = [
  {
    keywords: ['raincoat', 'rain jacket', 'レインコート', '防水'],
    layer: 'heavy',
    waterproof: true,
  },
  {
    keywords: ['puffer', 'parka', 'down', 'ダウン', 'コート', 'winter coat'],
    layer: 'heavy',
    waterproof: false,
  },
  {
    keywords: ['fleece', 'sweatshirt', 'hoodie', 'フリース', 'パーカー', 'カーディガン'],
    layer: 'mid',
    waterproof: false,
  },
  {
    keywords: ['light jacket', 'windbreaker', '薄手', 'デニムジャケット'],
    layer: 'light-layer',
    waterproof: false,
  },
];

export function detectLayer(name: string): { layer: Layer; waterproof: boolean } {
  const lower = name.toLowerCase();
  for (const rule of RULES) {
    const matched = rule.keywords.some(kw => lower.includes(kw.toLowerCase()));
    if (matched) {
      return { layer: rule.layer, waterproof: rule.waterproof };
    }
  }
  return { layer: 'unknown', waterproof: false };
}
