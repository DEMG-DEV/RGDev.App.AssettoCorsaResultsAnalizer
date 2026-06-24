import React, { useState } from 'react';
import { Clock, Users, Flag, Gauge, Trash2 } from 'lucide-react';
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
  const removeSession = useSessionStore(s => s.removeSession);
  const [showConfirm, setShowConfirm] = useState(false);
  const bestLapData = getSessionBestLap(session);
  const trackName = humanizeTrackName(session.track.venue, session.track.course);

  // Top 3 drivers
  const podium = session.participants.slice(0, 3);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowConfirm(true);
  };

  const confirmDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeSession(session.id);
    setShowConfirm(false);
  };

  const cancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowConfirm(false);
  };

  return (
    <div className="card card-clickable session-card animate-in" onClick={() => selectSession(session)}>
      {/* Delete confirmation overlay */}
      {showConfirm && (
        <div className="session-card-confirm-overlay" onClick={(e) => e.stopPropagation()}>
          <div className="session-card-confirm-content">
            <Trash2 size={24} />
            <p>{es.home.deleteConfirm}</p>
            <div className="session-card-confirm-actions">
              <button className="btn btn-sm" onClick={cancelDelete}>
                {es.common.back}
              </button>
              <button className="btn btn-sm btn-danger-solid" onClick={confirmDelete}>
                {es.home.deleteSession}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header: Track + Badge + Delete */}
      <div className="header">
        <div>
          <div className="track-name">{trackName}</div>
          {session.name && <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{session.name}</div>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className={`badge badge-${session.type}`}>
            {TYPE_LABELS[session.type] ?? session.type}
          </span>
          <button
            className="btn-delete-session"
            onClick={handleDelete}
            title={es.home.deleteSession}
            aria-label={es.home.deleteSession}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Podium — car preview + driver name side by side */}
      {podium.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, margin: '8px 0' }}>
          {podium.map((p, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
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
              <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: i === 0 ? 600 : 400, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {p.drivers[0]?.name ?? '—'}
                </span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {humanizeCarId(p.vehicle.modelId)}
                </span>
              </div>
            </div>
          ))}
          {session.participants.length > 3 && (
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', paddingLeft: 44 }}>
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

      {/* Best Lap */}
      {bestLapData && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
          <Gauge size={13} style={{ color: 'var(--color-faster)' }} />
          <span style={{ color: 'var(--color-faster)', fontFamily: 'var(--font-mono)', fontSize: '0.82rem', fontWeight: 600 }}>
            {formatLapTime(bestLapData.lap.timeMs)}
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
