/**
 * Telemetry service — communicates with the Tauri backend for live telemetry.
 *
 * Provides functions to start/stop telemetry, listen for snapshot events,
 * and manage saved telemetry sessions. Only functional in Tauri (desktop) context.
 */

import type {
  TelemetrySnapshot,
  TelemetryStaticInfo,
  TelemetryStatus,
  TelemetrySessionInfo,
  TelemetrySessionData,
} from '../core/models/telemetry-types';

/** Whether we are running inside Tauri (desktop) */
export function isTauriEnvironment(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

/** Dynamically import Tauri API only when available */
async function getTauriInvoke() {
  if (!isTauriEnvironment()) return null;
  try {
    const { invoke } = await import('@tauri-apps/api/core');
    return invoke;
  } catch {
    return null;
  }
}

/** Dynamically import Tauri event listener */
async function getTauriListen() {
  if (!isTauriEnvironment()) return null;
  try {
    const { listen } = await import('@tauri-apps/api/event');
    return listen;
  } catch {
    return null;
  }
}

// ─── Tauri Command Wrappers ────────────────────────────────────────────────

/** Starts the telemetry polling loop in the Rust backend */
export async function startTelemetry(): Promise<void> {
  const invoke = await getTauriInvoke();
  if (!invoke) throw new Error('Telemetry is only available in desktop mode');
  return invoke('start_telemetry');
}

/** Stops telemetry and optionally saves the recorded session */
export async function stopTelemetry(saveSession: boolean = true): Promise<string | null> {
  const invoke = await getTauriInvoke();
  if (!invoke) throw new Error('Telemetry is only available in desktop mode');
  return invoke('stop_telemetry', { saveSession });
}

/** Gets the current telemetry connection status */
export async function getTelemetryStatus(): Promise<TelemetryStatus> {
  const invoke = await getTauriInvoke();
  if (!invoke) {
    return { connected: false, recording: false, carModel: null, track: null, sessionType: null };
  }
  return invoke('get_telemetry_status');
}

/** Lists all saved telemetry sessions */
export async function listTelemetrySessions(): Promise<TelemetrySessionInfo[]> {
  const invoke = await getTauriInvoke();
  if (!invoke) return [];
  return invoke('list_telemetry_sessions');
}

/** Reads a full saved telemetry session */
export async function readTelemetrySession(fileName: string): Promise<TelemetrySessionData> {
  const invoke = await getTauriInvoke();
  if (!invoke) throw new Error('Telemetry is only available in desktop mode');
  return invoke('read_telemetry_session', { fileName });
}

// ─── Event Listeners ───────────────────────────────────────────────────────

type UnlistenFn = () => void;

/** Subscribes to real-time telemetry snapshots */
export async function onTelemetrySnapshot(
  callback: (snapshot: TelemetrySnapshot) => void
): Promise<UnlistenFn> {
  const listen = await getTauriListen();
  if (!listen) return () => {};
  return listen<TelemetrySnapshot>('telemetry://snapshot', (event) => {
    callback(event.payload);
  });
}

/** Subscribes to static session info (emitted once on connection) */
export async function onTelemetryStaticInfo(
  callback: (info: TelemetryStaticInfo) => void
): Promise<UnlistenFn> {
  const listen = await getTauriListen();
  if (!listen) return () => {};
  return listen<TelemetryStaticInfo>('telemetry://static-info', (event) => {
    callback(event.payload);
  });
}

/** Subscribes to telemetry status changes */
export async function onTelemetryStatus(
  callback: (status: TelemetryStatus) => void
): Promise<UnlistenFn> {
  const listen = await getTauriListen();
  if (!listen) return () => {};
  return listen<TelemetryStatus>('telemetry://status', (event) => {
    callback(event.payload);
  });
}

/** Subscribes to lap completion events */
export async function onLapCompleted(
  callback: (snapshot: TelemetrySnapshot) => void
): Promise<UnlistenFn> {
  const listen = await getTauriListen();
  if (!listen) return () => {};
  return listen<TelemetrySnapshot>('telemetry://lap-completed', (event) => {
    callback(event.payload);
  });
}
