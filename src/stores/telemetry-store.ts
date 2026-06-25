/**
 * Zustand store — telemetry state management for live telemetry dashboard.
 */

import { create } from 'zustand';
import type {
  TelemetrySnapshot,
  TelemetryStaticInfo,
  LiveLapTime,
  GForcePoint,
} from '../core/models/telemetry-types';

/** Maximum number of G-force trail points to keep */
const MAX_GFORCE_HISTORY = 120;

/** Maximum number of speed history points for the mini chart */
const MAX_SPEED_HISTORY = 200;

interface TelemetryStore {
  /** Whether telemetry is currently connected to AC */
  isConnected: boolean;
  /** Whether telemetry is actively recording */
  isRecording: boolean;
  /** Whether to save the session when stopping */
  saveSessionEnabled: boolean;
  /** Error message if connection failed */
  error: string | null;
  /** Current real-time snapshot */
  currentSnapshot: TelemetrySnapshot | null;
  /** Static session info (set once on connection) */
  staticInfo: TelemetryStaticInfo | null;
  /** Completed lap times */
  lapHistory: LiveLapTime[];
  /** G-force trail points */
  gForceHistory: GForcePoint[];
  /** Speed history for mini sparkline */
  speedHistory: number[];
  /** RPM history for mini sparkline */
  rpmHistory: number[];

  // Actions
  setConnected: (connected: boolean) => void;
  setRecording: (recording: boolean) => void;
  setSaveSessionEnabled: (enabled: boolean) => void;
  setError: (error: string | null) => void;
  updateSnapshot: (snapshot: TelemetrySnapshot) => void;
  setStaticInfo: (info: TelemetryStaticInfo) => void;
  addLap: (lap: LiveLapTime) => void;
  resetTelemetry: () => void;
}

export const useTelemetryStore = create<TelemetryStore>((set, get) => ({
  isConnected: false,
  isRecording: false,
  saveSessionEnabled: true,
  error: null,
  currentSnapshot: null,
  staticInfo: null,
  lapHistory: [],
  gForceHistory: [],
  speedHistory: [],
  rpmHistory: [],

  setConnected: (connected) =>
    set({ isConnected: connected, error: connected ? null : get().error }),

  setRecording: (recording) => set({ isRecording: recording }),

  setSaveSessionEnabled: (enabled) => set({ saveSessionEnabled: enabled }),

  setError: (error) => set({ error }),

  updateSnapshot: (snapshot) =>
    set((state) => {
      const gForceHistory = [
        ...state.gForceHistory.slice(-(MAX_GFORCE_HISTORY - 1)),
        {
          lateral: snapshot.gForceLateral,
          longitudinal: snapshot.gForceLongitudinal,
          timestamp: snapshot.timestampMs,
        },
      ];

      const speedHistory = [
        ...state.speedHistory.slice(-(MAX_SPEED_HISTORY - 1)),
        snapshot.speedKmh,
      ];

      const rpmHistory = [
        ...state.rpmHistory.slice(-(MAX_SPEED_HISTORY - 1)),
        snapshot.rpms,
      ];

      return {
        currentSnapshot: snapshot,
        gForceHistory,
        speedHistory,
        rpmHistory,
      };
    }),

  setStaticInfo: (info) => set({ staticInfo: info }),

  addLap: (lap) =>
    set((state) => ({
      lapHistory: [...state.lapHistory, lap],
    })),

  resetTelemetry: () =>
    set({
      isConnected: false,
      isRecording: false,
      error: null,
      currentSnapshot: null,
      staticInfo: null,
      lapHistory: [],
      gForceHistory: [],
      speedHistory: [],
      rpmHistory: [],
    }),
}));
