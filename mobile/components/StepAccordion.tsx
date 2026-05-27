import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Step } from '../store/types';
import { theme } from '../lib/theme';
import { Icon } from './ui/Icon';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface StepAccordionProps {
  steps: Step[];
  currentStep: number; // 1-based
  accentColor: string;
  initialOpen?: number; // 0-based index
}

export function StepAccordion({ steps, currentStep, accentColor, initialOpen }: StepAccordionProps) {
  const [expanded, setExpanded] = useState<number>(initialOpen ?? currentStep - 1);

  const toggle = (i: number, locked: boolean) => {
    if (locked) return;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(prev => prev === i ? -1 : i);
  };

  return (
    <View style={styles.container}>
      {steps.map((step, i) => {
        const done = i < currentStep - 1;
        const current = i === currentStep - 1;
        const locked = i > currentStep - 1;
        const isOpen = expanded === i;

        return (
          <View
            key={`step-${i}`}
            style={[
              styles.item,
              current && { borderWidth: 2, borderColor: accentColor },
              current && {
                shadowColor: accentColor,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.2,
                shadowRadius: 16,
                elevation: 4,
              },
            ]}
          >
            <TouchableOpacity
              onPress={() => toggle(i, locked)}
              activeOpacity={0.8}
              style={styles.header}
            >
              <View style={[
                styles.stepBadge,
                done && { backgroundColor: theme.success },
                current && { backgroundColor: accentColor },
                locked && { backgroundColor: theme.hairline },
              ]}>
                {done
                  ? <Icon name="check" size={16} color="#fff" strokeWidth={3} />
                  : locked
                    ? <Icon name="lock" size={14} color={theme.inkMute} />
                    : <Text style={styles.stepNum}>{i + 1}</Text>}
              </View>

              <View style={styles.labelWrap}>
                <Text style={styles.stepStatus}>
                  {done ? 'Complete' : current ? 'Current step' : `Step ${i + 1}`}
                </Text>
                <Text style={[styles.stepTitle, locked && { color: theme.inkSoft }]} numberOfLines={2}>
                  {step.title}
                </Text>
              </View>

              {!locked && (
                <Icon name={isOpen ? 'chevron-up' : 'chevron-down'} size={18} color={theme.inkMute} />
              )}
            </TouchableOpacity>

            {isOpen && !locked && (
              <View style={styles.body}>
                <Text style={styles.description}>{step.description}</Text>
                <View style={styles.durationChip}>
                  <Icon name="clock" size={12} color={theme.inkSoft} />
                  <Text style={styles.durationText}>{step.duration}</Text>
                </View>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  item: {
    backgroundColor: '#fff',
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#3C2880',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 14,
  },
  stepBadge: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stepNum: {
    fontSize: 14,
    fontWeight: '800',
    color: '#fff',
  },
  labelWrap: {
    flex: 1,
  },
  stepStatus: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.inkMute,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.ink,
    letterSpacing: -0.2,
    marginTop: 1,
  },
  body: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingLeft: 64,
    gap: 8,
  },
  description: {
    fontSize: 13,
    lineHeight: 20,
    color: theme.inkSoft,
  },
  durationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  durationText: {
    fontSize: 12,
    color: theme.inkSoft,
    fontWeight: '600',
  },
});
