import React, { useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, AppState, AppStateStatus,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BottomSheet from '@gorhom/bottom-sheet';
import { useAppStore } from '../../store';
import { theme } from '../../lib/theme';
import { useTheme } from '../../lib/ThemeContext';
import { CATEGORIES, MOTIVATIONAL_QUOTES } from '../../constants/categories';
import { greeting, getToday, getWeekHistory, nextActionIn, computeStreak } from '../../lib/utils';
import { adjustAction, getTodayAction } from '../../lib/api';
import { PurpleBackdrop } from '../../components/PurpleBackdrop';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { Avatar } from '../../components/ui/Avatar';
import { WeekStrip } from '../../components/WeekStrip';
import { AdjustSheet } from '../../components/sheets/AdjustSheet';
import { PaywallSheet } from '../../components/sheets/PaywallSheet';

export default function TodayScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const adjustRef = useRef<BottomSheet>(null);
  const paywallRef = useRef<BottomSheet>(null);

  const theme = useTheme();
  const {
    user, goals, activeGoalId, setActiveGoal,
    completeAction, isTodayCompleted, setTodayAction,
  } = useAppStore();

  const activeGoals = goals.filter((g) => g.status === 'active');
  const activeGoal = activeGoals.find((g) => g.id === activeGoalId) ?? activeGoals[0];
  const otherGoals = activeGoals.filter((g) => g.id !== activeGoal?.id);

  const isDone = activeGoal ? isTodayCompleted(activeGoal.id) : false;
  const palette = activeGoal ? theme.cat[activeGoal.category] : theme.cat.health;
  const cat = activeGoal ? CATEGORIES.find((c) => c.id === activeGoal.category) : null;

  const quote = MOTIVATIONAL_QUOTES[new Date().getDate() % MOTIVATIONAL_QUOTES.length];

  /**
   * Fetches today's action when:
   *   (a) No action exists yet for this goal/step, or
   *   (b) The cached action's date is stale (yesterday's action)
   *
   * Re-runs when the active goal ID or currentStep changes (e.g. step advances).
   * Also triggered by the AppState foreground listener below, which handles the
   * "app left open overnight" case where deps don't change but the date rolls over.
   */
  const fetchTodayAction = (goal: typeof activeGoal | null) => {
    if (!goal) return;
    const today = getToday();
    if (goal.todayAction?.date === today) return;

    const step = goal.steps[goal.currentStep - 1];
    if (!step) return;

    getTodayAction({
      goal: goal.fullName,
      category: goal.category,
      stepTitle: step.title,
      stepDescription: step.description,
      stepNumber: goal.currentStep,
      date: today,
    })
      .then((action) => setTodayAction(goal.id, action))
      .catch(() => {
        // Fallback: use first sentence of step description as action
        const currentGoal = useAppStore.getState().goals.find(g => g.id === goal.id);
        if (!currentGoal?.todayAction) {
          setTodayAction(goal.id, {
            title: step.description.split('.')[0] + '.',
            why: step.description,
            minutes: 15,
            date: today,
          });
        }
      });
  };

  useEffect(() => {
    fetchTodayAction(activeGoal);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeGoal?.id, activeGoal?.currentStep]);

  /**
   * AppState listener — fires when the app returns to the foreground.
   * Handles the case where the user left the app running overnight:
   * the date changes but component deps (goal.id, currentStep) don't, so
   * the fetch effect above would never re-run without this listener.
   *
   * Reads the active goal directly from the store (not from the closure)
   * to avoid acting on stale data.
   */
  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        const storeState = useAppStore.getState();
        const currentGoal = storeState.goals.find(
          (g) => g.id === storeState.activeGoalId && g.status === 'active'
        );
        fetchTodayAction(currentGoal ?? null);
      }
    });
    return () => sub.remove();
  }, []); // Empty deps: listener registered once, reads store directly

  const handleSwap = () => {
    if (!activeGoal) return;
    adjustAction({
      action: activeGoal.todayAction?.title ?? '',
      goal: activeGoal.fullName,
      category: activeGoal.category,
      type: 'swap',
    })
      .then((action) => setTodayAction(activeGoal.id, action))
      .catch(() => Alert.alert('Could not connect', 'Please try again later.'));
  };

  const handleSimplify = () => {
    if (!activeGoal) return;
    adjustAction({
      action: activeGoal.todayAction?.title ?? '',
      goal: activeGoal.fullName,
      category: activeGoal.category,
      type: 'simplify',
    })
      .then((action) => setTodayAction(activeGoal.id, action))
      .catch(() => Alert.alert('Could not connect', 'Please try again later.'));
  };

  const handleBell = () => router.push('/(tabs)/profile');

  if (!activeGoal) {
    return (
      <View style={[styles.empty, { paddingTop: insets.top }]}>
        <Icon name="target" size={56} color={theme.inkMute} />
        <Text style={styles.emptyTitle}>No active goals yet</Text>
        <Text style={styles.emptyBody}>Your first goal is one tap away.</Text>
        <View style={{ width: '100%', paddingHorizontal: 22, marginTop: 24 }}>
          <Button onPress={() => router.push('/create/category')}>Set my first goal</Button>
        </View>
      </View>
    );
  }

  const weekHistory = getWeekHistory(activeGoal.completions, activeGoal.id);
  const lastCompletion = activeGoal.completions[activeGoal.completions.length - 1];
  const action = activeGoal.todayAction;
  // Compute streak live so it reads as 0 if the user broke their streak since last completion
  const liveStreak = computeStreak(activeGoal.completions);

  return (
    <>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingTop: insets.top, paddingBottom: 130 }]}
        showsVerticalScrollIndicator={false}
      >
        <PurpleBackdrop height={320} />

        {/* Header */}
        <View style={styles.topRow}>
          <View style={styles.flex}>
            <Text style={styles.greeting}>{greeting()}</Text>
            <Text style={styles.name}>{user?.name ?? 'there'}</Text>
          </View>
          <TouchableOpacity style={styles.bellBtn} onPress={handleBell}>
            <Icon name="bell" size={20} color="#fff" />
          </TouchableOpacity>
          <Avatar name={user?.name ?? 'U'} size={44} ring />
        </View>

        {/* Goal selector pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.pillScroll}
          contentContainerStyle={styles.pillContent}
        >
          {activeGoals.map((g) => {
            const sel = g.id === activeGoal.id;
            const pp = theme.cat[g.category];
            const gc = CATEGORIES.find((c) => c.id === g.category);
            return (
              <TouchableOpacity
                key={g.id}
                onPress={() => setActiveGoal(g.id)}
                activeOpacity={0.8}
                style={[styles.pill, sel && styles.pillSel]}
              >
                <View style={[styles.pillIcon, { backgroundColor: pp.bg }]}>
                  <Icon name={gc?.icon ?? 'target'} size={13} color="#fff" />
                </View>
                <Text style={[styles.pillName, sel && { color: theme.ink }]}>{g.shortName}</Text>
                <Text style={[styles.pillStep, sel && { color: theme.inkSoft }]}>Step {g.currentStep}/7</Text>
              </TouchableOpacity>
            );
          })}
          <TouchableOpacity
            onPress={() => router.push('/create/category')}
            style={styles.addPill}
            activeOpacity={0.8}
          >
            <Icon name="plus" size={18} color="#fff" />
          </TouchableOpacity>
        </ScrollView>

        {/* Today's Action Card */}
        <View style={styles.cardWrap}>
          <View style={styles.actionCard}>
            <View style={styles.actionTop}>
              <View style={styles.actionDotRow}>
                <View style={[styles.dot, { backgroundColor: isDone ? theme.success : palette.bg }]} />
                <Text style={styles.actionTopLabel}>Today's Action</Text>
              </View>
              <View style={[styles.stepBadge, { backgroundColor: palette.soft }]}>
                <Text style={[styles.stepBadgeText, { color: palette.deep }]}>Step {activeGoal.currentStep} of 7</Text>
              </View>
            </View>

            <Text style={styles.stepLabel}>{activeGoal.steps[activeGoal.currentStep - 1]?.title ?? ''}</Text>

            <Text style={[styles.actionTitle, isDone && styles.actionTitleDone]} numberOfLines={4}>
              {action?.title ?? 'Loading your action...'}
            </Text>

            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Icon name="clock" size={16} color={theme.inkSoft} />
                <Text style={styles.metaText}>{action?.minutes ?? 15} min</Text>
              </View>
              <View style={styles.divider} />
              <TouchableOpacity
                style={styles.metaItem}
                onPress={() => Alert.alert('Why this matters', action?.why ?? '')}
                activeOpacity={0.7}
              >
                <Icon name="sparkles" size={14} color={theme.purple} />
                <Text style={[styles.metaText, { color: theme.purple }]}>Why this matters</Text>
              </TouchableOpacity>
            </View>

            {isDone ? (
              <View style={styles.doneBox}>
                <View style={styles.doneIcon}>
                  <Icon name="check" size={20} color="#fff" strokeWidth={3} />
                </View>
                <View>
                  <Text style={styles.doneTitle}>You're done for today.</Text>
                  <Text style={styles.doneSub}>
                    Next action unlocks in {nextActionIn(lastCompletion?.completedAt)}
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.btnRow}>
                <View style={{ flex: 1 }}>
                  <Button onPress={() => router.push('/timer')} icon="play">Start timer</Button>
                </View>
                <TouchableOpacity
                  onPress={() => adjustRef.current?.expand()}
                  style={styles.adjustBtn}
                  activeOpacity={0.8}
                >
                  <Icon name="sliders" size={22} color={theme.ink} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Streak card */}
        <View style={styles.section}>
          <Card padding={18}>
            <View style={styles.streakTop}>
              <View style={styles.streakIcon}>
                <Icon name="flame" size={22} color="#fff" />
              </View>
              <View style={styles.flex}>
                <Text style={styles.streakLabel}>CURRENT STREAK</Text>
                <Text style={styles.streakNum}>
                  {liveStreak} <Text style={styles.streakUnit}>days</Text>
                </Text>
              </View>
              <View style={styles.bestStreak}>
                <Text style={styles.bestLabel}>BEST</Text>
                <Text style={styles.bestNum}>{Math.max(activeGoal.bestStreak, liveStreak)}d</Text>
              </View>
            </View>
            <WeekStrip history={weekHistory} />
          </Card>
        </View>

        {/* Other goals */}
        {otherGoals.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Other goals</Text>
              <Text style={styles.sectionMeta}>{otherGoals.length} active</Text>
            </View>
            {otherGoals.map((g) => {
              const pp = theme.cat[g.category];
              const gc = CATEGORIES.find((c) => c.id === g.category);
              const done = isTodayCompleted(g.id);
              return (
                <TouchableOpacity
                  key={g.id}
                  onPress={() => setActiveGoal(g.id)}
                  style={styles.otherGoalCard}
                  activeOpacity={0.85}
                >
                  <View style={[styles.otherIcon, { backgroundColor: pp.bg }]}>
                    <Icon name={gc?.icon ?? 'target'} size={22} color="#fff" />
                  </View>
                  <View style={styles.flex}>
                    <Text style={styles.otherAction} numberOfLines={1}>
                      {g.todayAction?.title ?? g.steps[g.currentStep - 1]?.title ?? ''}
                    </Text>
                    <Text style={styles.otherMeta}>{g.shortName} · Step {g.currentStep}/7</Text>
                  </View>
                  {done
                    ? <View style={styles.doneSmall}><Icon name="check" size={14} color={theme.success} strokeWidth={3} /></View>
                    : <Icon name="chevron-right" size={18} color={theme.inkMute} />}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Quote */}
        <View style={styles.section}>
          <View style={styles.quoteCard}>
            <Text style={styles.quoteGlyph}>"</Text>
            <Text style={styles.quoteLabel}>Daily reminder</Text>
            <Text style={styles.quoteText}>{quote}</Text>
          </View>
        </View>
      </ScrollView>

      <AdjustSheet
        sheetRef={adjustRef}
        onSwap={handleSwap}
        onSimplify={handleSimplify}
      />
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
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 22, paddingBottom: 8, paddingTop: 4 },
  greeting: { fontSize: 14, color: 'rgba(255,255,255,0.85)', letterSpacing: -0.2 },
  name: { fontSize: 26, fontWeight: '800', color: '#fff', letterSpacing: -1 },
  bellBtn: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  pillScroll: { marginTop: 6 },
  pillContent: { paddingHorizontal: 22, gap: 8, paddingBottom: 14 },
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  pillSel: { backgroundColor: '#fff' },
  pillIcon: { width: 24, height: 24, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  pillName: { fontSize: 13, fontWeight: '700', color: '#fff' },
  pillStep: { fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: '600' },
  addPill: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)',
    borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center',
  },
  cardWrap: { paddingHorizontal: 22, paddingBottom: 4 },
  actionCard: {
    backgroundColor: theme.surface, borderRadius: 26, padding: 22,
    shadowColor: '#281450', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.18, shadowRadius: 30, elevation: 8,
  },
  actionTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  actionDotRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  actionTopLabel: { fontSize: 11, fontWeight: '700', color: theme.inkSoft, letterSpacing: 1, textTransform: 'uppercase' },
  stepBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  stepBadgeText: { fontSize: 11, fontWeight: '700' },
  stepLabel: { fontSize: 12, fontWeight: '700', color: theme.inkMute, letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 6 },
  actionTitle: { fontSize: 22, fontWeight: '800', lineHeight: 28, color: theme.ink, letterSpacing: -0.6 },
  actionTitleDone: { textDecorationLine: 'line-through', opacity: 0.5 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 16, marginBottom: 18 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 13, fontWeight: '700', color: theme.ink },
  divider: { width: 1, height: 16, backgroundColor: theme.hairline },
  doneBox: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: theme.surfaceSoft, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: theme.success + '33',
  },
  doneIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: theme.success, alignItems: 'center', justifyContent: 'center' },
  doneTitle: { fontSize: 14, fontWeight: '700', color: theme.ink },
  doneSub: { fontSize: 12, color: theme.inkSoft, marginTop: 2 },
  btnRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  adjustBtn: {
    width: 56, height: 58, borderRadius: 18,
    backgroundColor: theme.surface, borderWidth: 1, borderColor: 'rgba(60,40,140,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  section: { paddingHorizontal: 22, paddingTop: 12 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: theme.ink, letterSpacing: -0.3 },
  sectionMeta: { fontSize: 12, color: theme.inkSoft },
  streakTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  streakIcon: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: theme.streakFlame, alignItems: 'center', justifyContent: 'center',
    shadowColor: theme.streakFlame, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 4,
  },
  streakLabel: { fontSize: 13, fontWeight: '700', color: theme.inkSoft, letterSpacing: 0.3 },
  streakNum: { fontSize: 22, fontWeight: '800', color: theme.ink, letterSpacing: -0.5 },
  streakUnit: { fontSize: 14, fontWeight: '600', color: theme.inkSoft },
  bestStreak: { alignItems: 'flex-end' },
  bestLabel: { fontSize: 11, color: theme.inkMute, fontWeight: '600' },
  bestNum: { fontSize: 16, fontWeight: '800', color: theme.ink },
  otherGoalCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: theme.surface, borderRadius: 18, padding: 14, marginBottom: 10,
    shadowColor: '#3C2880', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 1,
  },
  otherIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  otherAction: { fontSize: 14, fontWeight: '700', color: theme.ink },
  otherMeta: { fontSize: 12, color: theme.inkSoft, marginTop: 2 },
  doneSmall: { width: 28, height: 28, borderRadius: 9, backgroundColor: '#EAF8F1', alignItems: 'center', justifyContent: 'center' },
  quoteCard: {
    backgroundColor: theme.ink, borderRadius: 22, padding: 22,
    overflow: 'hidden', position: 'relative',
  },
  quoteGlyph: {
    position: 'absolute', top: 8, right: 16,
    fontSize: 80, fontFamily: 'serif', color: '#fff', opacity: 0.15, lineHeight: 64,
  },
  quoteLabel: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.6)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 },
  quoteText: { fontSize: 17, fontWeight: '600', color: '#fff', lineHeight: 24, letterSpacing: -0.3 },
  empty: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: theme.bg, paddingHorizontal: 30,
  },
  emptyTitle: { fontSize: 22, fontWeight: '800', color: theme.ink, marginTop: 16, marginBottom: 8 },
  emptyBody: { fontSize: 15, color: theme.inkSoft, textAlign: 'center' },
});
