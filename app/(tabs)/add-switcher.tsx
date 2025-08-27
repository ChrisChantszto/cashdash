import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useRoute } from '@react-navigation/native';

import AddTransaction from '@/app/(tabs)/add-transaction';
import AddIncome from '@/app/(tabs)/add-income';

export default function AddSwitcher() {
  const route = useRoute<any>();
  const initialTab = (route.params?.activeTab === 'income' ? 'income' : 'expense') as 'expense' | 'income';
  const [active, setActive] = useState<'expense' | 'income'>(initialTab);

  useEffect(() => {
    if (route.params?.activeTab && route.params.activeTab !== active) {
      setActive(route.params.activeTab);
    }
  }, [route.params?.activeTab]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {active === 'expense' ? (
          <AddTransaction forwardedParams={route.params} />
        ) : (
          <AddIncome forwardedParams={route.params} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7efe2', paddingTop: Platform.select({ ios: 12, default: 16 }) },
  topTabs: {
    flexDirection: 'row',
    marginHorizontal: 12,
    backgroundColor: '#f1e7d8',
    borderRadius: 12,
    padding: 4,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2c9a8',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabBtnActive: {
    backgroundColor: '#a47148',
  },
  tabText: {
    color: '#5d4037',
    fontWeight: '700',
  },
  tabTextActive: {
    color: '#fff',
  },
  content: {
    flex: 1,
  },
});
