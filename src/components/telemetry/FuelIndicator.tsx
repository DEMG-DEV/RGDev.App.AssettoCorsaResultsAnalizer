/**
 * FuelIndicator — Horizontal bar showing fuel level with laps remaining estimate.
 */

import React from 'react';

interface Props {
  fuel: number;
  maxFuel: number;
  /** Average fuel consumption per lap (calculated from history) */
  fuelPerLap?: number;
}

export const FuelIndicator: React.FC<Props> = ({ fuel, maxFuel, fuelPerLap }) => {
  const effectiveMax = maxFuel > 0 ? maxFuel : 100;
  const percentage = Math.max(0, Math.min(100, (fuel / effectiveMax) * 100));
  const lapsRemaining = fuelPerLap && fuelPerLap > 0 ? Math.floor(fuel / fuelPerLap) : null;

  /** Returns color based on fuel level */
  const getFuelColor = () => {
    if (percentage > 50) return 'var(--color-faster)';
    if (percentage > 25) return 'var(--brand-secondary)';
    if (percentage > 10) return '#FFA726';
    return 'var(--color-slower)';
  };

  return (
    <div className="telemetry-fuel">
      <div className="fuel-header">
        <span className="fuel-icon">⛽</span>
        <span className="fuel-value">{fuel.toFixed(1)} L</span>
        {lapsRemaining !== null && (
          <span className="fuel-laps">~{lapsRemaining} vueltas</span>
        )}
      </div>
      <div className="fuel-bar-container">
        <div
          className="fuel-bar-fill"
          style={{ width: `${percentage}%`, backgroundColor: getFuelColor() }}
        />
      </div>
    </div>
  );
};
