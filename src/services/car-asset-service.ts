/**
 * Car Asset Service — loads car preview images and info from AC install.
 *
 * Dual mode:
 *   - Tauri (desktop release/dev): uses Rust IPC commands (returns base64 data URLs)
 *   - Browser (vite dev): uses Vite dev server endpoints (/__api/*)
 */

import type { CarImages, CarInfo } from '../core/models/types';

/** Cache for resolved images */
const imageCache = new Map<string, CarImages>();
const carInfoCache = new Map<string, CarInfo | null>();

/** Whether AC root was found by the server */
let acAvailable = false;

/**
 * Detect if we're running inside Tauri.
 */
function isTauri(): boolean {
  return '__TAURI_INTERNALS__' in window;
}

/**
 * Lazy-load Tauri invoke.
 */
async function tauriInvoke<T>(cmd: string, args?: Record<string, unknown>): Promise<T> {
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<T>(cmd, args);
}

/**
 * Set whether AC assets are available (called after status check).
 */
export function setAcAvailable(available: boolean): void {
  acAvailable = available;
}

/**
 * Check if AC assets are available.
 */
export function hasAcRoot(): boolean {
  return acAvailable;
}

/**
 * Resolve car preview image URL.
 * - Tauri: returns a data:image/jpeg;base64,... URL from Rust
 * - Browser: returns an HTTP URL to the Vite dev server
 */
export async function resolveCarPreview(
  carId: string,
  skinName?: string,
): Promise<CarImages> {
  const cacheKey = `${carId}|${skinName ?? ''}`;
  const cached = imageCache.get(cacheKey);
  if (cached) return cached;

  if (!acAvailable) {
    const noImages: CarImages = { previewUrl: null, liveryUrl: null, isLocalAsset: false };
    imageCache.set(cacheKey, noImages);
    return noImages;
  }

  if (isTauri()) {
    return resolveCarPreviewTauri(carId, skinName, cacheKey);
  }
  return resolveCarPreviewHttp(carId, skinName, cacheKey);
}

/**
 * Tauri mode: get base64 data URL from Rust command.
 */
async function resolveCarPreviewTauri(
  carId: string,
  skinName: string | undefined,
  cacheKey: string,
): Promise<CarImages> {
  try {
    const dataUrl = await tauriInvoke<string>('get_car_preview', {
      carId,
      skinName: skinName ?? null,
    });

    const result: CarImages = {
      previewUrl: dataUrl,
      liveryUrl: null,
      isLocalAsset: true,
    };
    imageCache.set(cacheKey, result);
    return result;
  } catch {
    const noImages: CarImages = { previewUrl: null, liveryUrl: null, isLocalAsset: false };
    imageCache.set(cacheKey, noImages);
    return noImages;
  }
}

/**
 * HTTP mode: use Vite dev server endpoint.
 */
async function resolveCarPreviewHttp(
  carId: string,
  skinName: string | undefined,
  cacheKey: string,
): Promise<CarImages> {
  const url = skinName
    ? `/__api/ac-car-preview/${encodeURIComponent(carId)}/${encodeURIComponent(skinName)}`
    : `/__api/ac-car-preview/${encodeURIComponent(carId)}`;

  try {
    const res = await fetch(url, { method: 'HEAD' });
    if (res.ok) {
      const result: CarImages = {
        previewUrl: url,
        liveryUrl: null,
        isLocalAsset: true,
      };
      imageCache.set(cacheKey, result);
      return result;
    }
  } catch {
    // Server not available
  }

  const noImages: CarImages = { previewUrl: null, liveryUrl: null, isLocalAsset: false };
  imageCache.set(cacheKey, noImages);
  return noImages;
}

/**
 * Load car info from ui_car.json.
 */
export async function resolveCarInfo(carId: string): Promise<CarInfo | null> {
  const cached = carInfoCache.get(carId);
  if (cached !== undefined) return cached;

  if (!acAvailable) {
    carInfoCache.set(carId, null);
    return null;
  }

  if (isTauri()) {
    return resolveCarInfoTauri(carId);
  }
  return resolveCarInfoHttp(carId);
}

/**
 * Tauri mode: get car info JSON string from Rust, parse it.
 */
async function resolveCarInfoTauri(carId: string): Promise<CarInfo | null> {
  try {
    const jsonStr = await tauriInvoke<string>('get_car_info', { carId });
    const data = JSON.parse(jsonStr) as Record<string, unknown>;

    const info: CarInfo = {
      name: (data.name as string) ?? carId,
      brand: (data.brand as string) ?? '',
      carClass: (data.class as string) ?? '',
      tags: Array.isArray(data.tags) ? data.tags as string[] : [],
      year: (data.year as number) ?? 0,
      description: (data.description as string) ?? '',
      bhp: (data.bhp as string) ?? '',
      torque: (data.torque as string) ?? '',
      weight: (data.weight as string) ?? '',
    };

    carInfoCache.set(carId, info);
    return info;
  } catch {
    carInfoCache.set(carId, null);
    return null;
  }
}

/**
 * HTTP mode: fetch car info from Vite dev server.
 */
async function resolveCarInfoHttp(carId: string): Promise<CarInfo | null> {
  try {
    const res = await fetch(`/__api/ac-car-info/${encodeURIComponent(carId)}`);
    if (!res.ok) {
      carInfoCache.set(carId, null);
      return null;
    }

    const data = await res.json() as Record<string, unknown>;

    const info: CarInfo = {
      name: (data.name as string) ?? carId,
      brand: (data.brand as string) ?? '',
      carClass: (data.class as string) ?? '',
      tags: Array.isArray(data.tags) ? data.tags as string[] : [],
      year: (data.year as number) ?? 0,
      description: (data.description as string) ?? '',
      bhp: (data.bhp as string) ?? '',
      torque: (data.torque as string) ?? '',
      weight: (data.weight as string) ?? '',
    };

    carInfoCache.set(carId, info);
    return info;
  } catch {
    carInfoCache.set(carId, null);
    return null;
  }
}
