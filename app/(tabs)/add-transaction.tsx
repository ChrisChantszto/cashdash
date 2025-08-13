import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useUser } from '../UserContext';
import { Alert } from 'react-native';

// Resolve API base for Expo Go / simulator
const getApiUrl = () => {
  const envUrl = process.env?.EXPO_PUBLIC_API_URL;
  if (envUrl) {
    let url = envUrl.replace(/\/$/, '');
    if (!url.startsWith('http')) {
      url = `http://${url}`;
    }
    return url;
  }

  // For local development with Expo Go
  if (__DEV__) {
    // On Android emulator, 10.0.2.2 points to host's localhost
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:5001';
    }
    // On iOS simulator, localhost works
    return 'http://localhost:5001';
  }

  // Default fallback for production
  return 'https://your-production-api.com';
};

const API_URL = `${getApiUrl()}/api`;
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

const categories = [
  { id: 'food', name: 'Food', icon: 'restaurant' },
  { id: 'shopping', name: 'Shopping', icon: 'shopping-bag' },
  { id: 'transport', name: 'Transport', icon: 'directions-car' },
  { id: 'entertainment', name: 'Entertainment', icon: 'movie' },
  { id: 'bills', name: 'Bills', icon: 'receipt' },
  { id: 'other', name: 'Other', icon: 'more-horiz' },
];

export default function AddTransactionScreen() {
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [note, setNote] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [transactionDate, setTransactionDate] = useState(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useUser();

  // Parse date from params if provided (from calendar selection)
  useEffect(() => {
    if (params.selectedDate) {
      // Parse the date string from params (format: YYYY-MM-DD)
      const [year, month, day] = (params.selectedDate as string).split('-').map(Number);
      const selectedDate = new Date(year, month - 1, day);
      setTransactionDate(selectedDate);
    }
  }, [params.selectedDate]);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setTransactionDate(selectedDate);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleAddTransaction = async () => {
    console.log('handleAddTransaction called');
    
    if (!user) {
      console.error('No user found in context');
      return Alert.alert('Error', 'User not found');
    }
    
    if (!amount || !selectedCategory) {
      console.error('Missing required fields', { amount, selectedCategory });
      return Alert.alert('Error', 'Please enter an amount and select a category');
    }

    const transactionData = {
      userId: user._id,
      amount: parseFloat(amount),
      category: selectedCategory,
      description: note,
      date: transactionDate.toISOString().split('T')[0] // YYYY-MM-DD format
    };

    console.log('Sending transaction data:', transactionData);
    console.log('API URL:', `${API_URL}/transactions`);

    setIsSubmitting(true);
    
    try {
      const response = await fetch(`${API_URL}/transactions`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(transactionData)
      });
      
      console.log('Response status:', response.status);
      
      let data;
      try {
        data = await response.json();
        console.log('Response data:', data);
      } catch (jsonError) {
        console.error('Error parsing JSON response:', jsonError);
        throw new Error('Invalid response from server');
      }
      
      if (response.ok) {
        console.log('Transaction added successfully');
        Alert.alert('Success', 'Transaction added successfully');
        router.back();
      } else {
        console.error('Server returned error:', data);
        throw new Error(data.error || `Server error: ${response.status}`);
      }
    } catch (error: unknown) {
      console.error('Error in handleAddTransaction:', error);
      const errorMessage = error instanceof Error ? error.message : 'Please check your connection and try again.';
      Alert.alert(
        'Error', 
        `Failed to add transaction: ${errorMessage}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
          <MaterialIcons name="close" size={24} color="#666" />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.headerTitle}>Add Transaction</ThemedText>
        <View style={styles.cancelButton} />
      </View>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollView}>
          {/* Date Picker Section */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Transaction Date</ThemedText>
            <TouchableOpacity 
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <MaterialIcons name="calendar-today" size={20} color="#666" />
              <Text style={styles.dateText}>{formatDate(transactionDate)}</Text>
              <MaterialIcons name="keyboard-arrow-down" size={24} color="#666" />
            </TouchableOpacity>
            
            {showDatePicker && (
              <DateTimePicker
                value={transactionDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
                style={styles.datePicker}
                themeVariant="light"
              />
            )}
          </View>

          {/* Amount Input */}
          <View style={styles.amountContainer}>
            <Text style={styles.currency}>$</Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              placeholderTextColor="#666"
              keyboardType="decimal-pad"
              autoFocus
            />
          </View>

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Category</ThemedText>
            <View style={styles.categoriesContainer}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryButton,
                    selectedCategory === category.id && styles.categoryButtonSelected,
                  ]}
                  onPress={() => setSelectedCategory(category.id)}
                >
                  <MaterialIcons
                    name={category.icon as any}
                    size={24}
                    color={selectedCategory === category.id ? '#fff' : '#666'}
                  />
                  <Text style={[
                    styles.categoryText,
                    selectedCategory === category.id && styles.categoryTextSelected,
                  ]}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Note (Optional)</ThemedText>
            <TextInput
              style={styles.noteInput}
              value={note}
              onChangeText={setNote}
              placeholder="Add a note..."
              placeholderTextColor="#999"
              multiline
            />
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton, styles.buttonSecondary]}
              onPress={handleCancel}
              disabled={isSubmitting}
            >
              <Text style={styles.buttonSecondaryText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.button,
                styles.addButton,
                (!amount || !selectedCategory || isSubmitting) && styles.addButtonDisabled
              ]}
              onPress={handleAddTransaction}
              disabled={!amount || !selectedCategory || isSubmitting}
            >
              <Text style={styles.addButtonText}>
                {isSubmitting ? 'Adding...' : 'Add'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  cancelButton: {
    padding: 8,
  },
  container: {
    flex: 1,
    paddingTop: 0,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  dateText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  datePicker: {
    marginTop: 10,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  currency: {
    fontSize: 40,
    color: '#666',
    marginRight: 5,
    marginTop: 10,
  },
  amountInput: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#333',
    minWidth: 150,
    textAlign: 'center',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryButton: {
    width: '30%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    marginBottom: 15,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
  },
  categoryButtonSelected: {
    backgroundColor: '#a67c52',
  },
  categoryText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  categoryTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  noteInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 15,
    minHeight: 100,
    textAlignVertical: 'top',
    fontSize: 16,
    color: '#333',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 10,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    backgroundColor: '#a67c52',
  },
  buttonSecondary: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  buttonSecondaryText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  addButtonDisabled: {
    backgroundColor: '#d7ccc8',
    opacity: 0.7,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
