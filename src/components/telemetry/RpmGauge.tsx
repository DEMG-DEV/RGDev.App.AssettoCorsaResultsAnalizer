/**
 * RpmGauge — Circular SVG gauge for engine RPM with redline zone.
 * Shows current gear in the center and blinks near redline.
 */

import React from 'react';
import { GEAR_LABELS } from '../../core/models/telemetry-types';

interface Props {
  rpms: number;
  maxRpm: number;
  gear: number;
}

export const RpmGauge: React.FC<Props> = ({ rpms, maxRpm, gear }) => {
  const effectiveMax = maxRpm > 0 ? maxRpm : 8000;
  const clampedRpm = Math.max(0, Math.min(rpms, effectiveMax));
  const percentage = clampedRpm / effectiveMax;
  const isNearRedline = percentage > 0.9;

  // Arc geometry: sweep from -135° to +135° (270° total)
  const startAngle = -135;
  const totalSweep = 270;
  const endAngle = startAngle + totalSweep * percentage;
  const redlineStartAngle = startAngle + totalSweep * 0.85;

  const cx = 100;
  const cy = 100;
  const r = 80;

  /** Converts polar to cartesian for SVG arc */
  const polarToCart = (angle: number) => ({
    x: cx + r * Math.cos((angle * Math.PI) / 180),
    y: cy + r * Math.sin((angle * Math.PI) / 180),
  });

  const bgStart = polarToCart(startAngle);
  const bgEnd = polarToCart(startAngle + totalSweep);
  const arcEnd = polarToCart(endAngle);
  const redStart = polarToCart(redlineStartAngle);

  const bgArcPath = `M ${bgStart.x} ${bgStart.y} A ${r} ${r} 0 1 1 ${bgEnd.x} ${bgEnd.y}`;

  const activeArcPath =
    percentage > 0
      ? `M ${bgStart.x} ${bgStart.y} A ${r} ${r} 0 ${totalSweep * percentage > 180 ? 1 : 0} 1 ${arcEnd.x} ${arcEnd.y}`
      : '';

  const redlineArcPath = `M ${redStart.x} ${redStart.y} A ${r} ${r} 0 0 1 ${bgEnd.x} ${bgEnd.y}`;

  const gearLabel = GEAR_LABELS[gear] ?? String(gear - 1);

  return (
    <div className={`telemetry-gauge rpm-gauge ${isNearRedline ? 'redline-blink' : ''}`}>
      <svg viewBox="0 0 200 200" className="gauge-svg">
        {/* Background arc */}
        <path
          d={bgArcPath}
          fill="none"
          stroke="var(--border-subtle)"
          strokeWidth="10"
          strokeLinecap="round"
        />
        {/* Redline zone */}
        <path
          d={redlineArcPath}
          fill="none"
          stroke="rgba(213, 0, 0, 0.3)"
          strokeWidth="10"
          strokeLinecap="round"
        />
        {/* Active arc */}
        {activeArcPath && (
          <path
            d={activeArcPath}
            fill="none"
            stroke={isNearRedline ? 'var(--color-slower)' : 'var(--brand-primary)'}
            strokeWidth="10"
            strokeLinecap="round"
            className="gauge-arc-active"
          />
        )}
        {/* Gear display */}
        <text x={cx} y={cy - 12} className="gauge-gear" textAnchor="middle" dominantBaseline="middle">
          {gearLabel}
        </text>
        {/* RPM value */}
        <text x={cx} y={cy + 16} className="gauge-value gauge-value-sm" textAnchor="middle" dominantBaseline="middle">
          {Math.round(clampedRpm)}
        </text>
        <text x={cx} y={cy + 32} className="gauge-unit" textAnchor="middle" dominantBaseline="middle">
          RPM
        </text>
      </svg>
      <div className="gauge-label">Motor</div>
    </div>
  );
};
