/**
 * History Analyzer — aggregates stats across multiple parsed sessions.
 */

import type { ParseResult } from '../models/types';

export interface HistoryStats {
  totalSessions: number;
  totalLaps: number;
  /** Track → session count */
  trackFrequency: Map<string, number>;
  /** Car model → session count */
  carUsage: Map<string, number>;
  /** SessionType → count */
  sessionTypeBreakdown: Map<string, number>;
  /** Date string (YYYY-MM-DD) → session count */
  calendarData: Map<string, number>;
  /** Array of { date, bestLapMs, trackVenue } for performance trend */
  performanceTrend: Array<{ date: Date; bestLapMs: number; trackVenue: string }>;
}

/**
 * Compute history analytics across multiple parse results.
 */
export function computeHistoryStats(results: ParseResult[]): HistoryStats {
  const trackFrequency = new Map<string, number>();
  const carUsage = new Map<string, number>();
  const sessionTypeBreakdown = new Map<string, number>();
  const calendarData = new Map<string, number>();
  const performanceTrend: Array<{ date: Date; bestLapMs: number; trackVenue: string }> = [];
  let totalLaps = 0;
  let totalSessions = 0;

  for (const result of results) {
    const sessionDate = result.sessionDate ?? result.parsedAt;

    for (const session of result.sessions) {
      totalSessions++;

      // Track frequency
      const trackKey = session.track.course
        ? `${session.track.venue}/${session.track.course}`
        : session.track.venue;
      trackFrequency.set(trackKey, (trackFrequency.get(trackKey) ?? 0) + 1);

      // Session type
      sessionTypeBreakdown.set(session.type, (sessionTypeBreakdown.get(session.type) ?? 0) + 1);

      // Calendar
      const dateKey = sessionDate.toISOString().slice(0, 10);
      calendarData.set(dateKey, (calendarData.get(dateKey) ?? 0) + 1);

      // Car usage + total laps
      for (const p of session.participants) {
        totalLaps += p.totalLaps;

        // Only count player's car (position 1 or first participant typically)
        if (p.position === 1 || session.participants.indexOf(p) === 0) {
          carUsage.set(p.vehicle.modelId, (carUsage.get(p.vehicle.modelId) ?? 0) + 1);
        }
      }

      // Performance trend (player's best lap)
      const playerParticipant = session.participants[0];
      if (playerParticipant?.bestLap && playerParticipant.bestLap.timeMs > 0) {
        performanceTrend.push({
          date: sessionDate,
          bestLapMs: playerParticipant.bestLap.timeMs,
          trackVenue: session.track.venue,
        });
      }
    }
  }

  // Sort performance trend by date
  performanceTrend.sort((a, b) => a.date.getTime() - b.date.getTime());

  return {
    totalSessions,
    totalLaps,
    trackFrequency,
    carUsage,
    sessionTypeBreakdown,
    calendarData,
    performanceTrend,
  };
}
