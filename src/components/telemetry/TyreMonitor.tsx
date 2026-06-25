/**
 * TyreMonitor — Displays temperature and wear for all 4 tyres.
 * Colors represent temperature zones: blue=cold, green=optimal, red=hot.
 */

import React from 'react';
import { TYRE_POSITIONS } from '../../core/models/telemetry-types';

interface Props {
  temps: [number, number, number, number];
  wear: [number, number, number, number];
  pressure: [number, number, number, number];
}

/** Returns CSS color based on tyre temperature */
function getTempColor(temp: number): string {
  if (temp < 60) return '#4FC3F7';   // Cold — light blue
  if (temp < 80) return '#29B6F6';   // Warming up
  if (temp < 95) return '#66BB6A';   // Optimal — green
  if (temp < 105) return '#FFA726';  // Hot — orange
  return '#EF5350';                  // Overheating — red
}

/** Returns wear percentage label and color */
function getWearInfo(wear: number) {
  const pct = Math.round((1 - wear) * 100);
  let color = 'var(--color-faster)';
  if (pct < 50) color = 'var(--brand-secondary)';
  if (pct < 25) color = 'var(--color-slower)';
  return { pct, color };
}

export const TyreMonitor: React.FC<Props> = ({ temps, wear, pressure }) => {
  return (
    <div className="telemetry-tyres">
      <div className="tyres-grid">
        {([0, 1, 2, 3] as const).map((i) => {
          const temp = temps[i];
          const wearVal = wear[i];
          const pres = pressure[i];
          const wearInfo = getWearInfo(wearVal);
          const tempColor = getTempColor(temp);

          return (
            <div key={TYRE_POSITIONS[i]} className="tyre-cell">
              <div className="tyre-label">{TYRE_POSITIONS[i]}</div>
              <div className="tyre-temp-box" style={{ borderColor: tempColor, boxShadow: `0 0 12px ${tempColor}40` }}>
                <span className="tyre-temp-value" style={{ color: tempColor }}>
                  {Math.round(temp)}°
                </span>
              </div>
              <div className="tyre-wear-bar">
                <div
                  className="tyre-wear-fill"
                  style={{ width: `${wearInfo.pct}%`, backgroundColor: wearInfo.color }}
                />
              </div>
              <div className="tyre-pressure">{pres.toFixed(1)} psi</div>
            </div>
          );
        })}
      </div>
      <div className="gauge-label">Neumáticos</div>
    </div>
  );
};
