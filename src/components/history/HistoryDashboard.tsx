import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
         PieChart, Pie, LineChart, Line } from 'recharts';
import { useSessionStore } from '../../stores/session-store';
import { computeHistoryStats } from '../../core/analyzers/history-analyzer';
import { humanizeCarId, humanizeTrackName } from '../../core/utils/car-name-humanizer';
import { formatLapTime } from '../../core/utils/time-formatter';
import { CalendarHeatmap } from '../charts/CalendarHeatmap';
import { TrackTreemap } from '../charts/TrackTreemap';
import { LapTimeBoxPlot } from '../charts/LapTimeBoxPlot';
import { WinPodiumRate } from '../charts/WinPodiumRate';
import { AiLevelHistogram } from '../charts/AiLevelHistogram';
import { PositionBadge } from '../shared/PositionBadge';
import { Trophy, Medal } from 'lucide-react';
import { es } from '../../i18n/es';

const PIE_COLORS = ['#60A5FA', '#F472B6', '#34D399', '#FBBF24', '#A78BFA', '#FB923C', '#22D3EE', '#F87171'];

const TYPE_COLORS: Record<string, string> = {
  practice: '#60A5FA',
  qualify: '#FBBF24',
  race: '#EF4444',
  hotlap: '#A855F7',
  warmup: '#34D399',
};

const TOOLTIP_STYLE = {
  contentStyle: {
    background: 'rgba(15, 15, 20, 0.95)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    backdropFilter: 'blur(20px)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    padding: '12px 16px',
  },
  itemStyle: { color: '#e0e0e0', fontSize: '0.8rem', padding: '2px 0' },
  labelStyle: { color: '#999', fontSize: '0.75rem', marginBottom: 4, fontWeight: 600 },
};

export const HistoryDashboard: React.FC = () => {
  const results = useSessionStore(s => s.results);
  const stats = computeHistoryStats(results);

  // Car usage data
  const carData = Array.from(stats.carUsage.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([car, count]) => ({
      name: humanizeCarId(car).slice(0, 18),
      value: count,
    }));

  // Session type data
  const typeData = Array.from(stats.sessionTypeBreakdown.entries())
    .map(([type, count]) => ({
      name: type,
      count,
      color: TYPE_COLORS[type] ?? '#9E9E9E',
    }));

  // Performance trend data
  const trendData = stats.performanceTrend.map((pt, i) => ({
    index: i + 1,
    time: pt.bestLapMs / 1000,
    track: humanizeTrackName(pt.trackVenue),
    date: pt.date.toLocaleDateString('es-MX'),
  }));

  return (
    <div className="animate-in">
      <h1 style={{ marginBottom: 'var(--space-lg)' }}>📈 {es.history.title}</h1>

      {/* Summary stats */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="label">{es.history.totalSessions}</div>
          <div className="value">{stats.totalSessions}</div>
        </div>
        <div className="stat-card">
          <div className="label">{es.history.totalLaps}</div>
          <div className="value">{stats.totalLaps.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="label">Pistas</div>
          <div className="value">{stats.trackFrequency.size}</div>
        </div>
        <div className="stat-card">
          <div className="label">Autos</div>
          <div className="value">{stats.carUsage.size}</div>
        </div>
        {stats.podiumRates.totalRaces > 0 && (
          <div className="stat-card">
            <div className="label">🏆 Victorias</div>
            <div className="value" style={{ color: '#FFD700' }}>{stats.podiumRates.wins}</div>
          </div>
        )}
      </div>

      {/* Championship standings leaderboard */}
      {stats.championshipStandings.length > 0 && (
        <div className="chart-container full-width" style={{ marginTop: 'var(--space-lg)', paddingBottom: 'var(--space-md)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 'var(--space-md)' }}>
            <Trophy style={{ color: 'var(--color-p1)' }} size={20} />
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Clasificación General del Campeonato</h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th className="pos-cell" style={{ width: 60 }}>Pos</th>
                  <th>Piloto</th>
                  <th style={{ textAlign: 'center' }}>Puntos</th>
                  <th style={{ textAlign: 'center' }}>Carreras</th>
                  <th style={{ textAlign: 'center' }}>Victorias</th>
                  <th style={{ textAlign: 'center' }}>Podios</th>
                  <th style={{ textAlign: 'center' }}>Mejor Pos.</th>
                  <th style={{ textAlign: 'center' }}>Pos. Promedio</th>
                  <th>Vehículos</th>
                </tr>
              </thead>
              <tbody>
                {stats.championshipStandings.map((standing, index) => (
                  <tr key={standing.driverName}>
                    <td className="pos-cell">
                      <PositionBadge position={index + 1} />
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{standing.driverName}</span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="badge" style={{
                        background: index === 0 ? 'var(--gradient-gold)' : index === 1 ? 'linear-gradient(135deg, #757F9A 0%, #D7DDE8 100%)' : index === 2 ? 'linear-gradient(135deg, #8A2387 0%, #E94057 100%)' : 'var(--bg-secondary)',
                        color: 'white',
                        fontWeight: 800,
                        fontSize: '0.85rem',
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-sm)'
                      }}>
                        {standing.points} pts
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ fontWeight: 600 }}>{standing.racesCount}</span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {standing.winsCount > 0 ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--color-p1)', fontWeight: 700 }}>
                          <Trophy size={12} /> {standing.winsCount}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>0</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {standing.podiumsCount > 0 ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#FFB300', fontWeight: 700 }}>
                          <Medal size={12} /> {standing.podiumsCount}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>0</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{
                        color: standing.bestFinish === 1 ? 'var(--color-p1)' : standing.bestFinish <= 3 ? 'var(--text-primary)' : 'var(--text-secondary)',
                        fontWeight: standing.bestFinish <= 3 ? 700 : 500
                      }}>
                        P{standing.bestFinish === 99 ? '—' : standing.bestFinish}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
                      {standing.avgPosition > 0 ? `P${standing.avgPosition.toFixed(1)}` : '—'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {standing.cars.slice(0, 3).map(car => (
                          <span key={car} className="badge badge-default" style={{ fontSize: '0.68rem', padding: '2px 6px' }} title={car}>
                            {humanizeCarId(car)}
                          </span>
                        ))}
                        {standing.cars.length > 3 && (
                          <span className="badge badge-default" style={{ fontSize: '0.68rem', padding: '2px 6px', opacity: 0.7 }}>
                            +{standing.cars.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="charts-grid" style={{ marginTop: 'var(--space-lg)' }}>
        {/* Calendar Heatmap (Full width) */}
        <div className="full-width">
          <CalendarHeatmap calendarData={stats.calendarData} />
        </div>

        {/* Performance Trend */}
        {trendData.length > 1 && (
          <div className="chart-container full-width">
            <h3>📈 {es.history.performanceTrend}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" strokeOpacity={0.08} />
                <XAxis dataKey="index" stroke="var(--text-muted)" fontSize={11} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickFormatter={(v: number) => formatLapTime(v * 1000)} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE.contentStyle}
                  itemStyle={TOOLTIP_STYLE.itemStyle}
                  labelStyle={TOOLTIP_STYLE.labelStyle}
                  formatter={(v: number) => [formatLapTime(v * 1000), 'Mejor vuelta']}
                  labelFormatter={(_, payload) => {
                    const item = payload?.[0]?.payload as { track?: string; date?: string } | undefined;
                    return `${item?.track ?? ''} — ${item?.date ?? ''}`;
                  }}
                />
                <Line type="monotone" dataKey="time" stroke="var(--color-pb)" strokeWidth={2.5} dot={{ r: 4, fill: 'var(--color-pb)' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Track Treemap */}
        <TrackTreemap trackFrequency={stats.trackFrequency} />

        {/* Car Usage Donut */}
        <div className="chart-container">
          <h3>🏎️ {es.history.carUsage}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={carData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} dataKey="value">
                {carData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="var(--bg-primary)" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={TOOLTIP_STYLE.contentStyle}
                itemStyle={TOOLTIP_STYLE.itemStyle}
                labelStyle={TOOLTIP_STYLE.labelStyle}
              />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginTop: 4 }}>
            {carData.map((d, i) => (
              <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.72rem' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: PIE_COLORS[i % PIE_COLORS.length] }} />
                <span style={{ color: 'var(--text-secondary)' }}>{d.name}: {d.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Lap Time Box Plot (Full width) */}
        {stats.boxPlotData.length > 0 && (
          <div className="full-width">
            <LapTimeBoxPlot data={stats.boxPlotData} />
          </div>
        )}

        {/* Win/Podium Rate */}
        {stats.podiumRates.totalRaces > 0 && (
          <WinPodiumRate rates={stats.podiumRates} />
        )}

        {/* AI Level Histogram */}
        {stats.aiLevelHistogram.size > 0 && (
          <AiLevelHistogram histogram={stats.aiLevelHistogram} />
        )}

        {/* Session Types */}
        <div className="chart-container">
          <h3>📋 {es.history.sessionTypes}</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={typeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" strokeOpacity={0.08} />
              <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} />
              <YAxis stroke="var(--text-muted)" fontSize={11} />
              <Tooltip
                contentStyle={TOOLTIP_STYLE.contentStyle}
                itemStyle={TOOLTIP_STYLE.itemStyle}
                labelStyle={TOOLTIP_STYLE.labelStyle}
              />
              <Bar dataKey="count" name="Sesiones">
                {typeData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
