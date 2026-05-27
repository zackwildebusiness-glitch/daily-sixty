import { Appearance } from 'react-native';

// Resolved once at module load — covers the startup case.
// Dynamic mid-session switching requires a full ThemeContext refactor (future work).
const isDark = Appearance.getColorScheme() === 'dark';

const light = {
  bg:          '#F5F2FB',
  surface:     '#FFFFFF',
  surfaceSoft: '#F8F6FE',
  ink:         '#181426',
  inkSoft:     '#5E5872',
  inkMute:     '#9A95AB',
  hairline:    '#EBE6F5',
};

const dark = {
  bg:          '#0E0D16',
  surface:     '#1C1B2A',
  surfaceSoft: '#252438',
  ink:         '#F0EEF8',
  inkSoft:     '#9490B0',
  inkMute:     '#5D5A78',
  hairline:    '#2E2C44',
};

const scheme = isDark ? dark : light;

export const theme = {
  // ── Purple brand ────────────────────────────────────────────────────────────
  purple:          '#6D4AE0',
  purpleDeep:      '#5B3DD1',
  purpleSoft:      '#A593F0',
  purpleLavender:  '#C5B7F5',
  purpleBg:        '#7B5EE6',
  purpleBgDeep:    '#5B3DD1',

  // ── Surface & text (light / dark adaptive) ──────────────────────────────────
  ...scheme,

  // ── Semantic ────────────────────────────────────────────────────────────────
  success:     '#22B789',
  warning:     '#FFB547',
  danger:      '#E03A4A',
  streakFlame: '#FF7A45',

  // ── Category palettes ───────────────────────────────────────────────────────
  cat: {
    health:        { bg: '#FF7170', deep: '#E85655', soft: isDark ? '#5A1F1E' : '#FFD2D1' },
    career:        { bg: '#5B7CFA', deep: '#3F60E0', soft: isDark ? '#1A2560' : '#D5DDFE' },
    finance:       { bg: '#2DCDA8', deep: '#22A98A', soft: isDark ? '#0E4035' : '#CFF1E7' },
    learning:      { bg: '#22B789', deep: '#199069', soft: isDark ? '#0A3A26' : '#CFEBD9' },
    relationships: { bg: '#F76FA8', deep: '#DC4B89', soft: isDark ? '#4A1530' : '#FBD3E3' },
    creativity:    { bg: '#FFB547', deep: '#E89831', soft: isDark ? '#4A300A' : '#FFE7C2' },
    mindset:       { bg: '#7C5CFF', deep: '#5B3DD1', soft: isDark ? '#251566' : '#D8CFFF' },
    custom:        { bg: '#3D3852', deep: '#181426', soft: isDark ? '#1C1930' : '#DAD5E8' },
  } as Record<string, { bg: string; deep: string; soft: string }>,

  // ── Radii ───────────────────────────────────────────────────────────────────
  radius: {
    xs: 8, sm: 12, md: 16, lg: 20, xl: 24, xxl: 28, full: 999,
  },

  // ── Shadows ─────────────────────────────────────────────────────────────────
  shadow: {
    sm: {
      shadowColor: isDark ? '#000' : '#3C2880',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.4 : 0.06,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: isDark ? '#000' : '#3C2880',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: isDark ? 0.5 : 0.10,
      shadowRadius: 12,
      elevation: 4,
    },
    lg: {
      shadowColor: isDark ? '#000' : '#3C2880',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: isDark ? 0.6 : 0.16,
      shadowRadius: 24,
      elevation: 8,
    },
    purple: (color: string) => ({
      shadowColor: color,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.35,
      shadowRadius: 18,
      elevation: 8,
    }),
  },
};

export type Theme = typeof theme;
