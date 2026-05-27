import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { StyleSheet } from 'react-native';
import { ThemeProvider } from '../lib/ThemeContext';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <BottomSheetModalProvider>
        <ThemeProvider>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false, animation: 'fade_from_bottom' }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="splash" options={{ animation: 'none' }} />
          <Stack.Screen name="onboarding" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="create" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="(tabs)" options={{ animation: 'none' }} />
          <Stack.Screen
            name="timer"
            options={{ presentation: 'fullScreenModal', animation: 'fade' }}
          />
          <Stack.Screen name="goal/[id]" options={{ animation: 'slide_from_right' }} />
        </Stack>
        </ThemeProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
