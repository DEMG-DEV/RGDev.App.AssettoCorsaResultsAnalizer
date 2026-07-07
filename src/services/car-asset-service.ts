/**
 * Car Asset Service — loads car preview images from online catalog.
 *
 * Uses a static catalog of Wikimedia Commons URLs for all official
 * Assetto Corsa cars (base game + DLCs).
 */

import type { CarImages } from '../core/models/types';
import { getOnlineCarImageUrl } from './car-image-catalog';

/** Cache for resolved images */
const imageCache = new Map<string, CarImages>();

/**
 * Resolve car preview image URL from the online catalog.
 */
export async function resolveCarPreview(
  carId: string,
  _skinName?: string,
): Promise<CarImages> {
  const cacheKey = carId;
  const cached = imageCache.get(cacheKey);
  if (cached) return cached;

  const onlineUrl = getOnlineCarImageUrl(carId);

  const result: CarImages = {
    previewUrl: onlineUrl,
    liveryUrl: null,
    isLocalAsset: false,
  };

  imageCache.set(cacheKey, result);
  return result;
}
