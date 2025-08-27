import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';

// Featured categories (match AddTransaction options) appear first
const EXTRA_CATEGORIES: { id: string; name: string; icon: any }[] = [
  { id: 'food', name: 'Food', icon: 'restaurant' },
  { id: 'shopping', name: 'Shopping', icon: 'shopping-bag' },
  { id: 'transport', name: 'Transport', icon: 'directions-car' },
  { id: 'entertainment', name: 'Entertainment', icon: 'movie' },
  { id: 'bills', name: 'Bills', icon: 'receipt' },
  // Additional categories
  { id: 'groceries', name: 'Groceries', icon: 'local-grocery-store' },
  { id: 'utilities', name: 'Utilities', icon: 'lightbulb' },
  { id: 'house', name: 'House', icon: 'house' },
  { id: 'clothes', name: 'Clothes', icon: 'checkroom' },
  { id: 'beauty', name: 'Beauty', icon: 'face-retouching-natural' },
  { id: 'social', name: 'Socializing', icon: 'people' },
  { id: 'books', name: 'Books', icon: 'menu-book' },
  { id: 'insurance', name: 'Insurance', icon: 'security' },
  { id: 'tax', name: 'Tax', icon: 'request-quote' },
  { id: 'health', name: 'Health', icon: 'health-and-safety' },
  { id: 'education', name: 'Education', icon: 'school' },
  { id: 'gift', name: 'Gift', icon: 'card-giftcard' },
  { id: 'transfer', name: 'Transfer fee', icon: 'swap-horiz' },
];

export default function CategoryPicker() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const incoming = Array.isArray(route?.params?.categories)
    ? (route.params.categories as Array<{ id: string; name: string; icon: any }>)
    : [];

  // Merge and dedupe by id, prefer incoming definitions
  const mergedCategories = useMemo(() => {
    const map = new Map<string, { id: string; name: string; icon: any }>();
    EXTRA_CATEGORIES.forEach((c) => map.set(c.id, c));
    incoming.forEach((c) => {
      const id = String(c?.id ?? '');
      if (!id || id === 'other' || id === 'add_new') return; // skip pseudo categories
      if (c?.name && c?.icon) map.set(id, { id, name: String(c.name), icon: c.icon });
    });
    return Array.from(map.values());
  }, [incoming]);

  const onSelect = (id: string) => {
    const activeTab = route?.params?.activeTab === 'income' ? 'income' : 'expense';
    // Navigate back to the Add switcher with selectedCategory and keep the active tab
    navigation.navigate('AddSwitcher', { selectedCategory: id, activeTab });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn} accessibilityLabel="Back">
          <MaterialIcons name="chevron-left" size={24} color="#5d4037" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Category</Text>
        <View style={styles.headerBtn} />
      </View>

      <FlatList
        data={[...mergedCategories, { id: 'add_new', name: 'Add new', icon: 'add-circle-outline' }]}
        numColumns={3}
        contentContainerStyle={styles.grid}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => {
              if (item.id === 'add_new') {
                const activeTab = route?.params?.activeTab === 'income' ? 'income' : 'expense';
                navigation.navigate('CreateCategory', { defaultType: activeTab });
              } else {
                onSelect(item.id);
              }
            }}
            style={styles.tile}
          >
            <View style={styles.iconWrap}>
              <MaterialIcons name={item.icon as any} size={28} color="#8d6e63" />
            </View>
            <Text style={styles.tileText} numberOfLines={1}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f4e9',
    paddingTop: Platform.select({ ios: 12, default: 16 }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  headerBtn: { padding: 6 },
  headerTitle: {
    color: '#5d4037',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.3,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
  },
  grid: {
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
  tile: {
    flex: 1/3,
    margin: 6,
    backgroundColor: '#fff9f4',
    borderWidth: 1,
    borderColor: '#e6d3b3',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3e5d8',
    marginBottom: 8,
  },
  tileText: {
    color: '#5d4037',
    fontSize: 13,
    fontWeight: '600',
  },
});
