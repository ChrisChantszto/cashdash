import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator, NativeModules, Platform, ScrollView, Linking, Alert } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useUser } from '../../UserContext';

// Resolve API base for Expo Go / simulator
const getApiUrl = () => {
  const envUrl = process.env?.EXPO_PUBLIC_API_URL;
  if (envUrl) {
    let url = envUrl.replace(/\/$/, '');
    if (!/\/api$/.test(url)) url += '/api';
    return url;
  }
  try {
    const scriptURL: string | undefined = (NativeModules as any)?.SourceCode?.scriptURL;
    if (scriptURL) {
      const { hostname } = new URL(scriptURL);
      if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
        return `http://${hostname}:5001/api`;
      }
    }
  } catch {}
  const base = Platform.select({ ios: 'http://localhost:5001', android: 'http://10.0.2.2:5001', default: 'http://localhost:5001' });
  return `${base}/api`;
};
const API_URL = getApiUrl();

export default function AccountScreen() {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hsbcData, setHsbcData] = useState<any>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

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
  // Placeholder user info; replace with actual user info as available
  const info = {
    icon: 'https://ui-avatars.com/api/?name=' + (user?.name || 'User'),
    username: user?.name || 'Username',
    email: user?.email || 'Email',
    birthdate: '1990-01-01',
    gender: 'Prefer not to say',
  };
  return (
    <ThemedView style={styles.container}>
      <View style={styles.profileContainer}>
        <Image source={{ uri: info.icon }} style={styles.avatar} />
        <ThemedText type="title" style={styles.username}>{info.username}</ThemedText>
        <Text style={styles.email}>{info.email}</Text>
      </View>
      <TouchableOpacity style={styles.connectButton} onPress={connectHsbc} disabled={loading}>
        <Text style={styles.connectButtonText}>{loading ? 'Connecting…' : 'Connect HSBC (Sandbox)'}</Text>
      </TouchableOpacity>
      <Text style={styles.serverHint}>Server: {API_URL}</Text>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {loading ? (
        <View style={{ paddingVertical: 16 }}>
          <ActivityIndicator color="#8d6e63" />
        </View>
      ) : null}
      <View style={{ flex: 1, minHeight: 0 }}>
      {hsbcData ? (
        <ScrollView style={[styles.resultsBox, { flex: 1 }]} contentContainerStyle={{ paddingBottom: 24 }}>
          <Text style={styles.sectionTitle}>HSBC Personal Credit Cards</Text>
          {hsbcData.meta ? (
            <View style={{ marginBottom: 12 }}>
              {hsbcData.meta.LastUpdated ? <Text style={styles.metaText}>LastUpdated: {hsbcData.meta.LastUpdated}</Text> : null}
              {hsbcData.meta.TotalResults !== undefined ? <Text style={styles.metaText}>TotalResults: {hsbcData.meta.TotalResults}</Text> : null}
            </View>
          ) : null}
          {cards.map((item) => (
            <View key={item.id} style={styles.cardContainer}>
              <TouchableOpacity onPress={() => toggle(item.id)} style={styles.headerRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{item.cardName || '未命名信用卡'}</Text>
                  {!!item.brandName && <Text style={styles.cardBrand}>{item.brandName}</Text>}
                </View>
                <Text style={styles.toggleText}>{expanded[item.id] ? '−' : '+'}</Text>
              </TouchableOpacity>
              {expanded[item.id] && (
                <View style={styles.detailBox}>
                  {!!item.schemes?.length && (
                    <View style={styles.sectionBlock}>
                      <Text style={styles.subTitle}>卡組織</Text>
                      <Text style={styles.valueText}>{item.schemes.join(', ')}</Text>
                    </View>
                  )}
                  {!!item.servicing?.length && (
                    <View style={styles.sectionBlock}>
                      <Text style={styles.subTitle}>服務渠道</Text>
                      <Text style={styles.valueText}>{item.servicing.join('、')}</Text>
                    </View>
                  )}
                  {!!item.cardCurrencies?.length && (
                    <View style={styles.sectionBlock}>
                      <Text style={styles.subTitle}>貨幣</Text>
                      <Text style={styles.valueText}>{item.cardCurrencies.join(', ')}</Text>
                    </View>
                  )}
                  {item.minAge !== undefined && (
                    <View style={styles.sectionBlock}>
                      <Text style={styles.subTitle}>最低年齡</Text>
                      <Text style={styles.valueText}>{item.minAge}</Text>
                    </View>
                  )}
                  {!!item.incomeNotes.length && (
                    <View style={styles.sectionBlock}>
                      <Text style={styles.subTitle}>收入要求</Text>
                      {item.incomeNotes.map((n, idx) => (
                        <Text key={`in-${item.id}-${idx}`} style={styles.bulletText}>• {n}</Text>
                      ))}
                    </View>
                  )}
                  {!!item.features.length && (
                    <View style={styles.sectionBlock}>
                      <Text style={styles.subTitle}>特色/優惠</Text>
                      {item.features.map((n, idx) => (
                        <Text key={`ft-${item.id}-${idx}`} style={styles.bulletText}>• {n}</Text>
                      ))}
                    </View>
                  )}
                  {!!item.fees.length && (
                    <View style={styles.sectionBlock}>
                      <Text style={styles.subTitle}>費用/利率</Text>
                      {item.fees.map((n, idx) => (
                        <Text key={`fe-${item.id}-${idx}`} style={styles.bulletText}>• {n}</Text>
                      ))}
                    </View>
                  )}
                  {(item.productURL || item.applyURL) && (
                    <View style={[styles.sectionBlock, { flexDirection: 'row', gap: 16 }] }>
                      {!!item.productURL && (
                        <TouchableOpacity onPress={() => openUrl(item.productURL)}>
                          <Text style={styles.linkText}>產品詳情</Text>
                        </TouchableOpacity>
                      )}
                      {!!item.applyURL && (
                        <TouchableOpacity onPress={() => openUrl(item.applyURL)}>
                          <Text style={styles.linkText}>立即申請</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.infoSection}>
          <Text style={styles.label}>Birthdate</Text>
          <Text style={styles.value}>{info.birthdate}</Text>
          <Text style={styles.label}>Gender</Text>
          <Text style={styles.value}>{info.gender}</Text>
        </View>
      )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f4e9',
    padding: 24,
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
  sectionTitle: {
    fontSize: 18,
    color: '#5d4037',
    fontWeight: '700',
    marginBottom: 10,
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
});
