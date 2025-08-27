import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';

export default function NotificationsScreen() {
  const [enabled, setEnabled] = useState(true);
  const [dailyReminder, setDailyReminder] = useState(false);
  const [notifyAfterLog, setNotifyAfterLog] = useState(true);

  // When notifications are disabled, force sub-options off
  useEffect(() => {
    if (!enabled) {
      if (dailyReminder) setDailyReminder(false);
      if (notifyAfterLog) setNotifyAfterLog(false);
    }
  }, [enabled]);

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }}>
        <ThemedText type="title" style={styles.title}>Notifications</ThemedText>
        <View style={styles.card}>
          <Text style={styles.help}>Control app notifications. Turning off the main switch disables all sub-options.</Text>
          <View style={styles.row}>
            <Text style={styles.rowText}>Enable Notifications</Text>
            <Switch value={enabled} onValueChange={setEnabled} />
          </View>
          <View style={[styles.row, !enabled && { opacity: 0.6 }] }>
            <Text style={styles.rowText}>Daily reminder for adding transactions</Text>
            <Switch value={dailyReminder} onValueChange={setDailyReminder} disabled={!enabled} />
          </View>
          <View style={[styles.row, { borderBottomWidth: 0 }, !enabled && { opacity: 0.6 }] }>
            <Text style={styles.rowText}>Notification after logging each transaction</Text>
            <Switch value={notifyAfterLog} onValueChange={setNotifyAfterLog} disabled={!enabled} />
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f4e9', padding: 24 },
  title: { fontSize: 24, color: '#5d4037', marginBottom: 16 },
  help: { color: '#8d6e63', paddingHorizontal: 16, paddingTop: 12, marginBottom: 12 },
  card: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#eee0d8', overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderTopWidth: 1, borderTopColor: '#f0e6df' },
  rowText: { fontSize: 16, color: '#5d4037', fontWeight: '600', flex: 1, flexShrink: 1, paddingRight: 12 },
});
