// Comprehensive ISO 4217 currency codes list + RMB alias.
// Source: ISO 4217 (curated), reduced to active/common codes; includes RMB alias for UX.
// Note: Keep this list in sync if you need the very latest additions.

export const ALL_CURRENCY_CODES: string[] = [
  // Popular and requested first
  'HKD','RMB','CNY','USD','EUR','JPY','GBP','AUD','CAD','SGD','TWD','KRW','MYR','INR',

  // Africa
  'AED','AFN','ALL','AMD','AOA','BHD','BIF','BWP','CDF','CVE','DJF','DZD','EGP','ERN','ETB','GHS','GMD','GNF','JOD','KES','KMF','LRD','LSL','LYD','MAD','MGA','MRU','MUR','MWK','MZN','NAD','NGN','RWF','SAR','SCR','SDG','SHP','SLE','SOS','SSP','STD','STN','SZL','TND','TZS','UGX','XAF','XOF','XPF','ZAR','ZMW','ZWL',

  // Americas
  'ANG','ARS','AWG','BBD','BOB','BRL','BSD','BZD','CLP','COP','CRC','CUP','DOP','EUR','FKP','GTQ','GYD','HTG','HNL','JMD','KYD','MXN','NIO','PAB','PEN','PYG','SRD','TTD','UYU','VES','XCD',

  // Asia / Pacific
  'AZN','BAM','BDT','BND','BTN','BWP','FJD','GEL','HKD','IDR','ILS','IQD','IRR','ISK','JPY','KGS','KHR','KPW','KRW','KWD','KZT','LAK','LKR','MMK','MNT','MOP','MYR','NPR','NZD','OMR','PGK','PHP','PKR','QAR','RUB','SAR','SBD','SCR','SEK','SGD','SYP','THB','TJS','TMT','TRY','TWD','UAH','UZS','VND','YER',

  // Europe
  'BYN','BGN','CHF','CZK','DKK','EUR','GBP','HRK','HUF','NOK','PLN','RON','RSD','RUB','SEK','TRY','UAH',

  // Others and precious metals
  'XAG','XAU','XDR','XPT'
];

// Utility to get a user-friendly merged list with HKD and RMB at the top without duplicates
export function getFullCurrencyList(): string[] {
  const preferred = ['HKD', 'RMB'];
  const seen = new Set<string>();
  const list: string[] = [];
  for (const c of preferred) {
    if (!seen.has(c)) { list.push(c); seen.add(c); }
  }
  for (const c of ALL_CURRENCY_CODES) {
    if (!seen.has(c)) { list.push(c); seen.add(c); }
  }
  return list;
}

// Filtered list for UI display: only include currencies that have a flag/name mapping
// in CURRENCY_META (i.e., show a flag and full country name) OR special labeled codes
// like precious metals/SDR. Keeps HKD and RMB pinned to the top and removes codes
// without icons (e.g., TMT, UAH) unless they have a defined flag/name mapping.
export function getDisplayCurrencyList(): string[] {
  const preferred = ['HKD', 'RMB'];
  const specialLabeled = new Set(['XAU', 'XAG', 'XPT', 'XDR']);
  const seen = new Set<string>();
  const list: string[] = [];

  // Add preferred first if they qualify
  for (const c of preferred) {
    if (!seen.has(c) && (CURRENCY_META[c] || specialLabeled.has(c))) {
      list.push(c);
      seen.add(c);
    }
  }

  // Add rest that have flags or special labels
  for (const c of ALL_CURRENCY_CODES) {
    if (seen.has(c)) continue;
    if (CURRENCY_META[c] || specialLabeled.has(c)) {
      list.push(c);
      seen.add(c);
    }
  }
  return list;
}

// Pretty label with flag and country/region name
// Note: Not all ISO codes map 1:1 to a single country (e.g., EUR, XAU). We provide
// a curated mapping for common currencies and a sensible fallback.
const CURRENCY_META: Record<string, { name: string; flag: string }> = {
  // Asia / HK & China
  HKD: { name: 'Hong Kong', flag: '🇭🇰' },
  CNY: { name: 'China', flag: '🇨🇳' },
  RMB: { name: 'China', flag: '🇨🇳' },
  MOP: { name: 'Macau', flag: '🇲🇴' },
  TWD: { name: 'Taiwan', flag: '🇹🇼' },
  JPY: { name: 'Japan', flag: '🇯🇵' },
  KRW: { name: 'South Korea', flag: '🇰🇷' },
  SGD: { name: 'Singapore', flag: '🇸🇬' },
  MYR: { name: 'Malaysia', flag: '🇲🇾' },
  THB: { name: 'Thailand', flag: '🇹🇭' },
  IDR: { name: 'Indonesia', flag: '🇮🇩' },
  VND: { name: 'Vietnam', flag: '🇻🇳' },
  PHP: { name: 'Philippines', flag: '🇵🇭' },
  INR: { name: 'India', flag: '🇮🇳' },
  AUD: { name: 'Australia', flag: '🇦🇺' },
  NZD: { name: 'New Zealand', flag: '🇳🇿' },
  AFN: { name: 'Afghanistan', flag: '🇦🇫' },

  // Americas
  USD: { name: 'United States', flag: '🇺🇸' },
  CAD: { name: 'Canada', flag: '🇨🇦' },
  MXN: { name: 'Mexico', flag: '🇲🇽' },
  BRL: { name: 'Brazil', flag: '🇧🇷' },
  ARS: { name: 'Argentina', flag: '🇦🇷' },
  CLP: { name: 'Chile', flag: '🇨🇱' },
  COP: { name: 'Colombia', flag: '🇨🇴' },
  PEN: { name: 'Peru', flag: '🇵🇪' },
  BOB: { name: 'Bolivia', flag: '🇧🇴' },
  BSD: { name: 'Bahamas', flag: '🇧🇸' },
  BZD: { name: 'Belize', flag: '🇧🇿' },
  BMD: { name: 'Bermuda', flag: '🇧🇲' },
  BND: { name: 'Brunei', flag: '🇧🇳' },
  BWP: { name: 'Botswana', flag: '🇧🇼' },
  BGN: { name: 'Bulgaria', flag: '🇧🇬' },
  BYN: { name: 'Belarus', flag: '🇧🇾' },
  CRC: { name: 'Costa Rica', flag: '🇨🇷' },
  CUP: { name: 'Cuba', flag: '🇨🇺' },
  CVE: { name: 'Cape Verde', flag: '🇨🇻' },
  CZK: { name: 'Czechia', flag: '🇨🇿' },
  DKK: { name: 'Denmark', flag: '🇩🇰' },
  DOP: { name: 'Dominican Republic', flag: '🇩🇴' },
  FKP: { name: 'Falkland Islands', flag: '🇫🇰' },
  GEL: { name: 'Georgia', flag: '🇬🇪' },
  GIP: { name: 'Gibraltar', flag: '🇬🇮' },
  HTG: { name: 'Haiti', flag: '🇭🇹' },
  HNL: { name: 'Honduras', flag: '🇭🇳' },
  HRK: { name: 'Croatia', flag: '🇭🇷' },
  HUF: { name: 'Hungary', flag: '🇭🇺' },
  KYD: { name: 'Cayman Islands', flag: '🇰🇾' },
  JMD: { name: 'Jamaica', flag: '🇯🇲' },
  
  // Europe
  EUR: { name: 'Eurozone', flag: '🇪🇺' },
  GBP: { name: 'United Kingdom', flag: '🇬🇧' },
  CHF: { name: 'Switzerland', flag: '🇨🇭' },
  SEK: { name: 'Sweden', flag: '🇸🇪' },
  NOK: { name: 'Norway', flag: '🇳🇴' },
  PLN: { name: 'Poland', flag: '🇵🇱' },
  RON: { name: 'Romania', flag: '🇷🇴' },
  TRY: { name: 'Türkiye', flag: '🇹🇷' },
  RUB: { name: 'Russia', flag: '🇷🇺' },

  // Middle East
  AED: { name: 'United Arab Emirates', flag: '🇦🇪' },
  SAR: { name: 'Saudi Arabia', flag: '🇸🇦' },
  QAR: { name: 'Qatar', flag: '🇶🇦' },
  KWD: { name: 'Kuwait', flag: '🇰🇼' },
  BHD: { name: 'Bahrain', flag: '🇧🇭' },
  ILS: { name: 'Israel', flag: '🇮🇱' },
  EGP: { name: 'Egypt', flag: '🇪🇬' },
  TND: { name: 'Tunisia', flag: '🇹🇳' },
  LYD: { name: 'Libya', flag: '🇱🇾' },
  MAD: { name: 'Morocco', flag: '🇲🇦' },  
  
  // Africa
  ZAR: { name: 'South Africa', flag: '🇿🇦' },
  NGN: { name: 'Nigeria', flag: '🇳🇬' },
  KES: { name: 'Kenya', flag: '🇰🇪' },
  TZS: { name: 'Tanzania', flag: '🇹🇿' },
  UGX: { name: 'Uganda', flag: '🇺🇬' },
  ZMW: { name: 'Zambia', flag: '🇿🇲' },
  ZWL: { name: 'Zimbabwe', flag: '🇿🇼' },
};

export function getCurrencyLabel(code: string): string {
  const meta = CURRENCY_META[code];
  if (meta) return `${meta.flag} ${meta.name} (${code})`;
  // Fallbacks for metals/SDR and unknown codes
  if (code === 'XAU') return '🟡 Gold (XAU)';
  if (code === 'XAG') return '⚪ Silver (XAG)';
  if (code === 'XPT') return '⚪ Platinum (XPT)';
  if (code === 'XDR') return '🌐 Special Drawing Rights (XDR)';
  return code;
}
