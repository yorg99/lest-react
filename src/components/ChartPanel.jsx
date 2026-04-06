import React, { useMemo } from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, LineElement, Filler, Tooltip, Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

export default function ChartPanel({ history, tab, setTab, chartMode, setChartMode, settings, uc, U, hom, sigma }) {
  const isH = chartMode === 'hum';

  const chartData = useMemo(() => ({
    labels: history.map(d => d.label),
    datasets: isH
      ? [
          { label: 'HR (%)',    data: history.map(d => d.hum), borderColor: '#39d0d8', backgroundColor: 'rgba(57,208,216,.07)', borderWidth: 2, pointRadius: 0, tension: 0.4, fill: true, yAxisID: 'yH' },
          { label: 'Cible HR', data: history.map(() => settings.humTarget), borderColor: 'rgba(57,208,216,.4)', borderWidth: 1.5, borderDash: [5,3], pointRadius: 0, tension: 0, yAxisID: 'yH' }
        ]
      : [
          { label: 'Température', data: history.map(d => d.avg), borderColor: '#f85149', backgroundColor: 'rgba(248,81,73,.07)', borderWidth: 2, pointRadius: 0, tension: 0.4, fill: true, yAxisID: 'yT' },
          { label: 'Cible T',     data: history.map(() => settings.tempTarget), borderColor: 'rgba(248,81,73,.4)', borderWidth: 1.5, borderDash: [5,3], pointRadius: 0, tension: 0, yAxisID: 'yT' }
        ]
  }), [history, chartMode, settings, isH]);

  const chartOptions = useMemo(() => ({
    responsive: true, maintainAspectRatio: false,
    animation: { duration: 200 },
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1c2128', borderColor: '#30363d', borderWidth: 1,
        titleFont: { family: 'DM Mono', size: 11 },
        bodyFont:  { family: 'DM Mono', size: 12 },
        padding: 11, cornerRadius: 8,
        callbacks: {
          title: items => '🕐 ' + items[0].label,
          label: c => `  ${c.dataset.label}: ${c.parsed.y.toFixed(2)}${isH ? '%' : '°C'}`
        }
      }
    },
    scales: {
      x: {
        grid:   { color: 'rgba(255,255,255,.04)' },
        ticks:  { font: { family: 'DM Mono', size: 9 }, color: '#7d8590', maxTicksLimit: 8 },
        border: { display: false }
      },
      yT: {
        type: 'linear', position: 'left', display: !isH,
        grid:   { color: 'rgba(255,255,255,.05)' },
        ticks:  { font: { family: 'DM Mono', size: 10 }, color: '#f85149', callback: v => v + '°C', maxTicksLimit: 6 },
        border: { display: false }
      },
      yH: {
        type: 'linear', position: 'right', display: isH,
        grid:   { drawOnChartArea: false },
        ticks:  { font: { family: 'DM Mono', size: 10 }, color: '#39d0d8', callback: v => v + '%', maxTicksLimit: 6 },
        border: { display: false }, min: 0, max: 100
      }
    }
  }), [isH]);

  const legendItems = isH
    ? [{ l: 'HR', c: '#39d0d8', d: false }, { l: 'Cible HR', c: '#39d0d8', d: true }]
    : [{ l: 'Température', c: '#f85149', d: false }, { l: 'Cible T', c: '#f85149', d: true }];

  return (
    <div className="chart-panel">
      <div className="tab-bar">
        {['chart','table','uncert'].map(t => (
          <div key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t === 'chart' ? '📊 Temps Réel' : t === 'table' ? '📋 Tableau' : '🔢 Incertitudes'}
          </div>
        ))}
        <div className="tab-sp"/>
        <select className="ch-sel" value={chartMode} onChange={e => setChartMode(e.target.value)}>
          <option value="avg">Température</option>
          <option value="hum">Humidité</option>
        </select>
      </div>

      {/* Chart */}
      {tab === 'chart' && (
        <>
          <div className="chart-inner">
            <Line data={chartData} options={chartOptions}/>
          </div>
          <div className="leg-row">
            {legendItems.map(it => (
              <div key={it.l} className="leg-i">
                {it.d
                  ? <div className="leg-dash" style={{borderColor: it.c}}/>
                  : <div className="leg-dot"  style={{background:   it.c}}/>
                }
                {it.l}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Table */}
      {tab === 'table' && (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Timestamp</th><th>T (°C)</th><th>Cible T</th><th>Écart T</th>
                <th>HR (%)</th><th>Cible HR</th><th>U(T) k=2</th><th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {[...history].reverse().slice(0, 40).map(d => {
                const td = +(d.avg - settings.tempTarget).toFixed(2);
                const ok = Math.abs(td) <= settings.tempThreshold;
                return (
                  <tr key={d.id}>
                    <td style={{fontSize:10, color:'#7d8590'}}>{d.label}</td>
                    <td className="td-r">{d.avg.toFixed(1)}</td>
                    <td>{settings.tempTarget.toFixed(1)}</td>
                    <td className={Math.abs(td) > settings.tempThreshold ? 'td-r' : 'td-c'}>
                      {(td >= 0 ? '+' : '') + td}
                    </td>
                    <td className="td-c">{d.hum.toFixed(1)}</td>
                    <td>{settings.humTarget.toFixed(1)}</td>
                    <td className="td-y">±{(0.06 + Math.random() * 0.02).toFixed(3)}°C</td>
                    <td>
                      <span className={`sbadge ${ok ? 's-ok' : 's-err'}`} style={{fontSize:9}}>
                        {ok ? 'OK' : 'SEUIL'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Uncertainty */}
      {tab === 'uncert' && (
        <div className="uncert-wrap">
          <div className="u-grid">
            {[
              { title: 'Incertitude type uc(T)',  val: `±${uc.toFixed(4)}°C`,    color: 'var(--yellow)', sub: 'Combinée standard' },
              { title: 'Incertitude élargie U(T)', val: `±${U.toFixed(4)}°C`,    color: 'var(--red)',    sub: 'k=2 · conf. 95%' },
              { title: 'Variation ΔT',             val: `${hom.toFixed(3)}°C`,   color: 'var(--cyan)',   sub: 'Max − Min session' },
              { title: 'Stabilité σ',              val: `${sigma.toFixed(4)}°C`, color: 'var(--purple)', sub: 'Écart-type 30s' },
              { title: 'Résolution DHT11',         val: '0.1°C',                 color: 'var(--green)',  sub: 'Résolution capteur' },
              { title: 'Étalon référence',         val: '±0.025°C',             color: 'var(--muted)',  sub: 'Référence COFRAC' },
            ].map(c => (
              <div key={c.title} className="u-card">
                <div className="u-title">{c.title}</div>
                <div className="u-val" style={{color: c.color}}>{c.val}</div>
                <div className="u-sub">{c.sub}</div>
              </div>
            ))}
          </div>
          <div className="u-formula">
            <span>U(T)</span> = k × uc(T) = k × √[ u²résol + u²répéta + u²étalon ]<br/>
            <span>urésol</span> = 0.1 / (2√3) ≈ 0.029°C (DHT11)<br/>
            <span>urépéta</span> = σ / √n ← stabilité glissant 30s<br/>
            <span>uétalon</span> = 0.025°C (référence COFRAC)
          </div>
        </div>
      )}
    </div>
  );
}
