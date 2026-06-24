import React from 'react';
import type { BoxPlotData } from '../../core/analyzers/history-analyzer';
import { humanizeTrackName } from '../../core/utils/car-name-humanizer';
import { formatLapTime } from '../../core/utils/time-formatter';

interface Props {
  data: BoxPlotData[];
}

const BOX_HEIGHT = 28;
const ROW_HEIGHT = 44;
const LEFT_MARGIN = 130;
const RIGHT_MARGIN = 20;

/**
 * Custom SVG box-and-whisker plot per track.
 * Shows median, Q1, Q3, whiskers, and outliers.
 */
export const LapTimeBoxPlot: React.FC<Props> = ({ data }) => {
  if (data.length === 0) return null;

  const sorted = [...data].sort((a, b) => a.median - b.median);
  const globalMin = Math.min(...sorted.map(d => d.min));
  const globalMax = Math.max(...sorted.map(d => d.max));
  const range = globalMax - globalMin || 1;

  const svgHeight = sorted.length * ROW_HEIGHT + 40;
  const chartWidth = 500;

  const scale = (val: number): number => {
    return LEFT_MARGIN + ((val - globalMin) / range) * (chartWidth - LEFT_MARGIN - RIGHT_MARGIN);
  };

  return (
    <div className="chart-container">
      <h3>📦 Distribución de tiempos por pista</h3>
      <div style={{ overflowX: 'auto', marginTop: 'var(--space-sm)' }}>
        <svg width={chartWidth} height={svgHeight} style={{ minWidth: chartWidth }}>
          {sorted.map((d, i) => {
            const y = i * ROW_HEIGHT + 30;
            const yCenter = y + BOX_HEIGHT / 2;
            const parts = d.trackKey.split('/');
            const trackName = humanizeTrackName(parts[0]!, parts[1]);

            return (
              <g key={d.trackKey}>
                {/* Track name */}
                <text x={LEFT_MARGIN - 8} y={yCenter + 1} textAnchor="end" dominantBaseline="middle"
                  fill="var(--text-secondary)" fontSize={10} fontFamily="var(--font-sans)">
                  {trackName.slice(0, 18)}
                </text>

                {/* Whisker line (min to max) */}
                <line x1={scale(d.min)} x2={scale(d.max)} y1={yCenter} y2={yCenter}
                  stroke="var(--text-muted)" strokeWidth={1} />

                {/* Min whisker cap */}
                <line x1={scale(d.min)} x2={scale(d.min)} y1={y + 6} y2={y + BOX_HEIGHT - 6}
                  stroke="var(--text-muted)" strokeWidth={1.5} />

                {/* Max whisker cap */}
                <line x1={scale(d.max)} x2={scale(d.max)} y1={y + 6} y2={y + BOX_HEIGHT - 6}
                  stroke="var(--text-muted)" strokeWidth={1.5} />

                {/* Box (Q1 to Q3) */}
                <rect x={scale(d.q1)} y={y + 2} width={scale(d.q3) - scale(d.q1)} height={BOX_HEIGHT - 4}
                  rx={4} fill="var(--text-accent)" fillOpacity={0.25} stroke="var(--text-accent)" strokeWidth={1.5} />

                {/* Median line */}
                <line x1={scale(d.median)} x2={scale(d.median)} y1={y + 2} y2={y + BOX_HEIGHT - 2}
                  stroke="var(--brand-primary)" strokeWidth={2.5} strokeLinecap="round" />

                {/* Outliers */}
                {d.outliers.slice(0, 5).map((o, oi) => (
                  <circle key={oi} cx={scale(o)} cy={yCenter} r={3}
                    fill="var(--color-slower)" fillOpacity={0.6}>
                    <title>{formatLapTime(o)}</title>
                  </circle>
                ))}

                {/* Median time label */}
                <text x={scale(d.median)} y={y - 3} textAnchor="middle"
                  fill="var(--text-muted)" fontSize={8} fontFamily="var(--font-mono)">
                  {formatLapTime(d.median)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
