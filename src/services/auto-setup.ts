/**
 * Auto-Setup Service — loads CM sessions and AC status via Vite dev server endpoints.
 * No user interaction required. Falls back to manual selection if not found.
 */

import { parseJsonFile } from '../core/parsers/format-detector';
import type { ParseResult } from '../core/models/types';

export interface LocalStatus {
  cmFound: boolean;
  acFound: boolean;
  cmPath: string | null;
  acPath: string | null;
}

/**
 * Check local server status (are CM/AC folders detected?)
 */
export async function checkLocalStatus(): Promise<LocalStatus> {
  try {
    const res = await fetch('/__api/status');
    if (!res.ok) throw new Error('Status endpoint not available');
    return await res.json() as LocalStatus;
  } catch {
    return { cmFound: false, acFound: false, cmPath: null, acPath: null };
  }
}

/**
 * Auto-load all CM sessions from the Vite dev server.
 */
export async function autoLoadCmSessions(
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
