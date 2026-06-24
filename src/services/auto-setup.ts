/**
 * Auto-Setup Service — loads CM sessions and AC status.
 *
 * Dual mode:
 *   - Tauri (desktop release/dev): uses Rust IPC commands via @tauri-apps/api
 *   - Browser (vite dev): uses Vite dev server endpoints (/__api/*)
 */

import { parseJsonFile } from '../core/parsers/format-detector';
import type { ParseResult } from '../core/models/types';

export interface LocalStatus {
  cmFound: boolean;
  acFound: boolean;
  cmPath: string | null;
  acPath: string | null;
}

interface SessionFileInfo {
  name: string;
  size: number;
  modified: number;
}

/**
 * Detect if we're running inside Tauri.
 */
function isTauri(): boolean {
  return '__TAURI_INTERNALS__' in window;
}

/**
 * Lazy-load Tauri invoke to avoid import errors in browser-only mode.
 */
async function tauriInvoke<T>(cmd: string, args?: Record<string, unknown>): Promise<T> {
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<T>(cmd, args);
}

/**
 * Check local server status (are CM/AC folders detected?)
 */
export async function checkLocalStatus(): Promise<LocalStatus> {
  try {
    if (isTauri()) {
      return await tauriInvoke<LocalStatus>('check_local_status');
    }

    // Fallback: Vite dev server
    const res = await fetch('/__api/status');
    if (!res.ok) throw new Error('Status endpoint not available');
    return await res.json() as LocalStatus;
  } catch {
    return { cmFound: false, acFound: false, cmPath: null, acPath: null };
  }
}

/**
 * Auto-load all CM sessions.
 */
export async function autoLoadCmSessions(
  onProgress?: (current: number, total: number) => void,
): Promise<ParseResult[]> {
  if (isTauri()) {
    return autoLoadCmSessionsTauri(onProgress);
  }
  return autoLoadCmSessionsHttp(onProgress);
}

/**
 * Tauri mode: use Rust IPC commands.
 */
async function autoLoadCmSessionsTauri(
  onProgress?: (current: number, total: number) => void,
): Promise<ParseResult[]> {
  try {
    const files = await tauriInvoke<SessionFileInfo[]>('list_cm_sessions');
    if (!files.length) return [];

    const results: ParseResult[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i]!;
      onProgress?.(i + 1, files.length);

      try {
        const text = await tauriInvoke<string>('read_cm_session', { fileName: file.name });
        const result = parseJsonFile(text, file.name, file.size);
        results.push(result);
      } catch {
        // Skip failed files
      }
    }

    return results;
  } catch {
    return [];
  }
}

/**
 * HTTP mode: use Vite dev server endpoints.
 */
async function autoLoadCmSessionsHttp(
  onProgress?: (current: number, total: number) => void,
): Promise<ParseResult[]> {
  // 1. Get list of session files
  const listRes = await fetch('/__api/cm-sessions');
  if (!listRes.ok) return [];

  const files = await listRes.json() as Array<{ name: string; size: number; modified: number }>;
  if (!files.length) return [];

  const results: ParseResult[] = [];

  // 2. Fetch and parse each file
  for (let i = 0; i < files.length; i++) {
    const file = files[i]!;
    onProgress?.(i + 1, files.length);

    try {
      const contentRes = await fetch(`/__api/cm-sessions/${encodeURIComponent(file.name)}`);
      if (!contentRes.ok) continue;

      const text = await contentRes.text();
      const result = parseJsonFile(text, file.name, file.size);
      results.push(result);
    } catch {
      // Skip failed files
    }
  }

  return results;
}
