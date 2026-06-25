/**
 * GForcePlot — 2D visualization of lateral and longitudinal G-forces.
 * Shows a dot with a fading trail for the last N data points.
 */

import React from 'react';
import type { GForcePoint } from '../../core/models/telemetry-types';

interface Props {
  current: { lateral: number; longitudinal: number };
  history: GForcePoint[];
  maxG?: number;
}

export const GForcePlot: React.FC<Props> = ({ current, history, maxG = 3 }) => {
  const size = 160;
  const center = size / 2;
  const scale = (center - 10) / maxG;

  /** Converts G values to SVG coordinates */
  const toSvg = (lat: number, lon: number) => ({
    x: center + lat * scale,
    y: center - lon * scale, // Y is inverted in SVG
  });

  const currentPos = toSvg(current.lateral, current.longitudinal);

  // Build trail polyline from history (last 60 points)
  const trailPoints = history
    .slice(-60)
    .map((p) => {
      const pos = toSvg(p.lateral, p.longitudinal);
      return `${pos.x},${pos.y}`;
    })
    .join(' ');

  return (
    <div className="telemetry-gforce">
      <svg viewBox={`0 0 ${size} ${size}`} className="gforce-svg">
        {/* Background grid */}
        <circle cx={center} cy={center} r={1 * scale} fill="none" stroke="var(--border-subtle)" strokeWidth="0.5" />
        <circle cx={center} cy={center} r={2 * scale} fill="none" stroke="var(--border-subtle)" strokeWidth="0.5" />
        <line x1={center} y1={5} x2={center} y2={size - 5} stroke="var(--border-subtle)" strokeWidth="0.5" />
        <line x1={5} y1={center} x2={size - 5} y2={center} stroke="var(--border-subtle)" strokeWidth="0.5" />

        {/* G labels */}
        <text x={center + 1 * scale + 4} y={center - 4} className="gforce-label">1G</text>
        <text x={center + 2 * scale + 4} y={center - 4} className="gforce-label">2G</text>

        {/* Trail */}
        {trailPoints && (
          <polyline
            points={trailPoints}
            fill="none"
            stroke="var(--brand-primary)"
            strokeWidth="1.5"
            opacity="0.3"
            strokeLinejoin="round"
          />
        )}

        {/* Current position dot */}
        <circle
          cx={currentPos.x}
          cy={currentPos.y}
          r="5"
          fill="var(--brand-primary)"
          className="gforce-dot"
        />
        <circle
          cx={currentPos.x}
          cy={currentPos.y}
          r="8"
          fill="none"
          stroke="var(--brand-primary)"
          strokeWidth="1"
          opacity="0.5"
        />
      </svg>
      <div className="gforce-axes">
        <span className="gforce-axis-label gforce-lateral">← Lat →</span>
        <span className="gforce-axis-label gforce-longitudinal">↑ Lon ↓</span>
      </div>
      <div className="gauge-label">G-Force</div>
    </div>
  );
};
