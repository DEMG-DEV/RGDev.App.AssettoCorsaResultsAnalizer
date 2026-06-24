import React, { useMemo } from 'react';
import { Clock, Users, Flag, Gauge, Trophy, Car } from 'lucide-react';
import type { Session } from '../../core/models/types';
import { humanizeTrackName, humanizeCarId } from '../../core/utils/car-name-humanizer';
import { formatLapTime, formatSessionDate } from '../../core/utils/time-formatter';
import { getSessionBestLap } from '../../core/analyzers/session-analyzer';
import { CarPreviewImage } from '../shared/CarPreviewImage';
import { useSessionStore } from '../../stores/session-store';
import { es } from '../../i18n/es';

interface Props {
  session: Session;
  sessionDate?: Date;
}

const TYPE_LABELS: Record<string, string> = {
  practice: es.session.practice,
  qualify: es.session.qualify,
  race: es.session.race,
  hotlap: es.session.hotlap,
  warmup: es.session.warmup,
};

export const SessionCard: React.FC<Props> = ({ session, sessionDate }) => {
  const selectSession = useSessionStore(s => s.selectSession);
  const bestLapData = getSessionBestLap(session);
  const trackName = humanizeTrackName(session.track.venue, session.track.course);

  // Top 3 drivers
  const podium = session.participants.slice(0, 3);

  // Unique cars used
  const uniqueCars = useMemo(() => {
    const cars = new Set(session.participants.map(p => p.vehicle.modelId));
    return Array.from(cars);
  }, [session.participants]);

  // Winner info
  const winner = session.participants[0];
  const winnerName = winner?.drivers[0]?.name ?? '';

  return (
    <div className="card card-clickable session-card animate-in" onClick={() => selectSession(session)}>
      {/* Header: Track + Badge */}
      <div className="header">
        <div>
          <div className="track-name">{trackName}</div>
          {session.name && <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{session.name}</div>}
        </div>
        <span className={`badge badge-${session.type}`}>
          {TYPE_LABELS[session.type] ?? session.type}
        </span>
      </div>

      {/* Top 3 Car Previews */}
      {podium.length > 0 && (
        <div style={{ display: 'flex', gap: 6, margin: '8px 0', alignItems: 'center' }}>
          {podium.map((p, i) => (
            <div key={i} style={{ position: 'relative' }}>
              <CarPreviewImage carId={p.vehicle.modelId} skinName={p.vehicle.skin} size={36} showPopover={false} />
              <div style={{
                position: 'absolute',
                top: -4,
                left: -4,
                width: 16,
                height: 16,
                borderRadius: '50%',
                background: i === 0 ? 'var(--color-p1)' : i === 1 ? 'var(--color-p2)' : 'var(--color-p3)',
                color: '#000',
                fontSize: '0.55rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {i + 1}
              </div>
            </div>
          ))}
          {session.participants.length > 3 && (
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              +{session.participants.length - 3} más
            </span>
          )}
        </div>
      )}

      {/* Key Stats Row */}
      <div className="meta">
        {sessionDate && (
          <span className="stat">
            <Clock size={13} />
            {formatSessionDate(sessionDate)}
          </span>
        )}
        <span className="stat">
          <Users size={13} />
          {session.participants.length} {es.session.drivers}
        </span>
        <span className="stat">
          <Flag size={13} />
          {session.lastedLaps} {es.session.laps}
        </span>
      </div>

      {/* Winner + Best Lap */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6, gap: 8 }}>
        {winnerName && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem' }}>
            <Trophy size={13} style={{ color: 'var(--color-p1)' }} />
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{winnerName}</span>
          </div>
        )}
        {bestLapData && (
          <span className="stat" style={{ color: 'var(--color-faster)', fontFamily: 'var(--font-mono)', fontSize: '0.82rem', fontWeight: 600 }}>
            <Gauge size={13} />
            {formatLapTime(bestLapData.lap.timeMs)}
          </span>
        )}
      </div>

      {/* Cars used */}
      {uniqueCars.length > 0 && (
        <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginTop: 6, flexWrap: 'wrap' }}>
          <Car size={12} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>
            {uniqueCars.slice(0, 3).map(c => humanizeCarId(c)).join(', ')}
            {uniqueCars.length > 3 && ` +${uniqueCars.length - 3}`}
          </span>
        </div>
      )}

      {/* Weather + Temperature */}
      {session.cmMetadata?.temperatureAmbient && (
        <div style={{ display: 'flex', gap: 8, fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>
          <span>🌡️ {session.cmMetadata.temperatureAmbient}°C</span>
          {session.cmMetadata.weatherName && <span>☁️ {session.cmMetadata.weatherName}</span>}
        </div>
      )}
    </div>
  );
};
