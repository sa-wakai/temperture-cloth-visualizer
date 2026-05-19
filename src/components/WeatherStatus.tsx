import type { WeatherData, CacheFreshness } from '../lib/types';

interface WeatherStatusProps {
  state:
    | { kind: 'loading' }
    | { kind: 'error'; onRetry: () => void }
    | { kind: 'ready'; data: WeatherData; freshness: CacheFreshness };
}

export function WeatherStatus({ state }: WeatherStatusProps) {
  if (state.kind === 'loading') {
    return (
      <div className="skeleton" aria-label="天気情報を取得中" role="status" />
    );
  }

  if (state.kind === 'error') {
    return (
      <div className="error-state">
        <p className="error-state-text">天気を取得できません</p>
        <button className="btn-outlined" onClick={state.onRetry}>
          再試行
        </button>
      </div>
    );
  }

  const { data, freshness } = state;
  const tempText = `${data.temperature_2m}°C（体感${data.apparent_temperature}°C）`;

  return (
    <>
      <p className="temp-display">{tempText}</p>
      {freshness === 'very-stale' && (
        <span className="stale-badge">2時間以上前のデータ</span>
      )}
    </>
  );
}
