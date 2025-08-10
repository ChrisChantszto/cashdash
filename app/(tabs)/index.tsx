
import { ThemedView } from '@/components/ThemedView';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useUser } from '../UserContext';

function HomeNavButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.homeButton} onPress={onPress}>
      <Text style={styles.homeButtonText}>{label}</Text>
    </TouchableOpacity>
  );
}


const API_URL = 'http://192.168.0.178:5001/api';

const QUOTES = [
  "Success is not the key to happiness. Happiness is the key to success.",
  "The best way to get started is to quit talking and begin doing.",
  "Don’t let yesterday take up too much of today.",
  "It’s not whether you get knocked down, it’s whether you get up.",
  "If you are working on something exciting, it will keep you motivated.",
  "The harder you work for something, the greater you’ll feel when you achieve it.",
  "Dream bigger. Do bigger.",
  "Don’t watch the clock; do what it does. Keep going.",
  "Great things never come from comfort zones.",
  "Push yourself, because no one else is going to do it for you."
];


interface Transaction {
  _id: string;
  userId: string;
  amount: number;
  date: string;
  category: string;
  description?: string;
}

export default function HomeScreen() {
  const { user, setUser } = useUser();

  const [quote, setQuote] = useState('');
  const [time, setTime] = useState('');

  useEffect(() => {
    const dayIdx = new Date().getDate() % QUOTES.length;
    setQuote(QUOTES[dayIdx]);
  }, []);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    update();
    const interval = setInterval(update, 1000 * 15);
    return () => clearInterval(interval);
  }, []);



  if (!user) {
    // Should never happen, but fallback
    return <View style={{ flex: 1, backgroundColor: '#f8f4e9' }} />;
  }



  const router = useRouter();
  return (
    <ThemedView style={styles.container}>

      <View style={styles.centerContainer}>
        <Text style={styles.momentumTime}>{time}</Text>
        <Text style={styles.momentumQuote}>{quote}</Text>
        <View style={styles.buttonRow}>
          <HomeNavButton label="Expenses" onPress={() => router.push('/(tabs)/calendar')} />
          <HomeNavButton label="Net Worth" onPress={() => router.push('/(tabs)/networth')} />
          <HomeNavButton label="Budget" onPress={() => router.push('/(tabs)/budget')} />
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={() => setUser(null)}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f4e9',
    paddingTop: 20,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 24,
    gap: 12,
  },
  homeButton: {
    backgroundColor: '#a1887f',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginHorizontal: 6,
    minWidth: 90,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  homeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  momentumTime: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#5d4037',
    marginBottom: 8,
    textAlign: 'center',
  },
  momentumQuote: {
    fontSize: 18,
    color: '#8d6e63',
    textAlign: 'center',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  logoutButton: {
    alignSelf: 'center',
    backgroundColor: '#a1887f',
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 20,
    marginTop: 8,
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  welcomeText: {
    marginBottom: 8,
    marginTop: 0,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d7ccc8',
    padding: 10,
    marginBottom: 8,
    fontSize: 16,
    color: '#5d4037',
  },
  addButton: {
    backgroundColor: '#a1887f',
    borderRadius: 20,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  transactionItem: {
    marginVertical: 8,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d7ccc8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
});

