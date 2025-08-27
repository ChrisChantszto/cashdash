import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';

const LINKED_WALLETS_DEFAULT = [
  { id: '1', name: 'HSBC Premier Credit Card', icon: 'credit-card' as const },
  { id: '2', name: 'Alipay HK', icon: 'mobile' as const },
];

export default function WalletsScreen() {
  const navigation = useNavigation<any>();
  const [wallets] = useState(LINKED_WALLETS_DEFAULT);

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }}>
        <ThemedText type="title" style={styles.title}>My Wallets</ThemedText>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('ConnectBanks')}
        >
          <Text style={styles.primaryButtonText}>Connect to Banks</Text>
        </TouchableOpacity>

        <View style={styles.card}>
          {wallets.map((w, idx) => (
            <View key={w.id} style={[styles.row, idx === wallets.length - 1 && { borderBottomWidth: 0 }]}>
              <View style={styles.rowLeft}>
                <FontAwesome name={w.icon} size={20} color="#5d4037" style={styles.rowIcon} />
                <Text style={styles.rowText}>{w.name}</Text>
              </View>
            </View>
          ))}
          {wallets.length === 0 && (
            <Text style={{ color: '#8d6e63', padding: 16 }}>No linked wallets yet.</Text>
          )}
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
    marginBottom: 16,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#eee0d8',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0e6df',
    backgroundColor: '#fff',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowIcon: {
    width: 24,
    textAlign: 'center',
    marginRight: 12,
  },
  rowText: {
    fontSize: 16,
    color: '#5d4037',
    fontWeight: '600',
  },
});
