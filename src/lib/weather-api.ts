import type { WeatherData } from './types';

export async function fetchWeather(lat: number, lon: number): Promise<WeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,precipitation`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('weather-fetch-failed');
  const data = await res.json() as {
    current: {
      temperature_2m: number;
      apparent_temperature: number;
      precipitation: number;
    };
  };
  const c = data.current;
  if (c.temperature_2m == null || c.apparent_temperature == null || c.precipitation == null) {
    throw new Error('weather-malformed');
  }
  return {
    temperature_2m: Math.round(c.temperature_2m),
    apparent_temperature: Math.round(c.apparent_temperature),
    precipitation: c.precipitation,
    fetchedAt: Date.now(),
    lat,
    lon,
  };
}
