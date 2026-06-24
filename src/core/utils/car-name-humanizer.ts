/**
 * Humanizes raw car model IDs into readable names.
 * Used as fallback when ui_car.json is not available.
 */

/** Known prefixes to strip from car IDs */
const PREFIXES_TO_STRIP = [
  'ks_', 'ac_', 'rss_', 'acfl_', 'actk_', 'acfsk_',
  'ac_legends_', 'ac_friends_',
];

/**
 * Convert a car model ID to a human-readable name.
 * E.g., "ks_toyota_gt86" → "Toyota GT86"
 */
export function humanizeCarId(carId: string): string {
  let name = carId;

  // Strip known prefixes
  for (const prefix of PREFIXES_TO_STRIP) {
    if (name.startsWith(prefix)) {
      name = name.slice(prefix.length);
      break;
    }
  }

  // Replace underscores with spaces, then title-case
  return name
    .split('_')
    .map(word => {
      // Keep known abbreviations uppercase
      if (/^(gt\d*|lm|dtm|wrc|wtcc|f\d+|bmw|amg|rs|rsr|evo|mk\w+|ae\d+|gto|gt[a-z]?)$/i.test(word)) {
        return word.toUpperCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

/**
 * Extract a track display name from track ID and config.
 * E.g., venue="rt_suzuka", course="suzukaeast" → "RT Suzuka — Suzuka East"
 */
export function humanizeTrackName(venue: string, course?: string): string {
  let name = venue;

  // Strip common prefixes
  for (const prefix of ['ks_', 'rt_', 'rj_']) {
    if (name.startsWith(prefix)) {
      name = name.slice(prefix.length);
      break;
    }
  }

  // Replace underscores with spaces and title-case
  name = name
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');

  if (course && course.length > 0) {
    const configName = course
      .split('_')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
    name += ` — ${configName}`;
  }

  return name;
}
