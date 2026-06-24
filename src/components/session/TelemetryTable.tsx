import React, { useMemo } from 'react';
import type { Session, Participant } from '../../core/models/types';
import { formatLapTime, formatSectorTime } from '../../core/utils/time-formatter';
import { computeSessionBestSectors, computeParticipantStats } from '../../core/analyzers/session-analyzer';

interface Props {
  session: Session;
  participant: Participant;
}

type SectorColor = 'purple' | 'green' | 'yellow' | 'red' | 'neutral';

function getSectorColor(
  timeMs: number,
  sessionBest: number,
  personalBest: number,
): SectorColor {
  if (timeMs <= 0) return 'neutral';
  if (timeMs <= sessionBest) return 'purple';     // Session best (purple sector)
  if (timeMs <= personalBest) return 'green';       // Personal best
  if (timeMs <= personalBest * 1.02) return 'yellow'; // Within 2% of PB
  return 'red';                                      // Significantly slower
}

const COLOR_MAP: Record<SectorColor, string> = {
  purple: '#B066FF',
  green: '#00E676',
  yellow: '#FBBF24',
  red: '#FF5252',
  neutral: 'var(--text-muted)',
};

export const TelemetryTable: React.FC<Props> = ({ session, participant }) => {
  const sessionBestSectors = useMemo(() => computeSessionBestSectors(session), [session]);
  const stats = useMemo(() => computeParticipantStats(participant), [participant]);

  // Compute cumulative time for pace analysis
  const lapsData = useMemo(() => {
    let cumTime = 0;
    let bestSoFar = Infinity;

    return participant.laps.map((lap) => {
      cumTime += lap.timeMs > 0 ? lap.timeMs : 0;
      if (lap.isValid && lap.timeMs > 0 && lap.timeMs < bestSoFar) {
        bestSoFar = lap.timeMs;
      }

      const deltaToAvg = stats.avgLapMs > 0 && lap.timeMs > 0
        ? lap.timeMs - stats.avgLapMs
        : null;

      const deltaToBest = stats.bestLapMs > 0 && lap.timeMs > 0
        ? lap.timeMs - stats.bestLapMs
        : null;

      return {
        lap,
        cumTime,
        bestSoFar: bestSoFar < Infinity ? bestSoFar : null,
        deltaToAvg,
        deltaToBest,
        isPersonalBest: lap.isValid && lap.timeMs === bestSoFar && lap.timeMs > 0,
      };
    });
  }, [participant.laps, stats]);

  const sectorCount = participant.laps[0]?.sectors.length ?? 3;

  return (
    <div className="chart-container" style={{ padding: 0, overflow: 'auto' }}>
      <h3 style={{ padding: 'var(--space-md) var(--space-md) 0' }}>
        📊 Telemetría — {participant.drivers[0]?.name ?? 'Piloto'}
      </h3>
      <div style={{ fontSize: '0.7rem', padding: '0 var(--space-md) var(--space-sm)', color: 'var(--text-muted)', display: 'flex', gap: 16 }}>
        <span style={{ color: COLOR_MAP.purple }}>■ Mejor de sesión</span>
        <span style={{ color: COLOR_MAP.green }}>■ Mejor personal</span>
        <span style={{ color: COLOR_MAP.yellow }}>■ Cerca del PB</span>
        <span style={{ color: COLOR_MAP.red }}>■ Más lento</span>
      </div>
      <table className="data-table" style={{ fontSize: '0.78rem' }}>
        <thead>
          <tr>
            <th style={{ width: 50, textAlign: 'center' }}>Vuelta</th>
            {Array.from({ length: sectorCount }, (_, i) => (
              <th key={i} style={{ textAlign: 'right' }}>S{i + 1}</th>
            ))}
            <th style={{ textAlign: 'right' }}>Tiempo</th>
            <th style={{ textAlign: 'right' }}>Δ Mejor</th>
            <th style={{ textAlign: 'right' }}>Δ Prom</th>
            <th style={{ textAlign: 'center' }}>Neumático</th>
            <th style={{ textAlign: 'center' }}>Cortes</th>
            <th style={{ textAlign: 'center' }}>Válida</th>
            <th style={{ textAlign: 'right' }}>Acumulado</th>
          </tr>
        </thead>
        <tbody>
          {lapsData.map((ld, idx) => (
            <tr
              key={idx}
              style={{
                background: ld.isPersonalBest ? 'rgba(124, 77, 255, 0.08)' : undefined,
              }}
            >
              <td style={{ textAlign: 'center', fontWeight: 600 }}>
                {ld.lap.lapNumber}
                {ld.isPersonalBest && <span style={{ marginLeft: 4, color: COLOR_MAP.purple }}>★</span>}
              </td>

              {/* Sector times with color coding */}
              {Array.from({ length: sectorCount }, (_, si) => {
                const sectorTime = ld.lap.sectors[si]?.timeMs ?? 0;
                const color = getSectorColor(
                  sectorTime,
                  sessionBestSectors[si] ?? Infinity,
                  stats.bestSectors[si] ?? Infinity,
                );
                return (
                  <td
                    key={si}
                    style={{
                      textAlign: 'right',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      color: COLOR_MAP[color],
                      fontWeight: color === 'purple' ? 700 : 400,
                    }}
                  >
                    {sectorTime > 0 ? formatSectorTime(sectorTime) : '—'}
                  </td>
                );
              })}

              {/* Lap time */}
              <td style={{
                textAlign: 'right',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                fontWeight: ld.isPersonalBest ? 700 : 500,
                color: ld.isPersonalBest ? COLOR_MAP.purple : ld.lap.isValid ? 'var(--text-primary)' : 'var(--text-muted)',
              }}>
                {ld.lap.timeMs > 0 ? formatLapTime(ld.lap.timeMs) : '—'}
              </td>

              {/* Delta to best */}
              <td style={{
                textAlign: 'right',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
                color: ld.deltaToBest !== null
                  ? ld.deltaToBest <= 0 ? COLOR_MAP.green : ld.deltaToBest < 1000 ? COLOR_MAP.yellow : COLOR_MAP.red
                  : 'var(--text-muted)',
              }}>
                {ld.deltaToBest !== null
                  ? `${ld.deltaToBest > 0 ? '+' : ''}${(ld.deltaToBest / 1000).toFixed(3)}`
                  : '—'}
              </td>

              {/* Delta to average */}
              <td style={{
                textAlign: 'right',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
                color: ld.deltaToAvg !== null
                  ? ld.deltaToAvg <= 0 ? COLOR_MAP.green : COLOR_MAP.red
                  : 'var(--text-muted)',
              }}>
                {ld.deltaToAvg !== null
                  ? `${ld.deltaToAvg > 0 ? '+' : ''}${(ld.deltaToAvg / 1000).toFixed(3)}`
                  : '—'}
              </td>

              {/* Tyre */}
              <td style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                {ld.lap.tyre ?? '—'}
              </td>

              {/* Cuts */}
              <td style={{
                textAlign: 'center',
                color: ld.lap.cuts > 0 ? COLOR_MAP.red : 'var(--text-muted)',
                fontWeight: ld.lap.cuts > 0 ? 600 : 400,
              }}>
                {ld.lap.cuts}
              </td>

              {/* Valid */}
              <td style={{ textAlign: 'center' }}>
                {ld.lap.isValid
                  ? <span style={{ color: COLOR_MAP.green }}>✓</span>
                  : <span style={{ color: COLOR_MAP.red }}>✗</span>
                }
              </td>

              {/* Cumulative time */}
              <td style={{
                textAlign: 'right',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
                color: 'var(--text-muted)',
              }}>
                {ld.cumTime > 0 ? formatLapTime(ld.cumTime) : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
