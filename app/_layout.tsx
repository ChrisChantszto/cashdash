import { MainTabs } from '@/components/MainTabs';
import { useColorScheme } from '@/hooks/useColorScheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, LogBox, Platform, SafeAreaView, StyleSheet, View } from 'react-native';
import 'react-native-reanimated';
import { User } from '../types';
import { UserContext } from './UserContext';
import getApiUrl from './utils/api';
import LoginScreen from './LoginScreen';
import SignInScreen from './SignInScreen';
import { AppLockProvider, useAppLock } from './contexts/AppLockContext';
import { PINUnlockScreen } from './components/PINUnlockScreen';

// Import screens

// Fix for web: Ensure all required polyfills are available
if (typeof Buffer === 'undefined') {
  global.Buffer = require('buffer').Buffer;
}

// Ensure we have process defined for web
if (typeof process === 'undefined') {
  // @ts-ignore
  global.process = {
    env: { NODE_ENV: 'development' } as any,
    nextTick: (callback: (...args: any[]) => void, ...args: any[]) => {
      return setTimeout(() => callback(...args), 0);
    },
  } as any;
}

// Ignore specific warnings
LogBox.ignoreLogs([
  'ViewPropTypes will be removed',
  'AsyncStorage has been extracted',
]);

console.log('App is initializing...');

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync().catch(() => {
  /* reloading the app might trigger some race conditions, ignore them */
});

export default function RootLayout() {
  console.log('RootLayout component rendering...');
  const colorScheme = useColorScheme();
  // Using only SpaceMono font to prevent loading issues
  const [fontsLoaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const [user, setUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);
  const API_URL = getApiUrl();

  useEffect(() => {
    async function prepare() {
      try {
        // Keep the splash screen visible while we fetch resources
        await SplashScreen.preventAutoHideAsync();
        // Small delay to ensure everything is ready
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (e) {
        console.warn('Failed to prepare app:', e);
      } finally {
        // Tell the application to render
        setIsReady(true);
      }
    }
    
    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded && isReady) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isReady]);

  // Wrap setUser to add logging and avoid redundant updates (keep stable identity)
  const setUserWithLogging = useCallback((userData: User | null) => {
    setUser((prev) => {
      // If effectively the same user, skip state update to prevent rerender loops
      try {
        if (prev && userData && prev._id === (userData as any)._id) {
          const prevStr = JSON.stringify(prev);
          const nextStr = JSON.stringify(userData);
          if (prevStr === nextStr) {
            return prev;
          }
        }
      } catch {}
      console.log('User state changing from', prev, 'to', userData);
      return userData;
    });
  }, []);

  // Handle user login
  const handleLogin = useCallback((userData: User) => {
    console.log('User logged in:', userData);
    setUserWithLogging(userData);
  }, [setUserWithLogging]);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    user,
    setUser: setUserWithLogging,
  }), [user, setUserWithLogging]);

  const Stack = createNativeStackNavigator();

  // Show a simple loading view instead of null to prevent layout issues on web
  if (!fontsLoaded || !isReady) {
    return (
      <View style={styles.container}>
        <View style={{ flex: 1, backgroundColor: '#f5f5f5' }} />
      </View>
    );
  }

  // Use SafeAreaView on native to avoid content under the status bar/notch
  const RootView = Platform.OS === 'web' ? View : SafeAreaView;
  
  return (
    <RootView style={styles.container} onLayout={onLayoutRootView} testID="root-view">
      <AppLockProvider>
        <UserContext.Provider value={contextValue}>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <AppContent user={user} handleLogin={handleLogin} />
            <StatusBar style="auto" />
          </ThemeProvider>
        </UserContext.Provider>
      </AppLockProvider>
    </RootView>
  );
}

const AppContent: React.FC<{ user: User | null; handleLogin: (user: User) => void }> = ({ user, handleLogin }) => {
  const { isLocked, verifyPIN, unlockApp } = useAppLock();
  const Stack = createNativeStackNavigator();

  const handlePINUnlock = async (pin: string) => {
    const isValid = await verifyPIN(pin);
    if (isValid) {
      unlockApp();
    }
    return isValid;
  };

  if (isLocked && user) {
    return <PINUnlockScreen onUnlock={handlePINUnlock} />;
  }

  return (
    <React.Suspense fallback={
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    }>
      <Stack.Navigator
        key={'app'}
        screenOptions={{
          headerShown: false,
          animation: 'fade',
        }}
      >
        {user ? (
          <Stack.Screen name="MainTabs" component={MainTabs} />
        ) : (
          <>
            <Stack.Screen name="Login">
              {(props) => <LoginScreen {...props} onLogin={handleLogin} />}
            </Stack.Screen>
            <Stack.Screen name="SignIn">
              {(props) => <SignInScreen {...props} onLogin={handleLogin} />}
            </Stack.Screen>
          </>
        )}
      </Stack.Navigator>
    </React.Suspense>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f4e9',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  plusButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#8d6e63',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Platform.OS === 'ios' ? 10 : 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
