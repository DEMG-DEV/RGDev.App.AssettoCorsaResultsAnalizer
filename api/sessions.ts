/**
 * Vercel Serverless Function — shared session storage.
 *
 * GET    /api/sessions           → list all cached sessions (metadata + content)
 * POST   /api/sessions           → upload a session JSON (body: { fileName, content, fileSize })
 * DELETE /api/sessions?all=true  → clear all sessions
 * DELETE /api/sessions?file=name → delete a specific session
 *
 * Storage: Vercel Blob (250 MB free tier).
 * Enforces a maximum of 20 files (FIFO — oldest removed first).
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { list, put, del } from '@vercel/blob';

const MAX_FILES = 20;
const BLOB_PREFIX = 'ac-sessions/';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Check that the token is configured
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error('[API /sessions] BLOB_READ_WRITE_TOKEN is not set');
    return res.status(500).json({
      error: 'Blob storage not configured',
      detail: 'BLOB_READ_WRITE_TOKEN environment variable is missing',
    });
  }

  try {
    switch (req.method) {
      case 'GET':
        return await handleGet(res);
      case 'POST':
        return await handlePost(req, res);
      case 'DELETE':
        return await handleDelete(req, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (err: any) {
    console.error('[API /sessions] Unhandled error:', err);
    return res.status(500).json({
      error: 'Internal server error',
      detail: err?.message ?? String(err),
    });
  }
}

/**
 * Parse a Content Manager session filename (YYMMDD-HHMMSS.json) into a Date.
 */
function parseFilenameDate(filename: string): Date | null {
  const match = filename.match(/^(\d{2})(\d{2})(\d{2})-(\d{2})(\d{2})(\d{2})\.json$/);
  if (!match) return null;

  const [, yy, mm, dd, hh, mi, ss] = match;
  const year = 2000 + parseInt(yy!, 10);
  const month = parseInt(mm!, 10) - 1; // 0-indexed
  const day = parseInt(dd!, 10);
  const hour = parseInt(hh!, 10);
  const minute = parseInt(mi!, 10);
  const second = parseInt(ss!, 10);

  return new Date(year, month, day, hour, minute, second);
}

/**
 * Try to extract actual session date from raw session JSON content.
 */
function extractSessionDate(content: string, fileName: string, fallbackDate: Date): Date {
  try {
    const data = JSON.parse(content);
    
    // 0. Try custom injected appSessionDate first (lastModified date from File object)
    if (data && data.appSessionDate) {
      return new Date(data.appSessionDate);
    }
    
    // 1. Try __quickDrive -> dtv (Content Manager client format)
    if (data && typeof data.__quickDrive === 'string') {
      const qd = JSON.parse(data.__quickDrive);
      if (qd && qd.dtv) {
        return new Date(qd.dtv);
      }
    }

    // 2. Try __raceIni -> TEMPERATURE -> TIME or similar (none of these is a full ISO string, so we skip)

    // 3. Try filename pattern (Content Manager default filenames: YYMMDD-HHMMSS.json)
    const fileDate = parseFilenameDate(fileName);
    if (fileDate) return fileDate;
  } catch {
    // Ignore JSON parsing errors, fall back
  }
  return fallbackDate;
}

/**
 * GET — List all cached sessions with their content.
 */
async function handleGet(res: VercelResponse) {
  const token = process.env.BLOB_READ_WRITE_TOKEN!;
  const { blobs } = await list({ prefix: BLOB_PREFIX, token });

  // Fetch content for each blob in parallel
  const sessions = await Promise.all(
    blobs.map(async (blob) => {
      try {
        const downloadUrl = blob.url;
        const response = await fetch(downloadUrl);
        if (!response.ok) {
          console.error(`[API] Blob fetch failed: ${response.status} for ${blob.pathname}`);
          return null;
        }

        const content = await response.text();

        // Verify content is JSON (not an HTML error page)
        const trimmed = content.trim();
        if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
          console.error(`[API] Blob content is not JSON for ${blob.pathname}: ${trimmed.slice(0, 100)}`);
          return null;
        }

        const fileName = blob.pathname.replace(BLOB_PREFIX, '');
        
        // Extract the actual session date from the JSON or filename, fallback to uploadedAt
        const sessionDate = extractSessionDate(content, fileName, new Date(blob.uploadedAt));

        return {
          fileName,
          content,
          fileSize: blob.size,
          cachedAt: sessionDate.getTime(), // Overwrite cachedAt to represent session time for sorting
        };
      } catch (err) {
        console.error(`[API] Error fetching blob ${blob.pathname}:`, err);
        return null;
      }
    })
  );

  const validSessions = sessions.filter(Boolean);
  
  // Sort descending by actual session date (cachedAt)
  const sortedSessions = validSessions.sort((a, b) => b!.cachedAt - a!.cachedAt);

  return res.status(200).json({ sessions: sortedSessions, count: sortedSessions.length });
}

/**
 * POST — Upload a new session file.
 * Body: { fileName: string, content: string, fileSize: number }
 */
async function handlePost(req: VercelRequest, res: VercelResponse) {
  const body = req.body;

  if (!body || !body.fileName || !body.content) {
    return res.status(400).json({
      error: 'fileName and content are required',
      received: body ? Object.keys(body) : 'no body',
    });
  }

  const { fileName, content: rawContent, fileSize, lastModified } = body as {
    fileName: string;
    content: string;
    fileSize: number;
    lastModified?: number;
  };

  let content = rawContent;
  if (lastModified) {
    try {
      const data = JSON.parse(rawContent);
      if (data && typeof data === 'object') {
        data.appSessionDate = lastModified;
        content = JSON.stringify(data);
      }
    } catch {
      // Ignore JSON parsing errors, upload raw content
    }
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN!;

  // List existing blobs
  const { blobs } = await list({ prefix: BLOB_PREFIX, token });

  // Delete existing blob with same name (update case)
  const existing = blobs.find(b => b.pathname === `${BLOB_PREFIX}${fileName}`);
  if (existing) {
    await del(existing.url, { token });
  }

  // Enforce FIFO: if we're at the limit, delete the oldest
  const currentCount = existing ? blobs.length - 1 : blobs.length;
  if (currentCount >= MAX_FILES) {
    const sorted = blobs
      .filter(b => b.url !== existing?.url)
      .sort((a, b) => new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime());

    const toDelete = sorted.slice(0, currentCount - MAX_FILES + 1);
    await Promise.all(toDelete.map(b => del(b.url, { token })));
  }

  // Upload the new file
  const blob = await put(`${BLOB_PREFIX}${fileName}`, content, {
    access: 'public',
    contentType: 'application/json',
    token,
  });

  return res.status(201).json({
    fileName,
    fileSize,
    blobUrl: blob.url,
    cachedAt: Date.now(),
  });
}

/**
 * DELETE — Remove sessions.
 * ?all=true  → delete everything
 * ?file=name → delete a specific file
 */
async function handleDelete(req: VercelRequest, res: VercelResponse) {
  const { all, file } = req.query;
  const token = process.env.BLOB_READ_WRITE_TOKEN!;

  if (all === 'true') {
    const { blobs } = await list({ prefix: BLOB_PREFIX, token });
    if (blobs.length > 0) {
      await Promise.all(blobs.map(b => del(b.url, { token })));
    }
    return res.status(200).json({ deleted: blobs.length });
  }

  if (typeof file === 'string' && file) {
    const { blobs } = await list({ prefix: `${BLOB_PREFIX}${file}`, token });
    const target = blobs.find(b => b.pathname === `${BLOB_PREFIX}${file}`);
    if (target) {
      await del(target.url, { token });
      return res.status(200).json({ deleted: 1, fileName: file });
    }
    return res.status(404).json({ error: 'File not found' });
  }

  return res.status(400).json({ error: 'Specify ?all=true or ?file=filename' });
}
