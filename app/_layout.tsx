import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, LogBox } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import LoginScreen, { User } from './LoginScreen';
import { UserContext } from './UserContext';

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
    'PlayfairDisplay-Regular': require('../assets/fonts/PlayfairDisplay-Regular.ttf'),
    'PlayfairDisplay-Bold': require('../assets/fonts/PlayfairDisplay-Bold.ttf'),
  });
  
  // Add a small delay to ensure fonts are fully loaded
  const [appIsReady, setAppIsReady] = useState(false);
  
  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load any assets here if needed
        await new Promise(resolve => setTimeout(resolve, 500)); // Small delay
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
      }
    }
    
    prepare();
  }, []);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    console.log('Font loading status:', { fontsLoaded });
  }, [fontsLoaded]);

  const onLayoutRootView = useCallback(async () => {
    console.log('onLayoutRootView called, fontsLoaded:', fontsLoaded);
    if (fontsLoaded && appIsReady) {
      console.log('Hiding splash screen...');
      try {
        await SplashScreen.hideAsync();
        console.log('Splash screen hidden successfully');
      } catch (e) {
        console.warn('Error hiding splash screen:', e);
      }
    }
  }, [fontsLoaded, appIsReady]);

  if (!fontsLoaded || !appIsReady) {
    return (
      <View style={[styles.container, {justifyContent: 'center', alignItems: 'center'}]}>
        <Text style={{textAlign: 'center', fontSize: 18, color: '#333'}}>
          Loading Cashly...
        </Text>
      </View>
    );
  }

  console.log('Rendering main app UI, user:', user ? 'Logged in' : 'Not logged in');
  
  return (
    <View style={styles.container} onLayout={onLayoutRootView} testID="root-view">
      <UserContext.Provider value={{ user, setUser }}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          {user ? (
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false, presentation: 'card' }} />
              <Stack.Screen name="+not-found" />
            </Stack>
          ) : (
            <LoginScreen onLogin={setUser} />
          )}
          <StatusBar style="auto" />
        </ThemeProvider>
      </UserContext.Provider>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
