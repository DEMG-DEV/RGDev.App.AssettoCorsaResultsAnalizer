/**
 * SpeedGauge — Circular SVG gauge showing current speed in km/h.
 * Features a sweeping arc with gradient color and smooth animation.
 */

import React from 'react';

interface Props {
  speed: number;
  maxSpeed?: number;
}

export const SpeedGauge: React.FC<Props> = ({ speed, maxSpeed = 350 }) => {
  const clampedSpeed = Math.max(0, Math.min(speed, maxSpeed));
  const percentage = clampedSpeed / maxSpeed;

  // Arc geometry: sweep from -135° to +135° (270° total)
  const startAngle = -135;
  const totalSweep = 270;
  const endAngle = startAngle + totalSweep * percentage;

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

  const bgArcPath = `M ${bgStart.x} ${bgStart.y} A ${r} ${r} 0 1 1 ${bgEnd.x} ${bgEnd.y}`;
  const activeArcPath =
    percentage > 0
      ? `M ${bgStart.x} ${bgStart.y} A ${r} ${r} 0 ${totalSweep * percentage > 180 ? 1 : 0} 1 ${arcEnd.x} ${arcEnd.y}`
      : '';

  // Color based on speed percentage
  const getGaugeColor = () => {
    if (percentage > 0.85) return 'var(--color-slower)';
    if (percentage > 0.6) return 'var(--brand-secondary)';
    return 'var(--color-faster)';
  };

  return (
    <div className="telemetry-gauge speed-gauge">
      <svg viewBox="0 0 200 200" className="gauge-svg">
        {/* Background arc */}
        <path
          d={bgArcPath}
          fill="none"
          stroke="var(--border-subtle)"
          strokeWidth="10"
          strokeLinecap="round"
        />
        {/* Active arc */}
        {activeArcPath && (
          <path
            d={activeArcPath}
            fill="none"
            stroke={getGaugeColor()}
            strokeWidth="10"
            strokeLinecap="round"
            className="gauge-arc-active"
          />
        )}
        {/* Speed value */}
        <text x={cx} y={cy - 8} className="gauge-value" textAnchor="middle" dominantBaseline="middle">
          {Math.round(clampedSpeed)}
        </text>
        <text x={cx} y={cy + 18} className="gauge-unit" textAnchor="middle" dominantBaseline="middle">
          km/h
        </text>
      </svg>
      <div className="gauge-label">Velocidad</div>
    </div>
  );
};
