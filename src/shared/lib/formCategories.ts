export type FormCategory =
  | 'AIR' | 'EAU' | 'SOLS' | 'SANTE'
  | 'INONDATION' | 'POLLUTION' | 'URBANISATION' | 'AUTRE';

export const CATEGORY_LABEL: Record<FormCategory, string> = {
  AIR: 'Air',
  EAU: 'Eau',
  SOLS: 'Sols',
  SANTE: 'Santé',
  INONDATION: 'Inondation',
  POLLUTION: 'Pollution',
  URBANISATION: 'Urbanisme',
  AUTRE: 'Autre',
};

export const CATEGORY_COLOR: Record<FormCategory, string> = {
  AIR: '#2F7DBC',
  EAU: '#0EA5E9',
  SOLS: '#C97B3E',
  SANTE: '#E31B23',
  INONDATION: '#6366F1',
  POLLUTION: '#E87722',
  URBANISATION: '#8B5CF6',
  AUTRE: '#6B7570',
};

export const FORM_CATEGORIES = (Object.keys(CATEGORY_LABEL) as FormCategory[]).map((value) => ({
  value,
  label: CATEGORY_LABEL[value],
  color: CATEGORY_COLOR[value],
}));
