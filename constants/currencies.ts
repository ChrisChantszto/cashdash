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
