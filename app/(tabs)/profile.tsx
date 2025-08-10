import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useRouter } from 'expo-router';
import { Link } from 'expo-router';

type MenuOption = {
  key: string;
  label: string;
  icon: keyof typeof FontAwesome.glyphMap;
  path?: string;
};

const OPTIONS: MenuOption[] = [
  { key: 'scan-qr', label: 'Scan QR Code', icon: 'qrcode', path: '/qr-scanner' },
  { key: 'my-account', label: 'My Account', icon: 'user', path: '/(tabs)/profile/account' },
  { key: 'my-bank-accounts', label: 'My Bank Accounts', icon: 'credit-card' },
  { key: 'help-support', label: 'Help and Support', icon: 'question-circle' },
  { key: 'settings', label: 'Settings', icon: 'cog' },
  { key: 'about', label: 'About', icon: 'info-circle' },
  { key: 'store', label: 'Store', icon: 'shopping-bag' },
];

export default function ProfileScreen() {
  const router = useRouter();
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>Profile</ThemedText>
      <FlatList
        data={OPTIONS}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.option}
            onPress={() => {
              if (item.path) {
                router.push(item.path as any);
              }
              // Add navigation for other options as needed
            }}
          >
            <View style={styles.optionContent}>
              <FontAwesome 
                name={item.icon} 
                size={20} 
                color="#5d4037" 
                style={styles.optionIcon} 
              />
              <Text style={styles.optionText}>{item.label}</Text>
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={item => item.key}
        contentContainerStyle={styles.list}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f4e9',
    padding: 24,
  },
  title: {
    marginBottom: 24,
    textAlign: 'center',
    color: '#5d4037',
  },
  list: {
    paddingBottom: 16,
  },
  option: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#d7ccc8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIcon: {
    marginRight: 12,
    width: 24,
    textAlign: 'center',
  },
  optionText: {
    fontSize: 16,
    color: '#5d4037',
    flex: 1,
    fontWeight: '600',
  },
});
