import React, { useMemo } from 'react';

interface Props {
  /** Map of 'YYYY-MM-DD' → session count */
  calendarData: Map<string, number>;
  /** Optional: callback when a day is clicked */
  onDayClick?: (dateStr: string) => void;
}

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const CELL_SIZE = 14;
const CELL_GAP = 3;

/**
 * GitHub-style calendar heatmap. Pure SVG, no external dependencies.
 * One cell per day, color intensity = session count.
 */
export const CalendarHeatmap: React.FC<Props> = ({ calendarData, onDayClick }) => {
  const { cells, weeks, monthLabels, maxCount } = useMemo(() => {
    if (calendarData.size === 0) return { cells: [], weeks: 0, monthLabels: [], maxCount: 0 };

    // Find date range
    const allDates = Array.from(calendarData.keys()).sort();
    const startDate = new Date(allDates[0]!);
    const endDate = new Date(allDates[allDates.length - 1]!);

    // Extend to full weeks (start on Monday)
    const start = new Date(startDate);
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7)); // go to Monday
    const end = new Date(endDate);
    end.setDate(end.getDate() + (7 - end.getDay()) % 7); // go to Sunday

    const maxVal = Math.max(...Array.from(calendarData.values()), 1);
    const cellData: Array<{ x: number; y: number; date: string; count: number; dayOfWeek: number }> = [];
    const labels: Array<{ x: number; label: string }> = [];
    let weekIdx = 0;
    let lastMonth = -1;
    const cursor = new Date(start);

    while (cursor <= end) {
      const dayOfWeek = (cursor.getDay() + 6) % 7; // Mon=0, Sun=6
      const dateStr = cursor.toISOString().slice(0, 10);
      const count = calendarData.get(dateStr) ?? 0;

      if (dayOfWeek === 0 && cursor > start) weekIdx++;

      const month = cursor.getMonth();
      if (month !== lastMonth) {
        labels.push({ x: weekIdx * (CELL_SIZE + CELL_GAP), label: MONTHS[month]! });
        lastMonth = month;
      }

      cellData.push({
        x: weekIdx * (CELL_SIZE + CELL_GAP),
        y: dayOfWeek * (CELL_SIZE + CELL_GAP),
        date: dateStr,
        count,
        dayOfWeek,
      });

      cursor.setDate(cursor.getDate() + 1);
    }

    return { cells: cellData, weeks: weekIdx + 1, monthLabels: labels, maxCount: maxVal };
  }, [calendarData]);

  if (cells.length === 0) return null;

  const getColor = (count: number): string => {
    if (count === 0) return 'var(--bg-secondary)';
    const intensity = Math.min(count / maxCount, 1);
    if (intensity > 0.75) return '#7C4DFF';
    if (intensity > 0.5) return '#448AFF';
    if (intensity > 0.25) return '#82B1FF';
    return '#C5CAE9';
  };

  const svgWidth = weeks * (CELL_SIZE + CELL_GAP) + 30;
  const svgHeight = 7 * (CELL_SIZE + CELL_GAP) + 30;

  return (
    <div className="chart-container">
      <h3>📅 Calendario de actividad</h3>
      <div style={{ overflowX: 'auto', marginTop: 'var(--space-sm)' }}>
        <svg width={svgWidth} height={svgHeight} style={{ minWidth: svgWidth }}>
          {/* Month labels */}
          {monthLabels.map((m, i) => (
            <text key={i} x={m.x + 30} y={12} fill="var(--text-muted)" fontSize={10} fontFamily="var(--font-sans)">
              {m.label}
            </text>
          ))}
          {/* Day labels */}
          {['L', '', 'M', '', 'V', '', 'D'].map((d, i) => (
            d && <text key={i} x={0} y={22 + i * (CELL_SIZE + CELL_GAP) + CELL_SIZE / 2} fill="var(--text-muted)" fontSize={9} fontFamily="var(--font-sans)" dominantBaseline="middle">{d}</text>
          ))}
          {/* Cells */}
          {cells.map((cell, i) => (
            <rect
              key={i}
              x={cell.x + 30}
              y={cell.y + 20}
              width={CELL_SIZE}
              height={CELL_SIZE}
              rx={3}
              fill={getColor(cell.count)}
              style={{ cursor: cell.count > 0 ? 'pointer' : 'default', transition: 'opacity 0.2s' }}
              onClick={() => cell.count > 0 && onDayClick?.(cell.date)}
            >
              <title>{`${cell.date}: ${cell.count} sesión(es)`}</title>
            </rect>
          ))}
        </svg>
      </div>
      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end', marginTop: 'var(--space-xs)', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
        <span>Menos</span>
        {[0, 0.25, 0.5, 0.75, 1].map((v, i) => (
          <div key={i} style={{ width: 12, height: 12, borderRadius: 2, background: getColor(v * maxCount) }} />
        ))}
        <span>Más</span>
      </div>
    </div>
  );
};
