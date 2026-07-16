import { Popup } from 'react-map-gl/maplibre';
import { CATEGORY_LABEL, CATEGORY_COLOR, type FormCategory } from '../api/mapApi';

export interface PopupInfo {
  longitude: number;
  latitude: number;
  properties: {
    responseId?: string;
    category?: string;
    submittedAt?: string;
    communeId?: string;
  };
}

interface Props {
  info: PopupInfo;
  onClose: () => void;
}

export function ObservationPopup({ info, onClose }: Props) {
  const cat = info.properties.category as FormCategory | undefined;
  const color = cat ? CATEGORY_COLOR[cat] : '#6B7570';
  const label = cat ? CATEGORY_LABEL[cat] : 'Observation';
  const date = info.properties.submittedAt
    ? new Date(info.properties.submittedAt).toLocaleDateString('fr-SN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : null;

  return (
    <Popup
      longitude={info.longitude}
      latitude={info.latitude}
      onClose={onClose}
      closeButton
      closeOnClick={false}
      anchor="bottom"
      offset={12}
    >
      <div className="min-w-[160px] p-1 space-y-2 font-[Poppins,sans-serif]">
        {/* Category badge */}
        <span
          className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold text-white"
          style={{ backgroundColor: color }}
        >
          {label}
        </span>

        {date && (
          <p className="text-xs text-gray-500">{date}</p>
        )}

        <p className="text-[10px] text-gray-400 font-mono">
          {info.latitude.toFixed(5)}, {info.longitude.toFixed(5)}
        </p>
      </div>
    </Popup>
  );
}
