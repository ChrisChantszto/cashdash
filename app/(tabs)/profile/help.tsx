import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Collapsible } from '@/components/Collapsible';

export default function HelpSupportScreen() {
  const openMail = async () => {
    const url = 'mailto:support@cashdash.app?subject=Support%20Request';
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) await Linking.openURL(url);
      else Alert.alert('Cannot open email client');
    } catch (e) {
      Alert.alert('Failed to open email client');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }}>
        <ThemedText type="title" style={styles.title}>Help & Support</ThemedText>
        {/* FAQs */}
        <View style={styles.card}>
          <ThemedText style={styles.sectionHeading}>FAQs</ThemedText>
          <View style={styles.divider} />
          {FAQS.map((item, idx) => (
            <View key={idx} style={[styles.faqRow, idx === FAQS.length - 1 && { borderBottomWidth: 0 }]}>
              <Collapsible title={item.q}>
                <ThemedText style={styles.answerText}>{item.a}</ThemedText>
              </Collapsible>
            </View>
          ))}
        </View>

        {/* Contact */}
        <View style={[styles.card, { marginTop: 16 }]}>
          <Text style={styles.text}>Can’t find your answer? Contact us for assistance.</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={openMail}>
            <Text style={styles.primaryButtonText}>Email Support</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const FAQS: { q: string; a: string }[] = [
  {
    q: 'How do I add a new transaction?',
    a: 'Go to Add Transaction from the main tabs. Enter amount, category, date, and any notes, then tap Save. Use the header toggle to switch between expense and income.'
  },
  {
    q: 'Can I set recurring transactions?',
    a: 'Yes. In the Add Transaction screen, enable Recurring and choose a frequency. The app will remember this pattern for future periods.'
  },
  {
    q: 'How do I edit or delete a transaction?',
    a: 'Open the transaction from your calendar or list, then choose Edit to modify details or Delete to remove it.'
  },
  {
    q: 'How do I change language, date format, or currency?',
    a: 'Go to Profile → Settings → Display. Choose your preferred language, time format, and total wallet currency.'
  },
  {
    q: 'What is App Lock and Lock Timeout?',
    a: 'App Lock requires Face ID/Touch ID/PIN when returning to the app. Lock Timeout controls when that protection re-engages (immediately or after a short grace period).'
  },
  {
    q: 'Can I export my data?',
    a: 'Yes. Go to Profile → Settings → Data & Storage. Export to CSV will be available from there.'
  },
  {
    q: 'How do notifications work?',
    a: 'Enable notifications under Profile → Notifications. You can turn on a daily reminder and a confirmation after each logged transaction. Turning off the main switch disables all sub-options.'
  },
  {
    q: 'How are exchange rates handled for the total wallet?',
    a: 'You can choose a display currency in Settings. Future updates may include automatic FX conversion; for now, values display in the chosen currency where supported.'
  },
  {
    q: 'Do I need an account to use the app?',
    a: 'You can use the core features without login. Some cloud-related or sync features may require authentication when available.'
  },
];

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f4e9', padding: 24 },
  title: { fontSize: 24, color: '#5d4037', marginBottom: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#eee0d8' },
  sectionHeading: { fontSize: 18, color: '#6d4c41', fontWeight: '700', marginBottom: 6 },
  divider: { height: 1, backgroundColor: '#f0e6df', marginBottom: 6 },
  faqRow: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f5eee8' },
  answerText: { marginTop: 6, lineHeight: 20 },
  text: { color: '#5d4037', marginBottom: 8 },
  primaryButton: { backgroundColor: '#5d4037', borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginTop: 12 },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
