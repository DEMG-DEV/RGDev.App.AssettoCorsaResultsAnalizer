import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Session } from '../../core/models/types';
import { computePositionsPerLap } from '../../core/analyzers/session-analyzer';
import { es } from '../../i18n/es';

const COLORS = [
  'var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)',
  'var(--chart-5)', 'var(--chart-6)', 'var(--chart-7)', 'var(--chart-8)',
  'var(--chart-9)', 'var(--chart-10)', 'var(--chart-11)', 'var(--chart-12)',
];

interface Props {
  session: Session;
}

export const PositionChart: React.FC<Props> = ({ session }) => {
  const positionsPerLap = computePositionsPerLap(session);
  if (positionsPerLap.length === 0) return <div className="text-muted">{es.common.noData}</div>;

  const driversToShow = session.participants.slice(0, 10);

  const data = positionsPerLap.map(ppl => {
    const row: Record<string, number> = { lap: ppl.lapNumber };
    driversToShow.forEach((p, pi) => {
      row[p.drivers[0]?.name ?? `P${p.position}`] = ppl.positions.get(pi) ?? session.participants.length;
    });
    return row;
  });

  return (
    <div className="chart-container">
      <h3>🔄 {es.session.positions}</h3>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
          <XAxis dataKey="lap" stroke="var(--text-muted)" fontSize={12} />
          <YAxis
            reversed
            stroke="var(--text-muted)"
            fontSize={12}
            domain={[1, session.participants.length]}
            ticks={Array.from({ length: Math.min(session.participants.length, 20) }, (_, i) => i + 1)}
            label={{ value: 'Posición', angle: -90, position: 'insideLeft', fill: 'var(--text-muted)' }}
          />
          <Tooltip
            contentStyle={{
              background: 'var(--bg-glass)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
            }}
            labelFormatter={(label) => `Vuelta ${label}`}
            formatter={(value: number) => [`P${value}`, '']}
          />
          <Legend />
          {driversToShow.map((p, i) => (
            <Line
              key={p.drivers[0]?.name ?? i}
              type="linear"
              dataKey={p.drivers[0]?.name ?? `P${p.position}`}
              stroke={COLORS[i % COLORS.length]}
              strokeWidth={3}
              dot={{ r: 4, fill: COLORS[i % COLORS.length] }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
