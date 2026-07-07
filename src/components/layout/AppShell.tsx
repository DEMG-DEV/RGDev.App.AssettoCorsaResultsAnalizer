import React, { useState, useEffect } from 'react';
import { Trash2, HardDrive, Trophy, Home, ChevronLeft } from 'lucide-react';
import { useSessionStore } from '../../stores/session-store';
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

  useEffect(() => {
    getCacheCount().then(setCachedCount).catch(() => setCachedCount(0));
  }, [results]);

  const navItems = [
    { id: 'home', label: 'Inicio', icon: <Home size={18} /> },
    { id: 'track-records', label: 'Récords por Pista', icon: <Trophy size={18} />, disabled: totalSessions === 0 },
  ];

  const handleNavClick = (id: string) => {
    if (id === 'track-records' && totalSessions === 0) return;
    setView(id as any);
  };

  return (
    <div className="app-shell">
      {/* === Desktop Sidebar === */}
      <aside className="app-sidebar">
        <div className="logo" onClick={() => setView('home')} style={{ cursor: 'pointer' }}>
          <div className="logo-icon">AC</div>
          <span>Results Analyzer</span>
        </div>

        <nav className="sidebar-nav">
          <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, padding: '0 12px', marginBottom: '8px', letterSpacing: '0.05em' }}>
            Navegación
          </div>
          {navItems.map(item => (
            <div
              key={item.id}
              className={`sidebar-nav-item ${(view === item.id || (item.id === 'home' && view !== 'track-records')) ? 'active' : ''}`}
              onClick={() => handleNavClick(item.id)}
              style={{ opacity: item.disabled ? 0.5 : 1, cursor: item.disabled ? 'not-allowed' : 'pointer' }}
            >
              {item.icon}
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.id === 'home' && totalSessions > 0 && (
                <span className="session-count">{totalSessions}</span>
              )}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          {cachedCount > 0 && (
            <div title={es.common.cachedTooltip} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'var(--text-muted)', padding: '8px 12px' }}>
              <HardDrive size={14} />
              {es.common.cachedFiles.replace('{count}', String(cachedCount))}
            </div>
          )}
          {totalSessions > 0 && (
            <button className="btn btn-sm btn-ghost btn-danger" onClick={clearAll} style={{ width: '100%', justifyContent: 'center' }}>
              <Trash2 size={14} />
              {es.home.clearAll}
            </button>
          )}
        </div>
      </aside>

      {/* === Main Content === */}
      <main className="app-main-wrapper">
        <div className="app-top-toolbar">
          <div>
            {canGoBack && (
              <button className="btn btn-icon btn-ghost" onClick={goBack} title={es.common.back}>
                <ChevronLeft size={24} />
              </button>
            )}
          </div>
          <div>
            {/* Contextual actions could go here */}
          </div>
        </div>

        <div className="app-main">
          {children}
        </div>
      </main>

      {/* === Mobile Bottom Bar === */}
      <nav className="app-bottom-bar">
        <div className="bottom-bar-nav">
          {navItems.map(item => (
            <div
              key={item.id}
              className={`bottom-bar-item ${(view === item.id || (item.id === 'home' && view !== 'track-records')) ? 'active' : ''}`}
              onClick={() => handleNavClick(item.id)}
              style={{ opacity: item.disabled ? 0.5 : 1 }}
            >
              {item.icon}
              <span>{item.label}</span>
            </div>
          ))}
          {totalSessions > 0 && (
            <div className="bottom-bar-item" onClick={clearAll} style={{ color: 'var(--text-accent)' }}>
              <Trash2 size={18} />
              <span>Borrar</span>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
};
