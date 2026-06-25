/**
 * PedalBars — Vertical bar indicators for gas and brake pedal inputs.
 * Smooth CSS transitions for fluid animation.
 */

import React from 'react';

interface Props {
  gas: number;
  brake: number;
  clutch: number;
}

export const PedalBars: React.FC<Props> = ({ gas, brake, clutch }) => {
  const gasPct = Math.round(Math.max(0, Math.min(1, gas)) * 100);
  const brakePct = Math.round(Math.max(0, Math.min(1, brake)) * 100);
  const clutchPct = Math.round(Math.max(0, Math.min(1, clutch)) * 100);

  return (
    <div className="telemetry-pedals">
      <div className="pedal-group">
        <div className="pedal-bar-container">
          <div className="pedal-bar pedal-clutch" style={{ height: `${clutchPct}%` }} />
        </div>
        <span className="pedal-label">C</span>
        <span className="pedal-value">{clutchPct}%</span>
      </div>
      <div className="pedal-group">
        <div className="pedal-bar-container">
          <div className="pedal-bar pedal-brake" style={{ height: `${brakePct}%` }} />
        </div>
        <span className="pedal-label">B</span>
        <span className="pedal-value">{brakePct}%</span>
      </div>
      <div className="pedal-group">
        <div className="pedal-bar-container">
          <div className="pedal-bar pedal-gas" style={{ height: `${gasPct}%` }} />
        </div>
        <span className="pedal-label">G</span>
        <span className="pedal-value">{gasPct}%</span>
      </div>
    </div>
  );
};
