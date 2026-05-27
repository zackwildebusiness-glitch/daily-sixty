import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../lib/ThemeContext';

interface ProgressBarProps {
  value: number; // 0–100
  color?: string;
  height?: number;
  track?: string;
  style?: ViewStyle;
}

export function ProgressBar({
  value,
  color,
  height = 8,
  track = '#EEE9F8',
  style,
}: ProgressBarProps) {
  const theme = useTheme();
  const fill = color ?? theme.purple;
  const pct = Math.min(100, Math.max(0, value));
  return (
    <View style={[{ height, borderRadius: 999, backgroundColor: track, overflow: 'hidden' }, style]}>
      <View
        style={{
          height: '100%',
          width: `${pct}%`,
          backgroundColor: fill,
          borderRadius: 999,
        }}
      />
    </View>
  );
}
