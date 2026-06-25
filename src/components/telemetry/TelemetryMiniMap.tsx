/**
 * TelemetryMiniMap — Track position indicator showing normalized position.
 * Displays a circular progress ring and position number.
 */

import React from 'react';

interface Props {
  normalizedPosition: number;
  position: number;
  completedLaps: number;
  isInPit: boolean;
}

export const TelemetryMiniMap: React.FC<Props> = ({
  normalizedPosition,
  position,
  completedLaps,
  isInPit,
}) => {
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(1, normalizedPosition));
  const dashOffset = circumference * (1 - progress);

  return (
    <div className="telemetry-minimap">
      <svg viewBox="0 0 100 100" className="minimap-svg">
        {/* Background ring */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="var(--border-subtle)"
          strokeWidth="4"
        />
        {/* Progress ring */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="var(--brand-primary)"
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
          className="minimap-progress"
        />
        {/* Position text */}
        <text x="50" y="44" className="minimap-position" textAnchor="middle" dominantBaseline="middle">
          P{position}
        </text>
        <text x="50" y="60" className="minimap-laps" textAnchor="middle" dominantBaseline="middle">
          V{completedLaps}
        </text>
      </svg>
      {isInPit && <div className="minimap-pit-badge">PIT</div>}
      <div className="gauge-label">Posición</div>
    </div>
  );
};
