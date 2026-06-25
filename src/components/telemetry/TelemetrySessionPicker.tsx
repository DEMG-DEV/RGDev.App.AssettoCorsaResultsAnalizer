/**
 * TelemetrySessionPicker — Lists saved telemetry sessions and lets
 * the user select one for detailed chart analysis.
 */

import React, { useEffect, useState } from 'react';
import { Database, Clock, Activity, ChevronRight } from 'lucide-react';
import { listTelemetrySessions, isTauriEnvironment } from '../../services/telemetry-service';
import { humanizeCarId } from '../../core/utils/car-name-humanizer';
import type { TelemetrySessionInfo } from '../../core/models/telemetry-types';
import { es } from '../../i18n/es';

interface Props {
  onSelectSession: (session: TelemetrySessionInfo) => void;
  selectedFileName?: string | null;
}

function formatDuration(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

export const TelemetrySessionPicker: React.FC<Props> = ({ onSelectSession, selectedFileName }) => {
  const [sessions, setSessions] = useState<TelemetrySessionInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!isTauriEnvironment()) {
        setLoading(false);
        return;
      }
      try {
        const list = await listTelemetrySessions();
        setSessions(list);
      } catch {
        setSessions([]);
      }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="telemetry-picker-loading">
        <div className="loading-spinner" style={{ width: 24, height: 24 }} />
        <span>{es.common.loading}</span>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="telemetry-picker-empty">
        <Database size={32} />
        <p>{es.telemetry.noSavedSessions}</p>
        <p className="text-muted" style={{ fontSize: '0.8rem' }}>
          {es.telemetry.analysisDescription}
        </p>
      </div>
    );
  }

  return (
    <div className="telemetry-picker">
      <div className="telemetry-picker-list">
        {sessions.map((session) => {
          const isSelected = session.fileName === selectedFileName;
          return (
            <button
              key={session.fileName}
              className={`telemetry-picker-item ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelectSession(session)}
            >
              <div className="picker-item-main">
                <div className="picker-item-car">{humanizeCarId(session.carModel)}</div>
                <div className="picker-item-track">{session.track}{session.trackConfiguration ? ` — ${session.trackConfiguration}` : ''}</div>
              </div>
              <div className="picker-item-meta">
                <span className="picker-meta-tag">
                  <Clock size={12} />
                  {formatDuration(session.durationMs)}
                </span>
                <span className="picker-meta-tag">
                  <Activity size={12} />
                  {session.snapshotCount.toLocaleString()}
                </span>
                <span className="picker-meta-tag">
                  {formatFileSize(session.fileSize)}
                </span>
              </div>
              <div className="picker-item-date">{formatDate(session.recordedAt)}</div>
              <ChevronRight size={16} className="picker-item-arrow" />
            </button>
          );
        })}
      </div>
    </div>
  );
};
