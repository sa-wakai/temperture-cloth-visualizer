export const AC_HOT_THRESHOLD = 27;
export const AC_COLD_THRESHOLD = 19;

export type AcRecommendation = 'hot' | 'cold' | null;

export function getAcRecommendation(temp: number): AcRecommendation {
  if (temp >= AC_HOT_THRESHOLD) return 'hot';
  if (temp <= AC_COLD_THRESHOLD) return 'cold';
  return null;
}
