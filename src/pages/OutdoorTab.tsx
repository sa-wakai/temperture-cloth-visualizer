import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWardrobe } from '../context/WardrobeContext';
import { recommendOutfit, formatOutdoorResult } from '../lib/outdoor-logic';
import { getCachedWeather, setCachedWeather, getCacheFreshness } from '../lib/weather-cache';
import { getCurrentPosition, getCachedGeo, setCachedGeo, geocodeCity } from '../lib/geolocation';
import { fetchWeather } from '../lib/weather-api';
import { WeatherStatus } from '../components/WeatherStatus';
import type { WeatherData, CacheFreshness } from '../lib/types';

type WeatherState =
  | { kind: 'loading' }
  | { kind: 'city-input' }
  | { kind: 'error' }
  | { kind: 'ready'; data: WeatherData; freshness: CacheFreshness };

export default function OutdoorTab() {
  const navigate = useNavigate();
  const { wardrobeItems } = useWardrobe();

  const [weatherState, setWeatherState] = useState<WeatherState>({ kind: 'loading' });
  const [cityInput, setCityInput] = useState('');
  const [cityError, setCityError] = useState('');

  const loadWeather = useCallback(async (lat: number, lon: number) => {
    setWeatherState({ kind: 'loading' });
    try {
      const data = await fetchWeather(lat, lon);
      setCachedWeather(data);
      setWeatherState({ kind: 'ready', data, freshness: 'fresh' });
    } catch {
      const cached = getCachedWeather();
      if (cached) {
        setWeatherState({ kind: 'ready', data: cached, freshness: getCacheFreshness(cached) });
      } else {
        setWeatherState({ kind: 'error' });
      }
    }
  }, []);

  const initWeather = useCallback(async () => {
    // Check fresh cache first
    const cached = getCachedWeather();
    if (cached) {
      const freshness = getCacheFreshness(cached);
      if (freshness === 'fresh') {
        setWeatherState({ kind: 'ready', data: cached, freshness });
        return;
      }
      if (freshness === 'stale') {
        setWeatherState({ kind: 'ready', data: cached, freshness });
        return;
      }
      // very-stale: attempt refetch
    }

    // Try geolocation (3s timeout)
    try {
      const { lat, lon } = await getCurrentPosition();
      setCachedGeo(lat, lon);
      await loadWeather(lat, lon);
    } catch {
      // Geolocation failed — try cached lat/lon
      const cachedGeo = getCachedGeo();
      if (cachedGeo) {
        await loadWeather(cachedGeo.lat, cachedGeo.lon);
      } else {
        // Show city input (primary path on iOS)
        if (cached) {
          setWeatherState({ kind: 'ready', data: cached, freshness: getCacheFreshness(cached) });
        } else {
          setWeatherState({ kind: 'city-input' });
        }
      }
    }
  }, [loadWeather]);

  // Load weather only on mount
  useEffect(() => {
    void initWeather();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleCitySearch(e: React.FormEvent) {
    e.preventDefault();
    if (!cityInput.trim()) return;
    setCityError('');
    setWeatherState({ kind: 'loading' });
    try {
      const { lat, lon } = await geocodeCity(cityInput.trim());
      setCachedGeo(lat, lon);
      await loadWeather(lat, lon);
    } catch {
      setCityError('都市が見つかりませんでした');
      setWeatherState({ kind: 'city-input' });
    }
  }

  // State priority order (from plan spec):
  // 1. Empty wardrobe → full-screen empty state
  // 2+. Defer to weatherState for loading/error/city-input/ready
  if (wardrobeItems.length === 0) {
    return (
      <div className="fullscreen-state">
        <p style={{ fontSize: 20, fontWeight: 700 }}>まず服を登録しましょう</p>
        <button className="btn-primary" style={{ maxWidth: 280 }} onClick={() => navigate('/setup')}>
          セットアップへ
        </button>
      </div>
    );
  }

  if (weatherState.kind === 'city-input') {
    return (
      <div style={{ paddingTop: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <form onSubmit={handleCitySearch} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="field">
            <label htmlFor="city">都市名を入力</label>
            <input
              id="city"
              type="text"
              value={cityInput}
              onChange={e => setCityInput(e.target.value)}
              placeholder="例：Tokyo"
            />
          </div>
          {cityError && <p className="field-error">{cityError}</p>}
          <button type="submit" className="btn-primary">検索</button>
        </form>
      </div>
    );
  }

  const outfitText = weatherState.kind === 'ready'
    ? formatOutdoorResult(recommendOutfit(wardrobeItems, weatherState.data))
    : null;

  const isNoMatch = outfitText?.includes('登録アイテムなし') ?? false;

  return (
    <div style={{ paddingTop: 32, paddingBottom: 24, flex: 1 }}>
      {weatherState.kind !== 'ready' ? (
        <WeatherStatus state={
          weatherState.kind === 'loading'
            ? { kind: 'loading' }
            : { kind: 'error', onRetry: initWeather }
        } />
      ) : (
        <>
          <h1 style={{ marginBottom: 0 }}>
            {isNoMatch ? (
              <span style={{ fontSize: 20, fontWeight: 600 }}>
                登録アイテムなし —{' '}
                <button className="btn-text" style={{ fontSize: 18 }} onClick={() => navigate('/setup')}>
                  セットアップへ
                </button>
              </span>
            ) : outfitText}
          </h1>
          <WeatherStatus state={{ kind: 'ready', data: weatherState.data, freshness: weatherState.freshness }} />
        </>
      )}
    </div>
  );
}
