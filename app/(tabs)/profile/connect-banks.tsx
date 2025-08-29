import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import getApiUrl from '../../utils/api';

const API_URL = getApiUrl();

export default function ConnectBanksScreen() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const connect = async () => {
    try {
      setLoading(true);
      setStatus(null);
      // Demo: call HSBC sandbox endpoint already used elsewhere
      const resp = await fetch(`${API_URL}/hsbc/personal-credit-cards?lang=zh-HK`);
      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(`HSBC API error ${resp.status}: ${text}`);
      }
      await resp.json();
      setStatus('Connected to HSBC sandbox successfully.');
    } catch (e: any) {
      Alert.alert('Connection failed', e.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }}>
        <ThemedText type="title" style={styles.title}>Connect to Banks (Coming Soon)</ThemedText>

        <TouchableOpacity style={styles.primaryButton} onPress={connect} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryButtonText}>Connect to Banks</Text>
          )}
        </TouchableOpacity>

        {status ? <Text style={styles.status}>{status}</Text> : null}

        <View style={styles.box}> 
          <Text style={styles.hint}>This is a demo flow. In production, this would take you through a bank linking experience (e.g., HSBC, FPS, AlipayHK, etc.).</Text>
        </View>
      </ScrollView>
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
    fontSize: 24,
    color: '#5d4037',
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: '#5d4037',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  status: {
    color: '#5d4037',
    marginBottom: 12,
  },
  box: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#eee0d8',
  },
  hint: {
    color: '#6d4c41',
    fontSize: 14,
  },
});
