import { useMapStore } from '../store/mapStore';
import { useCommunes } from '../hooks/useCommunes';
import { useMapObservations } from '../hooks/useMapObservations';
import { useMapUrlState } from '../hooks/useMapUrlState';
import { ObservatoryMap } from '../components/ObservatoryMap';
import { MapTopbar } from '../components/MapTopbar';
import { MapLegend } from '../components/MapLegend';
import { CommuneSidebar } from '../components/Sidebar/CommuneSidebar';
import { CommunePickerCard } from '../components/CommunePickerCard';
import { MobileBottomSheet } from '../components/MobileBottomSheet';
import { MobileCommunePanel } from '../components/Sidebar/MobileCommunePanel';
import { ObservationModal } from '../components/ObservationModal';
import type { CommuneProperties } from '../api/mapApi';

export default function MapPage() {
  useMapUrlState();

  const view = useMapStore((s) => s.view);
  const selectedCommuneId = useMapStore((s) => s.selectedCommuneId);
  const filters = useMapStore((s) => s.filters);

  const { data: communeData, isLoading: loadingCommunes, isError: communesError } = useCommunes();
  const { data: observationData, isFetching } = useMapObservations({
    ...filters,
    communeId: view === 'commune' ? selectedCommuneId ?? undefined : filters.communeId,
  });

  const communeFeature = communeData.features.find(
    (f) => (f.properties as CommuneProperties)?.id === selectedCommuneId,
  );
  const communeName = (communeFeature?.properties as CommuneProperties | undefined)?.name;

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#dfe5e9]">
      {/* Loading bar — dégradé marque (bleu nuit → or) */}
      {(loadingCommunes || isFetching) && (
        <div
          className="absolute top-0 left-0 right-0 h-0.5 z-40 animate-pulse"
          style={{ background: 'linear-gradient(90deg, #1D4E70, #F2B134, #C25E3A, #1D4E70)' }}
        />
      )}

      {/* Erreur chargement communes */}
      {communesError && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30
                        bg-(--color-danger-soft) border border-(--color-danger)/30 text-danger text-xs
                        rounded-xl px-4 py-2.5 shadow-lg backdrop-blur-sm">
          Impossible de charger les communes — vérifiez que le backend est démarré.
        </div>
      )}

      {/* Map */}
      <ObservatoryMap communes={communeData} observations={observationData} />

      {/* Topbar */}
      <MapTopbar communeName={communeName} />

      {/* Commune picker (desktop) */}
      <div className="hidden md:block">
        <CommunePickerCard communes={communeData} />
      </div>

      {/* Legend (desktop, vue nationale — en vue commune la sidebar montre la répartition) */}
      {view === 'national' && (
        <div className="hidden md:block">
          <MapLegend />
        </div>
      )}

      {/* Desktop sidebar */}
      {view === 'commune' && (
        <CommuneSidebar
          communeFeature={communeFeature}
          observations={observationData}
        />
      )}

      {/* Mobile bottom sheet */}
      {view === 'commune' && (
        <MobileBottomSheet>
          <MobileCommunePanel observations={observationData} />
        </MobileBottomSheet>
      )}

      {/* Détail d'une observation — pop-up (liste ou galerie) */}
      <ObservationModal />
    </div>
  );
}
