import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
         LineChart, Line } from 'recharts';
import type { Participant } from '../../core/models/types';
import { CarPreviewImage } from '../shared/CarPreviewImage';
import { PositionBadge } from '../shared/PositionBadge';
import { formatLapTime, formatSectorTime } from '../../core/utils/time-formatter';
import { humanizeCarId } from '../../core/utils/car-name-humanizer';
import { computeParticipantStats } from '../../core/analyzers/session-analyzer';
import { es } from '../../i18n/es';

interface Props {
  participant: Participant;
}

export const DriverDetailView: React.FC<Props> = ({ participant }) => {
  const stats = computeParticipantStats(participant);
  const driverName = participant.drivers[0]?.name ?? 'Piloto';
  const nationCode = participant.drivers[0]?.nationCode;

  // Lap delta chart data (difference from average)
  const deltaData = participant.laps
    .filter(l => l.timeMs > 0)
    .map(l => ({
      lap: l.lapNumber,
      delta: (l.timeMs - stats.avgLapMs) / 1000,
      time: l.timeMs,
      isValid: l.isValid,
    }));

  // Sector breakdown per lap
  const sectorData = participant.laps
    .filter(l => l.timeMs > 0 && l.sectors.length > 0)
    .map(l => ({
      lap: l.lapNumber,
      S1: (l.sectors[0]?.timeMs ?? 0) / 1000,
      S2: (l.sectors[1]?.timeMs ?? 0) / 1000,
      S3: (l.sectors[2]?.timeMs ?? 0) / 1000,
    }));

  // Best lap progression
  const bestProgression: Array<{ lap: number; best: number }> = [];
  let currentBest = Infinity;
  for (const l of participant.laps) {
    if (l.isValid && l.timeMs > 0 && l.timeMs < currentBest) {
      currentBest = l.timeMs;
    }
    if (currentBest < Infinity) {
      bestProgression.push({ lap: l.lapNumber, best: currentBest / 1000 });
    }
  }

  return (
    <div className="animate-in">
      {/* Driver Header */}
      <div className="driver-header">
        <CarPreviewImage
          carId={participant.vehicle.modelId}
          skinName={participant.vehicle.skin}
          size={150}
          showPopover={false}
        />
        <div className="info">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <PositionBadge position={participant.position} size={40} />
            <div>
              <h2>
                {nationCode && <span style={{ color: 'var(--text-muted)', marginRight: 8 }}>[{nationCode}]</span>}
                {driverName}
              </h2>
              <div style={{ color: 'var(--text-secondary)' }}>
                {participant.vehicle.displayName ?? humanizeCarId(participant.vehicle.modelId)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="label">{es.session.bestLap}</div>
          <div className="value mono">{stats.bestLapMs > 0 ? formatLapTime(stats.bestLapMs) : '—'}</div>
        </div>
        <div className="stat-card">
          <div className="label">{es.driver.avgLap}</div>
          <div className="value mono">{stats.avgLapMs > 0 ? formatLapTime(stats.avgLapMs) : '—'}</div>
        </div>
        <div className="stat-card">
          <div className="label">{es.driver.consistency}</div>
          <div className="value mono">{stats.consistency > 0 ? `±${(stats.consistency / 1000).toFixed(3)}s` : '—'}</div>
        </div>
        <div className="stat-card">
          <div className="label">{es.driver.validLaps}</div>
          <div className="value">{stats.validLapCount} / {participant.laps.length}</div>
        </div>
        <div className="stat-card">
          <div className="label">{es.driver.totalCuts}</div>
          <div className="value" style={{ color: stats.totalCuts > 0 ? 'var(--color-slower)' : undefined }}>
            {stats.totalCuts}
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Lap Delta Bars */}
        <div className="chart-container">
          <h3>📊 {es.driver.lapDelta}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={deltaData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="lap" stroke="var(--text-muted)" fontSize={11} />
              <YAxis stroke="var(--text-muted)" fontSize={11} tickFormatter={(v: number) => `${v > 0 ? '+' : ''}${v.toFixed(1)}s`} />
              <Tooltip
                contentStyle={{ background: 'var(--bg-glass)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}
                formatter={(value: number) => [`${value > 0 ? '+' : ''}${value.toFixed(3)}s`, 'Delta']}
                labelFormatter={(l) => `Vuelta ${l} — ${formatLapTime(deltaData.find(d => d.lap === l)?.time ?? 0)}`}
              />
              <Bar dataKey="delta" name="Delta">
                {deltaData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.delta < 0 ? 'var(--color-faster)' : 'var(--color-slower)'}
                    opacity={entry.isValid ? 1 : 0.4}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Sector Stacked Bars */}
        <div className="chart-container">
          <h3>⏱️ {es.driver.sectorBreakdown}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sectorData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="lap" stroke="var(--text-muted)" fontSize={11} />
              <YAxis stroke="var(--text-muted)" fontSize={11} tickFormatter={(v: number) => `${v.toFixed(0)}s`} />
              <Tooltip
                contentStyle={{ background: 'var(--bg-glass)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}
                formatter={(v: number, name: string) => [formatSectorTime(v * 1000) + 's', name]}
              />
              <Bar dataKey="S1" stackId="a" fill="var(--color-s1)" name="Sector 1" />
              <Bar dataKey="S2" stackId="a" fill="var(--color-s2)" name="Sector 2" />
              <Bar dataKey="S3" stackId="a" fill="var(--color-s3)" name="Sector 3" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Best Lap Progression */}
        <div className="chart-container full-width">
          <h3>🏆 {es.driver.bestProgression}</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={bestProgression} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="lap" stroke="var(--text-muted)" fontSize={12} />
              <YAxis stroke="var(--text-muted)" fontSize={12} tickFormatter={(v: number) => formatLapTime(v * 1000)} domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{ background: 'var(--bg-glass)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}
                formatter={(v: number) => [formatLapTime(v * 1000), 'Mejor']}
              />
              <Line type="stepAfter" dataKey="best" stroke="var(--color-pb)" strokeWidth={3} dot={{ r: 3, fill: 'var(--color-pb)' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
