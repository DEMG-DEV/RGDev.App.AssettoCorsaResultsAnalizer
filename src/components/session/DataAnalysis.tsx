import React, { useMemo } from 'react';
import type { Session } from '../../core/models/types';
import { formatLapTime, formatSectorTime } from '../../core/utils/time-formatter';
import { computeParticipantStats, computeSessionBestSectors, getSessionBestLap } from '../../core/analyzers/session-analyzer';

interface Props {
  session: Session;
}

interface Insight {
  icon: string;
  title: string;
  text: string;
  type: 'positive' | 'neutral' | 'negative' | 'info';
}

export const DataAnalysis: React.FC<Props> = ({ session }) => {
  const insights = useMemo(() => computeInsights(session), [session]);

  if (insights.length === 0) return null;

  const typeColors = {
    positive: 'var(--color-faster)',
    negative: 'var(--color-slower)',
    neutral: 'var(--text-secondary)',
    info: 'var(--text-accent)',
  };

  return (
    <div className="chart-container">
      <h3>🧠 Análisis de rendimiento</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-md)', marginTop: 'var(--space-md)' }}>
        {insights.map((insight, i) => (
          <div
            key={i}
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-md)',
              borderLeft: `3px solid ${typeColors[insight.type]}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: '1.1rem' }}>{insight.icon}</span>
              <span style={{ fontWeight: 600, fontSize: '0.85rem', color: typeColors[insight.type] }}>
                {insight.title}
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
              {insight.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

function computeInsights(session: Session): Insight[] {
  const insights: Insight[] = [];
  const bestLapData = getSessionBestLap(session);
  const sessionBestSectors = computeSessionBestSectors(session);

  if (!bestLapData || session.participants.length === 0) return insights;

  // === 1. Best Lap Info ===
  insights.push({
    icon: '🏆',
    title: 'Mejor vuelta de la sesión',
    text: `${bestLapData.participant.drivers[0]?.name ?? 'N/A'} marcó ${formatLapTime(bestLapData.lap.timeMs)} en la vuelta ${bestLapData.lap.lapNumber}. ${
      bestLapData.lap.sectors.length > 0
        ? `Sectores: ${bestLapData.lap.sectors.map((s, i) => `S${i + 1} ${formatSectorTime(s.timeMs)}`).join(' | ')}.`
        : ''
    }`,
    type: 'positive',
  });

  // === 2. Theoretical Best Lap ===
  if (sessionBestSectors.length > 0 && sessionBestSectors.every(s => s < Infinity)) {
    const theoreticalBest = sessionBestSectors.reduce((a, b) => a + b, 0);
    const diff = bestLapData.lap.timeMs - theoreticalBest;
    insights.push({
      icon: '⚡',
      title: 'Vuelta teórica ideal',
      text: `Combinando los mejores sectores de todos los pilotos: ${formatLapTime(theoreticalBest)} (${(diff / 1000).toFixed(3)}s más rápida que la mejor real). Sectores: ${sessionBestSectors.map((s, i) => `S${i + 1} ${formatSectorTime(s)}`).join(' | ')}.`,
      type: 'info',
    });
  }

  // === 3. Consistency Analysis ===
  const allStats = session.participants.map(p => ({
    name: p.drivers[0]?.name ?? '',
    stats: computeParticipantStats(p),
  }));

  const withConsistency = allStats.filter(s => s.stats.consistency > 0);
  if (withConsistency.length > 0) {
    const mostConsistent = withConsistency.reduce((a, b) =>
      a.stats.consistency < b.stats.consistency ? a : b
    );
    const leastConsistent = withConsistency.reduce((a, b) =>
      a.stats.consistency > b.stats.consistency ? a : b
    );

    insights.push({
      icon: '🎯',
      title: 'Consistencia',
      text: `Piloto más consistente: ${mostConsistent.name} (±${(mostConsistent.stats.consistency / 1000).toFixed(3)}s). ${
        withConsistency.length > 1
          ? `Menos consistente: ${leastConsistent.name} (±${(leastConsistent.stats.consistency / 1000).toFixed(3)}s).`
          : ''
      }`,
      type: 'positive',
    });
  }

  // === 4. Cut Analysis ===
  const totalCuts = allStats.reduce((s, a) => s + a.stats.totalCuts, 0);
  if (totalCuts > 0) {
    const mostCuts = allStats.reduce((a, b) =>
      a.stats.totalCuts > b.stats.totalCuts ? a : b
    );
    insights.push({
      icon: '⚠️',
      title: 'Cortes de pista',
      text: `Total de cortes en la sesión: ${totalCuts}. El piloto con más cortes: ${mostCuts.name} con ${mostCuts.stats.totalCuts} cortes, invalidando ${mostCuts.stats.lapTimes.length - mostCuts.stats.validLapCount} vueltas.`,
      type: totalCuts > 5 ? 'negative' : 'neutral',
    });
  }

  // === 5. Sector Weakness ===
  if (session.participants.length > 0) {
    const firstDriver = session.participants[0]!;
    const driverStats = computeParticipantStats(firstDriver);

    if (driverStats.bestSectors.length > 0 && sessionBestSectors.length > 0) {
      let weakestSector = 0;
      let maxDiff = 0;

      for (let i = 0; i < driverStats.bestSectors.length; i++) {
        const diff = (driverStats.bestSectors[i] ?? 0) - (sessionBestSectors[i] ?? 0);
        if (diff > maxDiff) {
          maxDiff = diff;
          weakestSector = i;
        }
      }

      if (maxDiff > 0) {
        insights.push({
          icon: '📉',
          title: `Sector débil de ${firstDriver.drivers[0]?.name ?? 'piloto'}`,
          text: `El Sector ${weakestSector + 1} es donde pierde más tiempo: ${(maxDiff / 1000).toFixed(3)}s respecto al mejor de la sesión. Mejor S${weakestSector + 1}: ${formatSectorTime(driverStats.bestSectors[weakestSector] ?? 0)} vs sesión: ${formatSectorTime(sessionBestSectors[weakestSector] ?? 0)}.`,
          type: 'negative',
        });
      }
    }
  }

  // === 6. Pace Improvement ===
  if (session.participants.length > 0) {
    const p = session.participants[0]!;
    const validLaps = p.laps.filter(l => l.isValid && l.timeMs > 0);

    if (validLaps.length >= 3) {
      const firstThird = validLaps.slice(0, Math.ceil(validLaps.length / 3));
      const lastThird = validLaps.slice(-Math.ceil(validLaps.length / 3));

      const avgFirst = firstThird.reduce((s, l) => s + l.timeMs, 0) / firstThird.length;
      const avgLast = lastThird.reduce((s, l) => s + l.timeMs, 0) / lastThird.length;
      const improvement = avgFirst - avgLast;

      if (Math.abs(improvement) > 100) { // More than 0.1s difference
        insights.push({
          icon: improvement > 0 ? '📈' : '📉',
          title: 'Evolución del ritmo',
          text: improvement > 0
            ? `${p.drivers[0]?.name ?? 'Piloto'} mejoró ${(improvement / 1000).toFixed(3)}s de ritmo promedio entre el primer y último tercio de la sesión. Promedio inicial: ${formatLapTime(avgFirst)} → final: ${formatLapTime(avgLast)}.`
            : `${p.drivers[0]?.name ?? 'Piloto'} perdió ${(Math.abs(improvement) / 1000).toFixed(3)}s de ritmo promedio. Posible degradación de neumáticos. Promedio inicial: ${formatLapTime(avgFirst)} → final: ${formatLapTime(avgLast)}.`,
          type: improvement > 0 ? 'positive' : 'negative',
        });
      }
    }
  }

  // === 7. Gaps in Race ===
  if (session.type === 'race' && session.participants.length >= 2) {
    const winner = session.participants[0]!;
    const second = session.participants[1]!;
    const gap = (second.gapToLeaderMs ?? 0);

    if (gap > 0) {
      insights.push({
        icon: '🏁',
        title: 'Brecha del ganador',
        text: `${winner.drivers[0]?.name ?? 'P1'} ganó con ${(gap / 1000).toFixed(3)}s de ventaja sobre ${second.drivers[0]?.name ?? 'P2'}. ${
          gap < 1000 ? '¡Una victoria muy cerrada!' : gap > 10000 ? 'Una victoria dominante.' : ''
        }`,
        type: 'info',
      });
    }
  }

  // === 8. DNF/DQ Count ===
  const dnfCount = session.participants.filter(p => p.finishStatus === 'dnf').length;
  const dqCount = session.participants.filter(p => p.finishStatus === 'dq').length;
  if (dnfCount > 0 || dqCount > 0) {
    insights.push({
      icon: '🚧',
      title: 'No terminaron',
      text: `${dnfCount > 0 ? `${dnfCount} piloto(s) no terminaron (DNF).` : ''} ${dqCount > 0 ? `${dqCount} piloto(s) descalificados.` : ''} Tasa de finalización: ${((session.participants.length - dnfCount - dqCount) / session.participants.length * 100).toFixed(0)}%.`,
      type: 'negative',
    });
  }

  // === 9. Weather Impact ===
  if (session.cmMetadata?.temperatureAmbient) {
    const temp = session.cmMetadata.temperatureAmbient;
    const roadTemp = session.cmMetadata.temperatureRoad;
    insights.push({
      icon: '🌡️',
      title: 'Condiciones',
      text: `Temperatura ambiente: ${temp}°C${roadTemp ? `, pista: ${roadTemp}°C` : ''}${session.cmMetadata.weatherName ? `. Clima: ${session.cmMetadata.weatherName}` : ''}. ${
        temp > 35 ? 'Temperaturas altas pueden causar mayor degradación de neumáticos.' :
        temp < 15 ? 'Temperaturas bajas pueden reducir el agarre.' : ''
      }`,
      type: 'info',
    });
  }

  return insights;
}
