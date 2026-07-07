/**
 * Session Cache Service — shared storage via Vercel Blob API.
 *
 * All users share the same cache. The last 20 uploaded JSON files
 * are persisted; older files are automatically removed (FIFO).
 *
 * Communicates with the serverless function at /api/sessions.
 */

const API_BASE = '/api/sessions';

/** A single cached file entry */
export interface CachedFile {
  /** Original file name */
  fileName: string;
  /** Raw JSON text content */
  content: string;
  /** File size in bytes */
  fileSize: number;
  /** Timestamp when cached */
  cachedAt: number;
}

/**
 * Fetch all cached files from the shared API.
 * Returns an empty array on error.
 */
export async function getCachedFiles(): Promise<CachedFile[]> {
  try {
    const res = await fetch(API_BASE);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.sessions ?? []) as CachedFile[];
  } catch {
    return [];
  }
}

/**
 * Upload files to the shared cache.
 * The API enforces the 20-file FIFO limit server-side.
 */
export async function addToCache(
  files: Array<{ fileName: string; content: string; fileSize: number }>,
): Promise<void> {
  try {
    // Upload in parallel (the API handles deduplication and FIFO)
    await Promise.all(
      files.map((file) =>
        fetch(API_BASE, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(file),
        })
      ),
    );
  } catch {
    console.warn('[SessionCache] Failed to upload to shared cache');
  }
}

/**
 * Remove a specific cached file by fileName.
 */
export async function removeFromCache(fileName: string): Promise<void> {
  try {
    await fetch(`${API_BASE}?file=${encodeURIComponent(fileName)}`, {
      method: 'DELETE',
    });
  } catch {
    // ignore
  }
}

/**
 * Clear the entire shared session cache.
 */
export async function clearCache(): Promise<void> {
  try {
    await fetch(`${API_BASE}?all=true`, { method: 'DELETE' });
  } catch {
    // ignore
  }
}

/**
 * Get the number of cached files.
 */
export async function getCacheCount(): Promise<number> {
  try {
    const res = await fetch(API_BASE);
    if (!res.ok) return 0;
    const data = await res.json();
    return data.count ?? 0;
  } catch {
    return 0;
  }
}
