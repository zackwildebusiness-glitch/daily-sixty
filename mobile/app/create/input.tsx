import React, { useState } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../store';
import { theme } from '../../lib/theme';
import { CATEGORIES, EXAMPLE_GOALS } from '../../constants/categories';
import { Header } from '../../components/ui/Header';
import { Button } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';

export default function InputScreen() {
  const router = useRouter();
  const { createFlow, setCreateFlow } = useAppStore();
  const [text, setText] = useState(createFlow.goalText ?? '');

  const cat = CATEGORIES.find((c) => c.id === createFlow.category)!;
  const palette = theme.cat[createFlow.category ?? 'health'];
  const exampleGoals = EXAMPLE_GOALS[createFlow.category ?? 'health'] ?? [];

  const onContinue = () => {
    setCreateFlow({ goalText: text.trim() });
    router.push('/create/q1');
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        <Header onBack={() => router.back()} />

        <ScrollView style={styles.flex} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {cat && (
            <View style={[styles.catChip, { backgroundColor: palette.soft }]}>
              <View style={[styles.catIcon, { backgroundColor: palette.bg }]}>
                <Icon name={cat.icon} size={15} color="#fff" />
              </View>
              <Text style={[styles.catLabel, { color: palette.deep }]}>{cat.label}</Text>
            </View>
          )}

          <Text style={styles.title}>Describe your goal</Text>
          <Text style={styles.subtitle}>One sentence. Be specific if you can.</Text>

          <View style={styles.inputCard}>
            <TextInput
              value={text}
              onChangeText={(v) => setText(v.slice(0, 200))}
              placeholder="e.g. Run a 5K without stopping"
              placeholderTextColor={theme.inkMute}
              multiline
              numberOfLines={3}
              style={styles.input}
              autoFocus
            />
            <Text style={styles.counter}>{text.length} / 200</Text>
          </View>

          <Text style={styles.suggestionsLabel}>Or pick a starter</Text>
          <View style={styles.suggestions}>
            {exampleGoals.map((goal) => (
              <TouchableOpacity key={goal} onPress={() => setText(goal)} style={styles.suggestionChip} activeOpacity={0.8}>
                <Text style={styles.suggestionText}>{goal}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <View style={styles.cta}>
          <Button onPress={onContinue} disabled={!text.trim()}>Continue</Button>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: theme.bg },
  content: { paddingHorizontal: 22, paddingBottom: 20 },
  catChip: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 999, marginBottom: 18,
  },
  catIcon: { width: 26, height: 26, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  catLabel: { fontSize: 12, fontWeight: '700' },
  title: { fontSize: 28, fontWeight: '800', letterSpacing: -1, color: theme.ink, marginBottom: 6 },
  subtitle: { fontSize: 14, color: theme.inkSoft, marginBottom: 18 },
  inputCard: {
    backgroundColor: theme.surface, borderRadius: 20, padding: 18,
    shadowColor: '#3C2880', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 2,
  },
  input: {
    fontSize: 17, lineHeight: 24, color: theme.ink,
    minHeight: 84, textAlignVertical: 'top',
  },
  counter: { fontSize: 12, color: theme.inkMute, textAlign: 'right', marginTop: 8 },
  suggestionsLabel: { fontSize: 12, fontWeight: '700', color: theme.inkSoft, letterSpacing: 0.4, textTransform: 'uppercase', marginTop: 20, marginBottom: 8 },
  suggestions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  suggestionChip: {
    backgroundColor: theme.surface, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999,
    shadowColor: '#3C2880', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 1,
  },
  suggestionText: { fontSize: 13, fontWeight: '600', color: theme.ink },
  cta: { paddingHorizontal: 22, paddingBottom: 30 },
});
