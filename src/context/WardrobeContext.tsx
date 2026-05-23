import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { WardrobeItem, ChildPattern } from '../lib/types';
import { storageGet, storageSet } from '../lib/storage';
import { DEFAULT_PATTERNS, DEFAULT_CHILD_SLEEP_PATTERNS, DEFAULT_ADULT_SLEEP_PATTERNS } from '../lib/defaults';

const WARDROBE_KEY = 'wardrobeItems';
const PATTERNS_KEY = 'childPatterns';
const CHILD_SLEEP_KEY = 'childSleepPatterns';
const ADULT_SLEEP_KEY = 'adultSleepPatterns';
const SEEDED_KEY = 'defaultsSeeded';
const SLEEP_SEEDED_KEY = 'sleepDefaultsSeeded';

interface WardrobeContextValue {
  wardrobeItems: WardrobeItem[];
  childPatterns: ChildPattern[];
  childSleepPatterns: ChildPattern[];
  adultSleepPatterns: ChildPattern[];
  addWardrobeItem: (item: WardrobeItem) => boolean;
  updateWardrobeItem: (item: WardrobeItem) => boolean;
  deleteWardrobeItem: (id: string) => boolean;
  addChildPattern: (pattern: ChildPattern) => boolean;
  updateChildPattern: (pattern: ChildPattern) => boolean;
  deleteChildPattern: (id: string) => boolean;
  addChildSleepPattern: (pattern: ChildPattern) => boolean;
  updateChildSleepPattern: (pattern: ChildPattern) => boolean;
  deleteChildSleepPattern: (id: string) => boolean;
  addAdultSleepPattern: (pattern: ChildPattern) => boolean;
  updateAdultSleepPattern: (pattern: ChildPattern) => boolean;
  deleteAdultSleepPattern: (id: string) => boolean;
  exportData: () => string;
  importData: (json: string) => boolean;
}

const WardrobeContext = createContext<WardrobeContextValue | null>(null);

function seedSleepPatterns() {
  const seeded = storageGet<boolean>(SLEEP_SEEDED_KEY);
  if (!seeded) {
    storageSet(CHILD_SLEEP_KEY, DEFAULT_CHILD_SLEEP_PATTERNS);
    storageSet(ADULT_SLEEP_KEY, DEFAULT_ADULT_SLEEP_PATTERNS);
    storageSet(SLEEP_SEEDED_KEY, true);
    return { child: DEFAULT_CHILD_SLEEP_PATTERNS, adult: DEFAULT_ADULT_SLEEP_PATTERNS };
  }
  return {
    child: storageGet<ChildPattern[]>(CHILD_SLEEP_KEY) ?? [],
    adult: storageGet<ChildPattern[]>(ADULT_SLEEP_KEY) ?? [],
  };
}

export function WardrobeProvider({ children }: { children: ReactNode }) {
  const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>(() => {
    return storageGet<WardrobeItem[]>(WARDROBE_KEY) ?? [];
  });

  const [childPatterns, setChildPatterns] = useState<ChildPattern[]>(() => {
    const saved = storageGet<ChildPattern[]>(PATTERNS_KEY);
    if (saved !== null) return saved;
    const seeded = storageGet<boolean>(SEEDED_KEY);
    if (!seeded) {
      storageSet(PATTERNS_KEY, DEFAULT_PATTERNS);
      storageSet(SEEDED_KEY, true);
      return DEFAULT_PATTERNS;
    }
    return [];
  });

  const [childSleepPatterns, setChildSleepPatterns] = useState<ChildPattern[]>(() => {
    return seedSleepPatterns().child;
  });

  const [adultSleepPatterns, setAdultSleepPatterns] = useState<ChildPattern[]>(() => {
    return storageGet<ChildPattern[]>(ADULT_SLEEP_KEY) ?? DEFAULT_ADULT_SLEEP_PATTERNS;
  });

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

  const addChildSleepPattern = useCallback((pattern: ChildPattern): boolean => {
    const next = [...childSleepPatterns, pattern];
    const ok = storageSet(CHILD_SLEEP_KEY, next);
    if (ok) setChildSleepPatterns(next);
    return ok;
  }, [childSleepPatterns]);

  const updateChildSleepPattern = useCallback((pattern: ChildPattern): boolean => {
    const next = childSleepPatterns.map(p => p.id === pattern.id ? pattern : p);
    const ok = storageSet(CHILD_SLEEP_KEY, next);
    if (ok) setChildSleepPatterns(next);
    return ok;
  }, [childSleepPatterns]);

  const deleteChildSleepPattern = useCallback((id: string): boolean => {
    const next = childSleepPatterns.filter(p => p.id !== id);
    const ok = storageSet(CHILD_SLEEP_KEY, next);
    if (ok) setChildSleepPatterns(next);
    return ok;
  }, [childSleepPatterns]);

  const addAdultSleepPattern = useCallback((pattern: ChildPattern): boolean => {
    const next = [...adultSleepPatterns, pattern];
    const ok = storageSet(ADULT_SLEEP_KEY, next);
    if (ok) setAdultSleepPatterns(next);
    return ok;
  }, [adultSleepPatterns]);

  const updateAdultSleepPattern = useCallback((pattern: ChildPattern): boolean => {
    const next = adultSleepPatterns.map(p => p.id === pattern.id ? pattern : p);
    const ok = storageSet(ADULT_SLEEP_KEY, next);
    if (ok) setAdultSleepPatterns(next);
    return ok;
  }, [adultSleepPatterns]);

  const deleteAdultSleepPattern = useCallback((id: string): boolean => {
    const next = adultSleepPatterns.filter(p => p.id !== id);
    const ok = storageSet(ADULT_SLEEP_KEY, next);
    if (ok) setAdultSleepPatterns(next);
    return ok;
  }, [adultSleepPatterns]);

  const exportData = useCallback((): string => {
    return JSON.stringify({
      wardrobeItems,
      childPatterns,
      childSleepPatterns,
      adultSleepPatterns,
    }, null, 2);
  }, [wardrobeItems, childPatterns, childSleepPatterns, adultSleepPatterns]);

  const importData = useCallback((json: string): boolean => {
    try {
      const data = JSON.parse(json) as {
        wardrobeItems: WardrobeItem[];
        childPatterns: ChildPattern[];
        childSleepPatterns?: ChildPattern[];
        adultSleepPatterns?: ChildPattern[];
      };
      if (!Array.isArray(data.wardrobeItems) || !Array.isArray(data.childPatterns)) return false;
      const ok1 = storageSet(WARDROBE_KEY, data.wardrobeItems);
      const ok2 = storageSet(PATTERNS_KEY, data.childPatterns);
      if (!ok1 || !ok2) return false;
      setWardrobeItems(data.wardrobeItems);
      setChildPatterns(data.childPatterns);
      if (Array.isArray(data.childSleepPatterns)) {
        storageSet(CHILD_SLEEP_KEY, data.childSleepPatterns);
        setChildSleepPatterns(data.childSleepPatterns);
      }
      if (Array.isArray(data.adultSleepPatterns)) {
        storageSet(ADULT_SLEEP_KEY, data.adultSleepPatterns);
        setAdultSleepPatterns(data.adultSleepPatterns);
      }
      return true;
    } catch {
      return false;
    }
  }, []);

  return (
    <WardrobeContext.Provider value={{
      wardrobeItems,
      childPatterns,
      childSleepPatterns,
      adultSleepPatterns,
      addWardrobeItem,
      updateWardrobeItem,
      deleteWardrobeItem,
      addChildPattern,
      updateChildPattern,
      deleteChildPattern,
      addChildSleepPattern,
      updateChildSleepPattern,
      deleteChildSleepPattern,
      addAdultSleepPattern,
      updateAdultSleepPattern,
      deleteAdultSleepPattern,
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
