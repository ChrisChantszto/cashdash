import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, AppStateStatus } from 'react-native';

type LockTimeout = 'immediate' | '1m' | '5m' | '15m' | '30m' | '1h';

interface AppLockContextType {
  isAppLockEnabled: boolean;
  lockTimeout: LockTimeout;
  isLocked: boolean;
  hasPIN: boolean;
  setAppLockEnabled: (enabled: boolean) => Promise<void>;
  setLockTimeout: (timeout: LockTimeout) => Promise<void>;
  setupPIN: (pin: string) => Promise<void>;
  verifyPIN: (pin: string) => Promise<boolean>;
  lockApp: () => void;
  unlockApp: () => void;
}

const AppLockContext = createContext<AppLockContextType | undefined>(undefined);

const STORAGE_KEYS = {
  APP_LOCK_ENABLED: 'app_lock_enabled',
  LOCK_TIMEOUT: 'lock_timeout',
  PIN_HASH: 'pin_hash',
  LAST_BACKGROUND_TIME: 'last_background_time',
};

const TIMEOUT_MILLISECONDS: Record<LockTimeout, number> = {
  immediate: 0,
  '1m': 60 * 1000,
  '5m': 5 * 60 * 1000,
  '15m': 15 * 60 * 1000,
  '30m': 30 * 60 * 1000,
  '1h': 60 * 60 * 1000,
};

// Simple hash function for PIN storage
const hashPIN = (pin: string): string => {
  let hash = 0;
  for (let i = 0; i < pin.length; i++) {
    const char = pin.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString();
};

export const AppLockProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAppLockEnabled, setIsAppLockEnabledState] = useState(false);
  const [lockTimeout, setLockTimeoutState] = useState<LockTimeout>('immediate');
  const [isLocked, setIsLocked] = useState(false);
  const [hasPIN, setHasPIN] = useState(false);
  const [lastBackgroundTime, setLastBackgroundTime] = useState<number | null>(null);

  // Load settings from storage on app start
  useEffect(() => {
    loadSettings();
  }, []);

  // Monitor app state changes
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        handleAppBackground();
      } else if (nextAppState === 'active') {
        handleAppForeground();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [isAppLockEnabled, lockTimeout]);

  const loadSettings = async () => {
    try {
      const [enabled, timeout, pinHash] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.APP_LOCK_ENABLED),
        AsyncStorage.getItem(STORAGE_KEYS.LOCK_TIMEOUT),
        AsyncStorage.getItem(STORAGE_KEYS.PIN_HASH),
      ]);

      setIsAppLockEnabledState(enabled === 'true');
      setLockTimeoutState((timeout as LockTimeout) || 'immediate');
      setHasPIN(!!pinHash);
    } catch (error) {
      console.error('Error loading app lock settings:', error);
    }
  };

  const setAppLockEnabled = async (enabled: boolean) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.APP_LOCK_ENABLED, enabled.toString());
      setIsAppLockEnabledState(enabled);
      
      if (!enabled) {
        setIsLocked(false);
        // Clear PIN when disabling app lock so user can set new PIN when re-enabling
        await AsyncStorage.removeItem(STORAGE_KEYS.PIN_HASH);
        setHasPIN(false);
      }
    } catch (error) {
      console.error('Error saving app lock enabled setting:', error);
    }
  };

  const setLockTimeout = async (timeout: LockTimeout) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LOCK_TIMEOUT, timeout);
      setLockTimeoutState(timeout);
    } catch (error) {
      console.error('Error saving lock timeout setting:', error);
    }
  };

  const setupPIN = async (pin: string) => {
    try {
      const hashedPIN = hashPIN(pin);
      await AsyncStorage.setItem(STORAGE_KEYS.PIN_HASH, hashedPIN);
      setHasPIN(true);
    } catch (error) {
      console.error('Error saving PIN:', error);
      throw error;
    }
  };

  const verifyPIN = async (pin: string): Promise<boolean> => {
    try {
      const storedHash = await AsyncStorage.getItem(STORAGE_KEYS.PIN_HASH);
      if (!storedHash) return false;
      
      const inputHash = hashPIN(pin);
      return inputHash === storedHash;
    } catch (error) {
      console.error('Error verifying PIN:', error);
      return false;
    }
  };

  const handleAppBackground = async () => {
    if (isAppLockEnabled && hasPIN) {
      const currentTime = Date.now();
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_BACKGROUND_TIME, currentTime.toString());
      setLastBackgroundTime(currentTime);
    }
  };

  const handleAppForeground = async () => {
    if (!isAppLockEnabled || !hasPIN) return;

    try {
      const storedTime = await AsyncStorage.getItem(STORAGE_KEYS.LAST_BACKGROUND_TIME);
      if (!storedTime) return;

      const backgroundTime = parseInt(storedTime, 10);
      const currentTime = Date.now();
      const timeDifference = currentTime - backgroundTime;
      const timeoutMs = TIMEOUT_MILLISECONDS[lockTimeout];

      if (timeDifference >= timeoutMs) {
        setIsLocked(true);
      }
    } catch (error) {
      console.error('Error checking app foreground:', error);
    }
  };

  const lockApp = () => {
    if (isAppLockEnabled && hasPIN) {
      setIsLocked(true);
    }
  };

  const unlockApp = () => {
    setIsLocked(false);
  };

  const value: AppLockContextType = {
    isAppLockEnabled,
    lockTimeout,
    isLocked,
    hasPIN,
    setAppLockEnabled,
    setLockTimeout,
    setupPIN,
    verifyPIN,
    lockApp,
    unlockApp,
  };

  return (
    <AppLockContext.Provider value={value}>
      {children}
    </AppLockContext.Provider>
  );
};

export const useAppLock = (): AppLockContextType => {
  const context = useContext(AppLockContext);
  if (!context) {
    throw new Error('useAppLock must be used within an AppLockProvider');
  }
  return context;
};

// Default export for Expo Router
export default useAppLock;
