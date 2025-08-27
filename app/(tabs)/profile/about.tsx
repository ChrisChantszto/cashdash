import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import * as Application from 'expo-application';

export default function AboutScreen() {
  const version = Application.nativeApplicationVersion || '1.0.0';
  const build = Application.nativeBuildVersion || '1';

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }}>
        <ThemedText type="title" style={styles.title}>About</ThemedText>
        <View style={styles.card}>
          <Text style={styles.text}>Cashdash</Text>
          <Text style={styles.text}>Version: {version} ({build})</Text>
          <Text style={[styles.text, { marginTop: 8 }]}>A minimalist expense app crafted with care.</Text>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f4e9', padding: 24 },
  title: { fontSize: 24, color: '#5d4037', marginBottom: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#eee0d8', padding: 16 },
  text: { color: '#5d4037', marginBottom: 4 },
});
