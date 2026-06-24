import React from 'react';
import type { ContentManagerMetadata } from '../../core/models/types';
import { es } from '../../i18n/es';

interface Props {
  metadata: ContentManagerMetadata;
}

/** Map CM weather names to emoji + label */
function parseWeather(name?: string): { icon: string; label: string } {
  if (!name) return { icon: '🌤️', label: es.weather.clear };
  const lower = name.toLowerCase();
  if (lower.includes('rain') || lower.includes('thunder')) return { icon: '🌧️', label: es.weather.rain };
  if (lower.includes('fog') || lower.includes('mist')) return { icon: '🌫️', label: es.weather.fog };
  if (lower.includes('cloud') || lower.includes('overcast')) return { icon: '☁️', label: es.weather.clouds };
  if (lower.includes('clear') || lower.includes('sun')) return { icon: '☀️', label: es.weather.clear };
  // CM uses numbers like "3_clear", "6_mid_clouds"
  if (/\d+_clear/.test(lower)) return { icon: '☀️', label: es.weather.clear };
  if (/\d+.*cloud/.test(lower)) return { icon: '⛅', label: es.weather.clouds };
  if (/\d+.*rain/.test(lower)) return { icon: '🌧️', label: es.weather.rain };
  return { icon: '🌤️', label: name.replace(/_/g, ' ') };
}

/**
 * Visual weather card with iconography, temperature gauges, and conditions.
 */
export const WeatherCard: React.FC<Props> = ({ metadata }) => {
  const weather = parseWeather(metadata.weatherName);
  const ambient = metadata.temperatureAmbient;
  const road = metadata.temperatureRoad;

  if (!ambient && !road && !metadata.weatherName) return null;

  // Temperature gauge fill (0°C = 0%, 50°C = 100%)
  const tempFill = (temp: number) => Math.min(100, Math.max(0, (temp / 50) * 100));
  const tempColor = (temp: number) => {
    if (temp > 35) return '#FF5722';
    if (temp > 25) return '#FF9800';
    if (temp > 15) return '#4CAF50';
    return '#2196F3';
  };

  return (
    <div className="chart-container" style={{ textAlign: 'center' }}>
      <h3>🌡️ Condiciones</h3>

      {/* Big weather icon */}
      <div style={{ fontSize: '3.5rem', marginBottom: 'var(--space-sm)', lineHeight: 1 }}>
        {weather.icon}
      </div>
      <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: 'var(--space-md)' }}>
        {weather.label}
      </div>

      {/* Temperature gauges */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-xl)', marginTop: 'var(--space-sm)' }}>
        {ambient != null && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>{es.weather.ambient}</div>
            <div style={{
              width: 48, height: 120, borderRadius: 24, border: '2px solid var(--border-subtle)',
              position: 'relative', overflow: 'hidden', margin: '0 auto', background: 'var(--bg-secondary)',
            }}>
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                height: `${tempFill(ambient)}%`,
                background: `linear-gradient(to top, ${tempColor(ambient)}, ${tempColor(ambient)}88)`,
                borderRadius: '0 0 22px 22px',
                transition: 'height 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
              }} />
            </div>
            <div className="mono" style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: 6, color: tempColor(ambient) }}>
              {ambient}°C
            </div>
          </div>
        )}
        {road != null && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>{es.weather.road}</div>
            <div style={{
              width: 48, height: 120, borderRadius: 24, border: '2px solid var(--border-subtle)',
              position: 'relative', overflow: 'hidden', margin: '0 auto', background: 'var(--bg-secondary)',
            }}>
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                height: `${tempFill(road)}%`,
                background: `linear-gradient(to top, ${tempColor(road)}, ${tempColor(road)}88)`,
                borderRadius: '0 0 22px 22px',
                transition: 'height 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
              }} />
            </div>
            <div className="mono" style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: 6, color: tempColor(road) }}>
              {road}°C
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
