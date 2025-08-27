import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, StyleSheet } from 'react-native';
import { useUser } from '@/app/UserContext';
import { IconSymbol } from '@/components/ui/IconSymbol';

const Tab = createBottomTabNavigator();
const AddStackNav = createNativeStackNavigator();
const ProfileStackNav = createNativeStackNavigator();

const AddStack = () => (
  <AddStackNav.Navigator screenOptions={{ headerShown: false }}>
    <AddStackNav.Screen
      name="AddSwitcher"
      component={require('@/app/(tabs)/add-switcher').default}
    />
    <AddStackNav.Screen
      name="CategoryPicker"
      component={require('@/app/(tabs)/category-picker').default}
    />
    <AddStackNav.Screen
      name="CreateCategory"
      component={require('@/app/(tabs)/create-category').default}
    />
    <AddStackNav.Screen
      name="RecurringDetails"
      component={require('@/app/(tabs)/recurring-details').default}
    />
  </AddStackNav.Navigator>
);

const ProfileStack = () => {
  const { user } = useUser();
  const hasName = !!user?.name;
  const displayName = hasName ? String(user?.name).split(' ')[0] : 'My';
  const poss = hasName
    ? (displayName.endsWith('s') ? `${displayName}'` : `${displayName}'s`)
    : 'My';
  const walletsTitle = hasName ? `${poss} Wallets` : 'My Wallets';
  const feedbackTitle = hasName ? `${poss} Feedback` : 'My Feedback';

  return (
    <ProfileStackNav.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#8d6e63' },
        headerTintColor: '#ffffff',
        headerTitleStyle: { color: '#ffffff', fontWeight: '700' },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: '#f8f4e9' },
      }}
    >
      <ProfileStackNav.Screen
        name="Account"
        component={require('@/app/(tabs)/profile/account').default}
        options={{ headerShown: false }}
      />
      <ProfileStackNav.Screen
        name="Wallets"
        component={require('@/app/(tabs)/profile/wallets').default}
        options={{ title: walletsTitle }}
      />
      <ProfileStackNav.Screen
        name="ConnectBanks"
        component={require('@/app/(tabs)/profile/connect-banks').default}
        options={{ title: 'Connect to Banks' }}
      />
      <ProfileStackNav.Screen
        name="HelpSupport"
        component={require('@/app/(tabs)/profile/help').default}
        options={{ title: 'Help & Support' }}
      />
      <ProfileStackNav.Screen
        name="Settings"
        component={require('@/app/(tabs)/profile/settings').default}
        options={{ title: 'Settings' }}
      />
      <ProfileStackNav.Screen
        name="Notifications"
        component={require('@/app/(tabs)/profile/notifications').default}
        options={{ title: 'Notifications' }}
      />
      <ProfileStackNav.Screen
        name="Language"
        component={require('@/app/(tabs)/profile/language').default}
        options={{ title: 'Language' }}
      />
      <ProfileStackNav.Screen
        name="About"
        component={require('@/app/(tabs)/profile/about').default}
        options={{ title: 'About' }}
      />
      <ProfileStackNav.Screen
        name="Feedback"
        component={require('@/app/(tabs)/profile/feedback').default}
        options={{ title: feedbackTitle }}
      />
    </ProfileStackNav.Navigator>
  );
};

export const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#5d4037',
        tabBarInactiveTintColor: '#8d6e63',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#f8f4e9',
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: '#cbb7aa',
          elevation: 0,
          shadowOpacity: 0,
        },
      }}
    >
      <Tab.Screen
        name="Expenses"
        component={require('@/app/(tabs)/index').default}
        options={{
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name="calendar" color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Add"
        component={AddStack}
        options={{
          tabBarIcon: ({ color }) => (
            <View style={styles.plusButton}>
              <IconSymbol size={24} name="plus" color="#fff" />
            </View>
          ),
          tabBarLabel: '',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name="person.crop.circle" color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  plusButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#8d6e63',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
