import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore } from '../../store';
import { theme } from '../../lib/theme';
import { CATEGORIES } from '../../constants/categories';
import { computeStreak } from '../../lib/utils';
import { Header } from '../../components/ui/Header';
import { Button } from '../../components/ui/Button';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { StepAccordion } from '../../components/StepAccordion';
import { Icon } from '../../components/ui/Icon';

export default function GoalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { goals, pauseGoal, resumeGoal, abandonGoal } = useAppStore();
  const goal = goals.find((g) => g.id === id);

  // Navigate back inside useEffect — never call router.back() during render.
  // Calling navigation during render is a React anti-pattern that causes
  // issues in strict mode and can trigger double-navigation.
  useEffect(() => {
    if (!goal) {
      router.back();
    }
  }, [goal, router]);

  if (!goal) return null;

  const pp = theme.cat[goal.category];
  const cat = CATEGORIES.find((c) => c.id === goal.category);
  const liveStreak = computeStreak(goal.completions);
  const pct = ((goal.currentStep - 1) / 7) * 100;
  const daysActive = Math.ceil(
    (Date.now() - new Date(goal.createdAt).getTime()) / 86400000
  );

  const handlePause = () => {
    if (goal.status === 'paused') {
      resumeGoal(goal.id);
    } else {
      pauseGoal(goal.id);
    }
  };

  const handleAbandon = () => {
    Alert.alert(
      'Abandon goal?',
      `Are you sure you want to abandon "${goal.shortName}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Abandon', style: 'destructive', onPress: () => { abandonGoal(goal.id); router.back(); } },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={[pp.bg, pp.deep]} start={{ x: 0.16, y: 0 }} end={{ x: 1, y: 1 }}>
        <Header onBack={() => router.back()} light />
        <View style={[styles.heroContent, { paddingBottom: insets.top > 0 ? 16 : 22 }]}>
          <View style={styles.catChip}>
            <Icon name={cat?.icon ?? 'target'} size={14} color="#fff" />
            <Text style={styles.catChipText}>{cat?.label}</Text>
          </View>

          <Text style={styles.heroTitle}>{goal.fullName}</Text>
          <Text style={styles.heroSub}>Started {daysActive} day{daysActive !== 1 ? 's' : ''} ago</Text>

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>STEP</Text>
              <Text style={styles.statNum}>{goal.currentStep} <Text style={styles.statOf}>of 7</Text></Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>STREAK</Text>
              <Text style={styles.statNum}>{liveStreak}d</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>BEST</Text>
              <Text style={styles.statNum}>{Math.max(goal.bestStreak, liveStreak)}d</Text>
            </View>
          </View>

          <ProgressBar value={pct} color="#fff" track="rgba(255,255,255,0.25)" height={6} style={{ marginTop: 16 }} />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionLabel}>The 7-step plan</Text>
        <StepAccordion
          steps={goal.steps}
          currentStep={goal.currentStep}
          accentColor={pp.bg}
          initialOpen={goal.currentStep - 1}
        />

        <View style={styles.actions}>
          <View style={styles.flex}>
            <Button
              onPress={handlePause}
              variant="secondary"
            >
              {goal.status === 'paused' ? 'Resume goal' : 'Pause goal'}
            </Button>
          </View>
          <View style={styles.flex}>
            <Button onPress={handleAbandon} variant="danger">Abandon</Button>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  flex: { flex: 1 },
  heroContent: { paddingHorizontal: 22 },
  catChip: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999,
    marginBottom: 12,
  },
  catChipText: { fontSize: 12, fontWeight: '700', color: '#fff' },
  heroTitle: { fontSize: 28, fontWeight: '800', color: '#fff', letterSpacing: -0.8, marginBottom: 4 },
  heroSub: { fontSize: 13, color: 'rgba(255,255,255,0.85)' },
  statsRow: { flexDirection: 'row', marginTop: 16, gap: 12 },
  stat: { flex: 1 },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase' },
  statNum: { fontSize: 22, fontWeight: '800', color: '#fff', letterSpacing: -0.5, marginTop: 2 },
  statOf: { fontSize: 14, fontWeight: '600', opacity: 0.6 },
  body: { padding: 22 },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: theme.inkSoft, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 24 },
});
