/**
 * ConnectionStatus — Displays telemetry connection state.
 * Shows "waiting for AC" screen when not connected, or live indicator when active.
 */

import React from 'react';
import { Radio, Save } from 'lucide-react';

interface Props {
  isConnected: boolean;
  isRecording: boolean;
  error: string | null;
  carModel?: string | null;
  track?: string | null;
  saveSessionEnabled: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onToggleSave: (enabled: boolean) => void;
}

export const ConnectionStatus: React.FC<Props> = ({
  isConnected,
  isRecording,
  error,
  carModel,
  track,
  saveSessionEnabled,
  onConnect,
  onDisconnect,
  onToggleSave,
}) => {
  if (!isConnected && !isRecording) {
    return (
      <div className="telemetry-connection-waiting">
        <div className="connection-icon-pulse">
          <Radio size={48} />
        </div>
        <h2>Telemetría en Vivo</h2>
        <p className="text-secondary">
          Conecta con Assetto Corsa para ver telemetría en tiempo real
        </p>
        {error && (
          <div className="connection-error">
            <span>⚠️ {error}</span>
          </div>
        )}
        <button className="btn btn-primary btn-lg" onClick={onConnect}>
          <Radio size={18} />
          Conectar con AC
        </button>
        <p className="connection-hint">
          Asegúrate de que Assetto Corsa esté corriendo antes de conectar
        </p>
      </div>
    );
  }

  // Connected — show inline status bar
  return (
    <div className="telemetry-connection-bar">
      <div className="connection-status-dot connected" />
      <span className="connection-info">
        {carModel && <strong>{carModel}</strong>}
        {track && <span> — {track}</span>}
      </span>
      {isRecording && (
        <span className="recording-badge">
          <span className="recording-dot" /> REC
        </span>
      )}
      <label className="save-toggle" title="Guardar telemetría al desconectar">
        <Save size={14} />
        <span className="save-toggle-label">Guardar</span>
        <div
          className={`toggle-switch ${saveSessionEnabled ? 'active' : ''}`}
          onClick={() => onToggleSave(!saveSessionEnabled)}
        >
          <div className="toggle-knob" />
        </div>
      </label>
      <button className="btn btn-sm btn-ghost btn-danger" onClick={onDisconnect}>
        Desconectar
      </button>
    </div>
  );
};

