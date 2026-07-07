import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import type { Session } from '../../core/models/types';

const TYRE_COLORS: Record<string, string> = {
  S: '#FF1744',
  SM: '#FF9100',
  H: '#B0BEC5',
  SH: '#78909C',
  SS: '#D500F9',
  SV: '#76FF03',
  V: '#8D6E63',
  E: '#00E676',
  ST: '#FF6D00',
  M: '#FFD600',
  HR: '#B71C1C',
  I: '#00E676',
  W: '#2979FF',
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

  // Collect unique tyre compounds used
  const usedCompounds = new Set<string>();
  data.forEach(d => d.stints.forEach(s => usedCompounds.add(s.tyre)));

  return (
    <div className="chart-container">
      <h3>🛞 Estrategia de neumáticos</h3>
      <ResponsiveContainer width="100%" height={Math.max(250, driversToShow.length * 30)}>
        <BarChart data={barData} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
          <CartesianGrid strokeOpacity={0.06} horizontal={false} />
          <XAxis type="number" stroke="var(--text-muted)" fontSize={12} />
          <YAxis type="category" dataKey="name" stroke="var(--text-muted)" fontSize={11} width={90} />
          <Tooltip
            contentStyle={TOOLTIP_STYLE.contentStyle}
            itemStyle={TOOLTIP_STYLE.itemStyle}
            labelStyle={TOOLTIP_STYLE.labelStyle}
          />
          {Array.from({ length: maxStints }, (_, i) => (
            <Bar
              key={i}
              dataKey={`stint${i}`}
              stackId="a"
              name={`Stint ${i + 1}`}
              barSize={18}
              radius={[0, 4, 4, 0]}
              animationDuration={800}
            >
              {barData.map((entry, idx) => {
                const tyre = (entry[`tyre${i}`] as string) ?? '';
                return <Cell key={idx} fill={TYRE_COLORS[tyre] ?? '#444'} />;
              })}
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
      {/* Tyre legend - pill-shaped chips */}
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 10, justifyContent: 'center' }}>
        {Array.from(usedCompounds)
          .filter(key => TYRE_COLORS[key])
          .map(key => (
            <div
              key={key}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: '0.78rem',
                background: 'rgba(255,255,255,0.04)',
                padding: '4px 10px',
                borderRadius: '999px',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: TYRE_COLORS[key],
                  boxShadow: `0 0 4px ${TYRE_COLORS[key]}55`,
                }}
              />
              <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{key}</span>
            </div>
          ))}
      </div>
    </div>
  );
};
