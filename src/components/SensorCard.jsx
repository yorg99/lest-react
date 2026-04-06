import React, { useEffect, useRef } from 'react';

export default function SensorCard({ type, value, target, threshold, uncert, min, max, homog, slope, onSettings }) {
  const isTemp = type === 'temp';
  const unit   = isTemp ? '°C' : '%';
  const delta  = value !== null ? +(value - target).toFixed(2) : null;
  const outOfRange = delta !== null && Math.abs(delta) > threshold;

  const valRef = useRef();
  const prevVal = useRef(value);

  useEffect(() => {
    if (value !== null && value !== prevVal.current && valRef.current) {
      valRef.current.classList.remove('flash');
      void valRef.current.offsetWidth;
      valRef.current.classList.add('flash');
      prevVal.current = value;
    }
  }, [value]);

  return (
    <div className={`sensor-card ${isTemp ? 's-temp' : 's-hum'}`}>
      <div className="sc-hdr">
        <div className="sc-title">
          {isTemp ? 'Température Moyenne (DHT11)' : 'Humidité Relative'}
        </div>
        <div style={{display:'flex', gap:6, alignItems:'center'}}>
          <div className={`sbadge ${outOfRange ? 's-err' : 's-ok'}`}>
            <span className="sp"/>
            {outOfRange ? 'HORS SEUIL' : 'Nominal'}
          </div>
          <button className="gear-btn" onClick={onSettings}>⚙</button>
        </div>
      </div>

      <div ref={valRef} className="sc-val" style={{color: isTemp ? 'var(--red)' : 'var(--cyan)'}}>
        {value !== null ? `${value.toFixed(1)}${unit}` : '--.-' + unit}
      </div>

      <div className="sc-uncert">
        {isTemp && uncert !== null
          ? <>U élargie (k=2): <span>±{uncert.toFixed(3)}°C</span> &nbsp;|&nbsp; Seuil: <span>±{threshold.toFixed(1)}°C</span></>
          : <>Seuil: <span>±{threshold.toFixed(1)}{unit}</span></>
        }
      </div>

      <div className="sc-meta">
        <div className="mi">
          <div className="ml">Cible</div>
          <div className="mv" style={{color: isTemp ? 'var(--red)' : 'var(--cyan)'}}>
            {target.toFixed(1)}{unit}
          </div>
        </div>
        <div className="mi">
          <div className="ml">Écart</div>
          <div className={`mv ${outOfRange ? 'err' : 'ok'}`}>
            {delta !== null ? `${delta >= 0 ? '+' : ''}${delta}${unit}` : '—'}
          </div>
        </div>
        {isTemp && (
          <>
            <div className="mi">
              <div className="ml">Homogén.</div>
              <div className={`mv ${homog > 3 ? 'err' : homog > 1.5 ? 'warn' : 'ok'}`}>
                {homog !== null ? `${homog.toFixed(2)}°C` : '—'}
              </div>
            </div>
            <div className="mi">
              <div className="ml">Pente</div>
              <div className="mv">{slope !== null ? `${Number(slope) >= 0 ? '+' : ''}${slope}°C/min` : '—'}</div>
            </div>
          </>
        )}
        <div className="mi">
          <div className="ml">Min / Max</div>
          <div className="mv">
            {min !== null ? `${min.toFixed(1)} / ${max.toFixed(1)}${unit}` : '—'}
          </div>
        </div>
      </div>
    </div>
  );
}
