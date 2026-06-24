import React from 'react';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';
import { humanizeTrackName } from '../../core/utils/car-name-humanizer';

interface Props {
  trackFrequency: Map<string, number>;
}

const COLORS = ['#4FC3F7', '#81C784', '#FFB74D', '#E57373', '#BA68C8', '#4DD0E1', '#AED581', '#FFD54F', '#FF8A65', '#CE93D8'];

interface TreemapNodeProps {
  x: number;
  y: number;
  width: number;
  height: number;
  index: number;
  name: string;
  value: number;
}

const CustomContent: React.FC<TreemapNodeProps> = ({ x, y, width, height, index, name, value }) => {
  const showText = width > 50 && height > 30;
  const showCount = width > 60 && height > 45;
  return (
    <g>
      <rect
        x={x} y={y} width={width} height={height}
        rx={6}
        fill={COLORS[index % COLORS.length]}
        stroke="var(--bg-primary)"
        strokeWidth={2}
        style={{ transition: 'opacity 0.2s', cursor: 'pointer' }}
      />
      {showText && (
        <text
          x={x + width / 2} y={y + height / 2 - (showCount ? 6 : 0)}
          textAnchor="middle" dominantBaseline="middle"
          fill="#fff" fontSize={Math.min(12, width / 8)} fontWeight={600}
          fontFamily="var(--font-sans)"
        >
          {name.length > width / 7 ? name.slice(0, Math.floor(width / 7)) + '…' : name}
        </text>
      )}
      {showCount && (
        <text
          x={x + width / 2} y={y + height / 2 + 12}
          textAnchor="middle" dominantBaseline="middle"
          fill="rgba(255,255,255,0.7)" fontSize={10}
          fontFamily="var(--font-mono)"
        >
          {value} sesiones
        </text>
      )}
    </g>
  );
};

/**
 * Treemap showing track usage frequency.
 * Bigger = more sessions on that track.
 */
export const TrackTreemap: React.FC<Props> = ({ trackFrequency }) => {
  const data = Array.from(trackFrequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([track, count]) => {
      const parts = track.split('/');
      return {
        name: humanizeTrackName(parts[0]!, parts[1]),
        value: count,
      };
    });

  if (data.length === 0) return null;

  return (
    <div className="chart-container">
      <h3>🗺️ Pistas más frecuentes</h3>
      <ResponsiveContainer width="100%" height={300}>
        <Treemap
          data={data}
          dataKey="value"
          nameKey="name"
          content={<CustomContent x={0} y={0} width={0} height={0} index={0} name="" value={0} />}
        >
          <Tooltip
            contentStyle={{
              background: 'var(--bg-glass)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              backdropFilter: 'blur(12px)',
            }}
            formatter={(value: number) => [`${value} sesiones`, 'Frecuencia']}
          />
        </Treemap>
      </ResponsiveContainer>
    </div>
  );
};
