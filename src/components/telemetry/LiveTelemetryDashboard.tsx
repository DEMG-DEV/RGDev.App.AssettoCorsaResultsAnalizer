/**
 * LiveTelemetryDashboard — Main dashboard component for live telemetry.
 * Orchestrates connection, data flow, and layout of all telemetry widgets.
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { useTelemetryStore } from '../../stores/telemetry-store';
import {
  startTelemetry,
  stopTelemetry,
  onTelemetrySnapshot,
  onTelemetryStaticInfo,
  onLapCompleted,
  isTauriEnvironment,
} from '../../services/telemetry-service';
import { SpeedGauge } from './SpeedGauge';
import { RpmGauge } from './RpmGauge';
import { GForcePlot } from './GForcePlot';
import { TyreMonitor } from './TyreMonitor';
import { PedalBars } from './PedalBars';
import { LapTimesLive } from './LapTimesLive';
import { FuelIndicator } from './FuelIndicator';
import { ConnectionStatus } from './ConnectionStatus';
import { TelemetryMiniMap } from './TelemetryMiniMap';
import type { LiveLapTime } from '../../core/models/telemetry-types';

export const LiveTelemetryDashboard: React.FC = () => {
  const {
    isConnected,
    isRecording,
    error,
    currentSnapshot,
    staticInfo,
    lapHistory,
    gForceHistory,
    saveSessionEnabled,
    setConnected,
    setRecording,
    setSaveSessionEnabled,
    setError,
    updateSnapshot,
    setStaticInfo,
    addLap,
    resetTelemetry,
  } = useTelemetryStore();

  const unlistenersRef = useRef<Array<() => void>>([]);
  const lastLapCountRef = useRef(0);

  /** Establishes connection to AC telemetry */
  const handleConnect = useCallback(async () => {
    if (!isTauriEnvironment()) {
      setError('La telemetría solo está disponible en modo escritorio (Tauri)');
      return;
    }

    setError(null);
    try {
      await startTelemetry();
      setConnected(true);
      setRecording(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      setConnected(false);
    }
  }, [setConnected, setRecording, setError]);

  /** Disconnects from AC telemetry */
  const handleDisconnect = useCallback(async () => {
    try {
      await stopTelemetry(saveSessionEnabled);
    } catch {
      // Ignore errors during disconnect
    }
    resetTelemetry();
  }, [resetTelemetry, saveSessionEnabled]);

  // Set up event listeners
  useEffect(() => {
    const setupListeners = async () => {
      if (!isTauriEnvironment()) return;

      const unlistenSnapshot = await onTelemetrySnapshot((snapshot) => {
        updateSnapshot(snapshot);

        // Check if connected by session status (2 = LIVE)
        if (snapshot.sessionStatus === 2) {
          setConnected(true);
        }
      });

      const unlistenStatic = await onTelemetryStaticInfo((info) => {
        setStaticInfo(info);
      });

      const unlistenLap = await onLapCompleted((snapshot) => {
        if (snapshot.lastTimeMs > 0 && snapshot.completedLaps > lastLapCountRef.current) {
          const lap: LiveLapTime = {
            lapNumber: snapshot.completedLaps,
            timeMs: snapshot.lastTimeMs,
            isBest: snapshot.lastTimeMs === snapshot.bestTimeMs,
            isImprovement: snapshot.lastTimeMs <= snapshot.bestTimeMs,
          };
          addLap(lap);
          lastLapCountRef.current = snapshot.completedLaps;
        }
      });

      unlistenersRef.current = [unlistenSnapshot, unlistenStatic, unlistenLap];
    };

    setupListeners();

    return () => {
      unlistenersRef.current.forEach((fn) => fn());
      unlistenersRef.current = [];
    };
  }, [updateSnapshot, setConnected, setStaticInfo, addLap]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isRecording) {
        stopTelemetry(saveSessionEnabled).catch(() => {});
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const snap = currentSnapshot;
  const isTauri = isTauriEnvironment();

  // Not connected — show waiting screen
  if (!isConnected || !snap) {
    return (
      <div className="telemetry-dashboard">
        {!isTauri && (
          <div className="telemetry-web-warning">
            <p>⚠️ La telemetría en vivo solo está disponible en la versión de escritorio.</p>
            <p className="text-secondary">
              Descarga la app de escritorio para conectar con Assetto Corsa.
            </p>
          </div>
        )}
        <ConnectionStatus
          isConnected={isConnected}
          isRecording={isRecording}
          error={error}
          carModel={staticInfo?.carModel}
          track={staticInfo?.track}
          saveSessionEnabled={saveSessionEnabled}
          onConnect={handleConnect}
          onDisconnect={handleDisconnect}
          onToggleSave={setSaveSessionEnabled}
        />
      </div>
    );
  }

  // Connected — show full dashboard
  return (
    <div className="telemetry-dashboard">
      {/* Connection bar */}
      <ConnectionStatus
        isConnected={isConnected}
        isRecording={isRecording}
        error={error}
        carModel={staticInfo?.carModel}
        track={staticInfo?.track}
        saveSessionEnabled={saveSessionEnabled}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
        onToggleSave={setSaveSessionEnabled}
      />

      {/* Main dashboard grid */}
      <div className="telemetry-grid">
        {/* Row 1: Gauges */}
        <div className="telemetry-row telemetry-row-gauges">
          <SpeedGauge speed={snap.speedKmh} />
          <RpmGauge rpms={snap.rpms} maxRpm={snap.maxRpm} gear={snap.gear} />
          <PedalBars gas={snap.gas} brake={snap.brake} clutch={snap.clutch} />
          <GForcePlot
            current={{ lateral: snap.gForceLateral, longitudinal: snap.gForceLongitudinal }}
            history={gForceHistory}
          />
          <TelemetryMiniMap
            normalizedPosition={snap.normalizedCarPosition}
            position={snap.position}
            completedLaps={snap.completedLaps}
            isInPit={snap.isInPit}
          />
        </div>

        {/* Row 2: Tyres + Fuel + Lap Times */}
        <div className="telemetry-row telemetry-row-data">
          <TyreMonitor
            temps={snap.tyreTemp}
            wear={snap.tyreWear}
            pressure={snap.tyrePressure}
          />
          <div className="telemetry-column">
            <FuelIndicator
              fuel={snap.fuel}
              maxFuel={snap.maxFuel}
            />
            {/* Extra data chips */}
            <div className="telemetry-chips">
              <div className="telem-chip">
                <span className="chip-label">Aire</span>
                <span className="chip-value">{snap.airTemp.toFixed(0)}°C</span>
              </div>
              <div className="telem-chip">
                <span className="chip-label">Pista</span>
                <span className="chip-value">{snap.roadTemp.toFixed(0)}°C</span>
              </div>
              {snap.tc > 0 && (
                <div className="telem-chip chip-active">
                  <span className="chip-label">TC</span>
                  <span className="chip-value">{snap.tc.toFixed(0)}</span>
                </div>
              )}
              {snap.abs > 0 && (
                <div className="telem-chip chip-active">
                  <span className="chip-label">ABS</span>
                  <span className="chip-value">{snap.abs.toFixed(0)}</span>
                </div>
              )}
              {snap.drs > 0 && (
                <div className="telem-chip chip-drs">
                  <span className="chip-label">DRS</span>
                </div>
              )}
              {snap.pitLimiter && (
                <div className="telem-chip chip-pit">
                  <span className="chip-label">PIT LIM</span>
                </div>
              )}
              {snap.tyresOut > 0 && (
                <div className="telem-chip chip-warning">
                  <span className="chip-label">OFF</span>
                  <span className="chip-value">{snap.tyresOut}</span>
                </div>
              )}
            </div>
          </div>
          <LapTimesLive
            currentTimeMs={snap.currentTimeMs}
            bestTimeMs={snap.bestTimeMs}
            lastTimeMs={snap.lastTimeMs}
            completedLaps={snap.completedLaps}
            lapHistory={lapHistory}
            currentSector={snap.currentSectorIndex}
            lastSectorTimeMs={snap.lastSectorTimeMs}
          />
        </div>
      </div>
    </div>
  );
};
