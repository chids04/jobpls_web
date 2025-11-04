import { useState, useEffect, useCallback } from 'react';

/**
 * custom hook for localStorage with proper error handling and SSR support
 */
export function useLocalStorage<T>(
  key: string,
  defaultValue: T,
  deserialize: (value: string) => T = JSON.parse
): [T, (value: T | ((prev: T) => T)) => void] {
  // lazy initial state - only runs once and handles SSR
  const [storedValue, setStoredValue] = useState<T>(() => {
    // return default value during SSR
    if (typeof window === 'undefined') {
      return defaultValue;
    }

    try {
      const item = localStorage.getItem(key);
      return item ? deserialize(item) : defaultValue;
    } catch (error) {
      console.warn(`error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  });

  // wrapped setter that persists to localStorage
  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    try {
      // allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;

      setStoredValue(valueToStore);

      // only write to localStorage on client side
      if (typeof window !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  // listen for changes from other tabs/windows
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(deserialize(e.newValue));
        } catch (error) {
          console.warn(`error deserializing localStorage key "${key}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, deserialize]);

  return [storedValue, setValue];
}

/**
 * safe localStorage operations for non-hook usage
 */
export function safeReadLocalStorage<T = unknown>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function safeWriteLocalStorage(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    if (value === null || value === undefined) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, JSON.stringify(value));
    }
  } catch (error) {
    console.warn(`error writing to localStorage key "${key}":`, error);
  }
}

export function safeRemoveLocalStorage(key: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn(`error removing localStorage key "${key}":`, error);
  }
}
