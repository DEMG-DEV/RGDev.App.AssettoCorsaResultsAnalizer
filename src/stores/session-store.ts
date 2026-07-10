/**
 * Zustand store — global state management for the AC Results Analyzer.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ParseResult, Session } from '../core/models/types';
import { clearCache, removeFromCache } from '../services/session-cache';

interface SessionStore {
  /** All loaded parse results */
  results: ParseResult[];
  /** Currently selected session */
  selectedSession: Session | null;
  /** Index of selected driver in session.participants */
  selectedDriverIndex: number | null;
  /** Loading state */
  isLoading: boolean;
  /** Loading progress */
  loadingProgress: { current: number; total: number } | null;
  /** Current view */
  view: 'home' | 'session' | 'driver' | 'track-records';
  /** Custom car name aliases mapped by carId */
  carAliases: Record<string, string>;

  addResults: (results: ParseResult[]) => void;
  selectSession: (session: Session | null) => void;
  selectDriver: (index: number | null) => void;
  removeSession: (sessionId: string) => void;
  setLoading: (loading: boolean) => void;
  setLoadingProgress: (current: number, total: number) => void;
  setView: (view: SessionStore['view']) => void;
  setCarAlias: (carId: string, alias: string) => void;
  clearAll: () => void;
  goBack: () => void;
}

export const useSessionStore = create<SessionStore>()(
  persist(
    (set, get) => ({
      results: [],
      selectedSession: null,
      selectedDriverIndex: null,
      isLoading: false,
      loadingProgress: null,
      view: 'home',
      carAliases: {},

      addResults: (newResults) =>
        set((state) => ({
          results: [...state.results, ...newResults],
        })),

      selectSession: (session) =>
        set({ selectedSession: session, view: session ? 'session' : 'home' }),

      selectDriver: (index) =>
        set({ selectedDriverIndex: index, view: index !== null ? 'driver' : 'session' }),

      removeSession: (sessionId) => {
        const state = get();

        // Find which results will become empty after removing this session
        const emptiedFileNames = state.results
          .filter(r => r.sessions.some(s => s.id === sessionId) && r.sessions.length === 1)
          .map(r => r.fileName);

        // Remove from shared cache in the background (fire-and-forget)
        emptiedFileNames.forEach(fn => removeFromCache(fn));

        const updatedResults = state.results
          .map((r) => ({
            ...r,
            sessions: r.sessions.filter((s) => s.id !== sessionId),
          }))
          .filter((r) => r.sessions.length > 0); // Remove empty results

        const wasSelected = state.selectedSession?.id === sessionId;
        set({
          results: updatedResults,
          ...(wasSelected
            ? { selectedSession: null, selectedDriverIndex: null, view: 'home' as const }
            : {}),
        });
      },

      setLoading: (loading) =>
        set({ isLoading: loading, loadingProgress: loading ? null : null }),

      setLoadingProgress: (current, total) =>
        set({ loadingProgress: { current, total } }),

      setView: (view) =>
        set({ view }),

      setCarAlias: (carId, alias) =>
        set((state) => ({
          carAliases: {
            ...state.carAliases,
            [carId]: alias,
          },
        })),

      clearAll: () => {
        // Clear shared cache in the background (fire-and-forget)
        clearCache();
        set({
          results: [],
          selectedSession: null,
          selectedDriverIndex: null,
          view: 'home',
        });
      },

      goBack: () => {
        const state = get();
        if (state.view === 'driver') {
          set({ view: 'session', selectedDriverIndex: null });
        } else if (state.view === 'session' || state.view === 'track-records') {
          set({ view: 'home', selectedSession: null });
        }
      },
    }),
    {
      name: 'ac-results-store',
      partialize: (state) => ({ carAliases: state.carAliases }),
    }
  )
);
