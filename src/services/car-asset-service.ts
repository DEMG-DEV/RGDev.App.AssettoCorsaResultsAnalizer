/**
 * Car Asset Service — loads car preview images and info from AC install
 * via Vite dev server endpoints. No user interaction needed.
 */

import type { CarImages, CarInfo } from '../core/models/types';

/** Cache for resolved images */
const imageCache = new Map<string, CarImages>();
const carInfoCache = new Map<string, CarInfo | null>();

/** Whether AC root was found by the server */
let acAvailable = false;

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
 * Resolve car preview image URL via the Vite dev server.
 * Returns an HTTP URL that the browser can render directly.
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

  // Build the preview URL — the server does the fallback logic
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
 * Load car info from ui_car.json via the Vite dev server.
 */
export async function resolveCarInfo(carId: string): Promise<CarInfo | null> {
  const cached = carInfoCache.get(carId);
  if (cached !== undefined) return cached;

  if (!acAvailable) {
    carInfoCache.set(carId, null);
    return null;
  }

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
