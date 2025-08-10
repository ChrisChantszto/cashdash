import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useUser } from '../UserContext';

const API_URL = 'http://192.168.0.178:5001/api';

interface Transaction {
  _id: string;
  userId: string;
  amount: number;
  date: string;
  category: string;
  description?: string;
}

export default function CalendarScreen() {
  const { user } = useUser();
  const [selected, setSelected] = useState<string>('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (user) {
      fetch(`${API_URL}/transactions`)
        .then(res => res.json())
        .then((data: Transaction[]) => setTransactions(data.filter((t: Transaction) => t.userId === user._id)))
        .catch(() => setTransactions([]));
    }
  }, [user]);

  const handleAddTransaction = () => {
    if (!user) return Alert.alert('User not found');
    if (!amount || !category || !selected) return Alert.alert('Amount, category, and date required');
    fetch(`${API_URL}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user._id,
        amount: parseFloat(amount),
        date: selected,
        category,
        description,
      }),
    })
      .then(res => res.json())
      .then((data: Transaction) => {
        if (data._id) {
          setTransactions(prev => [...prev, data]);
          setAmount('');
          setCategory('');
          setDescription('');
          Alert.alert('Transaction added!');
        } else {
          Alert.alert('Failed to add transaction', (data as any).error || 'Unknown error');
        }
      });
  };

  const expensesForDay = transactions.filter((t: Transaction) => t.date && t.date.startsWith(selected));

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>Calendar</ThemedText>
      <Calendar
        onDayPress={day => setSelected(day.dateString)}
        markedDates={selected ? { [selected]: { selected: true, selectedColor: '#a1887f' } } : {}}
        style={styles.calendar}
        theme={{
          selectedDayBackgroundColor: '#a1887f',
          todayTextColor: '#8d6e63',
          arrowColor: '#a1887f',
        }}
      />
      {selected ? (
        <View style={styles.addSection}>
          <ThemedText type="subtitle">Add Expense for {selected}</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="Amount"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            placeholderTextColor="#a67c52"
          />
          <TextInput
            style={styles.input}
            placeholder="Category"
            value={category}
            onChangeText={setCategory}
            placeholderTextColor="#a67c52"
          />
          <TextInput
            style={styles.input}
            placeholder="Description (optional)"
            value={description}
            onChangeText={setDescription}
            placeholderTextColor="#a67c52"
          />
          <TouchableOpacity style={styles.addButton} onPress={handleAddTransaction}>
            <Text style={styles.addButtonText}>Add Expense</Text>
          </TouchableOpacity>
        </View>
      ) : null}
      <ThemedText type="subtitle" style={{ marginTop: 24 }}>Expenses for {selected || '...'}</ThemedText>
      <FlatList
        data={expensesForDay}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <View style={styles.transactionItem}>
            <Text>{item.category}: ${item.amount}</Text>
            {item.description ? <Text>{item.description}</Text> : null}
          </View>
        )}
        ListEmptyComponent={<Text>No expenses for this day.</Text>}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f4e9',
    padding: 16,
  },
  title: {
    textAlign: 'center',
    color: '#5d4037',
    marginBottom: 8,
  },
  calendar: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  addSection: {
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#d7ccc8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d7ccc8',
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: '#fff9f4',
    color: '#5d4037',
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#a1887f',
    borderRadius: 20,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  transactionItem: {
    marginVertical: 8,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d7ccc8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
});
