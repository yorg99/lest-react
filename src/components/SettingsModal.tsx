import { useState } from "react";
import type { Settings } from "../lib/types";

export interface SettingsModalProps {
  type: "temp" | "hum";
  settings: Settings;
  onSave: (updated: Partial<Settings>) => void;
  onClose: () => void;
}

interface Form {
  target: string;
  threshold: string;
  dur: string;
  name: string;
}

function num(s: string, fallback: number): number {
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : fallback;
}

export default function SettingsModal({
  type,
  settings,
  onSave,
  onClose,
}: SettingsModalProps) {
  const isT = type === "temp";
  const [form, setForm] = useState<Form>({
    target: String(isT ? settings.tempTarget : settings.humTarget),
    threshold: String(isT ? settings.tempThreshold : settings.humThreshold),
    dur: String(Math.round(settings.totalDur / 3600)),
    name: settings.testName,
  });

  function set<K extends keyof Form>(k: K, v: Form[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function handleSave() {
    const updated: Partial<Settings> = isT
      ? {
          tempTarget: num(form.target, settings.tempTarget),
          tempThreshold: num(form.threshold, settings.tempThreshold),
          totalDur: (num(form.dur, 72) || 72) * 3600,
          testName: form.name || settings.testName,
        }
      : {
          humTarget: num(form.target, settings.humTarget),
          humThreshold: num(form.threshold, settings.humThreshold),
          totalDur: (num(form.dur, 72) || 72) * 3600,
          testName: form.name || settings.testName,
        };
    onSave(updated);
  }

  return (
    <div
      className="modal-overlay open"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal">
        <div className="m-title">⚙ Paramètres {isT ? "Température" : "Humidité"}</div>

        <div className="m-grid">
          <div className="m-field">
            <label>Seuil Alerte (±)</label>
            <input
              type="number"
              step="0.1"
              value={form.threshold}
              onChange={(e) => set("threshold", e.target.value)}
            />
          </div>
          {isT && (
            <div className="m-field">
              <label>Durée Essai (h)</label>
              <input
                type="number"
                step="1"
                value={form.dur}
                onChange={(e) => set("dur", e.target.value)}
              />
            </div>
          )}
        </div>

        <div className="m-field">
          <label>Nom de l'essai</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
          />
        </div>

        <div className="m-actions">
          <button className="btn-c" onClick={onClose}>
            Annuler
          </button>
          <button className="btn-s" onClick={handleSave}>
            Appliquer
          </button>
        </div>
      </div>
    </div>
  );
}
