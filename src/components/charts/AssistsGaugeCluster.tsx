import React from 'react';
import type { AssistSettings } from '../../core/models/types';
import { es } from '../../i18n/es';

interface Props {
  assists: AssistSettings;
}

/** Small arc gauge SVG for a 0-2 level value */
const LevelGauge: React.FC<{ label: string; value: number; max?: number }> = ({ label, value, max = 2 }) => {
  const pct = max > 0 ? value / max : 0;
  const color = value === 0 ? 'var(--color-faster)' : value >= max ? 'var(--color-slower)' : 'var(--text-accent)';
  const radius = 28;
  const circumference = Math.PI * radius; // half-circle
  const offset = circumference * (1 - pct);

  return (
    <div style={{ textAlign: 'center', minWidth: 72 }}>
      <svg width={72} height={48} viewBox="0 0 72 48">
        {/* Background arc */}
        <path
          d="M 8 44 A 28 28 0 0 1 64 44"
          fill="none"
          stroke="var(--border-subtle)"
          strokeWidth={5}
          strokeLinecap="round"
        />
        {/* Filled arc */}
        <path
          d="M 8 44 A 28 28 0 0 1 64 44"
          fill="none"
          stroke={color}
          strokeWidth={5}
          strokeLinecap="round"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.4,0,0.2,1)' }}
        />
        <text x="36" y="40" textAnchor="middle" fill={color} fontSize="14" fontWeight="700" fontFamily="var(--font-mono)">
          {value}
        </text>
      </svg>
      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: -2 }}>{label}</div>
    </div>
  );
};

/** Toggle indicator (on/off) */
const ToggleIndicator: React.FC<{ label: string; on: boolean }> = ({ label, on }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
    <div style={{
      width: 32, height: 18, borderRadius: 9,
      background: on ? 'var(--color-slower)' : 'var(--color-faster)',
      position: 'relative', transition: 'background 0.3s ease',
    }}>
      <div style={{
        width: 14, height: 14, borderRadius: '50%',
        background: '#fff',
        position: 'absolute', top: 2,
        left: on ? 16 : 2,
        transition: 'left 0.3s cubic-bezier(0.4,0,0.2,1)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }} />
    </div>
    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{label}</span>
  </div>
);

/** Percentage bar */
const PercentBar: React.FC<{ label: string; value: number; max?: number; unit?: string }> = ({ label, value, max = 100, unit = '%' }) => {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: 3 }}>
        <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
        <span className="mono" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{value}{unit}</span>
      </div>
      <div style={{ height: 6, borderRadius: 3, background: 'var(--bg-secondary)', overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 3,
          width: `${pct}%`,
          background: pct > 70 ? 'var(--color-slower)' : pct > 30 ? 'var(--text-accent)' : 'var(--color-faster)',
          transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)',
        }} />
      </div>
    </div>
  );
};

/**
 * Collection of gauge and toggle indicators showing assist configuration.
 */
export const AssistsGaugeCluster: React.FC<Props> = ({ assists }) => {
  return (
    <div className="chart-container">
      <h3>🎮 {es.assists.title}</h3>

      {/* Gauges row */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-md)', flexWrap: 'wrap' }}>
        <LevelGauge label={es.assists.tc} value={assists.tractionControl} max={2} />
        <LevelGauge label={es.assists.abs} value={assists.abs} max={2} />
      </div>

      {/* Percentage bars */}
      <PercentBar label={es.assists.sc} value={assists.stabilityControl} />
      <PercentBar label="Daño" value={assists.damage} />
      <PercentBar label="Desgaste" value={assists.tyreWear * 100} />

      {/* Toggles */}
      <div style={{ marginTop: 'var(--space-sm)' }}>
        <ToggleIndicator label={es.assists.autoShifter} on={assists.autoShifter} />
        <ToggleIndicator label={es.assists.autoClutch} on={assists.autoClutch} />
        <ToggleIndicator label={es.assists.idealLine} on={assists.idealLine} />
      </div>
    </div>
  );
};
