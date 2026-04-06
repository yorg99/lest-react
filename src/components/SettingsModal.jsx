import React, { useState } from 'react';

export default function SettingsModal({ type, settings, onSave, onClose }) {
  const isT = type === 'temp';
  const [form, setForm] = useState({
    target:    isT ? settings.tempTarget    : settings.humTarget,
    threshold: isT ? settings.tempThreshold : settings.humThreshold,
    slope:     settings.tempSlope,
    dur:       Math.round(settings.totalDur / 3600),
    name:      settings.testName
  });

  function set(k, v) { setForm(f => ({...f, [k]: v})); }

  function handleSave() {
    const updated = isT
      ? { tempTarget: parseFloat(form.target) || settings.tempTarget,
          tempThreshold: parseFloat(form.threshold) || settings.tempThreshold,
          tempSlope: parseFloat(form.slope) || settings.tempSlope,
          totalDur: (parseFloat(form.dur) || 72) * 3600,
          testName: form.name || settings.testName }
      : { humTarget: parseFloat(form.target) || settings.humTarget,
          humThreshold: parseFloat(form.threshold) || settings.humThreshold,
          totalDur: (parseFloat(form.dur) || 72) * 3600,
          testName: form.name || settings.testName };
    onSave(updated);
  }

  return (
    <div className="modal-overlay open" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <div className="m-title">⚙ Paramètres {isT ? 'Température' : 'Humidité'}</div>

        <div className="m-grid">
          <div className="m-field">
            <label>Valeur Cible</label>
            <input type="number" step="0.1" value={form.target} onChange={e => set('target', e.target.value)}/>
          </div>
          <div className="m-field">
            <label>Seuil Alerte (±)</label>
            <input type="number" step="0.1" value={form.threshold} onChange={e => set('threshold', e.target.value)}/>
          </div>
          {isT && (
            <div className="m-field">
              <label>Pente (°C/min)</label>
              <input type="number" step="0.01" value={form.slope} onChange={e => set('slope', e.target.value)}/>
            </div>
          )}
          <div className="m-field">
            <label>Durée Essai (h)</label>
            <input type="number" step="1" value={form.dur} onChange={e => set('dur', e.target.value)}/>
          </div>
        </div>

        <div className="m-field">
          <label>Nom de l'essai</label>
          <input type="text" value={form.name} onChange={e => set('name', e.target.value)}/>
        </div>

        <div className="m-actions">
          <button className="btn-c" onClick={onClose}>Annuler</button>
          <button className="btn-s" onClick={handleSave}>Appliquer</button>
        </div>
      </div>
    </div>
  );
}
