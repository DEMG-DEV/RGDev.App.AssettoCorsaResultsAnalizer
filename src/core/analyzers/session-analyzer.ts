/**
 * Session Analyzer — computes derived stats from parsed session data.
 * Pure functions only, no side effects.
 */

import type { Session, Participant, Lap } from '../models/types';

/** Stats computed for a participant */
export interface ParticipantStats {
  bestLapMs: number;
  avgLapMs: number;
  consistency: number; // lower = more consistent (std dev in ms)
  validLapCount: number;
  totalCuts: number;
  /** Lap times for sparkline */
  lapTimes: number[];
  /** Sector averages [s1, s2, s3] */
  avgSectors: number[];
  /** Best sectors [s1, s2, s3] */
  bestSectors: number[];
}

/** Position data for position chart */
export interface PositionPerLap {
  lapNumber: number;
  positions: Map<number, number>; // participantIndex → position
}

/**
 * Compute stats for a single participant.
 */
export function computeParticipantStats(participant: Participant): ParticipantStats {
  const validLaps = participant.laps.filter(l => l.isValid && l.timeMs > 0);
  const lapTimes = participant.laps.map(l => l.timeMs);

  const bestLapMs = validLaps.length > 0
    ? Math.min(...validLaps.map(l => l.timeMs))
    : -1;

  const avgLapMs = validLaps.length > 0
    ? validLaps.reduce((s, l) => s + l.timeMs, 0) / validLaps.length
    : -1;

  // Standard deviation for consistency
  let consistency = 0;
  if (validLaps.length > 1) {
    const mean = avgLapMs;
    const variance = validLaps.reduce((s, l) => s + Math.pow(l.timeMs - mean, 2), 0) / validLaps.length;
    consistency = Math.sqrt(variance);
  }

  // Sector analysis
  const sectorCount = validLaps[0]?.sectors.length ?? 3;
  const avgSectors: number[] = [];
  const bestSectors: number[] = [];

  for (let si = 0; si < sectorCount; si++) {
    const sectorTimes = validLaps
      .map(l => l.sectors[si]?.timeMs)
      .filter((t): t is number => t !== undefined && t > 0);

    avgSectors.push(
      sectorTimes.length > 0
        ? sectorTimes.reduce((s, t) => s + t, 0) / sectorTimes.length
        : 0
    );
    bestSectors.push(
      sectorTimes.length > 0 ? Math.min(...sectorTimes) : 0
    );
  }

  const totalCuts = participant.laps.reduce((s, l) => s + l.cuts, 0);

  return {
    bestLapMs,
    avgLapMs,
    consistency,
    validLapCount: validLaps.length,
    totalCuts,
    lapTimes,
    avgSectors,
    bestSectors,
  };
}

/**
 * Compute session-wide best sectors (purple sectors).
 */
export function computeSessionBestSectors(session: Session): number[] {
  const sectorCount = session.participants[0]?.laps[0]?.sectors.length ?? 3;
  const bestSectors: number[] = Array(sectorCount).fill(Infinity) as number[];

  for (const participant of session.participants) {
    for (const lap of participant.laps) {
      if (!lap.isValid) continue;
      for (let si = 0; si < lap.sectors.length; si++) {
        const sTime = lap.sectors[si]?.timeMs ?? Infinity;
        if (sTime > 0 && sTime < (bestSectors[si] ?? Infinity)) {
          bestSectors[si] = sTime;
        }
      }
    }
  }

  return bestSectors;
}

/**
 * Compute positions per lap for the position chart.
 * Uses cumulative time to determine position at each lap.
 */
export function computePositionsPerLap(session: Session): PositionPerLap[] {
  const maxLaps = Math.max(...session.participants.map(p => p.laps.length), 0);
  const result: PositionPerLap[] = [];

  for (let lapNum = 1; lapNum <= maxLaps; lapNum++) {
    // Calculate cumulative time for each participant up to this lap
    const cumulatives: Array<{ index: number; time: number; laps: number }> = [];

    for (let pi = 0; pi < session.participants.length; pi++) {
      const p = session.participants[pi]!;
      const lapsUpTo = p.laps.slice(0, lapNum);
      const validLaps = lapsUpTo.filter(l => l.timeMs > 0);
      const cumTime = validLaps.reduce((s, l) => s + l.timeMs, 0);

      cumulatives.push({
        index: pi,
        time: cumTime || Infinity,
        laps: validLaps.length,
      });
    }

    // Sort: most laps first, then by cumulative time
    cumulatives.sort((a, b) => {
      if (a.laps !== b.laps) return b.laps - a.laps;
      return a.time - b.time;
    });

    const positions = new Map<number, number>();
    cumulatives.forEach((c, pos) => {
      positions.set(c.index, pos + 1);
    });

    result.push({ lapNumber: lapNum, positions });
  }

  return result;
}

/**
 * Get gap to leader at each lap for gap chart.
 */
export function computeGapsPerLap(session: Session): Array<{
  lapNumber: number;
  gaps: Map<number, number>; // participantIndex → gap in ms
}> {
  const maxLaps = Math.max(...session.participants.map(p => p.laps.length), 0);
  const result: Array<{ lapNumber: number; gaps: Map<number, number> }> = [];

  for (let lapNum = 1; lapNum <= maxLaps; lapNum++) {
    const cumulatives: Array<{ index: number; time: number }> = [];

    for (let pi = 0; pi < session.participants.length; pi++) {
      const p = session.participants[pi]!;
      const validLaps = p.laps.slice(0, lapNum).filter(l => l.timeMs > 0);
      const cumTime = validLaps.reduce((s, l) => s + l.timeMs, 0);
      cumulatives.push({ index: pi, time: cumTime || Infinity });
    }

    const minTime = Math.min(...cumulatives.map(c => c.time));
    const gaps = new Map<number, number>();
    for (const c of cumulatives) {
      gaps.set(c.index, c.time === Infinity ? 0 : c.time - minTime);
    }

    result.push({ lapNumber: lapNum, gaps });
  }

  return result;
}

/**
 * Get the overall best lap in a session.
 */
export function getSessionBestLap(session: Session): { participant: Participant; lap: Lap } | null {
  let best: { participant: Participant; lap: Lap } | null = null;

  for (const p of session.participants) {
    for (const lap of p.laps) {
      if (lap.isValid && lap.timeMs > 0) {
        if (!best || lap.timeMs < best.lap.timeMs) {
          best = { participant: p, lap };
        }
      }
    }
  }

  return best;
}
