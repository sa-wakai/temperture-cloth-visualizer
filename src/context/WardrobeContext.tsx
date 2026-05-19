import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { WardrobeItem, ChildPattern } from '../lib/types';
import { storageGet, storageSet } from '../lib/storage';
import { DEFAULT_PATTERNS } from '../lib/defaults';

const WARDROBE_KEY = 'wardrobeItems';
const PATTERNS_KEY = 'childPatterns';
const SEEDED_KEY = 'defaultsSeeded';

interface WardrobeContextValue {
  wardrobeItems: WardrobeItem[];
  childPatterns: ChildPattern[];
  addWardrobeItem: (item: WardrobeItem) => boolean;
  updateWardrobeItem: (item: WardrobeItem) => boolean;
  deleteWardrobeItem: (id: string) => boolean;
  addChildPattern: (pattern: ChildPattern) => boolean;
  updateChildPattern: (pattern: ChildPattern) => boolean;
  deleteChildPattern: (id: string) => boolean;
  exportData: () => string;
  importData: (json: string) => boolean;
}

const WardrobeContext = createContext<WardrobeContextValue | null>(null);

export function WardrobeProvider({ children }: { children: ReactNode }) {
  const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>(() => {
    return storageGet<WardrobeItem[]>(WARDROBE_KEY) ?? [];
  });

  const [childPatterns, setChildPatterns] = useState<ChildPattern[]>(() => {
    const saved = storageGet<ChildPattern[]>(PATTERNS_KEY);
    if (saved !== null) return saved;
    // Seed defaults on first launch
    const seeded = storageGet<boolean>(SEEDED_KEY);
    if (!seeded) {
      storageSet(PATTERNS_KEY, DEFAULT_PATTERNS);
      storageSet(SEEDED_KEY, true);
      return DEFAULT_PATTERNS;
    }
    return [];
  });

  // Request persistent storage on init
  useEffect(() => {
    if (navigator.storage?.persist) {
      navigator.storage.persist().catch(() => { /* ignore */ });
    }
  }, []);

  const addWardrobeItem = useCallback((item: WardrobeItem): boolean => {
    const next = [...wardrobeItems, item];
    const ok = storageSet(WARDROBE_KEY, next);
    if (ok) setWardrobeItems(next);
    return ok;
  }, [wardrobeItems]);

  const updateWardrobeItem = useCallback((item: WardrobeItem): boolean => {
    const next = wardrobeItems.map(w => w.id === item.id ? item : w);
    const ok = storageSet(WARDROBE_KEY, next);
    if (ok) setWardrobeItems(next);
    return ok;
  }, [wardrobeItems]);

  const deleteWardrobeItem = useCallback((id: string): boolean => {
    const next = wardrobeItems.filter(w => w.id !== id);
    const ok = storageSet(WARDROBE_KEY, next);
    if (ok) setWardrobeItems(next);
    return ok;
  }, [wardrobeItems]);

  const addChildPattern = useCallback((pattern: ChildPattern): boolean => {
    const next = [...childPatterns, pattern];
    const ok = storageSet(PATTERNS_KEY, next);
    if (ok) setChildPatterns(next);
    return ok;
  }, [childPatterns]);

  const updateChildPattern = useCallback((pattern: ChildPattern): boolean => {
    const next = childPatterns.map(p => p.id === pattern.id ? pattern : p);
    const ok = storageSet(PATTERNS_KEY, next);
    if (ok) setChildPatterns(next);
    return ok;
  }, [childPatterns]);

  const deleteChildPattern = useCallback((id: string): boolean => {
    const next = childPatterns.filter(p => p.id !== id);
    const ok = storageSet(PATTERNS_KEY, next);
    if (ok) setChildPatterns(next);
    return ok;
  }, [childPatterns]);

  const exportData = useCallback((): string => {
    return JSON.stringify({ wardrobeItems, childPatterns }, null, 2);
  }, [wardrobeItems, childPatterns]);

  const importData = useCallback((json: string): boolean => {
    try {
      const data = JSON.parse(json) as { wardrobeItems: WardrobeItem[]; childPatterns: ChildPattern[] };
      if (!Array.isArray(data.wardrobeItems) || !Array.isArray(data.childPatterns)) return false;
      const ok1 = storageSet(WARDROBE_KEY, data.wardrobeItems);
      const ok2 = storageSet(PATTERNS_KEY, data.childPatterns);
      if (ok1 && ok2) {
        setWardrobeItems(data.wardrobeItems);
        setChildPatterns(data.childPatterns);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  return (
    <WardrobeContext.Provider value={{
      wardrobeItems,
      childPatterns,
      addWardrobeItem,
      updateWardrobeItem,
      deleteWardrobeItem,
      addChildPattern,
      updateChildPattern,
      deleteChildPattern,
      exportData,
      importData,
    }}>
      {children}
    </WardrobeContext.Provider>
  );
}

export function useWardrobe(): WardrobeContextValue {
  const ctx = useContext(WardrobeContext);
  if (!ctx) throw new Error('useWardrobe must be used within WardrobeProvider');
  return ctx;
}
