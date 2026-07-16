import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateId } from './generateId';

interface DeviceStore {
  /** Identifiant anonyme stable de l'appareil (généré une fois, persistant). */
  deviceId: string;
}

/**
 * Identité anonyme : un UUID persistant en localStorage qui permet de
 * reconnaître l'appareil sans compte (photos instantanées, historique).
 */
export const useDeviceStore = create<DeviceStore>()(
  persist(
    () => ({ deviceId: generateId() }),
    { name: 'gen-form-device' },
  ),
);

/** Hook React : renvoie le deviceId courant. */
export function useDeviceId(): string {
  return useDeviceStore((s) => s.deviceId);
}

/** Accès synchrone hors React (sync engine, couche API). */
export function getDeviceId(): string {
  return useDeviceStore.getState().deviceId;
}
