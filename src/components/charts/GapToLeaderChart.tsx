import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { Session } from '../../core/models/types';
import { computeGapsPerLap } from '../../core/analyzers/session-analyzer';
import { formatGap } from '../../core/utils/time-formatter';

const COLORS = [
  '#60A5FA', '#F472B6', '#34D399', '#FBBF24', '#A78BFA',
  '#FB923C', '#22D3EE', '#F87171', '#4ADE80', '#E879F9',
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
          <defs>
            {COLORS.map((color, i) => (
              <linearGradient key={`gap-gradient-${i}`} id={`gap-gradient-${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" strokeOpacity={0.08} />
          <XAxis dataKey="lap" stroke="var(--text-muted)" fontSize={12} />
          <YAxis stroke="var(--text-muted)" fontSize={12} tickFormatter={(v: number) => `${v.toFixed(1)}s`} />
          <Tooltip
            {...TOOLTIP_STYLE}
            formatter={(value: number) => [formatGap(value * 1000), '']}
            labelFormatter={(label) => `Vuelta ${label}`}
          />
          {driversToShow.map((p, i) => (
            <Area
              key={p.drivers[0]?.name ?? i}
              type="natural"
              dataKey={p.drivers[0]?.name ?? `P${p.position}`}
              stroke={COLORS[i % COLORS.length]}
              fill={`url(#gap-gradient-${i % COLORS.length})`}
              fillOpacity={1}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5, stroke: 'white', strokeWidth: 2 }}
              animationDuration={1200}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
