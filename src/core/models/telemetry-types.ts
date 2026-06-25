/* ============================================================
 * Telemetry Types — Live telemetry data models
 * Maps to Rust TelemetrySnapshot, TelemetryStaticInfo, etc.
 * ============================================================ */

/** Real-time telemetry snapshot received from the Rust backend */
export interface TelemetrySnapshot {
  /** Timestamp in milliseconds since telemetry session start */
  timestampMs: number;
  /** Speed in km/h */
  speedKmh: number;
  /** Engine RPM */
  rpms: number;
  /** Current gear (0=reverse, 1=neutral, 2=1st, 3=2nd, ...) */
  gear: number;
  /** Gas pedal input (0.0 to 1.0) */
  gas: number;
  /** Brake pedal input (0.0 to 1.0) */
  brake: number;
  /** Clutch pedal input (0.0 to 1.0) */
  clutch: number;
  /** Steering angle in radians */
  steerAngle: number;
  /** Fuel remaining in liters */
  fuel: number;
  /** G-force lateral (positive = right) */
  gForceLateral: number;
  /** G-force longitudinal (positive = braking) */
  gForceLongitudinal: number;
  /** Tyre core temperatures [FL, FR, RL, RR] in Celsius */
  tyreTemp: [number, number, number, number];
  /** Tyre wear [FL, FR, RL, RR] (0.0 = new, 1.0 = destroyed) */
  tyreWear: [number, number, number, number];
  /** Tyre pressure [FL, FR, RL, RR] in PSI */
  tyrePressure: [number, number, number, number];
  /** Brake temperature [FL, FR, RL, RR] in Celsius */
  brakeTemp: [number, number, number, number];
  /** Suspension travel [FL, FR, RL, RR] */
  suspensionTravel: [number, number, number, number];
  /** Car damage [front, rear, left, right, ?] */
  carDamage: [number, number, number, number, number];
  /** DRS status */
  drs: number;
  /** Traction control level */
  tc: number;
  /** ABS level */
  abs: number;
  /** Air temperature in Celsius */
  airTemp: number;
  /** Road temperature in Celsius */
  roadTemp: number;
  /** Turbo boost pressure */
  turboBoost: number;
  /** Maximum RPM for current car */
  maxRpm: number;
  /** Maximum fuel capacity */
  maxFuel: number;
  /** Completed laps count */
  completedLaps: number;
  /** Current position in session */
  position: number;
  /** Current lap time in milliseconds */
  currentTimeMs: number;
  /** Last lap time in milliseconds */
  lastTimeMs: number;
  /** Best lap time in milliseconds */
  bestTimeMs: number;
  /** Current sector index (0, 1, 2) */
  currentSectorIndex: number;
  /** Last sector time in milliseconds */
  lastSectorTimeMs: number;
  /** Session time left in seconds */
  sessionTimeLeft: number;
  /** Whether car is in pit */
  isInPit: boolean;
  /** Whether car is in pit lane */
  isInPitLane: boolean;
  /** Normalized car position on track (0.0 to 1.0) */
  normalizedCarPosition: number;
  /** Session status: 0=OFF, 1=REPLAY, 2=LIVE, 3=PAUSE */
  sessionStatus: number;
  /** Number of tyres out of track */
  tyresOut: number;
  /** Pit limiter active */
  pitLimiter: boolean;
}

/** Static session info received once when connection is established */
export interface TelemetryStaticInfo {
  carModel: string;
  track: string;
  trackConfiguration: string;
  playerName: string;
  playerSurname: string;
  maxRpm: number;
  maxFuel: number;
  sectorCount: number;
  numCars: number;
  carSkin: string;
  hasDrs: boolean;
  hasErs: boolean;
  hasKers: boolean;
}

/** Status of the telemetry connection */
export interface TelemetryStatus {
  connected: boolean;
  recording: boolean;
  carModel: string | null;
  track: string | null;
  sessionType: string | null;
}

/** A recorded lap time entry */
export interface LiveLapTime {
  lapNumber: number;
  timeMs: number;
  /** Whether this was the best lap at the time */
  isBest: boolean;
  /** Whether this was a personal best improvement */
  isImprovement: boolean;
}

/** A G-force data point for the trail visualization */
export interface GForcePoint {
  lateral: number;
  longitudinal: number;
  timestamp: number;
}

/** Info about a saved telemetry session */
export interface TelemetrySessionInfo {
  fileName: string;
  recordedAt: string;
  carModel: string;
  track: string;
  trackConfiguration: string;
  durationMs: number;
  snapshotCount: number;
  fileSize: number;
}

/** A full saved telemetry session */
export interface TelemetrySessionData {
  recordedAt: string;
  carModel: string;
  carSkin: string;
  track: string;
  trackConfiguration: string;
  playerName: string;
  maxRpm: number;
  maxFuel: number;
  snapshotCount: number;
  durationMs: number;
  snapshots: TelemetrySnapshot[];
}

/** Gear label map — converts numeric gear to display string */
export const GEAR_LABELS: Record<number, string> = {
  0: 'R',
  1: 'N',
  2: '1',
  3: '2',
  4: '3',
  5: '4',
  6: '5',
  7: '6',
  8: '7',
  9: '8',
};

/** Tyre position labels */
export const TYRE_POSITIONS = ['FL', 'FR', 'RL', 'RR'] as const;

/** Session status enum */
export const SESSION_STATUS = {
  OFF: 0,
  REPLAY: 1,
  LIVE: 2,
  PAUSE: 3,
} as const;
