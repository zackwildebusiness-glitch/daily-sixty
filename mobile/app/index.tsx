import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAppStore } from '../store';

export default function Index() {
  const router = useRouter();
  const { hasSeenOnboarding, user, goals } = useAppStore();

  useEffect(() => {
    // Small delay so layout mounts before navigation
    const t = setTimeout(() => {
      if (!hasSeenOnboarding) {
        router.replace('/splash');
      } else if (!user) {
        router.replace('/name');
      } else if (goals.length === 0) {
        router.replace('/create/category');
      } else {
        router.replace('/(tabs)');
      }
    }, 50);
    return () => clearTimeout(t);
  }, []);

  return null;
}
