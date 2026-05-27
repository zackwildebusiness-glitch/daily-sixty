import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../store';
import { theme } from '../../lib/theme';
import { Header } from '../../components/ui/Header';
import { Button } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';

const OPTIONS = [
  { id: 'beginner',     label: 'Complete beginner',  desc: 'Starting from zero' },
  { id: 'some',         label: 'Some experience',    desc: 'Dabbled, never stuck' },
  { id: 'intermediate', label: 'Intermediate',       desc: 'I know the basics' },
  { id: 'advanced',     label: 'Advanced',           desc: 'I want to level up' },
];

export default function Q1Screen() {
  const router = useRouter();
  const { setCreateFlow } = useAppStore();
  const [selected, setSelected] = useState<string | null>(null);

  const onContinue = () => {
    setCreateFlow({ level: selected });
    router.push('/create/q2');
  };

  return (
    <View style={styles.container}>
      <Header onBack={() => router.back()} />

      <ScrollView style={styles.flex} contentContainerStyle={styles.content}>
        <View style={styles.badge}>
          <Icon name="sparkles" size={14} color={theme.purpleDeep} />
          <Text style={styles.badgeText}>1 of 2 · Sharpening your goal</Text>
        </View>

        <Text style={styles.question}>What's your current{'\n'}experience level with this?</Text>

        <View style={styles.options}>
          {OPTIONS.map((o) => {
            const sel = selected === o.id;
            return (
              <TouchableOpacity
                key={o.id}
                onPress={() => setSelected(o.id)}
                activeOpacity={0.85}
                style={[styles.option, sel && styles.optionSelected]}
              >
                <View style={[styles.radio, sel && styles.radioSelected]} />
                <View style={styles.optionText}>
                  <Text style={[styles.optionLabel, sel && { color: '#fff' }]}>{o.label}</Text>
                  <Text style={[styles.optionDesc, sel && { color: 'rgba(255,255,255,0.8)' }]}>{o.desc}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.cta}>
        <Button onPress={onContinue} disabled={!selected}>Continue</Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: theme.bg },
  content: { paddingHorizontal: 22, paddingBottom: 20 },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start',
    backgroundColor: '#EBE6FA', paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 999, marginBottom: 18,
  },
  badgeText: { fontSize: 12, fontWeight: '700', color: theme.purpleDeep },
  question: { fontSize: 26, fontWeight: '800', letterSpacing: -0.8, color: theme.ink, marginBottom: 22 },
  options: { gap: 10 },
  option: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    padding: 18, borderRadius: 18, backgroundColor: theme.surface,
    shadowColor: '#3C2880', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 1,
  },
  optionSelected: {
    backgroundColor: theme.purple,
    shadowColor: theme.purple, shadowOpacity: 0.3, shadowRadius: 16, elevation: 4,
  },
  radio: {
    width: 26, height: 26, borderRadius: 13,
    borderWidth: 2, borderColor: theme.hairline,
  },
  radioSelected: {
    borderWidth: 6, borderColor: '#fff',
    backgroundColor: theme.purpleDeep,
  },
  optionText: { flex: 1 },
  optionLabel: { fontSize: 16, fontWeight: '700', letterSpacing: -0.2, color: theme.ink },
  optionDesc: { fontSize: 12, color: theme.inkSoft, marginTop: 2 },
  cta: { paddingHorizontal: 22, paddingBottom: 30 },
});
