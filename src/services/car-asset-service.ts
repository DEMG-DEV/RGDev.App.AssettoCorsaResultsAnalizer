/**
 * Car Asset Service — loads car preview images.
 *
 * Resolution order:
 * 1. Static catalog (official AC cars → Wikimedia Commons URLs)
 * 2. Wikipedia API search (any car → search by humanized car name)
 * 3. Null (shows placeholder initials in the UI)
 */

import type { CarImages } from '../core/models/types';
import { getOnlineCarImageUrl } from './car-image-catalog';
import { humanizeCarId } from '../core/utils/car-name-humanizer';

/** Cache for resolved images (avoids repeated API calls) */
const imageCache = new Map<string, CarImages>();

/** Cache for Wikipedia search results (persists across renders) */
const wikiSearchCache = new Map<string, string | null>();

/**
 * Search Wikipedia for a car image by its humanized name.
 * Uses the Wikipedia API to find the main article image.
 *
 * Example: "Toyota GT86" → Wikipedia article thumbnail URL
 */
export async function searchWikipediaImage(carName: string): Promise<string | null> {
  // Check cache first
  if (wikiSearchCache.has(carName)) {
    return wikiSearchCache.get(carName)!;
  }

  try {
    const searchUrl = `https://en.wikipedia.org/w/api.php?` +
      `action=query&generator=search&gsrsearch=${encodeURIComponent(carName + ' car')}&gsrlimit=3` +
      `&prop=pageimages&piprop=thumbnail&pithumbsize=640&format=json&origin=*`;

    const res = await fetch(searchUrl);
    if (!res.ok) {
      wikiSearchCache.set(carName, null);
      return null;
    }

    const data = await res.json();
    const pages = data?.query?.pages;
    if (!pages) {
      wikiSearchCache.set(carName, null);
      return null;
    }

    // Get the first page with a thumbnail
    const page = Object.values(pages).find(
      (p: any) => p.thumbnail?.source
    ) as any;

    const thumbUrl = page?.thumbnail?.source ?? null;
    wikiSearchCache.set(carName, thumbUrl);
    return thumbUrl;
  } catch {
    wikiSearchCache.set(carName, null);
    return null;
  }
}

/**
 * Resolve car preview image URL.
 *
 * For official AC cars: instant lookup in the static catalog.
 * For any car without catalog entry: async Wikipedia API search.
 */
export async function resolveCarPreview(
  carId: string,
  _skinName?: string,
): Promise<CarImages> {
  const cacheKey = carId;
  const cached = imageCache.get(cacheKey);
  if (cached) return cached;

  // 1. Try static catalog (official cars)
  let imageUrl = getOnlineCarImageUrl(carId);

  // 2. Always also try Wikipedia — use as primary or fallback
  const carName = humanizeCarId(carId);
  const wikiUrl = await searchWikipediaImage(carName);

  // Prefer catalog URL, but use Wikipedia if catalog is missing
  if (!imageUrl && wikiUrl) {
    imageUrl = wikiUrl;
  }

  const result: CarImages = {
    previewUrl: imageUrl,
    liveryUrl: null,
    isLocalAsset: false,
    // Store the Wikipedia URL as fallback even when catalog URL exists
    fallbackUrl: wikiUrl && wikiUrl !== imageUrl ? wikiUrl : null,
  };

  imageCache.set(cacheKey, result);
  return result;
}
