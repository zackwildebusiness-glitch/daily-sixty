import { StateStorage } from 'zustand/middleware';

// Web persistence for the zustand store. Native MMKV (a Nitro module) has no
// browser support, so the web/demo build falls back to localStorage behind the
// same StateStorage contract. Metro auto-resolves this file for web bundles.
export const storage: StateStorage = {
  getItem: (name) => globalThis.localStorage?.getItem(name) ?? null,
  setItem: (name, value) => {
    globalThis.localStorage?.setItem(name, value);
  },
  removeItem: (name) => {
    globalThis.localStorage?.removeItem(name);
  },
};
