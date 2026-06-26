import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../store';
import { theme } from '../../lib/theme';
import { CATEGORIES } from '../../constants/categories';
import { Icon } from '../../components/ui/Icon';
import { CategoryId } from '../../store/types';

export default function CategoryScreen() {
  const router = useRouter();
  const { setCreateFlow, resetCreateFlow, goals, hasSeenOnboarding } = useAppStore();

  // Always start with a clean slate so stale partial state from an abandoned flow
  // doesn't pre-fill the next goal creation.
  useEffect(() => { resetCreateFlow(); }, []);

  const pick = (id: CategoryId) => {
    setCreateFlow({ category: id });
    router.push('/create/input');
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        {hasSeenOnboarding && goals.length > 0 && (
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Icon name="arrow-left" size={20} color={theme.ink} />
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.title}>What do you want to achieve?</Text>
      <Text style={styles.subtitle}>Pick a category to get started.</Text>

      <View style={styles.grid}>
        {CATEGORIES.map((c) => {
          const palette = theme.cat[c.id];
          return (
            <TouchableOpacity
              key={c.id}
              onPress={() => pick(c.id)}
              activeOpacity={0.85}
              style={[styles.card, { backgroundColor: palette.bg }]}
            >
              <View style={styles.decorCircle} />
              <View style={styles.iconWrap}>
                <Icon name={c.icon} size={22} color="#fff" />
              </View>
              <View>
                <Text style={styles.cardLabel}>{c.label}</Text>
                <Text style={styles.cardSub}>{c.subtitle}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: theme.bg },
  content: { padding: 22, paddingTop: 14, paddingBottom: 18, maxWidth: 480, width: '100%', alignSelf: 'center' },
  header: { flexDirection: 'row', marginBottom: 4 },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#3C2880', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 1,
  },
  title: { fontSize: 25, fontWeight: '800', letterSpacing: -0.8, color: theme.ink, marginBottom: 4 },
  subtitle: { fontSize: 14, color: theme.inkSoft, marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: {
    width: '47%',
    height: 118,
    borderRadius: 20,
    padding: 14,
    justifyContent: 'space-between',
    overflow: 'hidden',
    shadowColor: '#3C2880',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 18,
    elevation: 4,
  },
  decorCircle: {
    position: 'absolute', top: -30, right: -30,
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  iconWrap: {
    width: 40, height: 40, borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center', justifyContent: 'center',
  },
  cardLabel: { fontSize: 15, fontWeight: '700', color: '#fff', letterSpacing: -0.3 },
  cardSub: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 3 },
});
