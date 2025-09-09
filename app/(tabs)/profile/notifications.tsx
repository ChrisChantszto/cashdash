import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Alert } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { getRandomNotification, sendImmediateNotification } from '../../utils/notifications';

export default function NotificationsScreen() {
  const [enabled, setEnabled] = useState(true);
  const [dailyReminder, setDailyReminder] = useState(false);
  const [notifyAfterLog, setNotifyAfterLog] = useState(true);
  const [testCount, setTestCount] = useState(0);

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
          <View style={[styles.row, !enabled && { opacity: 0.6 }] }>
            <Text style={styles.rowText}>Notification after logging each transaction</Text>
            <Switch value={notifyAfterLog} onValueChange={setNotifyAfterLog} disabled={!enabled} />
          </View>
          
          {/* Test notification button */}
          <View style={[styles.row, { borderBottomWidth: 0, borderTopWidth: 1, borderTopColor: '#f0e6df' }]}>
            <Text style={styles.rowText}>Test notifications on this device</Text>
            <TouchableOpacity 
              style={[styles.testButton, !enabled && { opacity: 0.5 }]}
              disabled={!enabled}
              onPress={() => {
                if (!enabled) return;
                
                // Rotate through notification categories
                const categories = ['INACTIVITY', 'ETHOS', 'PATHOS', 'LOGOS'];
                const categoryIndex = testCount % categories.length;
                const category = categories[categoryIndex];
                
                // Get a random notification from the category
                const notification = getRandomNotification(category as any);
                
                // Send the notification
                sendImmediateNotification(
                  notification.title,
                  notification.body,
                  { category, test: true }
                );
                
                // Update test count for next category
                setTestCount(testCount + 1);
                
                // Show confirmation
                Alert.alert(
                  'Test Notification Sent', 
                  `Category: ${category}\n\nCheck your notification center!`
                );
              }}
            >
              <Text style={styles.testButtonText}>Test Now</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <Text style={styles.infoText}>
          Test notifications will cycle through different message styles each time you press the button.
        </Text>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f4e9', padding: 24 },
  title: { fontSize: 24, color: '#5d4037', marginBottom: 16 },
  help: { color: '#8d6e63', paddingHorizontal: 16, paddingTop: 12, marginBottom: 12 },
  card: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#eee0d8', overflow: 'hidden', marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderTopWidth: 1, borderTopColor: '#f0e6df' },
  rowText: { fontSize: 16, color: '#5d4037', fontWeight: '600', flex: 1, flexShrink: 1, paddingRight: 12 },
  testButton: { 
    backgroundColor: '#8d6e63', 
    paddingVertical: 8, 
    paddingHorizontal: 16, 
    borderRadius: 8,
  },
  testButtonText: { 
    color: '#fff', 
    fontWeight: '600', 
    fontSize: 14,
  },
  infoText: { 
    fontSize: 14, 
    color: '#8d6e63', 
    fontStyle: 'italic', 
    marginTop: 8, 
    textAlign: 'center',
    paddingHorizontal: 16,
  },
});
