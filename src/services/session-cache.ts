/**
 * Session Cache Service — hybrid shared + local storage.
 *
 * Strategy:
 * 1. Try the Vercel Blob API (/api/sessions) for shared storage
 * 2. If the API fails (not deployed, no token, etc.), fall back to localStorage
 *
 * The last 20 uploaded JSON files are persisted; older files are automatically
 * removed (FIFO).
 */

const API_BASE = '/api/sessions';
const STORAGE_KEY = 'ac-session-cache';
const MAX_CACHED_FILES = 20;

/** A single cached file entry */
export interface CachedFile {
  fileName: string;
  content: string;
  fileSize: number;
  cachedAt: number;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Check if the API is reachable (cached per session). */
let _apiAvailable: boolean | null = null;

async function isApiAvailable(): Promise<boolean> {
  if (_apiAvailable !== null) return _apiAvailable;
  try {
    const res = await fetch(API_BASE, { method: 'GET' });
    _apiAvailable = res.ok;
  } catch {
    _apiAvailable = false;
  }
  return _apiAvailable;
}

// ─── localStorage helpers ───────────────────────────────────────────────────

function localGet(): CachedFile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CachedFile[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function localSet(cache: CachedFile[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch {
    console.warn('[SessionCache] localStorage write failed');
  }
}

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Fetch all cached files.
 */
export async function getCachedFiles(): Promise<CachedFile[]> {
  if (await isApiAvailable()) {
    try {
      const res = await fetch(API_BASE);
      if (res.ok) {
        const data = await res.json();
        return (data.sessions ?? []) as CachedFile[];
      }
    } catch { /* fall through */ }
  }
  return localGet();
}

/**
 * Upload files to the cache (max 20, FIFO).
 */
export async function addToCache(
  files: Array<{ fileName: string; content: string; fileSize: number }>,
): Promise<void> {
  if (await isApiAvailable()) {
    try {
      await Promise.all(
        files.map((file) =>
          fetch(API_BASE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(file),
          })
        ),
      );
      return;
    } catch { /* fall through to local */ }
  }

  // localStorage fallback
  let cache = localGet();
  for (const file of files) {
    cache = cache.filter(c => c.fileName !== file.fileName);
    cache.push({ ...file, cachedAt: Date.now() });
  }
  if (cache.length > MAX_CACHED_FILES) {
    cache.sort((a, b) => a.cachedAt - b.cachedAt);
    cache = cache.slice(cache.length - MAX_CACHED_FILES);
  }
  localSet(cache);
}

/**
 * Remove a specific cached file by fileName.
 */
export async function removeFromCache(fileName: string): Promise<void> {
  if (await isApiAvailable()) {
    try {
      await fetch(`${API_BASE}?file=${encodeURIComponent(fileName)}`, { method: 'DELETE' });
      return;
    } catch { /* fall through */ }
  }
  localSet(localGet().filter(c => c.fileName !== fileName));
}

/**
 * Clear the entire session cache.
 */
export async function clearCache(): Promise<void> {
  if (await isApiAvailable()) {
    try {
      await fetch(`${API_BASE}?all=true`, { method: 'DELETE' });
    } catch { /* ignore */ }
  }
  // Always clear local too
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
}

/**
 * Get the number of cached files.
 */
export async function getCacheCount(): Promise<number> {
  if (await isApiAvailable()) {
    try {
      const res = await fetch(API_BASE);
      if (res.ok) {
        const data = await res.json();
        return data.count ?? 0;
      }
    } catch { /* fall through */ }
  }
  return localGet().length;
}
