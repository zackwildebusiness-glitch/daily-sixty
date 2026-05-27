import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Line, Path, Circle } from 'react-native-svg';
import { useAppStore } from '../../store';
import { theme } from '../../lib/theme';
import { useTheme } from '../../lib/ThemeContext';
import { CATEGORIES } from '../../constants/categories';
import { getWeekHistory, computeStreak } from '../../lib/utils';
import { getWeeklyReflection } from '../../lib/api';
import { PurpleBackdrop } from '../../components/PurpleBackdrop';
import { Card } from '../../components/ui/Card';
import { Icon } from '../../components/ui/Icon';
import { WeekStrip } from '../../components/WeekStrip';

// A simple 7-point sparkline chart using real last-7-days completion data
function SparkChart({ goalId, color }: { goalId: string; color: string }) {
  const completions = useAppStore((s) => s.goals.find((g) => g.id === goalId)?.completions ?? []);
  const W = 300, H = 100, PAD = 10;

  // Build last-7-days history as 0 (missed) or 100 (done)
  const today = new Date();
  const data = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i)); // oldest → newest
    const key = d.toLocaleDateString('en-CA');
    return completions.some(c => c.date === key) ? 100 : 10;
  });

  const px = (i: number) => PAD + (i * (W - PAD * 2)) / 6;
  const py = (v: number) => H - PAD - (v / 100) * (H - PAD * 2);

  const pathD = data.reduce((acc, v, i) => {
    if (i === 0) return `M ${px(i)} ${py(v)}`;
    const x1 = px(i - 1) + (px(i) - px(i - 1)) / 2;
    const x2 = px(i) - (px(i) - px(i - 1)) / 2;
    return `${acc} C ${x1} ${py(data[i - 1])}, ${x2} ${py(v)}, ${px(i)} ${py(v)}`;
  }, '');

  return (
    <Svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
      {[25, 50, 75].map((v) => (
        <Line key={v} x1={PAD} x2={W - PAD} y1={py(v)} y2={py(v)} stroke={theme.hairline} strokeDasharray="2 4" />
      ))}
      <Path d={pathD} stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <Circle cx={px(6)} cy={py(data[6])} r="5" fill="#fff" stroke={color} strokeWidth="2.5" />
    </Svg>
  );
}

// 35-cell heatmap (5 weeks)
function HeatMap({ goalId, color }: { goalId: string; color: string }) {
  const completions = useAppStore((s) => s.goals.find((g) => g.id === goalId)?.completions ?? []);
  const today = new Date();

  const todayKey = today.toLocaleDateString('en-CA');
  const cells = Array.from({ length: 35 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (34 - i));
    const key = d.toLocaleDateString('en-CA');
    const isFuture = key > todayKey; // string compare works for YYYY-MM-DD
    if (isFuture) return -1;
    return completions.some((c) => c.date === key) ? 2 : 0;
  });

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5 }}>
      {cells.map((v, i) => (
        <View
          key={i}
          style={{
            width: '12%',
            aspectRatio: 1,
            borderRadius: 6,
            backgroundColor:
              v === -1 ? 'transparent' :
              v === 0 ? theme.hairline :
              color,
            borderWidth: v === -1 ? 1.5 : 0,
            borderColor: v === -1 ? theme.hairline : 'transparent',
            borderStyle: 'dashed',
          }}
        />
      ))}
    </View>
  );
}

export default function ProgressScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { goals, activeGoalId, setActiveGoal, user } = useAppStore();
  const active = goals.filter((g) => g.status === 'active');
  const goal = active.find((g) => g.id === activeGoalId) ?? active[0];

  // Reflection state — only fetched for Pro users
  const [reflection, setReflection] = useState<string | null>(null);
  const [reflectionLoading, setReflectionLoading] = useState(false);

  // Computed before the early return so they can be used in the effect below
  const weekHistory = goal ? getWeekHistory(goal.completions, goal.id) : [];
  const liveStreak = goal ? computeStreak(goal.completions) : 0;

  useEffect(() => {
    if (!user?.isPro || !goal) return;
    const completedDays = weekHistory.filter(Boolean).length;
    setReflectionLoading(true);
    getWeeklyReflection({
      goalName: goal.fullName,
      category: goal.category,
      completedDays,
      currentStep: goal.currentStep,
      streak: liveStreak,
    })
      .then(setReflection)
      .catch(() => setReflection(null))
      .finally(() => setReflectionLoading(false));
  // Re-fetch when the active goal or number of completions changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goal?.id, goal?.completions.length, user?.isPro]);

  if (!goal) {
    return (
      <View style={[styles.empty, { paddingTop: insets.top }]}>
        <Icon name="chart" size={48} color={theme.inkMute} />
        <Text style={styles.emptyText}>Complete your first action to see progress here.</Text>
      </View>
    );
  }

  const pp = theme.cat[goal.category];
  const pct = ((goal.currentStep - 1) / 7) * 100;
  const daysActive = Math.max(1, Math.ceil((Date.now() - new Date(goal.createdAt).getTime()) / 86400000));
  // On day 1 with no completions, a percentage is meaningless — show null so the UI
  // can display a more honest "Day one" message instead of "0% on track".
  const completionRate = daysActive <= 1 && goal.completions.length === 0
    ? null
    : Math.min(100, Math.round((goal.completions.length / daysActive) * 100));

  const heroMessage = completionRate === null
    ? "Day one — let's begin"
    : completionRate >= 70
      ? "You're on track"
      : completionRate >= 40
        ? 'Keep building'
        : 'Time to step it up';

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.content, { paddingTop: insets.top, paddingBottom: 130 }]}
      showsVerticalScrollIndicator={false}
    >
      <PurpleBackdrop height={220} />

      <View style={styles.header}>
        <Text style={styles.headerSub}>Your</Text>
        <Text style={styles.headerTitle}>Progress</Text>
      </View>

      {/* Hero card */}
      <View style={styles.section}>
        <View style={[styles.heroCard, { backgroundColor: theme.purple }]}>
          <View style={styles.heroDecor} />
          <View style={styles.heroContent}>
            <View style={styles.heroTitleRow}>
              <Text style={styles.heroTitle}>{heroMessage}</Text>
              <Icon name="sparkles" size={18} color="#FFE5A0" />
            </View>
            <Text style={styles.heroSub}>{Math.round(pct)}% through the plan · {Math.max(1, 7 - goal.currentStep)} steps to go</Text>
          </View>
        </View>
      </View>

      {/* Goal tabs */}
      {active.length > 1 && (
        <ScrollView
          horizontal showsHorizontalScrollIndicator={false}
          style={styles.tabs} contentContainerStyle={styles.tabsContent}
        >
          {active.map((g) => {
            const sel = g.id === goal.id;
            const gp = theme.cat[g.category];
            const gc = CATEGORIES.find((c) => c.id === g.category);
            return (
              <TouchableOpacity
                key={g.id}
                onPress={() => setActiveGoal(g.id)}
                style={[styles.tabChip, sel && styles.tabChipSel]}
                activeOpacity={0.8}
              >
                <View style={[styles.tabIcon, { backgroundColor: gp.bg }]}>
                  <Icon name={gc?.icon ?? 'target'} size={12} color="#fff" />
                </View>
                <Text style={[styles.tabName, sel && { color: '#fff' }]}>{g.shortName}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {/* Step progress */}
      <View style={styles.section}>
        <Card padding={18}>
          <View style={styles.stepRow}>
            <View>
              <Text style={styles.cardLabel}>THE 7-STEP PLAN</Text>
              <Text style={styles.cardTitle}>{goal.currentStep - 1} of 7 complete</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.cardMeta}>Est. finish</Text>
              <Text style={styles.cardMetaBold}>
                {goal.currentStep === 7
                  ? 'Final step!'
                  : `~${(7 - goal.currentStep) * 1}w left`}
              </Text>
            </View>
          </View>
          <View style={styles.stepper}>
            {Array.from({ length: 7 }).map((_, i) => {
              const done = i < goal.currentStep - 1;
              const current = i === goal.currentStep - 1;
              return (
                <React.Fragment key={i}>
                  <View style={[
                    styles.stepDot,
                    done && { backgroundColor: pp.bg },
                    current && { backgroundColor: '#fff', borderWidth: 3, borderColor: pp.bg },
                  ]}>
                    {done && <Icon name="check" size={12} color="#fff" strokeWidth={3} />}
                  </View>
                  {i < 6 && (
                    <View style={[styles.stepLine, i < goal.currentStep - 1 && { backgroundColor: pp.bg }]} />
                  )}
                </React.Fragment>
              );
            })}
          </View>
        </Card>
      </View>

      {/* This week streak */}
      <View style={styles.section}>
        <Card padding={18}>
          <View style={styles.weekHeader}>
            <Text style={styles.cardTitle}>This week</Text>
            <Text style={[styles.completionRate, { color: theme.success }]}>
            {completionRate === null ? 'Day 1' : `${completionRate}% on track`}
          </Text>
          </View>
          <WeekStrip history={weekHistory} streakColor={pp.bg} />
        </Card>
      </View>

      {/* Sparkline chart */}
      <View style={styles.section}>
        <Card padding={18}>
          <Text style={[styles.cardTitle, { marginBottom: 14 }]}>Last 7 days</Text>
          <SparkChart goalId={goal.id} color={pp.bg} />
        </Card>
      </View>

      {/* Heatmap */}
      <View style={styles.section}>
        <Card padding={18}>
          <View style={styles.heatHeader}>
            <View>
              <Text style={styles.cardTitle}>Consistency</Text>
              <Text style={styles.cardMeta}>Last 5 weeks</Text>
            </View>
            <View style={styles.heatLegend}>
              <Text style={styles.legendText}>Less</Text>
              {[theme.hairline, pp.soft, pp.bg].map((c, i) => (
                <View key={i} style={[styles.legendDot, { backgroundColor: c }]} />
              ))}
              <Text style={styles.legendText}>More</Text>
            </View>
          </View>
          <HeatMap goalId={goal.id} color={pp.bg} />
        </Card>
      </View>

      {/* Weekly AI reflection (Pro) or streak nudge (free) */}
      <View style={styles.section}>
        <Card padding={18} style={{ backgroundColor: theme.surface, borderWidth: 1, borderColor: pp.soft }}>
          <View style={styles.insightHeader}>
            <View style={styles.insightIcon}>
              <Icon name="sparkles" size={16} color="#fff" />
            </View>
            <Text style={styles.cardTitle}>Your week in review</Text>
          </View>
          {user?.isPro ? (
            reflectionLoading ? (
              <ActivityIndicator size="small" color={pp.bg} style={{ marginTop: 8 }} />
            ) : (
              <Text style={styles.insightText}>
                {reflection ?? 'Reflection will appear here after your first completion this week.'}
              </Text>
            )
          ) : (
            <Text style={styles.insightText}>
              {liveStreak > 0
                ? `You're on a ${liveStreak}-day streak — keep the momentum going. Upgrade to Pro to unlock your personalised weekly AI reflection.`
                : 'Complete your first action today to start your streak. Upgrade to Pro to unlock weekly AI reflections.'}
            </Text>
          )}
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: theme.surface },
  content: {},
  empty: { flex: 1, backgroundColor: theme.bg, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30, gap: 16 },
  emptyText: { fontSize: 15, color: theme.inkSoft, textAlign: 'center' },
  header: { paddingHorizontal: 22, paddingBottom: 8, paddingTop: 8 },
  headerSub: { fontSize: 14, color: 'rgba(255,255,255,0.85)' },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#fff', letterSpacing: -1 },
  section: { paddingHorizontal: 22, paddingTop: 12 },
  heroCard: {
    borderRadius: 22, padding: 20, overflow: 'hidden',
    shadowColor: '#3C2880', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.28, shadowRadius: 24, elevation: 8,
  },
  heroDecor: {
    position: 'absolute', top: -40, right: -40,
    width: 110, height: 110, borderRadius: 55,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  heroContent: { paddingRight: 70 },
  heroTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  heroTitle: { fontSize: 22, fontWeight: '800', color: '#fff', letterSpacing: -0.6 },
  heroSub: { fontSize: 13, color: 'rgba(255,255,255,0.9)' },
  tabs: { marginTop: 12 },
  tabsContent: { paddingHorizontal: 22, gap: 8 },
  tabChip: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999,
    backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.hairline,
  },
  tabChipSel: { backgroundColor: theme.ink, borderColor: 'transparent' },
  tabIcon: { width: 22, height: 22, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  tabName: { fontSize: 12, fontWeight: '700', color: theme.ink },
  cardLabel: { fontSize: 11, fontWeight: '700', color: theme.inkMute, letterSpacing: 0.6, textTransform: 'uppercase' },
  cardTitle: { fontSize: 17, fontWeight: '800', color: theme.ink, letterSpacing: -0.3, marginTop: 2 },
  cardMeta: { fontSize: 12, color: theme.inkSoft },
  cardMetaBold: { fontSize: 14, fontWeight: '700', color: theme.ink },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 },
  stepper: { flexDirection: 'row', alignItems: 'center' },
  stepDot: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: theme.hairline,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  stepLine: { flex: 1, height: 3, backgroundColor: theme.hairline, borderRadius: 2 },
  weekHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  completionRate: { fontSize: 12, fontWeight: '700' },
  heatHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 },
  heatLegend: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendText: { fontSize: 11, color: theme.inkMute },
  legendDot: { width: 10, height: 10, borderRadius: 3 },
  insightHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  insightIcon: {
    width: 28, height: 28, borderRadius: 9, backgroundColor: theme.ink,
    alignItems: 'center', justifyContent: 'center',
  },
  insightText: { fontSize: 13, lineHeight: 20, color: theme.ink },
});
