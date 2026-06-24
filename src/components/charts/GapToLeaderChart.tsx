import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { Session } from '../../core/models/types';
import { computeGapsPerLap } from '../../core/analyzers/session-analyzer';
import { formatGap } from '../../core/utils/time-formatter';

const COLORS = [
  '#60A5FA', '#F472B6', '#34D399', '#FBBF24', '#A78BFA',
  '#FB923C', '#22D3EE', '#F87171', '#4ADE80', '#E879F9',
];

interface Props {
  session: Session;
}

export const GapToLeaderChart: React.FC<Props> = ({ session }) => {
  const gapsPerLap = computeGapsPerLap(session);
  if (gapsPerLap.length === 0) return null;

  const driversToShow = session.participants.slice(1, 8); // skip leader, show top 7

  const data = gapsPerLap.map(gpl => {
    const row: Record<string, number | string> = { lap: gpl.lapNumber };
    driversToShow.forEach((p, pi) => {
      const gap = gpl.gaps.get(pi + 1) ?? 0;
      row[p.drivers[0]?.name ?? `P${p.position}`] = gap / 1000;
    });
    return row;
  });

  return (
    <div className="chart-container">
      <h3>📊 Brecha al líder</h3>
      <ResponsiveContainer width="100%" height={350}>
        <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
          <XAxis dataKey="lap" stroke="var(--text-muted)" fontSize={12} />
          <YAxis stroke="var(--text-muted)" fontSize={12} tickFormatter={(v: number) => `${v.toFixed(1)}s`} />
          <Tooltip
            contentStyle={{
              background: 'var(--bg-glass)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
            }}
            formatter={(value: number) => [formatGap(value * 1000), '']}
            labelFormatter={(label) => `Vuelta ${label}`}
          />
          {driversToShow.map((p, i) => (
            <Area
              key={p.drivers[0]?.name ?? i}
              type="monotone"
              dataKey={p.drivers[0]?.name ?? `P${p.position}`}
              stroke={COLORS[i % COLORS.length]}
              fill={COLORS[i % COLORS.length]}
              fillOpacity={0.15}
              strokeWidth={2}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
