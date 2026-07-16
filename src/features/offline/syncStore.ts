import { create } from 'zustand';

interface SyncState {
  pendingCount: number;
  syncing: boolean;
  lastSyncAt: number | null;
  setPending: (n: number) => void;
  setSyncing: (v: boolean) => void;
  markSynced: () => void;
}

export const useSyncStore = create<SyncState>((set) => ({
  pendingCount: 0,
  syncing: false,
  lastSyncAt: null,
  setPending: (n) => set({ pendingCount: n }),
  setSyncing: (v) => set({ syncing: v }),
  markSynced: () => set({ syncing: false, lastSyncAt: Date.now() }),
}));
