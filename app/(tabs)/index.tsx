
import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, FlatList, Text, Alert, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

const API_URL = 'http://localhost:5000/api';

interface User {
  _id: string;
  name: string;
  email: string;
}

interface Transaction {
  _id: string;
  userId: User | string;
  amount: number;
  date: string;
  category: string;
  description?: string;
}

export default function HomeScreen() {
  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [signInEmail, setSignInEmail] = useState<string>('');
  // Transaction state
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Fetch transactions
  useEffect(() => {
    if (user) {
      fetch(`${API_URL}/transactions`)
        .then(res => res.json())
        .then((data: Transaction[]) => setTransactions(data.filter(t => typeof t.userId === 'object' && (t.userId as User)._id === user._id)))
        .catch(() => setTransactions([]));
    }
  }, [user]);

  // Sign up
  const handleSignUp = () => {
    fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email }),
    })
      .then(res => res.json())
      .then(data => {
        if (data._id) {
          setUser(data);
          Alert.alert('Sign up successful!');
        } else {
          Alert.alert('Sign up failed', data.error || 'Unknown error');
        }
      });
  };

  // Sign in
  const handleSignIn = () => {
    fetch(`${API_URL}/users`)
      .then(res => res.json())
      .then((users: User[]) => {
        const found = users.find(u => u.email === signInEmail);
        if (found) {
          setUser(found);
          Alert.alert('Sign in successful!');
        } else {
          Alert.alert('No user found with that email');
        }
      });
  };

  // Create transaction
  const handleAddTransaction = () => {
    if (!amount || !category) return Alert.alert('Amount and category required');
    fetch(`${API_URL}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user._id,
        amount: parseFloat(amount),
        date: new Date(),
        category,
        description,
      }),
    })
      .then(res => res.json())
      .then(data => {
        if (data._id) {
          setTransactions([...transactions, { ...data, userId: user }]);
          setAmount('');
          setCategory('');
          setDescription('');
          Alert.alert('Transaction added!');
        } else {
          Alert.alert('Failed to add transaction', data.error || 'Unknown error');
        }
      });
  };

  if (!user) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="title">Sign Up</ThemedText>
        <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} />
        <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" />
        <Button title="Sign Up" onPress={handleSignUp} />
        <View style={{ height: 32 }} />
        <ThemedText type="title">Sign In</ThemedText>
        <TextInput style={styles.input} placeholder="Email" value={signInEmail} onChangeText={setSignInEmail} autoCapitalize="none" />
        <Button title="Sign In" onPress={handleSignIn} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Welcome, {user.name}!</ThemedText>
      <ThemedText>Your email: {user.email}</ThemedText>
      <View style={{ height: 32 }} />
      <ThemedText type="subtitle">Add Transaction</ThemedText>
      <TextInput style={styles.input} placeholder="Amount" value={amount} onChangeText={setAmount} keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="Category" value={category} onChangeText={setCategory} />
      <TextInput style={styles.input} placeholder="Description" value={description} onChangeText={setDescription} />
      <Button title="Add Transaction" onPress={handleAddTransaction} />
      <View style={{ height: 32 }} />
      <ThemedText type="subtitle">Your Transactions</ThemedText>
      <FlatList
        data={transactions}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <View style={styles.transactionItem}>
            <Text>{item.date ? new Date(item.date).toLocaleString() : ''}</Text>
            <Text>{item.category}: ${item.amount}</Text>
            {item.description ? <Text>{item.description}</Text> : null}
          </View>
        )}
        ListEmptyComponent={<Text>No transactions yet.</Text>}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'flex-start',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginVertical: 8,
    borderRadius: 6,
    backgroundColor: '#fff',
  },
  transactionItem: {
    marginVertical: 8,
    padding: 8,
    backgroundColor: '#e3f6fa',
    borderRadius: 6,
  },
});

