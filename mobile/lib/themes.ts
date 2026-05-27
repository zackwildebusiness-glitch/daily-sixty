export interface ThemePalette {
  id: string;
  label: string;
  isPro: boolean;
  accent: string;
  accentDeep: string;
  accentSoft: string;
  accentLavender: string;
  accentBg: string;
  accentBgDeep: string;
}

export const PALETTES: Record<string, ThemePalette> = {
  violet: {
    id: 'violet', label: 'Violet', isPro: false,
    accent: '#6D4AE0', accentDeep: '#5B3DD1', accentSoft: '#A593F0',
    accentLavender: '#C5B7F5', accentBg: '#7B5EE6', accentBgDeep: '#5B3DD1',
  },
  crimson: {
    id: 'crimson', label: 'Crimson', isPro: true,
    accent: '#DC2626', accentDeep: '#991B1B', accentSoft: '#F87171',
    accentLavender: '#FECACA', accentBg: '#EF4444', accentBgDeep: '#B91C1C',
  },
  ocean: {
    id: 'ocean', label: 'Ocean', isPro: true,
    accent: '#0284C7', accentDeep: '#0369A1', accentSoft: '#38BDF8',
    accentLavender: '#BAE6FD', accentBg: '#0EA5E9', accentBgDeep: '#0284C7',
  },
  forest: {
    id: 'forest', label: 'Forest', isPro: true,
    accent: '#16A34A', accentDeep: '#15803D', accentSoft: '#4ADE80',
    accentLavender: '#BBF7D0', accentBg: '#22C55E', accentBgDeep: '#16A34A',
  },
  solar: {
    id: 'solar', label: 'Solar', isPro: true,
    accent: '#D97706', accentDeep: '#B45309', accentSoft: '#FBBF24',
    accentLavender: '#FDE68A', accentBg: '#F59E0B', accentBgDeep: '#D97706',
  },
};

export const PALETTE_LIST: ThemePalette[] = Object.values(PALETTES);
