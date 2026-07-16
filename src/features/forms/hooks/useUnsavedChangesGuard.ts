import { useEffect } from 'react';
import { useBlocker } from 'react-router';

/**
 * Garde-fou contre la perte de modifications non sauvegardées.
 * - Bloque la navigation interne (react-router) tant que `when` est vrai ;
 *   renvoie l'objet `blocker` pour afficher une confirmation.
 * - Affiche l'avertissement natif du navigateur (fermeture/rechargement d'onglet).
 */
export function useUnsavedChangesGuard(when: boolean) {
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      when && currentLocation.pathname !== nextLocation.pathname,
  );

  useEffect(() => {
    if (!when) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [when]);

  return blocker;
}
