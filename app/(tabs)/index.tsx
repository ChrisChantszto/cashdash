import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, StyleSheet, FlatList, SectionList, TouchableOpacity, TextInput, Alert, Platform, Modal } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useUser } from '../UserContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import getApiUrl from '../utils/api';
import { MaterialIcons } from '@expo/vector-icons';

const API_URL = getApiUrl();

interface Transaction {
  _id: string;
  userId: string;
  amount: number;
  date: string;
  category: string;
  description?: string;
}

const CATEGORY_META: Record<string, { label: string; icon: any }> = {
  food: { label: 'Food', icon: 'restaurant' },
  shopping: { label: 'Shopping', icon: 'shopping-bag' },
  transport: { label: 'Transport', icon: 'directions-car' },
  entertainment: { label: 'Entertainment', icon: 'movie' },
  bills: { label: 'Bills', icon: 'receipt' },
  other: { label: 'Other', icon: 'more-horiz' },
};

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
  // Local YYYY-MM-DD for today (avoid UTC off-by-one)
  const makeLocalYMD = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };
  const [selected, setSelected] = useState<string>(makeLocalYMD(new Date()));
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [groupMode, setGroupMode] = useState<'recent' | 'category'>('recent');
  const [showYearPicker, setShowYearPicker] = useState(false);
  const lastActionRef = useRef<'none' | 'day' | 'nav' | 'year'>('none');
  const dayTapTargetMonthRef = useRef<{ y: number; m: number } | null>(null);
  // Removed state for transaction input form

  const fetchTransactions = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`${API_URL}/transactions`);
      const data: Transaction[] = await res.json();
      setTransactions(Array.isArray(data) ? data.filter((t) => t.userId === user._id) : []);
    } catch (e) {
      setTransactions([]);
    }
  }, [user]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  useFocusEffect(
    useCallback(() => {
      // Refetch whenever this screen gains focus (e.g., after adding a transaction)
      fetchTransactions();
      return () => {};
    }, [fetchTransactions])
  );

  // Transaction addition is now handled through the dedicated add-transaction screen

  const expensesForDay = transactions.filter((t: Transaction) => {
    if (!t.date) return false;
    const ymd = String(t.date).slice(0, 10);
    return ymd === selected;
  });

  // Derived data
  const parseLocalYMD = (s: string) => {
    const [y, m, d] = s.split('-').map((n) => parseInt(n, 10));
    return new Date(y, (m || 1) - 1, d || 1);
  };
  const recentData = [...expensesForDay].sort((a, b) => {
    const at = parseLocalYMD(String(a.date).slice(0, 10)).getTime();
    const bt = parseLocalYMD(String(b.date).slice(0, 10)).getTime();
    return bt - at; // newest first by transaction date
  });

  const categorySections = Object.entries(
    expensesForDay.reduce<Record<string, Transaction[]>>((acc, t) => {
      const key = t.category || 'other';
      (acc[key] = acc[key] || []).push(t);
      return acc;
    }, {})
  )
    .sort((a, b) => {
      const aLabel = (CATEGORY_META[a[0]]?.label || a[0]).toLowerCase();
      const bLabel = (CATEGORY_META[b[0]]?.label || b[0]).toLowerCase();
      return aLabel.localeCompare(bLabel);
    })
    .map(([cat, items]) => ({
      title: CATEGORY_META[cat]?.label || cat,
      key: cat,
      data: items,
    }));

  const totalForDay = expensesForDay.reduce((sum, t) => sum + (typeof t.amount === 'number' ? t.amount : parseFloat(String(t.amount) || '0')), 0);

  const formatAmount = (n: number) => {
    if (Number.isNaN(n)) return '0.00';
    return n.toFixed(2);
  };

  const pad2 = (n: number) => String(n).padStart(2, '0');
  const syncSelectedToMonth = (base: Date) => {
    const day = parseInt((selected?.split('-')[2] as string) || '1', 10);
    const year = base.getFullYear();
    const monthIndex = base.getMonth();
    const lastDay = new Date(year, monthIndex + 1, 0).getDate();
    const newDay = Math.min(day, lastDay);
    setSelected(`${year}-${pad2(monthIndex + 1)}-${pad2(newDay)}`);
  };

  const goPrevMonth = () => {
    lastActionRef.current = 'nav';
    setCurrentMonth((prev) => {
      const nm = new Date(prev.getFullYear(), prev.getMonth() - 1, 1);
      syncSelectedToMonth(nm);
      return nm;
    });
  };
  const goNextMonth = () => {
    lastActionRef.current = 'nav';
    setCurrentMonth((prev) => {
      const nm = new Date(prev.getFullYear(), prev.getMonth() + 1, 1);
      syncSelectedToMonth(nm);
      return nm;
    });
  };

  const currentYear = currentMonth.getFullYear();
  const years = Array.from({ length: 31 }, (_, i) => currentYear - 20 + i);

  const handleDayPress = (d: { dateString: string; year: number; month: number; day: number }) => {
    lastActionRef.current = 'day';
    setSelected(d.dateString);
    const nm = new Date(d.year, d.month - 1, 1);
    if (nm.getFullYear() !== currentMonth.getFullYear() || nm.getMonth() !== currentMonth.getMonth()) {
      dayTapTargetMonthRef.current = { y: d.year, m: d.month };
      setCurrentMonth(nm);
    }
    // Keep lastActionRef as 'day' until visible month reflects the tap
  };

  const params = useLocalSearchParams<{ selectedDate?: string }>();
  const router = useRouter();
  
  // No need to update URL params since we're not changing dates

  return (
    <ThemedView style={styles.container}>
      {/* Custom header with month nav and year picker */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={goPrevMonth} style={styles.navButton} accessibilityLabel="Previous month">
          <MaterialIcons name="chevron-left" size={24} color="#5d4037" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerTitleContainer} onPress={() => setShowYearPicker(true)} accessibilityLabel="Pick year">
          <Text style={styles.monthTitle}>
            {LocaleConfig.locales['en'].monthNames[currentMonth.getMonth()]}
          </Text>
          <Text style={styles.yearLabel}>{currentMonth.getFullYear()}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={goNextMonth} style={styles.navButton} accessibilityLabel="Next month">
          <MaterialIcons name="chevron-right" size={24} color="#5d4037" />
        </TouchableOpacity>
      </View>
      <View style={styles.weekdayRow}>
        {LocaleConfig.locales['en'].dayNamesShort.map((d: string, i: number) => (
          <Text key={`${i}-${d}`} style={styles.dayHeader}>{d.toUpperCase()}</Text>
        ))}
      </View>
      <View style={styles.headerDivider} />

      <Calendar
        onDayPress={handleDayPress}
        hideArrows
        hideDayNames
        renderHeader={() => null}
        enableSwipeMonths
        onVisibleMonthsChange={(months) => {
          if (months && months.length) {
            const last = months[months.length - 1];
            const nm = new Date(last.year, last.month - 1, 1);
            setCurrentMonth(nm);
            // If this visible change was triggered by tapping an out-of-month day,
            // do NOT override the explicitly chosen selected date.
            if (
              lastActionRef.current === 'day' &&
              dayTapTargetMonthRef.current &&
              dayTapTargetMonthRef.current.y === last.year &&
              dayTapTargetMonthRef.current.m === last.month
            ) {
              // Clear flags and exit
              dayTapTargetMonthRef.current = null;
              lastActionRef.current = 'none';
              return;
            }
            // Swipe or nav or unrelated change: keep same day-of-month
            syncSelectedToMonth(nm);
          }
        }}
        firstDay={0}
        theme={{
          backgroundColor: '#f8f4e9',
          calendarBackground: '#f8f4e9',
          textSectionTitleColor: '#5d4037',
          textSectionTitleDisabledColor: '#d7ccc8',
          monthTextColor: '#5d4037',
          textMonthFontWeight: '400',
          textMonthFontSize: 24,
          textDayHeaderFontWeight: '400',
          textDayHeaderFontSize: 12,
          dayTextColor: '#5d4037',
          textDayFontWeight: '400',
          textDayFontSize: 16,
          todayTextColor: '#5d4037',
          textDisabledColor: '#d7ccc8',
          textDayStyle: { marginTop: 6, marginBottom: 6 },
        }}
        style={styles.calendar}
        current={`${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-01`}
        onMonthChange={(m) => setCurrentMonth(new Date(m.year, m.month - 1, 1))}
        dayComponent={({ date, state }) => {
          const isSelected = selected === date?.dateString;
          return (
            <TouchableOpacity onPress={() => handleDayPress(date!)} activeOpacity={0.8}>
              <View style={[styles.dayWrapper, isSelected && styles.daySelected]}> 
                <Text
                  style={[
                    styles.dayLabel,
                    state === 'disabled' && styles.disabledDayText,
                    isSelected && styles.dayLabelSelected,
                  ]}
                >
                  {date?.day}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {/* Year picker modal */}
      <Modal transparent visible={showYearPicker} animationType="fade" onRequestClose={() => setShowYearPicker(false)}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setShowYearPicker(false)}>
          <View style={styles.yearPickerSheet}>
            <Text style={styles.yearPickerTitle}>Select Year</Text>
            <FlatList
              data={years}
              keyExtractor={(y) => String(y)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.yearItem}
                  onPress={() => {
                    lastActionRef.current = 'year';
                    const nm = new Date(item, currentMonth.getMonth(), 1);
                    setCurrentMonth(nm);
                    syncSelectedToMonth(nm);
                    setShowYearPicker(false);
                    lastActionRef.current = 'none';
                  }}
                >
                  <Text style={[styles.yearItemText, item === currentYear && styles.yearItemTextActive]}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
      {/* Subtitle row with grouping toggle */}
      <View style={[styles.expensesHeaderRow, { marginTop: 24 }]}>
        <ThemedText type="subtitle" style={[styles.expensesSubtitle]}>Expenses for {selected || '...'}</ThemedText>
        <TouchableOpacity
          onPress={() => setGroupMode((m) => (m === 'recent' ? 'category' : 'recent'))}
          style={styles.modeToggle}
          accessibilityLabel="Toggle expense grouping"
        >
          <MaterialIcons name={groupMode === 'category' ? 'category' : 'schedule'} size={16} color="#8d6e63" />
          <Text style={styles.modeToggleText}>{groupMode === 'category' ? 'Category' : 'Recent'}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.expensesMetaRow}>
        <Text style={styles.expensesMetaText}>Total: ${formatAmount(totalForDay)}</Text>
      </View>

      {groupMode === 'category' ? (
        <SectionList
          sections={categorySections}
          keyExtractor={(item) => item._id}
          ItemSeparatorComponent={() => <View style={styles.rowDivider} />}
          SectionSeparatorComponent={() => <View style={styles.sectionDivider} />}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderText}>{section.title}</Text>
            </View>
          )}
          renderItem={({ item }) => {
            const meta = CATEGORY_META[item.category] || CATEGORY_META.other;
            return (
              <View style={styles.transactionItem}>
                <View style={styles.transactionRow}>
                  <View style={styles.categoryIconWrapper}>
                    <MaterialIcons name={meta.icon as any} size={20} color="#8d6e63" />
                  </View>
                  <View style={styles.transactionText}>
                    <Text style={styles.categoryTitle}>{meta.label}</Text>
                    {item.description ? (
                      <Text style={styles.noteText} numberOfLines={1}>{item.description}</Text>
                    ) : null}
                  </View>
                  <Text style={styles.amountText}>${formatAmount(item.amount)}</Text>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={<Text>No expenses for this day.</Text>}
        />
      ) : (
        <FlatList
          data={recentData}
          keyExtractor={item => item._id}
          ItemSeparatorComponent={() => <View style={styles.rowDivider} />}
          renderItem={({ item }) => {
            const meta = CATEGORY_META[item.category] || CATEGORY_META.other;
            return (
              <View style={styles.transactionItem}>
                <View style={styles.transactionRow}>
                  <View style={styles.categoryIconWrapper}>
                    <MaterialIcons name={meta.icon as any} size={20} color="#8d6e63" />
                  </View>
                  <View style={styles.transactionText}>
                    <Text style={styles.categoryTitle}>{meta.label}</Text>
                    {item.description ? (
                      <Text style={styles.noteText} numberOfLines={1}>{item.description}</Text>
                    ) : null}
                  </View>
                  <Text style={styles.amountText}>${formatAmount(item.amount)}</Text>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={<Text>No expenses for this day.</Text>}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f4e9',
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: Platform.select({ ios: 24, android: 16, default: 16 }),
  },
  title: {
    textAlign: 'center',
    color: '#5d4037',
    marginBottom: 8,
  },
  calendar: {
    marginBottom: 16,
    borderRadius: 0,
    overflow: 'hidden',
    backgroundColor: '#f8f4e9',
  },
  headerContainer: {
    paddingTop: Platform.select({ ios: 2, default: 10 }),
    paddingBottom: 6,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  headerDivider: {
    marginTop: 6,
    height: StyleSheet.hairlineWidth,
    width: '86%',
    alignSelf: 'center',
    backgroundColor: '#cbb7aa',
  },
  headerTitleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 12,
  },
  monthTitle: {
    fontSize: 28,
    fontWeight: '400',
    color: '#5d4037',
    letterSpacing: 2,
    textTransform: 'uppercase',
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
  },
  yearLabel: {
    marginTop: 0,
    fontSize: 12,
    color: '#8d6e63',
    letterSpacing: 1,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
    marginBottom: 14,
  },
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingTop: 6,
  },
  dayHeader: {
    fontSize: 12,
    color: '#8d6e63',
    textAlign: 'center',
    fontWeight: '400',
    paddingVertical: 5,
    width: `${100 / 7}%`,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
  },
  dayCell: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  dayWrapper: {
    height: 34,
    width: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  daySelected: {
    backgroundColor: '#8d6e63',
  },
  dayLabel: {
    fontSize: 16,
    fontWeight: '400',
    color: '#5d4037',
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
  },
  dayLabelSelected: {
    color: '#f8f4e9',
    fontWeight: '600',
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
  },
  todayText: {
    color: '#5d4037',
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
    paddingVertical: 12,
    paddingHorizontal: 4,
    backgroundColor: 'transparent',
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#e6d3b3',
    marginLeft: 4 + 36 + 12, // align divider under text (icon gutter + spacer)
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIconWrapper: {
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionText: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 15,
    color: '#5d4037',
    fontWeight: '600',
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
  },
  noteText: {
    marginTop: 2,
    fontSize: 12,
    color: '#8d6e63',
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
  },
  amountText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#5d4037',
    marginLeft: 10,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
  },
  expensesSubtitle: {
    color: '#5d4037',
    letterSpacing: 0.5,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
  },
  expensesHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#fff9f4',
    borderWidth: 1,
    borderColor: '#e6d3b3',
  },
  modeToggleText: {
    marginLeft: 6,
    color: '#8d6e63',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
  },
  sectionDivider: {
    height: 10,
  },
  sectionHeader: {
    paddingTop: 16,
    paddingBottom: 6,
    paddingHorizontal: 4,
  },
  sectionHeaderText: {
    color: '#8d6e63',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.4,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'flex-end',
  },
  yearPickerSheet: {
    maxHeight: '50%',
    backgroundColor: '#fff9f4',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderColor: '#e6d3b3',
  },
  yearPickerTitle: {
    color: '#5d4037',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
  },
  yearItem: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  yearItemText: {
    color: '#5d4037',
    fontSize: 16,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
  },
  yearItemTextActive: {
    color: '#8d6e63',
    fontWeight: '700',
  },
  expensesMetaRow: {
    marginTop: 6,
    marginBottom: 2,
  },
  expensesMetaText: {
    color: '#8d6e63',
    opacity: 0.7,
    fontSize: 15,
    letterSpacing: 0.3,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
  },
});
