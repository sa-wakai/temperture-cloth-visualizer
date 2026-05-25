import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWardrobe } from '../context/WardrobeContext';
import { matchIndoorPattern } from '../lib/indoor-logic';

interface FieldErrors {
  roomTemp?: string;
  humidity?: string;
}

export default function IndoorTab() {
  const navigate = useNavigate();
  const { childPatterns } = useWardrobe();

  const [roomTemp, setRoomTemp] = useState('');
  const [humidity, setHumidity] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [result, setResult] = useState<{ key: number; content: React.ReactNode } | null>(null);

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

    const matched = matchIndoorPattern(childPatterns, temp, hum);

    if (matched.kind === 'match') {
      const { pattern } = matched;
      setResult({
        key: Date.now(),
        content: (
          <div className="pattern-result">
            <p className="pattern-result-name">{pattern.name}</p>
            <p className="pattern-result-desc">{pattern.description}</p>
            <p className="pattern-result-conditions">室温 {temp}°C / 湿度 {hum}%</p>
          </div>
        ),
      });
    } else {
      setResult({
        key: Date.now(),
        content: (
          <div className="no-match" style={{ marginTop: 20 }}>
            条件に合うパターンなし —{' '}
            <button className="btn-text" onClick={() => navigate('/setup')}>
              セットアップへ
            </button>
          </div>
        ),
      });
    }
  }

  return (
    <div style={{ paddingTop: 24, paddingBottom: 24, flex: 1 }}>
      <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="tablet-form-row">
        <div className="field">
          <label htmlFor="roomTemp">室温 (°C)</label>
          <input
            id="roomTemp"
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
          <label htmlFor="humidity">湿度 (%)</label>
          <input
            id="humidity"
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
        <div key={result.key} className="result-reveal">
          {result.content}
        </div>
      )}
    </div>
  );
}
