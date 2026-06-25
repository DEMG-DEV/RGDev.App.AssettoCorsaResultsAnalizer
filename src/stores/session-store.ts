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
  view: 'home' | 'session' | 'driver' | 'history' | 'telemetry';
  /** Active brand theme */
  theme: BrandTheme;

  // Actions
  addResults: (newResults: ParseResult[]) => void;
  selectSession: (session: Session) => void;
  selectDriver: (index: number | null) => void;
  removeSession: (sessionId: string) => void;
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

  removeSession: (sessionId) =>
    set((state) => {
      // Filter the session out of every ParseResult
      const updatedResults = state.results
        .map((r) => ({
          ...r,
          sessions: r.sessions.filter((s) => s.id !== sessionId),
        }))
        .filter((r) => r.sessions.length > 0); // drop empty results

      // If the deleted session was currently selected, go back home
      const wasSelected = state.selectedSession?.id === sessionId;
      return {
        results: updatedResults,
        ...(wasSelected
          ? { selectedSession: null, selectedDriverIndex: null, view: 'home' as const }
          : {}),
      };
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
    } else if (state.view === 'session' || state.view === 'history' || state.view === 'telemetry') {
      set({ view: 'home', selectedSession: null });
    }
  },
}));
