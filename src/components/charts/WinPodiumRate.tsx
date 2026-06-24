import React from 'react';
import type { PodiumRates } from '../../core/analyzers/history-analyzer';

interface Props {
  rates: PodiumRates;
}

/**
 * Horizontal progress bars showing win/podium/DNF rates
 * with animated fills and gold/silver/bronze colors.
 */
export const WinPodiumRate: React.FC<Props> = ({ rates }) => {
  if (rates.totalRaces === 0) return null;

  const bars = [
    { label: '🥇 Victorias (P1)', count: rates.wins, rate: rates.winRate, color: '#FFD700', bg: '#FFD70022' },
    { label: '🥈 Segundo (P2)', count: rates.p2, rate: rates.p2Rate, color: '#C0C0C0', bg: '#C0C0C022' },
    { label: '🥉 Tercero (P3)', count: rates.p3, rate: rates.p3Rate, color: '#CD7F32', bg: '#CD7F3222' },
    { label: '❌ DNF', count: rates.dnfs, rate: rates.dnfRate, color: '#FF5722', bg: '#FF572222' },
  ];

  return (
    <div className="chart-container">
      <h3>🏆 Tasa de podio</h3>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 'var(--space-md)' }}>
        {rates.totalRaces} carrera{rates.totalRaces !== 1 ? 's' : ''} en total
      </div>

      {bars.map((bar) => (
        <div key={bar.label} style={{ marginBottom: 'var(--space-md)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{bar.label}</span>
            <span className="mono" style={{ fontSize: '0.8rem', fontWeight: 700, color: bar.color }}>
              {bar.count} ({(bar.rate * 100).toFixed(0)}%)
            </span>
          </div>
          <div style={{ height: 18, borderRadius: 9, background: bar.bg, overflow: 'hidden', position: 'relative' }}>
            <div style={{
              height: '100%', borderRadius: 9,
              width: `${bar.rate * 100}%`,
              background: `linear-gradient(90deg, ${bar.color}88, ${bar.color})`,
              transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)',
              minWidth: bar.rate > 0 ? 8 : 0,
            }} />
          </div>
        </div>
      ))}
    </div>
  );
};
