import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore } from '../../store';
import { useTheme } from '../../lib/ThemeContext';
import { Icon } from '../../components/ui/Icon';
import { generatePlan } from '../../lib/api';
import { buildFallbackPlan } from '../../lib/utils';

const LINES = [
  'Analyzing your goal...',
  'Building your 7-step plan...',
  'Calibrating to 60 minutes...',
  'Almost there...',
];

export default function GeneratingScreen() {
  const router = useRouter();
  const { createFlow, setCreateFlow } = useAppStore();
  const [lineIdx, setLineIdx] = useState(0);
  const rot1 = useRef(new Animated.Value(0)).current;
  const rot2 = useRef(new Animated.Value(0)).current;
  const rot3 = useRef(new Animated.Value(0)).current;
  const theme = useTheme();

  useEffect(() => {
    let cancelled = false;

    const makeLoop = (val: Animated.Value, duration: number, reverse = false) =>
      Animated.loop(
        Animated.timing(val, { toValue: reverse ? -1 : 1, duration, useNativeDriver: true })
      );

    const anim1 = makeLoop(rot1, 1500);
    const anim2 = makeLoop(rot2, 2000, true);
    const anim3 = makeLoop(rot3, 2500);
    anim1.start();
    anim2.start();
    anim3.start();

    const lineTimer = setInterval(() => {
      setLineIdx((i) => Math.min(i + 1, LINES.length - 1));
    }, 900);

    const category = createFlow.category ?? 'health';
    const goalText = createFlow.goalText ?? '';
    const planParams = {
      goal: goalText,
      category,
      level: createFlow.level ?? 'beginner',
      successType: createFlow.successType ?? 'daily',
    };

    const tryGenerate = (): Promise<import('../../store/types').Step[]> =>
      generatePlan(planParams).catch(() => generatePlan(planParams));

    tryGenerate()
      .then((steps) => {
        if (cancelled) return;
        setCreateFlow({ generatedSteps: steps });
        router.replace('/create/preview');
      })
      .catch(() => {
        if (cancelled) return;
        const steps = buildFallbackPlan(goalText, category);
        setCreateFlow({ generatedSteps: steps });
        router.replace('/create/preview');
      });

    return () => {
      cancelled = true;
      clearInterval(lineTimer);
      anim1.stop();
      anim2.stop();
      anim3.stop();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const makeRotate = (val: Animated.Value) =>
    val.interpolate({ inputRange: [-1, 1], outputRange: ['-360deg', '360deg'] });

  return (
    <LinearGradient
      colors={[theme.purpleSoft, theme.purpleBg, theme.purpleBgDeep]}
      start={{ x: 0.2, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.ringWrap}>
        {[rot1, rot2, rot3].map((r, i) => (
          <Animated.View
            key={i}
            style={[
              styles.ring,
              {
                top: i * 12,
                left: i * 12,
                right: i * 12,
                bottom: i * 12,
                transform: [{ rotate: makeRotate(r) }],
              },
            ]}
          />
        ))}
        <View style={styles.ringCenter}>
          <Icon name="sparkles" size={28} color="#fff" />
        </View>
      </View>

      <Text style={styles.label}>Generating</Text>
      <Text style={styles.line}>{LINES[lineIdx]}</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 },
  ringWrap: { width: 120, height: 120, marginBottom: 36, position: 'relative' },
  ring: {
    position: 'absolute',
    borderRadius: 100,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
    borderTopColor: '#fff',
  },
  ringCenter: {
    position: 'absolute',
    top: 36, left: 36, right: 36, bottom: 36,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.7)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 },
  line: { fontSize: 20, fontWeight: '700', color: '#fff', letterSpacing: -0.5, textAlign: 'center' },
});
