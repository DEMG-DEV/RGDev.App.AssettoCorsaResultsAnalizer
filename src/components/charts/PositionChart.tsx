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
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" strokeOpacity={0.08} />
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
            {...TOOLTIP_STYLE}
            labelFormatter={(label) => `Vuelta ${label}`}
            formatter={(value: number) => [`P${value}`, '']}
          />
          <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
          {driversToShow.map((p, i) => {
            const color = COLORS[i % COLORS.length];
            return (
              <Line
                key={p.drivers[0]?.name ?? i}
                type="stepAfter"
                dataKey={p.drivers[0]?.name ?? `P${p.position}`}
                stroke={color}
                strokeWidth={3}
                dot={{ r: 3, fill: color, stroke: 'white', strokeWidth: 1.5 }}
                activeDot={{ r: 7, strokeWidth: 3, stroke: 'white', fill: color }}
                animationDuration={1000}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
