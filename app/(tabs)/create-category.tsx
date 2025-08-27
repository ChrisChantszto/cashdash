import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Platform, Alert, Modal, FlatList } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';

export default function CreateCategory() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const [name, setName] = useState('Add new');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [icon, setIcon] = useState<string>('add-circle-outline');
  const [showIconPicker, setShowIconPicker] = useState(false);

  const slugify = (s: string) =>
    s
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      return Alert.alert('Category name required', 'Please enter a category name.');
    }
    const id = slugify(trimmed) || 'custom-category';
    // Navigate back to AddSwitcher with the chosen category and keep correct tab
    navigation.navigate('AddSwitcher', { activeTab: type, selectedCategory: id, selectedCategoryName: trimmed, selectedCategoryType: type, selectedCategoryIcon: icon });
  };

  useEffect(() => {
    const dt = route?.params?.defaultType;
    if (dt === 'income' || dt === 'expense') {
      setType(dt);
    }
  }, [route?.params?.defaultType]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn} accessibilityLabel="Back">
          <MaterialIcons name="chevron-left" size={24} color="#5d4037" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Category</Text>
        <View style={styles.headerBtn} />
      </View>

      {/* Preview tile */}
      <View style={styles.previewWrap}>
        <View style={styles.previewCard}>
          <TouchableOpacity onPress={() => setShowIconPicker(true)} activeOpacity={0.8}>
            <View style={styles.iconCircle}>
              <MaterialIcons name={icon as any} size={36} color="#5d4037" />
            </View>
          </TouchableOpacity>
          <Text style={styles.tileLabel} numberOfLines={1}>{name || 'Add new'}</Text>
          <TouchableOpacity onPress={() => setShowIconPicker(true)}>
            <Text style={styles.changeIconText}>Change icon</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Category name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Savings, Freelance, Coffee"
          placeholderTextColor="#9c8f86"
          value={name}
          onChangeText={setName}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Type</Text>
        <View style={styles.toggleGroup}>
          <TouchableOpacity
            style={[styles.toggleBtn, type === 'expense' && styles.toggleBtnActive]}
            onPress={() => setType('expense')}
          >
            <Text style={[styles.toggleText, type === 'expense' && styles.toggleTextActive]}>Expense</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, type === 'income' && styles.toggleBtnActive]}
            onPress={() => setType('income')}
          >
            <Text style={[styles.toggleText, type === 'income' && styles.toggleTextActive]}>Income</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Icon picker modal */}
      <Modal
        visible={showIconPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowIconPicker(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Choose an icon</Text>
            <FlatList
              data={ICON_CHOICES}
              numColumns={5}
              keyExtractor={(i) => i}
              contentContainerStyle={styles.iconGrid}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.iconTile, item === icon && styles.iconTileSelected]}
                  onPress={() => {
                    setIcon(item);
                    setShowIconPicker(false);
                  }}
                >
                  <MaterialIcons name={item as any} size={28} color={item === icon ? '#fff' : '#8d6e63'} />
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={[styles.button, styles.buttonSecondary, { marginTop: 8 }]} onPress={() => setShowIconPicker(false)}>
              <Text style={styles.buttonSecondaryText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.footer}>
        <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonSecondaryText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.buttonPrimary, !name.trim() && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={!name.trim()}
        >
          <Text style={styles.buttonPrimaryText}>Save</Text>
        </TouchableOpacity>
      </View>
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
  previewWrap: {
    paddingHorizontal: 16,
    marginTop: 12,
  },
  previewCard: {
    backgroundColor: '#fff9f4',
    borderWidth: 1,
    borderColor: '#e6d3b3',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#f3e5d8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  tileLabel: {
    color: '#5d4037',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 6,
    marginBottom: 6,
  },
  changeIconText: {
    color: '#8d6e63',
    fontSize: 13,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 18,
  },
  label: {
    color: '#5d4037',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff9f4',
    borderWidth: 1,
    borderColor: '#e6d3b3',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: '#5d4037',
    fontSize: 16,
  },
  toggleGroup: {
    flexDirection: 'row',
    gap: 10,
  },
  toggleBtn: {
    flex: 1,
    backgroundColor: '#fff9f4',
    borderWidth: 1,
    borderColor: '#e6d3b3',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  toggleBtnActive: {
    backgroundColor: '#8d6e63',
    borderColor: '#8d6e63',
  },
  toggleText: {
    color: '#5d4037',
    fontSize: 14,
    fontWeight: '600',
  },
  toggleTextActive: {
    color: '#fff',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#fffaf2',
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '60%',
  },
  modalTitle: {
    color: '#5d4037',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },
  iconGrid: {
    paddingVertical: 8,
  },
  iconTile: {
    width: '18%',
    aspectRatio: 1,
    margin: '1%',
    backgroundColor: '#fff9f4',
    borderWidth: 1,
    borderColor: '#e6d3b3',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconTileSelected: {
    backgroundColor: '#8d6e63',
    borderColor: '#8d6e63',
  },
  footer: {
    marginTop: 'auto',
    paddingHorizontal: 16,
    paddingBottom: 20,
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSecondary: {
    backgroundColor: '#fff9f4',
    borderWidth: 1,
    borderColor: '#d7ccc8',
  },
  buttonSecondaryText: {
    color: '#8d6e63',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonPrimary: {
    backgroundColor: '#8d6e63',
  },
  buttonDisabled: {
    backgroundColor: '#d7ccc8',
  },
  buttonPrimaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

// Keep the icon options last to avoid disrupting component definition
const ICON_CHOICES: string[] = [
  'add-circle-outline',
  'restaurant',
  'shopping-bag',
  'directions-car',
  'movie',
  'receipt',
  'local-grocery-store',
  'lightbulb',
  'house',
  'checkroom',
  'people',
  'menu-book',
  'security',
  'request-quote',
  'health-and-safety',
  'school',
  'card-giftcard',
  'swap-horiz',
  'local-cafe',
  'flight',
  'sports-soccer',
  'fitness-center',
  'music-note',
  'work',
  'savings',
];
