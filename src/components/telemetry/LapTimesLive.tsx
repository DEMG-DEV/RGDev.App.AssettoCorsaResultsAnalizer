/**
 * LapTimesLive — Real-time list of completed lap times.
 * Shows current lap timer and history with color-coded performance.
 */

import React from 'react';
import type { LiveLapTime } from '../../core/models/telemetry-types';

interface Props {
  currentTimeMs: number;
  bestTimeMs: number;
  lastTimeMs: number;
  completedLaps: number;
  lapHistory: LiveLapTime[];
  currentSector: number;
  lastSectorTimeMs: number;
}

/** Formats milliseconds as mm:ss.SSS */
function formatTime(ms: number): string {
  if (ms <= 0) return '--:--.---';
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const millis = ms % 1000;
  return `${minutes}:${String(seconds).padStart(2, '0')}.${String(millis).padStart(3, '0')}`;
}

/** Returns CSS class for lap time color coding */
function getLapClass(lap: LiveLapTime, bestMs: number): string {
  if (lap.isBest) return 'lap-best';
  if (lap.isImprovement) return 'lap-improvement';
  if (bestMs > 0 && lap.timeMs > 0) {
    const delta = (lap.timeMs - bestMs) / bestMs;
    if (delta < 0.02) return 'lap-close';
  }
  return 'lap-normal';
}

export const LapTimesLive: React.FC<Props> = ({
  currentTimeMs,
  bestTimeMs,
  lastTimeMs,
  completedLaps,
  lapHistory,
  currentSector,
  lastSectorTimeMs,
}) => {
  // Delta to best lap for current lap
  const currentDelta = bestTimeMs > 0 && currentTimeMs > 0 ? currentTimeMs - bestTimeMs : null;

  return (
    <div className="telemetry-laptimes">
      {/* Current lap timer */}
      <div className="lap-current">
        <div className="lap-current-label">Vuelta {completedLaps + 1}</div>
        <div className="lap-current-time">{formatTime(currentTimeMs)}</div>
        {currentDelta !== null && (
          <div className={`lap-delta ${currentDelta <= 0 ? 'delta-faster' : 'delta-slower'}`}>
            {currentDelta <= 0 ? '' : '+'}{(currentDelta / 1000).toFixed(3)}
          </div>
        )}
        <div className="lap-sector-indicator">
          {['S1', 'S2', 'S3'].map((label, i) => (
            <span key={label} className={`sector-dot ${i === currentSector ? 'sector-active' : ''} ${i < currentSector ? 'sector-done' : ''}`}>
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Best & Last */}
      <div className="lap-reference">
        <div className="lap-ref-item">
          <span className="lap-ref-label">Mejor</span>
          <span className="lap-ref-value lap-best">{formatTime(bestTimeMs)}</span>
        </div>
        <div className="lap-ref-item">
          <span className="lap-ref-label">Última</span>
          <span className="lap-ref-value">{formatTime(lastTimeMs)}</span>
        </div>
        {lastSectorTimeMs > 0 && (
          <div className="lap-ref-item">
            <span className="lap-ref-label">Últ. Sector</span>
            <span className="lap-ref-value">{formatTime(lastSectorTimeMs)}</span>
          </div>
        )}
      </div>

      {/* Lap history */}
      {lapHistory.length > 0 && (
        <div className="lap-history">
          <div className="lap-history-header">Historial</div>
          <div className="lap-history-list">
            {lapHistory.slice().reverse().map((lap) => (
              <div key={lap.lapNumber} className={`lap-history-item ${getLapClass(lap, bestTimeMs)}`}>
                <span className="lap-num">V{lap.lapNumber}</span>
                <span className="lap-time">{formatTime(lap.timeMs)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
