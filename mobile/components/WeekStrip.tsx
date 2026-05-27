import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Icon } from './ui/Icon';
import { theme } from '../lib/theme';
import { useTheme } from '../lib/ThemeContext';

interface WeekStripProps {
  history: boolean[]; // [Mon, Tue, Wed, Thu, Fri, Sat, Sun]
  streakColor?: string;
  todayIndex?: number; // 0=Mon … 6=Sun
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getTodayIndex(): number {
  const d = new Date().getDay(); // 0=Sun
  return d === 0 ? 6 : d - 1; // convert to Mon=0
}

export function WeekStrip({ history, streakColor = theme.streakFlame, todayIndex }: WeekStripProps) {
  const t = useTheme();
  const today = todayIndex ?? getTodayIndex();

  return (
    <View style={styles.row}>
      {DAYS.map((d, i) => {
        const done = history[i] ?? false;
        const isToday = i === today;
        return (
          <View key={i} style={styles.dayCol}>
            <Text style={styles.dayLabel}>{d}</Text>
            <View
              style={[
                styles.dot,
                done && { backgroundColor: streakColor },
                isToday && !done && { backgroundColor: t.purple, shadowColor: t.purple, ...shadowStyle },
              ]}
            >
              {done && <Icon name="check" size={14} color="#fff" strokeWidth={3} />}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const shadowStyle = {
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.35,
  shadowRadius: 6,
  elevation: 4,
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayCol: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  dayLabel: {
    fontSize: 10,
    color: theme.inkMute,
    fontWeight: '700',
  },
  dot: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: theme.hairline,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
