/**
 * AC Server JSON Parser
 * Handles: AC Dedicated Server result files (have "TrackName" key)
 * Ported from simresults AssettoCorsaServerJson.php reader
 */

import type {
  ParseResult, Session, SessionType, Participant, Lap,
  SectorTime, Driver, Vehicle, Track, Incident, FinishStatus,
} from '../models/types';

/* eslint-disable @typescript-eslint/no-explicit-any */
type RawData = Record<string, any>;

/** Map AC server session type string to our enum */
function mapServerSessionType(typeStr: string): SessionType {
  switch (typeStr.toUpperCase()) {
    case 'PRACTICE': return 'practice';
    case 'QUALIFY': case 'QUALIFYING': return 'qualify';
    case 'RACE': return 'race';
    case 'WARMUP': return 'warmup';
    default: return 'practice';
  }
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Parse an AC server JSON object into a ParseResult.
 */
export function parseAcServerJson(
  data: RawData,
  fileName: string,
  fileSize: number,
): ParseResult {
  const warnings: string[] = [];

  const trackName: string = data.TrackName ?? 'unknown';
  const trackConfig: string = data.TrackConfig ?? '';
  const sessionType = mapServerSessionType(data.Type ?? 'PRACTICE');
  const raceLaps: number = data.RaceLaps ?? 0;
  const durationSecs: number = data.DurationSecs ?? 0;

  const cars: RawData[] = data.Cars ?? [];
  const results: RawData[] = data.Result ?? [];
  const laps: RawData[] = data.Laps ?? [];
  const events: RawData[] = data.Events ?? [];

  const track: Track = {
    venue: trackName,
    course: trackConfig || undefined,
  };

  // Build a map from CarId → Car data (handle CarId reuse!)
  // Use DriverGuid + CarModel as a unique key
  type DriverKey = string;
  function makeDriverKey(guid: string, name: string): DriverKey {
    return `${guid}|${name}`;
  }

  // Build car lookup
  const carLookup = new Map<number, RawData>();
  for (const car of cars) {
    carLookup.set(car.CarId as number, car);
  }

  // Group laps by driver key
  const lapsByDriver = new Map<DriverKey, RawData[]>();
  for (const lap of laps) {
    const key = makeDriverKey(lap.DriverGuid ?? '', lap.DriverName ?? '');
    if (!lapsByDriver.has(key)) {
      lapsByDriver.set(key, []);
    }
    lapsByDriver.get(key)!.push(lap);
  }

  // Build participants from Results array
  const participants: Participant[] = [];
  const processedDrivers = new Set<DriverKey>();

  // Sort results by TotalTime (Result ordering is NOT reliable per simresults)
  const sortedResults = [...results].sort((a, b) => {
    const aLaps = lapsByDriver.get(makeDriverKey(a.DriverGuid ?? '', a.DriverName ?? ''))?.length ?? 0;
    const bLaps = lapsByDriver.get(makeDriverKey(b.DriverGuid ?? '', b.DriverName ?? ''))?.length ?? 0;
    if (aLaps !== bLaps) return bLaps - aLaps; // More laps = higher position
    return (a.TotalTime ?? Infinity) - (b.TotalTime ?? Infinity);
  });

  for (const result of sortedResults) {
    const driverGuid: string = result.DriverGuid ?? '';
    const driverName: string = result.DriverName ?? 'Unknown';
    const key = makeDriverKey(driverGuid, driverName);

    if (processedDrivers.has(key)) continue;
    processedDrivers.add(key);

    const carModel: string = result.CarModel ?? 'unknown';
    const bestLapMs: number = result.BestLap ?? 0;
    const totalTimeMs: number = result.TotalTime ?? 0;
    const hasPenalty: boolean = result.HasPenalty ?? false;
    const penaltyTime: number = result.PenaltyTime ?? 0;

    // Find car data for skin/ballast
    const carData = cars.find((c: RawData) =>
      c.Model === carModel && c.Driver?.Guid === driverGuid
    );

    const driver: Driver = {
      name: driverName,
      guid: driverGuid,
      team: carData?.Driver?.Team || undefined,
    };

    const vehicle: Vehicle = {
      modelId: carModel,
      skin: carData?.Skin,
      ballastKg: result.BallastKG ?? carData?.BallastKG ?? 0,
      restrictor: result.Restrictor ?? carData?.Restrictor ?? 0,
    };

    // Parse laps
    const driverLaps = lapsByDriver.get(key) ?? [];
    const parsedLaps: Lap[] = driverLaps.map((rawLap, idx) => {
      const sectors: number[] = rawLap.Sectors ?? [];
      const sectorTimes: SectorTime[] = sectors.map((sMs: number, si: number) => ({
        sectorNumber: si + 1,
        timeMs: sMs,
      }));

      const lapTime: number = rawLap.LapTime ?? -1;
      const cuts: number = rawLap.Cuts ?? 0;

      return {
        lapNumber: idx + 1,
        timeMs: lapTime,
        sectors: sectorTimes,
        cuts,
        tyre: rawLap.Tyre,
        isValid: lapTime > 0 && cuts === 0,
      };
    });

    // Find best lap
    let bestLap: Lap | undefined;
    if (bestLapMs > 0) {
      bestLap = parsedLaps.find(l => l.timeMs === bestLapMs);
    }
    if (!bestLap) {
      const validLaps = parsedLaps.filter(l => l.isValid && l.timeMs > 0);
      if (validLaps.length > 0) {
        bestLap = validLaps.reduce((a, b) => (a.timeMs < b.timeMs ? a : b));
      }
    }

    // Finish status
    let finishStatus: FinishStatus = 'none';
    if (parsedLaps.length > 0) {
      finishStatus = 'finished';
      if (sessionType === 'race' && raceLaps > 0 && parsedLaps.length < raceLaps) {
        finishStatus = 'dnf';
      }
    }

    participants.push({
      drivers: [driver],
      vehicle,
      position: 0,
      laps: parsedLaps,
      bestLap,
      totalTimeMs,
      totalLaps: parsedLaps.length,
      pitstops: 0,
      finishStatus,
      hasPenalty,
      penaltyTimeMs: penaltyTime,
    });
  }

  // Set positions
  participants.forEach((p, i) => { p.position = i + 1; });

  // Calculate gaps
  if (participants.length > 0) {
    const leaderTime = participants[0]!.totalTimeMs;
    for (let i = 0; i < participants.length; i++) {
      const p = participants[i]!;
      p.gapToLeaderMs = p.totalTimeMs - leaderTime;
      p.gapToAheadMs = i > 0 ? p.totalTimeMs - participants[i - 1]!.totalTimeMs : 0;
    }
  }

  // Parse incidents
  const incidents: Incident[] = events
    .filter((e: RawData) => e.Type?.startsWith('COLLISION'))
    .map((e: RawData) => ({
      type: e.Type === 'COLLISION_WITH_CAR' ? 'collision-car' as const : 'collision-env' as const,
      participant: e.Driver?.Name ?? 'Unknown',
      otherParticipant: e.OtherDriver?.Name,
      impactSpeed: e.ImpactSpeed,
    }));

  const lastedLaps = Math.max(...participants.map(p => p.totalLaps), 0);

  const session: Session = {
    id: generateId(),
    type: sessionType,
    maxLaps: raceLaps > 0 ? raceLaps : undefined,
    maxMinutes: durationSecs > 0 ? Math.round(durationSecs / 60) : undefined,
    lastedLaps,
    track,
    game: 'Assetto Corsa',
    participants,
    incidents,
    sourceFormat: 'ac-server-json',
  };

  return {
    fileName,
    fileSize,
    parsedAt: new Date(),
    sessions: [session],
    warnings,
    errors: [],
  };
}
