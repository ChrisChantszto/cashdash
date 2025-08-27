import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';

type RecurrenceOption = 'never' | 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly' | 'custom';

export default function RecurringDetails() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const initial: RecurrenceOption = (() => {
    const v = route.params?.initial;
    if (v === 'never' || v === 'daily' || v === 'weekly' || v === 'biweekly' || v === 'monthly' || v === 'yearly' || v === 'custom') return v;
    return 'never';
  })();
  const [selection, setSelection] = useState<RecurrenceOption>(initial);

  const handleSave = () => {
    const targetTab = route.params?.activeTab === 'income' ? 'income' : 'expense';
    navigation.navigate('AddSwitcher', { recurrence: selection, activeTab: targetTab });
  };

  const options: Array<{ key: RecurrenceOption; label: string; subtitle?: string }> = [
    { key: 'never', label: 'Never' },
    { key: 'daily', label: 'Every day' },
    { key: 'weekly', label: 'Every week' },
    { key: 'biweekly', label: 'Every 2 weeks' },
    { key: 'monthly', label: 'Every month' },
    { key: 'yearly', label: 'Every year' },
    { key: 'custom', label: 'Custom', subtitle: 'Set your own rule' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <MaterialIcons name="arrow-back" size={24} color="#666" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Recurring details</Text>
        <View style={styles.headerBtn} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Frequency</Text>
        <View>
          {options.map((opt) => (
            <TouchableOpacity
              key={opt.key}
              style={[styles.listItem, selection === opt.key && styles.listItemActive]}
              onPress={() => setSelection(opt.key)}
            >
              <View>
                <Text style={[styles.listItemText, selection === opt.key && styles.listItemTextActive]}>{opt.label}</Text>
                {opt.subtitle ? (
                  <Text style={[styles.listItemSubtitle, selection === opt.key && styles.listItemSubtitleActive]}>
                    {opt.subtitle}
                  </Text>
                ) : null}
              </View>
              {selection === opt.key ? (
                <MaterialIcons name="check" size={20} color="#fff" />
              ) : (
                <View style={styles.checkPlaceholder} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={[styles.button, styles.saveBtn]} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f4e9', paddingHorizontal: 16 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e6d3b3',
    paddingTop: Platform.select({ ios: 20, default: 15 }) as number,
  },
  headerBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#5d4037' },

  section: { marginTop: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12, color: '#5d4037' },

  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff9f4',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e6d3b3',
    marginBottom: 10,
  },
  listItemActive: { backgroundColor: '#8d6e63', borderColor: '#8d6e63' },
  listItemText: { fontSize: 16, color: '#5d4037', fontWeight: '600' },
  listItemTextActive: { color: '#fff' },
  listItemSubtitle: { fontSize: 12, color: '#7b6a64', marginTop: 2 },
  listItemSubtitleActive: { color: '#fff' },
  checkPlaceholder: { width: 20, height: 20 },

  footer: { marginTop: 'auto', marginBottom: 24 },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtn: { backgroundColor: '#8d6e63' },
  saveBtnText: { color: '#fff', fontSize: 18, fontWeight: '600' },
});
