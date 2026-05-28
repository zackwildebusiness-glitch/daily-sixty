import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore } from '../store';
import { theme } from '../lib/theme';
import { Button } from '../components/ui/Button';
import { Icon } from '../components/ui/Icon';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    title: '60 Minutes Changes Everything',
    body: "You don't need more time. You need one focused hour, one clear goal, and a plan that actually works.",
    Hero: HeroOne,
  },
  {
    title: 'How it works',
    body: 'Tiny, daily steps that compound into the change you actually want.',
    Hero: HeroTwo,
  },
  {
    title: 'Anyone can do this',
    body: 'No gym required. No free weekends. Just 60 minutes a day and a plan that actually works.',
    Hero: HeroThree,
  },
];

function HeroOne() {
  return (
    <View style={hero.container}>
      <View style={hero.bigCircle} />
      <View style={hero.circleInner} />
      <Text style={hero.bigNum}>60</Text>
      <View style={hero.chip1}>
        <Icon name="clock" size={18} color={theme.purple} />
        <Text style={hero.chipText}>1 hour</Text>
      </View>
      <View style={hero.chip2}>
        <Icon name="cat-health" size={18} color="#fff" />
        <Text style={hero.chip2Text}>your goal</Text>
      </View>
    </View>
  );
}

function HeroTwo() {
  const steps = [
    { n: '1', t: 'Pick your goal', d: 'Anything you want to change', color: theme.cat.health.bg, icon: 'cat-health' },
    { n: '2', t: 'AI builds your 7-step plan', d: 'Calibrated to one hour a day', color: theme.cat.mindset.bg, icon: 'sparkles' },
    { n: '3', t: 'Complete one micro-action', d: "Daily. That's it.", color: theme.cat.finance.bg, icon: 'check' },
  ];
  return (
    <View style={{ width: '100%', maxWidth: 300, gap: 12 }}>
      {steps.map((s, i) => (
        <View key={i} style={hero.step}>
          <View style={[hero.stepIcon, { backgroundColor: s.color }]}>
            <Icon name={s.icon} size={22} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={hero.stepNum}>STEP {s.n}</Text>
            <Text style={hero.stepTitle}>{s.t}</Text>
            <Text style={hero.stepDesc}>{s.d}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

function HeroThree() {
  const items = [
    { icon: 'flame', label: 'Build your streak', color: theme.streakFlame },
    { icon: 'check', label: 'One action a day', color: theme.success },
    { icon: 'sparkles', label: 'AI-powered plan', color: theme.purple },
  ];
  return (
    <View style={{ width: '100%', maxWidth: 300, gap: 12 }}>
      {items.map((item, i) => (
        <View key={i} style={[hero.step, { justifyContent: 'center' }]}>
          <View style={[hero.stepIcon, { backgroundColor: item.color }]}>
            <Icon name={item.icon} size={22} color="#fff" />
          </View>
          <Text style={hero.stepTitle}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

export default function Onboarding() {
  const [slide, setSlide] = useState(0);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const setHasSeenOnboarding = useAppStore((s) => s.setHasSeenOnboarding);

  const isLast = slide === SLIDES.length - 1;

  const advance = () => {
    if (isLast) {
      setHasSeenOnboarding();
      router.replace('/name');
    } else {
      setSlide((s) => s + 1);
    }
  };

  const skip = () => {
    setHasSeenOnboarding();
    router.replace('/name');
  };

  const s = SLIDES[slide];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <TouchableOpacity onPress={skip} style={styles.skipBtn}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <View style={styles.heroWrap}><s.Hero /></View>

      <View style={styles.copy}>
        <Text style={styles.title}>{s.title}</Text>
        <Text style={styles.body}>{s.body}</Text>
      </View>

      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View key={i} style={[styles.dot, i === slide && styles.dotActive]} />
        ))}
      </View>

      <View style={styles.cta}>
        <Button onPress={advance}>{isLast ? 'Get Started' : 'Next'}</Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  skipBtn: { paddingTop: 12, paddingRight: 22, alignSelf: 'flex-end', padding: 8 },
  skipText: { fontSize: 14, fontWeight: '600', color: theme.inkSoft },
  heroWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30 },
  copy: { paddingHorizontal: 30, alignItems: 'center' },
  title: { fontSize: 30, fontWeight: '800', letterSpacing: -1, color: theme.ink, textAlign: 'center', marginBottom: 12 },
  body: { fontSize: 15, lineHeight: 22, color: theme.inkSoft, textAlign: 'center' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, paddingVertical: 30 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.hairline },
  dotActive: { width: 24, backgroundColor: theme.purple },
  cta: { paddingHorizontal: 22, paddingBottom: 50 },
});

const hero = StyleSheet.create({
  container: {
    width: 220, height: 220,
    alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  bigCircle: {
    position: 'absolute', inset: 0,
    width: 220, height: 220, borderRadius: 110,
    backgroundColor: '#F3EEFF',
  },
  circleInner: {
    position: 'absolute',
    top: 30, left: 30, right: 30, bottom: 30,
    borderRadius: 80, borderWidth: 3,
    borderColor: theme.purpleSoft,
    borderStyle: 'dashed',
    opacity: 0.5,
  },
  bigNum: { fontSize: 64, fontWeight: '900', color: theme.purple, letterSpacing: -3 },
  chip1: {
    position: 'absolute', top: 12, right: 8,
    backgroundColor: theme.surface, borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 10,
    flexDirection: 'row', alignItems: 'center', gap: 8,
    shadowColor: '#3C2880', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.18, shadowRadius: 16, elevation: 4,
    transform: [{ rotate: '-6deg' }],
  },
  chipText: { fontSize: 13, fontWeight: '700', color: theme.ink },
  chip2: {
    position: 'absolute', bottom: 24, left: -6,
    backgroundColor: theme.cat.health.bg, borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 10,
    flexDirection: 'row', alignItems: 'center', gap: 8,
    shadowColor: theme.cat.health.bg, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 16, elevation: 4,
    transform: [{ rotate: '5deg' }],
  },
  chip2Text: { fontSize: 13, fontWeight: '700', color: '#fff' },
  step: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: theme.surface, padding: 14, borderRadius: 18,
    shadowColor: '#3C2880', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 2,
  },
  stepIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  stepNum: { fontSize: 11, fontWeight: '700', color: theme.inkMute, letterSpacing: 1, marginBottom: 2 },
  stepTitle: { fontSize: 15, fontWeight: '700', color: theme.ink, letterSpacing: -0.3 },
  stepDesc: { fontSize: 12, color: theme.inkSoft, marginTop: 2 },
});
