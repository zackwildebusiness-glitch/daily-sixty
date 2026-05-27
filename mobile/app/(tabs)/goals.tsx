import React, { useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BottomSheet from '@gorhom/bottom-sheet';
import { useAppStore } from '../../store';
import { theme } from '../../lib/theme';
import { useTheme } from '../../lib/ThemeContext';
import { CATEGORIES } from '../../constants/categories';
import { PurpleBackdrop } from '../../components/PurpleBackdrop';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { Pill } from '../../components/ui/Pill';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { PaywallSheet } from '../../components/sheets/PaywallSheet';
import { computeStreak } from '../../lib/utils';

export default function GoalsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const paywallRef = useRef<BottomSheet>(null);
  const { purple } = useTheme();

  const { goals, user } = useAppStore();
  const active = goals.filter((g) => g.status === 'active');
  const completed = goals.filter((g) => g.status === 'completed');

  const handleAdd = () => {
    if (!user?.isPro && active.length >= 1) {
      paywallRef.current?.expand();
      return;
    }
    router.push('/create/category');
  };

  return (
    <>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingTop: insets.top, paddingBottom: 130 }]}
        showsVerticalScrollIndicator={false}
      >
        <PurpleBackdrop height={180} />

        <View style={styles.header}>
          <View>
            <Text style={styles.headerSub}>Your</Text>
            <Text style={styles.headerTitle}>Goals</Text>
          </View>
          <TouchableOpacity onPress={handleAdd} style={styles.addBtn} activeOpacity={0.85}>
            <Icon name="plus" size={18} color={purple} strokeWidth={2.4} />
            <Text style={styles.addBtnText}>New goal</Text>
          </TouchableOpacity>
        </View>

        {/* Active section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ACTIVE · {active.length}</Text>

          {active.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No active goals yet.</Text>
              <Button onPress={() => router.push('/create/category')} size="md">Set my first goal</Button>
            </View>
          ) : (
            active.map((g) => {
              const pp = theme.cat[g.category];
              const cat = CATEGORIES.find((c) => c.id === g.category);
              const pct = ((g.currentStep - 1) / 7) * 100;
              const liveStreak = computeStreak(g.completions);
              const onTrack = liveStreak >= 3;
              const statusColor = onTrack ? theme.success : '#E89831';
              const statusLabel = onTrack ? 'On track' : 'Keep going';

              return (
                <Card
                  key={g.id}
                  onPress={() => router.push(`/goal/${g.id}`)}
                  padding={18}
                  style={styles.goalCard}
                >
                  <View style={[styles.goalDecor, { backgroundColor: pp.soft }]} />
                  <View style={styles.goalRow}>
                    <View style={[styles.goalIcon, { backgroundColor: pp.bg, shadowColor: pp.bg }]}>
                      <Icon name={cat?.icon ?? 'target'} size={24} color="#fff" />
                    </View>
                    <View style={styles.goalInfo}>
                      <View style={styles.goalTitleRow}>
                        <Text style={styles.goalName} numberOfLines={1}>{g.shortName}</Text>
                        <Pill color={statusColor}>{statusLabel}</Pill>
                      </View>
                      <Text style={styles.goalFull} numberOfLines={1}>{g.fullName}</Text>
                      <ProgressBar value={pct} color={pp.bg} height={6} style={{ marginTop: 12 }} />
                      <View style={styles.goalMeta}>
                        <Text style={styles.goalStep}>Step {g.currentStep} of 7 · {Math.round(pct)}%</Text>
                        <View style={styles.streakChip}>
                          <Icon name="flame" size={13} color={theme.streakFlame} />
                          <Text style={styles.streakNum}>{liveStreak}</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </Card>
              );
            })
          )}
        </View>

        {/* Completed section */}
        {completed.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: theme.inkMute }]}>COMPLETED · {completed.length}</Text>
            {completed.map((g, i) => {
              const pp = theme.cat[g.category];
              return (
                <TouchableOpacity
                  key={g.id}
                  onPress={() => router.push(`/goal/${g.id}`)}
                  style={styles.completedCard}
                  activeOpacity={0.85}
                >
                  <View style={[styles.completedIcon, { backgroundColor: pp.soft }]}>
                    <Icon name="trophy" size={18} color={pp.deep} />
                  </View>
                  <View style={styles.flex}>
                    <Text style={styles.completedName}>{g.shortName}</Text>
                    <Text style={styles.completedDate}>Completed · {new Date(g.createdAt).toLocaleDateString()}</Text>
                  </View>
                  <Icon name="chevron-right" size={18} color={theme.inkMute} />
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      <PaywallSheet
        sheetRef={paywallRef}
        onPurchase={(_plan) => {
          paywallRef.current?.close();
          Alert.alert(
            'Coming soon',
            'In-app purchases will be available at launch. Stay tuned!',
            [{ text: 'OK' }],
          );
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: theme.surface },
  content: {},
  flex: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 22, paddingBottom: 8, paddingTop: 8,
  },
  headerSub: { fontSize: 14, color: 'rgba(255,255,255,0.85)' },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#fff', letterSpacing: -1 },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 16,
  },
  addBtnText: { fontSize: 13, fontWeight: '700', color: theme.ink },
  section: { padding: 22, paddingTop: 16 },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.7)', letterSpacing: 1, marginBottom: 12 },
  goalCard: { marginBottom: 12, overflow: 'hidden' },
  goalDecor: { position: 'absolute', top: -40, right: -40, width: 140, height: 140, borderRadius: 70, opacity: 0.5 },
  goalRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  goalIcon: {
    width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
    shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 4,
  },
  goalInfo: { flex: 1, minWidth: 0 },
  goalTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  goalName: { flex: 1, fontSize: 16, fontWeight: '800', color: theme.ink, letterSpacing: -0.3 },
  goalFull: { fontSize: 12, color: theme.inkSoft, marginTop: 4 },
  goalMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  goalStep: { fontSize: 12, color: theme.inkSoft },
  streakChip: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  streakNum: { fontSize: 12, fontWeight: '700', color: theme.streakFlame },
  emptyCard: { backgroundColor: theme.surface, borderRadius: 20, padding: 24, alignItems: 'center', gap: 16 },
  emptyText: { fontSize: 15, color: theme.inkSoft, textAlign: 'center' },
  completedCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: theme.surfaceSoft, borderRadius: 16, padding: 12, marginBottom: 8, opacity: 0.85,
  },
  completedIcon: { width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  completedName: { fontSize: 14, fontWeight: '700', color: theme.ink },
  completedDate: { fontSize: 12, color: theme.inkSoft },
});
