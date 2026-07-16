import { Palette, Type, Layout, Check } from 'lucide-react';
import type { AppTheme } from '@/shared/types';
import { terangaTheme } from '@/design-system/themes/teranga';
import { terangaDarkTheme } from '@/design-system/themes/terangaDark';
import { vibrantTheme } from '@/design-system/themes/vibrant';
import { editorialTheme } from '@/design-system/themes/editorial';
import { minimalTheme } from '@/design-system/themes/minimal';
import { defaultTheme } from '@/design-system/themes/default';

interface Props {
  theme: AppTheme;
  onChange: (theme: AppTheme) => void;
}

const PRESETS: AppTheme[] = [terangaTheme, terangaDarkTheme, editorialTheme, vibrantTheme, minimalTheme, defaultTheme];

const DISPLAY_FONTS = [
  { label: 'Bricolage Grotesque', value: "'Bricolage Grotesque', sans-serif" },
  { label: 'Space Grotesk',       value: "'Space Grotesk', sans-serif" },
  { label: 'Playfair Display',    value: "'Playfair Display', serif" },
  { label: 'DM Serif Display',    value: "'DM Serif Display', serif" },
  { label: 'Syne',                value: "'Syne', sans-serif" },
];

const BODY_FONTS = [
  { label: 'Hanken Grotesk', value: "'Hanken Grotesk', sans-serif" },
  { label: 'DM Sans',        value: "'DM Sans', sans-serif" },
  { label: 'Inter',          value: "'Inter', sans-serif" },
  { label: 'Lato',           value: "'Lato', sans-serif" },
];

function SectionHeader({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-2 pb-2" style={{ borderBottom: '1px solid #D8E0DD' }}>
      <Icon size={13} style={{ color: '#0B6E63' }} />
      <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#576A65' }}>
        {label}
      </span>
    </div>
  );
}

function ColorRow({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-8 h-8 rounded-lg border cursor-pointer shrink-0"
        style={{ borderColor: '#D8E0DD' }}
      />
      <span className="text-xs flex-1" style={{ color: '#576A65' }}>{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-24 border rounded-lg px-2 py-1 text-xs font-mono focus:outline-none focus:border-[#0B6E63]"
        style={{ borderColor: '#D8E0DD', color: '#15211E', background: 'white' }}
      />
    </div>
  );
}

function SelectRow({ label, value, options, onChange }: {
  label: string; value: string;
  options: { label: string; value: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium" style={{ color: '#576A65' }}>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0B6E63] focus:ring-2 focus:ring-[#0B6E63]/20"
        style={{ borderColor: '#D8E0DD', color: '#15211E', background: 'white' }}
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function PillGroup<T extends string>({ options, value, onChange }: {
  options: { label: string; value: T }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className="flex-1 py-2 text-xs rounded-lg border font-medium transition-all"
          style={{
            borderColor: value === o.value ? '#0B6E63' : '#D8E0DD',
            background:  value === o.value ? '#DCEFEC' : 'white',
            color:       value === o.value ? '#0B6E63' : '#576A65',
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function ThemeEditor({ theme, onChange }: Props) {
  const set = <K extends keyof AppTheme>(key: K, val: AppTheme[K]) =>
    onChange({ ...theme, [key]: val });
  const setPalette = (key: keyof AppTheme['palette'], val: string) =>
    set('palette', { ...theme.palette, [key]: val });
  const setTypo = (key: keyof AppTheme['typography'], val: AppTheme['typography'][typeof key]) =>
    set('typography', { ...theme.typography, [key]: val });

  return (
    <div className="flex flex-col gap-6">

      {/* Presets */}
      <section className="flex flex-col gap-3">
        <SectionHeader icon={Palette} label="Thèmes prédéfinis" />
        <div className="grid grid-cols-3 gap-2">
          {PRESETS.map((p) => {
            const active = p.name === theme.name;
            return (
              <button
                key={p.name}
                type="button"
                onClick={() => onChange(p)}
                className="relative rounded-xl overflow-hidden border-2 transition-all"
                style={{ borderColor: active ? '#0B6E63' : '#D8E0DD', height: 54 }}
              >
                <div className="absolute inset-0" style={{ background: p.palette.background }} />
                <div className="absolute bottom-0 left-0 right-0 h-1/2" style={{ background: p.palette.surface }} />
                <div className="absolute top-1.5 left-1.5 w-4 h-1 rounded-full" style={{ background: p.palette.primary }} />
                <div className="absolute inset-0 flex items-end justify-center pb-1.5">
                  <span className="text-[9px] font-semibold" style={{ color: p.palette.text, opacity: 0.7 }}>
                    {p.name}
                  </span>
                </div>
                {active && (
                  <div className="absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center"
                    style={{ background: '#0B6E63' }}>
                    <Check size={9} color="white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Nom du thème */}
      <section className="flex flex-col gap-2">
        <SectionHeader icon={Palette} label="Nom du thème" />
        <input
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0B6E63] focus:ring-2 focus:ring-[#0B6E63]/20"
          style={{ borderColor: '#D8E0DD', color: '#15211E', background: 'white' }}
          value={theme.name}
          onChange={(e) => set('name', e.target.value)}
          placeholder="Mon thème"
        />
      </section>

      {/* Palette */}
      <section className="flex flex-col gap-3">
        <SectionHeader icon={Palette} label="Palette" />
        <div className="flex flex-col gap-2.5">
          <ColorRow label="Couleur principale" value={theme.palette.primary}       onChange={(v) => setPalette('primary', v)} />
          <ColorRow label="Fond"               value={theme.palette.background}    onChange={(v) => setPalette('background', v)} />
          <ColorRow label="Surface"            value={theme.palette.surface}       onChange={(v) => setPalette('surface', v)} />
          <ColorRow label="Surface surélevée"  value={theme.palette.surfaceRaised} onChange={(v) => setPalette('surfaceRaised', v)} />
          <ColorRow label="Texte"              value={theme.palette.text}          onChange={(v) => setPalette('text', v)} />
          <ColorRow label="Texte secondaire"   value={theme.palette.textMuted}     onChange={(v) => setPalette('textMuted', v)} />
          <ColorRow label="Bordures"           value={theme.palette.border}        onChange={(v) => setPalette('border', v)} />
        </div>
      </section>

      {/* Typography */}
      <section className="flex flex-col gap-3">
        <SectionHeader icon={Type} label="Typographie" />
        <SelectRow
          label="Police des titres"
          value={theme.typography.displayFont}
          options={DISPLAY_FONTS}
          onChange={(v) => setTypo('displayFont', v)}
        />
        <SelectRow
          label="Police du corps"
          value={theme.typography.bodyFont}
          options={BODY_FONTS}
          onChange={(v) => setTypo('bodyFont', v)}
        />
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium" style={{ color: '#576A65' }}>Densité</label>
          <PillGroup
            value={theme.typography.scale}
            options={[
              { label: 'Compact',  value: 'compact' as const },
              { label: 'Confort.', value: 'comfortable' as const },
              { label: 'Aéré',     value: 'spacious' as const },
            ]}
            onChange={(v) => setTypo('scale', v)}
          />
        </div>
      </section>

      {/* Layout & Radius */}
      <section className="flex flex-col gap-3">
        <SectionHeader icon={Layout} label="Mise en page" />
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium" style={{ color: '#576A65' }}>Arrondi</label>
          <PillGroup
            value={theme.radius}
            options={[
              { label: 'Carré', value: 'sharp' as const },
              { label: 'Doux',  value: 'soft' as const },
              { label: 'Rond',  value: 'round' as const },
            ]}
            onChange={(v) => set('radius', v)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium" style={{ color: '#576A65' }}>Style de bloc</label>
          <PillGroup
            value={theme.layout}
            options={[
              { label: 'Carte',     value: 'card' as const },
              { label: 'Classique', value: 'classic' as const },
              { label: 'Question',  value: 'single-question' as const },
            ]}
            onChange={(v) => set('layout', v)}
          />
        </div>
      </section>
    </div>
  );
}
