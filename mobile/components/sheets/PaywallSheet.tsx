import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import BottomSheet, { BottomSheetView, BottomSheetScrollView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { theme } from '../../lib/theme';
import { useTheme } from '../../lib/ThemeContext';
import { Icon } from '../ui/Icon';
import { Button } from '../ui/Button';

const FEATURES = [
  { icon: 'target',   title: 'Unlimited goals',       desc: 'Stack health, career, learning — all at once.' },
  { icon: 'chart',    title: 'Weekly AI reflections', desc: 'A personalised note on your week, every Sunday.' },
  { icon: 'palette',  title: 'Custom app themes',     desc: 'Crimson, Ocean, Forest, Solar — pick your colour.' },
  { icon: 'sparkles', title: 'Early access to new features', desc: 'Everything we build next — you get it first.' },
];

interface PaywallSheetProps {
  sheetRef: React.RefObject<BottomSheet | null>;
  onPurchase: (plan: 'monthly' | 'lifetime') => void;
}

export function PaywallSheet({ sheetRef, onPurchase }: PaywallSheetProps) {
  const snapPoints = useMemo(() => ['90%'], []);
  const [plan, setPlan] = useState<'monthly' | 'lifetime'>('monthly');
  const t = useTheme();

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      backdropComponent={(props) => (
        <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.55} />
      )}
      handleIndicatorStyle={styles.handle}
      backgroundStyle={styles.bg}
    >
      <BottomSheetScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity onPress={() => sheetRef.current?.close()} style={styles.closeBtn}>
          <Icon name="x" size={22} color={theme.inkSoft} />
        </TouchableOpacity>

        <View style={styles.logoWrap}>
          <View style={[
            styles.logo,
            { backgroundColor: t.purple, shadowColor: t.purple },
          ]}>
            <Icon name="sparkles" size={36} color="#fff" />
          </View>
        </View>

        <Text style={styles.title}>Unlock your full potential</Text>
        <Text style={styles.subtitle}>One subscription. Every feature.</Text>

        <View style={styles.features}>
          {FEATURES.map((f, i) => (
            <View key={i} style={styles.feature}>
              <View style={styles.featureIcon}>
                <Icon name={f.icon} size={18} color={t.purple} />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.plans}>
          {([
            { id: 'monthly' as const,  label: 'Monthly',  price: '$7.99',  sub: 'per month',         badge: null },
            { id: 'lifetime' as const, label: 'Lifetime', price: '$59.99', sub: 'one-time · save 38%', badge: 'BEST DEAL' },
          ]).map((p) => (
            <TouchableOpacity
              key={p.id}
              onPress={() => setPlan(p.id)}
              style={[
                styles.planCard,
                plan === p.id && { borderColor: t.purple, backgroundColor: theme.surfaceSoft },
              ]}
              activeOpacity={0.85}
            >
              {p.badge && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{p.badge}</Text>
                </View>
              )}
              <Text style={styles.planLabel}>{p.label}</Text>
              <Text style={styles.planPrice}>{p.price}</Text>
              <Text style={styles.planSub}>{p.sub}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Button onPress={() => onPurchase(plan)}>
          {plan === 'monthly' ? 'Get Pro — $7.99/mo' : 'Get lifetime access — $59.99'}
        </Button>

        <Text style={styles.fine}>Purchases available at full launch. Tap above to join the waitlist.</Text>
      </BottomSheetScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  bg: { backgroundColor: theme.surface },
  handle: { backgroundColor: theme.hairline, width: 40, height: 4 },
  content: { paddingHorizontal: 22, paddingBottom: 40 },
  closeBtn: { alignSelf: 'flex-end', padding: 6, marginBottom: -8 },
  logoWrap: { alignItems: 'center', marginBottom: 14 },
  logo: {
    width: 72, height: 72, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
    shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.35, shadowRadius: 20, elevation: 8,
  },
  title: { fontSize: 26, fontWeight: '800', letterSpacing: -0.8, color: theme.ink, textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 14, color: theme.inkSoft, textAlign: 'center', marginBottom: 22 },
  features: { gap: 12, marginBottom: 22 },
  feature: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  featureIcon: {
    width: 36, height: 36, borderRadius: 11, backgroundColor: theme.surfaceSoft,
    alignItems: 'center', justifyContent: 'center',
  },
  featureText: { flex: 1 },
  featureTitle: { fontSize: 15, fontWeight: '700', color: theme.ink, letterSpacing: -0.2 },
  featureDesc: { fontSize: 12, color: theme.inkSoft, marginTop: 2 },
  plans: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  planCard: {
    flex: 1, padding: 16, borderRadius: 18,
    borderWidth: 2, borderColor: theme.hairline,
    backgroundColor: theme.surface,
  },
  badge: {
    position: 'absolute', top: -8, right: 10,
    backgroundColor: '#FFB547', borderRadius: 999,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  badgeText: { fontSize: 10, fontWeight: '800', color: theme.ink, letterSpacing: 0.5 },
  planLabel: { fontSize: 11, fontWeight: '700', color: theme.inkSoft, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 4 },
  planPrice: { fontSize: 22, fontWeight: '800', color: theme.ink, letterSpacing: -0.5 },
  planSub: { fontSize: 11, color: theme.inkSoft, marginTop: 2 },
  fine: { fontSize: 11, color: theme.inkMute, textAlign: 'center', marginTop: 14, lineHeight: 17, paddingHorizontal: 12 },
});
