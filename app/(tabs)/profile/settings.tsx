import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Modal, TouchableOpacity, Alert } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { getFullCurrencyList } from '@/constants/currencies';

type TimeFormat = 'YYYY-MM-DD' | 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'D MMM YYYY' | 'MMM D, YYYY';
type LanguageCode = 'en' | 'zh-HK' | 'zh-CN' | 'ja';

const TIME_FORMATS: { key: TimeFormat; label: string }[] = [
  { key: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
  { key: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
  { key: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
  { key: 'D MMM YYYY', label: 'D MMM YYYY' },
  { key: 'MMM D, YYYY', label: 'MMM D, YYYY' },
];

const LANGUAGES: { key: LanguageCode; label: string }[] = [
  { key: 'en', label: 'English' },
  { key: 'zh-HK', label: '中文 (繁體)' },
  { key: 'zh-CN', label: '中文 (简体)' },
  { key: 'ja', label: '日本語' },
];

const CURRENCY_LIST = getFullCurrencyList();

function formatSample(date: Date, pattern: TimeFormat): string {
  const pad = (n: number) => (n < 10 ? `0${n}` : String(n));
  const d = date.getDate();
  const dd = pad(d);
  const m = date.getMonth() + 1;
  const mm = pad(m);
  const y = date.getFullYear();
  const MMMs = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const MMM = MMMs[date.getMonth()];
  switch (pattern) {
    case 'YYYY-MM-DD':
      return `${y}-${mm}-${dd}`;
    case 'DD/MM/YYYY':
      return `${dd}/${mm}/${y}`;
    case 'MM/DD/YYYY':
      return `${mm}/${dd}/${y}`;
    case 'D MMM YYYY':
      return `${d} ${MMM} ${y}`;
    case 'MMM D, YYYY':
      return `${MMM} ${d}, ${y}`;
  }
}

export default function SettingsScreen() {
  // Display settings state
  const [timeFormat, setTimeFormat] = useState<TimeFormat>('D MMM YYYY');
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [walletCurrency, setWalletCurrency] = useState<string>('HKD');

  // Modal visibility
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [showLangModal, setShowLangModal] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);

  // Appearance
  const [theme, setTheme] = useState<'system' | 'light' | 'dark'>('system');
  const [showThemeModal, setShowThemeModal] = useState(false);

  // Notifications
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);


  const todaySample = useMemo(() => formatSample(new Date(), timeFormat), [timeFormat]);

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }}>
        <ThemedText type="title" style={styles.title}>Settings</ThemedText>
        {/* Display Section */}
        <ThemedText style={styles.sectionHeading}>Display</ThemedText>
        <View style={styles.card}>
          <TouchableOpacity style={styles.row} onPress={() => setShowTimeModal(true)}>
            <Text style={styles.rowText}>Time format</Text>
            <Text style={styles.valueText}>{todaySample}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.row} onPress={() => setShowLangModal(true)}>
            <Text style={styles.rowText}>Language</Text>
            <Text style={styles.valueText}>{LANGUAGES.find(l => l.key === language)?.label}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.row, { borderBottomWidth: 0 }]} onPress={() => setShowCurrencyModal(true)}>
            <Text style={styles.rowText}>Currency for total wallet</Text>
            <Text style={styles.valueText}>{walletCurrency}</Text>
          </TouchableOpacity>
        </View>

        {/* Appearance */}
        <ThemedText style={styles.sectionHeading}>Appearance</ThemedText>
        <View style={styles.card}>
          <TouchableOpacity style={[styles.row, { borderBottomWidth: 0 }]} onPress={() => setShowThemeModal(true)}>
            <Text style={styles.rowText}>Theme</Text>
            <Text style={styles.valueText}>{({ system: 'System', light: 'Light', dark: 'Dark' } as const)[theme]}</Text>
          </TouchableOpacity>
        </View>

        {/* Notifications */}
        <ThemedText style={styles.sectionHeading}>Notifications</ThemedText>
        <View style={styles.card}>
          <View style={[styles.row, { borderBottomWidth: 0 }]}>
            <Text style={styles.rowText}>Enable notifications</Text>
            <Switch value={notificationsEnabled} onValueChange={setNotificationsEnabled} />
          </View>
        </View>

        
        {/* Data & Storage */}
        <ThemedText style={styles.sectionHeading}>Data & Storage</ThemedText>
        <View style={styles.card}>
          <TouchableOpacity style={styles.row} onPress={() => Alert.alert('Export data', 'CSV export coming soon.') }>
            <Text style={styles.rowText}>Export data (CSV)</Text>
            <Text style={styles.valueText}>Coming soon</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.row, { borderBottomWidth: 0 }]} onPress={() => Alert.alert('Clear cache', 'Clear cache coming soon.') }>
            <Text style={styles.rowText}>Clear cache</Text>
            <Text style={styles.valueText}>Coming soon</Text>
          </TouchableOpacity>
        </View>

        {/* Time Format Modal */}
        <Modal visible={showTimeModal} transparent animationType="fade" onRequestClose={() => setShowTimeModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select time format</Text>
              <ScrollView>
                {TIME_FORMATS.map(opt => (
                  <TouchableOpacity
                    key={opt.key}
                    style={styles.modalOptionRow}
                    onPress={() => { setTimeFormat(opt.key); setShowTimeModal(false); }}
                  >
                    <Text style={styles.modalOptionText}>{opt.label}</Text>
                    <Text style={styles.modalOptionTextSecondary}>{formatSample(new Date(), opt.key)}</Text>
                    {timeFormat === opt.key && <Text style={styles.modalCheck}>✓</Text>}
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity style={styles.modalClose} onPress={() => setShowTimeModal(false)}>
                <Text style={styles.modalCloseText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Language Modal */}
        <Modal visible={showLangModal} transparent animationType="fade" onRequestClose={() => setShowLangModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select language</Text>
              <ScrollView>
                {LANGUAGES.map(opt => (
                  <TouchableOpacity
                    key={opt.key}
                    style={styles.modalOptionRow}
                    onPress={() => { setLanguage(opt.key); setShowLangModal(false); }}
                  >
                    <Text style={styles.modalOptionText}>{opt.label}</Text>
                    {language === opt.key && <Text style={styles.modalCheck}>✓</Text>}
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity style={styles.modalClose} onPress={() => setShowLangModal(false)}>
                <Text style={styles.modalCloseText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Theme Modal */}
        <Modal visible={showThemeModal} transparent animationType="fade" onRequestClose={() => setShowThemeModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select theme</Text>
              <ScrollView>
                {(['system','light','dark'] as const).map(opt => (
                  <TouchableOpacity
                    key={opt}
                    style={styles.modalOptionRow}
                    onPress={() => { setTheme(opt); setShowThemeModal(false); }}
                  >
                    <Text style={styles.modalOptionText}>{({ system: 'System', light: 'Light', dark: 'Dark' } as const)[opt]}</Text>
                    {theme === opt && <Text style={styles.modalCheck}>✓</Text>}
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity style={styles.modalClose} onPress={() => setShowThemeModal(false)}>
                <Text style={styles.modalCloseText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Currency Modal */}
        <Modal visible={showCurrencyModal} transparent animationType="fade" onRequestClose={() => setShowCurrencyModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContentTall}>
              <Text style={styles.modalTitle}>Select wallet currency</Text>
              <ScrollView>
                {CURRENCY_LIST.map(code => (
                  <TouchableOpacity
                    key={code}
                    style={styles.modalOptionRow}
                    onPress={() => { setWalletCurrency(code); setShowCurrencyModal(false); }}
                  >
                    <Text style={styles.modalOptionText}>{code}</Text>
                    {walletCurrency === code && <Text style={styles.modalCheck}>✓</Text>}
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity style={styles.modalClose} onPress={() => setShowCurrencyModal(false)}>
                <Text style={styles.modalCloseText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f4e9', paddingHorizontal: 24, paddingVertical: 16 },
  title: { fontSize: 24, color: '#5d4037', marginBottom: 10 },
  sectionHeading: { fontSize: 18, color: '#6d4c41', fontWeight: '600', marginBottom: 10, marginTop: 14 },
  card: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#eee0d8', overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: '#f0e6df' },
  rowNoDivider: { borderBottomWidth: 0 },
  hintRow: { paddingHorizontal: 20, paddingTop: 6, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f0e6df' },
  hintText: { fontSize: 12, color: '#9e9e9e' },
  rowText: { fontSize: 16, color: '#5d4037', fontWeight: '600', flex: 1, flexShrink: 1, paddingRight: 12 },
  valueText: { fontSize: 14, color: '#8d6e63' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', justifyContent: 'center', padding: 24 },
  modalContent: { backgroundColor: '#fff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#eee0d8', maxHeight: '70%' },
  modalContentTall: { backgroundColor: '#fff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#eee0d8', maxHeight: '80%' },
  modalTitle: { fontSize: 18, color: '#5d4037', fontWeight: '700', marginBottom: 8 },
  modalOptionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f5eee8' },
  modalOptionText: { fontSize: 16, color: '#5d4037' },
  modalOptionTextSecondary: { fontSize: 13, color: '#8d6e63' },
  modalCheck: { marginLeft: 12, color: '#a47148', fontSize: 16, fontWeight: '700' },
  modalClose: { marginTop: 8, alignSelf: 'flex-end', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, backgroundColor: '#a47148' },
  modalCloseText: { color: '#fff', fontWeight: '600' },
});
