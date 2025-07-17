import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useRouter } from 'expo-router';

const OPTIONS = [
  { key: 'my-account', label: 'My Account' },
  { key: 'my-bank-accounts', label: 'My Bank Accounts' },
  { key: 'help-support', label: 'Help and Support' },
  { key: 'settings', label: 'Settings' },
  { key: 'about', label: 'About' },
  { key: 'store', label: 'Store' },
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
              if (item.key === 'my-account') router.push('/(tabs)/profile/account');
              // Add navigation for other options as needed
            }}
          >
            <Text style={styles.optionText}>{item.label}</Text>
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
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#d7ccc8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  optionText: {
    fontSize: 18,
    color: '#5d4037',
    fontWeight: '600',
  },
});
