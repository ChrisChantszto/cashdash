import React from 'react';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Platform } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';

// Import your tab screens
import IndexScreen from '../app/(tabs)/index';
import AddTransactionScreen from '../app/(tabs)/add-transaction';
import AccountScreen from '../app/(tabs)/profile/account';

const Tab = createBottomTabNavigator();

const AppNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.7)',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#a67c52',
          borderTopWidth: 0,
          elevation: 0,
          ...(Platform.OS === 'web' ? { position: 'relative' } : {})
        },
      }}
    >
        <Tab.Screen
          name="Home"
          component={IndexScreen}
          options={{
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="calendar" color={color} />,
            title: 'Expenses',
          }}
        />
        <Tab.Screen
          name="Add"
          component={AddTransactionScreen}
          options={{
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
            title: '',
          }}
        />
        <Tab.Screen
          name="Account"
          component={AccountScreen}
          options={{
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.crop.circle" color={color} />,
            title: 'Profile',
          }}
        />
    </Tab.Navigator>
  );
};

export default AppNavigator;
