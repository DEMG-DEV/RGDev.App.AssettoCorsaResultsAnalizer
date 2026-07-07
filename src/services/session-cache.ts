/**
 * Session Cache Service — hybrid shared + local storage.
 *
 * Strategy:
 * 1. Try the Vercel Blob API (/api/sessions) for shared storage
 * 2. If the API fails, fall back to localStorage
 *
 * The last 20 uploaded JSON files are persisted (FIFO).
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

function localAdd(files: Array<{ fileName: string; content: string; fileSize: number }>): void {
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

// ─── Public API (try remote, fallback to local) ─────────────────────────────

/**
 * Fetch all cached files.
 */
export async function getCachedFiles(): Promise<CachedFile[]> {
  try {
    const res = await fetch(API_BASE);
    if (res.ok) {
      const data = await res.json();
      const sessions = (data.sessions ?? []) as CachedFile[];
      if (sessions.length > 0) return sessions;
    }
  } catch { /* fall through */ }

  // Fallback to localStorage
  return localGet();
}

/**
 * Upload files to the cache (max 20, FIFO).
 */
export async function addToCache(
  files: Array<{ fileName: string; content: string; fileSize: number }>,
): Promise<void> {
  // Always save locally first (instant, reliable)
  localAdd(files);

  // Then try remote in background
  try {
    const results = await Promise.all(
      files.map(async (file) => {
        const res = await fetch(API_BASE, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(file),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          console.warn('[SessionCache] API upload failed:', res.status, err);
        }
        return res.ok;
      }),
    );
    if (results.some(Boolean)) {
      console.info('[SessionCache] Saved to shared storage');
    }
  } catch (e) {
    console.warn('[SessionCache] API unreachable, saved to localStorage only', e);
  }
}

/**
 * Remove a specific cached file by fileName.
 */
export async function removeFromCache(fileName: string): Promise<void> {
  // Remove locally
  localSet(localGet().filter(c => c.fileName !== fileName));

  // Try remote
  try {
    await fetch(`${API_BASE}?file=${encodeURIComponent(fileName)}`, { method: 'DELETE' });
  } catch { /* ignore */ }
}

/**
 * Clear the entire session cache.
 */
export async function clearCache(): Promise<void> {
  // Clear locally
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }

  // Try remote
  try {
    await fetch(`${API_BASE}?all=true`, { method: 'DELETE' });
  } catch { /* ignore */ }
}

/**
 * Get the number of cached files.
 */
export async function getCacheCount(): Promise<number> {
  try {
    const res = await fetch(API_BASE);
    if (res.ok) {
      const data = await res.json();
      return data.count ?? 0;
    }
  } catch { /* fall through */ }
  return localGet().length;
}
