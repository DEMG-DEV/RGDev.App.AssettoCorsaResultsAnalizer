import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { Session } from '../../core/models/types';

const STATUS_COLORS: Record<string, string> = {
  finished: '#00E676',
  dnf: '#FF6D00',
  dq: '#FF1744',
  none: '#546E7A',
};

const STATUS_LABELS: Record<string, string> = {
  finished: 'Terminaron',
  dnf: 'No terminaron',
  dq: 'Descalificados',
  none: 'Sin estado',
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

export const FinishStatusDonut: React.FC<Props> = ({ session }) => {
  const counts = new Map<string, number>();
  for (const p of session.participants) {
    counts.set(p.finishStatus, (counts.get(p.finishStatus) ?? 0) + 1);
  }

  const data = Array.from(counts.entries()).map(([status, count]) => ({
    name: STATUS_LABELS[status] ?? status,
    value: count,
    color: STATUS_COLORS[status] ?? '#546E7A',
  }));

  const totalParticipants = session.participants.length;

  return (
    <div className="chart-container">
      <h3>🏁 Estado de finalización</h3>
      <div style={{ position: 'relative', width: '100%', height: 250 }}>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={95}
              paddingAngle={4}
              dataKey="value"
              stroke="none"
              animationBegin={200}
              animationDuration={1000}
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={TOOLTIP_STYLE.contentStyle}
              itemStyle={TOOLTIP_STYLE.itemStyle}
              labelStyle={TOOLTIP_STYLE.labelStyle}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Center label */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            pointerEvents: 'none',
          }}
        >
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
            {totalParticipants}
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 500, marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            pilotos
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 10 }}>
        {data.map(d => (
          <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem' }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: d.color, boxShadow: `0 0 6px ${d.color}66` }} />
            <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{d.name}: {d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
