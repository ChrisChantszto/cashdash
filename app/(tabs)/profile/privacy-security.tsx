import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';

export default function PrivacySecurityScreen() {
  const [appLock, setAppLock] = useState(false);
  const [lockTimeout, setLockTimeout] = useState<'immediate' | '1m' | '5m'>('immediate');
  const [showLockTimeoutModal, setShowLockTimeoutModal] = useState(false);

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }}>
        <ThemedText type="title" style={styles.title}>Privacy & Security</ThemedText>

        <View style={styles.card}>
          <View style={[styles.row, styles.rowNoDivider]}>
            <Text style={styles.rowText}>App Lock</Text>
            <Switch value={appLock} onValueChange={setAppLock} />
          </View>
          <View style={styles.hintRow}>
            <Text style={styles.hintText}>Require passcode to unlock cashly</Text>
          </View>
          <TouchableOpacity
            style={[styles.row, { opacity: appLock ? 1 : 0.6 }]}
            onPress={() => appLock && setShowLockTimeoutModal(true)}
            activeOpacity={appLock ? 0.7 : 1}
          >
            <Text style={styles.rowText}>Lock timeout</Text>
            <Text style={styles.valueText}>{({ immediate: 'Immediately', '1m': 'After 1 min', '5m': 'After 5 min' } as const)[lockTimeout]}</Text>
          </TouchableOpacity>
        </View>

        <Modal visible={showLockTimeoutModal} transparent animationType="fade" onRequestClose={() => setShowLockTimeoutModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select lock timeout</Text>
              <ScrollView>
                {(['immediate','1m','5m'] as const).map(opt => (
                  <TouchableOpacity
                    key={opt}
                    style={styles.modalOptionRow}
                    onPress={() => { setLockTimeout(opt); setShowLockTimeoutModal(false); }}
                  >
                    <Text style={styles.modalOptionText}>{({ immediate: 'Immediately', '1m': 'After 1 min', '5m': 'After 5 min' } as const)[opt]}</Text>
                    {lockTimeout === opt && <Text style={styles.modalCheck}>✓</Text>}
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity style={styles.modalClose} onPress={() => setShowLockTimeoutModal(false)}>
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
  card: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#eee0d8', overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: '#f0e6df' },
  rowNoDivider: { borderBottomWidth: 0 },
  rowText: { fontSize: 16, color: '#5d4037', fontWeight: '600', flex: 1, flexShrink: 1, paddingRight: 12 },
  valueText: { fontSize: 14, color: '#8d6e63' },
  hintRow: { paddingHorizontal: 20, paddingTop: 6, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f0e6df' },
  hintText: { fontSize: 12, color: '#9e9e9e' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', justifyContent: 'center', padding: 24 },
  modalContent: { backgroundColor: '#fff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#eee0d8', maxHeight: '70%' },
  modalTitle: { fontSize: 18, color: '#5d4037', fontWeight: '700', marginBottom: 8 },
  modalOptionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f5eee8' },
  modalOptionText: { fontSize: 16, color: '#5d4037' },
  modalCheck: { marginLeft: 12, color: '#a47148', fontSize: 16, fontWeight: '700' },
  modalClose: { marginTop: 8, alignSelf: 'flex-end', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, backgroundColor: '#a47148' },
  modalCloseText: { color: '#fff', fontWeight: '600' },
});
