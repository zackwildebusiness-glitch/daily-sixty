import React from 'react';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../lib/ThemeContext';

interface PurpleBackdropProps {
  height?: number;
  children?: React.ReactNode;
}

export function PurpleBackdrop({ height = 280, children }: PurpleBackdropProps) {
  const theme = useTheme();
  return (
    <LinearGradient
      colors={[theme.purpleSoft, theme.purpleBg, theme.purpleBgDeep]}
      start={{ x: 0.2, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[StyleSheet.absoluteFill, { height }]}
    >
      {children}
    </LinearGradient>
  );
}
