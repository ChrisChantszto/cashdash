import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { FontAwesome } from '@expo/vector-icons';

const LANGS = [
  { code: 'en', label: 'English' },
  { code: 'zh-HK', label: '繁體中文' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
  { code: 'fr', label: 'Français' },
  { code: 'es', label: 'Español' },
  { code: 'de', label: 'Deutsch' },
  { code: 'it', label: 'Italiano' },
  { code: 'pt', label: 'Português' },
  { code: 'id', label: 'Bahasa Indonesia' },
  { code: 'th', label: 'ไทย' },
  { code: 'vi', label: 'Tiếng Việt' },
  { code: 'ms', label: 'Bahasa Melayu' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'ar', label: 'العربية' },
];

export default function LanguageScreen() {
  const [lang, setLang] = useState('en');

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }}>
        <ThemedText type="title" style={styles.title}>Language</ThemedText>
        <View style={styles.card}>
          {LANGS.map((l, idx) => (
            <TouchableOpacity
              key={l.code}
              style={[styles.row, idx === LANGS.length - 1 && { borderBottomWidth: 0 }]}
              onPress={() => setLang(l.code)}
            >
              <Text style={styles.rowText}>{l.label}</Text>
              {lang === l.code ? (
                <FontAwesome name="check" size={18} color="#5d4037" />
              ) : null}
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.hint}>Language preference is stored locally for now and will apply to future screens in a later update.</Text>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f4e9', padding: 24 },
  title: { fontSize: 24, color: '#5d4037', marginBottom: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#eee0d8', overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f0e6df' },
  rowText: { fontSize: 16, color: '#5d4037', fontWeight: '600' },
  hint: { color: '#8d6e63', marginTop: 12 },
});
