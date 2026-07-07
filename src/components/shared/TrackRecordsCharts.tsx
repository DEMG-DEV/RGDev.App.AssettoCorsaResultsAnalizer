import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatSectorTime, formatLapTime } from '../../core/utils/time-formatter';
import { humanizeCarId } from '../../core/utils/car-name-humanizer';

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

interface TrackRecordEntry {
  driverName: string;
  carId: string;
  bestLapMs: number;
  consistencyMs: number;
  bestS1: number;
  bestS2: number;
  bestS3: number;
}

interface Props {
  records: TrackRecordEntry[];
}

export const TrackRecordsCharts: React.FC<Props> = ({ records }) => {
  // Only show top 10 for readability in charts
  const topRecords = records.slice(0, 10);

  const sectorData = topRecords.map(r => ({
    name: `${r.driverName} (${humanizeCarId(r.carId).slice(0, 12)})`,
    S1: r.bestS1 !== Infinity ? r.bestS1 / 1000 : 0,
    S2: r.bestS2 !== Infinity ? r.bestS2 / 1000 : 0,
    S3: r.bestS3 !== Infinity ? r.bestS3 / 1000 : 0,
  }));

  const paceData = topRecords.map(r => ({
    name: `${r.driverName} (${humanizeCarId(r.carId).slice(0, 12)})`,
    bestLap: r.bestLapMs / 1000,
    consistency: r.consistencyMs / 1000,
  }));

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 'var(--space-lg)', marginBottom: 'var(--space-lg)' }}>
      {/* Sector Comparison Chart */}
      <div className="chart-container" style={{ padding: 'var(--space-lg)' }}>
        <h3 style={{ marginTop: 0, marginBottom: 'var(--space-md)', fontSize: '1rem', color: 'var(--text-primary)' }}>
          ⏱️ Comparación de Mejores Sectores
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={sectorData} margin={{ top: 5, right: 30, left: 20, bottom: 60 }} barSize={16}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" strokeOpacity={0.08} />
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
              fontSize={11}
              tickFormatter={(v: number) => formatSectorTime(v * 1000)}
            />
            <Tooltip
              {...TOOLTIP_STYLE}
              formatter={(value: number, name: string) => [formatSectorTime(value * 1000) + 's', name]}
            />
            <Legend wrapperStyle={{ fontSize: '0.8rem', paddingTop: 10 }} />
            <Bar dataKey="S1" name="Sector 1" fill="var(--color-s1)" radius={[4, 4, 0, 0]} animationDuration={800} animationBegin={0} />
            <Bar dataKey="S2" name="Sector 2" fill="var(--color-s2)" radius={[4, 4, 0, 0]} animationDuration={800} animationBegin={200} />
            <Bar dataKey="S3" name="Sector 3" fill="var(--color-s3)" radius={[4, 4, 0, 0]} animationDuration={800} animationBegin={400} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pace vs Consistency Chart */}
      <div className="chart-container" style={{ padding: 'var(--space-lg)' }}>
        <h3 style={{ marginTop: 0, marginBottom: 'var(--space-md)', fontSize: '1rem', color: 'var(--text-primary)' }}>
          🎯 Ritmo vs Consistencia
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={paceData} margin={{ top: 5, right: 30, left: 20, bottom: 60 }} barSize={24}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" strokeOpacity={0.08} />
            <XAxis
              dataKey="name"
              stroke="var(--text-muted)"
              fontSize={10}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              yAxisId="left"
              stroke="var(--text-muted)"
              fontSize={11}
              domain={['dataMin - 1', 'dataMax + 1']}
              tickFormatter={(v: number) => formatLapTime(v * 1000)}
            />
            <Tooltip
              {...TOOLTIP_STYLE}
              formatter={(value: number, name: string) => [
                name === 'Consistencia (std dev)' ? `±${value.toFixed(3)}s` : formatLapTime(value * 1000),
                name
              ]}
            />
            <Legend wrapperStyle={{ fontSize: '0.8rem', paddingTop: 10 }} />
            <Bar yAxisId="left" dataKey="bestLap" name="Mejor Vuelta" fill="var(--color-pb)" radius={[6, 6, 0, 0]} animationDuration={1000} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
