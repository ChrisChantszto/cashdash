import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useUser } from '../../UserContext';

export default function AccountScreen() {
  const { user } = useUser();
  // Placeholder user info; replace with actual user info as available
  const info = {
    icon: 'https://ui-avatars.com/api/?name=' + (user?.name || 'User'),
    username: user?.name || 'Username',
    email: user?.email || 'Email',
    birthdate: '1990-01-01',
    gender: 'Prefer not to say',
  };
  return (
    <ThemedView style={styles.container}>
      <View style={styles.profileContainer}>
        <Image source={{ uri: info.icon }} style={styles.avatar} />
        <ThemedText type="title" style={styles.username}>{info.username}</ThemedText>
        <Text style={styles.email}>{info.email}</Text>
      </View>
      <View style={styles.infoSection}>
        <Text style={styles.label}>Birthdate</Text>
        <Text style={styles.value}>{info.birthdate}</Text>
        <Text style={styles.label}>Gender</Text>
        <Text style={styles.value}>{info.gender}</Text>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f4e9',
    padding: 24,
  },
  profileContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#d7ccc8',
    marginBottom: 16,
  },
  username: {
    fontSize: 24,
    color: '#5d4037',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#8d6e63',
    marginBottom: 16,
  },
  infoSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#d7ccc8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  label: {
    fontSize: 14,
    color: '#a1887f',
    marginTop: 8,
  },
  value: {
    fontSize: 16,
    color: '#5d4037',
    marginBottom: 8,
  },
});
