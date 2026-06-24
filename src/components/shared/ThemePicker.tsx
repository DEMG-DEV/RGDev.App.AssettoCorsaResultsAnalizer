import React from 'react';
import { useSessionStore, type BrandTheme } from '../../stores/session-store';

const THEMES: Array<{ id: BrandTheme; label: string }> = [
  { id: 'ferrari', label: 'Ferrari' },
  { id: 'porsche', label: 'Porsche' },
  { id: 'toyota', label: 'Toyota' },
  { id: 'ford', label: 'Ford' },
];

export const ThemePicker: React.FC = () => {
  const { theme, setTheme } = useSessionStore();

  return (
    <div className="theme-picker">
      {THEMES.map(t => (
        <button
          key={t.id}
          className={`theme-btn ${theme === t.id ? 'active' : ''}`}
          data-brand={t.id}
          title={t.label}
          onClick={() => setTheme(t.id)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
};
