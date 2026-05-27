import React, { createContext, useContext, useMemo } from 'react';
import { theme as baseTheme } from './theme';
import { PALETTES } from './themes';
import { useAppStore } from '../store';

type AppTheme = typeof baseTheme;

const ThemeContext = createContext<AppTheme>(baseTheme);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const themeId = useAppStore((s) => s.user?.themeId ?? 'violet');
  const palette = PALETTES[themeId] ?? PALETTES.violet;

  const computed = useMemo<AppTheme>(() => ({
    ...baseTheme,
    purple: palette.accent,
    purpleDeep: palette.accentDeep,
    purpleSoft: palette.accentSoft,
    purpleLavender: palette.accentLavender,
    purpleBg: palette.accentBg,
    purpleBgDeep: palette.accentBgDeep,
  }), [themeId]);

  return <ThemeContext.Provider value={computed}>{children}</ThemeContext.Provider>;
}

export function useTheme(): AppTheme {
  return useContext(ThemeContext);
}
