import React from 'react';

interface Props {
  lapTimes: number[];
  width?: number;
  height?: number;
}

export const LapTimeSparkline: React.FC<Props> = ({ lapTimes, width = 60, height = 20 }) => {
  const validTimes = lapTimes.filter(t => t > 0);
  if (validTimes.length < 2) return null;

  const min = Math.min(...validTimes);
  const max = Math.max(...validTimes);
  const range = max - min || 1;

  const points = validTimes.map((t, i) => {
    const x = (i / (validTimes.length - 1)) * width;
    const y = height - ((t - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg className="sparkline" width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <polyline
        points={points}
        fill="none"
        stroke="var(--text-accent)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
