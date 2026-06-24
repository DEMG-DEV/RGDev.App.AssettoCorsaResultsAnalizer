/**
 * AC Client / Offline JSON Parser
 * Handles: race_out.json and Content Manager session files (have "players" key)
 * Ported from simresults AssettoCorsa.php reader
 */

import type {
  ParseResult, Session, SessionType, Participant, Lap,
  SectorTime, Driver, Vehicle, Track, FinishStatus,
} from '../models/types';
import { parseCmMetadata } from './cm-metadata-parser';
import { parseFilenameDate } from '../utils/time-formatter';

/* eslint-disable @typescript-eslint/no-explicit-any */
type RawData = Record<string, any>;

/** Map AC session type integer to our enum */
function mapSessionType(typeNum: number): SessionType {
  switch (typeNum) {
    case 1: return 'practice';
    case 2: return 'qualify';
    case 3: return 'race';
    case 4: return 'hotlap';
    default: return 'practice';
  }
}

/** Generate a simple unique ID */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Parse an AC client/offline JSON object into a ParseResult.
 */
export function parseAcClientJson(
  data: RawData,
  fileName: string,
  fileSize: number,
): ParseResult {
  const warnings: string[] = [];
  const sessions: Session[] = [];

  const players: RawData[] = data.players ?? [];
  const rawSessions: RawData[] = data.sessions ?? [];
  const trackId: string = data.track ?? 'unknown';
  const extras: RawData[] = data.extras ?? [];

  // Parse Content Manager metadata
  const cmMetadata = parseCmMetadata(
    data.__raceIni as string | undefined,
    data.__quickDrive as string | undefined,
  );

  // Extract track config from __raceIni or track string
  let trackVenue = trackId;
  let trackCourse: string | undefined;

  if (cmMetadata) {
    // Try to get from __raceIni [RACE] section
    const raceIniStr = data.__raceIni as string | undefined;
    if (raceIniStr) {
      const trackMatch = raceIniStr.match(/TRACK=([^\r\n]+)/);
      const configMatch = raceIniStr.match(/CONFIG_TRACK=([^\r\n]+)/);
      if (trackMatch?.[1]) trackVenue = trackMatch[1];
      if (configMatch?.[1] && configMatch[1].length > 0) trackCourse = configMatch[1];
    }
  }

  // Detect track config from track ID containing '-'
  if (!trackCourse && trackId.includes('-')) {
    const parts = trackId.split('-');
    trackVenue = parts[0]!;
    trackCourse = parts.slice(1).join('-');
  }

  const track: Track = { venue: trackVenue, course: trackCourse };

  // Get tyre info from extras
  const tyreExtras = extras.find((e: RawData) => e.name === 'tyre');

  // Parse each session
  for (let si = 0; si < rawSessions.length; si++) {
    const rawSession = rawSessions[si]!;
    const sessionType = mapSessionType(rawSession.type ?? 1);
    const sessionName: string = rawSession.name ?? undefined;
    const duration: number = rawSession.duration ?? 0;
    const lapsCount: number = rawSession.lapsCount ?? 0;
    const rawLaps: RawData[] = rawSession.laps ?? [];
    const raceResult: number[] = rawSession.raceResult ?? [];
    const bestLaps: RawData[] = rawSession.bestLaps ?? [];
    const lapsTotalArr: number[] = rawSession.lapstotal ?? [];

    // Group laps by car index
    const lapsByCarIndex = new Map<number, RawData[]>();
    for (const rawLap of rawLaps) {
      const carIdx: number = rawLap.car ?? 0;
      if (!lapsByCarIndex.has(carIdx)) {
        lapsByCarIndex.set(carIdx, []);
      }
      lapsByCarIndex.get(carIdx)!.push(rawLap);
    }

    // Build participants from players
    const participants: Participant[] = [];

    for (let pi = 0; pi < players.length; pi++) {
      const player = players[pi]!;
      const carLaps = lapsByCarIndex.get(pi) ?? [];

      // Get CM metadata for this car if available
      const carMeta = cmMetadata?.carMetadata.get(pi);

      const driver: Driver = {
        name: carMeta?.driverName || player.name || `Driver ${pi + 1}`,
        nationality: carMeta?.nationality,
        nationCode: carMeta?.nationCode,
      };

      const vehicle: Vehicle = {
        modelId: player.car ?? 'unknown',
        skin: player.skin,
        ballastKg: carMeta?.ballast ?? 0,
        restrictor: carMeta?.restrictor ?? 0,
      };

      // Parse laps
      const parsedLaps: Lap[] = [];
      for (let li = 0; li < carLaps.length; li++) {
        const rawLap = carLaps[li]!;
        const sectors: number[] = rawLap.sectors ?? [];
        const lapTime: number = rawLap.time ?? -1;
        const cuts: number = rawLap.cuts ?? 0;
        const tyre: string | undefined = rawLap.tyre;

        const sectorTimes: SectorTime[] = sectors.map((sMs, idx) => ({
          sectorNumber: idx + 1,
          timeMs: sMs,
        }));

        const isValid = lapTime > 0 && cuts === 0;

        parsedLaps.push({
          lapNumber: li + 1,
          timeMs: lapTime,
          sectors: sectorTimes,
          cuts,
          tyre: tyre ?? (tyreExtras?.tyreFL as string | undefined),
          isValid,
        });
      }

      // Find best lap from bestLaps array
      const bestLapEntry = bestLaps.find((bl: RawData) => bl.car === pi);
      let bestLap: Lap | undefined;
      if (bestLapEntry && bestLapEntry.lap !== undefined) {
        bestLap = parsedLaps.find(l => l.lapNumber === bestLapEntry.lap + 1 && l.timeMs > 0);
      }
      if (!bestLap) {
        // Fallback: find fastest valid lap
        const validLaps = parsedLaps.filter(l => l.isValid && l.timeMs > 0);
        if (validLaps.length > 0) {
          bestLap = validLaps.reduce((a, b) => (a.timeMs < b.timeMs ? a : b));
        }
      }

      // Calculate total time
      const totalTimeMs = parsedLaps
        .filter(l => l.timeMs > 0)
        .reduce((sum, l) => sum + l.timeMs, 0);

      const totalLaps = lapsTotalArr[pi] ?? parsedLaps.length;

      // Determine finish status
      let finishStatus: FinishStatus = 'none';
      if (sessionType === 'race') {
        if (totalLaps > 0) {
          finishStatus = 'finished';
        } else {
          finishStatus = 'dnf';
        }
      } else if (parsedLaps.length > 0) {
        finishStatus = 'finished';
      }

      participants.push({
        drivers: [driver],
        vehicle,
        position: 0, // set below
        laps: parsedLaps,
        bestLap,
        totalTimeMs,
        totalLaps,
        pitstops: 0,
        finishStatus,
        hasPenalty: false,
        penaltyTimeMs: 0,
        aiLevel: carMeta?.aiLevel,
        aiAggression: carMeta?.aiAggression,
      });
    }

    // Set positions from raceResult (for race sessions)
    if (sessionType === 'race' && raceResult.length > 0) {
      for (let pos = 0; pos < raceResult.length; pos++) {
        const carIdx = raceResult[pos]!;
        const participant = participants[carIdx];
        if (participant) {
          participant.position = pos + 1;
        }
      }
      // Sort by position
      participants.sort((a, b) => (a.position || 999) - (b.position || 999));
    } else {
      // For non-race: sort by best lap time
      participants.sort((a, b) => {
        const aTime = a.bestLap?.timeMs ?? Infinity;
        const bTime = b.bestLap?.timeMs ?? Infinity;
        return aTime - bTime;
      });
      participants.forEach((p, i) => { p.position = i + 1; });
    }

    // Calculate gaps
    const leaderTime = participants[0]?.totalTimeMs ?? 0;
    for (let i = 0; i < participants.length; i++) {
      const p = participants[i]!;
      p.gapToLeaderMs = p.totalTimeMs - leaderTime;
      if (i > 0) {
        const prev = participants[i - 1]!;
        p.gapToAheadMs = p.totalTimeMs - prev.totalTimeMs;
      } else {
        p.gapToAheadMs = 0;
      }
    }

    // Calculate lasted laps (max laps any driver completed)
    const lastedLaps = Math.max(...participants.map(p => p.totalLaps), 0);

    sessions.push({
      id: generateId(),
      type: sessionType,
      name: sessionName,
      maxLaps: lapsCount > 0 ? lapsCount : undefined,
      maxMinutes: duration > 0 ? duration : undefined,
      lastedLaps,
      track,
      game: 'Assetto Corsa',
      participants,
      incidents: [],
      sourceFormat: 'ac-client',
      cmMetadata,
    });
  }

  // Session date: prefer CM's dtv, then filename
  const sessionDate = cmMetadata?.sessionDate ?? parseFilenameDate(fileName);

  return {
    fileName,
    fileSize,
    parsedAt: new Date(),
    sessionDate,
    sessions,
    warnings,
    errors: [],
  };
}
