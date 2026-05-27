import React from 'react';
import {
  TouchableOpacity, Text, StyleSheet, ViewStyle, ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../lib/ThemeContext';
import { Icon } from './Icon';

type Variant = 'primary' | 'secondary' | 'ghost' | 'dark' | 'danger';
type Size = 'lg' | 'md' | 'sm';

interface ButtonProps {
  children: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  style?: ViewStyle;
  fullWidth?: boolean;
}

const SIZE_MAP = {
  lg: { height: 58, fontSize: 17, borderRadius: 18, paddingHorizontal: 24, iconSize: 18 },
  md: { height: 48, fontSize: 15, borderRadius: 14, paddingHorizontal: 20, iconSize: 16 },
  sm: { height: 38, fontSize: 13, borderRadius: 11, paddingHorizontal: 16, iconSize: 14 },
};

export function Button({
  children,
  onPress,
  variant = 'primary',
  size = 'lg',
  disabled = false,
  loading = false,
  icon,
  style,
  fullWidth = true,
}: ButtonProps) {
  const t = useTheme();
  const sz = SIZE_MAP[size];

  const variantMap: Record<Variant, { bg: string; textColor: string; borderColor?: string }> = {
    primary:   { bg: t.purple,      textColor: '#fff' },
    secondary: { bg: '#fff',        textColor: t.ink,     borderColor: 'rgba(0,0,0,0.08)' },
    ghost:     { bg: 'transparent', textColor: t.purple },
    dark:      { bg: t.ink,         textColor: '#fff' },
    danger:    { bg: '#fff',        textColor: t.danger,  borderColor: '#F4C4CA' },
  };

  const vr = variantMap[variant];
  const bg = disabled ? '#E5E0F0' : vr.bg;
  const tc = disabled ? '#9A95AB' : vr.textColor;

  const primaryShadow: ViewStyle = (variant === 'primary' && !disabled) ? {
    shadowColor: t.purple,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 6,
  } : {};

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
      style={[
        styles.base,
        {
          height: sz.height,
          borderRadius: sz.borderRadius,
          paddingHorizontal: sz.paddingHorizontal,
          backgroundColor: bg,
          borderWidth: vr.borderColor ? 1 : 0,
          borderColor: vr.borderColor ?? 'transparent',
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
        },
        primaryShadow,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={tc} size="small" />
      ) : (
        <>
          {icon && <Icon name={icon} size={sz.iconSize} color={tc} />}
          <Text style={[styles.label, { fontSize: sz.fontSize, color: tc }]}>{children}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  label: {
    fontWeight: '600',
    letterSpacing: -0.2,
  },
});
