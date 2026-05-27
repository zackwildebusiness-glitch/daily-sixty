import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { useAppStore } from '../store';
import { theme } from '../lib/theme';
import { useTheme } from '../lib/ThemeContext';
import { formatTime } from '../lib/utils';
import { Icon } from '../components/ui/Icon';

export default function TimerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  const { goals, activeGoalId, completeAction } = useAppStore();
  const goal = goals.find((g) => g.id === activeGoalId);
  const action = goal?.todayAction;
  const totalSeconds = (action?.minutes ?? 15) * 60;

  const [remaining, setRemaining] = useState(totalSeconds);
  const [running, setRunning] = useState(true);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // `remaining` is intentionally omitted from deps: setRemaining uses a
    // functional update ((s) => ...) so we don't need to read the current
    // value from the closure. Including it would clear and recreate the
    // interval on every tick — 60 interval creations per minute for no gain.
    if (!running) return;
    timerRef.current = setInterval(() => {
      setRemaining((s) => Math.max(0, s - 1));
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  const pct = 1 - remaining / totalSeconds;
  const canFinish = pct > 0.8 || remaining === 0;

  const R = 110;
  const C = 2 * Math.PI * R;
  const offset = C * (1 - pct);

  const onComplete = () => {
    if (goal) completeAction(goal.id);
    router.back();
  };

  const onExit = () => {
    if (pct > 0.1) {
      Alert.alert('Exit timer?', 'Your progress will be lost.', [
        { text: 'Keep going', style: 'cancel' },
        { text: 'Exit', style: 'destructive', onPress: () => router.back() },
      ]);
    } else {
      router.back();
    }
  };

  return (
    <LinearGradient
      colors={['#3B2670', '#1A1135', '#0A0420']}
      style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom + 16 }]}
    >
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onExit} style={styles.exitBtn} activeOpacity={0.8}>
          <Icon name="x" size={16} color="#fff" />
          <Text style={styles.exitText}>Exit</Text>
        </TouchableOpacity>
        <Text style={styles.focusLabel}>Focus mode</Text>
        <View style={{ width: 72 }} />
      </View>

      {/* Action title */}
      <View style={styles.titleWrap}>
        <Text style={styles.actionLabel}>Today's action</Text>
        <Text style={styles.actionTitle}>{action?.title ?? 'Focus session'}</Text>
      </View>

      {/* Ring timer */}
      <View style={styles.timerWrap}>
        <Svg width={280} height={280} viewBox="0 0 280 280">
          <Defs>
            <SvgGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={theme.purpleLavender} />
              <Stop offset="1" stopColor="#7C5CFF" />
            </SvgGradient>
          </Defs>
          <Circle cx="140" cy="140" r={R} stroke="rgba(255,255,255,0.08)" strokeWidth="10" fill="none" />
          <Circle
            cx="140" cy="140" r={R}
            stroke="url(#ringGrad)"
            strokeWidth="10"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={offset}
            transform="rotate(-90 140 140)"
          />
        </Svg>

        <View style={styles.timerCenter}>
          <Text style={styles.timerText}>{formatTime(remaining)}</Text>
          <Text style={styles.timerPct}>
            {running ? `${Math.round(pct * 100)}% complete` : 'PAUSED'}
          </Text>
        </View>
      </View>

      {/* Why this matters */}
      <Text style={styles.why}>{action?.why ?? ''}</Text>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          onPress={() => setRunning((r) => !r)}
          style={styles.playBtn}
          activeOpacity={0.8}
        >
          <Icon name={running ? 'pause' : 'play'} size={28} color="#fff" />
        </TouchableOpacity>

        {canFinish && (
          <TouchableOpacity onPress={onComplete} style={styles.completeBtn} activeOpacity={0.85}>
            <Icon name="check" size={20} color={theme.ink} strokeWidth={3} />
            <Text style={styles.completeText}>Mark complete</Text>
          </TouchableOpacity>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 22 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  exitBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  exitText: { fontSize: 13, fontWeight: '600', color: '#fff' },
  focusLabel: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.7)', letterSpacing: 1, textTransform: 'uppercase' },
  titleWrap: { alignItems: 'center', marginTop: 24 },
  actionLabel: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.55)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 },
  actionTitle: { fontSize: 19, fontWeight: '700', color: '#fff', lineHeight: 26, letterSpacing: -0.3, textAlign: 'center', paddingHorizontal: 12 },
  timerWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  timerCenter: { position: 'absolute', alignItems: 'center' },
  timerText: { fontSize: 72, fontWeight: '200', letterSpacing: -3, color: '#fff', lineHeight: 78 },
  timerPct: { fontSize: 12, color: 'rgba(255,255,255,0.6)', letterSpacing: 1, marginTop: 8, fontWeight: '600' },
  why: { fontSize: 13, fontStyle: 'italic', color: 'rgba(255,255,255,0.6)', textAlign: 'center', lineHeight: 20, paddingHorizontal: 24, marginBottom: 24 },
  controls: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 16 },
  playBtn: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  completeBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    height: 72, paddingHorizontal: 28, borderRadius: 999,
    backgroundColor: '#fff',
  },
  completeText: { fontSize: 16, fontWeight: '700', color: theme.ink },
});
