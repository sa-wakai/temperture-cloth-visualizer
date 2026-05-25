import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWardrobe } from '../context/WardrobeContext';
import { matchIndoorPattern } from '../lib/indoor-logic';
import { getAcRecommendation } from '../lib/sleep-logic';
import type { AcRecommendation } from '../lib/sleep-logic';

interface FieldErrors {
  roomTemp?: string;
  humidity?: string;
}

interface SleepResult {
  key: number;
  temp: number;
  humidity: number;
  ac: AcRecommendation;
  childContent: React.ReactNode;
  adultContent: React.ReactNode;
}

function AcBanner({ type }: { type: AcRecommendation }) {
  if (!type) return null;
  const isHot = type === 'hot';
  return (
    <div className={`ac-banner ${isHot ? 'hot' : 'cold'}`} role="status">
      {isHot ? '🌡️ エアコン（冷房）をおすすめします' : '❄️ エアコン（暖房）をおすすめします'}
    </div>
  );
}

function PatternResult({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="sleep-result-section">
      <div className="sleep-result-label">{label}</div>
      {children}
    </div>
  );
}

export default function SleepTab() {
  const navigate = useNavigate();
  const { childSleepPatterns, adultSleepPatterns } = useWardrobe();

  const [roomTemp, setRoomTemp] = useState('');
  const [humidity, setHumidity] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [result, setResult] = useState<SleepResult | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors: FieldErrors = {};
    const temp = parseFloat(roomTemp);
    const hum = parseFloat(humidity);

    if (roomTemp === '' || isNaN(temp)) newErrors.roomTemp = '入力してください';
    if (humidity === '' || isNaN(hum)) newErrors.humidity = '入力してください';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    const ac = getAcRecommendation(temp);
    const childMatch = matchIndoorPattern(childSleepPatterns, temp, hum);
    const adultMatch = matchIndoorPattern(adultSleepPatterns, temp, hum);

    const childContent = childMatch.kind === 'match' ? (
      <div className="pattern-result">
        <p className="pattern-result-name">{childMatch.pattern.name}</p>
        <p className="pattern-result-desc">{childMatch.pattern.description}</p>
      </div>
    ) : (
      <div className="no-match">
        条件に合うパターンなし —{' '}
        <button className="btn-text" onClick={() => navigate('/setup')}>セットアップへ</button>
      </div>
    );

    const adultContent = adultMatch.kind === 'match' ? (
      <div className="pattern-result">
        <p className="pattern-result-name">{adultMatch.pattern.name}</p>
        <p className="pattern-result-desc">{adultMatch.pattern.description}</p>
      </div>
    ) : (
      <div className="no-match">
        条件に合うパターンなし —{' '}
        <button className="btn-text" onClick={() => navigate('/setup')}>セットアップへ</button>
      </div>
    );

    setResult({ key: Date.now(), temp, humidity: hum, ac, childContent, adultContent });
  }

  return (
    <div style={{ paddingTop: 24, paddingBottom: 24, flex: 1 }}>
      <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="tablet-form-row">
        <div className="field">
          <label htmlFor="sleepRoomTemp">室温 (°C)</label>
          <input
            id="sleepRoomTemp"
            type="number"
            min={0}
            max={50}
            value={roomTemp}
            onChange={e => setRoomTemp(e.target.value)}
            className={errors.roomTemp ? 'error' : ''}
            placeholder="例：26"
          />
          {errors.roomTemp && <span className="field-error">{errors.roomTemp}</span>}
        </div>

        <div className="field">
          <label htmlFor="sleepHumidity">湿度 (%)</label>
          <input
            id="sleepHumidity"
            type="number"
            min={0}
            max={100}
            value={humidity}
            onChange={e => setHumidity(e.target.value)}
            className={errors.humidity ? 'error' : ''}
            placeholder="例：60"
          />
          {errors.humidity && <span className="field-error">{errors.humidity}</span>}
        </div>
        </div>

        <button type="submit" className="btn-primary">確認</button>
      </form>

      {result && (
        <div key={result.key} className="result-reveal" style={{ marginTop: 24 }}>
          <AcBanner type={result.ac} />
          <div className="sleep-results">
            <PatternResult label="子供">{result.childContent}</PatternResult>
            <div className="sleep-results-divider" />
            <PatternResult label="自分">{result.adultContent}</PatternResult>
          </div>
          <p className="pattern-result-conditions" style={{ marginTop: 12 }}>
            室温 {result.temp}°C / 湿度 {result.humidity}%
          </p>
        </div>
      )}
    </div>
  );
}
