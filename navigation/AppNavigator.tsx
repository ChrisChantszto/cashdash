import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Tabs } from 'expo-router/tabs';
import { Platform, View } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';

const Stack = createNativeStackNavigator();

// Tab Navigator
function TabNavigator() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.7)',
        headerShown: false,
        tabBarStyle: Platform.select({
          ios: {
            backgroundColor: '#a67c52',
            position: 'absolute',
            borderTopWidth: 0,
            elevation: 0,
          },
          default: {
            backgroundColor: '#a67c52',
            borderTopWidth: 0,
            elevation: 0,
          },
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Expenses',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="calendar" color={color} />,
        }}
      />
      <Tabs.Screen
        name="add-transaction"
        options={{
          title: '',
          tabBarIcon: ({ color }) => (
            <View style={{
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
            }}>
              <IconSymbol size={32} name="plus" color="#fff" />
            </View>
          ),
          tabBarLabel: '',
        }}
      />
      <Tabs.Screen
        name="profile/account"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.crop.circle" color={color} />,
        }}
      />
    </Tabs>
  );
}

// Main App Navigator
export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" component={TabNavigator} />
    </Stack.Navigator>
  );
}
