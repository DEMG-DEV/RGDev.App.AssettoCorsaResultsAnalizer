/**
 * Content Manager metadata parser.
 * Parses __raceIni (INI string) and __quickDrive (JSON string) from CM session files.
 */

import type { ContentManagerMetadata, CarMetadata } from '../models/types';

/**
 * Parse a simple INI string into sections → key/value maps.
 */
function parseIni(iniString: string): Map<string, Map<string, string>> {
  const sections = new Map<string, Map<string, string>>();
  let currentSection = '';

  const lines = iniString.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith(';') || trimmed.startsWith('#')) continue;

    const sectionMatch = trimmed.match(/^\[(.+)\]$/);
    if (sectionMatch) {
      currentSection = sectionMatch[1]!;
      if (!sections.has(currentSection)) {
        sections.set(currentSection, new Map());
      }
      continue;
    }

    const kvMatch = trimmed.match(/^([^=]+)=(.*)$/);
    if (kvMatch && currentSection) {
      const section = sections.get(currentSection);
      if (section) {
        section.set(kvMatch[1]!.trim(), kvMatch[2]!.trim());
      }
    }
  }

  return sections;
}

/**
 * Parse CM-specific metadata from __raceIni and __quickDrive fields.
 */
export function parseCmMetadata(
  raceIniStr?: string,
  quickDriveStr?: string
): ContentManagerMetadata | undefined {
  if (!raceIniStr && !quickDriveStr) return undefined;

  const metadata: ContentManagerMetadata = {
    carMetadata: new Map(),
  };

  // Parse __raceIni
  if (raceIniStr) {
    const sections = parseIni(raceIniStr);

    // Weather
    const weather = sections.get('WEATHER');
    if (weather) {
      metadata.weatherName = weather.get('NAME') ?? undefined;
    }

    // Temperature
    const temp = sections.get('TEMPERATURE');
    if (temp) {
      metadata.temperatureAmbient = parseFloat(temp.get('AMBIENT') ?? '0') || undefined;
      metadata.temperatureRoad = parseFloat(temp.get('ROAD') ?? '0') || undefined;
    }

    // Per-car sections: [CAR_0], [CAR_1], etc.
    for (const [sectionName, values] of sections) {
      const carMatch = sectionName.match(/^CAR_(\d+)$/);
      if (!carMatch) continue;

      const carIndex = parseInt(carMatch[1]!, 10);
      const carMeta: CarMetadata = {
        model: values.get('MODEL') ?? '',
        skin: values.get('SKIN') ?? '',
        driverName: values.get('DRIVER_NAME') ?? '',
        nationality: values.get('NATIONALITY') ?? '',
        nationCode: values.get('NATION_CODE') ?? '',
        aiLevel: parseFloat(values.get('AI_LEVEL') ?? '0'),
        aiAggression: parseFloat(values.get('AI_AGGRESSION') ?? '0'),
        ballast: parseFloat(values.get('BALLAST') ?? '0'),
        restrictor: parseFloat(values.get('RESTRICTOR') ?? '0'),
      };
      metadata.carMetadata.set(carIndex, carMeta);
    }
  }

  // Parse __quickDrive
  if (quickDriveStr) {
    try {
      const qd = JSON.parse(quickDriveStr) as Record<string, unknown>;

      // Session date from dtv
      if (typeof qd.dtv === 'string') {
        metadata.sessionDate = new Date(qd.dtv);
      }

      // Session mode
      if (typeof qd.Mode === 'string') {
        const modeMatch = (qd.Mode as string).match(/QuickDrive_(\w+)/);
        metadata.sessionMode = modeMatch ? modeMatch[1] : undefined;
      }

      // Assists
      if (typeof qd.AssistsData === 'string') {
        try {
          const assists = JSON.parse(qd.AssistsData) as Record<string, unknown>;
          metadata.assists = {
            idealLine: Boolean(assists.IdealLine),
            autoBlip: Boolean(assists.AutoBlip),
            stabilityControl: Number(assists.StabilityControl) || 0,
            autoBrake: Boolean(assists.AutoBrake),
            autoShifter: Boolean(assists.AutoShifter),
            autoClutch: Boolean(assists.AutoClutch),
            abs: Number(assists.Abs) || 0,
            tractionControl: Number(assists.TractionControl) || 0,
            damage: Number(assists.Damage) || 0,
            tyreWear: Number(assists.TyreWear) || 0,
            fuelConsumption: Number(assists.FuelConsumption) || 0,
            tyreBlankets: Boolean(assists.TyreBlankets),
          };
        } catch { /* ignore parse error on assists */ }
      }
    } catch { /* ignore parse error on quickDrive */ }
  }

  return metadata;
}
