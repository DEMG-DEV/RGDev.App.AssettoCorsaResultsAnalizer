import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { Session } from '../../core/models/types';

const STATUS_COLORS: Record<string, string> = {
  finished: '#4CAF50',
  dnf: '#FF5722',
  dq: '#F44336',
  none: '#9E9E9E',
};

const STATUS_LABELS: Record<string, string> = {
  finished: 'Terminaron',
  dnf: 'No terminaron',
  dq: 'Descalificados',
  none: 'Sin estado',
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
    color: STATUS_COLORS[status] ?? '#9E9E9E',
  }));

  return (
    <div className="chart-container">
      <h3>🏁 Estado de finalización</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={3}
            dataKey="value"
            animationBegin={0}
            animationDuration={800}
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} stroke="var(--bg-primary)" strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: 'var(--bg-glass)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 8 }}>
        {data.map(d => (
          <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: d.color }} />
            <span style={{ color: 'var(--text-secondary)' }}>{d.name}: {d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
