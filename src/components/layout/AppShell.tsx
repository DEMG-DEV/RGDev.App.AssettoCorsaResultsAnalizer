import React from 'react';
import { ArrowLeft, Trash2, BarChart3, Radio } from 'lucide-react';
import { useSessionStore } from '../../stores/session-store';
import { ThemePicker } from '../shared/ThemePicker';
import { isTauriEnvironment } from '../../services/telemetry-service';
import { es } from '../../i18n/es';

interface Props {
  children: React.ReactNode;
}

export const AppShell: React.FC<Props> = ({ children }) => {
  const { view, results, goBack, clearAll, setView } = useSessionStore();
  const totalSessions = results.reduce((s, r) => s + r.sessions.length, 0);
  const canGoBack = view !== 'home';
  const isTauri = isTauriEnvironment();

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-left">
          {canGoBack && (
            <button className="btn btn-icon" onClick={goBack} title={es.common.back}>
              <ArrowLeft size={18} />
            </button>
          )}
          <span className="logo" onClick={() => setView('home')} style={{ cursor: 'pointer' }}>
            <div className="logo-icon">AC</div>
            <span>Results Analyzer</span>
          </span>
          {totalSessions > 0 && (
            <span className="session-count">{totalSessions}</span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
          {/* Live Telemetry button — only in Tauri */}
          {isTauri && view !== 'telemetry' && (
            <button
              className="btn btn-sm btn-telemetry"
              onClick={() => setView('telemetry')}
              title={es.telemetry.title}
            >
              <Radio size={14} />
              {es.telemetry.liveButton}
            </button>
          )}
          <ThemePicker />
          <div style={{ width: 1, height: 20, background: 'var(--border-subtle)' }} />
          {totalSessions > 1 && view !== 'history' && (
            <button className="btn btn-sm" onClick={() => setView('history')}>
              <BarChart3 size={14} />
              {es.home.viewHistory}
            </button>
          )}
          {totalSessions > 0 && (
            <button className="btn btn-sm btn-ghost btn-danger" onClick={clearAll}>
              <Trash2 size={14} />
              {es.home.clearAll}
            </button>
          )}
        </div>
      </header>
      <main className="app-main">
        {children}
      </main>
    </div>
  );
};
