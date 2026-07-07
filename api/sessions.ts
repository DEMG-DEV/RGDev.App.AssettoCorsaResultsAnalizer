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
  // CORS headers for the SPA
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
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
  } catch (err) {
    console.error('[API /sessions]', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * GET — List all cached sessions with their content.
 */
async function handleGet(res: VercelResponse) {
  const { blobs } = await list({ prefix: BLOB_PREFIX });

  // Sort newest first
  const sorted = blobs.sort(
    (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
  );

  // Fetch content for each blob in parallel
  const sessions = await Promise.all(
    sorted.map(async (blob) => {
      const response = await fetch(blob.url);
      const content = await response.text();
      // Extract the original filename from the blob pathname
      const fileName = blob.pathname.replace(BLOB_PREFIX, '');
      return {
        fileName,
        content,
        fileSize: blob.size,
        cachedAt: new Date(blob.uploadedAt).getTime(),
        blobUrl: blob.url,
      };
    })
  );

  return res.status(200).json({ sessions, count: sessions.length });
}

/**
 * POST — Upload a new session file.
 * Body: { fileName: string, content: string, fileSize: number }
 */
async function handlePost(req: VercelRequest, res: VercelResponse) {
  const { fileName, content, fileSize } = req.body as {
    fileName: string;
    content: string;
    fileSize: number;
  };

  if (!fileName || !content) {
    return res.status(400).json({ error: 'fileName and content are required' });
  }

  // List existing blobs
  const { blobs } = await list({ prefix: BLOB_PREFIX });

  // Delete existing blob with same name (update case)
  const existing = blobs.find(b => b.pathname === `${BLOB_PREFIX}${fileName}`);
  if (existing) {
    await del(existing.url);
  }

  // Enforce FIFO: if we're at the limit, delete the oldest
  const currentCount = existing ? blobs.length - 1 : blobs.length;
  if (currentCount >= MAX_FILES) {
    // Sort oldest first
    const sorted = blobs
      .filter(b => b.url !== existing?.url)
      .sort((a, b) => new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime());

    const toDelete = sorted.slice(0, currentCount - MAX_FILES + 1);
    await Promise.all(toDelete.map(b => del(b.url)));
  }

  // Upload the new file
  const blob = await put(`${BLOB_PREFIX}${fileName}`, content, {
    access: 'public',
    contentType: 'application/json',
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

  if (all === 'true') {
    // Delete all blobs with our prefix
    const { blobs } = await list({ prefix: BLOB_PREFIX });
    if (blobs.length > 0) {
      await Promise.all(blobs.map(b => del(b.url)));
    }
    return res.status(200).json({ deleted: blobs.length });
  }

  if (typeof file === 'string' && file) {
    const { blobs } = await list({ prefix: `${BLOB_PREFIX}${file}` });
    const target = blobs.find(b => b.pathname === `${BLOB_PREFIX}${file}`);
    if (target) {
      await del(target.url);
      return res.status(200).json({ deleted: 1, fileName: file });
    }
    return res.status(404).json({ error: 'File not found' });
  }

  return res.status(400).json({ error: 'Specify ?all=true or ?file=filename' });
}
