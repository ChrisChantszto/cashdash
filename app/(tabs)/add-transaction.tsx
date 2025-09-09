import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { getCurrencyLabel, getDisplayCurrencyList } from '@/constants/currencies';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useUser } from '../UserContext';
import getApiUrl from '../utils/api';

const API_URL = getApiUrl();
// Debug: log resolved API base in dev
if (__DEV__) {
  // eslint-disable-next-line no-console
  console.log('[AddTxn] API_URL =', API_URL);
}

// Offline fallback user id (valid ObjectId format)
const OFFLINE_USER_ID = '000000000000000000000000';

// Helper: fetch with timeout to avoid silent hangs
const fetchWithTimeout = async (
  input: RequestInfo | URL,
  init: RequestInit & { timeoutMs?: number } = {}
) => {
  const { timeoutMs = 10000, ...rest } = init as any;
  const controller = new AbortController();
  const to = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...(rest as any), signal: controller.signal });
  } finally {
    clearTimeout(to);
  }
};

const DEFAULT_CATEGORIES = [
  { id: 'food', name: 'Food', icon: 'restaurant' },
  { id: 'shopping', name: 'Shopping', icon: 'shopping-bag' },
  { id: 'transport', name: 'Transport', icon: 'directions-car' },
  { id: 'entertainment', name: 'Entertainment', icon: 'movie' },
  { id: 'bills', name: 'Bills', icon: 'receipt' },
  { id: 'other', name: 'Other', icon: 'more-horiz' },
] as const;

const ALL_CURRENCIES = getDisplayCurrencyList();

export default function AddTransactionScreen(props: any) {
  const forwardedParams = props?.forwardedParams;
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [note, setNote] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [transactionDate, setTransactionDate] = useState(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Array<{ id: string; name: string; icon: any }>>(
    [...DEFAULT_CATEGORIES]
  );
  const [currency, setCurrency] = useState<string>('HKD');
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [quickCurrencies, setQuickCurrencies] = useState<string[]>(['HKD', 'RMB']);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrence, setRecurrence] = useState<
    null | 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly' | 'custom'
  >(null);
  const getCurrencySymbol = (code: string) => {
    switch (code) {
      case 'HKD': return 'HK$';
      case 'USD': return '$';
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'RMB':
      case 'CNY': return '¥';
      case 'JPY': return '¥';
      case 'AUD': return 'A$';
      case 'SGD': return 'S$';
      case 'TWD': return 'NT$';
      case 'KRW': return '₩';
      case 'CAD': return 'C$';
      case 'MYR': return 'RM';
      case 'INR': return '₹';
      default: return code;
    }
  };
  const currencySymbol = getCurrencySymbol(currency);
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { user, setUser } = useUser();

  const setMRUCurrency = useCallback((code: string) => {
    setQuickCurrencies((prev) => {
      const unique = prev.filter((c) => c !== code);
      unique.unshift(code);
      const defaults = ['HKD', 'RMB'];
      for (const d of defaults) if (!unique.includes(d)) unique.push(d);
      return unique.slice(0, 2);
    });
  }, []);

  // Ensure a user exists (works without login)
  const ensureDemoUser = useCallback(async () => {
    if (user) return user;
    try {
      const email = 'demo@cashdash.app';
      // eslint-disable-next-line no-console
      console.log('[AddTxn] ensureDemoUser GET', `${API_URL}/users/email/${encodeURIComponent(email)}`);
      const res = await fetchWithTimeout(`${API_URL}/users/email/${encodeURIComponent(email)}`, { timeoutMs: 8000 });
      // eslint-disable-next-line no-console
      console.log('[AddTxn] ensureDemoUser GET status', res.status);
      if (res.ok) {
        const u = await res.json();
        setUser(u);
        return u;
      }
      // eslint-disable-next-line no-console
      console.log('[AddTxn] ensureDemoUser POST', `${API_URL}/users`);
      const createRes = await fetchWithTimeout(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ name: 'Demo User', email }),
        timeoutMs: 8000,
      });
      // eslint-disable-next-line no-console
      console.log('[AddTxn] ensureDemoUser POST status', createRes.status);
      if (createRes.ok) {
        const u = await createRes.json();
        setUser(u);
        return u;
      }
      // If server returns 400 with an existing user object, use it
      const text = await createRes.text().catch(() => '');
      let data: any = {};
      try { data = JSON.parse(text); } catch {}
      if (createRes.status === 400 && data && data.user) {
        setUser(data.user);
        return data.user;
      }
      console.warn('[AddTxn] ensureDemoUser POST failed body:', text);
    } catch (e) {
      console.warn('Failed to ensure demo user', e);
    }
    return null;
  }, [API_URL, user, setUser]);

  // Parse date from params if provided (from calendar selection)
  useEffect(() => {
    const p = (forwardedParams ?? route.params ?? {}) as any;
    if (p.selectedDate) {
      // Parse the date string from params (format: YYYY-MM-DD)
      const [year, month, day] = String(p.selectedDate).split('-').map(Number);
      const selectedDate = new Date(year, month - 1, day);
      setTransactionDate(selectedDate);
    }
    if (p.selectedCategory) {
      setSelectedCategory(String(p.selectedCategory));
    }
    // Handle recurrence details returned from RecurringDetails screen
    if (p.recurrence) {
      const r = String(p.recurrence) as any;
      const valid = ['never', 'daily', 'weekly', 'biweekly', 'monthly', 'yearly', 'custom'] as const;
      if (valid.includes(r)) {
        if (r === 'never') {
          setIsRecurring(false);
          setRecurrence(null);
        } else {
          setIsRecurring(true);
          setRecurrence(r);
        }
      }
    }
    // If user created a custom category of expense type, merge it into the grid (before 'Other')
    if (
      p.selectedCategory && p.selectedCategoryName && p.selectedCategoryIcon &&
      (!p.selectedCategoryType || p.selectedCategoryType === 'expense')
    ) {
      const newCat = {
        id: String(p.selectedCategory),
        name: String(p.selectedCategoryName),
        icon: String(p.selectedCategoryIcon),
      };
      setCategories((prev) => {
        const exists = prev.some((c) => c.id === newCat.id);
        const other = prev.find((c) => c.id === 'other');
        const withoutOther = prev.filter((c) => c.id !== 'other');
        if (exists) {
          const updated = withoutOther.map((c) => (c.id === newCat.id ? newCat : c));
          return other ? [...updated, other] : updated;
        }
        return other ? [...withoutOther, newCat, other] : [...withoutOther, newCat];
      });
    }
  }, [forwardedParams, route.params]);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setTransactionDate(selectedDate);
    }
  };

  const toLocalYMD = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
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
    // eslint-disable-next-line no-console
    console.log('[AddTxn] handleAddTransaction called');
    
    // Ensure we have a user (works without login)
    let effectiveUser = user ?? (await ensureDemoUser());
    const isOffline = !effectiveUser;
    if (!effectiveUser) {
      // Proceed in offline/dev mode without blocking
      // eslint-disable-next-line no-console
      console.warn('[AddTxn] Offline mode: proceeding without server user');
      effectiveUser = { _id: OFFLINE_USER_ID } as any;
    }

    // Validate fields
    const sanitized = String(amount).replace(/[^0-9.]/g, '');
    const parsedAmount = parseFloat(sanitized);
    if (!sanitized || Number.isNaN(parsedAmount) || !selectedCategory) {
      console.error('Missing required fields', { amount, selectedCategory });
      return Alert.alert('Error', 'Please enter an amount and select a category');
    }

    const transactionData = {
      userId: effectiveUser._id,
      amount: parsedAmount,
      category: selectedCategory,
      description: note,
      date: toLocalYMD(transactionDate), // YYYY-MM-DD local date to match calendar
      currency,
      recurring: isRecurring,
      recurrence: isRecurring ? recurrence : undefined,
    };

    // eslint-disable-next-line no-console
    console.log('[AddTxn] POST', `${API_URL}/transactions`, transactionData);

    setIsSubmitting(true);
    
    try {
      const response = await fetchWithTimeout(`${API_URL}/transactions`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(transactionData),
        timeoutMs: 10000,
      });
      // eslint-disable-next-line no-console
      console.log('[AddTxn] POST status', response.status);

      if (response.ok) {
        Alert.alert('Success', 'Transaction added successfully');
        navigation.goBack();
      } else {
        const text = await response.text().catch(() => '');
        // eslint-disable-next-line no-console
        console.log('[AddTxn] POST non-200 body', text);
        let data: any = {};
        try { data = JSON.parse(text); } catch {}
        throw new Error(data?.error || data?.details || text || `Server error: ${response.status}`);
      }
    } catch (error: any) {
      console.error('[AddTxn] POST error', { message: error?.message, name: error?.name, API_URL });
      if (isOffline) {
        Alert.alert('Success', 'Transaction added (offline)');
        navigation.goBack();
      } else {
        const errorMessage = error?.message || 'Please check your connection and try again.';
        Alert.alert('Error', `Failed to add transaction: ${errorMessage}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
          <MaterialIcons name="close" size={24} color="#666" />
        </TouchableOpacity>
        <View style={styles.headerSwitchContainer}>
          <TouchableOpacity style={[styles.headerSwitchBtn, styles.headerSwitchBtnActive]}>
            <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.headerSwitchText, styles.headerSwitchTextActive]}>Add Transaction</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerSwitchBtn}
            onPress={() => navigation.navigate('AddSwitcher' as never, { activeTab: 'income' } as never)}
          >
            <Text numberOfLines={1} ellipsizeMode="tail" style={styles.headerSwitchText}>Add Income</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.cancelButton} />
      </View>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollView}>
          {/* Date */}
          <View style={[styles.section, styles.sectionFirst, styles.sectionTightBottom]}>
            <ThemedText style={styles.sectionTitle}>Date</ThemedText>
            <TouchableOpacity 
              style={styles.dateButton}
              onPress={() => setShowDatePicker((prev) => !prev)}
            >
              <MaterialIcons name="calendar-today" size={20} color="#8d6e63" />
              <Text style={styles.dateText}>{formatDate(transactionDate)}</Text>
              <MaterialIcons name="keyboard-arrow-down" size={24} color="#8d6e63" />
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
            <Text style={styles.currency}>{currencySymbol}</Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              placeholderTextColor="#666"
              keyboardType="decimal-pad"
              autoFocus
            />
            <Text style={styles.currencyCode}>{currency}</Text>
          </View>

          {/* Currency Selector */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Currency</ThemedText>
            <View style={styles.currencyContainer}>
              {[...quickCurrencies, 'Other'].map((c, idx) => (
                <TouchableOpacity
                  key={`${c}-${idx}`}
                  style={[
                    styles.currencyButton,
                    c !== 'Other' && currency === c && styles.currencyButtonSelected,
                  ]}
                  onPress={() => {
                    if (c === 'Other') return setShowCurrencyPicker(true);
                    setCurrency(c);
                    setMRUCurrency(c);
                  }}
                >
                  <Text style={[
                    styles.currencyButtonText,
                    c !== 'Other' && currency === c && styles.currencyButtonTextSelected,
                  ]}>
                    {c === 'Other' ? 'Other' : getCurrencyLabel(c)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
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
                  onPress={() => {
                    if (category.id === 'other') {
                      navigation.navigate('CategoryPicker', { categories, activeTab: 'expense' });
                    } else {
                      setSelectedCategory(category.id);
                    }
                  }}
                >
                  <MaterialIcons
                    name={category.icon as any}
                    size={24}
                    color={selectedCategory === category.id ? '#fff' : '#8d6e63'}
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

          {/* Recurring Toggle */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Recurring</ThemedText>
            <View style={styles.recurringRow}>
              <Text style={styles.recurringLabel}>
                {(() => {
                  if (!isRecurring) return 'No';
                  const map: Record<string, string> = {
                    daily: 'Every day',
                    weekly: 'Every week',
                    biweekly: 'Every 2 weeks',
                    monthly: 'Every month',
                    yearly: 'Every year',
                    custom: 'Custom',
                  };
                  const suffix = recurrence ? map[String(recurrence)] || '' : '';
                  return `Yes${suffix ? ' — ' + suffix : ''}`;
                })()}
              </Text>
              <Switch
                value={isRecurring}
                onValueChange={(val) => {
                  setIsRecurring(val);
                  if (val) {
                    // Open details screen to select frequency
                    navigation.navigate('RecurringDetails' as never, { initial: recurrence ?? 'weekly' } as never);
                  } else {
                    setRecurrence(null);
                  }
                }}
                trackColor={{ false: '#d7ccc8', true: '#8d6e63' }}
                thumbColor={Platform.OS === 'android' ? (isRecurring ? '#5d4037' : '#f4f3f4') : undefined}
              />
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
      {/* Currency Picker Modal */}
      <Modal
        visible={showCurrencyPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCurrencyPicker(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowCurrencyPicker(false)} style={styles.modalHeaderSide}>
                <MaterialIcons name="close" size={20} color="#5d4037" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Select currency</Text>
              <View style={styles.modalHeaderSide} />
            </View>
            <ScrollView style={styles.currencyList}>
              {ALL_CURRENCIES.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={styles.currencyListItem}
                  onPress={() => {
                    setCurrency(c);
                    setMRUCurrency(c);
                    setShowCurrencyPicker(false);
                  }}
                >
                  <Text style={styles.currencyListItemText}>
                    {getCurrencyLabel(c)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    borderBottomColor: '#e6d3b3',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#5d4037',
  },
  headerSwitchContainer: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    borderRadius: 0,
    padding: 0,
    borderWidth: 0,
    borderColor: 'transparent',
    flex: 1,
    marginHorizontal: 8,
  },
  headerSwitchBtn: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderRadius: 0,
  },
  headerSwitchBtnActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#a47148',
  },
  headerSwitchText: { color: '#5d4037', fontWeight: '700', fontSize: 13 },
  headerSwitchTextActive: { color: '#a47148' },
  cancelButton: {
    padding: 8,
  },
  container: {
    flex: 1,
    paddingTop: 0,
    backgroundColor: '#f8f4e9',
    paddingHorizontal: 16,
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
    backgroundColor: '#fff9f4',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  dateText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#5d4037',
    flex: 1,
  },
  datePicker: {
    marginTop: 10,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  currency: {
    fontSize: 32,
    color: '#8d6e63',
    marginRight: 5,
    marginTop: 10,
  },
  amountInput: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#5d4037',
    minWidth: 120,
    textAlign: 'center',
  },
  currencyCode: {
    fontSize: 16,
    color: '#5d4037',
    marginLeft: 8,
    marginTop: 12,
    fontWeight: '600',
  },
  section: {
    marginBottom: 30,
  },
  sectionFirst: {
    marginTop: 16,
  },
  sectionTightBottom: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#5d4037',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  currencyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  currencyButton: {
    width: '32%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginBottom: 12,
    borderRadius: 10,
    backgroundColor: '#fff9f4',
    borderWidth: 1,
    borderColor: '#e6d3b3',
  },
  currencyButtonSelected: {
    backgroundColor: '#8d6e63',
    borderColor: '#8d6e63',
  },
  currencyButtonText: {
    fontSize: 14,
    color: '#5d4037',
    fontWeight: '600',
  },
  currencyButtonTextSelected: {
    color: '#fff',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#fff9f4',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e6d3b3',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  modalHeaderSide: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#5d4037',
    marginBottom: 12,
  },
  currencyList: {
    maxHeight: 260,
    marginBottom: 0,
  },
  currencyListItem: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e6d3b3',
  },
  currencyListItemText: {
    fontSize: 16,
    color: '#5d4037',
  },
  modalCloseBtn: {
    marginTop: 4,
  },
  recurringRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff9f4',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e6d3b3',
  },
  recurringLabel: {
    fontSize: 16,
    color: '#5d4037',
    fontWeight: '600',
  },
  categoryButton: {
    width: '48%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginBottom: 12,
    borderRadius: 10,
    backgroundColor: '#fff9f4',
  },
  categoryButtonSelected: {
    backgroundColor: '#8d6e63',
  },
  categoryText: {
    marginTop: 8,
    fontSize: 14,
    color: '#5d4037',
  },
  categoryTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  noteInput: {
    backgroundColor: '#fff9f4',
    borderRadius: 10,
    padding: 12,
    minHeight: 90,
    textAlignVertical: 'top',
    fontSize: 16,
    color: '#5d4037',
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
    backgroundColor: '#8d6e63',
  },
  buttonSecondary: {
    backgroundColor: '#fff9f4',
    borderWidth: 1,
    borderColor: '#d7ccc8',
  },
  buttonSecondaryText: {
    color: '#8d6e63',
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
