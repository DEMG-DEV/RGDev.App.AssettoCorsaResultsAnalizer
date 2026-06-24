import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Session } from '../../core/models/types';
import { computeParticipantStats } from '../../core/analyzers/session-analyzer';
import { formatSectorTime } from '../../core/utils/time-formatter';
import { es } from '../../i18n/es';

interface Props {
  session: Session;
}

export const SectorComparisonChart: React.FC<Props> = ({ session }) => {
  const driversToShow = session.participants.slice(0, 15);

  const data = driversToShow.map(p => {
    const stats = computeParticipantStats(p);
    return {
      name: (p.drivers[0]?.name ?? `P${p.position}`).slice(0, 15),
      S1: stats.bestSectors[0] ? stats.bestSectors[0] / 1000 : 0,
      S2: stats.bestSectors[1] ? stats.bestSectors[1] / 1000 : 0,
      S3: stats.bestSectors[2] ? stats.bestSectors[2] / 1000 : 0,
    };
  });

  return (
    <div className="chart-container">
      <h3>⏱️ {es.session.sectors}</h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
          <XAxis
            dataKey="name"
            stroke="var(--text-muted)"
            fontSize={10}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis
            stroke="var(--text-muted)"
            fontSize={12}
            tickFormatter={(v: number) => formatSectorTime(v * 1000)}
          />
          <Tooltip
            contentStyle={{
              background: 'var(--bg-glass)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
            }}
            formatter={(value: number, name: string) => [formatSectorTime(value * 1000) + 's', name]}
          />
          <Legend />
          <Bar dataKey="S1" name="Sector 1" fill="var(--color-s1)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="S2" name="Sector 2" fill="var(--color-s2)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="S3" name="Sector 3" fill="var(--color-s3)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
