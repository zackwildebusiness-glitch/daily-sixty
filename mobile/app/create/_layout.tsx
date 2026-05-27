import { Stack } from 'expo-router';

export default function CreateLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="category" />
      <Stack.Screen name="input" />
      <Stack.Screen name="q1" />
      <Stack.Screen name="q2" />
      <Stack.Screen name="generating" options={{ animation: 'fade', gestureEnabled: false }} />
      <Stack.Screen name="preview" />
    </Stack>
  );
}
