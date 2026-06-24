/**
 * Time formatting utilities for lap times, sector times, and gaps.
 * All internal times are in milliseconds.
 */

/**
 * Format milliseconds to lap time: mm:ss.SSSS
 * @param ms - Time in milliseconds
 * @param forceHours - Show hours even if 0
 * @returns Formatted time string
 */
export function formatLapTime(ms: number, forceHours = false): string {
  if (ms < 0) return '--:--.----';

  const isNegative = ms < 0;
  const absMs = Math.abs(ms);

  const totalSeconds = absMs / 1000;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds - hours * 3600) / 60);
  const seconds = totalSeconds - hours * 3600 - minutes * 60;

  const secondsFormatted = seconds.toFixed(3).padStart(6, '0');
  let result = `${minutes.toString().padStart(2, '0')}:${secondsFormatted}`;

  if (hours > 0 || forceHours) {
    result = `${hours.toString().padStart(2, '0')}:${result}`;
  }

  return isNegative ? `-${result}` : result;
}

/**
 * Format milliseconds to sector time: ss.SSS
 */
export function formatSectorTime(ms: number): string {
  if (ms < 0) return '--.---';
  return (ms / 1000).toFixed(3);
}

/**
 * Format milliseconds as gap: +X.XXXs or -X.XXXs
 */
export function formatGap(ms: number): string {
  if (ms === 0) return 'Líder';
  const sign = ms > 0 ? '+' : '-';
  const seconds = Math.abs(ms) / 1000;
  if (seconds >= 60) {
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(3);
    return `${sign}${mins}:${secs.padStart(6, '0')}`;
  }
  return `${sign}${seconds.toFixed(3)}s`;
}

/**
 * Parse a Content Manager session filename (YYMMDD-HHMMSS.json) into a Date.
 */
export function parseFilenameDate(filename: string): Date | undefined {
  // Pattern: 260619-214149.json
  const match = filename.match(/^(\d{2})(\d{2})(\d{2})-(\d{2})(\d{2})(\d{2})\.json$/);
  if (!match) return undefined;

  const [, yy, mm, dd, hh, mi, ss] = match;
  const year = 2000 + parseInt(yy!, 10);
  const month = parseInt(mm!, 10) - 1; // 0-indexed
  const day = parseInt(dd!, 10);
  const hour = parseInt(hh!, 10);
  const minute = parseInt(mi!, 10);
  const second = parseInt(ss!, 10);

  return new Date(year, month, day, hour, minute, second);
}

/**
 * Format a Date to a human-readable Spanish string
 */
export function formatSessionDate(date: Date): string {
  return date.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
