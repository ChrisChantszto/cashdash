import { NativeModules, Platform } from 'react-native';

/**
 * Resolve API base URL across platforms/environments.
 * Returns the full base including the "/api" suffix.
 */
export const getApiUrl = (): string => {
  // Prefer explicit env override
  const envUrl = process.env?.EXPO_PUBLIC_API_URL;
  if (envUrl) {
    let url = envUrl.replace(/\/$/, '');
    if (!/\/api$/.test(url)) url += '/api';
    return url;
  }

  // Try to infer host from the Metro bundle URL (Expo Go on device)
  try {
    const scriptURL: string | undefined = (NativeModules as any)?.SourceCode?.scriptURL;
    if (scriptURL) {
      const { hostname } = new URL(scriptURL);
      if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
        // Use the device's IP address for the server connection
        console.log(`[API] Using device IP: ${hostname} for server connection`);
        return `http://${hostname}:5001/api`;
      }
    }
  } catch (error) {
    console.error('[API] Error inferring host:', error);
    // ignore and fall back
  }

  // Simulator / web fallbacks
  const base = Platform.select({
    ios: 'http://192.168.0.249:5001', // Use your computer's IP address
    android: 'http://10.0.2.2:5001',
    default: 'http://localhost:5001',
  });
  return `${base}/api`;
};

export default getApiUrl;

// Types for currency conversion response
export type ConvertResponse = {
  success: boolean;
  query: { from: string; to: string; amount: number };
  date: string | null;
  base: string; // likely 'EUR' on free plan
  rate: number; // computed rate_to / rate_from
  result: number; // amount * rate
  meta?: { rFrom?: number; rTo?: number; source?: string };
};

/**
 * Call backend currency convert endpoint.
 * Example: await convertCurrency({ from: 'USD', to: 'HKD', amount: 25, date: '2024-12-31' })
 */
export async function convertCurrency(params: {
  from: string;
  to: string;
  amount: number;
  date?: string; // optional YYYY-MM-DD for historical
}): Promise<ConvertResponse> {
  const { from, to, amount, date } = params;
  const qs = new URLSearchParams({ from, to, amount: String(amount) });
  if (date) qs.set('date', date);
  const url = `${getApiUrl()}/currency/convert?${qs.toString()}`;

  const res = await fetch(url);
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data?.error) {
    const msg = data?.error || `HTTP ${res.status}`;
    throw new Error(`Currency convert failed: ${msg}`);
  }
  return data as ConvertResponse;
}
