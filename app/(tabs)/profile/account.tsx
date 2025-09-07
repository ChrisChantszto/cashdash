import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ImageBackground, TouchableOpacity, ActivityIndicator, NativeModules, Platform, ScrollView, Linking, Alert, FlatList, Modal } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useUser } from '../../UserContext';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import getApiUrl from '../../utils/api';

type MenuOption = {
  key: string;
  label: string;
  icon: keyof typeof FontAwesome.glyphMap;
  screen?: string;
};

const MENU_OPTIONS: MenuOption[] = [
  { key: 'my-wallets', label: 'My Wallets', icon: 'credit-card', screen: 'Wallets' },
  { key: 'connect-banks', label: 'Connect to Banks', icon: 'bank', screen: 'ConnectBanks' },
  { key: 'help-support', label: 'Help and Support', icon: 'question-circle', screen: 'HelpSupport' },
  { key: 'settings', label: 'Settings', icon: 'cog', screen: 'Settings' },
  { key: 'privacy-security', label: 'Privacy & Security', icon: 'lock', screen: 'PrivacySecurity' },
  { key: 'notifications', label: 'Notifications', icon: 'bell', screen: 'Notifications' },
  { key: 'language', label: 'Language', icon: 'globe', screen: 'Language' },
  { key: 'about', label: 'About', icon: 'info-circle', screen: 'About' },
  { key: 'feedback', label: 'My Feedback', icon: 'star', screen: 'Feedback' },
];

const API_URL = getApiUrl();
const HERO_IMAGE = 'https://i.pinimg.com/1200x/2c/a7/ec/2ca7ec963f874a416d0254323ccbbbcd.jpg';

export default function AccountScreen() {
  const { user, setUser } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hsbcData, setHsbcData] = useState<any>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [showImageOptions, setShowImageOptions] = useState(false);

  const toggle = (id: string) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  type CardItem = {
    id: string;
    brandName?: string;
    cardName?: string;
    features: string[];
    minAge?: number;
    incomeNotes: string[];
    schemes: string[];
    servicing: string[];
    cardCurrencies: string[];
    productURL?: string;
    applyURL?: string;
    fees: string[];
  };

  const extractCards = (payload: any): CardItem[] => {
    if (!payload?.data) return [];
    const items: CardItem[] = [];
    (payload.data || []).forEach((d: any, i: number) => {
      (d?.Brand || []).forEach((b: any, j: number) => {
        const brandName = b?.BrandName;
        (b?.CreditCard || []).forEach((c: any, k: number) => {
          const cardName = c?.Name;
          (c?.CreditCardMarketingState || []).forEach((m: any, mIdx: number) => {
            const featuresNotes: string[] = (m?.FeaturesAndBenefits?.FeatureBenefitItem || [])
              .flatMap((f: any) => f?.Notes || [])
              .filter(Boolean);
            const minAge = m?.Eligibility?.AgeEligibility?.MinimumAge;
            const incomeNotes: string[] = (m?.Eligibility?.IncomeEligibility?.Notes || []).filter(Boolean);
            const schemes: string[] = (m?.CoreProduct?.CardScheme || []).filter(Boolean);
            const servicing: string[] = (m?.CoreProduct?.ServicingAccessChannels || []).filter(Boolean);
            const cardCurrencies: string[] = (m?.CoreProduct?.CardCurrencyCode || []).filter(Boolean);
            const productURL: string | undefined = m?.CoreProduct?.ProductURL;
            const applyURL: string | undefined = m?.CoreProduct?.ApplicationFormURL;
            const feeBlocks: any[] = (m?.FeesCharges?.FeeChargeDetail || []);
            const fees: string[] = [];
            feeBlocks.forEach((fb: any) => {
              if (fb?.FeeName) fees.push(String(fb.FeeName));
              (fb?.Notes || []).forEach((n: string) => fees.push(n));
            });
            items.push({
              id: `${i}-${j}-${k}-${mIdx}`,
              brandName,
              cardName,
              features: featuresNotes,
              minAge,
              incomeNotes,
              schemes,
              servicing,
              cardCurrencies,
              productURL,
              applyURL,
              fees,
            });
          });
        });
      });
    });
    return items;
  };

  const cards: CardItem[] = useMemo(() => extractCards(hsbcData), [hsbcData]);

  const openUrl = async (url?: string) => {
    if (!url) return;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) await Linking.openURL(url);
      else Alert.alert('Cannot open link', url);
    } catch (e) {
      Alert.alert('Failed to open link');
    }
  };

  const connectHsbc = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch(`${API_URL}/hsbc/personal-credit-cards?lang=zh-HK`);
      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(`HSBC API error ${resp.status}: ${text}`);
      }
      const data = await resp.json();
      setHsbcData(data);
    } catch (e: any) {
      setError(e.message || 'Failed to fetch HSBC data');
    } finally {
      setLoading(false);
    }
  };
  // Request permissions for camera and media library
  useEffect(() => {
    (async () => {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
        Alert.alert('Permission required', 'Please grant camera and photo library permissions to upload profile images.');
      }
    })();
  }, []);

  // Handle taking a photo with the camera
  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setProfileImage(result.assets[0].uri);
        setShowImageOptions(false);
        // Here you would typically upload the image to your server
        // and update the user profile
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  // Handle picking an image from the gallery
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setProfileImage(result.assets[0].uri);
        setShowImageOptions(false);
        // Here you would typically upload the image to your server
        // and update the user profile
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  // Placeholder user info; replace with actual user info as available
  const info = {
    icon: profileImage || (user?.profileImage || 'https://ui-avatars.com/api/?name=' + (user?.name || 'User')),
    username: user?.name || 'Username',
    email: user?.email || 'Email',
    birthdate: '1990-01-01',
    gender: 'Prefer not to say',
  };
  const navigation = useNavigation<any>();

  const handleLogout = () => {
    // Immediate logout for reliable behavior across platforms (including web)
    setUser(null);
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.hero}>
          <ImageBackground source={{ uri: HERO_IMAGE }} style={styles.heroImage} resizeMode="cover">
            <View style={styles.heroOverlay} />
            <View style={styles.heroContent}>
              <TouchableOpacity onPress={() => setShowImageOptions(true)}>
                <Image source={{ uri: info.icon }} style={styles.avatarLarge} />
                <View style={styles.editIconContainer}>
                  <FontAwesome name="camera" size={16} color="#fff" />
                </View>
              </TouchableOpacity>
              <ThemedText type="title" style={styles.nameText}>{info.username}</ThemedText>
              <Text style={styles.taglineText}>Work hard in silence. Let your success be the noise.</Text>
            </View>
          </ImageBackground>
        </View>
        
        {/* Profile Menu Items */}
        <ThemedText type="subtitle" style={styles.sectionTitle}>More Actions</ThemedText>
        <View style={styles.menuContainer}>
          <View style={styles.sectionCard}>
            <FlatList
              data={MENU_OPTIONS}
              scrollEnabled={false}
              renderItem={({ item, index }) => {
                const hasName = !!user?.name;
                const displayName = hasName ? String(user?.name).split(' ')[0] : '';
                const poss = hasName
                  ? (displayName.endsWith('s') ? `${displayName}'` : `${displayName}'s`)
                  : 'My';
                const computedLabel = hasName && item.label.startsWith('My ')
                  ? item.label.replace(/^My\b/, poss)
                  : item.label;

                return (
                  <TouchableOpacity
                    style={[styles.row, index === MENU_OPTIONS.length - 1 && { borderBottomWidth: 0 }]}
                    onPress={() => {
                      if (item.screen) {
                        navigation.navigate(item.screen as any);
                      }
                    }}
                  >
                    <View style={styles.rowLeft}>
                      <FontAwesome
                        name={item.icon}
                        size={20}
                        color="#5d4037"
                        style={styles.rowIcon}
                      />
                      <Text style={styles.rowText}>{computedLabel}</Text>
                    </View>
                    <FontAwesome name="chevron-right" size={16} color="#8d6e63" />
                  </TouchableOpacity>
                );
              }}
              keyExtractor={item => item.key}
            />
          </View>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Log out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Image Options Modal */}
      <Modal
        visible={showImageOptions}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowImageOptions(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShowImageOptions(false)}
        >
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.modalOption} onPress={takePhoto}>
              <FontAwesome name="camera" size={24} color="#5d4037" style={styles.modalIcon} />
              <Text style={styles.modalOptionText}>Take Photo</Text>
            </TouchableOpacity>
            
            <View style={styles.modalDivider} />
            
            <TouchableOpacity style={styles.modalOption} onPress={pickImage}>
              <FontAwesome name="image" size={24} color="#5d4037" style={styles.modalIcon} />
              <Text style={styles.modalOptionText}>Choose from Gallery</Text>
            </TouchableOpacity>
            
            <View style={styles.modalDivider} />
            
            <TouchableOpacity style={styles.modalOption} onPress={() => setShowImageOptions(false)}>
              <FontAwesome name="times" size={24} color="#b71c1c" style={styles.modalIcon} />
              <Text style={[styles.modalOptionText, { color: '#b71c1c' }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f4e9',
    padding: 24,
  },
  scrollView: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    color: '#5d4037',
    marginBottom: 16,
  },
  // Hero header styles
  hero: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: 200,
    justifyContent: 'flex-end',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(93,64,55,0.20)',
  },
  heroContent: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  avatarLarge: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    borderColor: '#fff',
    marginBottom: 10,
    backgroundColor: '#d7ccc8',
  },
  nameText: {
    fontSize: 22,
    color: '#fff',
    fontWeight: '700',
  },
  taglineText: {
    marginTop: 4,
    fontSize: 13,
    color: 'rgba(255,255,255,0.88)',
  },
  menuContainer: {
    marginBottom: 24,
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#eee0d8',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0e6df',
    backgroundColor: '#fff',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowIcon: {
    width: 24,
    textAlign: 'center',
    marginRight: 12,
  },
  rowText: {
    fontSize: 16,
    color: '#5d4037',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#5d4037',
    marginTop: 24,
    marginBottom: 16,
  },
  list: {
    paddingBottom: 16,
  },
  option: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#d7ccc8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIcon: {
    marginRight: 12,
    width: 24,
    textAlign: 'center',
  },
  optionText: {
    fontSize: 16,
    color: '#5d4037',
    flex: 1,
    fontWeight: '600',
  },
  profileContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#d7ccc8',
    marginBottom: 16,
  },
  username: {
    fontSize: 24,
    color: '#5d4037',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#8d6e63',
    marginBottom: 16,
  },
  connectButton: {
    backgroundColor: '#8d6e63',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  connectButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#5d4037',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  serverHint: {
    fontSize: 12,
    color: '#8d6e63',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorText: {
    color: '#b71c1c',
    marginBottom: 8,
    textAlign: 'center',
  },
  resultsBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#d7ccc8',
  },
  metaText: {
    fontSize: 12,
    color: '#8d6e63',
  },
  infoSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#d7ccc8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  label: {
    fontSize: 14,
    color: '#a1887f',
    marginTop: 8,
  },
  value: {
    fontSize: 16,
    color: '#5d4037',
    marginBottom: 8,
  },
  cardContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee0d8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1.5,
    elevation: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4e342e',
  },
  cardBrand: {
    fontSize: 12,
    color: '#8d6e63',
    marginTop: 2,
  },
  toggleText: {
    fontSize: 22,
    color: '#8d6e63',
    paddingHorizontal: 8,
  },
  detailBox: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0e6df',
    paddingTop: 8,
  },
  sectionBlock: {
    marginTop: 6,
  },
  subTitle: {
    fontSize: 13,
    color: '#6d4c41',
    fontWeight: '600',
  },
  valueText: {
    fontSize: 13,
    color: '#5d4037',
    marginTop: 2,
  },
  bulletText: {
    fontSize: 13,
    color: '#5d4037',
    marginTop: 2,
    lineHeight: 18,
  },
  linkText: {
    color: '#1565c0',
    fontWeight: '600',
  },
  brandBox: {
    borderTopWidth: 1,
    borderTopColor: '#eee0d8',
    paddingTop: 10,
  },
  brandName: {
    fontSize: 16,
    color: '#5d4037',
    fontWeight: '600',
    marginBottom: 6,
  },
  cardRow: {
    paddingVertical: 6,
  },
  cardName: {
    color: '#6d4c41',
    fontSize: 14,
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 5,
    right: 0,
    backgroundColor: '#8d6e63',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },
  modalIcon: {
    width: 40,
    textAlign: 'center',
    marginRight: 15,
  },
  modalOptionText: {
    fontSize: 18,
    color: '#5d4037',
  },
  modalDivider: {
    height: 1,
    backgroundColor: '#f0e6df',
  },
});
