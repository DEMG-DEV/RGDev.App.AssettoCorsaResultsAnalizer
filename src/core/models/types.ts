/* ============================================================
 * Core Domain Types — Assetto Corsa Results Analyzer
 * Unified data model for both AC client and server JSON formats
 * ============================================================ */

/** Identifies which JSON format was parsed */
export type SourceFormat = 'ac-client' | 'ac-server-json';

/** Session types */
export type SessionType = 'practice' | 'qualify' | 'warmup' | 'race' | 'hotlap';

/** Finish status of a participant */
export type FinishStatus = 'finished' | 'dnf' | 'dq' | 'none';

/** A single lap sector time */
export interface SectorTime {
  /** Sector number (1-based) */
  sectorNumber: number;
  /** Time in milliseconds */
  timeMs: number;
}

/** A single lap driven by a participant */
export interface Lap {
  /** Lap number (1-based in our model) */
  lapNumber: number;
  /** Total lap time in milliseconds (-1 = invalid/DNF) */
  timeMs: number;
  /** Sector times for this lap */
  sectors: SectorTime[];
  /** Number of cuts/off-tracks during this lap */
  cuts: number;
  /** Tyre compound used (if available) */
  tyre?: string;
  /** Whether this lap is valid (no cuts, positive time) */
  isValid: boolean;
  /** Position at end of this lap (if calculable) */
  position?: number;
}

/** A driver who participated in the session */
export interface Driver {
  /** Display name */
  name: string;
  /** Steam GUID (server format only) */
  guid?: string;
  /** Team name (if any) */
  team?: string;
  /** Nationality string (from CM __raceIni) */
  nationality?: string;
  /** Nation code, e.g. "MEX", "FIN" (from CM __raceIni) */
  nationCode?: string;
}

/** A vehicle / car */
export interface Vehicle {
  /** Internal car model ID (e.g., "ferrari_458") */
  modelId: string;
  /** Human-readable display name from ui_car.json */
  displayName?: string;
  /** Brand name */
  brand?: string;
  /** Car class */
  carClass?: string;
  /** Skin name */
  skin?: string;
  /** Ballast in KG (0 = none) */
  ballastKg: number;
  /** Restrictor value (0 = none) */
  restrictor: number;
  /** Local path or data URL to car preview image (auto-discovered) */
  previewImageUrl?: string;
  /** Local path or data URL to livery thumbnail (auto-discovered) */
  liveryImageUrl?: string;
}

/** Track information */
export interface Track {
  /** Track venue name (e.g., "silverstone") */
  venue: string;
  /** Track layout/config (e.g., "full course") */
  course?: string;
}

/** Server information */
export interface Server {
  /** Server name */
  name: string;
}

/** An incident / collision event */
export interface Incident {
  /** Type of incident */
  type: 'collision-car' | 'collision-env';
  /** Participant involved */
  participant: string;
  /** Other participant (car collision only) */
  otherParticipant?: string;
  /** Impact speed (km/h) */
  impactSpeed?: number;
}

/** A participant in a session (driver + vehicle + results) */
export interface Participant {
  /** The driver(s) — usually 1, but supports driver swaps */
  drivers: Driver[];
  /** The vehicle driven */
  vehicle: Vehicle;
  /** Final classification position (1-based) */
  position: number;
  /** Grid/starting position (1-based, if available) */
  gridPosition?: number;
  /** All laps driven */
  laps: Lap[];
  /** Best lap (fastest valid lap) */
  bestLap?: Lap;
  /** Total race time in milliseconds */
  totalTimeMs: number;
  /** Total number of laps completed */
  totalLaps: number;
  /** Number of pitstops */
  pitstops: number;
  /** Finish status */
  finishStatus: FinishStatus;
  /** Gap to leader (ms) — calculated */
  gapToLeaderMs?: number;
  /** Gap to car ahead (ms) — calculated */
  gapToAheadMs?: number;
  /** Has penalty flag */
  hasPenalty: boolean;
  /** Penalty time in ms */
  penaltyTimeMs: number;
  /** AI level (from CM __raceIni, 0-100) */
  aiLevel?: number;
  /** AI aggression (from CM __raceIni) */
  aiAggression?: number;
}

/** Content Manager metadata parsed from __raceIni and __quickDrive */
export interface ContentManagerMetadata {
  /** Session datetime from CM's dtv field */
  sessionDate?: Date;
  /** Session mode from CM (e.g., "QuickDrive_Race") */
  sessionMode?: string;
  /** Weather name (e.g., "3_clear", "6_mid_clouds") */
  weatherName?: string;
  /** Ambient temperature in Celsius */
  temperatureAmbient?: number;
  /** Road temperature in Celsius */
  temperatureRoad?: number;
  /** Assist settings */
  assists?: AssistSettings;
  /** Per-car metadata from __raceIni [CAR_N] sections */
  carMetadata: Map<number, CarMetadata>;
}

/** Assist settings from CM */
export interface AssistSettings {
  idealLine: boolean;
  autoBlip: boolean;
  stabilityControl: number;
  autoBrake: boolean;
  autoShifter: boolean;
  autoClutch: boolean;
  abs: number;
  tractionControl: number;
  damage: number;
  tyreWear: number;
  fuelConsumption: number;
  tyreBlankets: boolean;
}

/** Per-car metadata from CM's __raceIni */
export interface CarMetadata {
  model: string;
  skin: string;
  driverName: string;
  nationality: string;
  nationCode: string;
  aiLevel: number;
  aiAggression: number;
  ballast: number;
  restrictor: number;
}

/** A complete session with all its data */
export interface Session {
  /** Unique ID for this session (generated) */
  id: string;
  /** Session type */
  type: SessionType;
  /** Session name (e.g., "Quick Race", "Qualifying") */
  name?: string;
  /** Maximum laps allowed */
  maxLaps?: number;
  /** Maximum duration in minutes */
  maxMinutes?: number;
  /** Actual number of laps that occurred */
  lastedLaps: number;
  /** Track information */
  track: Track;
  /** Server info (if applicable) */
  server?: Server;
  /** Game name — always "Assetto Corsa" */
  game: string;
  /** All participants sorted by finishing position */
  participants: Participant[];
  /** All incidents */
  incidents: Incident[];
  /** Source format that was parsed */
  sourceFormat: SourceFormat;
  /** Content Manager metadata (if available) */
  cmMetadata?: ContentManagerMetadata;
}

/** Result of parsing a file — may contain multiple sessions */
export interface ParseResult {
  /** Original file name */
  fileName: string;
  /** File size in bytes */
  fileSize: number;
  /** When the file was parsed */
  parsedAt: Date;
  /** Session datetime (from CM or filename) */
  sessionDate?: Date;
  /** Sessions found in this file */
  sessions: Session[];
  /** Parse warnings (non-fatal issues) */
  warnings: string[];
  /** Parse errors (if any sessions failed) */
  errors: string[];
}

/** Car image resolution result */
export interface CarImages {
  /** Full car render with specific skin (~640x480) */
  previewUrl: string | null;
  /** Small livery thumbnail (~64x64) */
  liveryUrl: string | null;
  /** Whether images came from local AC install */
  isLocalAsset: boolean;
}

/** Car info from ui_car.json */
export interface CarInfo {
  name: string;
  brand: string;
  carClass: string;
  tags: string[];
  year: number;
  description: string;
  bhp: string;
  torque: string;
  weight: string;
}
