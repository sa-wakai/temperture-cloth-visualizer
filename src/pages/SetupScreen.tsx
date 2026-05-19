import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWardrobe } from '../context/WardrobeContext';
import { detectLayer } from '../lib/keyword-mapping';
import { detectOverlap } from '../lib/indoor-logic';
import { Toast, useToast } from '../components/Toast';
import type { WardrobeItem, ChildPattern, Layer } from '../lib/types';

// ── Confirm Dialog ──────────────────────────────────────────────────────────

function ConfirmDialog({ message, onConfirm, onCancel }: {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="confirm-overlay">
      <div className="confirm-box" role="alertdialog" aria-modal="true">
        <p style={{ fontSize: 15 }}>{message}</p>
        <div className="confirm-actions">
          <button className="btn-cancel" onClick={onCancel}>キャンセル</button>
          <button className="btn-destructive" onClick={onConfirm}>削除</button>
        </div>
      </div>
    </div>
  );
}

// ── Wardrobe Item Form ───────────────────────────────────────────────────────

function WardrobeItemForm({
  initial,
  onSave,
  onClose,
}: {
  initial?: WardrobeItem;
  onSave: (item: WardrobeItem) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [layer, setLayer] = useState<Layer>(initial?.layer ?? 'unknown');
  const [waterproof, setWaterproof] = useState(initial?.waterproof ?? false);
  const [nameError, setNameError] = useState('');

  function handleNameChange(val: string) {
    setName(val);
    if (!initial) {
      const detected = detectLayer(val);
      setLayer(detected.layer);
      setWaterproof(detected.waterproof);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setNameError('名前を入力してください'); return; }
    onSave({
      id: initial?.id ?? crypto.randomUUID(),
      name: name.trim(),
      layer,
      waterproof,
    });
  }

  const layers: { value: Layer; label: string }[] = [
    { value: 'heavy', label: 'Heavy（厚手）' },
    { value: 'mid', label: 'Mid（中間）' },
    { value: 'light-layer', label: 'Light（薄手）' },
    { value: 'unknown', label: '不明' },
  ];

  return (
    <div className="form-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="form-sheet" role="dialog" aria-modal="true">
        <h2>{initial ? '服を編集' : '服を追加'}</h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="field">
            <label htmlFor="item-name">名前</label>
            <input
              id="item-name"
              type="text"
              value={name}
              onChange={e => handleNameChange(e.target.value)}
              className={nameError ? 'error' : ''}
              placeholder="例：ダウンジャケット"
            />
            {nameError && <span className="field-error">{nameError}</span>}
          </div>

          <div className="field">
            <label>レイヤー</label>
            <div className="radio-group">
              {layers.map(l => (
                <label key={l.value} className="radio-option">
                  <input
                    type="radio"
                    name="layer"
                    value={l.value}
                    checked={layer === l.value}
                    onChange={() => setLayer(l.value)}
                  />
                  {l.label}
                </label>
              ))}
            </div>
          </div>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={waterproof}
              onChange={e => setWaterproof(e.target.checked)}
            />
            防水・レインウェア
          </label>

          <div style={{ display: 'flex', gap: 12 }}>
            <button type="button" className="btn-outlined" style={{ flex: 1 }} onClick={onClose}>
              キャンセル
            </button>
            <button type="submit" className="btn-primary" style={{ flex: 1 }}>
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Pattern Form ─────────────────────────────────────────────────────────────

function PatternForm({
  initial,
  existingPatterns,
  onSave,
  onClose,
}: {
  initial?: ChildPattern;
  existingPatterns: ChildPattern[];
  onSave: (pattern: ChildPattern, overlap: ChildPattern | null) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [desc, setDesc] = useState(initial?.description ?? '');
  const [tempMin, setTempMin] = useState(String(initial?.tempMin ?? ''));
  const [tempMax, setTempMax] = useState(String(initial?.tempMax ?? ''));
  const [humMin, setHumMin] = useState(String(initial?.humidityMin ?? 0));
  const [humMax, setHumMax] = useState(String(initial?.humidityMax ?? 100));
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = '名前を入力してください';
    const tMin = parseFloat(tempMin);
    const tMax = parseFloat(tempMax);
    const hMin = parseFloat(humMin);
    const hMax = parseFloat(humMax);
    if (isNaN(tMin)) errs.tempMin = '入力してください';
    if (isNaN(tMax)) errs.tempMax = '入力してください';
    if (isNaN(hMin)) errs.humMin = '入力してください';
    if (isNaN(hMax)) errs.humMax = '入力してください';
    if (!isNaN(tMin) && !isNaN(tMax) && tMin >= tMax) errs.tempMax = '最大値は最小値より大きく';
    if (!isNaN(hMin) && !isNaN(hMax) && hMin >= hMax) errs.humMax = '最大値は最小値より大きく';
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});

    const pattern: ChildPattern = {
      id: initial?.id ?? crypto.randomUUID(),
      name: name.trim(),
      description: desc.trim(),
      tempMin: tMin,
      tempMax: tMax,
      humidityMin: hMin,
      humidityMax: hMax,
    };
    const overlap = detectOverlap(existingPatterns, pattern, initial?.id);
    onSave(pattern, overlap);
  }

  return (
    <div className="form-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="form-sheet" role="dialog" aria-modal="true">
        <h2>{initial ? 'パターンを編集' : 'パターンを追加'}</h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="field">
            <label htmlFor="pat-name">パターン名</label>
            <input id="pat-name" type="text" value={name} onChange={e => setName(e.target.value)}
              className={errors.name ? 'error' : ''} placeholder="例：夏の普通セット" />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>

          <div className="field">
            <label htmlFor="pat-desc">内容説明</label>
            <input id="pat-desc" type="text" value={desc} onChange={e => setDesc(e.target.value)}
              placeholder="例：肌着 + 半袖ロンパース" />
          </div>

          <div>
            <label style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-secondary)' }}>
              室温 (°C)
            </label>
            <div className="form-row" style={{ marginTop: 6 }}>
              <div className="field">
                <label htmlFor="temp-min">最小（以上）</label>
                <input id="temp-min" type="number" value={tempMin} onChange={e => setTempMin(e.target.value)}
                  className={errors.tempMin ? 'error' : ''} min={-20} max={60} />
                {errors.tempMin && <span className="field-error">{errors.tempMin}</span>}
              </div>
              <div className="field">
                <label htmlFor="temp-max">最大（未満）</label>
                <input id="temp-max" type="number" value={tempMax} onChange={e => setTempMax(e.target.value)}
                  className={errors.tempMax ? 'error' : ''} min={-20} max={60} />
                {errors.tempMax && <span className="field-error">{errors.tempMax}</span>}
              </div>
            </div>
          </div>

          <div>
            <label style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-secondary)' }}>
              湿度 (%)
            </label>
            <div className="form-row" style={{ marginTop: 6 }}>
              <div className="field">
                <label htmlFor="hum-min">最小（以上）</label>
                <input id="hum-min" type="number" value={humMin} onChange={e => setHumMin(e.target.value)}
                  className={errors.humMin ? 'error' : ''} min={0} max={100} />
                {errors.humMin && <span className="field-error">{errors.humMin}</span>}
              </div>
              <div className="field">
                <label htmlFor="hum-max">最大（未満）</label>
                <input id="hum-max" type="number" value={humMax} onChange={e => setHumMax(e.target.value)}
                  className={errors.humMax ? 'error' : ''} min={0} max={100} />
                {errors.humMax && <span className="field-error">{errors.humMax}</span>}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button type="button" className="btn-outlined" style={{ flex: 1 }} onClick={onClose}>
              キャンセル
            </button>
            <button type="submit" className="btn-primary" style={{ flex: 1 }}>
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Export / Import ──────────────────────────────────────────────────────────

function ExportImport({ onExport, onImport }: { onExport: () => string; onImport: (json: string) => boolean }) {
  const fileRef = useRef<HTMLInputElement>(null);

  function handleExport() {
    const json = onExport();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wardrobe-backup.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const text = ev.target?.result as string;
      onImport(text);
    };
    reader.readAsText(file);
    // Reset so the same file can be re-selected
    e.target.value = '';
  }

  return (
    <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
      <button className="btn-outlined" style={{ flex: 1 }} onClick={handleExport}>
        書き出し
      </button>
      <button className="btn-outlined" style={{ flex: 1 }} onClick={() => fileRef.current?.click()}>
        読み込み
      </button>
      <input ref={fileRef} type="file" accept="application/json" style={{ display: 'none' }}
        onChange={handleImportFile} />
    </div>
  );
}

// ── Main Setup Screen ────────────────────────────────────────────────────────

export default function SetupScreen() {
  const navigate = useNavigate();
  const {
    wardrobeItems,
    childPatterns,
    addWardrobeItem,
    updateWardrobeItem,
    deleteWardrobeItem,
    addChildPattern,
    updateChildPattern,
    deleteChildPattern,
    exportData,
    importData,
  } = useWardrobe();

  const { toast, showToast, dismissToast } = useToast();

  const [wardrobeForm, setWardrobeForm] = useState<{ open: boolean; editing?: WardrobeItem }>({ open: false });
  const [patternForm, setPatternForm] = useState<{ open: boolean; editing?: ChildPattern }>({ open: false });
  const [confirmDelete, setConfirmDelete] = useState<{ type: 'wardrobe' | 'pattern'; id: string; name: string } | null>(null);

  // ── Wardrobe handlers ──

  function handleWardrobeSave(item: WardrobeItem) {
    const ok = wardrobeForm.editing
      ? updateWardrobeItem(item)
      : addWardrobeItem(item);
    if (!ok) {
      showToast('保存できませんでした — プライベートブラウジングモードを確認してください', 'error');
    } else {
      showToast('保存しました', 'success');
    }
    setWardrobeForm({ open: false });
  }

  function handleWardrobeDelete(id: string) {
    const item = wardrobeItems.find(w => w.id === id);
    if (item) setConfirmDelete({ type: 'wardrobe', id, name: item.name });
  }

  // ── Pattern handlers ──

  function handlePatternSave(pattern: ChildPattern, overlap: ChildPattern | null) {
    const ok = patternForm.editing
      ? updateChildPattern(pattern)
      : addChildPattern(pattern);
    if (!ok) {
      showToast('保存できませんでした — プライベートブラウジングモードを確認してください', 'error');
    } else if (overlap) {
      // D2: overlap warning suppresses success toast
      showToast(`「${overlap.name}」と条件が重複しています`, 'warning');
    } else {
      showToast('保存しました', 'success');
    }
    setPatternForm({ open: false });
  }

  function handlePatternDelete(id: string) {
    const p = childPatterns.find(p => p.id === id);
    if (p) setConfirmDelete({ type: 'pattern', id, name: p.name });
  }

  // ── Confirm delete ──

  function executeDelete() {
    if (!confirmDelete) return;
    if (confirmDelete.type === 'wardrobe') {
      deleteWardrobeItem(confirmDelete.id);
    } else {
      deleteChildPattern(confirmDelete.id);
    }
    setConfirmDelete(null);
  }

  // ── Import handler ──

  function handleImport(json: string): boolean {
    const ok = importData(json);
    if (!ok) {
      showToast('読み込みに失敗しました — JSONファイルを確認してください', 'error');
    } else {
      showToast('読み込みました', 'success');
    }
    return ok;
  }

  const layerLabel: Record<string, string> = {
    heavy: 'Heavy', mid: 'Mid', 'light-layer': 'Light', unknown: '不明',
  };

  return (
    <div style={{ paddingBottom: 40 }}>
      <div style={{ paddingTop: 12, paddingBottom: 8 }}>
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← 戻る
        </button>
      </div>

      {/* Wardrobe section */}
      <div className="section">
        <div className="section-header">
          <h2>「外出」の服</h2>
          <button className="btn-outlined" style={{ padding: '0 14px', minHeight: 36, fontSize: 14 }}
            onClick={() => setWardrobeForm({ open: true })}>
            + 追加
          </button>
        </div>

        {wardrobeItems.length === 0 ? (
          <p className="empty-state">服がまだ登録されていません</p>
        ) : (
          wardrobeItems.map(item => (
            <div key={item.id} className="list-item">
              <div className="list-item-main">
                <div className="list-item-name">{item.name}</div>
                <div className="list-item-meta">
                  {layerLabel[item.layer]}{item.waterproof ? ' · 防水' : ''}
                </div>
              </div>
              <div className="list-item-actions">
                <button className="btn-icon" aria-label="編集"
                  onClick={() => setWardrobeForm({ open: true, editing: item })}>✏️</button>
                <button className="btn-icon" aria-label="削除"
                  onClick={() => handleWardrobeDelete(item.id)}>🗑</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Patterns section */}
      <div className="section">
        <div className="section-header">
          <h2>「子供の室内」のパターン</h2>
          <button className="btn-outlined" style={{ padding: '0 14px', minHeight: 36, fontSize: 14 }}
            onClick={() => setPatternForm({ open: true })}>
            + 追加
          </button>
        </div>

        {childPatterns.length === 0 ? (
          <p className="empty-state">パターンがまだ登録されていません</p>
        ) : (
          childPatterns.map(p => (
            <div key={p.id} className="list-item">
              <div className="list-item-main">
                <div className="list-item-name">{p.name}</div>
                <div className="list-item-meta">
                  {p.tempMin}–{p.tempMax}°C · 湿度{p.humidityMin}–{p.humidityMax}%
                </div>
              </div>
              <div className="list-item-actions">
                <button className="btn-icon" aria-label="編集"
                  onClick={() => setPatternForm({ open: true, editing: p })}>✏️</button>
                <button className="btn-icon" aria-label="削除"
                  onClick={() => handlePatternDelete(p.id)}>🗑</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Export / Import */}
      <div className="section">
        <h2>データ管理</h2>
        <ExportImport onExport={exportData} onImport={handleImport} />
      </div>

      {/* Modals */}
      {wardrobeForm.open && (
        <WardrobeItemForm
          initial={wardrobeForm.editing}
          onSave={handleWardrobeSave}
          onClose={() => setWardrobeForm({ open: false })}
        />
      )}

      {patternForm.open && (
        <PatternForm
          initial={patternForm.editing}
          existingPatterns={childPatterns}
          onSave={handlePatternSave}
          onClose={() => setPatternForm({ open: false })}
        />
      )}

      {confirmDelete && (
        <ConfirmDialog
          message={`「${confirmDelete.name}」を削除しますか？`}
          onConfirm={executeDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {toast && (
        <Toast key={toast.key} message={toast.message} type={toast.type} onDismiss={dismissToast} />
      )}
    </div>
  );
}
