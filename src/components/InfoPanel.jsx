import React from 'react';
import { formatTS } from '../lib/supabase';

export default function InfoPanel({ status, espOnline, totalPts, lastSeenTs }) {
  return (
    <div className="info-panel">
      <div className="ip-title">Système LEST</div>

      <div className="modbus-bar">
        <div className="mb-dot" style={{background: espOnline ? 'var(--green)' : 'var(--yellow)'}}/>
        <div className="mb-lbl">Supabase Realtime</div>
        <div className="mb-sub">{status}</div>
      </div>

      <div className="ip-div"/>
      <div className="ip-row"><span className="ip-k">Microcontrôleur</span><span className="ip-v">ESP8266 LoLin V3</span></div>
      <div className="ip-row"><span className="ip-k">Capteurs</span><span className="ip-v">DHT11 (T + HR)</span></div>
      <div className="ip-row"><span className="ip-k">Cloud</span><span className="ip-v">Supabase PostgreSQL</span></div>
      <div className="ip-row"><span className="ip-k">Fréquence acq.</span><span className="ip-v">1 Hz</span></div>
      <div className="ip-row"><span className="ip-k">Stockage</span><span className="ip-v">Supabase + CSV</span></div>
      <div className="ip-div"/>
      <div className="ip-row"><span className="ip-k">Norme</span><span className="ip-v">ISO 17025</span></div>
      <div className="ip-row"><span className="ip-k">Durée valid.</span><span className="ip-v">72 h endurance</span></div>
      <div className="ip-row"><span className="ip-k">Dernier envoi</span><span className="ip-v">{formatTS(lastSeenTs)}</span></div>
      <div className="ip-row"><span className="ip-k">Points Supabase</span><span className="ip-v">{totalPts}</span></div>
    </div>
  );
}
