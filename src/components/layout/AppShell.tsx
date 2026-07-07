import React, { useState, useEffect } from 'react';
import { ArrowLeft, Trash2, BarChart3, HardDrive } from 'lucide-react';
import { useSessionStore } from '../../stores/session-store';
import { ThemePicker } from '../shared/ThemePicker';
import { getCacheCount } from '../../services/session-cache';
import { es } from '../../i18n/es';

interface Props {
  children: React.ReactNode;
}

export const AppShell: React.FC<Props> = ({ children }) => {
  const { view, results, goBack, clearAll, setView } = useSessionStore();
  const totalSessions = results.reduce((s, r) => s + r.sessions.length, 0);
  const canGoBack = view !== 'home';
  const [cachedCount, setCachedCount] = useState(0);

  // Fetch cache count on mount and when results change
  useEffect(() => {
    getCacheCount().then(setCachedCount).catch(() => setCachedCount(0));
  }, [results]);

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
          {/* Cache indicator */}
          {cachedCount > 0 && (
            <span
              title={es.common.cachedTooltip}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                background: 'var(--bg-glass)',
                padding: '3px 8px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <HardDrive size={12} />
              {es.common.cachedFiles.replace('{count}', String(cachedCount))}
            </span>
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
