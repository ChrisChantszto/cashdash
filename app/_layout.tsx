import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, LogBox, Platform, SafeAreaView, ActivityIndicator } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { User } from '../types';
import { UserContext } from './UserContext';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainTabs } from '@/components/MainTabs';

// Import screens
const LoginScreen = React.lazy(() => import('./LoginScreen'));
const SignInScreen = React.lazy(() => import('./SignInScreen'));

// Fix for web: Ensure all required polyfills are available
if (typeof Buffer === 'undefined') {
  global.Buffer = require('buffer').Buffer;
}

// Ensure we have process defined for web
if (typeof process === 'undefined') {
  // @ts-ignore
  global.process = {
    env: process?.env || {},
    nextTick: (callback: (...args: any[]) => void, ...args: any[]) => {
      return setTimeout(() => callback(...args), 0);
    },
  };
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

  // Wrap setUser to add logging
  const setUserWithLogging = useCallback((userData: User | null) => {
    console.log('User state changing from', user, 'to', userData);
    setUser(userData);
  }, [user]);

  const handleLogin = useCallback((userData: User) => {
    console.log('Handling login for user:', userData);
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

  const RootView = Platform.OS === 'web' ? SafeAreaView : View;
  
  return (
    <RootView style={styles.container} onLayout={onLayoutRootView} testID="root-view">
      <UserContext.Provider value={contextValue}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <React.Suspense fallback={
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
              </View>
            }>
              <Stack.Navigator
                key={user ? 'app' : 'auth'}
                screenOptions={{
                  headerShown: false,
                  animation: 'fade',
                }}
              >
                {user ? (
                  // Authenticated screens
                  <Stack.Screen name="MainTabs" component={MainTabs} />
                ) : (
                  // Auth screens
                  <>
                    <Stack.Screen name="Login" options={{ headerShown: false }}>
                      {(props) => (
                        <React.Suspense fallback={<View style={styles.loadingContainer}><ActivityIndicator /></View>}>
                          <LoginScreen {...props} onLogin={handleLogin} />
                        </React.Suspense>
                      )}
                    </Stack.Screen>
                    <Stack.Screen name="SignIn" options={{ headerShown: false }}>
                      {(props) => (
                        <React.Suspense fallback={<View style={styles.loadingContainer}><ActivityIndicator /></View>}>
                          <SignInScreen {...props} onLogin={handleLogin} />
                        </React.Suspense>
                      )}
                    </Stack.Screen>
                  </>
                )}
              </Stack.Navigator>
            </React.Suspense>
            <StatusBar style="auto" />
        </ThemeProvider>
      </UserContext.Provider>
    </RootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
