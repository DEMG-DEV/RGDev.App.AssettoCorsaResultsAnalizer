import React from 'react';
import { Clock, Users, Flag, Gauge } from 'lucide-react';
import type { Session } from '../../core/models/types';
import { humanizeTrackName } from '../../core/utils/car-name-humanizer';
import { formatLapTime, formatSessionDate } from '../../core/utils/time-formatter';
import { getSessionBestLap } from '../../core/analyzers/session-analyzer';
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

  return (
    <div className="card card-clickable session-card animate-in" onClick={() => selectSession(session)}>
      <div className="header">
        <div>
          <div className="track-name">{trackName}</div>
          {session.name && <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{session.name}</div>}
        </div>
        <span className={`badge badge-${session.type}`}>
          {TYPE_LABELS[session.type] ?? session.type}
        </span>
      </div>

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
        {bestLapData && (
          <span className="stat" style={{ color: 'var(--color-faster)' }}>
            <Gauge size={13} />
            {formatLapTime(bestLapData.lap.timeMs)}
          </span>
        )}
      </div>

      {/* Weather info from CM metadata */}
      {session.cmMetadata?.temperatureAmbient && (
        <div style={{ display: 'flex', gap: 8, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <span>🌡️ {session.cmMetadata.temperatureAmbient}°C</span>
          {session.cmMetadata.weatherName && <span>☁️ {session.cmMetadata.weatherName}</span>}
        </div>
      )}
    </div>
  );
};
