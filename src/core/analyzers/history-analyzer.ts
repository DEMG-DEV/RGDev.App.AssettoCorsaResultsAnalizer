/**
 * History Analyzer — aggregates stats across multiple parsed sessions.
 */

import type { ParseResult } from '../models/types';

/** Box plot data for a single track */
export interface BoxPlotData {
  trackKey: string;
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  outliers: number[];
  count: number;
}

/** Win/podium/DNF rates */
export interface PodiumRates {
  totalRaces: number;
  wins: number;
  p2: number;
  p3: number;
  dnfs: number;
  winRate: number;
  p2Rate: number;
  p3Rate: number;
  dnfRate: number;
}

/** Championship standing of a driver */
export interface ChampionshipStanding {
  driverName: string;
  points: number;
  racesCount: number;
  winsCount: number;
  podiumsCount: number;
  bestFinish: number;
  avgPosition: number;
  cars: string[]; // unique list of car IDs
}

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
  /** Win/podium/DNF rates (race sessions only) */
  podiumRates: PodiumRates;
  /** AI level → count (histogram data from CM metadata) */
  aiLevelHistogram: Map<number, number>;
  /** Box plot data per track */
  boxPlotData: BoxPlotData[];
  /** Consolidated championship leaderboard standings */
  championshipStandings: ChampionshipStanding[];
}

/** Compute quartiles for an array of numbers (must be pre-sorted) */
function quantile(sorted: number[], q: number): number {
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sorted[base + 1] !== undefined) {
    return sorted[base]! + rest * (sorted[base + 1]! - sorted[base]!);
  }
  return sorted[base]!;
}

const F1_POINTS = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];

/**
 * Compute history analytics across multiple parse results.
 */
export function computeHistoryStats(results: ParseResult[]): HistoryStats {
  const trackFrequency = new Map<string, number>();
  const carUsage = new Map<string, number>();
  const sessionTypeBreakdown = new Map<string, number>();
  const calendarData = new Map<string, number>();
  const performanceTrend: Array<{ date: Date; bestLapMs: number; trackVenue: string }> = [];
  const aiLevelHistogram = new Map<number, number>();
  const trackLapTimes = new Map<string, number[]>(); // for box plots
  let totalLaps = 0;
  let totalSessions = 0;

  // Championship accumulation map by driver name
  const standingsMap = new Map<string, {
    points: number;
    racesCount: number;
    winsCount: number;
    podiumsCount: number;
    positions: number[];
    cars: Set<string>;
  }>();

  // Podium tracking
  let totalRaces = 0;
  let wins = 0;
  let p2Count = 0;
  let p3Count = 0;
  let dnfs = 0;

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

      // AI levels from CM metadata
      if (session.cmMetadata?.carMetadata) {
        for (const [, carMeta] of session.cmMetadata.carMetadata) {
          if (carMeta.aiLevel > 0) {
            aiLevelHistogram.set(carMeta.aiLevel, (aiLevelHistogram.get(carMeta.aiLevel) ?? 0) + 1);
          }
        }
      }

      // Collect lap times per track for box plots
      const player = session.participants[0];
      if (player) {
        const validTimes = player.laps
          .filter(l => l.isValid && l.timeMs > 0)
          .map(l => l.timeMs);
        if (validTimes.length > 0) {
          const existing = trackLapTimes.get(trackKey) ?? [];
          existing.push(...validTimes);
          trackLapTimes.set(trackKey, existing);
        }
      }

      // Car usage + total laps + championship standing updates
      for (const p of session.participants) {
        totalLaps += p.totalLaps;

        // Only count player's car (position 1 or first participant typically)
        if (p.position === 1 || session.participants.indexOf(p) === 0) {
          carUsage.set(p.vehicle.modelId, (carUsage.get(p.vehicle.modelId) ?? 0) + 1);
        }

        // Championship standing logic for all drivers in the session
        const driverName = p.drivers[0]?.name ?? 'Driver';
        let driverData = standingsMap.get(driverName);
        if (!driverData) {
          driverData = {
            points: 0,
            racesCount: 0,
            winsCount: 0,
            podiumsCount: 0,
            positions: [],
            cars: new Set<string>(),
          };
          standingsMap.set(driverName, driverData);
        }

        driverData.cars.add(p.vehicle.modelId);
        
        if (session.type === 'race') {
          driverData.racesCount++;
          driverData.positions.push(p.position);
          
          // Points award
          const pts = F1_POINTS[p.position - 1] ?? 0;
          driverData.points += pts;
          
          if (p.position === 1) driverData.winsCount++;
          if (p.position <= 3) driverData.podiumsCount++;
        } else {
          // Non-race session entries (qualifying/practice) — still track participation
          driverData.positions.push(p.position);
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

      // Podium tracking (race sessions only, player = first participant)
      if (session.type === 'race' && playerParticipant) {
        totalRaces++;
        if (playerParticipant.position === 1) wins++;
        if (playerParticipant.position === 2) p2Count++;
        if (playerParticipant.position === 3) p3Count++;
        if (playerParticipant.finishStatus === 'dnf') dnfs++;
      }
    }
  }

  // Sort performance trend by date
  performanceTrend.sort((a, b) => a.date.getTime() - b.date.getTime());

  // Compute podium rates
  const podiumRates: PodiumRates = {
    totalRaces,
    wins,
    p2: p2Count,
    p3: p3Count,
    dnfs,
    winRate: totalRaces > 0 ? wins / totalRaces : 0,
    p2Rate: totalRaces > 0 ? p2Count / totalRaces : 0,
    p3Rate: totalRaces > 0 ? p3Count / totalRaces : 0,
    dnfRate: totalRaces > 0 ? dnfs / totalRaces : 0,
  };

  // Compute box plots per track
  const boxPlotData: BoxPlotData[] = [];
  for (const [trackKey, times] of trackLapTimes) {
    if (times.length < 3) continue;
    const sorted = [...times].sort((a, b) => a - b);
    const q1 = quantile(sorted, 0.25);
    const med = quantile(sorted, 0.5);
    const q3 = quantile(sorted, 0.75);
    const iqr = q3 - q1;
    const lowerFence = q1 - 1.5 * iqr;
    const upperFence = q3 + 1.5 * iqr;

    const validMin = sorted.find(v => v >= lowerFence) ?? sorted[0]!;
    const validMax = [...sorted].reverse().find(v => v <= upperFence) ?? sorted[sorted.length - 1]!;
    const outliers = sorted.filter(v => v < lowerFence || v > upperFence);

    boxPlotData.push({
      trackKey,
      min: validMin,
      q1,
      median: med,
      q3,
      max: validMax,
      outliers,
      count: times.length,
    });
  }

  // Convert standingsMap to ChampionshipStanding[]
  const championshipStandings: ChampionshipStanding[] = Array.from(standingsMap.entries()).map(([driverName, d]) => {
    const totalPos = d.positions.reduce((sum, val) => sum + val, 0);
    const avgPosition = d.positions.length > 0 ? totalPos / d.positions.length : 0;
    const bestFinish = d.positions.length > 0 ? Math.min(...d.positions) : 99;

    return {
      driverName,
      points: d.points,
      racesCount: d.racesCount,
      winsCount: d.winsCount,
      podiumsCount: d.podiumsCount,
      bestFinish,
      avgPosition,
      cars: Array.from(d.cars),
    };
  });

  // Sort standings: Points descending. Ties broken by wins, then podiums, then best finish
  championshipStandings.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.winsCount !== a.winsCount) return b.winsCount - a.winsCount;
    if (b.podiumsCount !== a.podiumsCount) return b.podiumsCount - a.podiumsCount;
    return a.bestFinish - b.bestFinish;
  });

  return {
    totalSessions,
    totalLaps,
    trackFrequency,
    carUsage,
    sessionTypeBreakdown,
    calendarData,
    performanceTrend,
    podiumRates,
    aiLevelHistogram,
    boxPlotData,
    championshipStandings,
  };
}
