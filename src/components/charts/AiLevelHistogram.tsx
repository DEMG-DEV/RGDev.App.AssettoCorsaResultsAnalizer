import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface Props {
  /** AI level → count */
  histogram: Map<number, number>;
}

/**
 * Histogram showing AI opponent level distribution.
 * Color gradient from green (easy) to red (hard).
 */
export const AiLevelHistogram: React.FC<Props> = ({ histogram }) => {
  if (histogram.size === 0) return null;

  // Build bins from min to max level
  const levels = Array.from(histogram.keys()).sort((a, b) => a - b);
  const minLevel = Math.min(...levels);
  const maxLevel = Math.max(...levels);

  const data: Array<{ level: number; count: number }> = [];
  for (let l = minLevel; l <= maxLevel; l++) {
    data.push({ level: l, count: histogram.get(l) ?? 0 });
  }

  // Compute mean
  let totalCount = 0;
  let totalWeighted = 0;
  for (const d of data) {
    totalCount += d.count;
    totalWeighted += d.level * d.count;
  }
  const mean = totalCount > 0 ? totalWeighted / totalCount : 0;

  const barColor = (level: number): string => {
    if (level >= 98) return '#D50000';
    if (level >= 95) return '#FF5722';
    if (level >= 90) return '#FF9800';
    if (level >= 85) return '#FFC107';
    if (level >= 80) return '#CDDC39';
    return '#4CAF50';
  };

  return (
    <div className="chart-container">
      <h3>🤖 Distribución de nivel IA</h3>
      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 'var(--space-sm)' }}>
        Promedio: <span className="mono" style={{ fontWeight: 700, color: barColor(Math.round(mean)) }}>{mean.toFixed(1)}</span>
        {' · '}{totalCount} oponentes analizados
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: 5, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
          <XAxis dataKey="level" stroke="var(--text-muted)" fontSize={10} />
          <YAxis stroke="var(--text-muted)" fontSize={10} allowDecimals={false} />
          <Tooltip
            contentStyle={{
              background: 'var(--bg-glass)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
            }}
            formatter={(value: number) => [value, 'Oponentes']}
            labelFormatter={(l) => `Nivel IA: ${l}`}
          />
          <Bar dataKey="count" name="Oponentes" radius={[3, 3, 0, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={barColor(entry.level)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Mean marker info */}
      <div style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>
        Media: {mean.toFixed(1)} · Rango: {minLevel}–{maxLevel}
      </div>
    </div>
  );
};
