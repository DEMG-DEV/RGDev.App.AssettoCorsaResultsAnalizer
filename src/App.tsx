import React, { useEffect, useRef, useState } from 'react';
import { useSessionStore } from './stores/session-store';
import { AppShell } from './components/layout/AppShell';
import { FileDropZone } from './components/file-input/FileDropZone';
import { SessionCard } from './components/session-list/SessionCard';
import { SessionDashboard } from './components/session/SessionDashboard';
import { DriverDetailView } from './components/driver/DriverDetailView';
import { HistoryDashboard } from './components/history/HistoryDashboard';
import { TrackRecordsView } from './components/shared/TrackRecordsView';
import { getCachedFiles } from './services/session-cache';
import { parseJsonFile } from './core/parsers/format-detector';
import { es } from './i18n/es';

const App: React.FC = () => {
  const { view, results, selectedSession, selectedDriverIndex, isLoading, loadingProgress } = useSessionStore();
  const { addResults, setLoading, setLoadingProgress } = useSessionStore();
  const didAutoLoad = useRef(false);
  const [restoredFromCache, setRestoredFromCache] = useState(false);

  // Auto-load cached sessions from shared storage on mount
  useEffect(() => {
    if (didAutoLoad.current) return;
    didAutoLoad.current = true;

    (async () => {
      setLoading(true);
      try {
        console.info('[AutoLoad] Fetching cached sessions...');
        const cached = await getCachedFiles();
        console.info(`[AutoLoad] Found ${cached.length} cached files`);

        if (cached.length === 0) {
          setLoading(false);
          return;
        }

        const parsedResults = cached.map((file, i) => {
          setLoadingProgress(i + 1, cached.length);
          console.info(`[AutoLoad] File "${file.fileName}": content length=${file.content?.length ?? 0}, preview="${String(file.content).slice(0, 200)}"`);
          const result = parseJsonFile(file.content, file.fileName, file.fileSize);
          console.info(`[AutoLoad] File "${file.fileName}": parsed ${result.sessions.length} sessions, errors: ${result.errors.length > 0 ? result.errors.join('; ') : 'none'}`);
          return result;
        });

        const validResults = parsedResults.filter(r => r.sessions.length > 0);
        console.info(`[AutoLoad] Parsed ${validResults.length} valid results from ${cached.length} files`);

        if (validResults.length > 0) {
          addResults(validResults);
          setRestoredFromCache(true);
          setTimeout(() => setRestoredFromCache(false), 4000);
        }
      } catch (err) {
        console.error('[AutoLoad] Failed to restore cached sessions:', err);
      }
      setLoading(false);
    })();
  }, [addResults, setLoading, setLoadingProgress]);

  // Flatten all sessions with their dates — sorted newest first
  const allSessions = results
    .flatMap(r => r.sessions.map(s => ({
      session: s,
      date: r.sessionDate ?? s.cmMetadata?.sessionDate,
    })))
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

      {/* Cache restored toast */}
      {restoredFromCache && (
        <div
          className="animate-in"
          style={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--bg-card)',
            border: '1px solid var(--accent)',
            padding: '10px 20px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            color: 'var(--text-primary)',
            zIndex: 1000,
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          ✅ {es.common.restoredFromCache}
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

              {/* Drop zone for adding more files */}
              <FileDropZone />

              <div className="session-grid" style={{ marginTop: 'var(--space-lg)' }}>
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

      {/* Track Records View */}
      {view === 'track-records' && (
        <TrackRecordsView />
      )}
    </AppShell>
  );
};

export default App;
