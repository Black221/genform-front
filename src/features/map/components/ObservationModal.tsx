import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { useMapStore } from '../store/mapStore';
import { ObservationDetail } from './Sidebar/ObservationDetail';

/**
 * Détail d'une observation affiché en pop-up (modal).
 * S'ouvre dès qu'une observation est sélectionnée — depuis la liste
 * des réponses ou depuis une vignette de la galerie photos.
 */
export function ObservationModal() {
  const selectedObservationId = useMapStore((s) => s.selectedObservationId);
  const selectObservation = useMapStore((s) => s.selectObservation);
  const open = !!selectedObservationId;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(v) => { if (!v) selectObservation(null); }}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fade-in" />
        <DialogPrimitive.Content
          style={{ transform: 'translate(-50%, -50%)' }}
          className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-lg max-h-[88vh]
                     flex flex-col bg-surface border border-theme rounded-(--radius-lg)
                     shadow-(--shadow-lift) animate-scale-in overflow-hidden"
        >
          <DialogPrimitive.Title className="sr-only">Détail de l'observation</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            Réponses, photos et localisation de l'observation sélectionnée
          </DialogPrimitive.Description>

          {selectedObservationId && (
            <ObservationDetail
              observationId={selectedObservationId}
              onBack={() => selectObservation(null)}
              showBack={false}
            />
          )}

          <DialogPrimitive.Close
            className="absolute top-3 right-3 size-8 rounded-md z-10 flex items-center justify-center
                       bg-surface/80 backdrop-blur text-muted hover:text-(--color-text)
                       hover:bg-[color-mix(in_srgb,var(--color-text)_8%,transparent)] transition-all"
            aria-label="Fermer"
          >
            <X size={16} />
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
