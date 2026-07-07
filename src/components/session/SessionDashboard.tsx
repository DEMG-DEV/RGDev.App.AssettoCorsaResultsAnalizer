import React from 'react';
import type { Session } from '../../core/models/types';
import { humanizeTrackName } from '../../core/utils/car-name-humanizer';
import { formatLapTime, formatSessionDate } from '../../core/utils/time-formatter';
import { getSessionBestLap } from '../../core/analyzers/session-analyzer';
import { StandingsTable } from './StandingsTable';
import { TelemetryTable } from './TelemetryTable';
import { DataAnalysis } from './DataAnalysis';
import { LapTimesChart } from '../charts/LapTimesChart';
import { PositionChart } from '../charts/PositionChart';
import { SectorComparisonChart } from '../charts/SectorComparisonChart';
import { GapToLeaderChart } from '../charts/GapToLeaderChart';
import { FinishStatusDonut } from '../charts/FinishStatusDonut';
import { TyreStrategyTimeline } from '../charts/TyreStrategyTimeline';
import { ConsistencyRadar } from '../charts/ConsistencyRadar';
import { WeatherCard } from '../charts/WeatherCard';
import { AssistsGaugeCluster } from '../charts/AssistsGaugeCluster';
import { AiOpponentsBar } from '../charts/AiOpponentsBar';
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

export const SessionDashboard: React.FC<Props> = ({ session, sessionDate }) => {
  const trackName = humanizeTrackName(session.track.venue, session.track.course);
  const bestLapData = getSessionBestLap(session);

  const hasCmMetadata = !!session.cmMetadata;
  const hasAssists = !!session.cmMetadata?.assists;
  const hasAiOpponents = session.cmMetadata?.carMetadata && session.cmMetadata.carMetadata.size > 0;

  return (
    <div className="animate-in">
      {/* Session Header */}
      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
          <div>
            <h1 style={{ marginBottom: 4 }}>{trackName}</h1>
            {session.name && <div style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>{session.name}</div>}
          </div>
          <span className={`badge badge-${session.type}`} style={{ fontSize: '0.85rem', padding: '4px 14px' }}>
            {TYPE_LABELS[session.type] ?? session.type}
          </span>
        </div>

        {/* Stats Row */}
        <div className="stats-row" style={{ marginTop: 'var(--space-md)' }}>
          {sessionDate && (
            <div className="stat-card">
              <div className="label">Fecha</div>
              <div className="value" style={{ fontSize: '0.95rem' }}>{formatSessionDate(sessionDate)}</div>
            </div>
          )}
          <div className="stat-card">
            <div className="label">Pilotos</div>
            <div className="value">{session.participants.length}</div>
          </div>
          <div className="stat-card">
            <div className="label">Vueltas</div>
            <div className="value">{session.lastedLaps}</div>
          </div>
          {bestLapData && (
            <div className="stat-card">
              <div className="label">Mejor vuelta</div>
              <div className="value mono">{formatLapTime(bestLapData.lap.timeMs)}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                {bestLapData.participant.drivers[0]?.name}
              </div>
            </div>
          )}
          {session.cmMetadata?.temperatureAmbient && (
            <div className="stat-card">
              <div className="label">🌡️ Temperatura</div>
              <div className="value">{session.cmMetadata.temperatureAmbient}°C</div>
              {session.cmMetadata.temperatureRoad && (
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  Pista: {session.cmMetadata.temperatureRoad}°C
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bento Box Grid for Charts & Data */}
      <div className="bento-grid">
        {/* Standings Table (Full width) */}
        <div className="bento-item-12">
          <StandingsTable session={session} />
        </div>

        {/* Conditions row: Weather + Assists + AI Opponents (when CM metadata exists) */}
        {hasCmMetadata && session.cmMetadata && (
          <>
            <div className="bento-item-4">
              <WeatherCard metadata={session.cmMetadata} />
            </div>
            {hasAssists && session.cmMetadata.assists && (
              <div className="bento-item-4">
                <AssistsGaugeCluster assists={session.cmMetadata.assists} />
              </div>
            )}
            {hasAiOpponents && (
              <div className="bento-item-4">
                <AiOpponentsBar metadata={session.cmMetadata} />
              </div>
            )}
          </>
        )}

        {/* Status Donut (1/3) */}
        <div className="bento-item-4">
          <FinishStatusDonut session={session} />
        </div>

        {/* Tyre Strategy (2/3) */}
        <div className="bento-item-8">
          <TyreStrategyTimeline session={session} />
        </div>

        {/* Lap Times Evolution (Full width) */}
        <div className="bento-item-12">
          <LapTimesChart session={session} />
        </div>

        {/* Position Chart (Half width) */}
        <div className="bento-item-6">
          <PositionChart session={session} />
        </div>

        {/* Gap To Leader (Half width) */}
        <div className="bento-item-6">
          <GapToLeaderChart session={session} />
        </div>

        {/* Sector Comparison (Half width) */}
        <div className="bento-item-6">
          <SectorComparisonChart session={session} />
        </div>

        {/* Consistency Radar (Half width) */}
        <div className="bento-item-6">
          <ConsistencyRadar session={session} />
        </div>

        {/* AI Data Analysis */}
        <div className="bento-item-12">
          <DataAnalysis session={session} />
        </div>

        {/* Telemetry — detailed lap-by-lap for each participant */}
        {session.participants.slice(0, 4).map((p, i) => (
          <div key={i} className="bento-item-12">
            <TelemetryTable session={session} participant={p} />
          </div>
        ))}
      </div>
    </div>
  );
};
