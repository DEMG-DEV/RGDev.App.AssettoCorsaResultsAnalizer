import React from 'react';
import type { Session } from '../../core/models/types';
import { PositionBadge } from '../shared/PositionBadge';
import { CarPreviewImage } from '../shared/CarPreviewImage';
import { LapTimeSparkline } from '../shared/LapTimeSparkline';
import { formatLapTime, formatGap } from '../../core/utils/time-formatter';
import { humanizeCarId } from '../../core/utils/car-name-humanizer';
import { computeParticipantStats } from '../../core/analyzers/session-analyzer';
import { useSessionStore } from '../../stores/session-store';
import { es } from '../../i18n/es';

interface Props {
  session: Session;
}

const STATUS_BADGES: Record<string, { className: string; label: string }> = {
  finished: { className: 'badge badge-finished', label: '✅' },
  dnf: { className: 'badge badge-dnf', label: 'DNF' },
  dq: { className: 'badge badge-dq', label: 'DQ' },
  none: { className: 'badge badge-default', label: '—' },
};

export const StandingsTable: React.FC<Props> = ({ session }) => {
  const selectDriver = useSessionStore(s => s.selectDriver);

  return (
    <div className="chart-container" style={{ padding: 0, overflow: 'auto' }}>
      <table className="data-table">
        <thead>
          <tr>
            <th className="pos-cell">{es.session.position}</th>
            <th>{es.session.driver}</th>
            <th>{es.session.car}</th>
            <th className="time-cell">{es.session.bestLap}</th>
            <th className="time-cell">{es.session.gap}</th>
            <th>Vueltas</th>
            <th>Ritmo</th>
            <th>{es.session.status}</th>
          </tr>
        </thead>
        <tbody>
          {session.participants.map((p, idx) => {
            const stats = computeParticipantStats(p);
            const driverName = p.drivers[0]?.name ?? `Piloto ${idx + 1}`;
            const nationCode = p.drivers[0]?.nationCode;
            const statusInfo = STATUS_BADGES[p.finishStatus] ?? STATUS_BADGES.none!;

            return (
              <tr key={idx} onClick={() => selectDriver(idx)}>
                <td className="pos-cell">
                  <PositionBadge position={p.position} />
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {nationCode && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        [{nationCode}]
                      </span>
                    )}
                    <span style={{ fontWeight: 600 }}>{driverName}</span>
                    {p.aiLevel !== undefined && (
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', background: 'var(--bg-card-hover)', padding: '1px 5px', borderRadius: 4 }}>
                        AI:{p.aiLevel}
                      </span>
                    )}
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CarPreviewImage carId={p.vehicle.modelId} skinName={p.vehicle.skin} size={48} />
                    <span style={{ fontSize: '0.82rem' }}>{p.vehicle.displayName ?? humanizeCarId(p.vehicle.modelId)}</span>
                  </div>
                </td>
                <td className="time-cell" style={p.bestLap ? { color: idx === 0 ? 'var(--color-best)' : 'var(--text-primary)' } : {}}>
                  {p.bestLap ? formatLapTime(p.bestLap.timeMs) : '—'}
                </td>
                <td className={`gap-cell ${p.gapToLeaderMs === 0 ? 'gap-leader' : 'gap-positive'}`}>
                  {formatGap(p.gapToLeaderMs ?? 0)}
                </td>
                <td>
                  <span>{p.totalLaps}</span>
                </td>
                <td>
                  <LapTimeSparkline lapTimes={stats.lapTimes} width={50} height={18} />
                </td>
                <td>
                  <span className={statusInfo.className}>{statusInfo.label}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
