import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

const COLORS = ['#FF7170', '#FFB547', '#22B789', '#5B7CFA', '#F76FA8', '#7C5CFF'];

interface AvatarProps {
  name: string;
  size?: number;
  ring?: boolean;
  style?: ViewStyle;
}

export function Avatar({ name, size = 44, ring = false, style }: AvatarProps) {
  const idx = ((name.charCodeAt(0) || 0) + (name.charCodeAt(1) || 0)) % COLORS.length;
  const color = COLORS[idx];
  const initials = name
    .split(' ')
    .map((s) => s[0]?.toUpperCase() ?? '')
    .slice(0, 2)
    .join('');

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          alignItems: 'center',
          justifyContent: 'center',
          ...(ring ? {
            shadowColor: '#fff',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 1,
            shadowRadius: 0,
            borderWidth: 3,
            borderColor: 'rgba(255,255,255,0.5)',
          } : {
            shadowColor: '#281450',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.18,
            shadowRadius: 8,
            elevation: 3,
          }),
        },
        style,
      ]}
    >
      <Text style={{ color: '#fff', fontWeight: '700', fontSize: size * 0.38 }}>{initials}</Text>
    </View>
  );
}
