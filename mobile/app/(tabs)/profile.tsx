import React, { useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, StyleSheet, Alert, Share } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BottomSheet from '@gorhom/bottom-sheet';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore } from '../../store';
import { theme } from '../../lib/theme';
import { useTheme } from '../../lib/ThemeContext';
import { PALETTE_LIST } from '../../lib/themes';
import { cancelDailyReminder, scheduleDailyReminder } from '../../lib/notifications';
import { PurpleBackdrop } from '../../components/PurpleBackdrop';
import { Card } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import { Icon } from '../../components/ui/Icon';
import { PaywallSheet } from '../../components/sheets/PaywallSheet';

interface SettingItem {
  icon: string;
  label: string;
  value?: string;
  toggle?: boolean;
  on?: boolean;
  danger?: boolean;
  onPress?: () => void;
  onToggle?: (v: boolean) => void;
}

interface SettingSection {
  title: string;
  items: SettingItem[];
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const paywallRef = useRef<BottomSheet>(null);
  const { user, goals, clearUser, updateUserPrefs } = useAppStore();
  const t = useTheme();

  const notifications = user?.notifications ?? true;
  const haptics = user?.haptics ?? true;
  const activeThemeId = user?.themeId ?? 'violet';

  const activeGoals = goals.filter((g) => g.status === 'active');

  const handleExport = async () => {
    try {
      const exportData = JSON.stringify({ goals, exportedAt: new Date().toISOString() }, null, 2);
      await Share.share({ message: exportData, title: 'Daily 60 — My Goals Export' });
    } catch {
      Alert.alert('Export failed', 'Could not export data. Please try again.');
    }
  };

  const handleDailyReminderToggle = async (enabled: boolean) => {
    if (!enabled) {
      updateUserPrefs({ notifications: false });
      await cancelDailyReminder();
      return;
    }

    const scheduled = await scheduleDailyReminder(user?.reminderTime);
    if (!scheduled) {
      Alert.alert(
        'Notifications disabled',
        'Enable notifications in system settings to use daily reminders.',
      );
      updateUserPrefs({ notifications: false });
      return;
    }

    updateUserPrefs({ notifications: true });
  };

  const sections: SettingSection[] = [
    {
      title: 'Notifications',
      items: [
        {
          icon: 'bell',
          label: 'Daily reminder',
          value: user?.reminderTime ?? '8:00 AM',
          toggle: true,
          on: notifications,
          onToggle: (v) => void handleDailyReminderToggle(v),
        },
      ],
    },
    {
      title: 'Account',
      items: [
        { icon: 'user',  label: 'Name',  value: user?.name  ?? 'Not set' },
        { icon: 'edit',  label: 'Email', value: user?.email ?? 'Not set (local account)' },
      ],
    },
    {
      title: 'App',
      items: [
        {
          icon: 'settings',
          label: 'Haptic feedback',
          toggle: true,
          on: haptics,
          onToggle: (v) => updateUserPrefs({ haptics: v }),
        },
      ],
    },
  ];

  return (
    <>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingTop: insets.top, paddingBottom: 130 }]}
        showsVerticalScrollIndicator={false}
      >
        <PurpleBackdrop height={230} />

        {/* Avatar header */}
        <View style={styles.avatarSection}>
          <Avatar name={user?.name ?? 'User'} size={92} ring />
          <Text style={styles.name}>{user?.name ?? 'Guest'}</Text>
          <Text style={styles.email}>{user?.email ?? 'No account yet'}</Text>
          <View style={styles.planBadge}>
            <Text style={styles.planText}>
              {user?.isPro ? 'Pro' : `Free · ${activeGoals.length} active goal${activeGoals.length !== 1 ? 's' : ''}`}
            </Text>
          </View>
        </View>

        {/* Upgrade card */}
        {!user?.isPro && (
          <View style={{ paddingHorizontal: 22, paddingTop: 20 }}>
            <TouchableOpacity
              onPress={() => paywallRef.current?.expand()}
              style={styles.upgradeCard}
              activeOpacity={0.85}
            >
              <View style={[styles.upgradeGlow, { backgroundColor: t.purple }]} />
              <View>
                <View style={styles.upgradeTitle}>
                  <Icon name="sparkles" size={18} color="#FFB547" />
                  <Text style={styles.upgradeTitleText}>Upgrade to Pro</Text>
                </View>
                <Text style={styles.upgradeBody}>Unlimited goals, weekly AI reflections</Text>
                <Text style={styles.upgradeSub}>Coming at launch · Join the waitlist</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Appearance */}
        <View style={styles.secWrap}>
          <Text style={styles.secTitle}>Appearance</Text>
          <Card>
            <View style={styles.themeRow}>
              {PALETTE_LIST.map((palette) => {
                const isSelected = activeThemeId === palette.id;
                const isLocked = palette.isPro && !user?.isPro;

                return (
                  <TouchableOpacity
                    key={palette.id}
                    onPress={() => {
                      if (isLocked) {
                        paywallRef.current?.expand();
                      } else {
                        updateUserPrefs({ themeId: palette.id });
                      }
                    }}
                    activeOpacity={0.8}
                    style={styles.swatch}
                  >
                    <View style={[
                      styles.swatchRing,
                      isSelected && { borderColor: palette.accent },
                    ]}>
                      <LinearGradient
                        colors={[palette.accentSoft, palette.accentBg, palette.accentBgDeep]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.swatchCircle}
                      >
                        {isSelected && (
                          <Icon name="check" size={18} color="#fff" />
                        )}
                        {isLocked && !isSelected && (
                          <Icon name="lock" size={14} color="rgba(255,255,255,0.9)" />
                        )}
                      </LinearGradient>
                    </View>
                    <Text style={[styles.swatchLabel, isSelected && { color: palette.accent, fontWeight: '700' }]}>
                      {palette.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {!user?.isPro && (
              <Text style={styles.themeProNote}>Pro themes · unlock at launch</Text>
            )}
          </Card>
        </View>

        {/* Settings sections */}
        {sections.map((sec, si) => (
          <View key={si} style={styles.secWrap}>
            <Text style={styles.secTitle}>{sec.title}</Text>
            <Card padding={0}>
              {sec.items.map((item, ii) => (
                <TouchableOpacity
                  key={ii}
                  onPress={item.onPress}
                  activeOpacity={item.toggle ? 1 : 0.7}
                  style={[styles.row, ii > 0 && styles.rowBorder]}
                >
                  <View style={styles.rowIcon}>
                    <Icon name={item.icon} size={18} color={item.danger ? theme.danger : t.purple} />
                  </View>
                  <View style={styles.rowText}>
                    <Text style={[styles.rowLabel, item.danger && { color: theme.danger }]}>{item.label}</Text>
                    {item.value && !item.toggle && (
                      <Text style={styles.rowValue}>{item.value}</Text>
                    )}
                  </View>
                  {item.toggle ? (
                    <Switch
                      value={item.on}
                      onValueChange={item.onToggle}
                      trackColor={{ true: t.purple, false: theme.hairline }}
                      thumbColor="#fff"
                    />
                  ) : (
                    <Icon name="chevron-right" size={18} color={theme.inkMute} />
                  )}
                </TouchableOpacity>
              ))}
            </Card>
          </View>
        ))}

        {/* Danger zone */}
        <View style={styles.secWrap}>
          <Card padding={0}>
            <TouchableOpacity style={styles.row} activeOpacity={0.7} onPress={handleExport}>
              <View style={styles.rowIcon}>
                <Icon name="edit" size={18} color={t.purple} />
              </View>
              <View style={styles.rowText}>
                <Text style={styles.rowLabel}>Export my data</Text>
                <Text style={styles.rowValue}>Share as JSON</Text>
              </View>
              <Icon name="chevron-right" size={18} color={theme.inkMute} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.row, styles.rowBorder]}
              activeOpacity={0.7}
              onPress={() => Alert.alert(
                'Delete all data?',
                'This permanently deletes all your goals, progress, and settings. This cannot be undone.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Delete everything',
                    style: 'destructive',
                    onPress: () => clearUser(),
                  },
                ],
              )}
            >
              <View style={[styles.rowIcon, { backgroundColor: '#FFE9EC' }]}>
                <Icon name="x" size={18} color={theme.danger} />
              </View>
              <View style={styles.rowText}>
                <Text style={[styles.rowLabel, { color: theme.danger }]}>Delete all data</Text>
                <Text style={styles.rowValue}>Removes all goals and progress</Text>
              </View>
              <Icon name="chevron-right" size={18} color={theme.inkMute} />
            </TouchableOpacity>
          </Card>
        </View>

        <Text style={styles.version}>Daily 60 · v1.0 · Made with focus</Text>
      </ScrollView>

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
  avatarSection: { paddingTop: 20, alignItems: 'center', paddingBottom: 4 },
  name: { fontSize: 22, fontWeight: '800', color: '#fff', letterSpacing: -0.5, marginTop: 14 },
  email: { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  planBadge: {
    marginTop: 12, backgroundColor: '#FFB547',
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999,
  },
  planText: { fontSize: 12, fontWeight: '700', color: theme.ink },
  upgradeCard: {
    backgroundColor: theme.ink, borderRadius: 22, padding: 20,
    overflow: 'hidden', position: 'relative',
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 8,
  },
  upgradeGlow: {
    position: 'absolute', top: -20, right: -20,
    width: 110, height: 110, borderRadius: 55,
    opacity: 0.4,
  },
  upgradeTitle: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  upgradeTitleText: { fontSize: 12, fontWeight: '700', color: '#FFB547', letterSpacing: 0.6, textTransform: 'uppercase' },
  upgradeBody: { fontSize: 18, fontWeight: '800', color: '#fff', letterSpacing: -0.4 },
  upgradeSub: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 6 },
  secWrap: { paddingHorizontal: 22, paddingTop: 24 },
  secTitle: { fontSize: 12, fontWeight: '700', color: theme.inkSoft, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8, paddingLeft: 4 },
  // Appearance / theme picker
  themeRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 8, paddingHorizontal: 4 },
  swatch: { alignItems: 'center', gap: 6 },
  swatchRing: {
    width: 56, height: 56, borderRadius: 28,
    padding: 3, borderWidth: 2.5, borderColor: 'transparent',
  },
  swatchCircle: {
    flex: 1, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
  },
  swatchLabel: { fontSize: 10, fontWeight: '600', color: theme.inkSoft, letterSpacing: 0.2 },
  themeProNote: { fontSize: 11, color: theme.inkMute, textAlign: 'center', paddingBottom: 10, marginTop: -2 },
  // Settings rows
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14 },
  rowBorder: { borderTopWidth: 1, borderTopColor: theme.hairline },
  rowIcon: {
    width: 36, height: 36, borderRadius: 11, backgroundColor: theme.surfaceSoft,
    alignItems: 'center', justifyContent: 'center',
  },
  rowText: { flex: 1 },
  rowLabel: { fontSize: 14, fontWeight: '700', color: theme.ink, letterSpacing: -0.2 },
  rowValue: { fontSize: 12, color: theme.inkSoft, marginTop: 2 },
  version: { textAlign: 'center', fontSize: 11, color: theme.inkMute, paddingTop: 24 },
});
