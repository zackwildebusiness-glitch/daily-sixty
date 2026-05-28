import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../store';
import { theme } from '../lib/theme';
import { Button } from '../components/ui/Button';
import { Icon } from '../components/ui/Icon';

export default function NameScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setUser, setHasSeenOnboarding } = useAppStore();
  const [name, setName] = useState('');

  const cleanName = name.trim().replace(/\s+/g, ' ').slice(0, 32);
  const canContinue = cleanName.length >= 2;

  const continueToGoals = (fallbackName?: string) => {
    const finalName = fallbackName ?? cleanName;
    setUser({
      name: finalName,
      reminderTime: '08:00',
      isPro: false,
      notifications: false,
      streakAlerts: false,
      haptics: true,
    });
    setHasSeenOnboarding();
    router.replace('/create/category');
  };

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <Icon name="user" size={34} color="#fff" />
        </View>

        <Text style={styles.title}>What should we call you?</Text>
        <Text style={styles.body}>
          Daily 60 uses this only inside the app. You can change your local profile later.
        </Text>

        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="First name"
          placeholderTextColor={theme.inkMute}
          autoCapitalize="words"
          autoCorrect={false}
          returnKeyType="done"
          onSubmitEditing={() => {
            if (canContinue) continueToGoals();
          }}
          style={styles.input}
          maxLength={32}
        />
      </View>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <Button onPress={() => continueToGoals()} disabled={!canContinue}>
          Continue
        </Button>
        <TouchableOpacity onPress={() => continueToGoals('Friend')} style={styles.skipBtn}>
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.bg },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 26 },
  iconWrap: {
    width: 72, height: 72, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: theme.purple,
    marginBottom: 24,
    shadowColor: theme.purple,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.28,
    shadowRadius: 20,
    elevation: 8,
  },
  title: { fontSize: 32, fontWeight: '800', color: theme.ink, letterSpacing: -1, marginBottom: 10 },
  body: { fontSize: 15, lineHeight: 22, color: theme.inkSoft, marginBottom: 26 },
  input: {
    height: 58,
    borderRadius: 18,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.hairline,
    paddingHorizontal: 18,
    fontSize: 18,
    fontWeight: '700',
    color: theme.ink,
  },
  footer: { paddingHorizontal: 22, gap: 8 },
  skipBtn: { alignItems: 'center', paddingVertical: 14 },
  skipText: { fontSize: 14, fontWeight: '700', color: theme.inkSoft },
});
