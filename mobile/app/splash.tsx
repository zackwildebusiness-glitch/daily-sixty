import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../lib/theme';
import { Icon } from '../components/ui/Icon';

export default function Splash() {
  const router = useRouter();
  // useRef prevents re-creation of Animated.Value on re-renders
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, tension: 100, friction: 10, useNativeDriver: true }),
    ]).start();

    const t = setTimeout(() => {
      router.replace('/onboarding');
    }, 2400);
    return () => clearTimeout(t);
  }, []);

  return (
    <LinearGradient
      colors={[theme.purpleSoft, theme.purpleBg, theme.purpleBgDeep]}
      start={{ x: 0.2, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <Animated.View style={[styles.logoWrap, { opacity, transform: [{ scale }] }]}>
        <View style={styles.logoBox}>
          <Icon name="logo" size={64} color="#fff" />
        </View>
        <View style={styles.orbitDot} />
      </Animated.View>

      <Animated.View style={{ opacity }}>
        <Text style={styles.appName}>Daily 60</Text>
        <Text style={styles.tagline}>Any goal. 60 minutes a day.</Text>
      </Animated.View>

      <View style={styles.dots}>
        {[0, 1, 2].map((i) => <View key={i} style={styles.dot} />)}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrap: {
    position: 'relative',
    marginBottom: 28,
  },
  logoBox: {
    width: 112,
    height: 112,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 30,
    elevation: 12,
  },
  orbitDot: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FFB547',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  appName: {
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -1.2,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: -0.2,
    textAlign: 'center',
  },
  dots: {
    position: 'absolute',
    bottom: 64,
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
});
