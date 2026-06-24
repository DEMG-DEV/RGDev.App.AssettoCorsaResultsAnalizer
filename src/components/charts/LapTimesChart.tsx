import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Session } from '../../core/models/types';
import { formatLapTime } from '../../core/utils/time-formatter';
import { es } from '../../i18n/es';

const COLORS = [
  'var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)',
  'var(--chart-5)', 'var(--chart-6)', 'var(--chart-7)', 'var(--chart-8)',
  'var(--chart-9)', 'var(--chart-10)', 'var(--chart-11)', 'var(--chart-12)',
];

interface Props {
  session: Session;
}

export const LapTimesChart: React.FC<Props> = ({ session }) => {
  const maxLaps = Math.max(...session.participants.map(p => p.laps.length), 0);
  if (maxLaps === 0) return <div className="text-muted">{es.common.noData}</div>;

  // Build chart data: one row per lap
  const data = [];
  for (let lap = 1; lap <= maxLaps; lap++) {
    const row: Record<string, number | string> = { lap };
    for (const p of session.participants) {
      const lapData = p.laps.find(l => l.lapNumber === lap);
      if (lapData && lapData.timeMs > 0) {
        row[p.drivers[0]?.name ?? `P${p.position}`] = lapData.timeMs / 1000;
      }
    }
    data.push(row);
  }

  // Limit to top 10 drivers for readability
  const driversToShow = session.participants.slice(0, 10);

  return (
    <div className="chart-container">
      <h3>📈 {es.session.lapTimes}</h3>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
          <XAxis
            dataKey="lap"
            stroke="var(--text-muted)"
            fontSize={12}
            label={{ value: 'Vuelta', position: 'insideBottom', offset: -5, fill: 'var(--text-muted)' }}
          />
          <YAxis
            stroke="var(--text-muted)"
            fontSize={12}
            tickFormatter={(v: number) => formatLapTime(v * 1000)}
            domain={['auto', 'auto']}
          />
          <Tooltip
            contentStyle={{
              background: 'var(--bg-glass)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              backdropFilter: 'blur(12px)',
            }}
            labelStyle={{ color: 'var(--text-secondary)', fontSize: 12 }}
            formatter={(value: number) => [formatLapTime(value * 1000), '']}
            labelFormatter={(label) => `Vuelta ${label}`}
          />
          <Legend />
          {driversToShow.map((p, i) => (
            <Line
              key={p.drivers[0]?.name ?? i}
              type="monotone"
              dataKey={p.drivers[0]?.name ?? `P${p.position}`}
              stroke={COLORS[i % COLORS.length]}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
              connectNulls={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
