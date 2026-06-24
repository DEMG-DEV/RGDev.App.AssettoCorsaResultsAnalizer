/**
 * Zustand store — global state management for the AC Results Analyzer.
 */

import { create } from 'zustand';
import type { ParseResult, Session } from '../core/models/types';

export type BrandTheme = 'ferrari' | 'porsche' | 'toyota' | 'ford';

interface SessionStore {
  /** All loaded parse results */
  results: ParseResult[];
  /** Currently selected session */
  selectedSession: Session | null;
  /** Index of selected driver in session.participants */
  selectedDriverIndex: number | null;
  /** Whether AC root folder is configured */
  acRootConfigured: boolean;
  /** Loading state */
  isLoading: boolean;
  /** Loading progress */
  loadingProgress: { current: number; total: number } | null;
  /** Current view */
  view: 'home' | 'session' | 'driver' | 'history';
  /** Active brand theme */
  theme: BrandTheme;

  // Actions
  addResults: (newResults: ParseResult[]) => void;
  selectSession: (session: Session) => void;
  selectDriver: (index: number | null) => void;
  setAcRootConfigured: (configured: boolean) => void;
  setLoading: (loading: boolean) => void;
  setLoadingProgress: (current: number, total: number) => void;
  setView: (view: SessionStore['view']) => void;
  setTheme: (theme: BrandTheme) => void;
  clearAll: () => void;
  goBack: () => void;
}

// Load saved theme on init
const savedTheme = (typeof localStorage !== 'undefined'
  ? localStorage.getItem('ac-theme') as BrandTheme | null
  : null) ?? 'ferrari';

// Apply on load
if (typeof document !== 'undefined') {
  document.documentElement.setAttribute('data-theme', savedTheme);
}

export const useSessionStore = create<SessionStore>((set, get) => ({
  results: [],
  selectedSession: null,
  selectedDriverIndex: null,
  acRootConfigured: false,
  isLoading: false,
  loadingProgress: null,
  view: 'home',
  theme: savedTheme,

  addResults: (newResults) =>
    set((state) => ({
      results: [...state.results, ...newResults],
    })),

  selectSession: (session) =>
    set({
      selectedSession: session,
      selectedDriverIndex: null,
      view: 'session',
    }),

  selectDriver: (index) =>
    set({
      selectedDriverIndex: index,
      view: index !== null ? 'driver' : 'session',
    }),

  setAcRootConfigured: (configured) =>
    set({ acRootConfigured: configured }),

  setLoading: (loading) =>
    set({ isLoading: loading, loadingProgress: loading ? null : null }),

  setLoadingProgress: (current, total) =>
    set({ loadingProgress: { current, total } }),

  setView: (view) =>
    set({ view }),

  setTheme: (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('ac-theme', theme);
    set({ theme });
  },

  clearAll: () =>
    set({
      results: [],
      selectedSession: null,
      selectedDriverIndex: null,
      view: 'home',
    }),

  goBack: () => {
    const state = get();
    if (state.view === 'driver') {
      set({ view: 'session', selectedDriverIndex: null });
    } else if (state.view === 'session' || state.view === 'history') {
      set({ view: 'home', selectedSession: null });
    }
  },
}));
