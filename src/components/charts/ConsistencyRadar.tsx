import React, { useMemo, useState } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
         ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { Session } from '../../core/models/types';
import { computeParticipantStats } from '../../core/analyzers/session-analyzer';

interface Props {
  session: Session;
}

const DRIVER_COLORS = [
  'var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)',
  'var(--chart-5)', 'var(--chart-6)', 'var(--chart-7)', 'var(--chart-8)',
];

/**
 * Radar/Spider chart comparing driver strengths:
 * Best Lap, Average Lap, Consistency, S1, S2, S3
 * Values normalized to 0–100 scale (100 = best).
 */
export const ConsistencyRadar: React.FC<Props> = ({ session }) => {
  const maxSelect = 4;
  const [selected, setSelected] = useState<number[]>(() =>
    session.participants.slice(0, Math.min(maxSelect, session.participants.length)).map((_, i) => i)
  );

  const { radarData, driverNames } = useMemo(() => {
    const allStats = session.participants.map(p => computeParticipantStats(p));
    const names = session.participants.map(p => p.drivers[0]?.name ?? `P${p.position}`);

    // Find global min/max for normalization
    const bestLaps = allStats.map(s => s.bestLapMs).filter(v => v > 0);
    const avgLaps = allStats.map(s => s.avgLapMs).filter(v => v > 0);
    const consistencies = allStats.map(s => s.consistency).filter(v => v > 0);
    const bestS1 = allStats.map(s => s.bestSectors[0] ?? 0).filter(v => v > 0);
    const bestS2 = allStats.map(s => s.bestSectors[1] ?? 0).filter(v => v > 0);
    const bestS3 = allStats.map(s => s.bestSectors[2] ?? 0).filter(v => v > 0);

    // Normalize: lower time = higher score (invert)
    const normalize = (val: number, arr: number[]): number => {
      if (arr.length < 2) return 50;
      const min = Math.min(...arr);
      const max = Math.max(...arr);
      if (max === min) return 50;
      return Math.round(100 - ((val - min) / (max - min)) * 100);
    };

    // For consistency: lower std dev = higher score
    const axes = ['Mejor Vuelta', 'Promedio', 'Consistencia', 'Sector 1', 'Sector 2', 'Sector 3'];
    const data = axes.map((axis, ai) => {
      const entry: Record<string, string | number> = { axis };
      for (const idx of selected) {
        const s = allStats[idx];
        if (!s) continue;
        let val = 50;
        switch (ai) {
          case 0: val = normalize(s.bestLapMs, bestLaps); break;
          case 1: val = normalize(s.avgLapMs, avgLaps); break;
          case 2: val = normalize(s.consistency, consistencies); break;
          case 3: val = normalize(s.bestSectors[0] ?? 0, bestS1); break;
          case 4: val = normalize(s.bestSectors[1] ?? 0, bestS2); break;
          case 5: val = normalize(s.bestSectors[2] ?? 0, bestS3); break;
        }
        entry[`driver_${idx}`] = Math.max(5, val); // min 5 to avoid invisible polygon
      }
      return entry;
    });

    return { radarData: data, driverNames: names };
  }, [session, selected]);

  const toggleDriver = (idx: number) => {
    setSelected(prev =>
      prev.includes(idx)
        ? prev.filter(i => i !== idx)
        : prev.length < maxSelect ? [...prev, idx] : prev
    );
  };

  return (
    <div className="chart-container">
      <h3>🎯 Radar de consistencia</h3>

      {/* Driver selector */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 'var(--space-sm)' }}>
        {session.participants.slice(0, 8).map((p, i) => (
          <button
            key={i}
            onClick={() => toggleDriver(i)}
            style={{
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              border: selected.includes(i) ? `2px solid ${DRIVER_COLORS[i % DRIVER_COLORS.length]}` : '1px solid var(--border-subtle)',
              background: selected.includes(i) ? `${DRIVER_COLORS[i % DRIVER_COLORS.length]}22` : 'transparent',
              color: selected.includes(i) ? DRIVER_COLORS[i % DRIVER_COLORS.length] : 'var(--text-muted)',
              fontSize: '0.72rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {p.drivers[0]?.name ?? `P${p.position}`}
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid stroke="var(--border-subtle)" />
          <PolarAngleAxis dataKey="axis" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 9 }} />
          {selected.map((driverIdx) => (
            <Radar
              key={driverIdx}
              name={driverNames[driverIdx] ?? ''}
              dataKey={`driver_${driverIdx}`}
              stroke={DRIVER_COLORS[driverIdx % DRIVER_COLORS.length]}
              fill={DRIVER_COLORS[driverIdx % DRIVER_COLORS.length]}
              fillOpacity={0.15}
              strokeWidth={2}
            />
          ))}
          <Tooltip
            contentStyle={{
              background: 'var(--bg-glass)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              backdropFilter: 'blur(12px)',
            }}
          />
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};
