import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../lib/ThemeContext';

interface PillProps {
  children: string;
  color?: string;
  soft?: boolean;
  style?: ViewStyle;
}

export function Pill({ children, color, soft = true, style }: PillProps) {
  const theme = useTheme();
  const tint = color ?? theme.purple;
  return (
    <View
      style={[
        styles.pill,
        {
          backgroundColor: soft ? `${tint}1A` : tint,
        },
        style,
      ]}
    >
      <Text style={[styles.text, { color: soft ? tint : '#fff' }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
});
