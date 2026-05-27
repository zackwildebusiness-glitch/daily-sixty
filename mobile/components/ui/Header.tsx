import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../../lib/theme';
import { Icon } from './Icon';

interface HeaderProps {
  title?: string;
  onBack?: () => void;
  right?: React.ReactNode;
  light?: boolean; // white text/icons (on dark bg)
}

export function Header({ title, onBack, right, light = false }: HeaderProps) {
  const router = useRouter();
  const handleBack = onBack ?? (() => router.back());
  const iconColor = light ? '#fff' : theme.ink;
  const titleColor = light ? '#fff' : theme.ink;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={handleBack}
        style={[styles.backBtn, light ? styles.backBtnLight : styles.backBtnDark]}
        activeOpacity={0.8}
      >
        <Icon name="arrow-left" size={20} color={iconColor} />
      </TouchableOpacity>

      <Text style={[styles.title, { color: titleColor }]} numberOfLines={1}>
        {title ?? ''}
      </Text>

      <View style={styles.right}>
        {right ?? null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnDark: {
    backgroundColor: '#fff',
    shadowColor: '#3C2880',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
  },
  backBtnLight: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
  },
  right: {
    width: 40,
    alignItems: 'flex-end',
  },
});
