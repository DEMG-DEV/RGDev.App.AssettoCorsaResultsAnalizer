import React, { useEffect, useRef } from 'react';
import { useSessionStore } from './stores/session-store';
import { AppShell } from './components/layout/AppShell';
import { FileDropZone } from './components/file-input/FileDropZone';
import { SessionCard } from './components/session-list/SessionCard';
import { SessionDashboard } from './components/session/SessionDashboard';
import { DriverDetailView } from './components/driver/DriverDetailView';
import { HistoryDashboard } from './components/history/HistoryDashboard';
import { checkLocalStatus, autoLoadCmSessions } from './services/auto-setup';
import { setAcAvailable } from './services/car-asset-service';
import { es } from './i18n/es';

const App: React.FC = () => {
  const { view, results, selectedSession, selectedDriverIndex, isLoading, loadingProgress } = useSessionStore();
  const { addResults, setAcRootConfigured, setLoading, setLoadingProgress } = useSessionStore();
  const didAutoLoad = useRef(false);

  // Auto-load CM sessions and detect AC folder on mount
  useEffect(() => {
    if (didAutoLoad.current) return;
    didAutoLoad.current = true;

    const autoLoad = async () => {
      // 1. Check what the server found
      const status = await checkLocalStatus();

      // 2. If AC folder found, enable car previews
      if (status.acFound) {
        setAcAvailable(true);
        setAcRootConfigured(true);
      }

      // 3. If CM sessions found, auto-load them
      if (status.cmFound) {
        setLoading(true);
        try {
          const cmResults = await autoLoadCmSessions((current, total) => {
            setLoadingProgress(current, total);
          });
          if (cmResults.length > 0) {
            addResults(cmResults);
          }
        } finally {
          setLoading(false);
        }
      }
    };

    autoLoad();
  }, [addResults, setAcRootConfigured, setLoading, setLoadingProgress]);

  // Flatten all sessions with their dates — sorted newest first
  const allSessions = results
    .flatMap(r => r.sessions.map(s => ({ session: s, date: r.sessionDate })))
    .sort((a, b) => (b.date?.getTime() ?? 0) - (a.date?.getTime() ?? 0));

  return (
    <AppShell>
      {/* Loading overlay */}
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner" />
          <div>{es.common.loading}</div>
          {loadingProgress && (
            <>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {es.home.loadingProgress
                  .replace('{current}', String(loadingProgress.current))
                  .replace('{total}', String(loadingProgress.total))}
              </div>
              <div className="progress-bar">
                <div className="fill" style={{ width: `${(loadingProgress.current / loadingProgress.total) * 100}%` }} />
              </div>
            </>
          )}
        </div>
      )}

      {/* Home View */}
      {view === 'home' && !isLoading && (
        <>
          {/* Show setup UI only if no sessions loaded yet */}
          {allSessions.length === 0 && (
            <>
              <div style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: 'var(--space-sm)' }}>
                  <span style={{ background: 'var(--gradient-racing)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {es.app.subtitle}
                  </span>
                </h1>
                <p className="text-secondary">{es.home.description}</p>
              </div>

              <FileDropZone />
            </>
          )}

          {allSessions.length > 0 && (
            <div style={{ marginTop: 'var(--space-2xl)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
                <h2>
                  {es.home.sessionsLoaded.replace('{count}', String(allSessions.length))}
                </h2>
              </div>
              <div className="session-grid">
                {allSessions.map((item, i) => (
                  <SessionCard key={item.session.id ?? i} session={item.session} sessionDate={item.date} />
                ))}
              </div>
            </div>
          )}

          {results.length > 0 && allSessions.length === 0 && (
            <div style={{ textAlign: 'center', marginTop: 'var(--space-2xl)', color: 'var(--text-muted)' }}>
              <p>{es.home.noSessions}</p>
              <p style={{ fontSize: '0.85rem', marginTop: 'var(--space-sm)' }}>
                {results.flatMap(r => r.errors).join(', ')}
              </p>
            </div>
          )}
        </>
      )}

      {/* Session View */}
      {view === 'session' && selectedSession && (
        <SessionDashboard
          session={selectedSession}
          sessionDate={results.find(r => r.sessions.includes(selectedSession))?.sessionDate}
        />
      )}

      {/* Driver View */}
      {view === 'driver' && selectedSession && selectedDriverIndex !== null && (
        <DriverDetailView participant={selectedSession.participants[selectedDriverIndex]!} />
      )}

      {/* History View */}
      {view === 'history' && (
        <HistoryDashboard />
      )}
    </AppShell>
  );
};

export default App;
