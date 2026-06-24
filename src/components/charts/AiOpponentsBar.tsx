import React from 'react';
import type { ContentManagerMetadata } from '../../core/models/types';

interface Props {
  metadata: ContentManagerMetadata;
}

/**
 * Horizontal bar chart showing each AI opponent's level + aggression.
 * Color gradient from green (easy) to red (hard).
 */
export const AiOpponentsBar: React.FC<Props> = ({ metadata }) => {
  if (!metadata.carMetadata || metadata.carMetadata.size === 0) return null;

  // Collect AI opponents (skip player = car_0 typically)
  const opponents = Array.from(metadata.carMetadata.entries())
    .filter(([, meta]) => meta.aiLevel > 0)
    .sort((a, b) => b[1].aiLevel - a[1].aiLevel);

  if (opponents.length === 0) return null;

  const aiLevelColor = (level: number): string => {
    if (level >= 98) return '#D50000';
    if (level >= 95) return '#FF5722';
    if (level >= 90) return '#FF9800';
    if (level >= 85) return '#FFC107';
    return '#4CAF50';
  };

  /** Get flag emoji from nation code */
  const getFlag = (code?: string): string => {
    if (!code || code.length < 2) return '🏁';
    const cc = code.slice(0, 2).toUpperCase();
    // Map 3-letter to 2-letter for common codes
    const map: Record<string, string> = {
      MEX: 'MX', FIN: 'FI', GER: 'DE', ITA: 'IT', FRA: 'FR', GBR: 'GB',
      JPN: 'JP', BRA: 'BR', ESP: 'ES', AUS: 'AU', USA: 'US', CAN: 'CA',
      NED: 'NL', BEL: 'BE', SUI: 'CH', AUT: 'AT', POL: 'PL', RUS: 'RU',
      SWE: 'SE', NOR: 'NO', DEN: 'DK', POR: 'PT', ARG: 'AR', CHI: 'CL',
      KOR: 'KR', CHN: 'CN', IND: 'IN', RSA: 'ZA', NZL: 'NZ', IRE: 'IE',
    };
    const twoLetter = map[cc] ?? cc.slice(0, 2);
    try {
      return String.fromCodePoint(
        ...twoLetter.split('').map(c => 0x1f1e6 + c.charCodeAt(0) - 65)
      );
    } catch {
      return '🏁';
    }
  };

  return (
    <div className="chart-container">
      <h3>🤖 Oponentes IA ({opponents.length})</h3>
      <div style={{ maxHeight: 400, overflowY: 'auto', marginTop: 'var(--space-sm)' }}>
        {opponents.map(([idx, meta]) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            {/* Flag + Name */}
            <div style={{ width: 120, fontSize: '0.72rem', color: 'var(--text-secondary)', flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              <span style={{ marginRight: 4 }}>{getFlag(meta.nationCode)}</span>
              {meta.driverName || `IA ${idx}`}
            </div>

            {/* AI Level bar */}
            <div style={{ flex: 1, height: 16, borderRadius: 8, background: 'var(--bg-secondary)', position: 'relative', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 8,
                width: `${meta.aiLevel}%`,
                background: `linear-gradient(90deg, ${aiLevelColor(meta.aiLevel)}88, ${aiLevelColor(meta.aiLevel)})`,
                transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)',
              }} />
              {/* Aggression overlay */}
              {meta.aiAggression > 0 && (
                <div style={{
                  position: 'absolute', top: 0, left: 0,
                  height: '100%',
                  width: `${meta.aiAggression * 100}%`,
                  background: 'rgba(255,255,255,0.15)',
                  borderRadius: 8,
                }} />
              )}
            </div>

            {/* Level number */}
            <div className="mono" style={{ width: 28, fontSize: '0.72rem', fontWeight: 700, color: aiLevelColor(meta.aiLevel), textAlign: 'right' }}>
              {meta.aiLevel}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
