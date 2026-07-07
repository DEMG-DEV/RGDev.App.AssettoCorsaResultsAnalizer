/**
 * File Loader Service — handles file input, ZIP extraction, and batch parsing.
 */

import JSZip from 'jszip';
import { parseJsonFile } from '../core/parsers/format-detector';
import type { ParseResult } from '../core/models/types';
import { addToCache } from './session-cache';

/**
 * Load and parse a single File object.
 */
async function parseFile(file: File): Promise<ParseResult> {
  const text = await file.text();
  return parseJsonFile(text, file.name, file.size);
}

/**
 * Load and parse multiple File objects (JSON or ZIP).
 * ZIP files are extracted and each JSON inside is parsed.
 */
export async function loadFiles(
  files: File[],
  onProgress?: (current: number, total: number) => void,
): Promise<ParseResult[]> {
  const results: ParseResult[] = [];
  const allFiles: Array<{ name: string; content: string; size: number; lastModified?: number }> = [];

  // First pass: extract ZIPs and collect all JSONs
  for (const file of files) {
    if (file.name.toLowerCase().endsWith('.zip')) {
      try {
        const zip = await JSZip.loadAsync(file);
        const jsonFiles = Object.entries(zip.files).filter(
          ([name]) => name.toLowerCase().endsWith('.json') && !name.startsWith('__MACOSX')
        );

        for (const [name, zipEntry] of jsonFiles) {
          const content = await zipEntry.async('string');
          allFiles.push({
            name,
            content,
            size: content.length,
            lastModified: zipEntry.date ? new Date(zipEntry.date).getTime() : Date.now(),
          });
        }
      } catch {
        results.push({
          fileName: file.name,
          fileSize: file.size,
          parsedAt: new Date(),
          sessions: [],
          warnings: [],
          errors: ['Error al extraer archivo ZIP'],
        });
      }
    } else if (file.name.toLowerCase().endsWith('.json')) {
      const content = await file.text();
      allFiles.push({
        name: file.name,
        content,
        size: file.size,
        lastModified: file.lastModified,
      });
    }
  }

  // Second pass: parse all JSONs
  for (let i = 0; i < allFiles.length; i++) {
    const f = allFiles[i]!;
    onProgress?.(i + 1, allFiles.length);
    const result = parseJsonFile(f.content, f.name, f.size);
    // Merge the file's lastModified date if parsed results don't have one
    if (result.sessionDate === undefined && f.lastModified) {
      result.sessionDate = new Date(f.lastModified);
    }
    results.push(result);
  }

  // Cache successfully parsed files in localStorage (max 20, FIFO)
  const filesToCache = allFiles.filter((f) =>
    results.some(r => r.fileName === f.name && r.sessions.length > 0)
  );
  if (filesToCache.length > 0) {
    addToCache(filesToCache.map(f => ({
      fileName: f.name,
      content: f.content,
      fileSize: f.size,
      lastModified: f.lastModified,
    })));
  }

  return results;
}

/**
 * Load files from a directory handle (File System Access API).
 */
export async function loadFromDirectory(
  dirHandle: FileSystemDirectoryHandle,
  onProgress?: (current: number, total: number) => void,
): Promise<ParseResult[]> {
  const jsonFiles: File[] = [];

  for await (const entry of dirHandle.values()) {
    if (entry.kind === 'file' && entry.name.toLowerCase().endsWith('.json')) {
      const fileHandle = entry as FileSystemFileHandle;
      const file = await fileHandle.getFile();
      jsonFiles.push(file);
    }
  }

  // Sort by filename (chronological for CM files: YYMMDD-HHMMSS.json)
  jsonFiles.sort((a, b) => a.name.localeCompare(b.name));

  const results: ParseResult[] = [];
  for (let i = 0; i < jsonFiles.length; i++) {
    const file = jsonFiles[i]!;
    onProgress?.(i + 1, jsonFiles.length);
    results.push(await parseFile(file));
  }

  return results;
}
