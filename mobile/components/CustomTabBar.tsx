import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../lib/ThemeContext';
import { Icon } from './ui/Icon';

const TABS = [
  { name: 'index',    label: 'Today',    icon: 'home' },
  { name: 'goals',   label: 'Goals',    icon: 'target' },
  { name: 'progress',label: 'Progress', icon: 'chart' },
  { name: 'profile', label: 'Profile',  icon: 'user' },
];

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { purple, inkSoft } = useTheme();

  return (
    <View style={[styles.wrapper, { paddingBottom: insets.bottom + 8 }]}>
      <View style={styles.bar}>
        {state.routes.map((route, index) => {
          const tab = TABS.find(t => t.name === route.name) ?? TABS[0];
          const focused = state.index === index;

          return (
            <TouchableOpacity
              key={route.key}
              onPress={() => {
                const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                if (!focused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              }}
              activeOpacity={0.8}
              style={[styles.tab, focused && { backgroundColor: purple }]}
            >
              <Icon
                name={tab.icon}
                size={22}
                color={focused ? '#fff' : inkSoft}
                strokeWidth={focused ? 2.2 : 2}
              />
              <Text style={[styles.label, { color: focused ? '#fff' : inkSoft, opacity: focused ? 1 : 0.7 }]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
    paddingTop: 10,
    backgroundColor: 'transparent',
  },
  bar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 8,
    shadowColor: '#46289A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  tab: {
    flex: 1,
    height: 50,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
});
