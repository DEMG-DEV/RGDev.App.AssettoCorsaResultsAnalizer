import React, { useState, useMemo } from 'react';
import { useSessionStore } from '../../stores/session-store';
import { humanizeCarId, humanizeTrackName } from '../../core/utils/car-name-humanizer';
import { formatLapTime, formatSessionDate } from '../../core/utils/time-formatter';
import { PositionBadge } from './PositionBadge';
import { CarPreviewImage } from './CarPreviewImage';
import { Trophy, Calendar, Compass } from 'lucide-react';

interface TrackRecordEntry {
  driverName: string;
  carId: string;
  skin?: string;
  bestLapMs: number;
  sessionType: string;
  sessionDate: Date;
  fileName: string;
  totalLaps: number;
}

export const TrackRecordsView: React.FC = () => {
  const results = useSessionStore(s => s.results);
  
  // Group all sessions by track venue name
  const tracksMap = useMemo(() => {
    const map = new Map<string, Array<{ session: any; date: Date; fileName: string }>>();
    
    for (const res of results) {
      const sDate = res.sessionDate ?? res.parsedAt;
      for (const s of res.sessions) {
        const venue = s.track.venue;
        if (!map.has(venue)) {
          map.set(venue, []);
        }
        map.get(venue)!.push({ session: s, date: sDate, fileName: res.fileName });
      }
    }
    return map;
  }, [results]);

  const trackList = useMemo(() => Array.from(tracksMap.keys()), [tracksMap]);
  const [selectedTrack, setSelectedTrack] = useState<string>(() => trackList[0] ?? '');

  // Calculate consolidated records for the selected track
  const records = useMemo(() => {
    if (!selectedTrack) return [];
    
    const trackSessions = tracksMap.get(selectedTrack) ?? [];
    // Key: "driverName|carId"
    const driverCarRecords = new Map<string, TrackRecordEntry>();

    for (const { session, date, fileName } of trackSessions) {
      for (const p of session.participants) {
        const driverName = p.drivers[0]?.name ?? 'Driver';
        const carId = p.vehicle.modelId;
        const skin = p.vehicle.skin;
        
        // Find best valid lap for this participant
        const validLaps = p.laps.filter((l: any) => l.isValid && l.timeMs > 0);
        if (validLaps.length === 0) continue;
        
        const bestLapMs = Math.min(...validLaps.map((l: any) => l.timeMs));
        const key = `${driverName}|${carId}`;
        
        const existing = driverCarRecords.get(key);
        if (!existing || bestLapMs < existing.bestLapMs) {
          driverCarRecords.set(key, {
            driverName,
            carId,
            skin,
            bestLapMs,
            sessionType: session.type,
            sessionDate: date,
            fileName,
            totalLaps: p.totalLaps,
          });
        }
      }
    }

    // Sort ascending by lap time
    return Array.from(driverCarRecords.values()).sort((a, b) => a.bestLapMs - b.bestLapMs);
  }, [selectedTrack, tracksMap]);

  if (trackList.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--space-2xl)', color: 'var(--text-muted)' }}>
        No hay datos de pistas disponibles.
      </div>
    );
  }

  const recordLeader = records[0];

  return (
    <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
        <div>
          <h1 style={{ marginBottom: 4, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Trophy style={{ color: 'var(--color-p1)' }} size={24} /> Récords por Pista
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
            Compara tiempos de vueltas de todos los autos y pilotos en una misma pista.
          </p>
        </div>
      </div>

      {/* Track Selector Pills */}
      <div style={{
        display: 'flex',
        gap: 8,
        overflowX: 'auto',
        paddingBottom: 8,
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        {trackList.map(venue => (
          <button
            key={venue}
            onClick={() => setSelectedTrack(venue)}
            className={`btn btn-sm ${selectedTrack === venue ? '' : 'btn-ghost'}`}
            style={{
              whiteSpace: 'nowrap',
              borderRadius: 'var(--radius-full)',
              fontWeight: 700,
              padding: '6px 16px',
            }}
          >
            📍 {humanizeTrackName(venue)}
            <span style={{
              marginLeft: 6,
              fontSize: '0.7rem',
              opacity: 0.6,
              background: selectedTrack === venue ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
              padding: '2px 6px',
              borderRadius: 'var(--radius-sm)'
            }}>
              {tracksMap.get(venue)?.length}
            </span>
          </button>
        ))}
      </div>

      {/* Selected Track Leaderboard */}
      {selectedTrack && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          {/* Highlight record holder */}
          {recordLeader && (
            <div className="chart-container" style={{
              background: 'var(--gradient-gold)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 'var(--space-md)',
              padding: 'var(--space-lg) var(--space-xl)',
            }}>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.85 }}>
                  👑 Record de la Pista (Absolute Record)
                </span>
                <h2 style={{ margin: '4px 0', fontSize: '1.8rem', fontWeight: 900 }}>
                  {formatLapTime(recordLeader.bestLapMs)}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', fontWeight: 600, opacity: 0.9 }}>
                  <span>{recordLeader.driverName}</span>
                  <span style={{ opacity: 0.5 }}>|</span>
                  <span>{humanizeCarId(recordLeader.carId)}</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 90, height: 90, borderRadius: '50%', overflow: 'hidden', border: '3px solid white', background: 'rgba(0,0,0,0.2)' }}>
                  <CarPreviewImage carId={recordLeader.carId} skinName={recordLeader.skin} />
                </div>
              </div>
            </div>
          )}

          {/* Combined Leaderboard Table */}
          <div className="chart-container" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: 'var(--space-md) var(--space-lg)', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Compass size={16} style={{ color: 'var(--text-accent)' }} />
              <span style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Clasificación Unificada: {humanizeTrackName(selectedTrack)}
              </span>
            </div>
            
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="pos-cell" style={{ width: 60 }}>Pos</th>
                    <th>Piloto</th>
                    <th>Auto</th>
                    <th className="time-cell">Mejor Vuelta</th>
                    <th className="time-cell">Brecha</th>
                    <th style={{ textAlign: 'center' }}>Vueltas</th>
                    <th>Sesión</th>
                    <th>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((entry, idx) => {
                    const gapMs = idx > 0 ? entry.bestLapMs - recordLeader!.bestLapMs : 0;
                    
                    return (
                      <tr key={`${entry.driverName}-${entry.carId}`}>
                        <td className="pos-cell">
                          <PositionBadge position={idx + 1} />
                        </td>
                        <td>
                          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                            {entry.driverName}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 44, height: 44, borderRadius: 6, overflow: 'hidden', background: 'var(--bg-secondary)', flexShrink: 0 }}>
                              <CarPreviewImage carId={entry.carId} skinName={entry.skin} />
                            </div>
                            <span style={{ fontWeight: 600 }}>{humanizeCarId(entry.carId)}</span>
                          </div>
                        </td>
                        <td className="time-cell" style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: idx === 0 ? 'var(--color-pb)' : 'var(--text-primary)' }}>
                          {formatLapTime(entry.bestLapMs)}
                        </td>
                        <td className="time-cell" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: idx === 0 ? 'var(--color-faster)' : 'var(--color-slower)' }}>
                          {idx === 0 ? 'Record' : `+${(gapMs / 1000).toFixed(3)}s`}
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: 600 }}>
                          {entry.totalLaps}
                        </td>
                        <td>
                          <span className={`badge badge-${entry.sessionType}`} style={{ fontSize: '0.7rem', padding: '3px 8px' }}>
                            {entry.sessionType === 'practice' ? 'Práctica' : entry.sessionType === 'race' ? 'Carrera' : entry.sessionType}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            <Calendar size={12} />
                            {formatSessionDate(entry.sessionDate)}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
