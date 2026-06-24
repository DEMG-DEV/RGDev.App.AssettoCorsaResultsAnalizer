import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { Session } from '../../core/models/types';

const TYRE_COLORS: Record<string, string> = {
  S: '#FF1744', SM: '#FFD600', H: '#ECEFF1', SH: '#00B0FF',
  SS: '#D500F9', SV: '#76FF03', V: '#8D6E63', E: '#00E676',
  ST: '#FF9800', M: '#FFD600', HR: '#B71C1C',
};

interface Props {
  session: Session;
}

export const TyreStrategyTimeline: React.FC<Props> = ({ session }) => {
  // Build tyre stints per driver
  const driversToShow = session.participants.slice(0, 15);
  const data = driversToShow.map(p => {
    const name = (p.drivers[0]?.name ?? `P${p.position}`).slice(0, 12);
    const stints: Array<{ tyre: string; laps: number }> = [];
    let currentTyre = '';
    let currentCount = 0;

    for (const lap of p.laps) {
      const tyre = lap.tyre ?? 'Unknown';
      if (tyre === currentTyre) {
        currentCount++;
      } else {
        if (currentTyre) stints.push({ tyre: currentTyre, laps: currentCount });
        currentTyre = tyre;
        currentCount = 1;
      }
    }
    if (currentTyre) stints.push({ tyre: currentTyre, laps: currentCount });

    return { name, stints, totalLaps: p.laps.length };
  });

  // Create bar data - simple stacked approach using first tyre compound
  const barData = data.map(d => {
    const row: Record<string, number | string> = { name: d.name };
    d.stints.forEach((stint, i) => {
      row[`stint${i}`] = stint.laps;
      row[`tyre${i}`] = stint.tyre;
    });
    return row;
  });

  // Get max stints
  const maxStints = Math.max(...data.map(d => d.stints.length), 0);

  return (
    <div className="chart-container">
      <h3>🛞 Estrategia de neumáticos</h3>
      <ResponsiveContainer width="100%" height={Math.max(250, driversToShow.length * 30)}>
        <BarChart data={barData} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
          <XAxis type="number" stroke="var(--text-muted)" fontSize={12} />
          <YAxis type="category" dataKey="name" stroke="var(--text-muted)" fontSize={11} width={90} />
          <Tooltip
            contentStyle={{
              background: 'var(--bg-glass)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
            }}
          />
          {Array.from({ length: maxStints }, (_, i) => (
            <Bar key={i} dataKey={`stint${i}`} stackId="a" name={`Stint ${i + 1}`}>
              {barData.map((entry, idx) => {
                const tyre = (entry[`tyre${i}`] as string) ?? '';
                return <Cell key={idx} fill={TYRE_COLORS[tyre] ?? '#666'} />;
              })}
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
      {/* Tyre legend */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8, justifyContent: 'center' }}>
        {Object.entries(TYRE_COLORS).slice(0, 8).map(([key, color]) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem' }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: color }} />
            <span style={{ color: 'var(--text-muted)' }}>{key}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
