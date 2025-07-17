import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import React, { useState } from 'react';
import { useColorScheme } from '@/hooks/useColorScheme';
import LoginScreen, { User } from './LoginScreen';
import { UserContext } from './UserContext';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const [user, setUser] = useState<User | null>(null);

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
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
  );
}
