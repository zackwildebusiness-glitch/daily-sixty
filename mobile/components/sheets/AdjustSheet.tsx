import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { theme } from '../../lib/theme';
import { useTheme } from '../../lib/ThemeContext';
import { Icon } from '../ui/Icon';

interface Option {
  icon: string;
  title: string;
  description: string;
  onPress: () => void;
}

interface AdjustSheetProps {
  sheetRef: React.RefObject<BottomSheet | null>;
  onSwap: () => void;
  onSimplify: () => void;
}

export function AdjustSheet({ sheetRef, onSwap, onSimplify }: AdjustSheetProps) {
  const snapPoints = useMemo(() => ['40%'], []);
  const { purple } = useTheme();

  const options: Option[] = [
    { icon: 'refresh',   title: 'Swap for a similar action', description: 'AI will suggest an alternative',      onPress: onSwap },
    { icon: 'sparkles',  title: 'Too hard — simplify it',   description: 'Tone it down without losing momentum', onPress: onSimplify },
  ];

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      backdropComponent={(props) => (
        <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.4} />
      )}
      handleIndicatorStyle={styles.handle}
      backgroundStyle={styles.bg}
    >
      <BottomSheetView style={styles.content}>
        <Text style={styles.title}>Adjust today's action</Text>
        <Text style={styles.subtitle}>Make it work for the day you're actually having.</Text>

        {options.map((o, i) => (
          <TouchableOpacity key={i} onPress={() => { o.onPress(); sheetRef.current?.close(); }} style={styles.option} activeOpacity={0.8}>
            <View style={styles.optionIcon}>
              <Icon name={o.icon} size={20} color={purple} />
            </View>
            <View style={styles.optionText}>
              <Text style={styles.optionTitle}>{o.title}</Text>
              <Text style={styles.optionDesc}>{o.description}</Text>
            </View>
            <Icon name="chevron-right" size={18} color={theme.inkMute} />
          </TouchableOpacity>
        ))}

        <TouchableOpacity onPress={() => sheetRef.current?.close()} style={styles.cancel}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </BottomSheetView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  bg: { backgroundColor: theme.surface },
  handle: { backgroundColor: theme.hairline, width: 40, height: 4 },
  content: { paddingHorizontal: 22, paddingTop: 8, paddingBottom: 32 },
  title: { fontSize: 20, fontWeight: '800', color: theme.ink, letterSpacing: -0.5, marginBottom: 4 },
  subtitle: { fontSize: 13, color: theme.inkSoft, marginBottom: 18 },
  option: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: theme.surfaceSoft, borderRadius: 16,
    padding: 14, marginBottom: 10,
  },
  optionIcon: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: theme.surface,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#3C2880', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 1,
  },
  optionText: { flex: 1 },
  optionTitle: { fontSize: 15, fontWeight: '700', color: theme.ink },
  optionDesc: { fontSize: 12, color: theme.inkSoft, marginTop: 2 },
  cancel: { padding: 14, alignItems: 'center', marginTop: 4 },
  cancelText: { fontSize: 14, fontWeight: '600', color: theme.inkSoft },
});
