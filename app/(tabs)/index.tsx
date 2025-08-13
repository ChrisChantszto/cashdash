import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useUser } from '../UserContext';
import { useLocalSearchParams, useRouter } from 'expo-router';

const API_URL = 'http://192.168.0.178:5001/api';

interface Transaction {
  _id: string;
  userId: string;
  amount: number;
  date: string;
  category: string;
  description?: string;
}

// Configure calendar locale
LocaleConfig.locales['en'] = {
  monthNames: [
    'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
    'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
  ],
  monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  dayNamesShort: ['S', 'M', 'T', 'W', 'T', 'F', 'S']
};
LocaleConfig.defaultLocale = 'en';

export default function CalendarScreen() {
  const { user } = useUser();
  // Using today's date as the default for new transactions
  const [selected] = useState<string>(new Date().toISOString().split('T')[0]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  // Removed state for transaction input form

  useEffect(() => {
    if (user) {
      fetch(`${API_URL}/transactions`)
        .then(res => res.json())
        .then((data: Transaction[]) => setTransactions(data.filter((t: Transaction) => t.userId === user._id)))
        .catch(() => setTransactions([]));
    }
  }, [user]);

  // Transaction addition is now handled through the dedicated add-transaction screen

  const expensesForDay = transactions.filter((t: Transaction) => t.date && t.date.startsWith(selected));

  const params = useLocalSearchParams<{ selectedDate?: string }>();
  const router = useRouter();
  
  // No need to update URL params since we're not changing dates

  return (
    <ThemedView style={styles.container}>
      <Calendar
        // Disable day press handler to prevent date selection
        onDayPress={undefined}
        // Remove the ability to select dates by not marking any as selected
        markedDates={transactions.reduce((acc, t) => ({
          ...acc,
          [t.date]: {
            marked: true,
            dotColor: '#a67c52',
          },
        }), {})}
        theme={{
          // Background colors
          backgroundColor: '#e9e2d7',
          calendarBackground: '#e9e2d7',
          
          // Header styling
          textSectionTitleColor: '#5d4037',
          textSectionTitleDisabledColor: '#d7ccc8',
          
          // Month styling
          monthTextColor: '#5d4037',
          textMonthFontWeight: '500',
          textMonthFontSize: 18,
          
          // Day header styling (S M T W T F S)
          textDayHeaderFontWeight: '400',
          textDayHeaderFontSize: 14,
          
          // Day number styling
          dayTextColor: '#5d4037',
          textDayFontWeight: '400',
          textDayFontSize: 16,
          
          // Today styling
          todayTextColor: '#a67c52',
          todayBackgroundColor: 'transparent',
          
          // Selected day styling
          selectedDayBackgroundColor: 'transparent',
          selectedDayTextColor: '#a67c52',
          // Custom styling will be handled in day component
          selectedDotColor: '#a67c52',
          
          // Disabled day styling
          textDisabledColor: '#d7ccc8',
          
          // Dot styling for marked dates
          dotColor: '#a67c52',
          dotStyle: { marginTop: 1 },
          
          // Arrow styling
          arrowColor: '#a67c52',
          arrowStyle: { padding: 0 },
          
          // Other styling
          textDayStyle: { marginTop: 4, marginBottom: 4 },
        }}
        style={styles.calendar}
        // Custom rendering to achieve the minimalist design
        customHeaderTitle={(date: any) => {
          return (
            <View style={styles.headerTitleContainer}>
              <Text style={styles.monthTitle}>{date.toString('MMMM')}</Text>
            </View>
          );
        }}
        renderHeader={(date: Date) => {
          return (
            <View style={styles.headerContainer}>
              <Text style={styles.monthTitle}>
                {LocaleConfig.locales['en'].monthNames[date.getMonth()]}
              </Text>
            </View>
          );
        }}
      />
      {/* Transaction input form has been removed - use the + button in the bottom tab bar */}
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
    backgroundColor: '#e9e2d7', // Beige background like in the image
    padding: 16,
  },
  title: {
    textAlign: 'center',
    color: '#5d4037',
    marginBottom: 8,
  },
  calendar: {
    marginBottom: 16,
    borderRadius: 0, // No rounded corners for minimalist look
    overflow: 'hidden',
    backgroundColor: '#e9e2d7', // Match container background
    borderBottomWidth: 1,
    borderBottomColor: '#d7ccc8',
  },
  headerContainer: {
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthTitle: {
    fontSize: 24,
    fontWeight: '400',
    color: '#5d4037',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  dayHeader: {
    fontSize: 12,
    color: '#8d6e63',
    textAlign: 'center',
    fontWeight: '400',
    paddingVertical: 5,
  },
  dayCell: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  dayText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#5d4037',
  },
  todayText: {
    color: '#a67c52',
    fontWeight: '500',
  },
  selectedDayText: {
    color: '#a67c52',
    fontWeight: '500',
  },
  disabledDayText: {
    color: '#d7ccc8',
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
