/**
 * Format detector — determines which parser to use for a JSON file.
 * Ported from simresults Data_Reader::factory() pattern.
 */

import { parseAcClientJson } from './ac-client-parser';
import { parseAcServerJson } from './ac-server-parser';
import type { ParseResult } from '../models/types';

/**
 * Check if a parsed JSON object is an AC client/offline format.
 * Detection: root has "players" key
 */
export function isAcClientFormat(data: unknown): boolean {
  return (
    typeof data === 'object' &&
    data !== null &&
    'players' in data &&
    Array.isArray((data as Record<string, unknown>).players)
  );
}

/**
 * Check if a parsed JSON object is an AC server JSON format.
 * Detection: root has "TrackName" key
 */
export function isAcServerFormat(data: unknown): boolean {
  return (
    typeof data === 'object' &&
    data !== null &&
    'TrackName' in data &&
    typeof (data as Record<string, unknown>).TrackName === 'string'
  );
}

/**
 * Parse a JSON string into a ParseResult using the appropriate parser.
 */
export function parseJsonFile(jsonString: string, fileName: string, fileSize: number): ParseResult {
  const warnings: string[] = [];
  const errors: string[] = [];

  let data: unknown;
  try {
    data = JSON.parse(jsonString);
  } catch {
    return {
      fileName,
      fileSize,
      parsedAt: new Date(),
      sessions: [],
      warnings: [],
      errors: [`Error al parsear JSON: archivo inválido`],
    };
  }

  if (isAcClientFormat(data)) {
    return parseAcClientJson(data as Record<string, unknown>, fileName, fileSize);
  }

  if (isAcServerFormat(data)) {
    return parseAcServerJson(data as Record<string, unknown>, fileName, fileSize);
  }

  return {
    fileName,
    fileSize,
    parsedAt: new Date(),
    sessions: [],
    warnings,
    errors: [...errors, 'Formato no reconocido: no es un archivo de resultados de Assetto Corsa válido'],
  };
}
