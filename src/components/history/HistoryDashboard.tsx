import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
         PieChart, Pie, LineChart, Line } from 'recharts';
import { useSessionStore } from '../../stores/session-store';
import { computeHistoryStats } from '../../core/analyzers/history-analyzer';
import { humanizeCarId, humanizeTrackName } from '../../core/utils/car-name-humanizer';
import { formatLapTime } from '../../core/utils/time-formatter';
import { es } from '../../i18n/es';

const PIE_COLORS = ['#60A5FA', '#F472B6', '#34D399', '#FBBF24', '#A78BFA', '#FB923C', '#22D3EE', '#F87171'];

const TYPE_COLORS: Record<string, string> = {
  practice: '#60A5FA',
  qualify: '#FBBF24',
  race: '#EF4444',
  hotlap: '#A855F7',
  warmup: '#34D399',
};

export const HistoryDashboard: React.FC = () => {
  const results = useSessionStore(s => s.results);
  const stats = computeHistoryStats(results);

  // Track frequency data
  const trackData = Array.from(stats.trackFrequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([track, count]) => {
      const parts = track.split('/');
      const name = humanizeTrackName(parts[0]!, parts[1]);
      return { name: name.slice(0, 20), count };
    });

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

  // Calendar heatmap data (simplified as bar chart by month)
  const monthCounts = new Map<string, number>();
  for (const [dateStr, count] of stats.calendarData) {
    const month = dateStr.slice(0, 7); // YYYY-MM
    monthCounts.set(month, (monthCounts.get(month) ?? 0) + count);
  }
  const calendarData = Array.from(monthCounts.entries())
    .sort()
    .map(([month, count]) => ({ month, count }));

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
      </div>

      <div className="charts-grid">
        {/* Performance Trend */}
        {trendData.length > 1 && (
          <div className="chart-container full-width">
            <h3>📈 {es.history.performanceTrend}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis dataKey="index" stroke="var(--text-muted)" fontSize={11} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickFormatter={(v: number) => formatLapTime(v * 1000)} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-glass)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}
                  formatter={(v: number) => [formatLapTime(v * 1000), 'Mejor vuelta']}
                  labelFormatter={(_, payload) => {
                    const item = payload?.[0]?.payload as { track?: string; date?: string } | undefined;
                    return `${item?.track ?? ''} — ${item?.date ?? ''}`;
                  }}
                />
                <Line type="monotone" dataKey="time" stroke="var(--color-pb)" strokeWidth={2} dot={{ r: 4, fill: 'var(--color-pb)' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Track Frequency */}
        <div className="chart-container">
          <h3>🗺️ {es.history.trackFrequency}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={trackData} layout="vertical" margin={{ left: 120 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis type="number" stroke="var(--text-muted)" fontSize={11} />
              <YAxis type="category" dataKey="name" stroke="var(--text-muted)" fontSize={10} width={110} />
              <Tooltip contentStyle={{ background: 'var(--bg-glass)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }} />
              <Bar dataKey="count" name="Sesiones" fill="var(--chart-1)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

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
              <Tooltip contentStyle={{ background: 'var(--bg-glass)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }} />
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

        {/* Session Types */}
        <div className="chart-container">
          <h3>📋 {es.history.sessionTypes}</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={typeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} />
              <YAxis stroke="var(--text-muted)" fontSize={11} />
              <Tooltip contentStyle={{ background: 'var(--bg-glass)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }} />
              <Bar dataKey="count" name="Sesiones">
                {typeData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Activity by Month */}
        {calendarData.length > 1 && (
          <div className="chart-container">
            <h3>📅 Actividad por mes</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={calendarData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={10} />
                <YAxis stroke="var(--text-muted)" fontSize={11} />
                <Tooltip contentStyle={{ background: 'var(--bg-glass)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }} />
                <Bar dataKey="count" name="Sesiones" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};
