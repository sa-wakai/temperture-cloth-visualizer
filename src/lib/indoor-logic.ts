import type { ChildPattern } from './types';

export type IndoorResult =
  | { kind: 'match'; pattern: ChildPattern }
  | { kind: 'no-match' }
  | { kind: 'no-patterns' };

// Upper bounds exclusive (<), lower bounds inclusive (>=).
function patternMatches(p: ChildPattern, roomTemp: number, humidity: number): boolean {
  return roomTemp >= p.tempMin && roomTemp < p.tempMax
    && humidity >= p.humidityMin && humidity < p.humidityMax;
}

export function matchIndoorPattern(
  patterns: ChildPattern[],
  roomTemp: number,
  humidity: number,
): IndoorResult {
  if (patterns.length === 0) return { kind: 'no-patterns' };

  const matches = patterns.filter(p => patternMatches(p, roomTemp, humidity));
  if (matches.length === 0) return { kind: 'no-match' };

  // Multiple matches: pick narrowest temperature range. Tie-break: first in registration order.
  const best = matches.reduce((a, b) => {
    const rangeA = a.tempMax - a.tempMin;
    const rangeB = b.tempMax - b.tempMin;
    return rangeA <= rangeB ? a : b;
  });

  return { kind: 'match', pattern: best };
}

export function detectOverlap(
  existing: ChildPattern[],
  candidate: ChildPattern,
  excludeId?: string,
): ChildPattern | null {
  for (const p of existing) {
    if (p.id === excludeId) continue;
    const tempOverlap = candidate.tempMin < p.tempMax && candidate.tempMax > p.tempMin;
    const humidityOverlap = candidate.humidityMin < p.humidityMax && candidate.humidityMax > p.humidityMin;
    if (tempOverlap && humidityOverlap) return p;
  }
  return null;
}
