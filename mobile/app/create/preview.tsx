import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore, buildGoalFromFlow } from '../../store';
import { theme } from '../../lib/theme';
import { CATEGORIES } from '../../constants/categories';
import { Header } from '../../components/ui/Header';
import { Button } from '../../components/ui/Button';
import { StepAccordion } from '../../components/StepAccordion';
import { Icon } from '../../components/ui/Icon';
import { buildFallbackPlan } from '../../lib/utils';

export default function PreviewScreen() {
  const router = useRouter();
  const { createFlow, addGoal, resetCreateFlow } = useAppStore();

  const category = createFlow.category ?? 'health';
  const goalText = createFlow.goalText ?? 'My goal';
  const steps = createFlow.generatedSteps ?? buildFallbackPlan(goalText, category);
  const palette = theme.cat[category];
  const cat = CATEGORIES.find((c) => c.id === category)!;

  const onStart = () => {
    const goal = buildGoalFromFlow(goalText, category, steps);
    addGoal(goal);
    resetCreateFlow();
    router.replace('/(tabs)');
  };

  const onRegen = () => {
    router.replace('/create/generating');
  };

  return (
    <View style={styles.container}>
      <Header onBack={() => router.back()} />

      <View style={styles.headerInfo}>
        <View style={[styles.catChip, { backgroundColor: palette.soft }]}>
          <View style={[styles.catIcon, { backgroundColor: palette.bg }]}>
            <Icon name={cat?.icon ?? 'target'} size={13} color="#fff" />
          </View>
          <Text style={[styles.catLabel, { color: palette.deep }]}>{cat?.label}</Text>
        </View>

        <Text style={styles.title}>Your 60-Minute Plan</Text>
        <Text style={styles.goalName}>{goalText}</Text>

        <View style={styles.metaRow}>
          <Icon name="clock" size={14} color={theme.inkMute} />
          <Text style={styles.metaText}>Complete in ~7–10 weeks · 15 min/day</Text>
        </View>
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.steps}
        showsVerticalScrollIndicator={false}
      >
        <StepAccordion
          steps={steps}
          currentStep={1}
          accentColor={palette.bg}
          initialOpen={0}
        />

        <TouchableOpacity onPress={onRegen} style={styles.regenBtn} activeOpacity={0.7}>
          <Icon name="refresh" size={14} color={theme.inkSoft} />
          <Text style={styles.regenText}>I don't like this plan</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.cta}>
        <Button onPress={onStart}>Start my journey</Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: theme.bg },
  headerInfo: { paddingHorizontal: 22, paddingBottom: 14 },
  catChip: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 999, marginBottom: 14,
  },
  catIcon: { width: 22, height: 22, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  catLabel: { fontSize: 11, fontWeight: '700' },
  title: { fontSize: 26, fontWeight: '800', letterSpacing: -0.8, color: theme.ink, marginBottom: 4 },
  goalName: { fontSize: 15, color: theme.inkSoft, marginBottom: 6 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 12, color: theme.inkMute },
  steps: { paddingHorizontal: 22, paddingBottom: 16 },
  regenBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    alignSelf: 'center', marginTop: 14, marginBottom: 4,
    padding: 8,
  },
  regenText: { fontSize: 13, fontWeight: '600', color: theme.inkSoft },
  cta: { paddingHorizontal: 22, paddingBottom: 32 },
});
