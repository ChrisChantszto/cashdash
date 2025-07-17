import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';

export default function NetWorthScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>Net Worth</ThemedText>
      <Text style={styles.text}>Track your assets and liabilities here. (Coming soon!)</Text>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f4e9',
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginBottom: 24,
    textAlign: 'center',
    color: '#5d4037',
  },
  text: {
    fontSize: 18,
    color: '#8d6e63',
    textAlign: 'center',
  },
});
