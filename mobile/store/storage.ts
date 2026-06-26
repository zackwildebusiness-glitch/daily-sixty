import { createMMKV } from 'react-native-mmkv';
import { StateStorage } from 'zustand/middleware';

// Native persistence for the zustand store. The web build resolves
// storage.web.ts instead (MMKV is a native Nitro module with no browser
// support), so this file only ships on iOS/Android.
const mmkv = createMMKV({ id: 'daily60-store' });

export const storage: StateStorage = {
  getItem: (name) => mmkv.getString(name) ?? null,
  setItem: (name, value) => mmkv.set(name, value),
  removeItem: (name) => mmkv.remove(name),
};
